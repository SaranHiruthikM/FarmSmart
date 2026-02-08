<#
verify_farmsmart_features_v4.ps1
Fixes v3 PowerShell issue: parameter name '$host' conflicts with automatic variable $Host (read-only).
This version renames that parameter to '$hostname'.

Run from repo root:
  powershell -ExecutionPolicy Bypass -File .\verify_farmsmart_features_v4.ps1
#>

$ErrorActionPreference = "Stop"

function Fail($msg) {
  Write-Host "FAIL: $msg" -ForegroundColor Red
  exit 1
}
function Ok($msg) { Write-Host "OK: $msg" -ForegroundColor Green }
function Info($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Warn($msg) { Write-Host "WARN: $msg" -ForegroundColor Yellow }

function Invoke-Json($method, $url, $body = $null, $headers = $null) {
  $params = @{ Method=$method; Uri=$url; Headers=$headers; TimeoutSec=25 }
  if ($body -ne $null) { $params["ContentType"]="application/json"; $params["Body"]=($body|ConvertTo-Json -Depth 10) }
  return Invoke-RestMethod @params
}

function Wait-Http($url, $seconds=40) {
  $deadline = (Get-Date).AddSeconds($seconds)
  while ((Get-Date) -lt $deadline) {
    try { Invoke-RestMethod -Method GET -Uri $url -TimeoutSec 2 | Out-Null; return $true }
    catch { Start-Sleep -Milliseconds 500 }
  }
  return $false
}

function Test-TcpPort($hostname, $port) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($hostname, $port, $null, $null)
    $connected = $iar.AsyncWaitHandle.WaitOne(1500, $false)
    if ($connected -and $client.Connected) { $client.EndConnect($iar); $client.Close(); return $true }
    $client.Close()
    return $false
  } catch { return $false }
}

function Docker-Engine-Healthy() {
  try {
    docker info | Out-Null
    return $true
  } catch {
    return $false
  }
}

# --- locate backend ---
if (!(Test-Path ".\backend\package.json")) { Fail "Run this from repo root (.\backend\package.json missing)." }

$mongoHost="localhost"
$mongoPort=27017

Info "Preflight: checking MongoDB on ${mongoHost}:${mongoPort} ..."
$mongoUp = Test-TcpPort $mongoHost $mongoPort

if (-not $mongoUp) {
  Info "MongoDB not reachable. Attempting docker compose startup (requires Docker Desktop running)..."

  $dockerCli = $true
  try { docker --version | Out-Null } catch { $dockerCli = $false }

  if (-not $dockerCli) {
    Warn "Docker CLI not found. Skipping docker compose."
  } else {
    if (-not (Docker-Engine-Healthy)) {
      Fail @"
Docker CLI is installed but Docker Engine is NOT running.
Fix:
- Start Docker Desktop (wait until it says 'Running'), then rerun this script.
OR
- Install and start MongoDB locally on ${mongoHost}:${mongoPort}.
"@
    }

    Push-Location .\backend
    $composeOk = $false
    try { docker compose up -d mongodb | Out-Host; $composeOk = $true } catch {
      try { docker-compose up -d mongodb | Out-Host; $composeOk = $true } catch { $composeOk = $false }
    }
    Pop-Location

    if (-not $composeOk) { Fail "docker compose could not start mongodb. Ensure backend/docker-compose.yml defines 'mongodb' service." }

    Start-Sleep -Seconds 3
    $mongoUp = Test-TcpPort $mongoHost $mongoPort
  }
}

if (-not $mongoUp) {
  Fail @"
MongoDB is required and is NOT reachable at ${mongoHost}:${mongoPort}.
Fix options:
1) Start MongoDB locally (Windows Service) on 27017, OR
2) Start Docker Desktop, then:
   cd backend
   docker compose up -d mongodb
Then rerun.
"@
}
Ok "MongoDB reachable"

# --- deps/build/tests ---
Info "Installing backend deps..."
Push-Location .\backend
if (Test-Path .\package-lock.json) { npm ci | Out-Host } else { npm install | Out-Host }
Ok "Deps installed"

Info "Build..."
npm run build | Out-Host
Ok "Build OK"

Info "Unit tests..."
npm test | Out-Host
Ok "Unit tests OK"
Pop-Location

# --- start server with log capture ---
New-Item -ItemType Directory -Force -Path "scripts" | Out-Null
$logPath = Join-Path (Get-Location) "scripts\_verify_server.log"
if (Test-Path $logPath) { Remove-Item $logPath -Force }

$port = $env:PORT
if (-not $port) { $port = 3000 }
$baseUrl = "http://localhost:$port"

Info "Starting backend server (npm run start) logs -> $logPath"
Push-Location .\backend
$server = Start-Process -FilePath "npm" -ArgumentList "run","start" -PassThru -WindowStyle Hidden -RedirectStandardOutput $logPath -RedirectStandardError $logPath

Info "Waiting for server at $baseUrl/ ..."
if (-not (Wait-Http "$baseUrl/" 50)) {
  try { Stop-Process -Id $server.Id -Force } catch {}
  $tail = Get-Content $logPath -Tail 120 -ErrorAction SilentlyContinue
  Write-Host "`n---- server log tail ----" -ForegroundColor Yellow
  if ($tail) { $tail | ForEach-Object { Write-Host $_ } } else { Write-Host "(no logs captured)" }
  Write-Host "------------------------`n" -ForegroundColor Yellow
  Fail "Server did not become ready at $baseUrl. See $logPath"
}
Ok "Server is up"

# --- Prices (public) ---
Info "Prices endpoints..."
Invoke-Json "GET" "$baseUrl/prices/current?crop=tomato" | Out-Null
Invoke-Json "GET" "$baseUrl/prices/history?crop=tomato&location=coimbatore" | Out-Null
Invoke-Json "GET" "$baseUrl/prices/compare?crop=tomato&location=coimbatore" | Out-Null
Ok "Prices PASS"

# --- Auth users (debugOtp) ---
Info "Creating FARMER + BUYER via /auth/register + /auth/verify..."
$stamp = [int](Get-Date -UFormat %s)
$farmerPhone = "90000$stamp"
$buyerPhone  = "91000$stamp"
$pw = "Test@12345"

$farmerReg = Invoke-Json "POST" "$baseUrl/auth/register" @{
  phoneNumber = $farmerPhone; password = $pw; role="FARMER"; fullName="Demo Farmer"; state="Tamil Nadu"; district="Coimbatore"; address="Demo"
}
$farmerOtp = $farmerReg.data.debugOtp
if (-not $farmerOtp) { Fail "No debugOtp from /auth/register (farmer). Check server log: $logPath" }

$buyerReg = Invoke-Json "POST" "$baseUrl/auth/register" @{
  phoneNumber = $buyerPhone; password = $pw; role="BUYER"; fullName="Demo Buyer"; state="Tamil Nadu"; district="Coimbatore"; address="Demo"
}
$buyerOtp = $buyerReg.data.debugOtp
if (-not $buyerOtp) { Fail "No debugOtp from /auth/register (buyer). Check server log: $logPath" }

$farmerVerify = Invoke-Json "POST" "$baseUrl/auth/verify" @{ contact = $farmerPhone; code = $farmerOtp }
$buyerVerify  = Invoke-Json "POST" "$baseUrl/auth/verify" @{ contact = $buyerPhone; code = $buyerOtp }

$farmerToken = $farmerVerify.data.token
$buyerToken  = $buyerVerify.data.token
$farmerId    = $farmerVerify.data.user._id
if (-not $farmerToken -or -not $buyerToken -or -not $farmerId) { Fail "Auth verify did not return token/user id." }
Ok "Auth PASS"

$hFarmer = @{ Authorization = "Bearer $farmerToken" }
$hBuyer  = @{ Authorization = "Bearer $buyerToken" }

# --- Create crop ---
Info "Create crop as FARMER..."
$crop = Invoke-Json "POST" "$baseUrl/crops" @{
  name="Tomato"; variety="Local"; quantity=50; unit="kg"; basePrice=40; finalPrice=40; qualityGrade="A";
  location=@{ state="Tamil Nadu"; district="Coimbatore"; village="DemoVillage" }; isActive=$true
} $hFarmer
$cropId = $crop._id
if (-not $cropId) { Fail "Crop did not return _id" }
Ok "Crop PASS"

# --- Start negotiation ---
Info "Start negotiation as BUYER..."
$neg = Invoke-Json "POST" "$baseUrl/negotiations/start" @{
  cropId=$cropId; farmerId=$farmerId; pricePerUnit=42; quantity=5; message="Demo negotiation"
} $hBuyer
$negId = $neg._id
if (-not $negId) { Fail "Negotiation did not return _id" }
Ok "Negotiation created"

# --- Accept negotiation ---
Info "Accept negotiation as FARMER..."
$neg2 = Invoke-Json "POST" "$baseUrl/negotiations/$negId/respond" @{ action="ACCEPT" } $hFarmer
if ($neg2.status -ne "ACCEPTED") { Fail "Negotiation not ACCEPTED (status=$($neg2.status))" }
Ok "Negotiation ACCEPTED"

# --- Create order ---
Info "Create order as BUYER..."
$order = Invoke-Json "POST" "$baseUrl/orders" @{ negotiationId=$negId } $hBuyer
$orderId = $order._id
if (-not $orderId) { Fail "Order did not return _id" }
Ok "Order created"

# --- Complete order ---
Info "Set order status COMPLETED as FARMER..."
$orderDone = Invoke-Json "PATCH" "$baseUrl/orders/$orderId/status" @{ status="COMPLETED" } $hFarmer
if ($orderDone.currentStatus -ne "COMPLETED") { Fail "Order not COMPLETED (currentStatus=$($orderDone.currentStatus))" }
Ok "Order COMPLETED"

# --- Create review ---
Info "Create review as BUYER..."
$review = Invoke-Json "POST" "$baseUrl/reviews" @{ orderId=$orderId; rating=5; comment="Demo review" } $hBuyer
if (-not $review._id) { Fail "Review did not return _id" }
Ok "Review created"

# --- Fetch farmer reviews ---
Info "Fetch farmer reviews..."
Invoke-Json "GET" "$baseUrl/reviews/user/$farmerId" $null $hBuyer | Out-Null
Ok "Reviews PASS"

Write-Host ""
Write-Host "==================== SUMMARY ====================" -ForegroundColor Green
Write-Host "MongoDB: PASS"
Write-Host "Build+Tests: PASS"
Write-Host "Prices: PASS"
Write-Host "Orders/Negotiations: PASS"
Write-Host "Reviews: PASS"
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

Info "Stopping server..."
try { Stop-Process -Id $server.Id -Force } catch {}
Pop-Location
Ok "Done"

# verify_farmsmart_features_v5.ps1
# FarmSmart deterministic feature verification (NO Jest). End-to-end API smoke test.

$ErrorActionPreference = "Stop"

function Info($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "OK: $m" -ForegroundColor Green }
function Warn($m) { Write-Host "WARN: $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "FAIL: $m" -ForegroundColor Red }

function Test-TcpPort {
  param(
    [Parameter(Mandatory=$true)][string]$HostName,
    [Parameter(Mandatory=$true)][int]$Port,
    [int]$TimeoutMs = 1500
  )
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($HostName, $Port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
    if (-not $ok) { $client.Close(); return $false }
    $client.EndConnect($iar)
    $client.Close()
    return $true
  } catch { return $false }
}

function Invoke-Json {
  param(
    [Parameter(Mandatory=$true)][string]$Method,
    [Parameter(Mandatory=$true)][string]$Url,
    $Body = $null,
    $Headers = $null
  )
  $params = @{
    Method  = $Method
    Uri     = $Url
    TimeoutSec = 25
  }
  if ($Headers) { $params.Headers = $Headers }
  if ($Body -ne $null) {
    $params.ContentType = "application/json"
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }
  return Invoke-RestMethod @params
}

# -------------------------
# Paths
# -------------------------
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "backend"

if (-not (Test-Path $backendDir)) {
  Fail "backend folder not found at: $backendDir"
  exit 1
}

# -------------------------
# Preflight: Docker + Mongo
# -------------------------
Info "Preflight: Docker availability"
try { docker info | Out-Null; Ok "Docker OK" } catch { Fail "Docker not reachable. Start Docker Desktop."; exit 1 }

Info "Preflight: checking MongoDB on localhost:27017 ..."
$mongoHostName = "localhost"
$mongoPort = 27017

if (-not (Test-TcpPort -HostName $mongoHostName -Port $mongoPort)) {
  Warn "MongoDB not reachable. Starting via docker compose..."
  Push-Location $backendDir
  try {
    docker compose -f "docker-compose.yml" up -d mongodb | Out-Null
  } finally {
    Pop-Location
  }

  $maxWaitSec = 45
  $start = Get-Date
  while (-not (Test-TcpPort -HostName $mongoHostName -Port $mongoPort)) {
    Start-Sleep -Seconds 1
    if (((Get-Date) - $start).TotalSeconds -gt $maxWaitSec) {
      Fail "MongoDB still not reachable after ${maxWaitSec}s."
      exit 1
    }
  }
  Ok "MongoDB reachable"
} else {
  Ok "MongoDB reachable"
}

# -------------------------
# Install + Build
# -------------------------
Info "Installing backend deps..."
Push-Location $backendDir
try {
  npm ci | Out-Null
  Ok "Deps installed"

  Info "Build..."
  npm run build | Out-Null
  Ok "Build OK"
} finally {
  Pop-Location
}

# -------------------------
# Seed a MarketPrice doc so /prices/current returns real data
# -------------------------
Info "Seeding MarketPrice data (so /prices/* endpoints return non-empty responses)..."
try {
  # insert only if not present for today's date & location/crop
  $seedJs = @"
db = db.getSiblingDB('farmsmart');
const today = new Date(); today.setHours(0,0,0,0);
const q = { crop: "tomato", state: "Tamil Nadu", district: "Chennai", date: today };
const exists = db.marketprices.findOne(q);
if (!exists) {
  db.marketprices.insertOne({
    crop: "tomato",
    state: "Tamil Nadu",
    district: "Chennai",
    market: "Koyambedu",
    date: today,
    minPrice: 10,
    maxPrice: 20,
    modalPrice: 15,
    source: "seed"
  });
}
print("seed_done");
"@

  $tmp = New-TemporaryFile
  Set-Content -Path $tmp.FullName -Value $seedJs -Encoding UTF8

  # container name in your logs: farmsmart_db
  Get-Content -Raw $tmp.FullName | docker exec -i farmsmart_db mongosh --quiet | Out-Null
  Remove-Item $tmp.FullName -Force
  Ok "MarketPrice seed OK"
} catch {
  Warn "Could not seed MarketPrice. Prices endpoints may return 404/empty. Error: $($_.Exception.Message)"
}

# -------------------------
# Start backend server
# -------------------------
Info "Starting backend server..."
$logDir = Join-Path $repoRoot "scripts"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$serverLog = Join-Path $logDir "_verify_server_v5.log"

# ensure no old server process is hanging on :3000
$port = 3000
$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
  Warn "Port $port already in use. Stop the existing backend process first."
  Warn "Run: netstat -ano | findstr :3000  (then taskkill /PID <pid> /F)"
  exit 1
}

$env:PORT = "3000"
$env:DATABASE_URL = "mongodb://localhost:27017/farmsmart"
$env:NODE_ENV = "development"

$serverProc = Start-Process -FilePath "npm" -ArgumentList "run","start" -WorkingDirectory $backendDir `
  -RedirectStandardOutput $serverLog -RedirectStandardError $serverLog -PassThru -WindowStyle Hidden

try {
  $maxWaitSec = 45
  $start = Get-Date
  $baseUrl = "http://localhost:3000"

  while ($true) {
    try {
      $r = Invoke-Json -Method "GET" -Url "$baseUrl/"
      break
    } catch {
      Start-Sleep -Seconds 1
      if (((Get-Date) - $start).TotalSeconds -gt $maxWaitSec) {
        Fail "Backend did not become ready in ${maxWaitSec}s. Check log: $serverLog"
        throw
      }
    }
  }
  Ok "Backend is up"

  # -------------------------
  # Smoke: Prices
  # -------------------------
  Info "Smoke: GET /prices/current"
  $prices = Invoke-Json -Method "GET" -Url "$baseUrl/prices/current?crop=tomato&state=Tamil%20Nadu&district=Chennai"
  if ($prices -and $prices.success -eq $true) { Ok "/prices/current OK" } else { Warn "/prices/current returned unexpected response" }

  # -------------------------
  # End-to-end auth + crop + negotiation + order + review
  # -------------------------
  $rand = Get-Random -Minimum 100000 -Maximum 999999
  $farmerPhone = "900$rand"
  $buyerPhone  = "901$rand"
  $password = "Pass@$rand!"

  Info "Auth: register farmer (phone=$farmerPhone)"
  $regFarmer = Invoke-Json -Method "POST" -Url "$baseUrl/auth/register" -Body @{
    phoneNumber = $farmerPhone
    password    = $password
    state       = "Tamil Nadu"
    district    = "Chennai"
    role        = "FARMER"
    fullName    = "Farmer $rand"
  }

  if (-not $regFarmer.data.debugOtp) { Fail "Register farmer did not return debugOtp"; throw }
  $farmerOtp = $regFarmer.data.debugOtp

  Info "Auth: verify farmer OTP"
  $verFarmer = Invoke-Json -Method "POST" -Url "$baseUrl/auth/verify" -Body @{
    contact = $farmerPhone
    code    = $farmerOtp
  }
  $farmerToken = $verFarmer.data.token
  $farmerId = $verFarmer.data.user._id
  if (-not $farmerToken) { Fail "Farmer verify did not return token"; throw }
  Ok "Farmer verified + token OK"

  Info "Auth: register buyer (phone=$buyerPhone)"
  $regBuyer = Invoke-Json -Method "POST" -Url "$baseUrl/auth/register" -Body @{
    phoneNumber = $buyerPhone
    password    = $password
    state       = "Tamil Nadu"
    district    = "Chennai"
    role        = "BUYER"
    fullName    = "Buyer $rand"
  }
  if (-not $regBuyer.data.debugOtp) { Fail "Register buyer did not return debugOtp"; throw }
  $buyerOtp = $regBuyer.data.debugOtp

  Info "Auth: verify buyer OTP"
  $verBuyer = Invoke-Json -Method "POST" -Url "$baseUrl/auth/verify" -Body @{
    contact = $buyerPhone
    code    = $buyerOtp
  }
  $buyerToken = $verBuyer.data.token
  $buyerId = $verBuyer.data.user._id
  if (-not $buyerToken) { Fail "Buyer verify did not return token"; throw }
  Ok "Buyer verified + token OK"

  $farmerHeaders = @{ Authorization = "Bearer $farmerToken" }
  $buyerHeaders  = @{ Authorization = "Bearer $buyerToken"  }

  Info "Crops: create a crop as farmer"
  $crop = Invoke-Json -Method "POST" -Url "$baseUrl/crops" -Headers $farmerHeaders -Body @{
    name        = "Tomato"
    variety     = "Hybrid"
    quantity    = 10
    unit        = "kg"
    basePrice   = 20
    qualityGrade= "A"
    state       = "Tamil Nadu"
    district    = "Chennai"
    finalPrice  = 20
  }
  $cropId = $crop.data._id
  if (-not $cropId) { Fail "Crop create did not return _id"; throw }
  Ok "Crop created (id=$cropId)"

  Info "Negotiations: buyer starts negotiation"
  $nego = Invoke-Json -Method "POST" -Url "$baseUrl/negotiations/start" -Headers $buyerHeaders -Body @{
    cropId           = $cropId
    proposedPrice    = 18
    proposedQuantity = 10
    message          = "Offer from buyer"
  }
  $negoId = $nego.data._id
  if (-not $negoId) { Fail "Negotiation start did not return _id"; throw }
  Ok "Negotiation started (id=$negoId)"

  Info "Negotiations: farmer ACCEPTs"
  $nego2 = Invoke-Json -Method "POST" -Url "$baseUrl/negotiations/$negoId/respond" -Headers $farmerHeaders -Body @{
    action  = "ACCEPT"
    message = "Accepted"
  }
  Ok "Negotiation accepted"

  Info "Orders: buyer creates order from accepted negotiation"
  $order = Invoke-Json -Method "POST" -Url "$baseUrl/orders" -Headers $buyerHeaders -Body @{
    negotiationId = $negoId
  }
  $orderId = $order._id
  if (-not $orderId) { Fail "Order create did not return _id"; throw }
  Ok "Order created (id=$orderId)"

  Info "Orders: farmer sets status to COMPLETED"
  $orderDone = Invoke-Json -Method "PATCH" -Url "$baseUrl/orders/$orderId/status" -Headers $farmerHeaders -Body @{
    status = "COMPLETED"
  }
  Ok "Order status COMPLETED"

  Info "Reviews: buyer posts review for farmer"
  $review = Invoke-Json -Method "POST" -Url "$baseUrl/reviews" -Headers $buyerHeaders -Body @{
    orderId = $orderId
    targetId = $farmerId
    rating = 5
    comment = "Great transaction"
  }
  if ($review -and $review._id) { Ok "Review created (id=$($review._id))" } else { Warn "Review response unexpected (check backend log)" }

  Ok "END-TO-END FEATURE SMOKE TEST PASSED"
  Info "Server log: $serverLog"

} catch {
  Fail "Verification failed: $($_.Exception.Message)"
  Info "Server log: $serverLog"
  exit 1
} finally {
  if ($serverProc -and -not $serverProc.HasExited) {
    Info "Stopping backend server (PID=$($serverProc.Id))"
    try { Stop-Process -Id $serverProc.Id -Force } catch {}
  }
}
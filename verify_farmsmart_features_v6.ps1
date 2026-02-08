# verify_farmsmart_features_v6.ps1
$ErrorActionPreference = "Stop"

# --- small helpers (inline, not function names you might lose) ---
function Write-Info($m){ Write-Host "==> $m" -ForegroundColor Cyan }
function Write-Ok($m){ Write-Host "OK: $m" -ForegroundColor Green }
function Die($m){ Write-Host "FAIL: $m" -ForegroundColor Red; exit 1 }

function Test-TcpPort($HostName, $Port) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($HostName, $Port, $null, $null)
    $success = $iar.AsyncWaitHandle.WaitOne(800)
    $client.Close()
    return $success
  } catch { return $false }
}

$RepoRoot = Get-Location
$Backend  = Join-Path $RepoRoot "backend"
if (!(Test-Path $Backend)) { Die "backend/ folder not found. Run this from the repo root (FarmSmart)." }

# 1) Ensure MongoDB
Write-Info "Preflight: checking MongoDB on localhost:27017 ..."
if (!(Test-TcpPort "localhost" 27017)) {
  Write-Info "MongoDB not reachable. Starting docker compose (backend/docker-compose.yml) ..."
  Push-Location $Backend
  docker compose up -d mongodb | Out-Null
  Pop-Location

  $tries = 0
  while ($tries -lt 60 -and !(Test-TcpPort "localhost" 27017)) {
    Start-Sleep -Milliseconds 500
    $tries++
  }
  if (!(Test-TcpPort "localhost" 27017)) { Die "MongoDB still not reachable on localhost:27017 after waiting." }
}
Write-Ok "MongoDB reachable"

Push-Location $Backend

# 2) Install deps + build
Write-Info "Installing backend deps..."
npm install | Out-Null
Write-Ok "Deps installed"

Write-Info "Build..."
& npm run build
if ($LASTEXITCODE -ne 0) { Die "Build failed" }
Write-Ok "Build OK"

# 3) Seed QualityRules
Write-Info "Seeding QualityRules..."
if (-not $env:DATABASE_URL) { $env:DATABASE_URL = "mongodb://localhost:27017/farmsmart" }
& npx ts-node src/utils/seedQualityRules.ts
if ($LASTEXITCODE -ne 0) { Die "Seeding QualityRules failed" }
Write-Ok "QualityRules seeded"

# 4) Start server (background) - FIXED: separate stdout/stderr logs
Write-Info "Starting backend server..."
$env:PORT = "5000"

$logDir = Join-Path $RepoRoot "scripts"
New-Item -ItemType Directory -Force $logDir | Out-Null
$stdoutLog = Join-Path $logDir "_verify_server_stdout.log"
$stderrLog = Join-Path $logDir "_verify_server_stderr.log"

# If something already uses 5000, fail fast
try {
  $conn = Test-NetConnection -ComputerName "localhost" -Port 5000 -WarningAction SilentlyContinue
  if ($conn.TcpTestSucceeded) { Die "Port 5000 already in use. Stop the other process and rerun." }
} catch {}

$server = Start-Process -FilePath "npm" -ArgumentList "run","start" -WorkingDirectory $Backend `
  -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru -WindowStyle Hidden

# Wait for server TCP to be up (don’t rely on / route)
$up = $false
for ($i=0; $i -lt 80; $i++) {
  if (Test-TcpPort "localhost" 5000) { $up = $true; break }
  Start-Sleep -Milliseconds 500
}
if (!$up) {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Die "Server did not start on port 5000. Check logs:`n$stdoutLog`n$stderrLog"
}
Write-Ok "Server running (logs: $stdoutLog , $stderrLog)"

# 5) Smoke checks (real verification)
Write-Info "Running API smoke checks..."

function Json($obj) { return ($obj | ConvertTo-Json -Depth 10) }
function PostJson($url, $body, $headers=@{}) {
  return Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Headers $headers -Body (Json $body)
}
function GetJson($url, $headers=@{}) {
  return Invoke-RestMethod -Uri $url -Method Get -Headers $headers
}

$phone = ("9" + (Get-Random -Minimum 100000000 -Maximum 999999999))
$password = "Test@12345"
$state = "Tamil Nadu"
$district = "Coimbatore"

# Register
try {
  $reg = PostJson "http://localhost:5000/auth/register" @{
    phone = $phone
    password = $password
    state = $state
    district = $district
    role = "FARMER"
    preferredLanguage = "en"
    fullName = "Smoke Test Farmer"
  }
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Die "Register failed: $($_.Exception.Message)`nCheck logs:`n$stderrLog"
}
Write-Ok "Register OK"

# Login
try {
  $login = PostJson "http://localhost:5000/auth/login" @{
    phone = $phone
    password = $password
  }
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Die "Login failed: $($_.Exception.Message)`nCheck logs:`n$stderrLog"
}
$token = $login.data.token
if (-not $token) {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Die "Login response missing token. Raw response: $($login | ConvertTo-Json -Depth 10)"
}
$auth = @{ Authorization = "Bearer $token" }
Write-Ok "Login OK"

# Create Crop (basePrice > 0 so finalPrice computes)
try {
  $crop = PostJson "http://localhost:5000/crops" @{
    name = "Tomato"
    quantity = 10
    unit = "kg"
    basePrice = 100
    qualityGrade = "A"
    state = $state
    district = $district
  } $auth
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Die "Create crop failed: $($_.Exception.Message)`nCheck logs:`n$stderrLog"
}
Write-Ok "Create crop OK"

# List Crops
try { $list = GetJson "http://localhost:5000/crops" $auth } catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Die "List crops failed: $($_.Exception.Message)`nCheck logs:`n$stderrLog"
}
Write-Ok "List crops OK"

# Price endpoints (no auth)
try {
  $cur  = GetJson "http://localhost:5000/prices/current?crop=tomato&state=$([uri]::EscapeDataString($state))&district=$([uri]::EscapeDataString($district))"
  $hist = GetJson "http://localhost:5000/prices/history?crop=tomato&state=$([uri]::EscapeDataString($state))&district=$([uri]::EscapeDataString($district))"
  $cmp  = GetJson "http://localhost:5000/prices/compare?crop=tomato&state=$([uri]::EscapeDataString($state))&district=$([uri]::EscapeDataString($district))&compareState=Kerala&compareDistrict=Palakkad"
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Die "Price endpoints failed: $($_.Exception.Message)`nCheck logs:`n$stderrLog"
}
Write-Ok "Price endpoints OK"

Write-Info "All smoke checks passed."
Write-Info "Stopping server..."
try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
Write-Ok "Done."

Pop-Location
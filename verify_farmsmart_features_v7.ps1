# verify_farmsmart_features_v7.ps1
$ErrorActionPreference = "Stop"

# ---------- logging helpers ----------
function Info($m){ Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "OK:  $m" -ForegroundColor Green }
function Warn($m){ Write-Host "WARN: $m" -ForegroundColor Yellow }
function Fail($m){
  Write-Host "FAIL: $m" -ForegroundColor Red
  exit 1
}

function Test-TcpPort($HostName, $Port) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($HostName, $Port, $null, $null)
    $success = $iar.AsyncWaitHandle.WaitOne(800)
    $client.Close()
    return $success
  } catch { return $false }
}

# ---- Better error extraction for HTTP 4xx/5xx ----
function Get-HttpErrorBody($err) {
  try {
    if ($err.Exception.Response -and $err.Exception.Response.GetResponseStream) {
      $stream = $err.Exception.Response.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $body = $reader.ReadToEnd()
      return $body
    }
  } catch {}
  return $null
}

function Json($obj) { return ($obj | ConvertTo-Json -Depth 20) }

function Invoke-Json($method, $url, $body=$null, $headers=@{}) {
  try {
    if ($null -ne $body) {
      return Invoke-RestMethod -Uri $url -Method $method -ContentType "application/json" -Headers $headers -Body (Json $body)
    } else {
      return Invoke-RestMethod -Uri $url -Method $method -Headers $headers
    }
  } catch {
    $raw = Get-HttpErrorBody $_
    if ($raw) {
      throw "HTTP request failed: $method $url`nResponse body:`n$raw"
    }
    throw "HTTP request failed: $method $url`n$($_.Exception.Message)"
  }
}

function PostJson($url, $body, $headers=@{}) { return Invoke-Json "Post" $url $body $headers }
function GetJson($url, $headers=@{}) { return Invoke-Json "Get" $url $null $headers }

# ---------- locate repo ----------
$RepoRoot = Get-Location
$Backend  = Join-Path $RepoRoot "backend"
if (!(Test-Path $Backend)) { Fail "backend/ folder not found. Run this from the FarmSmart repo root." }

# 1) Ensure MongoDB
Info "Preflight: checking MongoDB on localhost:27017 ..."
if (!(Test-TcpPort "localhost" 27017)) {
  Info "MongoDB not reachable. Starting docker compose (backend/docker-compose.yml) ..."
  Push-Location $Backend
  docker compose up -d mongodb | Out-Null
  Pop-Location

  $tries = 0
  while ($tries -lt 60 -and !(Test-TcpPort "localhost" 27017)) {
    Start-Sleep -Milliseconds 500
    $tries++
  }
  if (!(Test-TcpPort "localhost" 27017)) { Fail "MongoDB still not reachable on localhost:27017 after waiting." }
}
Ok "MongoDB reachable"

Push-Location $Backend

# 2) Install deps + build
Info "Installing backend deps..."
npm install | Out-Null
Ok "Deps installed"

Info "Build..."
& npm run build
if ($LASTEXITCODE -ne 0) { Fail "Build failed" }
Ok "Build OK"

# 3) Seed QualityRules
Info "Seeding QualityRules..."
if (-not $env:DATABASE_URL) { $env:DATABASE_URL = "mongodb://localhost:27017/farmsmart" }
& npx ts-node src/utils/seedQualityRules.ts
if ($LASTEXITCODE -ne 0) { Fail "Seeding QualityRules failed" }
Ok "QualityRules seeded"

# 4) Start server (background)
Info "Starting backend server..."
$env:PORT = "5000"

$logDir = Join-Path $RepoRoot "scripts"
New-Item -ItemType Directory -Force $logDir | Out-Null

$stdoutLog = Join-Path $logDir "_verify_server_stdout.log"
$stderrLog = Join-Path $logDir "_verify_server_stderr.log"

# Fail fast if port is already used
try {
  $conn = Test-NetConnection -ComputerName "localhost" -Port 5000 -WarningAction SilentlyContinue
  if ($conn.TcpTestSucceeded) { Fail "Port 5000 already in use. Stop the other process and rerun." }
} catch {}

# ---- Validate start entry exists (and auto-fix fallback for dist/src/index.js) ----
$pkgPath = Join-Path $Backend "package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$startScript = $pkg.scripts.start

# Extract node entry path from "node <path>"
$entry = $null
if ($startScript -match "node\s+([^\s]+)") { $entry = $Matches[1] }

if ($entry) {
  $entryPath = Join-Path $Backend $entry
  if (!(Test-Path $entryPath)) {
    $fallback = Join-Path $Backend "dist/src/index.js"
    if (Test-Path $fallback) {
      Info "Start entry '$entry' missing, but found fallback 'dist/src/index.js'. Starting fallback directly..."
      $server = Start-Process -FilePath "node" -ArgumentList "dist/src/index.js" -WorkingDirectory $Backend `
        -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru -WindowStyle Hidden
    } else {
      Fail "Start entry missing: $entryPath. Also no fallback at $fallback. Fix backend/package.json start script or tsconfig build output."
    }
  } else {
    $server = Start-Process -FilePath "npm" -ArgumentList "run","start" -WorkingDirectory $Backend `
      -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru -WindowStyle Hidden
  }
} else {
  Info "Start script not in 'node <file>' format; running npm start as-is..."
  $server = Start-Process -FilePath "npm" -ArgumentList "run","start" -WorkingDirectory $Backend `
    -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru -WindowStyle Hidden
}

# Wait for server to come up
$up = $false
for ($i=0; $i -lt 80; $i++) {
  if (Test-TcpPort "localhost" 5000) { $up = $true; break }
  Start-Sleep -Milliseconds 500
}
if (!$up) {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Fail "Server did not start on port 5000. Check logs:`n$stdoutLog`n$stderrLog"
}
Ok "Server running (logs: $stdoutLog , $stderrLog)"

# 5) Smoke checks
Info "Running API smoke checks..."

$Base = "http://localhost:5000"

# ---- Detect whether routes are mounted under /api ----
$ApiPrefix = ""
$prefixCandidates = @("", "/api")
foreach ($p in $prefixCandidates) {
  try {
    # Try common health endpoints (ignore body)
    foreach ($h in @("/health", "/api/health", "/")) {
      try { $null = GetJson ($Base + $p + $h) ; $ApiPrefix = $p ; break } catch {}
    }
    if ($ApiPrefix -eq $p) { break }
  } catch {}
}
if ($ApiPrefix -eq "/api") { Ok "Detected API prefix: /api" } else { Warn "Using API prefix: (none). If your routes are under /api, this script will still try fallbacks per-endpoint." }

function Try-Post($paths, $bodies, $headers=@{}) {
  $lastErr = $null
  foreach ($path in $paths) {
    foreach ($body in $bodies) {
      try {
        return PostJson ($Base + $path) $body $headers
      } catch {
        $lastErr = $_.Exception.Message
      }
    }
  }
  throw $lastErr
}

function Try-Get($paths, $headers=@{}) {
  $lastErr = $null
  foreach ($path in $paths) {
    try { return GetJson ($Base + $path) $headers } catch { $lastErr = $_.Exception.Message }
  }
  throw $lastErr
}

# Test identity data
$phone = ("9" + (Get-Random -Minimum 100000000 -Maximum 999999999))
$password = "Test@12345"
$state = "Tamil Nadu"
$district = "Coimbatore"

# ---- Register (try multiple endpoints + payload shapes) ----
$registerPaths = @(
  "$ApiPrefix/auth/register",
  "/auth/register",
  "/api/auth/register"
) | Select-Object -Unique

$registerBodies = @(
  @{ phone = $phone; password = $password; state = $state; district = $district; role = "FARMER"; preferredLanguage="en"; fullName="Smoke Test Farmer" },
  @{ phoneNumber = $phone; password = $password; confirmPassword = $password; state = $state; district = $district; role = "FARMER"; language="en"; name="Smoke Test Farmer" },
  @{ mobile = $phone; password = $password; confirmPassword = $password; state = $state; district = $district; role = "FARMER"; fullName="Smoke Test Farmer" }
)

try {
  $reg = Try-Post $registerPaths $registerBodies
  Ok "Register OK"
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Fail "Register failed after trying multiple endpoint/payload variants.`nLast error:`n$($_.Exception.Message)`n`nCheck logs:`n$stderrLog"
}

# ---- Login (try multiple endpoints + payload shapes) ----
$loginPaths = @(
  "$ApiPrefix/auth/login",
  "/auth/login",
  "/api/auth/login"
) | Select-Object -Unique

$loginBodies = @(
  @{ phone = $phone; password = $password },
  @{ phoneNumber = $phone; password = $password },
  @{ mobile = $phone; password = $password }
)

try {
  $login = Try-Post $loginPaths $loginBodies
  Ok "Login OK"
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Fail "Login failed.`n$($_.Exception.Message)`n`nCheck logs:`n$stderrLog"
}

# Token extraction (OTP-aware)
$token = $null
$requiresOtp = $false
try { if ($login.data -and $login.data.requiresOtp -eq $true) { $requiresOtp = $true } } catch {}
try { if (-not $requiresOtp -and $login.requiresOtp -eq $true) { $requiresOtp = $true } } catch {}

if ($requiresOtp) {
  Info "OTP required for login. Attempting auto-verify using debugOtp (dev flow)..."

  $otp = $null
  $contact = $phone
  try { if ($login.data -and $login.data.debugOtp) { $otp = [string]$login.data.debugOtp } } catch {}
  try { if ($login.data -and $login.data.phoneNumber) { $contact = [string]$login.data.phoneNumber } } catch {}

  if (-not $otp) {
    try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
    Fail "OTP required but debugOtp missing in login response. Raw response:`n$($login | ConvertTo-Json -Depth 30)"
  }

  $verifyPaths = @(
    "$ApiPrefix/auth/verify",
    "/auth/verify",
    "/api/auth/verify"
  ) | Select-Object -Unique

  $verifyBodies = @(
    @{ contact = $contact; code = $otp },
    @{ contact = $contact; otp = $otp },
    @{ phoneNumber = $contact; code = $otp },
    @{ phone = $contact; otp = $otp }
  )

  try {
    $verified = Try-Post $verifyPaths $verifyBodies
    Ok "OTP verified"
  } catch {
    try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
    Fail "OTP verify failed.`n$($_.Exception.Message)`n`nCheck logs:`n$stderrLog"
  }

  try { if ($verified.data -and $verified.data.token) { $token = $verified.data.token } } catch {}
  try { if (-not $token -and $verified.token) { $token = $verified.token } } catch {}
  try { if (-not $token -and $verified.data -and $verified.data.accessToken) { $token = $verified.data.accessToken } } catch {}
  try { if (-not $token -and $verified.accessToken) { $token = $verified.accessToken } } catch {}

  if (-not $token) {
    try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
    Fail "OTP verify response missing token. Raw response:`n$($verified | ConvertTo-Json -Depth 30)"
  }
} else {
  try { if ($login.data -and $login.data.token) { $token = $login.data.token } } catch {}
  try { if (-not $token -and $login.token) { $token = $login.token } } catch {}
  try { if (-not $token -and $login.data -and $login.data.accessToken) { $token = $login.data.accessToken } } catch {}
  try { if (-not $token -and $login.accessToken) { $token = $login.accessToken } } catch {}

  if (-not $token) {
    try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
    Fail "Login response missing token. Raw response:`n$($login | ConvertTo-Json -Depth 30)"
  }
}
Ok "Auth OK (token ready)"
$auth = @{ Authorization = "Bearer $token" }

# ---- Create crop (try multiple endpoints) ----
$createCropPaths = @(
  "$ApiPrefix/crops",
  "/crops",
  "/api/crops"
) | Select-Object -Unique

$cropBody = @{
  name = "Tomato"
  quantity = 10
  unit = "kg"
  basePrice = 100
  qualityGrade = "A"
  state = $state
  district = $district
}

try {
  $crop = Try-Post $createCropPaths @($cropBody) $auth
  Ok "Create crop OK"
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Fail "Create crop failed.`n$($_.Exception.Message)`n`nCheck logs:`n$stderrLog"
}

# ---- List crops ----
$listCropPaths = @(
  "$ApiPrefix/crops",
  "/crops",
  "/api/crops"
) | Select-Object -Unique

try {
  $list = Try-Get $listCropPaths $auth
  Ok "List crops OK"
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Fail "List crops failed.`n$($_.Exception.Message)`n`nCheck logs:`n$stderrLog"
}

# ---- Price endpoints (no auth) ----
$escState = [uri]::EscapeDataString($state)
$escDistrict = [uri]::EscapeDataString($district)

$priceCurrentPaths = @(
  "$ApiPrefix/prices/current?crop=tomato&state=$escState&district=$escDistrict",
  "/prices/current?crop=tomato&state=$escState&district=$escDistrict",
  "/api/prices/current?crop=tomato&state=$escState&district=$escDistrict"
) | Select-Object -Unique

$priceHistoryPaths = @(
  "$ApiPrefix/prices/history?crop=tomato&state=$escState&district=$escDistrict",
  "/prices/history?crop=tomato&state=$escState&district=$escDistrict",
  "/api/prices/history?crop=tomato&state=$escState&district=$escDistrict"
) | Select-Object -Unique

$priceComparePaths = @(
  "$ApiPrefix/prices/compare?crop=tomato&state=$escState&district=$escDistrict&compareState=Kerala&compareDistrict=Palakkad",
  "/prices/compare?crop=tomato&state=$escState&district=$escDistrict&compareState=Kerala&compareDistrict=Palakkad",
  "/api/prices/compare?crop=tomato&state=$escState&district=$escDistrict&compareState=Kerala&compareDistrict=Palakkad"
) | Select-Object -Unique

try {
  $cur  = Try-Get $priceCurrentPaths
  $hist = Try-Get $priceHistoryPaths
  $cmp  = Try-Get $priceComparePaths
  Ok "Price endpoints OK"
} catch {
  try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  Fail "Price endpoints failed.`n$($_.Exception.Message)`n`nCheck logs:`n$stderrLog"
}

Info "All smoke checks passed."
Info "Stopping server..."
try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
Ok "Done."

Pop-Location

# Bo ghep phim chay ngam cho Muse Studio (http://localhost:18622) - chi nhan ket noi tu chinh may nay.
# Dung ffmpeg co san trong goi Muse2API: lay khung cuoi cua canh (noi canh) va ghep cac canh thanh 1 phim MP4.
# Lam bang ffmpeg nen khong can tab trinh duyet mo, an tab van chay. File ASCII de PowerShell 5.1 doc dung.
param(
  [string]$Root = "C:\muse2api-test",
  [int]$Port = 18622
)
$ErrorActionPreference = "Stop"
$App    = Join-Path $Root "app\Muse2API_VI_Portable_1.6.8"
$Media  = Join-Path $App "data\media"
$Ffmpeg = Join-Path $Root "ffmpeg\bin\ffmpeg.exe"
$Ffprobe = Join-Path $Root "ffmpeg\bin\ffprobe.exe"
$Out    = Join-Path $Root "phim"
$Tmp    = Join-Path $Out ".tam"   # thu muc tam nam trong thu muc phim (TEMP kieu HAIANH~1 de loi duong dan)
New-Item -ItemType Directory -Force $Out, $Tmp | Out-Null

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
try { $listener.Start() } catch {
  # Cong da co bo ghep khac dang chay (bam shortcut 2 lan) - thoat yen lang.
  try { $listener.Prefixes.Clear(); $listener.Prefixes.Add("http://localhost:$Port/"); $listener.Start() } catch { exit 0 }
}

function Send($ctx, [int]$code, $body, [string]$type = "application/json; charset=utf-8") {
  $r = $ctx.Response
  $r.StatusCode = $code
  $r.Headers["Access-Control-Allow-Origin"] = "*"
  $r.Headers["Access-Control-Allow-Headers"] = "content-type"
  $r.Headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
  $r.Headers["Access-Control-Allow-Private-Network"] = "true"
  $r.ContentType = $type
  if ($body -is [byte[]]) { $bytes = $body } else { $bytes = [Text.Encoding]::UTF8.GetBytes([string]$body) }
  $r.ContentLength64 = $bytes.Length
  if ($ctx.Request.HttpMethod -ne "HEAD") { $r.OutputStream.Write($bytes, 0, $bytes.Length) }
  $r.Close()
}
function Json($o) { return ($o | ConvertTo-Json -Compress -Depth 5) }
# Chi nhan ten file video cua Muse2API (vd video_033.mp4) va phai nam trong thu muc media.
function MediaFile([string]$name) {
  if ($name -notmatch '^[A-Za-z0-9_.-]+\.mp4$') { throw "Ten canh khong hop le: $name" }
  $p = Join-Path $Media $name
  if (-not (Test-Path $p)) { throw "Khong thay canh $name" }
  return $p
}
function Run([string]$exe, [string[]]$argv) {
  $err = Join-Path $Tmp ("err-" + [guid]::NewGuid().ToString("N") + ".txt")
  $quoted = $argv | ForEach-Object { if ($_ -match '[\s";]') { '"' + ($_ -replace '"', '\"') + '"' } else { $_ } }
  $p = Start-Process -FilePath $exe -ArgumentList $quoted -NoNewWindow -Wait -PassThru -RedirectStandardError $err
  $msg = if (Test-Path $err) { (Get-Content $err -Raw) } else { "" }
  Remove-Item $err -ErrorAction SilentlyContinue
  if ($p.ExitCode -ne 0) { throw ("ffmpeg loi: " + ($msg -split "`n" | Select-Object -Last 3) -join " ") }
}
function Probe([string]$file) {
  $info = & $Ffprobe -v error -show_entries "format=duration:stream=codec_type,width,height" -of json $file | ConvertFrom-Json
  $v = $info.streams | Where-Object { $_.codec_type -eq "video" } | Select-Object -First 1
  $a = @($info.streams | Where-Object { $_.codec_type -eq "audio" }).Count -gt 0
  return @{ dur = [double]$info.format.duration; w = [int]$v.width; h = [int]$v.height; audio = $a }
}
$inv = [Globalization.CultureInfo]::InvariantCulture
function F([double]$x) { return $x.ToString("0.###", $inv) }

# Ghep: cat liem (noi canh, bo khung trung o dau canh sau) hoac mo dan 0.6 giay (xfade).
function Ghep($names, [double]$trim, [bool]$fade, [string]$outName) {
  $files = @($names | ForEach-Object { MediaFile $_ })
  if ($files.Count -lt 2) { throw "Can it nhat 2 canh" }
  $info = @($files | ForEach-Object { Probe $_ })
  $r0 = $info[0].w / [double]$info[0].h
  if ($r0 -lt 0.8) { $W = 720; $H = 1280 } elseif ($r0 -gt 1.25) { $W = 1280; $H = 720 } else { $W = 1024; $H = 1024 }
  $argv = @("-y", "-loglevel", "error")
  foreach ($f in $files) { $argv += @("-i", $f) }
  $n = $files.Count; $fc = ""; $lens = @()
  for ($i = 0; $i -lt $n; $i++) {
    $st = if ($i -gt 0) { $trim } else { 0 }
    $lens += ($info[$i].dur - $st)
    $fc += "[${i}:v]trim=start=$(F $st),setpts=PTS-STARTPTS,scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v$i];"
    if ($info[$i].audio) { $fc += "[${i}:a]atrim=start=$(F $st),asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo[a$i];" }
    else { $fc += "anullsrc=r=44100:cl=stereo,atrim=duration=$(F $lens[$i])[a$i];" }
  }
  if ($fade) {
    $D = 0.6; $pv = "v0"; $pa = "a0"; $acc = $lens[0]
    for ($i = 1; $i -lt $n; $i++) {
      $off = $acc - $D * $i
      $fc += "[$pv][v$i]xfade=transition=fade:duration=$(F $D):offset=$(F $off)[xv$i];[$pa][a$i]acrossfade=d=$(F $D)[xa$i];"
      $pv = "xv$i"; $pa = "xa$i"; $acc += $lens[$i]
    }
    $fc = $fc.TrimEnd(";"); $vmap = "[$pv]"; $amap = "[$pa]"
  } else {
    for ($i = 0; $i -lt $n; $i++) { $fc += "[v$i][a$i]" }
    $fc += "concat=n=${n}:v=1:a=1[v][a]"; $vmap = "[v]"; $amap = "[a]"
  }
  $safe = ($outName -replace '[^A-Za-z0-9_-]', '-'); if (-not $safe) { $safe = "phim" }
  $file = Join-Path $Out ($safe + "-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".mp4")
  $argv += @("-filter_complex", $fc, "-map", $vmap, "-map", $amap, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", $file)
  Run $Ffmpeg $argv
  $p = Probe $file
  return @{ ok = $true; name = (Split-Path $file -Leaf); file = $file; url = "http://localhost:$Port/film/" + (Split-Path $file -Leaf); seconds = [math]::Round($p.dur, 1); width = $p.w; height = $p.h; bytes = (Get-Item $file).Length }
}

while ($listener.IsListening) {
  try { $ctx = $listener.GetContext() } catch { break }
  try {
    $req = $ctx.Request; $path = $req.Url.AbsolutePath
    if ($req.HttpMethod -eq "OPTIONS") { Send $ctx 204 ""; continue }
    if ($path -eq "/health") { Send $ctx 200 (Json @{ ok = $true; ffmpeg = (Test-Path $Ffmpeg); out = $Out }); continue }
    if ($path -eq "/frame") {
      $src = MediaFile $req.QueryString["name"]
      $jpg = Join-Path $Tmp ("f-" + [guid]::NewGuid().ToString("N") + ".jpg")
      Run $Ffmpeg @("-y", "-loglevel", "error", "-sseof", "-0.1", "-i", $src, "-frames:v", "1", "-q:v", "2", $jpg)
      $bytes = [IO.File]::ReadAllBytes($jpg); Remove-Item $jpg -ErrorAction SilentlyContinue
      Send $ctx 200 $bytes "image/jpeg"; continue
    }
    if ($path -eq "/ghep" -and $req.HttpMethod -eq "POST") {
      $body = (New-Object IO.StreamReader($req.InputStream, [Text.Encoding]::UTF8)).ReadToEnd() | ConvertFrom-Json
      Send $ctx 200 (Json (Ghep $body.names ([double]$body.trim) ([bool]$body.fade) ([string]$body.name))); continue
    }
    if ($path -like "/film/*") {
      $name = $path.Substring(6)
      if ($name -notmatch '^[A-Za-z0-9_.-]+\.mp4$' -or -not (Test-Path (Join-Path $Out $name))) { Send $ctx 404 (Json @{ error = "Khong thay phim" }); continue }
      $ctx.Response.AddHeader("Content-Disposition", "attachment; filename=""$name""")
      Send $ctx 200 ([IO.File]::ReadAllBytes((Join-Path $Out $name))) "video/mp4"; continue
    }
    Send $ctx 404 (Json @{ error = "Khong co duong dan $path" })
  } catch {
    try { Send $ctx 500 (Json @{ error = $_.Exception.Message }) } catch {}
  }
}

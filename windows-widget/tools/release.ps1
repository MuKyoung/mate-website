# MATE 캘린더 배포 파일 만들기
#   1) MateCalendar.csproj 의 <Version> 을 올린다(위젯이 이 값으로 업데이트를 알아챈다)
#   2) powershell -File windows-widget\tools\release.ps1 -Notes "바뀐 점"
#   3) public/downloads/ 의 두 파일(MATE-Calendar-Setup.exe · mate-calendar.json)을 커밋 · 푸시하면 Vercel 이 올린다
param([string]$Notes = "")
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)   # windows-widget
$site = Split-Path -Parent $root                                                 # 저장소 루트
Push-Location $root
try {
    dotnet build -c Release -nologo -v q
    if ($LASTEXITCODE -ne 0) { throw "빌드 실패" }
} finally { Pop-Location }

$exe = Join-Path $root 'bin\Release\net48\MateCalendar.exe'
$ver = (Get-Item $exe).VersionInfo.FileVersion -replace '^(\d+\.\d+\.\d+).*', '$1'
$dl = Join-Path $site 'public\downloads'
New-Item -ItemType Directory -Force $dl | Out-Null
$target = Join-Path $dl 'MATE-Calendar-Setup.exe'
Copy-Item $exe $target -Force
$sha = (Get-FileHash $target -Algorithm SHA256).Hash.ToLowerInvariant()
$size = (Get-Item $target).Length
$date = Get-Date -Format 'yyyy-MM-dd'
$notesJson = ($Notes -replace '\\', '\\' -replace '"', '\"')
$json = @"
{
  "version": "$ver",
  "url": "/downloads/MATE-Calendar-Setup.exe",
  "sha256": "$sha",
  "size": $size,
  "notes": "$notesJson",
  "date": "$date"
}
"@
[IO.File]::WriteAllText((Join-Path $dl 'mate-calendar.json'), $json + "`n", (New-Object Text.UTF8Encoding($false)))
"판 $ver · SHA-256 $sha"
"→ public/downloads/MATE-Calendar-Setup.exe, public/downloads/mate-calendar.json"

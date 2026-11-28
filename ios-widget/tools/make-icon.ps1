# App icon (1024 x 1024, no alpha) - white calendar + check on tm blue, same drawing as the Android icon.
# Run: powershell -File tools\make-icon.ps1
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot '..\App\Assets.xcassets\AppIcon.appiconset\icon-1024.png'
$size = 1024
$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::FromArgb(0x26, 0x44, 0xCB))

# Android viewport is 108; the drawing sits in 34..74. Show 22..86 (64 units) across the icon.
$s = $size / 64.0
$g.ScaleTransform($s, $s)
$g.TranslateTransform(-22, -22)

$white = [System.Drawing.Color]::White
$pen = New-Object System.Drawing.Pen($white, 4)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

# rounded rectangle 34,38 - 74,74, corner radius 5
$r = 5; $d = $r * 2
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc(34, 38, $d, $d, 180, 90)
$path.AddArc(74 - $d, 38, $d, $d, 270, 90)
$path.AddArc(74 - $d, 74 - $d, $d, $d, 0, 90)
$path.AddArc(34, 74 - $d, $d, $d, 90, 90)
$path.CloseFigure()
$g.DrawPath($pen, $path)
$g.DrawLine($pen, 34, 48, 74, 48)
$g.DrawLine($pen, 44, 33, 44, 42)
$g.DrawLine($pen, 64, 33, 64, 42)

$check = New-Object System.Drawing.Pen($white, 4.5)
$check.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$check.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$check.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$pts = @(
  (New-Object System.Drawing.PointF(45, 61)),
  (New-Object System.Drawing.PointF(51, 67)),
  (New-Object System.Drawing.PointF(63, 55))
)
$g.DrawLines($check, [System.Drawing.PointF[]]$pts)

$g.Dispose()
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "saved $out"

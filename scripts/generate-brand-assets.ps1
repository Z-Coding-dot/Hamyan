Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$icons = Join-Path $public 'icons'
$shots = Join-Path $public 'screenshots'
New-Item -ItemType Directory -Force -Path $shots | Out-Null

function U([int[]]$codes) {
  -join ($codes | ForEach-Object { [char]$_ })
}

$title = U @(0x0647, 0x0645, 0x06CC, 0x0627, 0x0646)
$subtitle = U @(
  0x0645, 0x062F, 0x06CC, 0x0631, 0x06CC, 0x062A, 0x0020,
  0x0645, 0x0635, 0x0627, 0x0631, 0x0641, 0x0020,
  0x0648, 0x0020,
  0x0645, 0x0639, 0x0627, 0x0645, 0x0644, 0x0627, 0x062A, 0x0020,
  0x0634, 0x062E, 0x0635, 0x06CC
)
$features = U @(
  0x0645, 0x0635, 0x0627, 0x0631, 0x0641, 0x060C, 0x0020,
  0x0645, 0x0639, 0x0627, 0x0645, 0x0644, 0x0627, 0x062A, 0x060C, 0x0020,
  0x062A, 0x062D, 0x0644, 0x06CC, 0x0644
)

$src = [System.Drawing.Image]::FromFile((Join-Path $public 'logo.png'))
$logo = New-Object System.Drawing.Bitmap $src
$src.Dispose()

$navy = [System.Drawing.Color]::FromArgb(255, 13, 43, 126)
$blue = [System.Drawing.Color]::FromArgb(255, 20, 99, 243)
$cyan = [System.Drawing.Color]::FromArgb(255, 0, 185, 255)
$white = [System.Drawing.Color]::White
$ink = [System.Drawing.Color]::FromArgb(255, 30, 41, 59)

function Save-Bitmap([System.Drawing.Bitmap]$bmp, [string]$path) {
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @{ Bitmap = $bmp; Graphics = $g }
}

function New-Icon([int]$size, [double]$pad, [System.Drawing.Color]$bg, [string]$path) {
  $canvas = New-Canvas $size $size
  $g = $canvas.Graphics
  $g.Clear($bg)
  $inner = [int]($size * (1 - (2 * $pad)))
  $x = [int](($size - $inner) / 2)
  $g.DrawImage($logo, $x, $x, $inner, $inner)
  $g.Dispose()
  Save-Bitmap $canvas.Bitmap $path
}

New-Icon 32 0.08 $white (Join-Path $public 'favicon-32.png')
New-Icon 180 0.08 $white (Join-Path $public 'apple-touch-icon.png')
New-Icon 180 0.08 $white (Join-Path $icons 'apple-touch-icon-180.png')
New-Icon 167 0.08 $white (Join-Path $icons 'apple-touch-icon-167.png')
New-Icon 152 0.08 $white (Join-Path $icons 'apple-touch-icon-152.png')
New-Icon 120 0.08 $white (Join-Path $icons 'apple-touch-icon-120.png')
New-Icon 192 0.08 $white (Join-Path $icons 'pwa-192.png')
New-Icon 512 0.08 $white (Join-Path $icons 'pwa-512.png')
New-Icon 192 0.2 $white (Join-Path $icons 'maskable-192.png')
New-Icon 512 0.2 $white (Join-Path $icons 'maskable-512.png')

$rtl = New-Object System.Drawing.StringFormat
$rtl.Alignment = [System.Drawing.StringAlignment]::Far
$rtl.FormatFlags = [System.Drawing.StringFormatFlags]::DirectionRightToLeft
$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center

function Draw-BrandCard($g, [int]$w, [int]$h, [bool]$wide) {
  $g.Clear($navy)
  $glow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(50, 19, 215, 234))
  $g.FillEllipse($glow, ($w - 280), -80, 360, 360)
  $glow.Dispose()
  $card = New-Object System.Drawing.SolidBrush $white
  $margin = if ($wide) { 70 } else { 48 }
  $g.FillRectangle($card, $margin, $margin, ($w - 2 * $margin), ($h - 2 * $margin))
  $card.Dispose()

  $logoSize = if ($wide) { 280 } else { 360 }
  $logoX = if ($wide) { $w - $margin - 80 - $logoSize } else { [int](($w - $logoSize) / 2) }
  $logoY = if ($wide) { [int](($h - $logoSize) / 2) } else { $margin + 70 }
  $g.DrawImage($logo, $logoX, $logoY, $logoSize, $logoSize)

  $titleSize = if ($wide) { 72 } else { 64 }
  $subSize = if ($wide) { 32 } else { 30 }
  $titleFont = New-Object System.Drawing.Font 'Tahoma', $titleSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $subFont = New-Object System.Drawing.Font 'Tahoma', $subSize, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $urlFont = New-Object System.Drawing.Font 'Tahoma', 26, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $titleBrush = New-Object System.Drawing.SolidBrush $ink
  $subBrush = New-Object System.Drawing.SolidBrush $blue
  $urlBrush = New-Object System.Drawing.SolidBrush $navy

  if ($wide) {
    $box = New-Object System.Drawing.RectangleF ($margin + 48), 210, 620, 100
    $g.DrawString($title, $titleFont, $titleBrush, $box, $rtl)
    $box2 = New-Object System.Drawing.RectangleF ($margin + 48), 320, 620, 80
    $g.DrawString($subtitle, $subFont, $subBrush, $box2, $rtl)
    $box3 = New-Object System.Drawing.RectangleF ($margin + 48), 410, 620, 50
    $g.DrawString('netrix.ten.af', $urlFont, $urlBrush, $box3, $rtl)
  } else {
    $box = New-Object System.Drawing.RectangleF $margin, ($logoY + $logoSize + 36), ($w - 2 * $margin), 90
    $g.DrawString($title, $titleFont, $titleBrush, $box, $center)
    $box2 = New-Object System.Drawing.RectangleF ($margin + 24), ($logoY + $logoSize + 140), ($w - 2 * $margin - 48), 120
    $g.DrawString($features, $subFont, $subBrush, $box2, $center)
    $box3 = New-Object System.Drawing.RectangleF $margin, ($h - $margin - 90), ($w - 2 * $margin), 40
    $g.DrawString('netrix.ten.af', $urlFont, $urlBrush, $box3, $center)
  }

  $titleFont.Dispose(); $subFont.Dispose(); $urlFont.Dispose()
  $titleBrush.Dispose(); $subBrush.Dispose(); $urlBrush.Dispose()
}

$og = New-Canvas 1200 630
Draw-BrandCard $og.Graphics 1200 630 $true
$og.Graphics.Dispose()
Save-Bitmap $og.Bitmap (Join-Path $public 'og-image.png')

$wide = New-Canvas 1280 720
Draw-BrandCard $wide.Graphics 1280 720 $true
$wide.Graphics.Dispose()
Save-Bitmap $wide.Bitmap (Join-Path $shots 'wide.png')

$mobile = New-Canvas 750 1334
Draw-BrandCard $mobile.Graphics 750 1334 $false
$mobile.Graphics.Dispose()
Save-Bitmap $mobile.Bitmap (Join-Path $shots 'mobile.png')

$logo.Dispose()
Write-Output 'brand assets written'

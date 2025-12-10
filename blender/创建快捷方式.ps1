# 创建带有Blender图标的桌面快捷方式
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Blender 3.0.1.lnk")
$Shortcut.TargetPath = "C:\MyApps\BlenderCustom\MyBlender.exe"
$Shortcut.WorkingDirectory = "C:\MyApps\BlenderCustom"
$Shortcut.IconLocation = "C:\MyApps\BlenderCustom\MyBlender.exe,0"
$Shortcut.Description = "Blender 3.0.1 自定义版"
$Shortcut.Save()

Write-Host "✓ 桌面快捷方式已创建！" -ForegroundColor Green
Write-Host "图标位置: $env:USERPROFILE\Desktop\Blender 3.0.1.lnk" -ForegroundColor Cyan


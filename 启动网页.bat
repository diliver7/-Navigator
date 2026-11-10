@echo off
chcp 65001 >nul
cd /d %~dp0
title Navigator AI · 一键打开网页

if not exist index.html (
  echo  [错误] 未找到 index.html，请确认本脚本与网页文件在同一文件夹。
  pause
  exit /b 1
)

echo  正在用默认浏览器打开网页...
start "" "index.html"
exit /b 0

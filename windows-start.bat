@echo off
SETLOCAL

echo delete images folder
if exist dist/images rmdir /s /q dist/images

echo create images folder
mkdir dist/images

robocopy "src/images" "dist/images" /E >nul
npm run watch-debug
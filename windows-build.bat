@echo off
SETLOCAL

echo delete lib folder
if exist src\lib rmdir /s /q src\lib

echo create lib folder
mkdir src\lib

echo copy lib folder
robocopy "../serious-game-library/src" "src/lib" /E >nul

echo delete docs folder
if exist docs rmdir /s /q docs

echo build docs
typedoc & npm install && npm run watch

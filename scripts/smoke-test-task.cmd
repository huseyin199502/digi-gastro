@echo off
powershell.exe -ExecutionPolicy Bypass -File "%~dp0smoke-test.ps1" -Port 3100

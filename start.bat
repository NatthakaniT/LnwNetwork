@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  call npm install
  if errorlevel 1 (
    echo.
    echo ติดตั้งไม่สำเร็จ ลองเช็คเน็ตแล้วดับเบิลคลิกใหม่อีกครั้งนะ
    pause
    exit /b 1
  )
)
call npm run build
if errorlevel 1 (
  echo.
  echo สร้างแอปไม่สำเร็จ บอกคนช่วยดูข้อความด้านบนนะ
  pause
  exit /b 1
)
start "" http://localhost:4173
call npm run preview

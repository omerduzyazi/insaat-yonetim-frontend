@echo off
TITLE Insaat Yonetim Sistemi - Otomatik Kurulum ve Baslatma
color 0B

echo ===================================================
echo      INSAAT YONETIM SISTEMI HAZIRLANIYOR...
echo ===================================================
echo.

:: --- 1. BACKEND KONTROLU VE KURULUMU ---
echo [1/4] Backend paketleri kontrol ediliyor...
if not exist "backend\node_modules" (
    echo        UYARI: Backend paketleri eksik. Ilk kurulum yapiliyor...
    echo        Lutfen bekleyin, bu islem internet hizina gore zaman alabilir.
    cd backend
    call npm install
    cd ..
    echo        Tamamlandi.
) else (
    echo        Backend hazir.
)
echo.

:: --- 2. FRONTEND KONTROLU VE KURULUMU ---
echo [2/4] Frontend paketleri kontrol ediliyor...
if not exist "node_modules" (
    echo        UYARI: Frontend paketleri eksik. Ilk kurulum yapiliyor...
    echo        Lutfen bekleyin, bu islem internet hizina gore zaman alabilir.
    call npm install
    echo        Tamamlandi.
) else (
    echo        Frontend hazir.
)
echo.

:: --- 3. BACKEND BASLATMA ---
echo [3/4] Backend Sunucusu baslatiliyor...
start "Backend - API Sunucusu" cmd /k "cd backend && npm run dev"

:: --- 4. FRONTEND BASLATMA ---
echo [4/4] Frontend Arayuzu baslatiliyor...
start "Frontend - Arayuz" cmd /k "npm run dev"

:: --- 5. TARAYICIYI ACMA ---
echo.
echo Sunucularin ayaga kalkmasi bekleniyor (5 saniye)...
timeout /t 5 >nul

echo Tarayici aciliyor: http://localhost:5173
start http://localhost:5173

echo.
echo ===================================================
echo            SISTEM BASARIYLA ACILDI!
echo      Pencereleri kapatmadan calismaya devam edin.
echo ===================================================
pause
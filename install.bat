@echo off
echo Installation des dependances pour SMS Service Web Application
echo.

echo Installation des dependances du backend...
cd backend
call npm install
if errorlevel 1 (
    echo Erreur lors de l'installation des dependances backend
    pause
    exit /b 1
)

echo.
echo Installation des dependances du frontend...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Erreur lors de l'installation des dependances frontend
    pause
    exit /b 1
)

cd ..
echo.
echo Installation terminee avec succes!
echo.
echo Pour demarrer l'application:
echo 1. Ouvrez un terminal dans le dossier 'backend' et executez: npm run dev
echo 2. Ouvrez un autre terminal dans le dossier 'frontend' et executez: npm run serve
echo.
echo Consultez le fichier README.md pour plus d'informations.
pause

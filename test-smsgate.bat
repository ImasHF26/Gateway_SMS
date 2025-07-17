@echo off
echo ========================================
echo    TEST DE CONNECTIVITE SMSGATE
echo ========================================
echo.

echo Verification de la configuration...
echo.

set CONFIG_FILE=backend\.env
if exist %CONFIG_FILE% (
    echo [OK] Fichier de configuration trouve
    echo.
    echo Configuration actuelle:
    findstr "SMSGATE" %CONFIG_FILE%
    echo.
) else (
    echo [ERREUR] Fichier .env non trouve dans le dossier backend
    echo Veuillez creer le fichier de configuration
    goto :end
)

echo Test de l'API backend...
echo.

REM Demarrer le serveur backend en arriere-plan si pas deja lance
netstat -an | findstr ":3000" >nul 2>&1
if errorlevel 1 (
    echo Demarrage du serveur backend...
    start "Backend SMS Service" cmd /c "cd backend && npm run dev"
    echo Attente du demarrage du serveur...
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] Serveur backend deja en cours d'execution
)

echo.
echo Test de connectivite SMSGate...
echo.

REM Test avec curl si disponible
where curl >nul 2>&1
if not errorlevel 1 (
    echo Test avec curl...
    curl -s http://localhost:3000/api/test-smsgate
    echo.
) else (
    echo curl non disponible, test manuel requis
    echo Ouvrez votre navigateur et allez a: http://localhost:3000/api/test-smsgate
)

echo.
echo Instructions:
echo 1. Verifiez que SMSGate est demarre sur votre smartphone
echo 2. Notez l'adresse IP affichee dans l'application SMSGate
echo 3. Mettez a jour SMSGATE_URL dans backend\.env si necessaire
echo 4. Verifiez les identifiants SMSGATE_USERNAME et SMSGATE_PASSWORD
echo.

:end
echo Appuyez sur une touche pour fermer...
pause >nul

@echo off
echo Demarrage de SMS Service Web Application
echo.

echo Demarrage du serveur backend...
start "Backend Server" cmd /c "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Demarrage du serveur frontend...
start "Frontend Server" cmd /c "cd frontend && npm run serve"

echo.
echo Les serveurs sont en cours de demarrage...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo Appuyez sur une touche pour fermer cette fenetre.
pause > nul

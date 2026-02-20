@echo off
echo ========================================
echo Git Push - iWare Warehouse
echo ========================================
echo.

echo Checking for sensitive files...
git status | findstr ".env"
if %errorlevel% == 0 (
    echo.
    echo WARNING: .env files detected in staging!
    echo Please remove them before pushing.
    echo Run: git reset HEAD backend/.env
    echo.
    pause
    exit /b 1
)

echo.
echo Files to be committed:
echo ========================================
git diff --cached --name-only
echo ========================================
echo.

echo Adding updated files...
git add frontend/src/pages/SettingsPage.jsx
git add frontend/src/utils/accurate.js
git add backend/controllers/accurateController.js
git add backend/scripts/checkAccurateIntegration.js
git add backend/scripts/checkOAuthConfig.js
git add backend/scripts/testOAuthFlow.js
git add backend/scripts/testAccurateAPI.js
git add backend/.env.example
git add ACCURATE_OAUTH_FIX.md
git add DEPLOY_ACCURATE_OAUTH.md
git add GIT_PUSH_CHECKLIST.md
git add .gitignore

echo.
echo Committing changes...
git commit -m "feat: Add Accurate OAuth integration with UI and testing scripts - Add OAuth UI in Settings page - Add accurate.js utility for OAuth functions - Fix accurateController scope configuration - Add multiple testing scripts for OAuth and API - Update documentation with troubleshooting guides - Fix checkAccurateIntegration.js (username to email) - Update .gitignore to exclude .env files"

echo.
echo Pushing to repository...
git push origin main

echo.
echo ========================================
echo Done! Code pushed to repository.
echo ========================================
echo.
echo Next steps on VPS:
echo 1. git pull origin main
echo 2. docker-compose down
echo 3. docker-compose up -d --build
echo 4. docker-compose exec backend node scripts/testOAuthFlow.js
echo.
pause

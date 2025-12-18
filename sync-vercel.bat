@echo off
echo ========================================
echo Script de Sincronizacao Vercel
echo ========================================
echo.

echo [1/5] Salvando alteracoes locais...
git stash

echo.
echo [2/5] Mudando para o branch do Vercel...
git checkout vercel/react-server-components-cve-vu-ixx7rq

echo.
echo [3/5] Fazendo merge do main...
git merge main -m "Sync: Merge main into vercel branch for deployment"

if %errorlevel% neq 0 (
    echo.
    echo ERRO: Conflitos detectados no merge!
    echo Por favor, resolva os conflitos manualmente.
    pause
    exit /b 1
)

echo.
echo [4/5] Enviando para o GitHub...
git push origin vercel/react-server-components-cve-vu-ixx7rq

if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha ao fazer push!
    pause
    exit /b 1
)

echo.
echo [5/5] Voltando para o branch main...
git checkout main

echo.
echo [6/6] Restaurando alteracoes locais...
git stash pop

echo.
echo ========================================
echo SUCESSO! Deploy sera feito no Vercel
echo ========================================
echo.
echo Acesse: https://vercel.com/dashboard
echo para acompanhar o deployment.
echo.
pause

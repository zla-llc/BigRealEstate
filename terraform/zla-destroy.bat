@echo off
echo ====================================================
echo    Zala Real Estate CRM - Universal Cloud Teardown
echo ====================================================
echo:

echo [CHECK] Verifying Docker status...

docker version >nul 2>nul
if errorlevel 1 goto :DOCKER_ERROR

echo [OK] Docker is awake and responding.
echo:

set /p AWS_KEY="Enter AWS Access Key ID: "
set /p AWS_SECRET="Enter AWS Secret Access Key: "

echo:
echo [1/1] Destroying Cloud Infrastructure...
echo:

@REM Run from the root directory to match the init script's path logic
docker run -it --rm ^
  -v "%cd%:/app" ^
  -e AWS_ACCESS_KEY_ID=%AWS_KEY% ^
  -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET% ^
  -e AWS_DEFAULT_REGION=us-east-1 ^
  alpine/terragrunt:latest sh -c "cd /app/BigRealEstate/terraform && terraform init && terraform destroy --auto-approve -var-file='variables.tfvars'"

if errorlevel 1 goto :DEPLOY_ERROR

echo:
echo ====================================================
echo    TEARDOWN COMPLETE!
echo ====================================================
pause
exit /b

:DOCKER_ERROR
echo [ERROR] Docker is not responding.
pause
exit /b

:DEPLOY_ERROR
echo [ERROR] The teardown failed.
pause
exit /b
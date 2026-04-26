@echo off
echo ====================================================
echo    Zala Real Estate CRM - Universal Cloud Deployer
echo ====================================================
echo:

echo [CHECK] Verifying Docker status...

@REM Check if docker works
docker version >nul 2>nul
if errorlevel 1 goto :DOCKER_ERROR

echo [OK] Docker is awake and responding.
echo:

@REM Ask for credentials
set /p AWS_KEY="Enter AWS Access Key ID: "
set /p AWS_SECRET="Enter AWS Secret Access Key: "

echo:
echo [1/3] Launching Secure Deployment Container...
echo [2/3] Cloning Project Repository...
echo [3/3] Initializing Cloud Infrastructure (Terraform)...
echo:

@REM Run the deployment in one single line to prevent Windows syntax errors
docker run -it --rm ^
  -v "%cd%:/app" ^
  -e AWS_ACCESS_KEY_ID=%AWS_KEY% ^
  -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET% ^
  -e AWS_DEFAULT_REGION=us-east-1 ^
  alpine/terragrunt:latest sh -c "apk add --update aws-cli nodejs npm git && cd /app && if [ ! -d 'BigRealEstate' ]; then git clone https://github.com/zla-llc/BigRealEstate.git; fi && cp /app/variables.tfvars /app/BigRealEstate/terraform/variables.tfvars && cd /app/BigRealEstate/terraform && terraform init && terraform apply --auto-approve -var-file='variables.tfvars'"

if errorlevel 1 goto :DEPLOY_ERROR

echo:
echo ====================================================
echo    DEPLOYMENT COMPLETE!
echo ====================================================
pause
exit /b

:DOCKER_ERROR
echo:
echo [ERROR] Docker is running, but the terminal cannot talk to it.
echo:
pause
exit /b

:DEPLOY_ERROR
echo:
echo [ERROR] The deployment failed. Please check the logs above for details.
echo:
pause
exit /b
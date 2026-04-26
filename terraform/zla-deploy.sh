#! /bin/sh

docker_error() {
  echo
  echo "[ERROR] Docker is running, but the terminal cannot talk to it."
  echo
  exit 1
}

deploy_error() {
  echo 
  echo "[ERROR] The deployment failed. Please check the logs above for details."
  echo 
  exit 1
}

echo ====================================================
echo "   Zala Real Estate CRM - Universal Cloud Deployer"
echo ====================================================
echo 

echo "[CHECK] Verifying Docker status..."

# Check if docker works
docker version 
if [ $? -ne 0 ]; then
    docker_error
fi

echo "[OK] Docker is awake and responding."
echo 

# Ask for credentials
read -p "Enter AWS Access Key ID: " AWS_KEY
read -p "Enter AWS Secret Access Key: " AWS_SECRET

echo 
echo "[1/3] Launching Secure Deployment Container..."
echo "[2/3] Cloning Project Repository..."
echo "[3/3] Initializing Cloud Infrastructure (Terraform)..."
echo 

# Run the deployment in one single line to prevent Windows syntax errors
docker run -it --rm -v "$(pwd):/app" \
  -e AWS_ACCESS_KEY_ID=$AWS_KEY \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET \
  -e AWS_DEFAULT_REGION=us-east-1 \
  alpine/terragrunt:latest sh -c "apk add --update aws-cli nodejs npm git && cd /app && if [ ! -d 'BigRealEstate' ]; then git clone https://github.com/zla-llc/BigRealEstate.git; fi && cp /app/variables.tfvars /app/BigRealEstate/terraform/variables.tfvars && cd /app/BigRealEstate/terraform && terraform init && terraform apply --auto-approve -var-file='variables.tfvars'"

if [ $? -ne 0 ]; then
    deploy_error
fi

echo 
echo "===================================================="
echo "   DEPLOYMENT COMPLETE!"
echo "===================================================="
echo 

# Mac: 
# Had to edit ~/.docker/config.json
# Change "credsStore": ... to "credStore": ...
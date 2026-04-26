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
echo "   Zala Real Estate CRM - Universal Cloud Teardown"
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
echo "[1/1] Destroying Cloud Infrastructure..."
echo 

# Run from the root directory to match the init script's path logic
docker run -it --rm \
  -v "$(pwd):/app" \
  -e AWS_ACCESS_KEY_ID=$AWS_KEY \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET \
  -e AWS_DEFAULT_REGION=us-east-1 \
  alpine/terragrunt:latest sh -c "cd /app/BigRealEstate/terraform && terraform init && terraform destroy --auto-approve -var-file='variables.tfvars'"

if [ $? -ne 0 ]; then
    deploy_error
fi

echo 
echo "===================================================="
echo "   TEARDOWN COMPLETE!"
echo "===================================================="
echo 
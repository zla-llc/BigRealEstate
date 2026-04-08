#! /bin/sh

choco install terraform
terraform -version
aws configure
terraform init
terraform apply --auto-approve -var-file="variables.tfvars"
source "./dev.sh"
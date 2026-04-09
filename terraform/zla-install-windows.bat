@echo off

@REM Download Dependencies
winget install --id GitHub.cli
winget install -e --id Amazon.AWSCLI
winget install -e --id OpenJS.NodeJS
winget install -e --id Hashicorp.Terraform

@REM Setup Project files
git clone https://github.com/zla-llc/BigRealEstate.git
git checkout script-handoff @REM TODO Remove
copy .\variables.tfvars .\BigRealEstate\terraform\variables.tfvars

@REM Move into project and kickoff install script
cd .\BigRealEstate\terraform
aws configure
terraform init
terraform apply --auto-approve -var-file="variables.tfvars"

@REM Move back to original dir
cd ..\..\
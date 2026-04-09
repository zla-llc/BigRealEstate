#! /bin/sh

# Download Necassary Software
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install gh
brew install awscli
brew install node
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Setup project files
git clone https://github.com/zla-llc/BigRealEstate.git
git checkout script-handoff # TODO Remove
cp ./variables.tfvars ./BigRealEstate/terraform/variables.tfvars

# Move into project and kickoff install script
cd ./BigRealEstate/terraform
aws configure
terraform init
terraform apply --auto-approve -var-file="variables.tfvars"

# Make commands available and move back to original dir
source ./zla-mac.sh
cd ../../

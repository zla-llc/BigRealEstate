@echo off
terraform init; terraform apply --auto-approve -var-file="variables.tfvars"
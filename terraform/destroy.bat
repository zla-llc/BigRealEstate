@echo off
terraform destroy --auto-approve -var-file='variables.tfvars'
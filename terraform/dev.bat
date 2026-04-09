doskey apply=terraform init && terraform apply --auto-approve -var-file='variables.tfvars'
doskey destroy=terraform destroy --auto-approve -var-file='variables.tfvars'
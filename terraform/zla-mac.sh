alias zla-start="terraform init && terraform apply --auto-approve -var-file='variables.tfvars'"
alias zla-stop="terraform destroy --auto-approve -var-file='variables.tfvars'"
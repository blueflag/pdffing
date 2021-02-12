provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.70"
}

variable "stage" {
    default = "dev"
}

terraform {
  backend "s3" {
    dynamodb_table = "terraform_locks"
    bucket         = "blueflag-serverless-deploy-bucket"
    key            = "pdffing/tfstate.dev"
    region         = "ap-southeast-2"
    encrypt        = true
  }
}

module "pdffing_lambda" {
  source = "../pdffing"
  stage = var.stage
}

# Route 53 Configuration
data "aws_route53_zone" "external" {
  name = "ontrak.dev"
}

module "api_gateway_mapping" {
  source = "../apigw-mapping"
  stage = var.stage
  zone_id = data.aws_route53_zone.external.zone_id
  domain_name = "${var.stage}.data.user.services.ontrak.dev"
  api_gateway_id = module.pdffing_lambda.api_gateway_id
}

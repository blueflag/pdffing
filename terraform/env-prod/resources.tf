provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.70"
}

variable "stage" {
    default = "prod"
}

terraform {
  backend "s3" {
    dynamodb_table = "terraform_locks"
    bucket         = "blueflag-resources-deployment-bkt"
    key            = "pdffing/tfstate.prod"
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
  name = "blueflag.services"
}

module "api_gateway_mapping" {
  source = "../apigw-mapping"
  stage = var.stage
  zone_id = data.aws_route53_zone.external.zone_id
  domain_name = "data.user.blueflag.services"
  api_gateway_id = module.pdffing_lambda.api_gateway_id
}

variable "api_gateway_id" {
    type = string
}

variable "stage" {
    default = "dev"
}


variable "zone_id" {
  description = "The route53 zone id that controls the names"
  type = string
  
}

variable "domain_name" {
  description = "the domain name to assign to the lambda"
  type = string
}


module "certificate_apigw" {
  source = "../ssl-certificate"
  hosted_zone = var.zone_id
  domain_name = var.domain_name
}


resource "aws_api_gateway_domain_name" "pdf_lambda_domain" {
  regional_certificate_arn = module.certificate_apigw.certificate_id
  domain_name     = var.domain_name
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_route53_record" "pdf_lambda_domain_record" {
  name    = aws_api_gateway_domain_name.pdf_lambda_domain.domain_name
  type    = "A"
  zone_id = var.zone_id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.pdf_lambda_domain.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.pdf_lambda_domain.regional_zone_id
  }
}

resource "aws_api_gateway_base_path_mapping" "api_gateway_mapping" {
  api_id      = var.api_gateway_id
  stage_name  = var.stage
  domain_name = aws_api_gateway_domain_name.pdf_lambda_domain.domain_name
}

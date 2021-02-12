

variable "domain_name" {

}

variable "hosted_zone" {

}

# SSL Certificate
resource "aws_acm_certificate" "default" {
  domain_name       = var.domain_name
  validation_method = "DNS"
}

#Validation Record
resource "aws_route53_record" "validation" {
  name    = aws_acm_certificate.default.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.default.domain_validation_options.0.resource_record_type
  zone_id = var.hosted_zone
  records = [aws_acm_certificate.default.domain_validation_options.0.resource_record_value]
  ttl     = "60"
  allow_overwrite = true
  depends_on = [aws_acm_certificate.default]
}

resource "aws_acm_certificate_validation" "default" {
  certificate_arn = aws_acm_certificate.default.arn
  validation_record_fqdns = [
    aws_route53_record.validation.fqdn
  ]
}

output "certificate_id" {
  value = aws_acm_certificate_validation.default.certificate_arn
}
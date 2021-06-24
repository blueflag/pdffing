data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
variable "stage" {
  type = string
    default = "dev"
}

variable "local" {
  type = bool
  default = false
  description = "Is the service being run locally"
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda_pdffing-${var.stage}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
    tags = {
        client = "blueflag"
        product = "pdffing"
        package = "pdffing"
        stage = var.stage
    }
}

resource "aws_s3_bucket" "pdf_bucket" {
  bucket = "s3pdffing"
  acl    = "public-read"

  lifecycle_rule {
    id = "pdf_lifecycle"
    enabled = true

    expiration {
      days = 1
    }

  }
}

data "aws_iam_policy_document" "lambda_policy" {
  # Allow Cloudwatch Logging
  statement {
    sid = "2"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${aws_cloudwatch_log_group.pdf_logs.arn}"
    ]
  }
  # Allow access to s3 bucket
  statement {
    sid = "3"
    actions = [
      "s3:*"
    ]
    resources = [
      "arn:aws:s3:::*"
    ]
  }
}

# See also the following AWS managed policy: AWSLambdaBasicExecutionRole
resource "aws_iam_policy" "lambda_policy" {
  name        = "pdffing-lambda_policy-${var.stage}"
  path        = "/"
  policy = data.aws_iam_policy_document.lambda_policy.json
}
resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}
resource "aws_cloudwatch_log_group" "pdf_logs" {
  name              = "/aws/lambda/${aws_lambda_function.pdffing.function_name}"
  retention_in_days = 14
}
resource "aws_lambda_function" "pdffing" {
  filename      = "../../lambda_function_payload.zip"
  function_name = "pdffing-${var.stage}"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "dist/index.handler"
  source_code_hash = filebase64sha256("../../lambda_function_payload.zip")
  timeout       = 900
  runtime = "nodejs12.x"
  memory_size = 512
  environment {
    variables = {
      STAGE = var.stage
    }
  }
  tags = {
    client = "blueflag"
    product = "pdffing"
    package = "pdffing"
    stage = var.stage
  }
  # depends_on = [aws_iam_role_policy_attachment.lambda_policy_attachment]
}

resource "aws_api_gateway_rest_api" "pdffing_api" {
  name        = "${var.stage}-pdffing"
  description = "pdffing PDF converter"
}

resource "aws_api_gateway_resource" "pdffing_resourece" {
  path_part   = "pdffing"
  parent_id   = aws_api_gateway_rest_api.pdffing_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.pdffing_api.id
}

resource "aws_api_gateway_method" "graph_method" {
  rest_api_id   = aws_api_gateway_rest_api.pdffing_api.id
  resource_id   = aws_api_gateway_resource.pdffing_resourece.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "apigw_int" {
  rest_api_id = aws_api_gateway_rest_api.pdffing_api.id
  resource_id = aws_api_gateway_resource.pdffing_resourece.id
  http_method = aws_api_gateway_method.graph_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.pdffing.invoke_arn
}
module "cors" {
   source = "squidfunk/api-gateway-enable-cors/aws"
   version = "0.3.1"

   api_id   = aws_api_gateway_rest_api.pdffing_api.id
   api_resource_id   = aws_api_gateway_resource.pdffing_resourece.id
   allow_origin = "*"
}

resource "aws_api_gateway_deployment" "apigw_deployment" {
  depends_on  = [aws_api_gateway_integration.apigw_int]
  rest_api_id = aws_api_gateway_rest_api.pdffing_api.id

  triggers = {
    redeployment = sha1(join(",", list(
      jsonencode(aws_api_gateway_integration.apigw_int),
    )))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  stage_name    = var.stage
  rest_api_id   = aws_api_gateway_rest_api.pdffing_api.id
  deployment_id = aws_api_gateway_deployment.apigw_deployment.id
}

resource "aws_lambda_permission" "apigw" {
   statement_id  = "AllowExecutionFromAPIGateway"
   action        = "lambda:InvokeFunction"
   function_name = aws_lambda_function.pdffing.function_name
   principal     = "apigateway.amazonaws.com"
   # The "/*/*" portion grants access from any method on any resource
   # within the API Gateway REST API.
   source_arn = "${aws_api_gateway_rest_api.pdffing_api.execution_arn}/*/*"
}

output "api_gateway_id" {
  value = aws_api_gateway_rest_api.pdffing_api.id
}

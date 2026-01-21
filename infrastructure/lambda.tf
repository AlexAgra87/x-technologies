# Lambda Function
resource "aws_lambda_function" "api" {
  function_name = "${local.prefix}-api"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "lambda.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory

  filename         = data.archive_file.lambda_placeholder.output_path
  source_code_hash = data.archive_file.lambda_placeholder.output_base64sha256

  environment {
    variables = {
      NODE_ENV        = var.environment
      SYNTECH_API_KEY = var.syntech_api_key
      SYNTECH_API_URL = "https://www.syntech.co.za/feeds/feedhandler.php"
      RCT_API_BASE    = "https://rctdatafeed.azurewebsites.net/api"
      RCT_USER_ID     = var.rct_user_id
      CORS_ORIGIN     = var.frontend_url
    }
  }

  tags = local.common_tags

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

# Placeholder Lambda package
data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/lambda_placeholder.zip"

  source {
    content  = "exports.handler = async () => ({ statusCode: 200, body: 'Placeholder' });"
    filename = "lambda.js"
  }
}

# Lambda IAM Role
resource "aws_iam_role" "lambda_exec" {
  name = "${local.prefix}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

# Lambda Basic Execution Policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda DynamoDB Policy
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${local.prefix}-lambda-dynamodb"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ]
      Resource = [
        aws_dynamodb_table.products.arn,
        "${aws_dynamodb_table.products.arn}/index/*",
        aws_dynamodb_table.cache.arn,
        "${aws_dynamodb_table.cache.arn}/index/*",
        aws_dynamodb_table.orders.arn,
        "${aws_dynamodb_table.orders.arn}/index/*",
        aws_dynamodb_table.users.arn,
        "${aws_dynamodb_table.users.arn}/index/*"
      ]
    }]
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 14

  tags = local.common_tags
}

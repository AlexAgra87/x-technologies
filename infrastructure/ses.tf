# AWS SES (Simple Email Service) Configuration
# For sending order confirmation and notification emails

# SES Email Identity - Verify the sender email address
resource "aws_ses_email_identity" "sales" {
  email = "sales@x-technologies.co.za"
}

# SES Email Identity - Admin email for notifications
resource "aws_ses_email_identity" "admin" {
  email = "admin@x-technologies.co.za"
}

# IAM Policy for Lambda to send emails via SES
resource "aws_iam_role_policy" "lambda_ses" {
  name = "${local.prefix}-lambda-ses"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# Output the SES identity ARNs
output "ses_sales_identity" {
  description = "SES Sales Email Identity"
  value       = aws_ses_email_identity.sales.arn
}

output "ses_admin_identity" {
  description = "SES Admin Email Identity"
  value       = aws_ses_email_identity.admin.arn
}

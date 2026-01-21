# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${local.prefix}-users"

  # Username settings - use email as username
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  # User attributes
  schema {
    name                     = "email"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                     = "given_name"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 50
    }
  }

  schema {
    name                     = "family_name"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 50
    }
  }

  schema {
    name                     = "phone_number"
    attribute_data_type      = "String"
    required                 = false
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 0
      max_length = 20
    }
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Verification message
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your X-Tech verification code"
    email_message        = "Your X-Tech verification code is {####}"
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # MFA settings (optional, off by default)
  mfa_configuration = "OFF"

  # User pool add-ons
  user_pool_add_ons {
    advanced_security_mode = "OFF"
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-user-pool"
  })
}

# Cognito User Pool Client (for web app)
resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.prefix}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # No client secret for public web app
  generate_secret = false

  # Token validity
  access_token_validity  = 1  # hours
  id_token_validity      = 1  # hours
  refresh_token_validity = 30 # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  # Prevent user existence errors (security)
  prevent_user_existence_errors = "ENABLED"

  # OAuth settings
  supported_identity_providers = ["COGNITO"]

  # Callback URLs (add your domains)
  callback_urls = [
    "http://localhost:3000",
    "http://localhost:3000/account",
    var.frontend_url,
    "${var.frontend_url}/account"
  ]

  logout_urls = [
    "http://localhost:3000",
    var.frontend_url
  ]

  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  # Read/write attributes
  read_attributes = [
    "email",
    "email_verified",
    "given_name",
    "family_name",
    "phone_number",
    "phone_number_verified"
  ]

  write_attributes = [
    "email",
    "given_name",
    "family_name",
    "phone_number"
  ]
}

# Cognito User Pool Domain (for hosted UI if needed)
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}-${local.account_id}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Admin group
resource "aws_cognito_user_group" "admins" {
  name         = "admins"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Admin users with full access"
}

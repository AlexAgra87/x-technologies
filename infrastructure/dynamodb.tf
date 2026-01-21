# Products Table
resource "aws_dynamodb_table" "products" {
  name         = "${local.prefix}-products"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  attribute {
    name = "GSI2PK"
    type = "S"
  }

  attribute {
    name = "GSI2SK"
    type = "S"
  }

  # GSI for category queries
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  # GSI for brand queries
  global_secondary_index {
    name            = "GSI2"
    hash_key        = "GSI2PK"
    range_key       = "GSI2SK"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "prod"
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-products"
  })
}

# Cache Table
resource "aws_dynamodb_table" "cache" {
  name         = "${local.prefix}-cache"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "cacheKey"

  attribute {
    name = "cacheKey"
    type = "S"
  }

  # TTL for automatic cache expiration
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-cache"
  })
}

# Orders Table
resource "aws_dynamodb_table" "orders" {
  name         = "${local.prefix}-orders"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  # GSI for querying orders by status
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "prod"
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-orders"
  })
}

# User Profiles Table (for additional user data beyond Cognito)
resource "aws_dynamodb_table" "users" {
  name         = "${local.prefix}-users"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  # GSI for email lookup
  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "prod"
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-users"
  })
}

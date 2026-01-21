# General Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "x-tech"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-1"
}

variable "aws_profile" {
  description = "AWS profile to use for authentication"
  type        = string
  default     = "xtech"
}

# API Configuration
variable "syntech_api_key" {
  description = "Syntech API key for product feeds"
  type        = string
  sensitive   = true
}

variable "rct_user_id" {
  description = "RCT Data Feed user ID"
  type        = string
  sensitive   = true
  default     = ""
}

# Frontend Configuration
variable "frontend_url" {
  description = "Frontend URL for CORS configuration"
  type        = string
  default     = "https://x-tech.vercel.app"
}

# Lambda Configuration
variable "lambda_memory" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

# DynamoDB Configuration
variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

# API Gateway Configuration
variable "api_throttle_rate_limit" {
  description = "API Gateway throttle rate limit (requests per second)"
  type        = number
  default     = 100
}

variable "api_throttle_burst_limit" {
  description = "API Gateway throttle burst limit"
  type        = number
  default     = 200
}

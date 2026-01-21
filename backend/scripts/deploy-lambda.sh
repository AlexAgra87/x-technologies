#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

FUNCTION_NAME="${1:-x-tech-prod-api}"
PROFILE="${2:-xtech}"
REGION="${3:-eu-west-1}"

echo -e "${GREEN}🚀 Deploying Lambda Function: ${FUNCTION_NAME}${NC}"

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Check if package exists
if [ ! -f "lambda-package.zip" ]; then
    echo -e "${YELLOW}⚠️  Lambda package not found. Building...${NC}"
    ./scripts/build-lambda.sh
fi

# Deploy to AWS Lambda
echo -e "${YELLOW}☁️  Updating Lambda function code...${NC}"
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://lambda-package.zip" \
    --profile "$PROFILE" \
    --region "$REGION"

# Wait for update to complete
echo -e "${YELLOW}⏳ Waiting for function update to complete...${NC}"
aws lambda wait function-updated \
    --function-name "$FUNCTION_NAME" \
    --profile "$PROFILE" \
    --region "$REGION"

# Get function details
echo -e "${CYAN}📊 Function Details:${NC}"
aws lambda get-function \
    --function-name "$FUNCTION_NAME" \
    --profile "$PROFILE" \
    --region "$REGION" \
    --query 'Configuration.{Name:FunctionName,Runtime:Runtime,Memory:MemorySize,Timeout:Timeout,LastModified:LastModified}' \
    --output table

echo -e "${GREEN}✅ Deployment complete!${NC}"

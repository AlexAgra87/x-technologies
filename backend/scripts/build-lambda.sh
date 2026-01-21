#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building X-Tech Backend Lambda Package${NC}"

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Install dependencies
echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
npm ci --production

# Build TypeScript
echo -e "${YELLOW}🔨 Building TypeScript...${NC}"
npm run build

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy necessary files
echo -e "${YELLOW}📋 Copying files to dist...${NC}"
cp -r node_modules dist/
cp package.json dist/

# Create zip file
echo -e "${YELLOW}📦 Creating Lambda deployment package...${NC}"
cd dist
zip -r ../lambda-package.zip . -x "*.ts" "*.map"
cd ..

# Get file size
SIZE=$(du -h lambda-package.zip | cut -f1)
echo -e "${GREEN}✅ Lambda package created: lambda-package.zip (${SIZE})${NC}"

# Optional: Upload to S3
if [ "$1" == "--upload" ]; then
    BUCKET="${2:-x-tech-lambda-deployments}"
    VERSION=$(date +%Y%m%d-%H%M%S)
    S3_KEY="lambda/${VERSION}/lambda-package.zip"
    
    echo -e "${YELLOW}☁️  Uploading to S3: s3://${BUCKET}/${S3_KEY}${NC}"
    aws s3 cp lambda-package.zip "s3://${BUCKET}/${S3_KEY}" --profile xtech
    echo -e "${GREEN}✅ Upload complete!${NC}"
fi

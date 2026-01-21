# X-Tech Computer Components

A professional e-commerce platform for computer components, featuring real-time stock aggregation from multiple suppliers.

![X-Tech](https://img.shields.io/badge/X--Tech-Computer%20Components-00bcd4?style=for-the-badge&logo=computer&logoColor=white)

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js       │────▶│   AWS Lambda    │────▶│   Supplier      │
│   (Vercel)      │     │   (API Gateway) │     │   APIs          │
│                 │     │                 │     │   (RCT/Syntech) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │                 │
                        │   DynamoDB      │
                        │   (Cache/Data)  │
                        │                 │
                        └─────────────────┘
```

## 📂 Project Structure

```
x-tech/
├── frontend/          # Next.js 14 application (Vercel)
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities and API clients
│   └── public/        # Static assets
├── backend/           # Node.js Lambda functions
│   ├── src/           
│   │   ├── handlers/  # Lambda handlers
│   │   ├── services/  # Business logic
│   │   └── utils/     # Helpers
│   └── tests/         # Unit tests
└── infrastructure/    # Terraform IaC
    ├── modules/       # Reusable modules
    └── environments/  # Environment configs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS CLI configured with `xtech` profile
- Terraform 1.5+
- Vercel CLI (optional)

### Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Frontend only: http://localhost:3000
npm run dev:frontend

# Backend only: http://localhost:4000
npm run dev:backend
```

### Infrastructure

```bash
# Initialize Terraform
npm run tf:init

# Preview changes
npm run tf:plan

# Apply infrastructure
npm run tf:apply
```

## 🎨 Design System

- **Primary Color**: Teal (#00bcd4)
- **Background**: Dark (#0a0a0a, #1a1a2e)
- **Accent**: Cyan (#00e5ff)
- **Text**: White/Gray gradients

## 📦 Supplier Integration

### RCT Data Feed
- JSON/XML REST API
- Real-time stock levels
- Product images and specifications

### Syntech
- XML feed with full catalog
- Multi-location stock (CPT/JHB/DBN)
- Pricing and RRP data

## 🔧 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.x-tech.co.za
```

### Backend (.env)
```
RCT_API_USER_ID=your_user_id
SYNTECH_API_KEY=your_api_key
AWS_REGION=eu-west-1
```

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for X-Tech

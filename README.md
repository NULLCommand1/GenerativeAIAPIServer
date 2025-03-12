# Generative AI API Server

## Introduction
Generative AI API Server is a backend platform that provides APIs to interact with generative AI models such as NULL AI (based on PaML) via a REST API interface. The system supports text prompt processing, conversation context management, and file uploads for analysis.

## Technology Stack
- Node.js & Express.js
- Sequelize ORM
- MySQL/MariaDB
- Google Generative AI (Gemini)
- Docker

## Project Structure
```
GenerativeAIAPIServer/
├── config/              # Database and multer configurations
├── constants/           # Constants and configurations
├── controllers/         # Business logic handlers
├── helpers/             # Utility functions
├── labs/                # Experimental files
├── middlewares/         # Express middlewares
├── migrations/          # Database migrations
├── models/              # Data models
├── routes/              # API route definitions
├── scripts/             # Utility scripts
├── services/            # Core business logic
├── app.js               # Application entry point
├── app-alwaysdata.js    # Entry point for AlwaysData environment
└── docker-compose.yml   # Docker configuration
```

## Installation

### Requirements
- Node.js (v14 or higher)
- MySQL/MariaDB
- Docker (optional)

### Installation Steps
1. Clone the repository
```bash
git clone https://github.com/NULLCommand1/GenerativeAIAPIServer.git
cd GenerativeAIAPIServer
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure database
- Using Docker:
```bash
docker-compose up -d
```
- Or configure directly in `config/database.config.json`

5. Run migrations
```bash
npx sequelize-cli db:migrate
```

6. Start server
```bash
npm run dev
```

## API Endpoints

### 1. Check server
```
GET /helloworld
```
Response: "Hello World"

### 2. Generate AI Content
```
POST /api/ai-gen
```
Body:
```json
{
  "prompt": "Your prompt content",
  "model": "null-flash or null-pro",
  "contextId": "Context ID (optional)"
}
```
Response:
```json
{
  "success": true,
  "message": "Success",
  "text": "AI-generated response",
  "contextId": "Context ID for continuing the conversation"
}
```

### 3. Upload File
```
POST /api/upload-file
```
Form-data:
- `upload`: File to upload
- `contextId`: Context ID (optional)

Response:
```json
{
  "success": true,
  "message": "Successfully uploaded file",
  "contextId": "Context ID referencing the file"
}
```

## Development Environment

### Run in development mode
```bash
npm run dev
```

## Deployment

### Deploy on AlwaysData
```bash
node app-alwaysdata.js
```

### Tunnel with Serveo
```bash
npm run deploy
```

## File and Context Management

- Each conversation is managed by a unique `contextId`
- Uploaded files are stored in the `uploads` directory and managed by Multer
- Maximum file size: 10MB

## Database

The system uses two primary tables:
- `ChatMessages`: Stores conversation history
- `Files`: Manages uploaded file information

## Support Scripts

### Delete files from Google AI File Manager
```bash
node scripts/google-file-manager.scripts.js
```

![Logo 1](https://openfxt.vercel.app/images/favicon.png)
![Logo 2](https://openfxt.vercel.app/images/brand.png)

## Powered by OpenFXT x NULLCommand1


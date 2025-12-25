# Server Uptime Monitor 🚀

A robust server uptime monitoring solution built with Node.js and PostgreSQL.  Monitor your servers, receive instant alerts via email and Discord, and track uptime history with automated checks.

## ✨ Features

- **Automated Monitoring**: Scheduled health checks for multiple servers
- **Multi-Channel Alerts**: Get notified via Email and Discord webhooks
- **PostgreSQL Database**: Persistent storage for server status and history
- **Docker Support**: Easy deployment with Docker Compose
- **Flexible Configuration**: Environment-based configuration for easy customization

## 🏗️ Architecture

```
Server-uptime-Monitor/
├── backend/
│   ├── src/
│   │   ├── alerts/       # Email and Discord alert handlers
│   │   ├── db/           # Database configuration and queries
│   │   ├── jobs/         # Cron job scheduler
│   │   ├── monitor/      # Server monitoring logic
│   │   └── index.js      # Application entry point
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **Axios** - HTTP client for health checks
- **Node-cron** - Job scheduler
- **Nodemailer** - Email notifications
- **Docker** - Containerization

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development)
- Gmail account with App Password (for email alerts)
- Discord webhook URL (optional)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MUHSIN-M-P/Server-uptime-Monitor.git
cd Server-uptime-Monitor
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_USER=uptime
DB_PASSWORD=password
DB_NAME=uptime_db

# PostgreSQL Configuration
POSTGRES_USER=uptime
POSTGRES_PASSWORD=password
POSTGRES_DB=uptime_db

# Email Alert Configuration (Gmail)
ALERT_EMAIL_USER=your-email@gmail.com
ALERT_EMAIL_PASS=your-app-password-here

# Discord Webhook (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# Application Port
APP_PORT=3000
```

### 3. Set Up Gmail App Password

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password for "Mail"
4. Copy the generated password to `ALERT_EMAIL_PASS` in your `.env` file

### 4. Start the Application

```bash
docker-compose up -d
```

The application will:
- Build the backend service
- Start PostgreSQL database
- Initialize monitoring jobs
- Begin health checks based on your schedule

### 5. View Logs

```bash
docker-compose logs -f backend
```

## 📝 Configuration

### Email Alerts

Configure email notifications using Gmail or any SMTP server:

```env
ALERT_EMAIL_USER=your-email@gmail.com
ALERT_EMAIL_PASS=your-app-password
```

### Discord Alerts

Get instant notifications in your Discord channel:

1. Create a webhook in your Discord server (Server Settings → Integrations → Webhooks)
2. Copy the webhook URL
3. Add it to your `.env` file:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

## 🔧 Development

### Local Setup

```bash
cd backend
npm install
npm start
```

### Environment Variables

Make sure to set all required environment variables before running locally.

## 📊 Database

The application uses PostgreSQL 16 Alpine for efficient data storage.  Data is persisted in a Docker volume named `pgdata`.

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# View logs
docker-compose logs -f

# Remove volumes (⚠️ deletes all data)
docker-compose down -v
```
---

⭐ Star this repository if you find it helpful! 

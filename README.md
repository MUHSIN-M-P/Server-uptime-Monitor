# Server Uptime Monitor 🚀

A robust server uptime monitoring solution built with Node.js and PostgreSQL. Monitor your servers, receive instant alerts via email and Discord, and track uptime history with automated checks.

## ✨ Features

-   **Automated Monitoring**: Scheduled health checks for multiple servers
-   **Multi-Channel Alerts**: Get notified via Email and Discord webhooks
-   **PostgreSQL Database**: Persistent storage for server status and history
-   **Docker Support**: Easy deployment with Docker Compose
-   **Flexible Configuration**: Environment-based configuration for easy customization

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

-   **Node.js** - Runtime environment
-   **Express** - Web framework
-   **PostgreSQL** - Database
-   **Axios** - HTTP client for health checks
-   **Node-cron** - Job scheduler
-   **Nodemailer** - Email notifications
-   **Docker** - Containerization

## 📋 Prerequisites

-   Docker and Docker Compose
-   Node.js 16+ (for local development)
-   Gmail account with App Password (for email alerts)
-   Discord webhook URL (optional)

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

-   Build the backend service
-   Start PostgreSQL database
-   Initialize monitoring jobs
-   Begin health checks based on your schedule

### 5. Create Database Tables

Connect to the PostgreSQL database and create the required tables:

```bash
docker exec -it uptime_db psql -U uptime -d uptime_db
```

Then run the following SQL commands:

```sql
-- Table to store monitor configurations
CREATE TABLE monitors (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    check_interval_seconds INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store health check history
CREATE TABLE checks (
    id SERIAL PRIMARY KEY,
    monitor_id INT REFERENCES monitors(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL,
    latency_ms INT,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track downtime incidents
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    monitor_id INT REFERENCES monitors(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INT
);
```

Exit the PostgreSQL prompt:

```sql
\q
```

### 6. Add Monitors

Add servers/websites to monitor:

```bash
docker exec -it uptime_db psql -U uptime -d uptime_db
```

Insert monitors:

```sql
-- Monitor Google every 30 seconds
INSERT INTO monitors (url, check_interval_seconds)
VALUES ('https://google.com', 30);

-- Monitor your own website every 60 seconds
INSERT INTO monitors (url, check_interval_seconds)
VALUES ('https://your-website.com', 60);

INSERT INTO monitors (url, check_interval_seconds)
VALUES ('http://localhost:9999/fake', 20);

-- Check multiple endpoints
INSERT INTO monitors (url, check_interval_seconds)
VALUES
    ('https://github.com', 45),
    ('https://api.example.com/health', 20);
```

Exit and restart the backend to pick up new monitors:

```bash
\q
docker-compose restart backend
```

### 7. View Logs

```bash
docker-compose logs -f backend
```

You should see periodic health checks running for all active monitors.

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

The application uses PostgreSQL 16 Alpine for efficient data storage. Data is persisted in a Docker volume named `pgdata`.

### Database Schema

**monitors** - Stores website/server configurations

-   `id` - Primary key
-   `url` - URL to monitor
-   `check_interval_seconds` - How often to check (in seconds)
-   `is_active` - Enable/disable monitoring
-   `created_at` - Timestamp when monitor was added

**checks** - Health check history

-   `id` - Primary key
-   `monitor_id` - Foreign key to monitors
-   `status` - UP or DOWN
-   `latency_ms` - Response time in milliseconds
-   `error_message` - Error details if DOWN
-   `checked_at` - Timestamp of check

**incidents** - Downtime tracking

-   `id` - Primary key
-   `monitor_id` - Foreign key to monitors
-   `started_at` - When downtime began
-   `ended_at` - When service recovered (NULL if still down)
-   `duration_seconds` - Total downtime duration

### Query Examples

```bash
# View all monitors
docker exec -it uptime_db psql -U uptime -d uptime_db -c "SELECT * FROM monitors;"

# View recent checks
docker exec -it uptime_db psql -U uptime -d uptime_db -c "SELECT * FROM checks ORDER BY checked_at DESC LIMIT 10;"

# View incidents
docker exec -it uptime_db psql -U uptime -d uptime_db -c "SELECT * FROM incidents;"

# Calculate uptime percentage (last 24 hours)
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
SELECT
    m.url,
    100.0 * (1 - COALESCE(SUM(i.duration_seconds), 0) / 86400) AS uptime_percentage
FROM monitors m
LEFT JOIN incidents i ON m.id = i.monitor_id
    AND i.started_at >= NOW() - INTERVAL '1 day'
GROUP BY m.url;
"
```

## 📝 Managing Monitors

### Add a New Monitor

```bash
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
INSERT INTO monitors (url, check_interval_seconds)
VALUES ('https://example.com', 30);
"

# Restart backend to apply changes
docker-compose restart backend
```

### Remove a Monitor

```bash
# Remove by ID
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
DELETE FROM monitors WHERE id = 1;
"

# Remove by URL
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
DELETE FROM monitors WHERE url = 'https://example.com';
"

# Restart backend
docker-compose restart backend
```

### Disable/Enable a Monitor

```bash
# Disable (stop checking but keep data)
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
UPDATE monitors SET is_active = false WHERE id = 1;
"

# Enable
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
UPDATE monitors SET is_active = true WHERE id = 1;
"

# Restart backend
docker-compose restart backend
```

### Update Check Interval

```bash
# Change to check every 60 seconds
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
UPDATE monitors SET check_interval_seconds = 60 WHERE id = 1;
"

# Restart backend
docker-compose restart backend
```

## 📊 Viewing Data

### View All Tables

```bash
# View all monitors
docker exec -it uptime_db psql -U uptime -d uptime_db -c "SELECT * FROM monitors;"

# View checks with details
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
SELECT
    m.url,
    c.status,
    c.latency_ms,
    c.error_message,
    c.checked_at
FROM checks c
JOIN monitors m ON c.monitor_id = m.id
ORDER BY c.checked_at DESC
LIMIT 20;
"

# View all incidents
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
SELECT
    m.url,
    i.started_at,
    i.ended_at,
    i.duration_seconds
FROM incidents i
JOIN monitors m ON i.monitor_id = m.id
ORDER BY i.started_at DESC;
"
```

### View Latency Statistics

```bash
# Average latency per monitor (last 24 hours)
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
SELECT
    m.url,
    AVG(c.latency_ms) AS avg_latency_ms,
    MIN(c.latency_ms) AS min_latency_ms,
    MAX(c.latency_ms) AS max_latency_ms,
    COUNT(*) AS total_checks
FROM checks c
JOIN monitors m ON c.monitor_id = m.id
WHERE c.checked_at >= NOW() - INTERVAL '1 day'
    AND c.latency_ms IS NOT NULL
GROUP BY m.url;
"

# Recent latency for specific monitor
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
SELECT
    checked_at,
    latency_ms,
    status
FROM checks
WHERE monitor_id = 1
ORDER BY checked_at DESC
LIMIT 10;
"
```

### View Active Incidents (Currently Down)

```bash
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
SELECT
    m.url,
    i.started_at,
    EXTRACT(EPOCH FROM (NOW() - i.started_at)) AS seconds_down
FROM incidents i
JOIN monitors m ON i.monitor_id = m.id
WHERE i.ended_at IS NULL;
"
```

### Calculate Uptime/Downtime Statistics

```bash
# Last 24 hours
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
SELECT
    m.url,
    COUNT(CASE WHEN c.status = 'UP' THEN 1 END) AS up_count,
    COUNT(CASE WHEN c.status = 'DOWN' THEN 1 END) AS down_count,
    ROUND(100.0 * COUNT(CASE WHEN c.status = 'UP' THEN 1 END) / COUNT(*), 2) AS uptime_percent
FROM checks c
JOIN monitors m ON c.monitor_id = m.id
WHERE c.checked_at >= NOW() - INTERVAL '1 day'
GROUP BY m.url;
"

# Last 7 days uptime (time-based)
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
SELECT
    m.url,
    ROUND(100.0 * (1 - COALESCE(SUM(i.duration_seconds), 0) / 604800), 2) AS uptime_percentage,
    COALESCE(SUM(i.duration_seconds), 0) AS total_downtime_seconds
FROM monitors m
LEFT JOIN incidents i ON m.id = i.monitor_id
    AND i.started_at >= NOW() - INTERVAL '7 days'
GROUP BY m.url;
"
```

### Clear Old Data

```bash
# Delete checks older than 30 days
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
DELETE FROM checks
WHERE checked_at < NOW() - INTERVAL '30 days';
"

# Delete resolved incidents older than 90 days
docker exec -it uptime_db psql -U uptime -d uptime_db -c "
DELETE FROM incidents
WHERE ended_at IS NOT NULL
    AND ended_at < NOW() - INTERVAL '90 days';
"
```

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

# Writing Code

## This project doesn’t use ejs since ejs is actually for

**EJS = server-side HTML templating**

It’s used when:

- You want Node.js to **render HTML pages**
- Example: dashboards, forms, server-rendered views

## Tables we need (recap, mapped to requirements)

### 1️⃣ `monitors`

What to monitor & how often

### 2️⃣ `checks`

Every single health check (history)

### 3️⃣ `incidents`

Downtime windows (for recovery email + reports)

## Enter PostgreSQL safely (inside Docker)

From **project root**:

```bash
docker exec -it uptime_db psql -Uuptime -d uptime_db
```

You should see:

```bash
uptime_db=#
```

This means you’re **inside the DB container**, not touching your system DB (safe).

---

## Create tables

### ✅ `monitors` table

```sql
CREATE TABLE monitors (
    id SERIALPRIMARY KEY,
    url TEXTNOT NULL,
    check_interval_secondsINTNOT NULL,
    alert_email TEXTNOT NULL,
    is_activeBOOLEANDEFAULTtrue,
    created_atTIMESTAMPDEFAULTCURRENT_TIMESTAMP
);

```

Why each column exists:

- `check_interval_seconds` → user-defined frequency
- `is_active` → pause monitoring without delete

---

### ✅ `checks` table

```sql
CREATE TABLE checks (
    id SERIALPRIMARY KEY,
    monitor_idINTREFERENCES monitors(id)ONDELETE CASCADE,
    statusVARCHAR(10)NOT NULL,
    latency_msINT,
    error_message TEXT,
    checked_atTIMESTAMPDEFAULTCURRENT_TIMESTAMP
);

```

This directly satisfies:

- latency tracking
- status history
- reporting

---

### ✅ `incidents` table

```sql
CREATE TABLE incidents (
    id SERIALPRIMARY KEY,
    monitor_idINTREFERENCES monitors(id)ONDELETE CASCADE,
    started_atTIMESTAMPNOT NULL,
    ended_atTIMESTAMP,
    duration_secondsINT
);

```

This enables:

- downtime calculation
- recovery notifications
- incident analytics

---

## 9.4 — Verify tables exist

Run:

```sql
\dt

```

You should see:

```
monitors
checks
incidents

```

Exit DB:

```sql
\q

```

---

# Health Check Engine (CORE OF THE PROJECT)

This phase directly implements these requirements:

- Periodic health checks
- Latency measurement
- Logical check (avoid false positives)
- Status tracking (UP / DOWN)

For **one URL**, one check looks like this:

```sql
start timer
send HTTP request
if success:
    latency=end-start
    status= UP
else:
    retry N times
    if still failing:
        status= DOWN
storeresultin DB
detect state change (UP ↔ DOWN)

```

---

# Scheduler (Periodic Monitoring)

This phase satisfies:

> “Users should be able to set how often to check the status of their servers”
> 

We will:

- Read monitors from DB
- Schedule checks **per monitor**
- Avoid duplicate jobs
- Keep it stable inside Docker

## **What is Cron?**

Cron is a time-based job scheduler in Unix-like operating systems. **`node cron`** is a Node.js implementation that allows scheduling tasks using `cron` syntax.

### **Cron Expression Format:**

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └── Day of week (0-7) (0 and 7 = Sunday)
│ │ │ │ └──── Month (1-12)
│ │ │ └────── Day of month (1-31)
│ │ └──────── Hour (0-23)
│ └────────── Minute (0-59)
└──────────── Second (0-59) [Optional in some systems]
```

---

To detect transitions, for **each monitor** we must know:

- Look at the **latest check** in DB
- Compare it with **current result**

### Transition logic (must be clear)

```
prev = last stored status
curr =currentcheck status

UP → DOWN  =>start incident + send alert
DOWN → UP  =>end incident + send recovery alert
UP → UP    =>nothing
DOWN → DOWN=>nothing

```

---

Average latency = **simple SQL**:

```sql
SELECTAVG(latency_ms)
FROM checks
WHERE monitor_id=1
AND status='UP';

```

No extra code needed.

This is **exactly how real systems do it**.

### time-based (more accurate, SRE-grade)

```sql
SELECT
100.0* (
1-COALESCE(SUM(duration_seconds),0)/86400
  )
FROM incidents
WHERE monitor_id=1
AND started_at>= NOW()-INTERVAL'1 day';

```

👉 Your schema **already supports both**.
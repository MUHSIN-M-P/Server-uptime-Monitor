# Server Uptime Monitor

**Core idea**

```
Cron / Scheduler
      ↓
HealthChecker(HTTP ping)
      ↓
DecisionEngine(confirm failures)
      ↓
Database (history + state)
      ↓
AlertEngine(Email/discord)
```

> This project is NOT an API-first app.
It is a background system that runs even when no user opens it.
> 

So the **core loop** is:

> Scheduler → HTTP check → Decide → Store → Alert
> 

[Initialize environment](Initialize%20environment%202d3ffff15030809ebd83de771acb2c9c.md)

[Writing Code](Writing%20Code%202d3ffff15030809ca6f0e6724080f3b6.md)
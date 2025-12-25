const cron = require("node-cron");
const pool = require("../db");
const { checkEndpoint } = require("../monitor/checker");

const scheduledJobs = new Map();

async function loadMonitor() {
    const res = await pool.query(
        "SELECT * FROM monitors WHERE is_active = true"
    );
    return res.rows;
}

function scheduleMonitors(monitor) {
    const { id, check_interval_seconds } = monitor;

    if (scheduledJobs.has(id)) return;

    const cronExpr = `*/${check_interval_seconds} * * * * *`;

    const job = cron.schedule(cronExpr, async () => {
        console.log(`checking ${monitor.url}`);
        await checkEndpoint(monitor);
    });

    scheduledJobs.set(id, job);
}

async function startScheduler() {
    const monitors = await loadMonitor();
    monitors.forEach(scheduleMonitors);
    console.log(`Scheduler started for ${monitors.length} monitors`);
}

module.exports = { startScheduler };

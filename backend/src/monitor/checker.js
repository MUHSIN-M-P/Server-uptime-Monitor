const axios = require("axios");
const pool = require("../db");

const { getLastStatus } = require("./state");
const { startIncident, endIncident } = require("./incidents");
const { alertDown, alertUp } = require("../alerts/alertManager");

async function checkEndpoint(monitor) {
    const { id, url } = monitor;

    const MAX_TRIES = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
        const start = Date.now();
        try {
            const response = await axios.get(url, {
                timeout: 5000,
                ValidateStatus: () => true,
            });

            const latency = Date.now() - start;
            const status =
                response.status >= 200 && response.status < 400 ? "UP" : "DOWN";

            const previousStatus = await getLastStatus(id);

            await pool.query(
                `INSERT INTO checks (monitor_id,status,latency_ms) VALUES ($1,$2,$3)`,
                [id, status, latency]
            );

            if (previousStatus === "UP" && status === "DOWN") {
                await startIncident(id);
                await alertDown(monitor, "HTTP error");
            }

            if (previousStatus === "DOWN" && status === "UP") {
                const duration = await endIncident(id);
                await alertUp(monitor, duration);
            }
            return { status, latency };
        } catch (err) {
            lastError = err;
        }
    }

    const previousStatus = await getLastStatus(id);

    await pool.query(
        `INSERT INTO checks (monitor_id,status,error_message) VALUES ($1,'DOWN',$2)`,
        [id, lastError.message]
    );

    if (previousStatus === "UP") {
        await startIncident(id);
        await alertDown(monitor, lastError.message);
    }
    return { status: "DOWN", error: lastError.message };
}

module.exports = { checkEndpoint };

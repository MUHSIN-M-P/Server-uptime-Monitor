const pool = require("../db");

async function startIncident(monitorId) {
    await pool.query(
        `INSERT INTO incidents (monitor_id,started_at) VALUES ($1,NOW())`,
        [monitorId]
    );
}

async function endIncident(monitorId) {
    const res = await pool.query(
        `UPDATE incidents SET end_at = NOW(), duration_seconds = EXTRACT(EPOCH FROM (NOW()-started_at)) WHERE monitor_id = $1 AND ended_at IS NULL RETURNING duration_seconds`,
        [monitorId]
    );

    return res.rows.length ? res.rows[0].duration_seconds : null;
}

module.exports = { startIncident, endIncident };

const pool = require("../db");

async function getLastStatus(monitorId) {
    const res = await pool.query(
        `SELECT status FROM checks WHERE monitor_id=$1 ORDER BY checked_at DESC LIMIT 1`,
        [monitorId]
    );

    return res.rows.length ? res.rows[0].status : null;
}

module.exports = { getLastStatus };

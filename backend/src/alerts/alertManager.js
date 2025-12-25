const { sendEmail } = require("./email");
const { sendDiscord } = require("./discord");

async function alertDown(monitor, error) {
    const msg = `DOWN\n${monitor.url}\nError: ${error}\nTime: ${new Date()}`;

    try {
        await sendEmail(monitor.alert_email, `DOWN: ${monitor.url}`, msg);
    } catch (err) {
        console.error("Failed to send DOWN alert email:", err.message);
    }

    // await sendDiscord(msg);
}

async function alertUp(monitor, duration) {
    const msg = ` UP\n${
        monitor.url
    }\nDowntime: ${duration}s\nRecovered at: ${new Date()}`;

    try {
        await sendEmail(monitor.alert_email, `RECOVERED: ${monitor.url}`, msg);
    } catch (err) {
        console.error("Failed to send RECOVERED alert email:", err.message);
    }

    // await sendDiscord(msg);
}

module.exports = { alertDown, alertUp };

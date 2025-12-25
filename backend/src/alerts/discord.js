const axios = require("axios");

async function sendDiscord(message) {
    if (!process.env.DISCORD_WEBHOOK_URL) return;

    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        content: message,
    });
}

module.exports = { sendDiscord };

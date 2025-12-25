const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.ALERT_EMAIL_USER,
        pass: process.env.ALERT_EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Email transporter configuration error:", error);
        console.error(
            "Check your ALERT_EMAIL_USER and ALERT_EMAIL_PASS environment variables"
        );
    } else {
        console.log(" Email server is ready to send messages");
    }
});

async function sendEmail(to, subject, text) {
    if (!to) {
        console.error("Email error: No recipient address provided");
        return;
    }

    if (!process.env.ALERT_EMAIL_USER || !process.env.ALERT_EMAIL_PASS) {
        console.error(
            "Email error: ALERT_EMAIL_USER or ALERT_EMAIL_PASS not configured"
        );
        return;
    }

    try {
        console.log(` Sending email to ${to}: ${subject}`);

        const info = await transporter.sendMail({
            from: `"Uptime Monitor" <${process.env.ALERT_EMAIL_USER}>`,
            to,
            subject,
            text,
        });

        console.log("Email sent successfully:", info.messageId);
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Failed to send email:", error.message);
        console.error("Full error:", error);
        throw error; 
    }
}

module.exports = { sendEmail };

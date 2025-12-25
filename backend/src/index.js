require("./db");
const { startScheduler } = require("./jobs/scheduler");

console.log("Uptime Monitor started");
startScheduler();

const { App, ExpressReceiver } = require("@slack/bolt");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
  endpoints: "/api/slack/events", // endpoint to listen on
  signatureVerification: true, // security
});

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver,
  logLevel: "debug",
});

// Initialize Slack logic from slack.js
const initializeSlackApp = require("./slack");
initializeSlackApp(slackApp);

// Use ExpressReceiver's app to define basic route
const expressApp = expressReceiver.app;

expressApp.get("/", (req, res) => {
  res.send("Slack Bot is running!");
});

expressApp.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await slackApp.start();
});

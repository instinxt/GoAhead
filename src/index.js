const express = require("express");
const { App } = require("@slack/bolt");
const initializeSlackApp = require("./slack");
require("dotenv").config();

const expressApp = express();

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver: expressApp,
});

//initialize Slack logic from slack.js
initializeSlackApp(slackApp);

expressApp.post(
  "/api/slack/events",
  express.json(),
  slackApp.requestListener()
);

// Add a default route
expressApp.get("/", (req, res) => {
  res.send("Slack Bot is running!");
});

const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await slackApp.start();
});

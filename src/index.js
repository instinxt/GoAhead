const express = require("express");
const { App, ExpressReceiver } = require("@slack/bolt");
require("dotenv").config();

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver,
});

// Initialize Slack logic from slack.js
const initializeSlackApp = require("./slack");
initializeSlackApp(slackApp);

// Use ExpressReceiver's app to define custom routes
const expressApp = expressReceiver.app;

expressApp.get("/", (req, res) => {
  res.send("Slack Bot is running!");
});

expressApp.use(express.json());

expressApp.post("/api/slack/events", (req, res) =>
  expressReceiver.handleRequest(req, res)
);

const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await slackApp.start();
});

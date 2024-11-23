const { App, ExpressReceiver } = require("@slack/bolt");
require("dotenv").config();

const PORT = process.env.PORT || 3000; // Port for the server to listen on
const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET, // Used to verify Slack requests
  processBeforeResponse: true, // Ensure response is processed before sending
  endpoints: "/api/slack/events", // Slack events endpoint
  signatureVerification: true, // Enable signature verification for security
});

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN, // Slack bot token for authentication
  receiver: expressReceiver, // Set up Slack events receiver
  logLevel: "debug", // Enable debug-level logging for development
});

// Initialize Slack logic defined in slack.js
const initializeSlackApp = require("./slack");
initializeSlackApp(slackApp); // Initialize the Slack app functionality

// Use ExpressReceiver's app to define a basic route
const expressApp = expressReceiver.app;

expressApp.get("/", (req, res) => {
  res.send("Slack Bot is running!"); // Simple route to confirm server is working
});

expressApp.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`); // Log server status
  await slackApp.start(); // Start the Slack app to listen for events
});

module.exports = (slackApp) => {
  // Slash command listener for "/approval-test"
  slackApp.command("/approval-test", async ({ command, ack, client }) => {
    try {
      await ack(); // Acknowledge the command from the user

      await client.views.open({
        trigger_id: command.trigger_id, // Trigger for opening the modal
        view: {
          type: "modal", // Modal for input
          callback_id: "approval_modal", // Unique callback ID for the modal
          title: { type: "plain_text", text: "Request Approval" }, // Modal title
          blocks: [
            {
              type: "input", // Input for selecting an approver
              block_id: "approver_block",
              label: { type: "plain_text", text: "Select Approver" },
              element: {
                type: "users_select", // Dropdown for selecting a user
                action_id: "approver",
              },
            },
            {
              type: "input", // Input for the approval message
              block_id: "message_block",
              label: { type: "plain_text", text: "Approval Message" },
              element: {
                type: "plain_text_input", // Plain text input field for message
                action_id: "approval_message",
              },
            },
          ],
          submit: {
            type: "plain_text",
            text: "Submit", // Submit button text
          },
        },
      });
    } catch (error) {
      console.error("Error handling approval-test endpoint", error); // Log errors
    }
  });

  // View submission handler for approval modal
  slackApp.view("approval_modal", async ({ ack, body, view, client }) => {
    await ack(); // Acknowledge view submission

    const approver = view.state.values.approver_block.approver.selected_user; // Get selected approver
    const message = view.state.values.message_block.approval_message.value; // Get approval message
    const requester = body.user.id; // Get the requester's ID

    try {
      // Send approval request message to the selected approver
      await client.chat.postMessage({
        channel: approver,
        text: `Approval Request from <@${requester}>: ${message}`, // Message text
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Approval Request from <@${requester}>:* \n\n${message}`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button", // Approve button
                text: { type: "plain_text", text: "Approve" },
                style: "primary",
                action_id: "approve_request",
                value: JSON.stringify({ requester, message }), // Include metadata in button action
              },
              {
                type: "button", // Reject button
                text: { type: "plain_text", text: "Reject" },
                style: "danger",
                action_id: "reject_request",
                value: JSON.stringify({ requester, message }), // Include metadata in button action
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error(error); // Log any errors during message sending
    }
  });

  // Action handler for approval button click
  slackApp.action("approve_request", async ({ ack, body, client }) => {
    await ack(); // Acknowledge the action

    const approver = body.user.id; // The approver's user ID
    const { requester, message } = JSON.parse(body.actions[0].value); // Parse metadata

    // Notify the requester of approval
    await client.chat.postMessage({
      channel: requester,
      text: `Your approval request has been *approved* ✅ by <@${approver}>.\n\n*Original Message:* ${message}`,
    });

    // Update the approver's message
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts, // Timestamp of the message to update
      text: `You approved this request ✅ from <@${requester}>.\n\n*Original Message:* ${message}`,
      blocks: [], // Clear message blocks after approval
    });
  });

  // Action handler for reject button click
  slackApp.action("reject_request", async ({ ack, body, client }) => {
    await ack(); // Acknowledge the action

    const approver = body.user.id; // The rejecter's user ID
    const { requester, message } = JSON.parse(body.actions[0].value); // Parse metadata

    // Notify the requester of rejection
    await client.chat.postMessage({
      channel: requester,
      text: `Your approval request has been *rejected* ❌ by <@${approver}>.\n\n*Original Message:* ${message}`,
    });

    // Update the rejecter's message
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts, // Timestamp of the message to update
      text: `You rejected this request ❌ from <@${requester}>.\n\n*Original Message:* ${message}`,
      blocks: [], // Clear message blocks after rejection
    });
  });
};

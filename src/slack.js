// slack.js
module.exports = (slackApp) => {
  // Slash Command Listener
  slackApp.command("/approval-test", async ({ command, ack, client }) => {
    try {
      await ack();

      await client.views.open({
        trigger_id: command.trigger_id,
        view: {
          type: "modal",
          callback_id: "approval_modal",
          title: {
            type: "plain_text",
            text: "Request Approval",
          },
          blocks: [
            {
              type: "input",
              block_id: "approver_block",
              label: {
                type: "plain_text",
                text: "Select Approver",
              },
              element: {
                type: "users_select",
                action_id: "approver",
              },
            },
            {
              type: "input",
              block_id: "message_block",
              label: {
                type: "plain_text",
                text: "Approval Message",
              },
              element: {
                type: "plain_text_input",
                action_id: "approval_message",
              },
            },
          ],
          submit: {
            type: "plain_text",
            text: "Submit",
          },
        },
      });
    } catch (error) {
      console.error("Error handling approval-test endpoint", error);
    }
  });

  slackApp.view("approval_modal", async ({ ack, body, view, client }) => {
    await ack();

    const approver = view.state.values.approver_block.approver.selected_user;
    const message = view.state.values.message_block.approval_message.value;
    const requester = body.user.id;

    try {
      // Send approval request to the approver
      await client.chat.postMessage({
        channel: approver,
        text: `Approval Request from <@${requester}>: ${message}`,
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
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Approve",
                },
                style: "primary",
                action_id: "approve_request",
                value: JSON.stringify({ requester, message }), // Include metadata
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Reject",
                },
                style: "danger",
                action_id: "reject_request",
                value: JSON.stringify({ requester, message }), // Include metadata
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  });

  slackApp.action("approve_request", async ({ ack, body, client }) => {
    await ack();

    const approver = body.user.id; // The approver's user ID
    const { requester, message } = JSON.parse(body.actions[0].value);

    // Notify the requester
    await client.chat.postMessage({
      channel: requester,
      text: `Your approval request has been *approved* ✅ by <@${approver}>.\n\n*Original Message:* ${message}`,
    });

    // Update the approver's message
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts,
      text: `You approved this request ✅ from <@${requester}>.\n\n*Original Message:* ${message}`,
      blocks: [],
    });
  });

  slackApp.action("reject_request", async ({ ack, body, client }) => {
    await ack();

    const approver = body.user.id; // The rejecter's user ID
    const { requester, message } = JSON.parse(body.actions[0].value);

    // Notify the requester
    await client.chat.postMessage({
      channel: requester,
      text: `Your approval request has been *rejected* ❌ by <@${approver}>.\n\n*Original Message:* ${message}`,
    });

    // Update the rejecter's message
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts,
      text: `You rejected this request ❌ from <@${requester}>.\n\n*Original Message:* ${message}`,
      blocks: [],
    });
  });
};

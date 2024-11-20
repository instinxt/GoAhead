module.exports = (slackApp) => {
  // Slash Command Listener
  slackApp.command("/approval-test", async ({ command, ack, client }) => {
    await ack();

    try {
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
      console.error(error);
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
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Reject",
                },
                style: "danger",
                action_id: "reject_request",
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
    const requester = body.message.text.match(/<@(.*?)>/)[1];
    await client.chat.postMessage({
      channel: requester,
      text: "Your approval request has been *approved* ✅",
    });
  });

  slackApp.action("reject_request", async ({ ack, body, client }) => {
    await ack();
    const requester = body.message.text.match(/<@(.*?)>/)[1];
    await client.chat.postMessage({
      channel: requester,
      text: "Your approval request has been *rejected* ❌",
    });
  });
};

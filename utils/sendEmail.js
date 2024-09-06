const postmark = require("postmark");

const sendEmail = async (options) => {
  // Postmark client with server API token
  const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

  // Email message object
  const message = {
    From: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    To: options.email,
    TemplateId: options.TemplateId,
    TemplateModel: options.TemplateModel
  };

  // Send the email using Postmark
  try {
    const result = await client.sendEmailWithTemplate(message);
    console.log("Email sent: %s", result.MessageID);
  } catch (error) {
    console.error("Error sending email: %s", error.message);
  }
};

module.exports = sendEmail;

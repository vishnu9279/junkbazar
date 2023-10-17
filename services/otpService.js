const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOTP = async (to, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return false;
  }
};

module.exports = { sendOTP };

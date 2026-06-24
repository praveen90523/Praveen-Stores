const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendWelcomeEmail = async (email) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Praveen Stores 🎉",
        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to Praveen Stores!</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You will receive:</p>
        <ul>
          <li>New Product Updates</li>
          <li>Special Discounts</li>
          <li>Exclusive Offers</li>
        </ul>
        <p>Happy Shopping! 🛍️</p>
      </div>
    `,
    });
};

module.exports = { sendWelcomeEmail };
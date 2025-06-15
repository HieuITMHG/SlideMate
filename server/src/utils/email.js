// utils/email.js
const nodemailer = require("nodemailer");

// Configure Nodemailer transporter (e.g., using Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Function to send verification email
const sendVerificationEmail = async (email, username, otp) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/success-verify-email?token=${otp}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác nhận tài khoản SlideMate",
      html: `
        <h3>Xin chào, ${username}</h3>
        <p>Vui lòng nhấp vào liên kết dưới đây để xác nhận tài khoản của bạn:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #00809D; color: white; text-decoration: none; border-radius: 5px;">Xác nhận email</a>
        <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.</p>
        <p>SlideMate Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error.stack);
    throw new Error("Không thể gửi email xác nhận");
  }
};

const sendPasswordResetEmail = async (email, username, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Đặt lại mật khẩu SlideMate",
      html: `
        <h3>Xin chào, ${username}</h3>
        <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #00809D; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <p>SlideMate Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error.stack);
    throw new Error("Không thể gửi email đặt lại mật khẩu");
  }
};


module.exports = { sendVerificationEmail, sendPasswordResetEmail };
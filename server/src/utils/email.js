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

const sendPasswordResetEmail = async (email, username, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác thực đặt lại mật khẩu - SlideMate",
      html: `
        <h3>Xin chào, ${username}</h3>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Mã xác thực của bạn là:</p>
        <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">${otp}</div>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>SlideMate Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP reset code sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error.stack);
    throw new Error("Không thể gửi mã xác thực qua email");
  }
};


module.exports = { sendVerificationEmail, sendPasswordResetEmail };
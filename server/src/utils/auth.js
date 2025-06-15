const jwt = require("jsonwebtoken");

const generateTokens = (userId) => ({
  accessToken: jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: "1h" }),
  refreshToken: jwt.sign({ user: { id: userId } }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" }),
});

// Thiết lập cookies
const setTokensCookie = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 3600000 }); // 1 hour
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 604800000 }); // 7 days
};

module.exports = { generateTokens, setTokensCookie };
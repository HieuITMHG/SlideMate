const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");

const userRoutes = require('./src/routes/user');
const materialRoutes = require('./src/routes/material');
const connectDB = require('./src/db/connectDB.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost",
  "http://localhost:5173",
  "http://127.0.0.1:3000", 
];

app.use(
  "/materials",
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
  express.static(path.join(__dirname, "public/materials"))
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

connectDB();
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
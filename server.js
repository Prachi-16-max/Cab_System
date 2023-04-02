const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();
const port = 3000;
const senderEmail = "prachiagarwal20202024@gmail.com";
const senderPassword = "zhifpmetlgpcmhiz";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  cors({
    methods: "*",
    origin: ["http://127.0.0.1:5500,http://localhost:5500"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/sendMail", (req, res) => {
  const data = req.body.data;
  const mailOptions = {
    from: senderEmail,
    to: data.email,
    subject: "Cab Booking By Prachi",
    text: `You have booked a cab from ${data.src} to ${data.destination} for Rs ${data.cost}. Name: ${data.name}, Email: ${data.email}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Error sending email!" });
    } else {
      console.log("Email sent: " + info.response);
      return res.json({ message: "Mail Sent!" });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

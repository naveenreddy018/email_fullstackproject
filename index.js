const express = require("express");
const app = express();
require("dotenv").config();
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs"); // For file system operations
const connection = require("./mysql.js");
const otp = require("./otp.js")
const sendotp = otp()

var nodemailer = require("nodemailer");


// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "naveenreddy310744@gmail.com",
    pass: "njcq qnsa lyxz uyod",
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  }
});


// Multer Configuration for multipart/form-data
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = __dirname + "/folder";
    // Ensure folder exists or create it
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// POST Route - Registration
app.post("/register", upload.single("file"), async (req, res) => {
  try {
    console.log("Request Received");

    if (Object.keys(req.body).length === 0) {
      return res.status(400).send("Request body is required");
    }

    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).send({ error: "Username, password, and email are required" });
    }

    if (!req.file) {
      return res.status(400).send({ error: "File upload is required" });
    }

    var hashedPassword = await bcrypt.hash(password, 10);

    //user details 

    const user = {
      username: username,
      password: hashedPassword,
      email: email,
      profilepic: req.file.filename,
    };






    connection.query(
      "INSERT INTO userdetails (username, password, email, profilepic) VALUES (?, ?, ?, ?)",
      [user.username, user.password, user.email, user.profilepic],
      (err, results) => {
        if (err) {
          console.log("Error occurred:", err);
          return res.status(500).send({ error: "Failed to add user" });
        }
        console.log("Data added successfully:", results);

        // Sending email with OTP
        var mailOptions = {
          from: "naveenreddy310744@gmail.com",
          to: "21d45ao305@gmail.com",
          subject: "Sending Email using Node.js",
          text: sendotp.toString(), // OTP message
          attachments: [
              {
                  filename: req.file.originalname,
                  path: req.file.path // Path to the uploaded file
              }
          ]
      };
      

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        res.status(200).send({
          message: "Registration successful",
          user,
        });
      }
    );
  } catch (err) {
    res.status(500).send({ error: "Internal server error occurred" });
  }
});



app.post("/login", async (req, res) => {




  var user = {
    useremail: req.body.email,
    password: req.body.password
  }
  console.log(user)


  connection.query("select email,password from userdetails where email = ? ", [user.useremail], async (err, results) => {
    console.log(results)

    if (err) {
      res.send({
        error: err.message
      })
    } else {
      let result = results[0]
      console.log(result)
      const isMatch = await bcrypt.compare(user.password, result.password);
      if (isMatch) {
        res.send({
          message: "succesfull login",
          results,

        })
      } else {
        res.send({
          message: "enter currect details"
        })
      }

    }

  })


})



// Handle Undefined Routes
app.use((req, res) => {
  res.status(404).send({ error: "Route not found!" });
});

// Port Configuration
port = 3007;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});



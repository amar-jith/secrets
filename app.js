const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://amarjithm112:amarjith112@cluster0.kmkajpo.mongodb.net/?appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });


const trySchema = new mongoose.Schema({
  email: String,
  password: String,
  secret: String,
});


const secret = "thisislittlesecret.";
trySchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });


const TryModel = mongoose.model("second", trySchema);


app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const newUser = new TryModel({
      email: req.body.username,
      password: req.body.password, 
    });

    await newUser.save(); 
    const allSecrets = await TryModel.find({ secret: { $ne: null } });
    res.render("secrets", { secrets: allSecrets });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error registering user.");
  }
});


app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.render("home");
});

app.get("/submit", (req, res) => {
  res.render("submit");
});

app.post("/submit", async (req, res) => {
  try {
    const submittedSecret = req.body.secret;
    const userEmail = req.body.username;
    const userPassword = req.body.password;
    const user = await TryModel.findOne({ username: userEmail,password:userPassword });
    if (user) {
      user.secret = submittedSecret; // Save the secret
      await user.save();
      res.redirect("/secrets");
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error submitting secret.");
  }
});

app.get("/secrets", async (req, res) => {
  try {
    const allSecrets = await TryModel.find({ secret: { $ne: null } });
    console.log("Fetched secrets: ", allSecrets);
    res.render("secrets", { secrets: allSecrets });
  } catch (err) {
    console.error("Error fetching secrets:", err);
    res.status(500).send("Error retrieving secrets.");
  }
});

app.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const userFound = await TryModel.findOne({ email: username });

    if (userFound) {
      if (userFound.password === password) {
        const allSecrets = await TryModel.find({ secret: { $ne: null } }); // Fetch all secrets
        res.render("secrets", { secrets: allSecrets }); // Pass secrets to EJS
      } else {
        console.log("Incorrect password");
        alert("Incorrect Password");
      }
    } else {
      console.log("User not found");
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});


const port = 5000;
app.listen(port, () => {
  console.log("Server started on port " + port);
});

import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto"; // from googling i learnt of nodes inbuilt crypto method to generate UUID
import bcrypt from "bcrypt"; // package for encryption/decryption
import jsonwebtoken from "jsonwebtoken";

const userRouter = express.Router();
userRouter.use(express.json());
userRouter.use(express.urlencoded({ extended: true }));
import { mainConnect } from "../db/connections.js";
let db, usersCollection;
(async () => {
  db = await mainConnect();
  usersCollection = db.collection("users");
  console.log("users collection established");
})();

//I need one route for creating a user, and a route for logging in, or now, May add a route to delete account

//getting errors regarding collection, due to async nature

userRouter.get("/", (req, res) => {
  res.send("Heya");
});

userRouter.post("/login", async (req, res) => {
  let { username } = req.body;
  console.log(req.body.name);

  let user = await usersCollection.findOne({ username });

  console.log(req.body.password);
  if (!user) {
    return res.status(400).json({ message: "There is no such user" });
  }
  console.log(user.password);
  console.log(user.password);
  let passMatch = await checkPassword(req.body.password, user.password);
  if (passMatch) {
    res.status(200).json({ message: "Hey there, you exist", user });
    console.log("user has logged in");
    console.log(user, "a user");
  } else {
    res.status(404).json({ message: "Invalid passowrd", user });
  }
  //  else if (user.password !== req.body.password) {
  //   res.json({ message: "Something went wrong" });
  //   console.log("smth went wrong");
  // }
});

//Creating account
userRouter.post("/", async (req, res) => {
  let { username } = req.body;
  console.log(username);
  let user = await usersCollection.findOne({ username });
  console.log(user, "should be null");
  if (user) {
    return res
      .status(400)
      .json({ message: "Username already exists", something: username });
  }

  try {
    let hashedPass = await hashPassword(req.body.password);
    console.log(hashedPass);
    let newUser = await usersCollection.insertOne({
      _id: crypto.randomUUID(),
      username: req.body.username,
      password: hashedPass,
    });
    let user = await usersCollection.findOne({ username });
    res.status(201).json({ newUser, user });
    console.log("user has been created");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const saltRounds = 10; //The higher the saltRounds value, the more time the hashing algorithm takes

//function to hash a pawwsord using bcryupt
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function checkPassword(password, hashedPassword) {
  const ifMatch = await bcrypt.compare(password, hashedPassword);
  return ifMatch;
}

function generateJWT(user) {
  const userData = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(userData, "Will change for .env", { expiresIn: "2h" });

  return token;
}

export default userRouter;

// let usersCollection;
// let accountsCollection;

// May implement this middleware later
// Middleware to check database connection
// app.use(async (req, res, next) => {
//   if (!usersCollection) {
//     usersCollection = await mainConnect("users");
//   }
//   if (!accountsCollection) {
//     accountsCollection = await mainConnect("accounts");
//   }

//   if (!usersCollection || !accountsCollection) {
//     res.status(500).json({ error: 'Database connection error' });
//   } else {
//     next();
//   }
// });

import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto"; // from googling i learnt of nodes inbuilt crypto method to generate UUID
import bcrypt from "bcrypt"; // package for encryption/decryption
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userRouter = express.Router();
userRouter.use(express.json());
userRouter.use(express.urlencoded({ extended: true }));
import { mainConnect } from "../db/connections.js";
import { error } from "console";
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
  let user;
  try {
    user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "There is no such user" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }

  let passMatch = await checkPassword(req.body.password, user.password);
  if (passMatch) {
    const accessJWT = generateAccessToken(user._id);
    const refreshJWT = generateRefreshToken(user._id);
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { refreshToken: refreshJWT } }
    );
    res.status(200).json({
      message: "Login successful!",
      aJWT: accessJWT,
      rJWT: refreshJWT,
      username: user.username,
      _id: user._id,
    });
  } else {
    res.status(404).json({ message: "Invalid passowrd", user });
  }
});

//Creating user
userRouter.post("/", async (req, res) => {
  let { username } = req.body;
  let user = await usersCollection.findOne({ username });
  if (user) {
    return res
      .status(400)
      .json({ message: "Username already exists", something: username });
  }

  try {
    let hashedPass = await hashPassword(req.body.password);
    let newUser = await usersCollection.insertOne({
      _id: crypto.randomUUID(),
      username: req.body.username,
      password: hashedPass,
    });
    let user = await usersCollection.findOne({ username });
    res.status(201).json({ message: "User successfully created" });
    console.log("user has been created");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const saltRounds = 10; //The higher the saltRounds value, the more time the hashing algorithm takes

//function to hash a pawwsord using bcryupt
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(saltRounds);
  console.log(salt, " This is salt");
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function checkPassword(password, hashedPassword) {
  const ifMatch = await bcrypt.compare(password, hashedPassword);
  return ifMatch;
}

//_______________________

// Function to generate access token
function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

// Function to generate refreshh token
function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET);
}

// Function to validate token
function verifyAccessToken(req, res, next) {
  const authHead = req.headers.auth;
  if (authHead) {
    const token = authHead.split(" ")[1];
    try {
      const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.userId = user.userId;
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid access token" });
    }
  } else {
    return res.status(401).json({ message: "No access token provided" });
  }
}

export async function verifyRefreshToken(req, res, next) {
  const authHead = req.headers.auth;
  if (authHead) {
    const token = authHead.split(" ")[1];
    try {
      const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

      try {
        let rToken = await usersCollection.findOne({ refreshToken: token });
        if (!rToken) {
          return res
            .status(403)
            .json({ message: "Invalid / Refresh token not found" });
        }
      } catch (dberr) {
        return res.status(500).json({ message: "Internal server error" });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  } else {
    return res.status(401).json({ message: "No access token provided" });
  }
}

userRouter.get("/token", verifyRefreshToken, (req, res) => {
  const JWT = generateAccessToken(req.user);
  res.json({ aJWT: JWT });
});

// Will be route for logging out
userRouter.get("users/logout", (req, res) => {});

export default userRouter;

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

import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto"; // from googling i learnt of nodes inbuilt crypto method to generate UUID

const userRouter = express.Router();
userRouter.use(express.json());
userRouter.use(express.urlencoded({ extended: true }));
import { mainConnect } from "../db/connections.js";
let db, usersCollection;
(async () => {
  db = await mainConnect();
  usersCollection = db.collection("users");
  console.log("collection established");
})();

//I need one route for creating a user, and a route for logging in, or now, May add a route to delete account

//getting errors regarding collection, due to async nature

userRouter.get("/", (req, res) => {
  res.send("Heya");
});

userRouter.post("/login", async (req, res) => {
  let { name } = req.body;
  console.log(req.body.name);

  let user = await usersCollection.findOne({ name });

  console.log(req.body.password);
  if (!user) {
    return res.status(400).json({ message: "There is no such user" });
  }
  console.log(user.password);

  if (user.password === req.body.password) {
    res.status(200).json({ message: "Hey there, you exist", user });
    console.log("user has logged in");
    console.log(user, "a user");
  }
  //  else if (user.password !== req.body.password) {
  //   res.json({ message: "Something went wrong" });
  //   console.log("smth went wrong");
  // }
});

userRouter.post("/", async (req, res) => {
  let { name } = req.body;
  console.log(name, " Not object");
  console.log({ name }, " Object");
  let user = await usersCollection.findOne({ name });
  if (user) {
    return res.status(400).json({ message: "Username already exists" });
  }

  try {
    let newUser = await usersCollection.insertOne({
      _id: crypto.randomUUID(),
      name: req.body.name,
      password: req.body.password,
    });
    res.status(201).json(newUser);
    console.log("user has been created");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

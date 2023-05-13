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
    res.status(201).json(newUser );
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

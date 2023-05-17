import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../middleware/tokens.js";

const accountRouter = express.Router();
accountRouter.use(express.json());
accountRouter.use(express.urlencoded({ extended: true }));
import { mainConnect } from "../db/connections.js";
let db, accountsCollection;
(async () => {
  db = await mainConnect();
  accountsCollection = db.collection("accounts");
  console.log("account collection established");
})();

accountRouter.get("/" /* ... */); // get all accounts

accountRouter.post("/", async (req, res) => {
  // create account
  try {
    let newAccount = await accountsCollection.insertOne({
      _id: crypto.randomUUID(),
      accountname: req.body.accountname,
      balance: req.body.balance,
      userID: req.body.userID,
    });

    res.status(201).json(newAccount);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

accountRouter.get("/:id", verifyAccessToken, async (req, res) => {
  console.log(req.params.id);
  let userID = req.params.id;
  console.log(userID);
  const accounts = await accountsCollection.find({ userID }).toArray();

  //   console.log(accounts);
  res.status(200).json(accounts);
}); // get a specific account

accountRouter.patch("/:id" /* ... */); //update a specific account

accountRouter.delete("/:id", (req, res) => {
  let _id = req.params.id;
  try {
    const deleted = accountsCollection.deleteOne({ _id });
    res.status(200).json({ message: "deleted " });
  } catch (err) {
    res.status(500).json({ message: err });
  }
}); // delete a specific account

export default accountRouter;

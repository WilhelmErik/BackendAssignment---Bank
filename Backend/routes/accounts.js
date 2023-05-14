import crypto from "crypto";
import express from "express";
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

accountRouter.get("/:id", async (req, res) => {
  console.log(req.params.id);
  let userID = req.params.id;
  console.log(userID);
  const accounts = await accountsCollection.find({ userID }).toArray();

  //   console.log(accounts);
  res.status(200).json(accounts);
}); // get a specific account

accountRouter.patch("/:id" /* ... */); //update a specific account
accountRouter.delete("/:id" /* ... */); // delete a specific account

export default accountRouter;

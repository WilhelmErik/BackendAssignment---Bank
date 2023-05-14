import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import crypto from "crypto"; // from googling i learnt of nodes inbuilt crypto method to generate UUID
// const crypto = crypto();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
const port = 3000;

import userRouter from "./routes/users.js";
import accountRouter from "./routes/accounts.js";
app.use("/users", userRouter);
app.use("/accounts", accountRouter);

app.listen(port, () => {
  console.log(crypto.randomUUID());
  console.log(crypto.randomInt(1000, 10000));
});

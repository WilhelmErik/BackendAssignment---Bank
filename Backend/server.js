import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
const app  = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
const port = 3000;


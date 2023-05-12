import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

// To connect to the main database
export async function mainConnect() {
  //   console.log("im being called");
  const client = new MongoClient(process.env.DATABASE_URL);
  try {
    client.on("error", (error) => console.log(error));
    client.once("open", () => console.log("connected to database"));
    await client.connect();
    //need to change which database and/or collection i connect to

    //The database name of my choice
    const db = client.db("registry");

    // The collection of choice, will contain both users and bank details, or seperate them into different collections
    const userCollection = db.collection("members");
    const accountCollection = db.collection("accounts");

    // Will return the collection connection, which can be used by relevant controllers
    return memberCollection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// collection structure
//account
// {
//    accountNumber: 
//    accountName:
//    balance:
//    userID (reference):
// }

//user
// {
//    _id: user id 
//    username: name
//    password (hashed):
// }



// Accounts Collection:
// - _id  
// - name
// - balance
// - userId (reference to Users _id)

// Users Collection:
// - _id
// - username
// - password (hashed)



//import
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
//app config
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
  appId: "1461128",
  key: "3a638ffc0a4c1fc6da12",
  secret: "15dc18f2ee11a26b32f8",
  cluster: "ap2",
  useTLS: true,
});
//middleware
app.use(express.json());
app.use(cors());
//DB config
const connection_url =
  "mongodb+srv://admin:E048MgjL5EdTDwoU@cluster0.blclwit.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//real time
const db = mongoose.connection;
db.once("open", () => {
  console.log("DB connected");

  const msgCollection = db.collection("messagecontents");

  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const msgDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: msgDetails.name,
        message: msgDetails.message,
        timestamp: msgDetails.timestamp,
      });
    } else {
      console.log("Error Triggering pusher");
    }
  });
});
//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

// <---------Sync----------->
app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
// <---------Message create----------->
app.post("/messages/new", (req, res) => {
  Messages.create(req.body, (err, data) => {
    if (err) {
      req.status(500).send(err);
    } else {
      res.status(201).send(`new message created: \n ${data}`);
    }
  });
});
//listen

app.listen(port, () => console.log(`Listening on localhost:${port}`));

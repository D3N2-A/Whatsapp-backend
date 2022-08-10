//import
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
//app config
const app = express();
const port = process.env.PORT || 9000;
//middleware
app.use(express.json());
//DB config
const connection_url =
  "mongodb+srv://admin:E048MgjL5EdTDwoU@cluster0.blclwit.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//real time

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

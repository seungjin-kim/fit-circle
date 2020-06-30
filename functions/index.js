const functions = require("firebase-functions");

// const admin = require('firebase-admin');
// admin.initializeApp();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fitcircle-97015.firebaseio.com",
});

const express = require('express');
const app = express();

const user = require("./config.js");
const firebase = require('firebase');
firebase.initializeApp(user.firebaseConfig);



app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});


// Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  // TODO: validate data

  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      console.log("data here", data);
      return res.status(201).json({ message: `user ${data.user.uid} signed up successfully`});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});


exports.api = functions.https.onRequest(app);

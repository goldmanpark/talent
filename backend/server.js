const express = require('express');
const Firestore = require('@google-cloud/firestore');
const {spawn} = require('child_process');
const port = process.env.PORT || 8080;

const app = express();

const db = new Firestore({
  projectId: 'talent-309713',
  keyFilename: 'talent-309713-7edc75ac40df.json',
});
const tickers = await db.collection('yfTicker').get();
tickers.forEach((doc) => {
  console.log(doc.id, '=>', doc.data());
});

app.use(express.json());
app.use("/home", require("./router/yfDirectRouter"));
app.use(errorHandler);
app.use(clientErrorHandler);

app.get("/home", (req, res) => {
  res.json(tickers);
  console.log("Initial request from React-app");
  
  let pyTest = spawn('python', ['pymodule/test.py']);
  pyTest.stdout.on('data', (data) => {
    console.log(data.toString());
  });
});

app.listen(port, () => console.log("Backend server lives on " + port));

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: err.toString() });
  } else {
    next(err);
  }
}
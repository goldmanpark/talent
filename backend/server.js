const express = require('express');
const fs = require('fs');
const Firestore = require('@google-cloud/firestore');
const {spawn} = require('child_process');
const port = process.env.PORT || 8080;

const app = express();
const tickers = JSON.parse(fs.readFileSync('tickers.json', 'utf8'));

app.use(express.json());
app.use("/home", require("./router/yfDirectRouter"));
app.use(errorHandler);
app.use(clientErrorHandler);

app.get("/home", (req, res) => {
  res.json(tickers);
  console.log("Initial call from React-app");
  
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
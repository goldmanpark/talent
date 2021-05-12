const express = require('express');
const fs = require('fs');
const Firestore = require('@google-cloud/firestore');
const { PythonShell } = require("python-shell");
const port = process.env.PORT || 8080;

const app = express();
const tickers = JSON.parse(fs.readFileSync('tickers.json', 'utf8'));

app.use(express.json());
app.use("/history", require("./router/yfDirectRouter"));
app.use("/statistics", require("./router/yfDirectRouter"));
app.listen(port, () => console.log("Backend server lives on " + port));

app.get("/home", (req, res) => {
  res.json(tickers);
  console.log(tickers);
});
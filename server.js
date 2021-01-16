const express = require('express');
const cors = require('cors');
const fs = require('fs');
const port = process.env.PORT || 3001;
//const router = express.Router();
//const spawn = require('child_process');

const app = express();
//const pyProc = spawn('python', ['../src/core.py']);
const tickers = fs.readFileSync('./jsonData/tickers.json', 'utf8');

app.use(cors());
app.listen(port, () => console.log("Backend server live on " + port));

app.get("/dashboard", (req, res) => {
  res.send(tickers);
});
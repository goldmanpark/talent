const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { PythonShell } = require("python-shell");
const port = process.env.PORT || 3001;

const app = express();
//const pyProc = spawn('python', ['../src/core.py']);
const tickers = JSON.parse(fs.readFileSync('./jsonData/tickers.json', 'utf8'));

app.use(cors());
app.use(express.json());
app.listen(port, () => console.log("Backend server lives on " + port));

app.get("/", (req, res) => {
  res.send(tickers);
});

app.get("/dashboard", (req, res) => {
  try {
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var symbol = req.body.ticker;
    fs.readFile('./jsonData/info/' + symbol + '.json', 'utf8', (err1, infoJson) => {
      if (err1)
        throws;
      fs.readFile('./jsonData/history/' + symbol + '.json', 'utf8', (err2, histJson) => {
        if (err2)
          throws;
        res.send({
          'symbol': symbol,
          'shortName': JSON.parse(infoJson).shortName,
          'data': jsonHistoryTransfer(JSON.parse(histJson), startDate, endDate)
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
});

function jsonHistoryTransfer(histJson, startDate, endDate) {
  var tempJson = [];
  histJson.data.map(item => {
    if(item.Date >= startDate, item.Date <= endDate){
      tempJson.push({ // Send json as ApexChart can read
        x : item.Date,
        y : [item.Open, item.High, item.Low, item.Close]
      });
    }
  });
  return tempJson;
}
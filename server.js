const express = require('express');
const fs = require('fs');
const { PythonShell } = require("python-shell");
const port = process.env.PORT || 3001;

const app = express();
const tickers = JSON.parse(fs.readFileSync('./rawData/tickers.json', 'utf8'));

app.use(express.json());
app.listen(port, () => console.log("Backend server lives on " + port));

app.get("/home", (req, res) => {
  res.json(tickers);
});

app.get("/history/:ticker", (req, res) => {
  try {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var symbol = req.query.ticker;
    fs.readFile('./rawData/history/' + symbol + '.json', 'utf8', (err, histJson) => {
      if (err)
        throw err;
      res.json({
        'symbol': symbol,
        'data': jsonHistoryTransfer(JSON.parse(histJson), startDate, endDate)
      });
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/statistics/:ticker", (req, res) => {
  try {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var symbol = req.query.ticker;
    fs.readFile('./rawData/statistics/' + symbol + '.json', 'utf8', (err, statJson) => {
      if (err)
        throw err;
      res.json({
        'symbol': symbol,
        'data': jsonHistoryTransfer(JSON.parse(statJson), startDate, endDate)
      });
    });
  } catch (error) {
    console.log(error);
  }
});

function jsonHistoryTransfer(histJson, startDate, endDate) {
  var tempJson = [];
  histJson.data.forEach(item => {
    if(new Date(item.Date) > new Date(startDate) && new Date(item.Date) < new Date(endDate)){
      tempJson.push({ // Send json as ApexChart can read
        x : item.Date,
        y : [item.Open.toFixed(2), item.High.toFixed(2), item.Low.toFixed(2), item.Close.toFixed(2)]
      });
    }
  });
  return tempJson;
}
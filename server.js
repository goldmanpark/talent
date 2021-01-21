const express = require('express');
const fs = require('fs');
const { PythonShell } = require("python-shell");
const port = process.env.PORT || 3001;

const app = express();
const tickers = JSON.parse(fs.readFileSync('./jsonData/tickers.json', 'utf8'));

app.use(express.json());
app.listen(port, () => console.log("Backend server lives on " + port));

app.get("/dashboard", (req, res) => {
  res.json(tickers);
});

app.get("/dashboard/:ticker", (req, res) => {
  try {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var ticker = req.query.ticker;
    fs.readFile('./jsonData/info/' + ticker + '.json', 'utf8', (err1, infoJson) => {
      if (err1)
        throws;
      fs.readFile('./jsonData/history/' + ticker + '.json', 'utf8', (err2, histJson) => {
        if (err2)
          throws;
        res.json({
          'symbol': ticker,
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
  histJson.data.forEach(item => {
    if(new Date(item.Date) > new Date(startDate) && new Date(item.Date) < new Date(endDate)){
      tempJson.push({ // Send json as ApexChart can read
        x : item.Date,
        y : [item.Open, item.High, item.Low, item.Close]
      });
    }
  });
  return tempJson;
}
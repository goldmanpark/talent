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
    // var startDate = req.query.startDate;
    // var endDate = req.query.endDate;
    // var symbol = req.query.ticker;
    // fs.readFile('./rawData/history/' + symbol + '.json', 'utf8', (err, histJson) => {
    //   if (err)
    //     throw err;
    //   res.json({
    //     'symbol': symbol,
    //     'data': jsonHistoryTransfer(JSON.parse(histJson), startDate, endDate)
    //   });
    // });
    let option = {
      scriptPath: "pymodule",
      args: ["-u", "-hist", req.query.ticker, req.query.startDate, req.query.endDate]
    }
    PythonShell.run("yf_only.py", option, function(err, pyRes){
      if(err)
        throw err;
      res.json({
        'symbol': req.query.ticker,
        'data': jsonHistoryTransfer(JSON.parse(histJson), startDate, endDate)
      });
    });
  } catch (error) {
    console.log(error.name);
     console.log(error.message);
  }
});

app.get("/statistics/:ticker", (req, res) => {
  try {
    // var startDate = req.query.startDate;
    // var endDate = req.query.endDate;
    // var symbol = req.query.ticker;
    // fs.readFile('./rawData/statistics/' + symbol + '.json', 'utf8', (err, statJson) => {
    //   if (err)
    //     throw err;
    //   res.json({
    //     'symbol': symbol,
    //     'data': jsonStatisticsTransfer(JSON.parse(statJson), startDate, endDate)
    //   });
    // });
  } catch (error) {
    console.log(error.name);
    console.log(error.message);
  }
});

function jsonHistoryTransfer(histJson, startDate, endDate) {
  var tempJson = [];
  histJson.data.forEach(item => {
    if(new Date(item.Date) > new Date(startDate) && new Date(item.Date) < new Date(endDate)){
      tempJson.push({ // Send json as ApexChart can read
        x : item.Date,
        y : [item.Open.toFixed(4), item.High.toFixed(4), item.Low.toFixed(4), item.Close.toFixed(4)]
      });
    }
  });
  return tempJson;
}

function jsonStatisticsTransfer(statJson, startDate, endDate) {
  var tempJson = [];
  statJson.data.forEach(item => {
    if(new Date(item.Date) > new Date(startDate) && new Date(item.Date) < new Date(endDate)){
      tempJson.push({ // Send json as ApexChart can read
        x : item.Date,
        y : [item.RateOfChange != null ? item.RateOfChange.toFixed(4) : null]
      });
    }
  });
  return tempJson;
}
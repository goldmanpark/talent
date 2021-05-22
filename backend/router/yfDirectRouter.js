const express = require("express");
const router = express.Router();
const {spawn} = require('child_process');

/****************** yfinance direct router ******************/

router.get("/history", (req, res) => {
  try {
    console.log("Call from react-app : " + req.query.ticker);
    let pyProc = spawn('python', ['pymodule/yf_only.py', "-u", "-hist", req.query.ticker, req.query.startDate, req.query.endDate]);
    pyProc.stdout.on('data', (pyRes) => {
      res.json({
        'symbol': req.query.ticker,
        'data': getHistoryJsonData(JSON.parse(pyRes))
      });
    });
  } catch (error) {
    console.log(error.name);
    console.log(error.message);
  }
});

router.get("/statistics", (req, res) => {
  try {
    console.log("Call from react-app : " + req.query.ticker);
    let pyProc = spawn('python', ['pymodule/yf_only.py', "-u", "-stat", req.query.ticker, req.query.startDate, req.query.endDate]);
    pyProc.stdout.on('data', (pyRes) => {
      res.json({
        'symbol': req.query.ticker,
        'data': getStatisticsJsonData(JSON.parse(pyRes))
      });
    });
  } catch (error) {
    console.log(error.name);
    console.log(error.message);
  }
});

function getHistoryJsonData(histJson) {
  return histJson.data.map(item => { return {
    x : item.Date,
    y : [item.Open.toFixed(4), item.High.toFixed(4), item.Low.toFixed(4), item.Close.toFixed(4)]
  }});
}

function getStatisticsJsonData(statJson) {
  return statJson.data.map(item => { return {
    x : item.Date,
    y : [item.RateOfChange != null ? item.RateOfChange.toFixed(4) : null]
  }});
}

module.exports = router;
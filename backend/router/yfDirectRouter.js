const express = require("express");
const router = express.Router();

/****************** yfinance direct router ******************/

router.get("home/history/:ticker", (req, res) => {
  try {
    console.log("Call from react-app : " + req.query.ticker);
    let option = {
      scriptPath: "pymodule",
      args: ["-u", "-hist", req.query.ticker, req.query.startDate, req.query.endDate]
    }
    PythonShell.run("yf_only.py", option, function(err, pyRes){
      if(err)
        throw err;
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

router.get("home/statistics/:ticker", (req, res) => {
  try {
    console.log("Call from react-app : " + req.query.ticker);
    let option = {
      scriptPath: "pymodule",
      args: ["-u", "-stat", req.query.ticker, req.query.startDate, req.query.endDate]
    }
    PythonShell.run("yf_only.py", option, function(err, pyRes){
      if(err)
        throw err;
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
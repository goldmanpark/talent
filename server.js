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

app.post("/dashboard", (req, res) => {
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  var sendData = [];
  tickers["tickerNames"].map(item => {
    try {
      fs.readFile('./jsonData/info/' + item.name + '.json', 'utf8', (err1, infoJson) => {
        if (err1)
          throws;
        fs.readFile('./jsonData/history/' + item.name + '.json', 'utf8', (err2, histJson) => {
          if (err2)
            throws;
          sendData.push({
            'symbol': item.name,
            'shortName': JSON.parse(infoJson).shortName,
            'data': jsonHistoryTransfer(JSON.parse(histJson), startDate, endDate)
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
  });
  res.send(sendData); 
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
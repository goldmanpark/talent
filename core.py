import sys
import yfinance as yf
import json
import os
from datetime import datetime

tickers = []
jsonPath = os.getcwd() + "/jsonData"
infoPath = jsonPath + "/info"
histPath = jsonPath + "/history"
startDate = ''
endDate = ''

try:
    startDate = sys.argv[1]
    endDate = sys.argv[2]
    startDateTime = datetime.strptime(startDate, "%Y-%m-%d")
    endDateTime = datetime.strptime(endDate, "%Y-%m-%d")
except Exception as e:
    print("argv datetime exception : " + e)
    sys.exit(0)

try:
    with open(os.path.join(jsonPath, "tickers.json"), "r") as jsonFile:
        tickers = json.load(jsonFile)

    for x in tickers["tickerNames"]:
        ticker = yf.Ticker(x["name"])
        with open(os.path.join(infoPath, x["name"] + ".json"), "w") as jsonFile:
            json.dump(ticker.info, jsonFile, indent=4)

        hist = ticker.history(start=startDate, end=endDate, interval="1d")
        histJson = json.loads(hist.to_json(orient="table"))
        with open(os.path.join(histPath, x["name"] + ".json"), "w") as jsonFile:
            json.dump(histJson, jsonFile, indent=4)
except Exception as e:
    print("yfinance or json exception : " + e)
    sys.exit(0)

print("finished!")
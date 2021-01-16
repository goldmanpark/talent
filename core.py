import yfinance as yf
import json
import os

tickers = []
jsonPath = os.getcwd() + "/jsonData"
infoPath = jsonPath + "/info"
histPath = jsonPath + "/history"
with open(os.path.join(jsonPath, "tickers.json"), "r") as jsonFile:
    tickers = json.load(jsonFile)

for x in tickers["tickerNames"]:
    ticker = yf.Ticker(x["name"])    
    with open(os.path.join(infoPath, x["name"] + ".json"), "w") as jsonFile:
        json.dump(ticker.info, jsonFile, indent=4)

    hist = ticker.history(start="2021-01-01", end="2021-01-08", interval="1d")
    histJson = json.loads(hist.to_json(orient="table"))
    with open(os.path.join(histPath, x["name"] + ".json"), "w") as jsonFile:
        json.dump(histJson, jsonFile, indent=4)
import yfinance as yf
import json
import os

tickers = []
with open(os.path.join(os.getcwd(), "tickers.json"), "r") as jsonFile:
    tickers = json.load(jsonFile)

for x in tickers["tickerName"]:
    ticker = yf.Ticker(x["name"])    
    with open(os.path.join("info", x["name"] + ".json"), "w") as jsonFile:
        json.dump(ticker.info, jsonFile, indent=4)

    hist = ticker.history(start="2021-01-01", end="2021-01-08", interval="1d")
    histJson = json.loads(hist.to_json(orient="table"))
    with open(os.path.join("history", x["name"] + ".json"), "w") as jsonFile:
        json.dump(histJson, jsonFile, indent=4)
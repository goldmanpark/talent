import yfinance as yf
import json
import os

tickers = ["^VIX", "^VXN", "DX-Y.NYB", "^IXIC", "^DJI", "^SPX"]

for x in tickers:
    ticker = yf.Ticker(x)    
    with open(os.path.join("info", x + ".json"), "w") as jsonFile:
        json.dump(ticker.info, jsonFile, indent=4)

    hist = ticker.history(start="2021-01-01", end="2021-01-08", interval="1d")
    histJson = json.loads(hist.to_json(orient="table"))
    with open(os.path.join("history", x + ".json"), "w") as jsonFile:
        json.dump(histJson, jsonFile, indent=4)
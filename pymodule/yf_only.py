import sys
import os
import json
from datetime import datetime, timedelta
import yfinance as yf
import pandas as pd

#yfModule only uses yfinance module

############################ GLOBAL AREA ############################
tickers = []
jsonPath = os.getcwd() + "/rawData"
statPath = jsonPath + "/statistics"
histPath = jsonPath + "/history"

############################ METHOD AREA ############################
def validateDateArgv(startDate, endDate):
    try:    # validation
        datetime.strptime(startDate, "%Y-%m-%d")
        datetime.strptime(endDate, "%Y-%m-%d")
    except ValueError:
        print("argv datetime error")
        sys.exit(0)

def updateTickersJson():
    with open(os.path.join(jsonPath, "tickers.json"), "r") as jsonFile:
        tickers = json.load(jsonFile)
    for key in tickers:             # dictionary type
        for item in tickers[key]:   # list type
            ticker = yf.Ticker(item["symbol"])
            item["shortName"] = ticker.info["shortName"]
            item["quoteType"] = ticker.info["quoteType"]
            item["market"] = ticker.info["market"]

    with open(os.path.join(jsonPath, "tickers.json"), "w") as jsonFile:
            json.dump(tickers, jsonFile, indent=4)

############################ MAIN AREA ############################
'''
    COMMAND LIST as sys.argv
    for admin(-a), call from console
    -a -ticker : update tickers.json

    for user(-u), call from server
    -u -hist @ticker @startDate @endDate : get history of specific ticker as date range
    -u -stat @ticker @startDate @endDate : get statistics of specific ticker as date range
'''
if len(sys.argv) == 1:
    print("argv error")
    sys.exit(0)

if sys.argv[1] == "-a":
    if sys.argv[2] == "-ticker":
        updateTickersJson()

elif sys.argv[1] == "-u":
    validateDateArgv(sys.argv[4], sys.argv[5])

    if sys.argv[2] == "-hist":
        ticker = yf.Ticker(sys.argv[3])
        print(ticker.history(start=sys.argv[4], end=sys.argv[5], interval="1d").to_json(orient="table"))

    elif sys.argv[2] == "-stat":
        ticker = yf.Ticker(sys.argv[3])
        df = ticker.history(start=sys.argv[4], end=sys.argv[5], interval="1d")
        df["RateOfChange"] = df["Close"].pct_change().values
        del df["Open"]    #CLose, Date only
        del df["High"]
        del df["Low"]
        del df["Dividends"]
        del df["Stock Splits"]
        del df["Volume"]
        print(df.to_json(orient="table"))

else:
    print("error")
    sys.exit(0)
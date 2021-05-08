import sys
import os
import json
from datetime import datetime, timedelta
import yfinance as yf
import pandas as pd

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

def compareStringDate(dt1, dt2):
    # return -1 : date1 > date2
    # return 0 : date1 == date2
    # return 1 : date1 < date2
    date1 = datetime.strptime(dt1, "%Y-%m-%d")
    date2 = datetime.strptime(dt2, "%Y-%m-%d")
    if date1 == date2:
        return 0
    if date1 > date2:
        return -1
    if date1 < date2:
        return 1

def calcStringDate(strDate, day, opt):
    dt = datetime.strptime(strDate, "%Y-%m-%d")
    if opt == 'add':
        dt = dt + timedelta(days=day)
    elif opt == 'sub':
        dt = dt - timedelta(days=day)
    else:
        print("opt error : " + opt)
    return dt.strftime("%Y-%m-%d")

def getStoredHistoryAsDataFrame(tickerSymbol):
    try:
        return pd.read_json(os.path.join(histPath, tickerSymbol + ".json"), orient="table")
    except ValueError:
        return None
    except Exception as e:
        print("json open exception : " + e)
        sys.exit(0)

def traverseTickersJson(func, startDate=None, endDate=None):
    with open(os.path.join(jsonPath, "tickers.json"), "r") as jsonFile:
            tickers = json.load(jsonFile)
    for key in tickers:             # dictionary type
        for item in tickers[key]:   # list type
            func(item["symbol"], startDate, endDate)

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

def storeHistoryData(tickerSymbol, startDate, endDate):
    try:
        ticker = yf.Ticker(tickerSymbol)
        oldHist = getStoredHistoryAsDataFrame(tickerSymbol)

        if oldHist is None:
            df = ticker.history(start=startDate, end=endDate, interval="1d")
            df.to_json(os.path.join(histPath, tickerSymbol + ".json"), orient="table", indent=4)
        
        else:
            oldStartDate = oldHist["Date"].min()
            oldEndDate = oldHist["Date"].max()
            storeFlag = False
            newHist = {}

            if compareStringDate(startDate, oldStartDate) == 1:
                storeFlag = True
                df = ticker.history(start=startDate, end=oldStartDate, interval="1d")
                newHist = pd.concat(oldHist, df)

            if compareStringDate(oldEndDate, endDate) == 1:
                storeFlag = True
                df = ticker.history(start=oldEndDate, end=endDate, interval="1d")
                newHist = pd.concat(oldHist, df)

            if storeFlag == True:
                newHist.drop_duplicates(["Date"], inplace=True)
                newHist.to_json(os.path.join(histPath, tickerSymbol + ".json"), orient="table", indent=4)
    except Exception as e:
        print(e)
        sys.exit(0)

def storeRateOfChangeData(tickerSymbol, startDate, endDate):
    try:
        hist = getStoredHistoryAsDataFrame(tickerSymbol)
        if hist is None:
            raise Exception("No record of ticker")
        else:
            df = hist.loc[startDate : endDate]  #using DateTimeIndex
            df["RateOfChange"] = df["Close"].pct_change().values
            del df["Open"]    #CLose, Date only
            del df["High"]
            del df["Low"]
            del df["Dividends"]
            del df["Stock Splits"]
            del df["Volume"]            
            df.to_json(os.path.join(statPath, tickerSymbol + ".json"), orient="table", indent=4)
            
    except Exception as e:
        print(e)
        sys.exit(0)

############################ MAIN AREA ############################
'''
    COMMAND LIST as sys.argv
    for admin(-a), call from console
    -a -ticker                   : update tickers.json
    -a -hist @startDate @endDate : update history of tickers.json as date range
    -a -stat @startDate @endDate : update statistics of tickers.json as date range

    for user(-u), call from server
    -u -hist @ticker @startDate @endDate : update history of specific ticker as date range
    -u -stat @ticker @startDate @endDate : update statistics of specific ticker as date range
'''
if len(sys.argv) == 1:
    print("argv error")
    sys.exit(0)

if sys.argv[1] == "-a":
    if sys.argv[2] == "-ticker":
        updateTickersJson()
    elif sys.argv[2] == "-hist":
        validateDateArgv(sys.argv[3], sys.argv[4])
        traverseTickersJson(storeHistoryData, sys.argv[3], sys.argv[4])
    elif sys.argv[2] == "-stat":
        validateDateArgv(sys.argv[3], sys.argv[4])
        traverseTickersJson(storeRateOfChangeData, sys.argv[3], sys.argv[4])
elif sys.argv[1] == "-u":
    validateDateArgv(sys.argv[4], sys.argv[5])
    if sys.argv[2] == "-hist":
        storeHistoryData(sys.argv[3], sys.argv[4], sys.argv[5])
    elif sys.argv[2] == "-stat":
        storeRateOfChangeData(sys.argv[3], sys.argv[4], sys.argv[5])

else:
    print("argv error")
    sys.exit(0)

print("finished!")
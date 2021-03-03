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

def getStoredHistoryData(tickerSymbol):
    try:
        with open(os.path.join(histPath, tickerSymbol + ".json"), "r") as oldJsonFile:
            return json.load(oldJsonFile)
    except FileNotFoundError:
        return None
    except Exception as e:
        print("json open exception : " + e)
        sys.exit(0)

def getStoredHistoryAsDataFrame(tickerSymbol):
    try:
        hist = pd.read_json(os.path.join(histPath, tickerSymbol + ".json"), orient="table")
        del hist["Open"]    #CLose, Date only
        del hist["High"]
        del hist["Low"]
        del hist["Dividends"]
        del hist["Stock Splits"]
        del hist["Volume"]
        return hist
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

def storeSingleDataOfTicker(tickerSymbol, newStartDate, newEndDate):
    '''
        ---- history data store rule ----
        1. load stored history data
        2. compare stored startDate, endDate with argv[1], argv[2]
        3. if there is blank between argv and already stored date,
            run ticker.history to fill blank range
            ex) argv[1] is before stored startDate, 
                run ticker.history, ranging from argv[1] to stored startDate
        4. json stored data should have no blank(except for holiday)
    '''
    try:
        ticker = yf.Ticker(tickerSymbol)
        oldHistJson = getStoredHistoryData(tickerSymbol)

        # create new history json
        if oldHistJson is None:
            hist = ticker.history(start=newStartDate, end=newEndDate, interval="1d")
            histJson = json.loads(hist.to_json(orient="table"))
            histJson["schema"]["startDate"] = newStartDate
            histJson["schema"]["endDate"] = newEndDate
            with open(os.path.join(histPath, tickerSymbol + ".json"), "w") as jsonFile:
                json.dump(histJson, jsonFile, indent=4)
        
        # modify old history json or do nothing
        else:
            oldStartDate = oldHistJson["schema"]["startDate"]
            oldEndDate = oldHistJson["schema"]["endDate"]
            storeFlag = False

            if compareStringDate(newStartDate, oldStartDate) == 1:
                storeFlag = True
                hist = ticker.history(start=newStartDate, end=calcStringDate(oldStartDate, 1, 'sub'), interval="1d")
                histJson = json.loads(hist.to_json(orient="table"))
                oldHistJson["data"] = histJson["data"] + oldHistJson["data"]
                oldHistJson["schema"]["startDate"] = newStartDate
            if compareStringDate(oldEndDate, newEndDate) == 1:
                storeFlag = True
                hist = ticker.history(start=oldEndDate, end=calcStringDate(newEndDate, 1, 'add'), interval="1d")
                histJson = json.loads(hist.to_json(orient="table"))
                oldHistJson["data"] = oldHistJson["data"] + histJson["data"]
                oldHistJson["schema"]["endDate"] = newEndDate

            if storeFlag == True:
                with open(os.path.join(histPath, tickerSymbol + ".json"), "w") as jsonFile:
                    json.dump(oldHistJson, jsonFile, indent=4)

    except Exception as e:
        print("yfinance or json exception : " + e)
        sys.exit(0)

def storeRateOfChangeData(tickerSymbol, startDate, endDate):
    try:
        hist = getStoredHistoryAsDataFrame(tickerSymbol)
        if hist is None:
            raise Exception("No record of ticker")
        else:
            df = hist.loc[startDate : endDate]  #using DateTimeIndex
            df["RateOfChange"] = df["Close"].pct_change().values            
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
        traverseTickersJson(storeSingleDataOfTicker, sys.argv[3], sys.argv[4])
    elif sys.argv[2] == "-stat":
        validateDateArgv(sys.argv[3], sys.argv[4])
        traverseTickersJson(storeRateOfChangeData, sys.argv[3], sys.argv[4])
elif sys.argv[1] == "-u":
    validateDateArgv(sys.argv[4], sys.argv[5])
    if sys.argv[2] == "-hist":
        storeSingleDataOfTicker(sys.argv[3], sys.argv[4], sys.argv[5])
    elif sys.argv[2] == "-stat":
        storeRateOfChangeData(sys.argv[3], sys.argv[4], sys.argv[5])

else:
    print("argv error")
    sys.exit(0)

print("finished!")
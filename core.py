import sys
import os
import json
from datetime import datetime, timedelta
import yfinance as yf

############ GLOBAL AREA ############
tickers = []
jsonPath = os.getcwd() + "/rawData"
statPath = jsonPath + "/statistics"
histPath = jsonPath + "/history"

############ METHOD AREA ############
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
            oldHistJson = json.load(oldJsonFile)
            return oldHistJson
    except FileNotFoundError as e:
        return None
    except Exception as e:
        print("json open exception : " + e)
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

def storeSingleDataOfTicker(newStartDate, newEndDate, tickerSymbol):
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

def storeRateOfChangeData(startDate, endDate, tickerSymbol):
    try:
        hist = getStoredHistoryData(tickerSymbol)
        if hist is None:
            raise Exception("No record of ticker")
    except Exception as e:
        print(e)
        sys.exit(0)

############ MAIN AREA ############
if len(sys.argv) == 1:  # refresh ticker list
    updateTickersJson()
else:
    try:    # validation
        datetime.strptime(sys.argv[1], "%Y-%m-%d")
        datetime.strptime(sys.argv[2], "%Y-%m-%d")
    except ValueError:
        print("argv datetime error")
        sys.exit(0)

    if len(sys.argv) == 3:      # update all ticker history
        with open(os.path.join(jsonPath, "tickers.json"), "r") as jsonFile:
            tickers = json.load(jsonFile)
        for key in tickers:             # dictionary type
            for item in tickers[key]:   # list type
                storeSingleDataOfTicker(sys.argv[1], sys.argv[2], item["symbol"])

    elif len(sys.argv) == 4:    # update specific ticker history
        storeSingleDataOfTicker(sys.argv[1], sys.argv[2], sys.argv[3])

    elif len(sys.argv) == 5 and sys.argv[4] == "stat":    # update specific ticker's statistics
        storeRateOfChangeData(sys.argv[1], sys.argv[2], sys.argv[3])
        
    else:
        print("argv error")
        sys.exit(0)

print("finished!")
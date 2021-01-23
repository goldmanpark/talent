import sys
import yfinance as yf
import json
import os
from datetime import datetime

tickers = []
jsonPath = os.getcwd() + "/rawData"
infoPath = jsonPath + "/info"
histPath = jsonPath + "/history"
newStartDate = ''
newEndDate = ''

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

def getStoredHistoryData(name):
    try:
        with open(os.path.join(histPath, name + ".json"), "r") as oldJsonFile:
            oldHistJson = json.load(oldJsonFile)
            return oldHistJson
    except FileNotFoundError as e:
        return None
    except Exception as e:
        print("json open exception : " + e)
        sys.exit(0)

try:
    newStartDate = sys.argv[1]
    newEndDate = sys.argv[2]
except Exception as e:
    print("argv datetime exception : " + e)
    sys.exit(0)

try:
    # 1. Get tickers
    with open(os.path.join(jsonPath, "tickers.json"), "r") as jsonFile:
        tickers = json.load(jsonFile)

    for x in tickers["tickerNames"]:
        ticker = yf.Ticker(x["name"])
        with open(os.path.join(infoPath, x["name"] + ".json"), "w") as jsonFile:
            json.dump(ticker.info, jsonFile, indent=4)

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

        oldHistJson = getStoredHistoryData(x["name"])

        # create new history json
        if oldHistJson is None:
            hist = ticker.history(start=newStartDate, end=newEndDate, interval="1d")
            histJson = json.loads(hist.to_json(orient="table"))
            histJson["schema"]["startDate"] = newStartDate
            histJson["schema"]["endDate"] = newEndDate
            with open(os.path.join(histPath, x["name"] + ".json"), "w") as jsonFile:
                json.dump(histJson, jsonFile, indent=4)
        
        # modify old history json or do nothing
        else:
            oldStartDate = oldHistJson["schema"]["startDate"]
            oldEndDate = oldHistJson["schema"]["endDate"]
            storeFlag = False

            if compareStringDate(newStartDate, oldStartDate) == 1:
                storeFlag = True
                hist = ticker.history(start=newStartDate, end=oldStartDate, interval="1d")
                histJson = json.loads(hist.to_json(orient="table"))
                oldHistJson["data"] = histJson["data"] + oldHistJson["data"]
                oldHistJson["schema"]["startDate"] = newStartDate
            if compareStringDate(oldEndDate, newEndDate) == 1:
                storeFlag = True
                hist = ticker.history(start=oldEndDate, end=newEndDate, interval="1d")
                histJson = json.loads(hist.to_json(orient="table"))
                oldHistJson["data"] = oldHistJson["data"] + histJson["data"]
                oldHistJson["schema"]["endDate"] = newEndDate

            if storeFlag == True:
                with open(os.path.join(histPath, x["name"] + ".json"), "w") as jsonFile:
                    json.dump(oldHistJson, jsonFile, indent=4)

except Exception as e:
    print("yfinance or json exception : " + e)
    sys.exit(0)

print("finished!")
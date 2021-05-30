import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { Navbar, NavDropdown, Button, ButtonGroup } from 'react-bootstrap';
import { multiOption, syncOption, emptySeries } from '../chartTemplate/chartOptions.json'

/*
  basic form
  selectedTickerList : [{symbol, shortName}]
  statisticsData : [{symbol, shorName, data}]
*/

// using Hook
export default function CompareCharts(props){
  var today = dayjs();
  var ago = dayjs(today).subtract(1, 'month');
  const [selectedTickerList, selectTickers] = useState([]);
  const [startDate, changeStartDate] = useState(ago.toISOString().substr(0,10));
  const [endDate, changeEndDate] = useState(today.toISOString().substr(0,10));
  const [statisticsData, changeStatData] = useState([]);
  const [historyData, changeHistData] = useState([]);

  multiOption.xaxis.labels.formatter = function(x){ return dayjs(x).format('YY-MM-DD') };
  syncOption.xaxis.labels.formatter = function(x){ return dayjs(x).format('YY-MM-DD') };
  const maxTickers = 3;
  const statRoute = "/home/statistics";
  const histRoute = "/home/history";

  // When ticker selection changed
  useEffect(() => {
    // remove 
    changeStatData(statisticsData.filter(x => 
      selectedTickerList.find(y => y.symbol === x.symbol)
    ));
    changeHistData(historyData.filter(x => 
      selectedTickerList.find(y => y.symbol === x.symbol)
    ));
    
    // add
    selectedTickerList.forEach(async x => {
      try{
        if(!statisticsData.find(y => y.symbol === x.symbol)){
          let temp = await getJsonData(statRoute, x.symbol);
          if(temp !== null && temp !== undefined)
            changeStatData([...statisticsData, temp]);
        }
        if(!historyData.find(y => y.symbol === x.symbol)){
          let temp = await getJsonData(histRoute, x.symbol);
          if(temp !== null && temp !== undefined)
            changeHistData([...historyData, temp]);
        }
      }
      catch(error){
        console.log(x.symbol + ' : ' + error.name);
        console.log(error.message);
      }
    });        
  }, [selectedTickerList]);
  
  // When DateTime range Changed
  useEffect(() => {
    const asyncFunc = async () => {
      let tempStat = [];
      let tempHist = [];
      for await (let x of selectedTickerList){
        let temp1 = await getJsonData(statRoute, x.symbol);
        if(temp1 !== null && temp1 !== undefined)
          tempStat.push(temp1);
        let temp2 = await getJsonData(histRoute, x.symbol);
        if(temp2 !== null && temp2 !== undefined)
          tempHist.push(temp2);
      }
      changeStatData(tempStat);
      changeHistData(tempHist);
    }
    asyncFunc();    
  }, [startDate, endDate]);
  
  /******************** EVENT HANDLER ********************/
  const onAddButton = (value) => {
    if(selectedTickerList.length === maxTickers)
      return;
    for(var menu in props.tickers){
      var item = props.tickers[menu].find(x => x.symbol === value);
      if(item !== undefined && !selectedTickerList.includes(item)){
        selectTickers([...selectedTickerList, item]);
        break;
      }
    }
  }

  const onRemoveButton = (value) => {
    selectTickers(selectedTickerList.filter(x => x.symbol !== value));
  }

  const onChangeStartDate = (event) =>{
    if(dayjs(endDate).diff(event.target.value, 'day') < 0)
      alert("date error");
    else
      changeStartDate(event.target.value);
  }

  const onChangeEndDate = (event) =>{
    if(dayjs(event.target.value).diff(startDate, 'day') < 0)
      alert("date error");
    else
      changeEndDate(event.target.value); 
  }

  /******************** HTML ELEMENT ********************/
  const createDropdowns = () => {
    var dropdowns = [];
    for(var key in props.tickers){
      var item = props.tickers[key];
      if(Array.isArray(item)){
        var dropdown = 
          <NavDropdown key={key} title={key} onSelect={onAddButton}>
            { item.map(x => { return <NavDropdown.Item key={x.symbol} eventKey={x.symbol}>{x.shortName}</NavDropdown.Item>}) }
          </NavDropdown>
        dropdowns.push(dropdown);
      }      
    }
    return dropdowns;
  }
  
  const createButtons = () => {
    if(selectedTickerList.length !== 0){
      return selectedTickerList.map(x => {
        return (
          <ButtonGroup key={x.symbol} className="tickerButton">
            <Button>
              <strong className="mr-auto">{ x.shortName }</strong>
            </Button>
            <Button onClick={() => onRemoveButton(x.symbol)}>
              <strong className="mr-auto">X</strong>
            </Button>
          </ButtonGroup>)
      });
    }
  }

  const createMultiChart = () => {
    try{
      if(statisticsData.length === 0)
        return <Chart options={multiOption} series={emptySeries}/>
      else     
        return <Chart options={multiOption} series={statisticsData}/>
    }
    catch(error){
      console.log(error.name);
      console.log(error.message);
    }
  }

  const createSyncChart = () => {
    try{
      if(historyData.length === 0)
        return <Chart options={syncOption} series={emptySeries}/>
      else{
        return historyData.map(x => {
          syncOption.title.text = x.shortName;
          return <Chart key={x.symbol} options={syncOption} series={[{data: x.data}]} 
                  type="candlestick" height="230"/>
        });
      }
    }
    catch(error){
      console.log(error.name);
      console.log(error.message);
    }
  }

  /******************** REST METHOD ********************/
  const getJsonData = async (_route, _ticker) => {
    if(!_route || !_ticker)
      return null;
    return await axios.get(_route, {
      params : {
        startDate : startDate,
        endDate : endDate,
        ticker : _ticker
      }
    }).then((res) => {
      return {
        symbol : res.data.symbol,
        shortName : selectedTickerList.find(x => x.symbol === _ticker).shortName,
        data : res.data.data
      };
    }).catch(error => {
      console.log(error.name);
      console.log(error.message);
      return null;
    });
  }

  /******************** JSX RENDER ********************/
  return (
    <div className="app_body">
      <Navbar className="contents_header" bg="dark" variant="dark">
        <form className="form-inline">
          <input type="date" className="form-control m-sm-1 p-1" value={startDate} 
                 onChange={ onChangeStartDate }/>
          <span className="navbar-text mx-2"> ~ </span>
          <input type="date" className="form-control m-sm-1 p-1" value={endDate} 
                 onChange={ onChangeEndDate }/>
        </form>
        
        { createDropdowns() }
      </Navbar>
      <div className="contents_body">
        <div className="d-flex justify-content-center">
          { createButtons() }
        </div>
        <div className="row">
          <div className="col-md-7 col-xs-12">
            { createMultiChart() }
          </div>
          <div className="col-md-5 col-xs-12 d-flex flex-column">
            { createSyncChart() }
          </div>
        </div>        
      </div>
    </div>
  )
}
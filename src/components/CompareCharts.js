import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { Navbar, NavDropdown, Button, ButtonGroup } from 'react-bootstrap';
import { compareOption, emptySeries } from '../chartTemplate/chartOptions.json'

// using Hook
export default function CompareCharts(props){
  var today = dayjs();
  var ago = dayjs(today).subtract(1, 'month');
  const [selectedTickerList, selectTickers] = useState([]);
  const [startDate, changeStartDate] = useState(ago.toISOString().substr(0,10));
  const [endDate, changeEndDate] = useState(today.toISOString().substr(0,10));
  const [historyData, changeHistoryData] = useState([]);

  compareOption.xaxis.labels.formatter = function(x){ return dayjs(x).format('YY-MM-DD') }
  //const colorArr = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"];

  useEffect(() => {
    // remove 
    changeHistoryData(historyData.filter(x => 
      selectedTickerList.find(y => y.symbol === x.symbol)
    ));

    // add
    selectedTickerList.forEach(x => {
      if(!historyData.find(y => y.symbol === x.symbol)){
        getJsonData(x.symbol);
      }
    }); // eslint-disable-next-line
  }, [selectedTickerList]);
  
  useEffect(() => {
    selectedTickerList.forEach(x => {
      getJsonData(x.symbol);
    }); // eslint-disable-next-line
  }, [startDate, endDate]);
  
  /******************** EVENT HANDLER ********************/
  const onAddToast = (value) => {
    if(selectedTickerList.length === 5)
      return;
    for(var menu in props.tickers){
      var item = props.tickers[menu].find(x => x.symbol === value);
      if(item !== undefined && !selectedTickerList.includes(item)){
        selectTickers([...selectedTickerList, item]);
        break;
      }
    }
  }

  const onRemoveToast = (value) => {
    selectTickers(selectedTickerList.filter(x => x.symbol !== value));
  }

  /******************** HTML ELEMENT ********************/
  const createDropdowns = () => {
    var dropdowns = [];
    for(var key in props.tickers){
      var item = props.tickers[key];
      var dropdown = 
        <NavDropdown key={key} title={key} onSelect={onAddToast}>
          { item.map(x => { return <NavDropdown.Item eventKey={x.symbol}>{x.shortName}</NavDropdown.Item>}) }
        </NavDropdown>
      dropdowns.push(dropdown);
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
            <Button onClick={() => onRemoveToast(x.symbol)}>
              <strong className="mr-auto">X</strong>
            </Button>
          </ButtonGroup>)
      });
    }
  }

  const createChart = () => {
    if(historyData.length === 0)
      return <Chart options={compareOption} series={emptySeries}/>
    else     
      return <Chart options={compareOption} series={historyData}/>
  }

  const getJsonData = async (_ticker) => {
    if(!_ticker)
      return;
    await axios.get('/statistics/' + _ticker, {
      params : {
        startDate : startDate,
        endDate : endDate,
        ticker : _ticker
      }
    }).then(res => {
      if(historyData.find(x => x.symbol === res.data.symbol)){
        changeHistoryData(historyData.map(x => x.symbol === res.data.symbol ? 
        {
          symbol : res.data.symbol,
          name : selectedTickerList.find(x => x.symbol === _ticker).shortName,
          data : res.data.data
        } : x));
      }
      else{
        changeHistoryData([...historyData, {
          symbol : res.data.symbol,
          name : selectedTickerList.find(x => x.symbol === _ticker).shortName,
          data : res.data.data
        }]);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  return (
    <div className="app_body">
      <Navbar className="contents_header" bg="dark" variant="dark">
        <form className="form-inline">
          <input type="date" className="form-control m-sm-1 p-1" value={startDate} 
                 onChange={(event) => {changeStartDate(event.target.value)}}/>
          <span className="navbar-text mx-2"> ~ </span>
          <input type="date" className="form-control m-sm-1 p-1" value={endDate} 
                 onChange={(event) => {changeEndDate(event.target.value)}}/>
        </form>
        
        { createDropdowns() }
      </Navbar>
      <div className="contents_body row">
        <div class="col-md-2 col-xs-12 d-flex flex-column align-items-start">
          { createButtons() }
        </div>
        <div class="col-md-8 col-xs-12">
          { createChart() }
        </div>
      </div>
    </div>
  )
}
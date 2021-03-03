import React, { useState } from 'react';
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
  const [historyData, changeHistoryData] = useState([]);
  const [startDate, changeStartDate] = useState(ago.toISOString().substr(0,10));
  const [endDate, changeEndDate] = useState(today.toISOString().substr(0,10));

  compareOption.xaxis.labels.formatter = function(x){ return dayjs(x).format('YY-MM-DD') }
  //const colorArr = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"];
 
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

  const onAddToast = (value) => {
    if(selectedTickerList.length === 5)
      return;
    for(var menu in props.tickers){
      var item = props.tickers[menu].find(x => x.symbol === value);
      if(item !== undefined && !selectedTickerList.includes(item)){
        selectTickers([...selectedTickerList, item]);
        getJsonData(value, startDate, endDate)
        break;
      }
    }
  }

  const onRemoveToast = (value) => {
    selectTickers(selectedTickerList.filter(x => x.symbol !== value));
    changeHistoryData(historyData.filter(x => x.symbol !== value))
  }

  const getJsonData = async (_ticker, _startDate, _endDate) => {
    if(!_ticker)
      return;
    await axios.get('/statistics/' + _ticker, {
      params : {
        startDate : _startDate,
        endDate : _endDate,
        ticker : _ticker
      }
    }).then(res => {
      changeHistoryData([...historyData, {
        symbol : res.data.symbol,
        data : res.data.data
      }]);
    }).catch(error => {
      console.log(error);
    });
  }

  const createChart = () => {
    if(historyData.length === 0){ 
      return <Chart options={compareOption} series={emptySeries}/>
    }
    else{
      
      return <Chart options={compareOption} series={historyData}/>
    }
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
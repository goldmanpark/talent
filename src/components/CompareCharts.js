import React, { useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { Navbar, NavDropdown, Button, ButtonGroup } from 'react-bootstrap';
import { compareOption, emptySeries } from '../chartTemplate/chartOptions.json'

// using Hook
export default function CompareCharts(props){
  const [selectedTickerList, selectTickers] = useState([]);
  const [historyData, changHistoryData] = useState([]);
  const colorArr = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"];
 
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
        getJsonData(value, '2021-01-01', '2021-02-01')
        break;
      }
    }
  }

  const onRemoveToast = (value) => {
    selectTickers(selectedTickerList.filter(x => x.symbol !== value));
    changHistoryData(historyData.filter(x => x.symbol !== value))
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
      changHistoryData([...historyData, {
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
      compareOption.xaxis.labels.formatter = function(x){ return dayjs(x).format('YY-MM-DD') }
      return <Chart options={compareOption} series={historyData}/>
    }
  }

  return (
    <div className="app_body">
      <Navbar className="contents_header" bg="dark" exapnd="xl" variant="dark">
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
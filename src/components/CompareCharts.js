import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { Navbar, NavDropdown, Toast } from 'react-bootstrap';
import { option, emptyOption, emptySeries } from '../chartTemplate/chartOptions.json'

// using Hook
// ISSUE : WTF is x[0]?
export default function CompareCharts(props){
  const [selectedTickerList, selectTickers] = useState([]);
  const [historyItems, getHistoryItem] = useState([]);
 
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

  const createToasts = () => {
    if(selectedTickerList.length !== 0){
      return selectedTickerList.map(x => {
        return (
          <Toast key={x.symbol} onClose={() => onRemoveToast(x.symbol)}>
            <Toast.Header>
              <strong className="mr-auto">{ x.shortName }</strong>
            </Toast.Header>
          </Toast>)
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
        break;
      }
    }
  }

  const onRemoveToast = (value) => {
    selectTickers(selectedTickerList.filter(x => x.symbol !== value));
  }

  const createChart = () => {
    if(historyItems.length === 0){
      let _option = emptyOption;
      let _series = emptySeries;
      return <Chart className="compareChart" options={_option} series={_series}/>
    }
    else{
      
    }
  }

  return (
    <div>
      <Navbar className="contents_header" bg="dark" exapnd="xl" variant="dark">
        { createDropdowns() }
      </Navbar>
      <div className="square-FlexGrid">
        { createChart() }
      </div>
      <div className="contents_footer">
        { createToasts() }
      </div>
    </div>    
  )
}
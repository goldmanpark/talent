import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { Navbar, NavDropdown, Toast } from 'react-bootstrap';
import { option, emptyOption, emptySeries } from '../chartTemplate/chartOptions.json'

// using Hook
export default function CompareCharts(props){
  const [selectedTickers, selectTickers] = useState([]);
  const [historyItems, getHistoryItem] = useState([]);
 
  const createDropdowns = () => {
    var dropdowns = [];
    for(var key in props.tickers){
      var item = props.tickers[key];
      var dropdown = 
        <NavDropdown key={key} title={key} onSelect={onAdd}>
          { item.map(x => { return <NavDropdown.Item eventKey={x.symbol}>{x.shortName}</NavDropdown.Item>}) }
        </NavDropdown>
      dropdowns.push(dropdown);
    }
    return dropdowns;
  }

  const onAdd = (value) => {
    selectTickers(selectTickers => [...selectTickers, value]);
  }

  const createChart = () => {
    if(historyItems.length === 0){
      let _option = emptyOption;
      let _series = emptySeries;
      return <Chart className="square-FlexGrid" option={_option} series={_series}
                    type="line"/>
    }
    else{
      
    }
  }

  const createToasts = () => {
    if(selectedTickers.length !== 0){
      return selectedTickers.map(x => {
        return (
          <Toast.Header key={x.symbol}>
            <strong>{ x }</strong>
          </Toast.Header>
        )
      });
    }
  }

  

  return (
    <div>
      <Navbar bg="dark" exapnd="xl" variant="dark" sticky="top" fixed="top">
        { createDropdowns() }
      </Navbar>
      <div>
        {/* { createChart() } */}
      </div>
      <div>
        { createToasts() }
      </div>
    </div>    
  )
}
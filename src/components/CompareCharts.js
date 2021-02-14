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
        <NavDropdown key={key} title={key} onSelect={onAdd}>
          { item.map(x => { return <NavDropdown.Item eventKey={[key, x.symbol]}>{x.shortName}</NavDropdown.Item>}) }
        </NavDropdown>
      dropdowns.push(dropdown);
    }
    return dropdowns;
  }

  const onAdd = (value) => {
    let valueArr = value.split(",");
    selectTickers([...selectedTickerList, props.tickers[valueArr[0]].filter(x => x.symbol === valueArr[1])]);
  }

  const onRemove = (value) => {
    selectTickers(selectedTickerList.filter(x => x[0].symbol !== value));
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
    if(selectedTickerList.length !== 0){
      return selectedTickerList.map(x => {
        return (
          <Toast key={x[0].symbol} onClose={() => onRemove(x[0].symbol)}>
            <Toast.Header>
              <strong className="mr-auto">{ x[0].shortName }</strong>
            </Toast.Header>
          </Toast>
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
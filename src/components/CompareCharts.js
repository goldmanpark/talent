import React, { useState } from 'react';
import { ChartItem } from './ChartItem';
import { Navbar, NavDropdown } from 'react-bootstrap';
import { option as candleStickOption } from '../chartTemplate/candleStickOption.json'

// using Hook
export default function CompareCharts(props){
  const [selectedTickers, selectTickers] = useState([]);

  const createDropdowns = () =>{
    var dropdowns = [];
    for(var key in props.tickers){
      var item = props.tickers[key];
      var dropdown = 
        <NavDropdown title={key}>
          { createDropdownItems(item) }
        </NavDropdown>
      dropdowns.push(dropdown);
    }
    return dropdowns;
  }

  const createDropdownItems = (items) =>
    items.map(x => { return <NavDropdown.Item eventKey={x.symbol}>{x.symbol}</NavDropdown.Item>})

  return (
    <div>
      <Navbar bg="dark" exapnd="lg" variant="dark" sticky="top" fixed="top">
        { createDropdowns() }
      </Navbar>
      <div>
        { /*Chart*/ }
      </div>
      <div>
        { /*tag cloud of selectedTickers*/ }
      </div>
    </div>    
  )
}
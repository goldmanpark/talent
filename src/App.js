import React, { Component } from 'react';
import tickerJson from './jsonData/tickers.json'
import { CandleStickChart } from './CandleStickChart';

export default class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      tickers : tickerJson["tickerNames"]
    }
  }

  createCandlecharts = () =>
    this.state.tickers.map(item => <CandleStickChart key={item.name}/> );
  
  render(){
    return (
      <div>
        <h4 className="bg-primary text-white text-center p-1">
          Talent
        </h4>
        <table>
          <thead>
            <tr>
              <th>ITEMS</th>
            </tr>
          </thead>
          <tbody>{ this.createCandlecharts() }</tbody>
        </table>
      </div>
    )
  }
}
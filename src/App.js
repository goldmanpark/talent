import React, { Component } from 'react';
import tickerJson from './jsonData/tickers.json'
import Chart from './Chart';

export default class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      tickers : tickerJson["tickerNames"]
    }
  }

  createCandlecharts = () => {
    try {
      this.state.tickers.forEach(x => {
        var option = {
          chart: { type: 'candlestick', height: 350 },
          title: { text: x['name'], align: 'left' },
          xaxis: { type: 'datetime' },
          yaxis: { tooltip: { enabled: true } }
        };
        <Chart options={option}/>
        console.log(x['name']);
      });
    } catch (error) {
      console.log(error.message);
    }    
  }

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
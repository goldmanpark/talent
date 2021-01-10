import React, { Component } from 'react';
import tickerJson from './jsonData/tickers.json'
import { Chart } from './Chart';

export default class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      tickers : tickerJson["tickerNames"]
    }
  }

  createCandlecharts = () => {
    this.state.tickers.forEach(element => {
      <Chart series={element['name']}/>
    });
  }

  render(){
    const tickerList = this.state.tickers
    return (
       <div>
         <h4 className="bg-primary text-white text-center p-1">
           Talent
         </h4>
         <table>
          <tbody>{ this.createCandlecharts() }</tbody>
         </table>
       </div>
    )
  }
}
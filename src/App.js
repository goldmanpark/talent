import React, { Component } from 'react';
import { CandleStickChart } from './CandleStickChart';
import axios from 'axios';

export default class App extends Component{
  constructor(props){
    super(props);
    var today = new Date();
    var ago = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    this.state = {
      tickers : [],
      startDate : ago.toISOString().substr(0,10),
      endDate : today.toISOString().substr(0,10)
    }
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
  }

  componentDidMount(){
    this.getJsonData();
  }

  getJsonData(){
    try {
      axios.post('/dashboard', {
        startDate: this.state.startDate,
        endDate: this.state.endDate
      }).then(res => {
        this.setState({tickers : res.data.sendData});
        this.createCandlecharts();
      });
    } catch (error) {
      console.log(error);
    }
  }

  compareDate(date1, date2){
    // return -1 : date1 > date2
    // return 0 : date1 == date2
    // return 1 : date1 < date2
    let dt1 = date1.split("-").map(x => parseInt(x));
    let dt2 = date2.split("-").map(x => parseInt(x));

    if(dt1[0] > dt2[0]){ return -1; }
    else if(dt1[0] < dt2[0]){ return 1; }
    else
    {
      if(dt1[1] > dt2[1]){ return -1; }
      else if(dt1[1] < dt2[1]){ return 1; }
      else
      {
        if(dt1[2] > dt2[2]){ return -1; }
        else if(dt1[2] < dt2[2]){ return 1; }
        else{ return 0; }
      }
    }
  }

  updateStartDate = (event) => 
    this.setState({startDate : event.target.value});

  updateEndDate = (event) =>
    this.setState({endDate : event.target.value});

  submitDateRange = (event) => {
    event.preventDefault();
    if(this.compareDate(this.state.startDate, this.state.endDate) === -1)
      alert("date error");
    else
      this.getJsonData();
  }

  createCandlecharts = () => {
    if(this.state.tickers != null)
      return this.state.tickers.map(item => 
        <CandleStickChart key={item.symbol} />
      );
    else
      console.log("ticker is null");
  }
  
  render(){
    return (
      <div>
        <h4 className="bg-primary text-white text-center p-1">
          Talent
        </h4>
        <form onSubmit={this.submitDateRange}>
          <input type="date" value={this.state.startDate} onChange={this.updateStartDate}/>
          <span> ~ </span>
          <input type="date" value={this.state.endDate} onChange={this.updateEndDate}/>
          <span> </span>
          <input type="submit" value="Send Request"/>
        </form>
        <div className="square-FlexGrid">
          { this.createCandlecharts() }
        </div>
      </div>
    )
  }
}
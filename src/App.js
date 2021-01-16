import React, { Component } from 'react';
import { CandleStickChart } from './CandleStickChart';
import axios from 'axios';

export default class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      tickers : [],
      startDate : new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().substr(0,10),
      endDate : new Date().toISOString().substr(0,10)
    }
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
  }

  componentDidMount(){
    try {
      axios.get('/dashboard').then(res => {
        this.setState({tickers : res.data.tickerNames});
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
    else{
      // 서버에 저장된 json정보에 원하는 날자 있나 조회
      // 서버에 저장된 정보가 없으면 파이썬 모듈로 json 업데이트
      // 서버는 json 모듈 읽어와서 CandleStickChart 새로 렌더링
    }
  }

  createCandlecharts = () => {
    if(this.state.tickers != null)
      return this.state.tickers.map(item => <CandleStickChart key={item.name}/>);
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
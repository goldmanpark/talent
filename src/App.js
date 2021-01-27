import React, { Component } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { CandleStickChart } from './CandleStickChart';
import { option as candleStickOption } from './candleStickOption.json'

export default class App extends Component{
  constructor(props){
    super(props);
    var today = new Date();
    var ago = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.state = {
      tickers : [], // list of tickers
      details : [], // list of security details
      startDate : ago.toISOString().substr(0,10),
      endDate : today.toISOString().substr(0,10)
    }
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    this.submitDateRange = this.submitDateRange.bind(this);
  }

  componentDidMount(){
    axios.get('/dashboard').then(res => {
      this.setState({tickers : res.data.tickerNames});
      this.state.tickers.forEach(x => this.getJsonData(x.name));
    }).catch(error =>{
      console.log(error);
    });
  }

  async getJsonData(_ticker){
    await axios.get('/dashboard/' + _ticker, {
      params : {
        startDate : this.state.startDate,
        endDate : this.state.endDate,
        ticker : _ticker
      }
    }).then(res => {
      console.log(res.data);
      this.setState({details : [...this.state.details, res.data]});
    }).catch(error => {
      console.log(error);
    });
  }

  compareDate(date1, date2){
    let date = dayjs(date2)
    return date.diff(date1, 'day'); // date2 - date1
  }

  updateStartDate = (event) => 
    this.setState({startDate : event.target.value});

  updateEndDate = (event) =>
    this.setState({endDate : event.target.value});

  submitDateRange = (event) => {
    event.preventDefault();
    if(this.compareDate(this.state.startDate, this.state.endDate) < 0)
      alert("date error");
    else if(this.state.tickers != null){
      this.setState({details : []});
      this.state.tickers.forEach(x => this.getJsonData(x.name));
    }      
    else
      console.log("no tickers!");
  }

  createCandlecharts = () => {
    if(this.state.details != null && this.state.details.length > 0)
      return this.state.details.map(item => {
        var _series = [{data : item.data}];
        var _options = candleStickOption;
        _options.title.text = item.shortName + ' (' + item.symbol + ')';
        _options.xaxis.labels.formatter = function(x){ return dayjs(x).format('YY-MM-DD') }

        return (<CandleStickChart key={item.symbol} options={_options} series={_series}/>);
      });
    else
      console.log("ticker detail list is null");
  }
  
  render(){
    return (
      <div>
        <div class="main-header">          
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <span class="navbar-brand mb-0 h1">Talent</span>
            <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
              <li class="nav-item">
                <a class="nav-link font-weight-bold" href="#"> Market Index </a>
              </li>
              <li class="nav-item">
                <a class="nav-link font-weight-bold" href="#"> Currency </a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link font-weight-bold dropdown-toggle" href="#" id="navbarDropdown" role="button" 
                   data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Future
                </a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <a class="dropdown-item">Gold</a>
                  <a class="dropdown-item">Copper</a>
                  <a class="dropdown-item">Oil</a>
                </div>
              </li>
            </ul>
            <form class="form-inline" onSubmit={ this.submitDateRange }>
              <input type="date" class="form-control m-sm-1 p-1" value={this.state.startDate} onChange={this.updateStartDate}/>
              <span class="navbar-text mx-2"> ~ </span>
              <input type="date" class="form-control m-sm-1 p-1" value={this.state.endDate} onChange={this.updateEndDate}/>
              <span> </span>
              <input type="submit" class="btn btn-secondary font-weight-bold m-1" value="Send Request"/>
            </form>
          </nav>          
        </div>
        
        <div class="square-FlexGrid">
          { this.createCandlecharts() }
        </div>
      </div>
    )
  }
}
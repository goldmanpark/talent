import React, { Component } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Header } from './components/Header';
import { CandleStickChart } from './components/CandleStickChart';
import { option as candleStickOption } from './chartTemplate/candleStickOption.json'

export default class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      tickers : [], // list of tickers
      details : [], // list of security details
    }
    this.headerSubmitCallback = this.headerSubmitCallback.bind(this);
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

  headerSubmitCallback = (_startDate, _endDate) => {
    this.setState({details : []});
    this.setState({startDate : _startDate});
    this.setState({endDate : _endDate});
    this.state.tickers.forEach(x => this.getJsonData(x.name));
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
        <Header callbackSubmit={ this.headerSubmitCallback }/>
        <div class="square-FlexGrid">
          { this.createCandlecharts() }
        </div>
      </div>
    )
  }
}
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
      selectedMenu : "",
      selectedChartType : "candlestick",
      startDate : "",
      endDate : ""
    }    
  }

  componentDidMount(){
    this.headerSubmitCallback = this.headerSubmitCallback.bind(this);
    this.headerSelectNavCallback = this.headerSelectNavCallback.bind(this);
    this.headerSelectChartTypeCallback = this.headerSelectChartTypeCallback.bind(this);

    axios.get('/dashboard').then(res => {
      this.setState({tickers : res.data});
    }).catch(error =>{
      console.log(error);
    });
  }

  async getJsonData(_ticker, _startDate, _endDate){
    if(!_ticker)
      return;
    await axios.get('/dashboard/' + _ticker, {
      params : {
        startDate : _startDate,
        endDate : _endDate,
        ticker : _ticker
      }
    }).then(res => {
      let idx = this.state.details.indexOf(x => x.symbol === res.data.symbol);
      if(idx === -1)
        this.setState({details : [...this.state.details, res.data]});
      else
        this.setState({details : [...this.state.details.slice(0, idx), res.data,
                                  ...this.state.details.slice(idx + 1)]});
    }).catch(error => {
      console.log(error);
    });
  }
  
  headerSelectNavCallback = (_selectedMenu) => {
    if(_selectedMenu !== this.state.selectedMenu){
      this.setState({selectedMenu : _selectedMenu});
      this.setState({details : []});
    }
    if(this.state.startDate && this.state.endDate){
      var tickerArr = this.state.tickers[_selectedMenu];
      if(tickerArr){
        tickerArr.forEach(x => this.getJsonData(x.name, this.state.startDate, this.state.endDate));
      }
    }
  }

  headerSelectChartTypeCallback = (_type) => {
    if(_type){ this.setState({selectedChartType : _type}); }
    else{ this.setState({selectedChartType : "candlestick"}); }
  }

  headerSubmitCallback = (_startDate, _endDate) => {
    this.setState({startDate : _startDate});
    this.setState({endDate : _endDate});

    if(this.state.selectedMenu !== ""){
      var tickerArr = this.state.tickers[this.state.selectedMenu];
      if(tickerArr !== null && tickerArr !== undefined){
        tickerArr.forEach(x => 
          this.getJsonData(x.name, _startDate, _endDate)
        );
      }
    }
  }

  createCandlecharts = () => {
    if(this.state.details != null && this.state.details.length > 0){
      return this.state.details.map(item => {
        var _series = [{data : item.data}];
        var _options = candleStickOption;
        _options.title.text = item.shortName + ' (' + item.symbol + ')';
        _options.xaxis.labels.formatter = function(x){ return dayjs(x).format('YY-MM-DD') }

        return <CandleStickChart key={item.symbol} options={_options} series={_series} type={this.state.selectedChartType}/>
      });
    }
  }
  
  render(){
    return (
      <div>
        <Header callbackSubmit={ this.headerSubmitCallback }
                callbackSelectNavItem={ this.headerSelectNavCallback }
                callbackSelectChartType={ this.headerSelectChartTypeCallback }/>
        <div className="square-FlexGrid">
          { this.createCandlecharts() }
        </div>
      </div>
    )
  }
}
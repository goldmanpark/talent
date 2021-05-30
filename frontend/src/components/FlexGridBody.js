import React from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { option } from '../chartTemplate/chartOptions.json'
import { Navbar, DropdownButton, Dropdown } from 'react-bootstrap';

// For market, currency, future menu
export default class FlexGridBody extends React.Component{
  constructor(props){
    super(props);
    var today = dayjs();
    var ago = dayjs(today).subtract(1, 'month');
    this.state = {
      // date is allowed as string in date type form
      startDate : ago.toISOString().substr(0,10),
      endDate :  today.toISOString().substr(0,10),
      details : [], // list of security details
      selectedChartType : "candlestick",
      dropdownBtnTitle : "Chart Type"
    }
  }

  componentDidMount(){
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    this.selectChartType = this.selectChartType.bind(this);
    this.submitSearchCondition = this.submitSearchCondition.bind(this);

    this.updateDetails();
  }

  componentDidUpdate(prevProps){
    if(prevProps.tickers !== this.props.tickers){
      this.updateDetails();
    }    
  }
  
  /******************** METHOD ********************/
  updateDetails(){
    setTimeout(() => {
      this.setState({details : []}, () => {
        this.props.tickers.forEach(async x => await this.getJsonData(x.symbol, this.state.startDate, this.state.endDate));
      });
    }, 200);
  }

  async getJsonData(_ticker, _startDate, _endDate){
    if(!_ticker)
      return;
    await axios.get('/home/history', {
      params : {
        startDate : _startDate,
        endDate : _endDate,
        ticker : _ticker
      }
    }).then((res) => {
      res.data.shortName = this.props.tickers.find(x => x.symbol === _ticker).shortName
      this.setState({details : [...this.state.details, res.data]});  
    }).catch(error => {
      console.log(error.name);
      console.log(error.message);
    });
  }

  /******************** FORM EVENT ********************/
  updateStartDate = (event) => 
    this.setState({startDate : event.target.value});

  updateEndDate = (event) =>
    this.setState({endDate : event.target.value});

  selectChartType = (type) => {
    this.setState({selectedChartType : type}, () => {
      this.setState({dropdownBtnTitle : type.toUpperCase()});
    });    
  }   

  submitSearchCondition = (event) => {
    event.preventDefault();
    if(dayjs(this.state.endDate).diff(this.state.startDate, 'day') < 0)
      alert("date error");
    else
      this.updateDetails();   
  }

  /******************** CREATE ACTION ********************/
  createItems = () => {
    if(this.state.details !== null && this.state.details !== undefined){
      return this.state.details.map(item => {
        var _series = [{data : item.data}];
        var _options = option;
        _options.title.text = item.shortName + ' (' + item.symbol + ')';
        _options.xaxis.labels.formatter = function(x){ return dayjs(x).format('YY-MM-DD') }

        return <Chart className="col-md-4 col-xs-10" key={item.symbol} options={_options} 
                      series={_series} type={this.state.selectedChartType}/>
      });
    }
  }

  render() {
    return (
      <div>
        <Navbar className="contents_header" bg="dark" exapnd="lg" variant="dark">
          <form className="form-inline" onSubmit={ this.submitSearchCondition }>
            <input type="date" className="form-control m-sm-1 p-1" value={this.state.startDate} onChange={this.updateStartDate}/>
            <span className="navbar-text mx-2"> ~ </span>
            <input type="date" className="form-control m-sm-1 p-1" value={this.state.endDate} onChange={this.updateEndDate}/>
            <span> </span>
            <DropdownButton title={ this.state.dropdownBtnTitle }
                            onSelect={ this.selectChartType }>
              <Dropdown.Item eventKey="line">Line</Dropdown.Item>
              <Dropdown.Item eventKey="area">Area</Dropdown.Item>
              <Dropdown.Item eventKey="candlestick">CandleStick</Dropdown.Item>
            </DropdownButton>
            <input type="submit" className="btn btn-secondary font-weight-bold m-1" value="Send Request"/>
          </form>
        </Navbar>        

        <div className="d-flex flex-wrap justify-content-start">
          { this.createItems() }
        </div>
      </div>
    )
  }
}
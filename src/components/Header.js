import React from 'react';
import dayjs from 'dayjs';

export class Header extends React.Component{
  constructor(props){
    super(props);
    var today = dayjs();
    var ago = dayjs(today).subtract(1, 'month');
    this.state = {
      // date is allowed as string in date type form
      startDate : ago.toISOString().substr(0,10),
      endDate :  today.toISOString().substr(0,10)
    }
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    this.submitDateRange = this.submitDateRange.bind(this);    
  }

  componentDidMount(){
    let _startDate = this.state.startDate;
    let _endDate = this.state.endDate;
    this.props.callbackSubmit(_startDate, _endDate);
  }
  
  updateStartDate = (event) => 
    this.setState({startDate : event.target.value});

  updateEndDate = (event) =>
    this.setState({endDate : event.target.value});

  submitDateRange = (event) => {
    event.preventDefault();
    let date = dayjs(this.state.endDate);
    let result = date.diff(this.state.startDate, 'day');
    
    if(result < 0)
      alert("date error");
    else{
      let _startDate = this.state.startDate;
      let _endDate = this.state.endDate;
      this.props.callbackSubmit(_startDate, _endDate);
    }      
  }

  render() {
    return (
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
    )
  }
}
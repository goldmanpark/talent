import React from 'react';
import dayjs from 'dayjs';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

export class Header extends React.Component{
  constructor(props){
    super(props);
    var today = dayjs();
    var ago = dayjs(today).subtract(1, 'month');
    this.state = {
      // date is allowed as string in date type form
      startDate : ago.toISOString().substr(0,10),
      endDate :  today.toISOString().substr(0,10),
      selectedMenu : "market"
    }
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    this.submitDateRange = this.submitDateRange.bind(this);   
    this.selectNavItem = this.selectNavItem.bind(this);
    
    this.props.callbackSelectNavItem(this.state.selectedMenu);
  }

  componentDidMount(){
    setTimeout(() => {
      let _startDate = this.state.startDate;
      let _endDate = this.state.endDate;
      this.props.callbackSubmit(_startDate, _endDate);
    }, 1000);    // wait until App.js get tickers from server
  }

  /******************** NAVBAR EVENT ********************/
  selectNavItem = (menu) => {
    this.setState({selectedMenu : menu});
    this.props.callbackSelectNavItem(menu);
  }    

  /******************** FORM EVENT ********************/
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
    else {
      let _startDate = this.state.startDate;
      let _endDate = this.state.endDate;
      this.props.callbackSubmit(_startDate, _endDate);
    }      
  }

  render() {
    return (
      <Navbar bg="dark" exapnd="lg" variant="dark" sticky="top"
              onSelect={ this.selectNavItem }>
        <Navbar.Brand>Talent</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link eventKey="market" href="market">Market Index</Nav.Link>
          <Nav.Link eventKey="currency" href="currency">Currency</Nav.Link>
          <NavDropdown title="Futures" id="basic-nav-dropdown">
            <NavDropdown.Item eventKey="future.gold" href="gold">Gold</NavDropdown.Item>
            <NavDropdown.Item eventKey="future.silver" href="silver">Silver</NavDropdown.Item>
            <NavDropdown.Item eventKey="future.oil" href="oil">Oil</NavDropdown.Item>
          </NavDropdown>
        </Nav>
        
        <form class="form-inline" onSubmit={ this.submitDateRange }>
          <input type="date" class="form-control m-sm-1 p-1" value={this.state.startDate} onChange={this.updateStartDate}/>
          <span class="navbar-text mx-2"> ~ </span>
          <input type="date" class="form-control m-sm-1 p-1" value={this.state.endDate} onChange={this.updateEndDate}/>
          <span> </span>
          <input type="submit" class="btn btn-secondary font-weight-bold m-1" value="Send Request"/>
        </form>
      </Navbar>
    )
  }
}
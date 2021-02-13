import React from 'react';
import dayjs from 'dayjs';
import { Navbar, Nav, NavDropdown, DropdownButton, Dropdown } from 'react-bootstrap';

export default class Header extends React.Component{
  constructor(props){
    super(props);
    var today = dayjs();
    var ago = dayjs(today).subtract(1, 'month');
    this.state = {
      // date is allowed as string in date type form
      startDate : ago.toISOString().substr(0,10),
      endDate :  today.toISOString().substr(0,10),
      selectedMenu : "market",
      selectedChartType : "candlestick",
      dropdownBtnTitle : "Chart Type"
    }
  }

  componentDidMount(){
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    this.submitSearchCondition = this.submitSearchCondition.bind(this);   
    this.selectNavItem = this.selectNavItem.bind(this);

    setTimeout(() => {
      this.props.callbackSelectNavItem(this.state.selectedMenu);
      this.props.callbackSubmit(this.state.startDate, this.state.endDate, this.state.selectedChartType);
    }, 500);    // wait until App.js get tickers from server
  }

  /******************* NAVBAR EVENT *******************/
  selectNavItem = (menu) => {
    if(menu !== this.state.selectedMenu){
      this.setState({selectedMenu : menu});
      this.props.callbackSelectNavItem(menu);
    }    
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
    let date = dayjs(this.state.endDate);
    let result = date.diff(this.state.startDate, 'day');
    
    if(result < 0){
      alert("date error");
    }      
    else {
      this.props.callbackSubmit(this.state.startDate, this.state.endDate, this.state.selectedChartType);  
    }      
  }

  render() {
    return (
      <Navbar bg="dark" exapnd="lg" variant="dark" sticky="top" fixed="top">
        <Navbar.Brand>Talent</Navbar.Brand>
        <Nav className="mr-auto" variant="pills" defaultActiveKey="market"
             onSelect={ this.selectNavItem }>
          <Nav.Link eventKey="compare">Compare</Nav.Link>
          <Nav.Link eventKey="market">Market Index</Nav.Link>
          <Nav.Link eventKey="currency">Currency</Nav.Link>
          <NavDropdown title="Futures" id="basic-nav-dropdown">
            <NavDropdown.Item eventKey="future.gold">Gold</NavDropdown.Item>
            <NavDropdown.Item eventKey="future.silver">Silver</NavDropdown.Item>
            <NavDropdown.Item eventKey="future.oil">Oil</NavDropdown.Item>
          </NavDropdown>
        </Nav>
        
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
    )
  }
}
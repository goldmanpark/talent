import React from 'react';
import axios from 'axios';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import CompareCharts from './components/CompareCharts';
import FlexGridBody from './components/FlexGridBody';

export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      tickers : [], // list of tickers
      selectedMenu : "",
    }
  }

  componentDidMount(){
    console.log("App.js starting..");
    axios.get('/').then(res => {
      this.setState({tickers : res.data});
    }).catch(error =>{
      console.log(error);
    });
    this.setState({selectedMenu : "compare"});
  }

  selectNavItem = (_selectedMenu) =>
    this.setState({selectedMenu : _selectedMenu});

  createBody = () => {
    if(this.state.selectedMenu === "compare"){
      return <CompareCharts tickers={this.state.tickers}/>
    }
    else{
      return <FlexGridBody tickers={this.state.tickers[this.state.selectedMenu]}/>
    }
  }
  
  render(){
    return (
      <div>
        <Navbar className="app_header" bg="dark" exapnd="lg" variant="dark">
          <Navbar.Brand>Talent</Navbar.Brand>
          <Nav className="mr-auto" variant="pills" defaultActiveKey="compare"
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
        </Navbar>

        <div className="app_body">
          { this.createBody() }
        </div>
      </div>
    )
  }
}
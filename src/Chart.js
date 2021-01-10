import React, { Component } from 'react';
import ReactApexChart from 'apexcharts'

export class Chart extends Component{
  constructor(props){
    super(props);
    this.state = {
      options: {
        chart: {
          type: 'candlestick',
          height: 350
        },
        title: {
          text: 'CandleStick Chart',
          align: 'left'
        },
        xaxis: {
          type: 'datetime'
        },
        yaxis: {
          tooltip: {
            enabled: true
          }
        }
      }
    }
  }

  render (){
      return (
          <tr>
            <td>
            <ReactApexChart options={this.state.options} 
                            series={this.state.series} 
                            type="candlestick" 
                            height={350} />
            </td>            
          </tr>
      )
  }
}
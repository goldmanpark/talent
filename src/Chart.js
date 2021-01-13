import React, { Component } from 'react';
import ReactApexChart from 'apexcharts';

class Chart extends Component{
  constructor(props){
    super(props);
    this.state = {
      series: [{
        data: [{
            x: new Date(1538778600000),
            y: [6629.81, 6650.5, 6623.04, 6633.33]
          },
          {
            x: new Date(1538780400000),
            y: [6632.01, 6643.59, 6620, 6630.11]
          },
          {
            x: new Date(1538782200000),
            y: [6630.71, 6648.95, 6623.34, 6635.65]
          },
          {
            x: new Date(1538784000000),
            y: [6635.65, 6651, 6629.67, 6638.24]
          },
          {
            x: new Date(1538785800000),
            y: [6638.24, 6640, 6620, 6624.47]
          }
        ]
      }]
    }
  }

  render = () => {
    console.log("xxx");
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

export default Chart;
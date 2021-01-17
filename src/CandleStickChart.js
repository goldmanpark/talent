import React from 'react';
import Chart from 'react-apexcharts';

export class CandleStickChart extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      series: [],
      options: {
        chart: {
          type: 'candlestick',         
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
      },
    }
  }

  render = () => {
    return (
      <div className="square-FlexItem">
        <Chart options={this.state.options} 
               series={this.state.series} 
               type="candlestick" />
      </div>
    )
  }
}
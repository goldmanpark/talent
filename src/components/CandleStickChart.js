import React from 'react';
import Chart from 'react-apexcharts';

export class CandleStickChart extends React.Component {
  render = () => {
    return (
      <div className="square-FlexItem">
        <Chart options={this.props.options} 
               series={this.props.series} 
               type="candlestick" />
      </div>
    )
  }
}
import React from 'react';
import Chart from 'react-apexcharts';

export class ChartItem extends React.Component {
  render = () => {
    return (
      <div className="square-FlexItem">
        <Chart options={this.props.options} 
               series={this.props.series} 
               type={this.props.type} />
      </div>
    )
  }
}
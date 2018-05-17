
import React, {
  Component
} from 'react';
import "../../node_modules/bootstrap/dist/css/bootstrap.css";
import axios from 'axios';

import $ from 'jquery';


export default class FacetsComponent extends React.Component {
  constructor(props){
    super(props);
    console.log(props);

  }


  render(){

    var borderStyle = {
      border :'1px solid grey'
    }
    return(
      <div id={this.props.filterOption} style={borderStyle}>
        <p>{this.props.filterOption}test</p>
      {
          this.props.options.map(option => <div><input option={option} type="checkbox" onChange={this.props.filterSelected}/>{option} </div> )
      }
      </div>
    );

  }
}


import React, {Component} from 'react';
import "../../node_modules/bootstrap/dist/css/bootstrap.css";
import axios from 'axios';
import $ from 'jquery'

export default class BusResultComponent extends React.Component{


constructor(props){

  super(props);
  console.log(props);

}


render(){

var style = {
  width : " 700px",
  marginBottom : '10px'
}
  return(

    <div className="card" style={style}>
    <div className="card-body">
      <h5 className="card-title">  {this.props.travelName} </h5>
      <h6 className="card-subtitle mb-2 text-muted">{this.props.fromPlace} -->   {this.props.toPlace}</h6>
      <p className="card-text">
        {this.props.time}
      </p>

      <p className="card-text">
        Fare : {this.props.fare}
      </p>

      <p className="card-text">
        Rating : {this.props.rating}
      </p>

      <a href="#" className="card-link">Book Ticket</a>

    </div>
  </div>

  )
}



}

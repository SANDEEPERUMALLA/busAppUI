import React, {
  Component
} from 'react';
import "../../node_modules/bootstrap/dist/css/bootstrap.css";

import axios from 'axios';
import qs from 'querystring'

import BusResultComponent from "./BusResultComponent";

import FacetComponent from "./FacetComponent";
import $ from 'jquery';
import _ from 'underscore'



export default class ResultsComponent extends React.Component {


    constructor(props) {
      super(props);
      this.qParams = qs.parse(this.props.location.search.substring(1));
      this.state = {
        data: [],
        filterOption: "",
        options: []
      };

      this.travelsSelected = [];
    }

    componentWillMount() {

      console.log("Fetch Buses URL :" + "http://localhost:8080/bus/route?from=" + this.qParams.from + "&to=" + this.qParams.to)
      axios.get("http://localhost:8080/bus/route?from=" + this.qParams.from + "&to=" + this.qParams.to)
        .then((response) => {

          var data = response.data;

          var options = data.filter((d, i, arr) => {
            return arr.indexOf(d) === i
          }).map(d => d.travel.name);
          options = _.uniq(options);

          var state = Object.assign(this.state, {
            data: data,
            bData: data,
            options: options,
            filterOption: "Travels"
          });

          this.setState(state);


        })
        .catch((error) => {

        });
    }


    filterSelected(e) {

      var tName = $(e.target).attr('option');
      var isChecked = $(e.target).prop('checked');
      if (isChecked) {
        this.travelsSelected.push(tName);
      } else {
        var index = this.travelsSelected.indexOf(tName);
        if (index > -1) {
          this.travelsSelected.splice(index, 1);
        }
      }


      if (this.travelsSelected.length === 0) {

        var state = Object.assign(this.state, {

          data: this.state.bData
        });

        this.setState(state);
        return;

      }

      console.log(this.travelsSelected);

      var travelFilter = (d) => {
        return this.travelsSelected.indexOf(d.travel.name) !== -1
      };


      var busesFiltered = this.state.bData.filter(travelFilter);

      var state = Object.assign(this.state, {

        data: busesFiltered,
      });


      this.setState(state);
    }


    fareSorter() {
      return (d1, d2) => {
        if (d1.fare > d2.fare) {
          return 1;
        } else if (d1.fare < d2.fare) {
          return -1;
        } else {
          return 0;
        }
      }
    }


    ratingSorter() {
      return (d1, d2) => {
        if (d1.rating > d2.rating) {
          return 1;
        } else if (d1.rating < d2.rating) {
          return -1;
        } else {
          return 0;
        }
      }
    }


    handleSort(e) {
      var sortOption = $(e.target).attr('id');

      var data = [];
      if (sortOption === 'price') {
        data = this.state.data.sort(this.fareSorter())
      } else if (sortOption === 'rating') {
        data = this.state.data.sort(this.ratingSorter());
        data.reverse();
      } else {
        data = this.state.data;
      }

      var state = Object.assign(this.state, {
        data: data
      });


      this.setState(state);


    }
    render() {


        var clearStyle = {
          clear: 'both'
        }

        var borderStyle = {
          borderRight: '1px solid black'
        };
        return (

    <div id="main">
      <div className="float-right">
      <ul class="nav" onClick={this.handleSort.bind(this)}>
      <li class="nav-item">
      <span class="nav-link">  SORT BY: </span>
      </li>
  <li class="nav-item">
    <a id="price" class="nav-link active" href="#">PRICE</a>
  </li>
  <li class="nav-item"><
a id = "time"
class = "nav-link"
href = "#" > TIME < /a>
  </li>
  <li class="nav-item">
    <a id="rating" class="nav-link" href="#">RATING</a>
  </li>
 </ul>
      </div>
      <div id="busresultscontainer" style={clearStyle} className="row">
        <div className="col-lg-3" >
          <FacetComponent filterOption={this.state.filterOption} options={this.state.options} filterSelected={this.filterSelected.bind(this)} />

        </div>
        <div className="offset-lg-1 col-lg-8" >
        {
          this.state.data.map(br => <BusResultComponent
             travelName={br.travel.name}
            fromPlace={br.route.fromPlaceCode.name}
            toPlace={br.route.toPlaceCode.name}
            time={br.time}
            rating={br.rating}
            fare = {br.fare}

           />)
        }
        </div>
      </div>
      </div>
    )
  }

}

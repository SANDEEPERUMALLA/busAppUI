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
        options: [],
        sortState : ""
      };

      this.travelsSelected = [];

      this.state.sortMap = {
        'price' : this.fareSorter,
        'time' : "",
        'rating' :this.ratingSorter
      }
    }

    componentWillMount() {

      axios.get("http://localhost:8080/bus/route?from=" + this.qParams.from + "&to=" + this.qParams.to)
        .then((response) => {

          var data = response.data;
          var itemSize = data.length;
          var noOfPages = Math.ceil(itemSize / 10);

          var options = data.filter((d, i, arr) => {
            return arr.indexOf(d) === i
          }).map(d => d.travel.name);
          options = _.uniq(options);

          var d = data.slice(0,10);

          var state = Object.assign(this.state, {
            data: d,
            bData: data,
            options: options,
            filterOption: "Travels",
            noOfPages : noOfPages
          });
          this.setState(state);

        })
        .catch((error) => {

        });
    }


    pickPageElement(e) {
      var pageNo = parseInt($(e.target).text());
      console.log(pageNo+"pageNo");
      var data = this.state.bData;

      var lastResult = data.length <  pageNo*10+10 ? data.length : pageNo*10+10;
      data = data.splice(pageNo*10, lastResult);

      this.updateState({
          data : data
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
        this.sortAndUpdateState(this.state.bData, this.state.sortState);
        return;
      }

      var travelsFilter = (d) => {
        return this.travelsSelected.indexOf(d.travel.name) !== -1
      };

      var busesFiltered = this.state.bData.filter(travelsFilter);

      this.sortAndUpdateState(busesFiltered,this.state.sortState);
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
        if (d1.rating < d2.rating) {
          return 1;
        } else if (d1.rating > d2.rating) {
          return -1;
        } else {
          return 0;
        }
      }
    }

    sortAndUpdateState(data, sortOption){

      var d = this.state.data;
      if(this.state.sortMap[sortOption]){
        d = data.sort(this.state.sortMap[sortOption]());
      }

      this.updateState(
        {
          data : d,
          sortOption : sortOption
        }
      );

    }

    updateState(state){

      var stateObject = {};

      if(state.data){
        stateObject.data = state.data;
      }

      if(state.sortOption){
        stateObject.sortState = state.sortOption;
      }

      var state = Object.assign(this.state, stateObject);

        this.setState(state);

    }


    handleSort(e) {
      var sortOption = $(e.target).attr('id');
        this.sortAndUpdateState(this.state.data, sortOption);
    }


    render() {


      var elems = [];

      for(var i=0;i<this.state.noOfPages;i++){
        elems.push(<li class="page-item"><a class="page-link" href="#">{i}</a></li>);
      }

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
                <li class="nav-item"><a id="time" class="nav-link" href="#"> TIME </a>
                </li>
                <li class="nav-item">
                  <a id="rating" class="nav-link" href="#">RATING</a>
                </li>
              </ul>
            </div>
            <div id="busresultscontainer" style={clearStyle} className="row">
              <div className="col-lg-3">
                <FacetComponent filterOption={this.state.filterOption} options={this.state.options} filterSelected={this.filterSelected.bind(this)} />
              </div>
              <div className="offset-lg-1 col-lg-8">
                { this.state.data.map(br =>
                <BusResultComponent travelName={br.travel.name} fromPlace={br.route.fromPlaceCode.name} toPlace={br.route.toPlaceCode.name} time={br.time} rating={br.rating} fare={ br.fare} />) }
              </div>
            </div>
            <div className="row">
              <div className="offset-lg-4 col-lg-4">
                <nav aria-label="Page navigation example" class="float-right">
                  <ul class="pagination" onClick={this.pickPageElement.bind(this)}>
                    <li class="page-item">
                      <a class="page-link" href="#" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                        <span class="sr-only">Previous</span>
                      </a>
                    </li>
                    {elems}
                    <li class="page-item">
                      <a class="page-link" href="#" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                        <span class="sr-only">Next</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
    )
  }

}

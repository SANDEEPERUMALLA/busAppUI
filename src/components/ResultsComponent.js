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
import SockJsClient from 'react-stomp';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client'



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

        for(var i=0;i<data.length;i++){
          data[i].index = i;
        }

          var d = data.slice(0,10);
          var state = Object.assign(this.state, {
            tData : data,
            fData: data,
            data: d,
            pageNo : 0,
            options: options,
            filterOption: "Travels",
            noOfPages : noOfPages
          });

          this.setState(state);

          console.log(this.state.fData);
          console.log(this.state.data);

        })
        .catch((error) => {

        });
    }

    doDeepCopy(object){
      var target = {};

      for(var key in object){
        if(typeof object[key] === "object"){
          //var t = doDeepCopy(object[key]);
          target[key] = object[key];
        }
      }

      return target;
    }


    changePageData(){

        var pageNo  = this.state.pageNo;
        var d = JSON.parse(JSON.stringify(this.state.fData));
        var lastResult = d.length <  pageNo*10+10 ? d.length : pageNo*10+10;
        d = d.slice(pageNo*10, lastResult);

        this.updateState({
            data : d,
            pageNo : pageNo
        });

        console.log(this.state.fData);
        console.log(this.state.data);
    }

    pickPageElement(e) {
      var pageNo = parseInt($(e.target).text());

      this.updateState({
        pageNo : pageNo
      });

      this.changePageData();

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
        var itemSize = this.state.tData.length;
        var noOfPages = Math.ceil(itemSize / 10);
        this.updateState({
          fData : this.state.tData,
          noOfPages : noOfPages
        });

        this.sortAndUpdateState(this.state.fData, this.state.sortState);
        return;
      }

      var travelsFilter = (d) => {
        return this.travelsSelected.indexOf(d.travel.name) !== -1
      };

      var fData = this.state.tData.filter(travelsFilter);
      var itemSize = fData.length;
      var noOfPages = Math.ceil(itemSize / 10);
      this.updateState({
        fData : fData,
        noOfPages : noOfPages
      })

      this.sortAndUpdateState(fData,this.state.sortState);
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

    sortAndUpdateState(data, sortOption) {

      var d = this.state.fData;
      if(this.state.sortMap[sortOption]){
        d = d.sort(this.state.sortMap[sortOption]());
      }

      this.updateState(
        {
          fData : d,
          sortOption : sortOption
        }
      );

      this.changePageData();

    }

    updateState(s){

      var state = Object.assign(this.state, s);

        this.setState(state);

    }


    handleSort(e) {
      var sortOption = $(e.target).attr('id');
      this.updateState({
        pageNo : 0
      });
        this.sortAndUpdateState(this.state.data, sortOption);
    }

    handleBooking(e){
      $(".modal").css("display",'block');
      $("#container").css("opacity","0.2");
    }

    submitBooking(){

      this.connect();


    }

   sendMsg() {
        this.stompClient.send("http://localhost:8080/app/booking", {}, "book ticket");
    }

    connect() {
      this.socket = new SockJS('ws://localhost:8080/gs-guide-websocket');
      this.stompClient = Stomp.over(this.socket);
      var ref = this;
      this.stompClient.connect({}, function (frame) {
      //  setConnected(true);
        console.log('Connected: ' + frame);

        ref.stompClient.subscribe('http://localhost:8080/topic/ack', function (message) {

          console.log(message);
        });

          ref.sendMsg();
    });
  }



    render() {


      var elems = [];

      for(var i=0;i<this.state.noOfPages;i++){
        if(this.state.pageNo === i){
            elems.push(<li class="page-item active"><a class="page-link" href="#">{i}</a></li>);
            continue;
        }
        elems.push(<li class="page-item"><a class="page-link" href="#">{i}</a></li>);
      }

        var clearStyle = {
          clear: 'both'
        }

        var modelPositionStyle = {
          top : '50px'
        }

        var borderStyle = {
          borderRight: '1px solid black'
        };

        return (
          <div id="main">

            <div class="modal" style={modelPositionStyle} tabindex="-1" role="dialog">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Modal title</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <p>Modal body text goes here.</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onClick={this.submitBooking.bind(this)}>Save changes</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
            <div id="container">
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
                <div className="offset-lg-1 col-lg-8" onClick={this.handleBooking.bind(this)}>
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

          </div>
    )
  }

}

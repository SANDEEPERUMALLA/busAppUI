import React, {Component} from 'react';
import "../../node_modules/bootstrap/dist/css/bootstrap.css";
import axios from 'axios';

import $ from 'jquery'





class Place {

  constructor(name, code) {

    this.name = name;
    this.code = code;
  }
  name: String
  code: String
}

export default class LandingPageComponent extends React.Component {

    constructor(props) {

      super(props);
      this.places = [];
      this.state = {};

    }


    componentDidMount() {

      console.log("componentDidMount");
      axios.get("http://localhost:8080/place/")
        .then(response => {

          console.log(response.data)
          var rData = response.data;

          this.places = rData.map(item => {
            console.log("item :" + item.code)
            var place = new Place(item.name, item.code);
            console.log(place);
            return place
          });

          var state = Object.assign(this.state, {
            places: this.places
          });

          this.setState(state);
        });

    }

    fetchBuses(e) {

      this.props.history.push({
        pathname: '/results',
        search: 'from=' + this.fromCity + '&to=' + this.toCity
      })

      axios.get("http://localhost:8080/bus/route?from=" + this.state.from + "&to=" + this.state.to)
        .then(function(response) {
          console.log(response);
        })
        .catch(function(error) {
          console.log(error);
        });
    }

    handleFromChange(e) {

      var state = Object.assign(this.state, {
        from: e.target.value
      });

      this.setState(state);

      console.log(state);


    }

    handleToChange(e) {
      var state = Object.assign(this.state, {
        to: e.target.value
      });

      this.setState(state);
      console.log(state);

    }


    selectedFromCity(e) {

      $(e.currentTarget).css("display", "none");

      $('[name=from]').val($(e.target).text());

      this.fromCity = $(e.target).attr('code');


    }

    selectedToCity(e) {

			  $(e.currentTarget).css("display", "none");

      $('[name=to]').val($(e.target).text());

      this.toCity = $(e.target).attr('code');
    }

    showDropDownFrom(e) {

      $("#fromlist").css("display", "block");
    }

		showDropDownTo(e) {

			$("#tolist").css("display", "block");
		}



	render() {

			var inputStyle = {
				width : "200px",
				float : "left",
				marginRight : "50px",
				marginLeft : "50px"
			};

			var dShow = {
				display : "none"
			}


		return(
			<div>
			<div className="row">

				<div className="col-lg-3">
				<input className="form-control" name="from" type="text" placeholder="from" onKeyUp={this.showDropDownFrom.bind(this)} onChange={this.handleFromChange.bind(this)} style={inputStyle} />
				<ul id="fromlist" style={dShow}  onClick={this.selectedFromCity.bind(this)}>
				{
						this.places.filter(item=> item.name.startsWith(this.state.from)).map(place => <li code={place.code}>{place.name}</li>)

				}
				</ul>
			</div>

			<div className="col-lg-3">
			<input className="form-control" name="to" type="text" placeholder="to" onChange={
				this.handleToChange.bind(this)} style={inputStyle} onKeyUp={this.showDropDownTo.bind(this)}/>
				<ul id="tolist" style={dShow} onClick={this.selectedToCity.bind(this)}>
				{
						this.places.filter(item=> item.name.startsWith(this.state.to)).map(place => <li code={place.code}>{place.name}</li>)

				}
				</ul>
			</div>

			<div className="col-lg-3">
			<input className="form-control" name="submit" type="submit" onClick={this.fetchBuses.bind(this)} style={inputStyle} />
			</div>

			</div>

			</div>
			)
	}



}

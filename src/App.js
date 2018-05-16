import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';


import LandingPageComponent from'./components/LandingPageComponent';
import ResultsComponent from'./components/ResultsComponent';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to MyBus.com</h1>
        </header>
       <br/>
       <br/>
        <Router>
            <div>
        
               <Switch>
                  <Route exact path='/' component={LandingPageComponent} />
                  <Route exact path='/results' component={ResultsComponent} />
               </Switch>
            </div>
         </Router>
      </div>
    );
  }
}

export default App;

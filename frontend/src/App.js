import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './Navbar';
import Login from './Login';
import Signup from './Signup';
import PublicMapView from './PublicMapView';
import OfficeDashboard from './OfficeDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/dashboard" component={OfficeDashboard} />
          <Route path="/" component={PublicMapView} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
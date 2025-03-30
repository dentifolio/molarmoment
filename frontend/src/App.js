import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainPage from './components/MainPage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import OfficeDashboard from './components/OfficeDashboard';
import PatientSearch from './components/PatientSearch';  // Updated import

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={MainPage} />
        <Route path="/signup" component={SignUp} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={OfficeDashboard} />
        <Route path="/search" component={PatientSearch} />  // Updated route
      </Switch>
    </Router>
  );
};

export default App;
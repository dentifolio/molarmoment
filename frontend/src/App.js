import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainPage from './components/MainPage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import OfficeDashboard from './components/OfficeDashboard';
import Search from './components/Search';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={MainPage} />
        <Route path="/signup" component={SignUp} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={OfficeDashboard} />
        <Route path="/search" component={Search} />
      </Switch>
    </Router>
  );
};

export default App;
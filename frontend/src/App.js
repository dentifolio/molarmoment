import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainPage from './components/MainPage';
import './App.css'; // Assuming you have some global styles

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={MainPage} />
        {/* Add other routes here if needed */}
      </Switch>
    </Router>
  );
}

export default App;
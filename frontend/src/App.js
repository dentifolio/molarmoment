import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./Login";
import OfficeDashboard from "./OfficeDashboard";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/office-dashboard" component={OfficeDashboard} />
        {/* Add other routes as needed */}
      </Switch>
    </Router>
  );
};

export default App;
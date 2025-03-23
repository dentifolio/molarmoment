import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PublicMapView from "./PublicMapView";
import OfficeProfile from "./OfficeProfile";
import Signup from "./Signup";
import Login from "./Login";

const App = () => {
  const [office, setOffice] = useState(null);

  return (
    <Router>
      <Switch>
        <Route path="/" exact component={PublicMapView} />
        <Route path="/signup" component={Signup} />
        <Route path="/login">
          <Login setOffice={setOffice} />
        </Route>
        <Route path="/office-profile">
          <OfficeProfile office={office} setOffice={setOffice} />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
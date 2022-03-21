import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Survey from './Survey';
import * as serviceWorker from './serviceWorker';
//import HwpViewerPage from './HwpViewerPage'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Redirect,
} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
      <Router>
        <Routes>
            <Route  exact path = "/"   element={<App />}   />
            <Route  path = "/Survey"   element={<Survey />}   />
        </Routes>
      </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

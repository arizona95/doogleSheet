import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ExcelPage from './excel/ExcelPage';
import SurveyPage from './survey/SurveyPage';
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
            <Route  path = "/"   element={<ExcelPage />}   />
            <Route  path = "/survey/*"   element={<SurveyPage />}   />
        </Routes>
      </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

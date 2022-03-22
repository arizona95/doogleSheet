import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Outlet  } from "react-router-dom";
import SurveyCreator from "./SurveyCreator";
import SurveyView from "./Survey";

export default class App extends React.Component {
  state = {
    json: null
  };

  handleSave = json => {
    this.setState({ json });
  };

  cssTest = (survey, options) => {
    const classes = options.cssClasses;
    console.log(classes);

    // classes.root = "sq-root";
    classes.title = "sq-title";
    classes.item = "sq-item";
    classes.label = "sq-label";
    classes.header = "sq-header";
  };
  render() {
    const { json } = this.state;

    return (
    <div>
        <Link to="/survey/create">Create</Link>
        <Link to="/survey/view">View</Link>
        <Routes>
          <Route path="/create" exact>
            <SurveyCreator
              handleSave={this.handleSave}
              onUpdateQuestionCssClasses={this.cssTest}
            />
          </Route>
          <Route path="/view">
            <SurveyView json={json} />
          </Route>
        </Routes>
        </div>
    );
  }
}

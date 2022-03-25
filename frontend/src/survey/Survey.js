import React, { Component } from "react";
import * as Survey from "survey-react";
import * as widgets from "surveyjs-widgets";
import "nouislider/dist/nouislider.css";
import "survey-react/modern.css";
Survey.StylesManager.applyTheme("modern");

const myCss = {
  matrix: {
    root: "table table-striped"
  },
  navigationButton: "butt"
};

widgets.nouislider(Survey);
widgets.sortablejs(Survey);


export default class SurveyView extends Component {
  cssTest = (survey, options) => {
    const classes = options.cssClasses;
    //console.log(classes);

    // classes.root = "sq-root";
    classes.title = "sq-title";
    classes.item = "sq-item";
    classes.label = "sq-label";
    classes.header = "sq-header";
  };
  render() {
    const { init } = this.props;
    console.log("surv_json", init);

    var model = new Survey.Model(init);

    if (!init) {
      return <p>No Form</p>;
    } else {
      return (
        <Survey.Survey
          model={model}
          css={myCss}
          onComplete={this.props.handleSurveyResult}
          onUpdateQuestionCssClasses={this.cssTest}
        />
      );
    }
  }
}

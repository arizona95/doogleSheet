import React, { Component } from "react";
import * as SurveyJSCreator from "survey-creator";
// import * as SurveyKo from "survey-knockout";
import * as widgets from "surveyjs-widgets";
import * as Survey from "survey-react";

import "survey-creator/survey-creator.css";
import "nouislider/dist/nouislider.css";
// import "survey-react/modern.css";

// import "survey-react/modern.css";

// READ THIS
//
//
//                 onUpdateQuestionCssClasses
//
//
//
//
SurveyJSCreator.StylesManager.applyTheme("modern");

var mainColor = "#2d2d2d";
var mainHoverColor = "#2d2d2d";
var textColor = "#2d2d2d";
var headerColor = "red";
var headerBackgroundColor = "#fff";
var bodyContainerBackgroundColor = "#fff";

var defaultThemeColorsEditor =
  SurveyJSCreator.StylesManager.ThemeColors["default"];
defaultThemeColorsEditor["$primary-color"] = mainColor;
defaultThemeColorsEditor["$secondary-color"] = mainColor;
defaultThemeColorsEditor["$primary-hover-color"] = mainHoverColor;
defaultThemeColorsEditor["$primary-text-color"] = textColor;
defaultThemeColorsEditor["$secondary-text-color"] = textColor;
defaultThemeColorsEditor["$selection-border-color"] = mainColor;

// SurveyJSCreator.StylesManager.applyTheme();

widgets.nouislider(Survey);
widgets.sortablejs(Survey);

export default class SurveyCreator extends Component {
  surveyCreator;
  componentDidMount() {
    let options = {
      questionTypes: [
        "checkbox",
        "radiogroup",
        "text",
        "comment",
        //"multipletext",
        "boolean",
        "rating",
        "dropdown",
        //"file",
        //"imagepicker",
        //"matrix",
        //"expression"
      ],
      showJSONEditorTab: false,
      showEmbededSurveyTab: false,
      showTranslationTab: false,
      showLogicTab: true,
      isAutoSave: true,
      showPagesToolbox: false,
      showState: false,
      showSurveyTitle: "always"
    };

    this.surveyCreator = new SurveyJSCreator.SurveyCreator(
      "surveyCreatorContainer",
      options
    );
    /*
    this.surveyCreator.toolbox.addItem({
      isCopied: true,
      iconName: "icon-default",
      type: "text",
      name: "url",
      title: "Please add URL",
      json: {
        type: "text",
        name: "url",
        title: "Please add URL"
      }
    });

    */

    // this.surveyCreator.toolbox.addItem({
    //   //Unique component name. It becomes a new question type. Please note, it should be written in lowercase.
    //   name: "country",
    //   //The text that shows on toolbox
    //   title: "Country",
    //   //The actual question that will do the job
    //   questionJSON: {
    //     type: "dropdown",
    //     optionsCaption: "Select a country...",
    //     choicesByUrl: {
    //       url: "https://restcountries.eu/rest/v2/all"
    //     }
    //   }
    // });

    this.surveyCreator.saveSurveyFunc = this.saveMySurvey;
    this.surveyCreator.showToolbox = "right";
    this.surveyCreator.showPropertyGrid = "right";
    this.surveyCreator.rightContainerActiveItem("toolbox");

    // this.surveyCreator.toolbox.changeCategories([
    //   {
    //     name: "panel",
    //     category: "Panels"
    //   },
    //   {
    //     name: "paneldynamic",
    //     category: "Panels"
    //   },
    //   {
    //     name: "matrix",
    //     category: "Matrix"
    //   }
    // ]);
  }
  render() {
    console.log(
      "Survey.onUpdateQuestionCssClasses",
      Survey.onUpdateQuestionCssClasses
    );
    return <div id="surveyCreatorContainer" />;
  }
  saveMySurvey = () => {
    console.log(JSON.stringify(this.surveyCreator.text));
    this.props.handleSave(this.surveyCreator.text);
  };
}

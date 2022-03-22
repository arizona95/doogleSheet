import React, { useEffect, useRef, useState } from 'react';
import OkdbClient from 'okdb-client';
import queryString from 'query-string';
import SurveyCreator from "./SurveyCreator";
import SurveyView from "./Survey";
import {
    useLocation,
    Outlet,
    Routes,
    Route,
} from 'react-router-dom';
import "./styles.css";
import App from "./App";
const HOST = 'http://localhost:7899';
const TOKEN = '12345';
const okdb = new OkdbClient(HOST);
var xSheet ;
const DATA_TYPE = 'todo-tasks';


function SurveyPage() {

    console.log("SurveyPage");

  const [user, setUser] = useState(null);
  const {search} = useLocation();
  const query = queryString.parse(search);
  const documentId = query.sheet;
  const [question, setQuestion] = useState({});
  const [json, setJson] = useState(null);

  useEffect(() => {
    //console.log('update_document_id', documentId);
    document.title = `${documentId+".survey"}`;

    okdb.connect({token:TOKEN, userName: "설문조사중.."})
      .then(user => {setUser(user);
      okdb.open(
          DATA_TYPE, // collection name
          documentId,
          {}, // default value to save if doesn't exist yet
       ).then(openedData => {
       setQuestion(()=>{

            const questionList = JSON.parse(openedData.data).rows["0"].cells
            var questionValue={};
            console.log("questionList:",questionList);

            Object.keys(questionList).map((key) => {questionValue =
            {
            ...questionValue,
            [key]:questionList[key].text
            }})
            console.log("questionValue:",questionValue);
            return questionValue;
            }
         )

       })
       })
       },[])

   const handleSave = json => {
    setJson({ json });
  };

  const cssTest = (survey, options) => {
    const classes = options.cssClasses;
    console.log(classes);

    // classes.root = "sq-root";
    classes.title = "sq-title";
    classes.item = "sq-item";
    classes.label = "sq-label";
    classes.header = "sq-header";
  };

   /*
   {
   Object.keys(question).map( (key,idx) =>
   <p>{question[key]}</p>
   )}
   */

   return (<Routes>
   <Route path="/create" element={<SurveyCreator
              handleSave={handleSave}
              onUpdateQuestionCssClasses={cssTest}
            /> }  />
   <Route path="/view" element = {<SurveyView json={json} />}/>
   </Routes>);
}

export default SurveyPage ;
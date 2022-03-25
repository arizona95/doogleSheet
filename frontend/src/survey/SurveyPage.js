import React, { useEffect, useRef, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
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
import crypto from 'crypto-js';
import exampleData from "../excel/exampleData";
import "./styles.css";
import App from "./App";
import secretKey from "../secret/secretKey";
import baseHOST from "../secret/baseHOST";
const HOST = baseHOST+':7899';
const TOKEN = '12345';
const okdb = new OkdbClient(HOST);
const DATA_TYPE = 'todo-tasks';
console.log("okdb",okdb);
var sheetData = null;
function SurveyPage() {

  const [user, setUser] = useState(null);
  const {search} = useLocation();
  const query = queryString.parse(search);
  const documentId = query.sheet??crypto.AES.decrypt(search.substring(8), secretKey).toString(crypto.enc.Utf8);


  const [json, setJson] = useState(null);
  const [initJson, setInitJson] = useState(null);
  const [presences, setPresences] = useState({});
  const stateRef = useRef();
  stateRef.current = presences;

   const broadcast = (messege) => {
        okdb.sendPresence(messege);
        //okdb.sendPresence({ situation: "end_messege"});
  }

  const presenceCallback = (id, data) => {
      console.log("presenceCallback@",id,data, sheetData);
      if (!data) {
      //console.log("user deleted!")
          setPresences(prev => {
            const newState = cloneDeep(prev);
            delete newState[id];
            return newState;
          });

          return;
         } else if (data.user && data.user.id) {
         if( Object.keys(stateRef.current).includes(id)){
            console.log("not first", id,stateRef.current);

                if(data.situation === "excel_changed" | data.situation === "survey_result" | data.situation === "survey_changed"  ) {
                    sheetData = data.data;
                 }
          }else {console.log("first",id, stateRef.current)

              setPresences(prev => {
                const newState = cloneDeep(prev);
                newState[id] = {
                  id,
                  ...data,
                };
                return newState;
              });}
          }
  }


  useEffect(() => {
    document.title = `${documentId+".survey"}`;


    okdb.connect({token:TOKEN, userName: "설문조사중.."})
      .then(user => {
      setUser(user);
      okdb.open(
          DATA_TYPE, // collection name
          documentId,
          {data:JSON.stringify(exampleData)}, // default value to save if doesn't exist yet
           { onPresence: presenceCallback, },
       ).then(openedData => {
       setInitJson(JSON.parse(openedData.data).survey);
       sheetData = JSON.parse(openedData.data);

       })
       })
       },[])
    /*
   const presenceCallback = (id, data) => {
   console.log("presenceCallback", id,data);
   if (!data) {
     return;
   }else if(data.situation === "excel_changed") {
   console.log("data.data",data.data, initJson)
          setSheetData({
          ...data.data,
          });
       }
   }
   */

   const handleSurveyFormSave = formJson => {
   console.log("handleSurveyFormSave");
        setJson({ formJson });
        console.log("sheetData@", sheetData);
        const newSheetData = {
            ...sheetData,
            survey: JSON.parse(formJson),
        }

        okdb.put(DATA_TYPE, documentId, {data:JSON.stringify(newSheetData)})

        broadcast({
          situation: "survey_changed",
          data:newSheetData
        });

        sheetData=newSheetData


  };

  const handleSurveyResult = resultJson => {

    var surveyResult= resultJson.data
    console.log("sheetData",sheetData)
    var newSheetData ={
        ...sheetData,
    }
    var oneLine = newSheetData.rows[0]?.cells??{[-1]:null};
    var maxOneLine = Math.max.apply(null,Object.keys(oneLine));
    const columnKey = Object.keys(newSheetData.rows).filter(it =>!isNaN(it ) )
    const addColumnIndex = Math.max.apply(null, [0,...columnKey] )+1
    //console.log("addColumnIndex",addColumnIndex, newSheetData.rows)
    // 업데이트 부분
    Object.keys(surveyResult).map(sk => {
        var findKey=false;
        Object.keys(oneLine).map(ok => {
            if( sk === oneLine[ok]?.text){
                newSheetData = {
                    ...newSheetData,
                    rows: {
                        ...newSheetData.rows,
                        [addColumnIndex]:{
                            cells:{
                                ...newSheetData.rows[addColumnIndex]?.cells,
                                [ok]:{
                                    text:surveyResult[sk]
                                }

                            }

                        }
                    }
                }
                findKey=true;
            };

        })
        if(findKey === false){
            newSheetData = {
                ...newSheetData,
                rows:{
                    ...newSheetData.rows,

                    0:{
                        cells:{
                            ...newSheetData.rows[0]?.cells,
                            [maxOneLine+1]:{
                                style: 3,
                                text: sk
                            }

                        }

                    },
                    [addColumnIndex]:{
                        cells:{
                            ...newSheetData.rows[addColumnIndex]?.cells,
                            [maxOneLine+1]:{
                                text:surveyResult[sk]
                            }

                        }

                    }
                }
            }
            maxOneLine = maxOneLine+1
        }
     })

    okdb.put(DATA_TYPE, documentId, {data:JSON.stringify(newSheetData)});

    broadcast({
        situation: "survey_result",
        data: newSheetData
      });


    console.log("handleSurveyResult",resultJson.data, newSheetData);

    sheetData= newSheetData

    /*

    window.opener = null;
    window.open("", "_self");
    window.close()
    */


  }

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
              init={initJson}
              handleSurveyFormSave={handleSurveyFormSave}
              onUpdateQuestionCssClasses={cssTest}
            /> }  />
   <Route path="/view" element = {<SurveyView
          init={initJson}
          handleSurveyResult={handleSurveyResult}
   />}/>
   </Routes>);
}

export default SurveyPage ;
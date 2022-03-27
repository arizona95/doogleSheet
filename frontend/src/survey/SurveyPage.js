//base
import React, { useEffect, useRef, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import {
    useLocation,
    Outlet,
    Routes,
    Route,
} from 'react-router-dom';
//conponent
import SurveyCreator from "./SurveyCreator";
import SurveyView from "./Survey";
//library
import OkdbClient from 'okdb-client';
import queryString from 'query-string';
import crypto from 'crypto-js';
//css
import "./styles.css";
//data
import exampleData from "../excel/exampleData";
import secretKey from "../secret/secretKey";
import baseHOST from "../secret/baseHOST";
//constant
const HOST = baseHOST+':7899';
const TOKEN = '12345';
const okdb = new OkdbClient(HOST);
const DATA_TYPE = 'excel';

function SurveyPage() {
	//useState
  const [user, setUser] = useState(null);
  const {search} = useLocation();
  const query = queryString.parse(search);
  const documentId = query.sheet??crypto.AES.decrypt(search.substring(8), secretKey).toString(crypto.enc.Utf8);
  const [json, setJson] = useState(null);
  const [initJson, setInitJson] = useState(null);
  const [presences, setPresences] = useState({});
  const stateRef = useRef();
  stateRef.current = presences;

   const updateAll = (messege) => {

		 if (messege.situation === "data_changed") {
				okdb.put(DATA_TYPE, documentId, {
					data: JSON.stringify(messege.updateData)
				}).then(res => {
					okdb.sendPresence({
						situation: messege.situation,
					});
				}).catch((err) => console.log("Error updating doc", err));
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
           {},
       ).then(openedData => {
       setInitJson(JSON.parse(openedData.data).survey);

       })
       })
       },[])


   const handleSurveyFormSave = formJson => {
       const sheetData = JSON.parse(okdb.connection.collections[DATA_TYPE][documentId].data.data);
        setJson({ formJson });
        const newSheetData = {
            ...sheetData,
            survey: JSON.parse(formJson),
        }

        updateAll({
              situation: "data_changed",
              updateData: newSheetData
        })

  };

  function dateFormat(date) {
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();

        month = month >= 10 ? month : '0' + month;
        day = day >= 10 ? day : '0' + day;
        hour = hour >= 10 ? hour : '0' + hour;
        minute = minute >= 10 ? minute : '0' + minute;
        second = second >= 10 ? second : '0' + second;

        return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}


  const handleSurveyResult = resultJson => {

    let today = new Date();

    var surveyResult= {
        timestamp: dateFormat(today),
        ...resultJson.data,
        response: true
    }
    const sheetData = JSON.parse(okdb.connection.collections[DATA_TYPE][documentId].data.data);
    var newSheetData ={
        ...sheetData,
    }
    var oneLine = newSheetData.rows[0]?.cells??{[-1]:null};
    var maxOneLine = Math.max.apply(null,Object.keys(oneLine));
    const columnKey = Object.keys(newSheetData.rows).filter(it =>!isNaN(it ) )
    const addColumnIndex = Math.max.apply(null, [0,...columnKey] )+1
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

     updateAll({
     		situation: "data_changed",
        updateData: newSheetData,
     })

		/*
    window.opener = null;
    window.open("", "_self");
    window.close()
    */

  }

  const cssTest = (survey, options) => {
    const classes = options.cssClasses;

    // classes.root = "sq-root";
    classes.title = "sq-title";
    classes.item = "sq-item";
    classes.label = "sq-label";
    classes.header = "sq-header";
  };

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
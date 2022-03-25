//base
import { Grid, Paper } from '@material-ui/core';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Redirect,
  Link,
} from "react-router-dom";
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import cloneDeep from 'lodash/cloneDeep';
//library
import OkdbClient from 'okdb-client';
import Spreadsheet from "x-data-spreadsheet";
import crypto from 'crypto-js';
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { FcUpload } from 'react-icons/fc';
import { FcDownload } from 'react-icons/fc';
import { RiSurveyFill } from 'react-icons/ri';
import { FaCheckSquare } from 'react-icons/fa';
import { VscGistSecret } from 'react-icons/vsc';
import { GrPowerReset } from 'react-icons/gr';
//component
import AppUsers from '../AppUsers';
//css
import "x-data-spreadsheet/dist/xspreadsheet.css";
import './Excel.css';
import "bulma/css/bulma.css";
//data
import navy_img from "./navy.svg";
import exampleData from "./exampleData";
import secretKey from "../secret/secretKey";
import baseHOST from "../secret/baseHOST";
import shortCutList from "./shortCutList";
import ExportXLSX from "./ExportXLSX";
import ImportXLSX from "./ImportXLSX";
//variation
const HOST = baseHOST+':7899';
const hiddenSurveyHOST = baseHOST + ':3000/survey/view?hidden=';
const TOKEN = '12345';
const okdb = new OkdbClient(HOST);
const DATA_TYPE = 'todo-tasks';
var xSheet ;
var sendPresenceActive = false;

function ExcelPage() {

  const [values, setValues] = useState({
    userName:"",
    sheetName:"",
  });
  const [cookies, setCookie, removeCookie] = useCookies({
    userName:"",
    sheetName:"",
  });

  const [pageId, setPageId] = useState(0);
  const [user, setUser] = useState(null);
  const [read, setRead] = useState(false);
  const [sheetData, setSheetData] = useState(null);
  const [documentId, setDocumentId] = useState('login');
  const sheetRef = useRef(null);
  // online status and cursor/selections of other participants
  const [presences, setPresences] = useState({});
  // spreadsheet data
  const [grid, setGrid] = useState(null);
  const [wasEditing, setWasEditing] = useState(false);
  const [editingCell, setEditingCell] = useState(undefined);
  const stateRef = useRef();
  stateRef.current = presences;
  const [localSelection, setLocalSelection] = useState({
    start:{ri:0,ci:0},
    end:{ri:0,ci:0},
  });

  const broadcast = (messege) => {
        console.log("messege",messege);
        okdb.op(messege);
        okdb.sendPresence({ situation: "end_messege"});
  }

  // callback to recieve status changes of other collaborators
  const presenceCallback = (id, data) => {
  console.log("presenceCallback@", documentId,"id@",id,"data@", data);
  var ifFirst=true;
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
        xSheet.loadData({
            ...data.data,
            selector : data.selection,
        });
        //console.log("excel_changed",data.data, xSheet.data )
        setSheetData(data.data);

        if(data.situation === "survey_result"){
            setPresences(prev => {
                const newState = cloneDeep(prev);
                delete newState[id];
                return newState;
              });
        }


    } else if (data.situation === "excel_selected") {
      //console.log("selected", data);
      const colors = ['#5552FF', '#0FA956'];
      const index = data.user.id;
      const colorIdx = index % colors.length;

      //const sdom = document.getElementById("x-spreadsheet-demo").querySelector(`tbody tr:nth-child(${1}) td:nth-child(${1})`);
      //console.log("sdom",sdom);
      //xSheet.cellText(data.selection.start.ri, data.selection.start.ci, ).reRender();

        /* setPresences(prev => {
      console.log("keys",prev, Object.keys(prev) );
        const index = Object.keys(prev).findIndex(item => item === id);
        const colors = ['#5552FF', '#0FA956'];
        const colorIdx = index % colors.length;
        const color = colors[colorIdx];
        const newState = cloneDeep(prev);
        newState[id] = {
          id,
          color,
          ...data,
        };
        return newState;

      });*/

    }
    /*else if (data.situation === "edited") {
        console.log("here!");
        //xSheet.loadData(exampleData2);
        xSheet.cellText(data.selection.start.ri, data.selection.start.ci, data.text).reRender();
     }*/
    }else {console.log("first",id, stateRef.current)

      setPresences(prev => {
        const index = Object.keys(prev).findIndex(item => item === id);
        const colors = ['#5552FF', '#0FA956'];
        const colorIdx = index % colors.length;
        const color = colors[colorIdx];
        const newState = cloneDeep(prev);
        newState[id] = {
          id,
          color,
          ...data,
        };
        return newState;

      });}
    }
  };



  useEffect(() => {
      setValues({
      ...values,
      ...cookies,
      });
  }, []);

  useEffect(() => {
    //console.log('update_document_id', documentId);
    document.title = `${documentId+".xlsx"}`;
    if (pageId ===0 ) return;
    // 1. step - connect
    okdb.connect({token:TOKEN, userName: values.userName})
      .then(user => {
        //console.log('[okdb] connected as ', user, documentId);
        setUser(user);
        // 2. step - open document for collaborative editing   
        okdb.open(
          DATA_TYPE, // collection name
          documentId,
          {data:JSON.stringify(exampleData)}, // default value to save if doesn't exist yet
          {
            onPresence: presenceCallback,
          },
        ).then(openedData => {
            // get the data once the doc is opened
            console.log('Loaded doc from server ', JSON.parse(openedData.data));
            setSheetData(JSON.parse(openedData.data));

            xSheet = new Spreadsheet("#x-spreadsheet-demo",
            {
                mode: 'edit', // edit | read
                  showToolbar: true,
                  showGrid: true,
                  showContextmenu: true,
                  showBottomBar: false,
                  view: {
                    height: () => document.documentElement.clientHeight*10/12,
                    width: () => document.documentElement.clientWidth*10/12,
                  },
                  row: {
                    len: 100,
                    height: 25,
                  },
                  col: {
                    len: 26,
                    width: 100,
                    indexWidth: 60,
                    minWidth: 60,
                  },
                  style: {
                    bgcolor: '#ffffff',
                    align: 'left',
                    valign: 'middle',
                    textwrap: false,
                    strike: false,
                    underline: false,
                    color: '#0a0a0a',
                    font: {
                      name: 'Helvetica',
                      size: 10,
                      bold: false,
                      italic: false,
                    },
                  },
            }).loadData(JSON.parse(openedData.data)).change(changedData => {

            console.log("changed!");

            setSheetData(prev=>{

             var newSheetData = { ...prev }
             newSheetData = {
                ...newSheetData,
                ...changedData
             }

              okdb.put(DATA_TYPE, documentId, {data:JSON.stringify(newSheetData)}).then(res =>{
                //console.log("doc saved, ", res);
                setSheetData(newSheetData);




                  broadcast({
                      situation: "excel_changed",
                      data:newSheetData
                    });
              }).catch((err) =>  console.log("Error updating doc", err));


              //  1.  데이터가 작성 완료되었을때
              //  2.  postgresql 에 데이터저장
              // 3. okdb precense 로 사용자들한테 뿌림
              // 4. precense callback 으로 loaddata 다시함
              //
              //setSheetData(changedData);
                // save data to db
              });

              xSheet.validate();


             })

             xSheet.on('cell-selected', (cell, ri, ci) => {

                console.log("cell-selected",xSheet.data )

                   const newLocalSelection = {
                        ri:ri,
                        ci:ci,
                        range:{
                            sri: 0,
                            sci: 0,
                            eri: 0,
                            eci: 0,
                            w: 0,
                            h: 0
                        }
                  };
                  setLocalSelection(newLocalSelection);
                  broadcast({
                      situation: 'excel_selected',
                      cell:cell,
                      selection: newLocalSelection,
                  });
              });

              xSheet.on('cells-selected', (cell, { sri, sci, eri, eci }) => {

                    console.log("cells-selected",xSheet.data )
                    const newLocalSelection = {
                        ri: sri,
                        ci: sci,
                        range:{
                            sri: sri,
                            sci: sci,
                            eri: eri,
                            eci: eci,
                            w: sci-sri,
                            h: eci-eri,
                        }
                    };
                    setLocalSelection(newLocalSelection);
                    broadcast({
                      situation: 'excel_selected',
                      cell:cell,
                      selection: newLocalSelection,
                    });
                });
              // edited on cell
              /*
              xSheet.on('cell-edited', (text, ri, ci) => {
              okdb.sendPresence({
                      situation: 'edited',
                      text:text,
                      selection: {
                        start: {ri:ri,ci:ci},
                        end:{ri:ri,ci:ci},
                      },
                    });
              });*/


          })
          .catch(err => {
            console.log('Error opening doc ', err);
          });
      })
      .catch(err => {
        console.error('[okdb] error connecting ', err);
      });
  }, [documentId]);


  const otherSelections = Object.keys(presences)
    .map(presenceId => presences[presenceId])
    .filter(item => 'start' in item && 'end' in item);

   /*
  const handleCellChange = (e) => {
    const cell = e.currentTarget;
    const textarea = cell.lastChild;
    setEditingCell(cell);
    cell.style.height = `${textarea.scrollHeight}px`;
  };

  const handleSheet = (sheet) => {
  console.log("handleSheet", sheet);
    if (sheet === null) return;

    sheetRef.current = sheet;
    const currentEditing = sheet.state.forceEdit;
    if (wasEditing && !currentEditing) {
      editingCell.style.height = '';
      setEditingCell(undefined);
    }
    setWasEditing(currentEditing);
  };

   const handleXSheet = (sheet) => {
   if (sheet === null) return;
   //console.log("xSheet",xSheet);
    //sheet.state.cellText(5, 5, 'xxxx').cellText(6, 5, 'yyy').reRender();
   }*/


  const handleLoginInfoChange = (e) => {
  setCookie(e.target.name, e.target.value);
    e.persist();
    setValues(v => ({
      ...v,
      [e.target.name]: e.target.value
    }));
  };

  const handlePageIdChange = (e)=> {
    setDocumentId(values.sheetName);
    setPageId(1);

  }

  const handleMecroSheetChange = (e) => {
      const name = e.target.name;
      setCookie("sheetName", name);
      setValues(v => ({
          ...v,
          sheetName: name,
      }))
      if(values.userName !== ""){
        setDocumentId(name);
        setPageId(1);
      };
  }

  const resetSheet = () => {

    setSheetData(prev => {
        var newSheetData = {
          ...prev,
          rows:{
            len:100,
           },
        }

        Object.keys(prev.rows).filter(it =>!isNaN(it ) ).map(rn => {
            Object.keys(prev.rows[rn].cells).map(cn => {
                if(prev.rows[rn].cells[cn].editable ===false){
                    newSheetData = {
                        ...newSheetData,
                        rows:{
                            ...newSheetData.rows,
                            [rn]:{
                                ...newSheetData.rows[rn],
                                cells:{
                                    ...newSheetData.rows[rn]?.cells,
                                    [cn]:{
                                        ...prev.rows[rn]?.cells[cn],
                                        editable:false,
                                    }

                                }

                            },
                        }

                    }
                }
            })
        })


        okdb.put(DATA_TYPE, documentId, {data:JSON.stringify(newSheetData)}).then(res =>{
            //console.log("doc saved, ", res);

          broadcast({
              situation: "excel_changed",
              data:newSheetData
            });

         })

        xSheet.loadData({
            ...newSheetData,
        });

         return newSheetData

     })
  }

  useEffect(() => {
  if(values.pageGo) {
  setPageId(1);
  }
    }, [values]);


  if (pageId===0){
  return(
      <div className="section is-fullheight">
      <div className="container">
      <img  src={navy_img} width="20%"/>
        <div className="column is-4 is-offset-4">
          <div className="box">
            <form onSubmit={handlePageIdChange}>
              <div className="field">
                <label className="label"><h1>User Name</h1></label>
                <div className="control">
                  <input
                    autoComplete="off"
                    className={"is-danger"}
                    onChange={handleLoginInfoChange}
                    value={ values.userName || ""}
                    name="userName"
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label className="label"><h1>Sheet Name</h1></label>
                <div className="control">
                  <input
                    className={"is-danger"}
                    name="sheetName"
                    onChange={handleLoginInfoChange}
                    value={ values.sheetName || ""}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="button is-block is-info is-fullwidth"
              >
                Join
              </button>
            </form>
          </div>

        </div>
        <div className="button-holder">
        { shortCutList.map( (data, idx) =>
        <button
            key = {idx}
            type="submit"
            name= {data.name}
            className="button is-block is-info"
            onClick={handleMecroSheetChange}
            style={{
                width:"20%",
                backgroundColor: data.color
            }}
          > {data.name}</button>

        )
          }
          </div>
      </div>
    </div>)

  }
  else{
  const surveyFormLink = `${"/survey/create?sheet="+documentId}`
  const surveyViewLink = `${"/survey/view?sheet="+documentId}`


  return (
    <Grid container spacing={3}>
      <Grid item md={10}>
        <h1 className = "title1" align="center">{documentId}</h1>

        <label className="input-file-button" for="input-file">
          엑셀 업로드 하기 <FcUpload/>
        </label>
        <input type="file" id="input-file" style={{display:"none"}} accept=".xls, .xlsx" onChange={(fileObject) => {ImportXLSX(xSheet, fileObject) }}/>


        <button className = "B2" onClick={() => ExportXLSX(xSheet,documentId)}>엑셀 다운받기 <FcDownload/></button>
        <Link to={surveyFormLink} target="_blank">
             <button className = "B1" type="button">
                  설문조사 양식 만들기 <RiSurveyFill/>
             </button>
         </Link>
         <Link to={surveyViewLink} target="_blank">
             <button className = "B4" type="button">
                  설문조사 하러가기 <FaCheckSquare/>
             </button>
         </Link>
         <CopyToClipboard text={hiddenSurveyHOST + crypto.AES.encrypt(documentId, secretKey).toString()}>
             <button className = "B3" type="button" >
                  설문조사 암호링크 복사 <VscGistSecret/>
             </button>
         </CopyToClipboard>
         <button className = "B5" type="button" onClick={()=>resetSheet()}>
                  수정가능 영역 리셋 <GrPowerReset  className="myCss1"/>
             </button>
          <div
            style={{ height: "83%", width: "auto" }}
            id="x-spreadsheet-demo"
        ></div>

      </Grid>
      <Grid item md={2}>
        <div className="online-panel">
          <h4>온라인:</h4>
          <div className="online-item" key="000">
            <svg width="10" focusable="false" viewBox="0 0 10 10" aria-hidden="true" title="fontSize small">
              <circle cx="5" cy="5" r="5"></circle>
            </svg>
            나 ({user ? user.name : 'connecting...'})
          </div>
          <AppUsers presences={presences} />
        </div>
      </Grid>
    </Grid>

  );}


}


export default ExcelPage;


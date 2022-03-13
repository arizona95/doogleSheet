import { Grid, Paper } from '@material-ui/core';
import cloneDeep from 'lodash/cloneDeep';
import OkdbClient from 'okdb-client';
import OkdbSpreadsheet from 'okdb-spreadsheet';
import 'okdb-spreadsheet/lib/styles.css';
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import "x-data-spreadsheet/dist/xspreadsheet.css";
import './App.css';
import AppUsers from './AppUsers';
import "bulma/css/bulma.css";
import navy_img from "./navy.svg";
import Spreadsheet from "x-data-spreadsheet";
import exampleData from "./exampleData";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";


const HOST = 'http://localhost:7899';
const TOKEN = '12345';
const okdb = new OkdbClient(HOST);
var xSheet ;
const DATA_TYPE = 'todo-tasks';


function App() {

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
  const [sheetData, setSheetData] = useState(exampleData);
  const [documentId, setDocumentId] = useState('login');
  const sheetRef = useRef(null);
  // online status and cursor/selections of other participants
  const [presences, setPresences] = useState({});
  // spreadsheet data
  const [grid, setGrid] = useState(null);
  const [wasEditing, setWasEditing] = useState(false);
  const [editingCell, setEditingCell] = useState(undefined);

  // cell selection saved locally
  const [localSelection, setLocalSelection] = useState({});
  // mouse position saved locally
  const [localMouse, setLocalMouse] = useState({});

  // callback to receive data changes from others
  const updateCallback = (data, meta) => {
    console.log("updateCallback ", data, meta);
    const newData = cloneDeep(data);
    setGrid(newData);
  };

  // callback to recieve status changes of other collaborators
  const presenceCallback = (id, data) => {
  console.log("presenceCallback", documentId,id, data);
  if (!data) {
  console.log("user deleted!")
      setPresences(prev => {
        const newState = cloneDeep(prev);
        delete newState[id];
        return newState;
      });

      return;
     } else if (data.user && data.user.id) {
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
      });
    }

    if(data.situation === "changed") {
        xSheet.loadData(data.data);
    } else if (data.situation === "selected") {
      console.log("selected", data);
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

  };



  useEffect(() => {
      setValues({
      ...values,
      ...cookies,
      });
  }, []);

  useEffect(() => {
    console.log('update_document_id', documentId);
    document.title = `${documentId}`;
    if (pageId ===0 ) return;
    // 1. step - connect
    okdb.connect({token:TOKEN, userName: values.userName})
      .then(user => {
        console.log('[okdb] connected as ', user, documentId);
        setUser(user);
        // 2. step - open document for collaborative editing   
        okdb.open(
          DATA_TYPE, // collection name
          documentId,
          {data:JSON.stringify(exampleData)}, // default value to save if doesn't exist yet
          {
            onChange: updateCallback,
            onPresence: presenceCallback,
          },
        ).then(openedData => {
            // get the data once the doc is opened
            console.log('Loaded doc from server ', openedData);

            xSheet = new Spreadsheet("#x-spreadsheet-demo",
            {
                mode: 'edit', // edit | read
                  showToolbar: true,
                  showGrid: true,
                  showContextmenu: true,
                  view: {
                    height: () => document.documentElement.clientHeight,
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


              console.log("okdb.put",DATA_TYPE, documentId ,changedData);

              const newData = cloneDeep(changedData);

              okdb.put(DATA_TYPE, documentId, {data:JSON.stringify(changedData)}).then(res =>{
                console.log("doc saved, ", res);


                  okdb.sendPresence({
                          situation: "changed",
                          data:changedData
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

              xSheet.on('cell-selected', (cell, ri, ci) => {
                okdb.sendPresence({
                      situation: 'selected',
                      cell:cell,
                      selection: {
                        start: {ri:ri,ci:ci},
                        end:{ri:ri,ci:ci},
                      },
                    });
                });

              xSheet.on('cells-selected', (cell, { sri, sci, eri, eci }) => {
                okdb.sendPresence({
                      situation: 'selected',
                      cell:cell,
                      selection: {
                        cell:cell,
                        start:{ri:sri,ci:sci},
                        end:{ri:eri,ci:eci},
                      },
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

  const updateDoc = (newDoc) => {
    okdb.put(DATA_TYPE, documentId, newDoc)
      .then(res => {
        console.log('doc saved, ', res);
      })
      .catch((err) => console.log('Error updating doc', err));
  };

  const otherSelections = Object.keys(presences)
    .map(presenceId => presences[presenceId])
    .filter(item => 'start' in item && 'end' in item);

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
   }


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
        <button
            type="submit"
            name="일일보안결산"
            className="button is-block is-info"
            onClick={handleMecroSheetChange}
            style={{
                width:"20%",
                backgroundColor: "#C05780"}}
          > 일일보안결산 </button>
          <button
            type="submit"
            name="주간업무계획"
            className="button is-block is-info"
            onClick={handleMecroSheetChange}
            style={{
                width:"20%",
                backgroundColor: "#FF828B"}}
          > 주간업무계획 </button>
          <button
            type="submit"
            name="비품조사"
            className="button is-block is-info"
            onClick={handleMecroSheetChange}
            style={{
                width:"20%",
                backgroundColor: "#E7C582"}}
          > 비품조사 </button>
          <button
            type="submit"
            name="기타"
            className="button is-block is-info"
            onClick={handleMecroSheetChange}
            style={{
                width:"20%",
                backgroundColor: "#00B0BA"}}
          > 기타 </button>
          <button
            type="submit"
            name="금주주요소식"
            className="button is-block is-info"
            onClick={handleMecroSheetChange}
            style={{
                width:"20%",
                backgroundColor: "#0065A2"}}
          > 금주주요소식 </button>
          </div>
      </div>
    </div>)

  }
  else{
  return (
    <Grid container spacing={3}>
      <Grid item md={10}>
        <h1 className = "title1" align="center">{documentId}</h1>
        <div
        style={{ height: "100%", width: "auto" }}
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


export default App;


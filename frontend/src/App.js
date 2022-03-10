import { Grid, Paper } from '@material-ui/core';
import cloneDeep from 'lodash/cloneDeep';
import OkdbClient from 'okdb-client';
import OkdbSpreadsheet from 'okdb-spreadsheet';

import 'okdb-spreadsheet/lib/styles.css';
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import '../node_modules/jspreadsheet-ce/dist/jspreadsheet.css';
import './App.css';
import AppUsers from './AppUsers';
import initialGrid from './initialGrid';
import { calculateTotals } from './utils';
import "bulma/css/bulma.css";
import navy_img from "./navy.svg";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";


// location of your server
const HOST = 'http://localhost:7899';
// token for user authentication, handled by the auth handler on the server side
const TOKEN = '12345';
const okdb = new OkdbClient(HOST);

// data type, typically corresponds to the table name
const DATA_TYPE = 'todo-tasks';
// id of the object to be edited collaboratively
//const DOCUMENT_ID = "spreadsheet-2"; 


const createResizableColumn = function (col, resizer) {
  // Track the current position of mouse

  let x = 0;
  let w = 0;

  const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;

    // Calculate the current width of column
    const styles = window.getComputedStyle(col);
    w = parseInt(styles.width, 10);

    // Attach listeners for document's events
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    // Determine how far the mouse has been moved
    const dx = e.clientX - x;

    // Update the width of column
    col.style.width = `${w + dx}px`;
  };

  // When user releases the mouse, remove the existing event listeners
  const mouseUpHandler = function () {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  resizer.addEventListener('mousedown', mouseDownHandler);
};


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

  const [documentId, setDocumentId] = useState('testsheet');
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
    const newData = cloneDeep(data);
    calculateTotals(newData);
    setGrid(newData);
  };

  // callback to recieve status changes of other collaborators
  const presenceCallback = (id, data) => {
  console.log("documentId", documentId)
    if (!data || data.situation === 'changeDocumentId') {
      setPresences(prev => {
        const newState = cloneDeep(prev);
        delete newState[id];
        return newState;
      });
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
  };

  useEffect(() => {
      setValues({
      ...values,
      ...cookies,
      });
  }, []);

  useEffect(() => {
    console.log('update_document_id', documentId);
    document.title = `document Id is ${documentId}`;
    if (pageId ===0 ) return;
    // 1. step - connect
    okdb.connect({token:TOKEN, userName: values.userName})
      .then(user => {
        console.log('[okdb] connected as ', user);
        setUser(user);
        // 2. step - open document for collaborative editing   
        okdb.open(
          DATA_TYPE, // collection name
          documentId,
          initialGrid, // default value to save if doesn't exist yet
          {
            onChange: updateCallback,
            onPresence: presenceCallback,
          },
        )
          .then(data => {
            // get the data once the doc is opened
            console.log('Loaded doc from server ', data);
            calculateTotals(data);
            setGrid(data);

            const table = document.getElementById('resizeMe');

            // Query all headers
            const cols = table.querySelectorAll('td');

            // Loop over them
            [].forEach.call(cols, function (col) {
              // Create a resizer element
              const resizer = document.createElement('div');
              resizer.classList.add('resizer');

              // Add a resizer element to the column
              col.appendChild(resizer);

              // Will be implemented in the next section
              createResizableColumn(col, resizer);
            });

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
    if (sheet === null) return;

    sheetRef.current = sheet;
    const currentEditing = sheet.state.forceEdit;
    if (wasEditing && !currentEditing) {
      editingCell.style.height = '';
      setEditingCell(undefined);
    }
    setWasEditing(currentEditing);
  };


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
        {grid &&
          <Paper>
            <div id="okdb-table-container">
              <div style={{ overflow: 'auto' }}>
                <OkdbSpreadsheet
                  ref={handleSheet}
                  data={grid}
                  valueRenderer={cell => cell.value}
                  overflow="clip"
                  onCellsChanged={changes => {
                    console.log("changes", changes);
                    const newGrid = grid.map(row => [...row]);
                    changes.forEach(({ cell, row, col, value }) => {
                      newGrid[row][col] = { ...grid[row][col], value };
                    });
                    calculateTotals(newGrid);
                    setGrid(newGrid);
                    updateDoc(newGrid);
                  }}
                  selections={otherSelections}
                  onSelect={(selection) => {
                    const sheet = sheetRef.current;
                    if (sheet !== null) {
                      const { i, j } = selection.start;
                      const cell = sheet.dgDom.querySelector(`tbody tr:nth-child(${i + 1}) td:nth-child(${j + 1})`);
                      cell.removeEventListener('keydown', handleCellChange);
                      cell.removeEventListener('dblclick', handleCellChange);
                      cell.addEventListener('keydown', handleCellChange);
                      cell.addEventListener('dblclick', handleCellChange);
                    }
                    setLocalSelection(selection);
                    console.log('selection1', selection);
                    console.log('selection2', localMouse);
                    console.log('selection4', sheetRef);
                    okdb.sendPresence({
                      ...selection,
                      ...localMouse,
                      documentId: documentId,
                    });
                  }}
                />
              </div>
            </div>
          </Paper>
        }
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


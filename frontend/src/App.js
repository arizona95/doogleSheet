import { Grid, Paper } from '@material-ui/core';
import cloneDeep from 'lodash/cloneDeep';
import OkdbClient from 'okdb-client';
import OkdbSpreadsheet from 'okdb-spreadsheet';

import 'okdb-spreadsheet/lib/styles.css';
import React, { useEffect, useRef, useState } from 'react';
import '../node_modules/jspreadsheet-ce/dist/jspreadsheet.css';
import './App.css';
import AppUsers from './AppUsers';
import initialGrid from './initialGrid';
import { calculateTotals } from './utils';

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

  const [user, setUser] = useState(null);

  const [documentId, setDocumentId] = useState('testsheet');
  const connectedRef = useRef(false);
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
    okdb.open(
      DATA_TYPE, // collection name
      documentId,
      initialGrid, // default value to save if doesn't exist yet
      {
        onChange: updateCallback,
        onPresence: presenceCallback,
      })
      .then(data => {
        // get the data once the doc is opened
        console.log('Loaded doc from server ', data);
        connectedRef.current = true;
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

    if (connectedRef.current) {
      okdb.sendPresence({
        ...{ situation: 'changeDocumentId' },
        ...{ documentId: documentId },
      });
    }
  }, [documentId]);


  useEffect(() => {
    console.log('update_document_id', documentId);
    document.title = `document Id is ${documentId}`;
    // 1. step - connect
    okdb.connect(TOKEN)
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
            connectedRef.current = true;
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
  }, []);

  /*
  useEffect(() => {
    const handler = e => {
      const container = document.querySelector('#okdb-table-container');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      var left = e.clientX - containerRect.left;
      var top = e.clientY - containerRect.top;
      const mousePos = {
        left,
        top,
      };
      setLocalMouse(mousePos);
      if (connectedRef.current) {
        okdb.sendPresence({
          ...mousePos,
          ...localSelection,
        });
      }
    };

    window.addEventListener('mousemove', handler);
    return () => {
      window.removeEventListener('mousemove', handler);
    };
  }, [localSelection]);
  */

  const updateDoc = (newDoc) => {
    if (connectedRef.current) {
      okdb.put(DATA_TYPE, documentId, newDoc)
        .then(res => {
          console.log('doc saved, ', res);
        })
        .catch((err) => console.log('Error updating doc', err));
    }
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

  const handleDocumentIdChange = (e) => {
    const form = e.currentTarget;
    const documentId = form.documentId.value;
    setDocumentId(documentId);
    form.reset();
    e.preventDefault();
  };

  return (
    <Grid container spacing={3}>
      <Grid item md={10}>
        <h1 align="center">{documentId}</h1>
        sheet:
        <form onSubmit={handleDocumentIdChange}>
          <input type="text" name="documentId" placeholder="Put Document Id" id="documentId" />
          <button type="submit">Go</button>
        </form>
        {grid &&
          <Paper>
            <div id="okdb-table-container">
              <div ref={connectedRef} />
              <div style={{ overflow: 'auto' }}>
                <OkdbSpreadsheet
                  ref={handleSheet}
                  data={grid}
                  valueRenderer={cell => cell.value}
                  overflow="clip"
                  onCellsChanged={changes => {
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
                    console.log('selection3', connectedRef);
                    console.log('selection4', sheetRef);
                    if (connectedRef.current) {
                      okdb.sendPresence({
                        ...selection,
                        ...localMouse,
                        ...{ documentId: documentId },
                      });
                    }
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

  );


}


export default App;


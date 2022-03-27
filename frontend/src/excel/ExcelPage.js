//base
import { Container, Grid, Paper } from '@material-ui/core';
import { Alert as MuiAlert } from "@material-ui/lab";
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
//component
import AppUsers from '../AppUsers';
import ExportXLSX from "./ExportXLSX";
import ImportXLSX from "./ImportXLSX";
//library
import crypto from 'crypto-js';
import OkdbClient from 'okdb-client';
import Spreadsheet from "x-data-spreadsheet";
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Quill from "quill";
import QuillCursors from "quill-cursors";
//css
import "x-data-spreadsheet/dist/xspreadsheet.css";
import './Excel.css';
import "bulma/css/bulma.css";
import "../text/App.css";
import "quill/dist/quill.snow.css";
//icon
import { FcUpload } from 'react-icons/fc';
import { FcDownload } from 'react-icons/fc';
import { RiSurveyFill } from 'react-icons/ri';
import { FaCheckSquare } from 'react-icons/fa';
import { VscGistSecret } from 'react-icons/vsc';
import { GrPowerReset } from 'react-icons/gr';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { RiFileWord2Fill } from 'react-icons/ri';
//data
import navy_img from "./navy.svg";
import exampleData from "./exampleData";
import secretKey from "../secret/secretKey";
import baseHOST from "../secret/baseHOST";
import shortCutList from "./shortCutList";
//constant
const TOKEN = '12345';
const HOST = baseHOST+':7899';
const DATA_TYPE = 'excel';
const okdb = new OkdbClient(HOST);
const MAX_LINE_NUM = 500
const hiddenSurveyHOST = baseHOST + ':3000/survey/view?hidden=';
//variation
var xSheet ;
var cellSelector ;
Quill.register("modules/cursors", QuillCursors);

function ExcelPage() {
  //useState
  const [values, setValues] = useState({
    userName: "",
    sheetName: "",
  });
  const [cookies, setCookie, removeCookie] = useCookies({
    userName: "",
    sheetName: "",
  });
  const [pageId, setPageId] = useState(0);
  const [pageMode, setPageMode] = useState("excel");
  const [user, setUser] = useState(null);
  const [read, setRead] = useState(false);
  const [documentId, setDocumentId] = useState('login');
  //> online status and cursor/selections of other participants
  const [presences, setPresences] = useState({});
  const stateRef = useRef(null);
  stateRef.current = presences;
  const [localSelection, setLocalSelection] = useState({
  	start: {
      ri: 0,
      ci: 0
    },
    end: {
      ri: 0,
      ci: 0
    },
  });

  //textEditor Add

  const Alert = props => {
		return <MuiAlert elevation={6} variant="filled" {...props} />;
	};
	const colors = ["#5551FF", "#0FA958"];

	const getUserColor = index => colors[index % colors.length];

	const [doc, setDoc] = useState(null);

  const [error, setError] = useState(null);
  const connectedRef = useRef(false);
  const editorRef = useRef(null);
  const mousePointerRef = useRef(null);
  const editorCursorRef = useRef(null);





  //useEffect

  useEffect(() => {
    document.title = `${documentId+".xlsx"}`;
    if (pageId === 0) return;
    // 1. step - connect
    okdb.connect({
        token: TOKEN,
        userName: values.userName
      })
      .then(user => {
        setUser(user);
        // 2. step - open document for collaborative editing

        // textEditor Add
        /*
        const defaultValue =  [{
          insert: 'Hello world\n'
        }];
        const onOperation = (data, meta) => {
          // callback to receive changes from others
          console.log("onOperation", data, meta);
          if (editorRef.current) {
            console.log("Editor update", data);
            editorRef.current.updateContents(data);
          }
        };
        */



        okdb.open(
            DATA_TYPE, // collection name
            documentId,
            {data:exampleData}, // default value to save if doesn't exist yet
            {
              onPresence: presenceCallback,
            },
          ).then(openedData => {
            // get the data once the doc is opened
            xSheet = new Spreadsheet("#x-spreadsheet-demo", {
              mode: 'edit', // edit | read
              showToolbar: true,
              showGrid: true,
              showContextmenu: true,
              showBottomBar: false,
              view: {
                height: () => document.documentElement.clientHeight * 10 / 12,
                width: () => document.documentElement.clientWidth * 10 / 12,
              },
              row: {
                len: MAX_LINE_NUM,
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
            }).loadData(JSON.parse(openedData.data))

            xSheet.validate();
            cellSelector = {
              start: {
                ri: 0,
                ci: 0,
              },
              end: {
                ri: 0,
                ci: 0,
              }
            };



            xSheet.on('cell-selected', (cell, ri, ci) => {

              const newSheetData = {
                ...JSON.parse(okdb.connection.collections[DATA_TYPE][documentId].data.data),
                ...xSheet.datas[0].getData()
              }



              cellSelector = {
                start: {
                  ri: ri,
                  ci: ci,
                },
                end: {
                  ri: ri,
                  ci: ci,
                }
              };

              updateAll({
                situation: "data_changed",
                selection: cellSelector,
                updateData: newSheetData,
              })

            });

							//texteditor Add
							/*
             connectedRef.current = true;
            	setDoc(openedData.textData);
            	*/


          })
          .catch(err => {
            console.log('Error opening doc ', err);
          });
      })
      .catch(err => {
        console.error('[okdb] error connecting ', err);
      });
  }, [documentId]);

  useEffect(() => {
    if (values.pageGo) {setPageId(1)}
  }, [values]);

  useEffect(() => {
    setValues({
      ...values,
      ...cookies,
    });
  }, []);

  //texteditor Add

   useEffect(() => {

   if (pageId === 0) return;
    console.log("Editor init");

    var toolbarOptions = [
          [{ 'font': [] }, { 'size': [] }],
          [ 'bold', 'italic', 'underline', 'strike' ],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'script': 'super' }, { 'script': 'sub' }],
          [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block' ],
          [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
          [ 'direction', { 'align': [] }],
          [ 'link', 'image', 'video', 'formula' ],
          [ 'clean' ]
       ];

    const editor = new Quill("#text-container", {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
        cursors: {
          transformOnTextChange: true,
        },
      },
    });

    /*

    editorRef.current = editor;


    editor.on("text-change", (delta, oldDelta, source) => {
      if(source !== "user") return;
      const contents = editor.getContents();

      console.log("text-change ", delta, contents, source);
      delta.type = "rich-text";
      if(connectedRef.current) {
        okdb.put("text", documentId, delta)
        .catch(err => console.log("Error updating doc", err));
      }

    });
    editor.on("selection-change", function (range, oldRange, source) {
      console.log("Local cursor change: ", range);
      editorCursorRef.current = range;
      if(connectedRef.current) {
        okdb.sendPresence({
          editorCursor: range,
          mousePointer: mousePointerRef.current
        });
      }
    });
    */
  }, [editorRef, documentId]);



  useEffect(() => {
    const container = document.querySelector("#text-container");

    const handler = e => {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      // calculate relative position of the mouse in the container
      var left = e.clientX - containerRect.left;
      var top = e.clientY - containerRect.top;
      const value = {
        left,
        top,
      };
      mousePointerRef.current = value;
      if(connectedRef.current) {
        okdb.sendPresence({
          mousePointer: value,
          editorCursor: editorCursorRef.current
        });
      }
    };

  }, [editorRef]);
  /*

  useEffect(() => {
    if (doc && editorRef.current) {
      console.log("Editor update", doc);
      editorRef.current.setContents(doc);
    }
  }, [editorRef, doc]);*/


  //function

  const updateAll = (messege) => {
    if (messege.situation === "data_changed") {
      okdb.put(DATA_TYPE, documentId, {
        data: JSON.stringify(messege.updateData)
      }).then(res => {
        okdb.sendPresence({
          situation: messege.situation,
          selection: messege.selection,
        });
      }).catch((err) => console.log("Error updating doc", err));
    }
  }

  // callback to recieve status changes of other collaborators
  const presenceCallback = (id, data) => {

  	console.log("presenceCallback",xSheet,data)
    var ifFirst = true;
    if (!data) {
      //console.log("user deleted!")
      setPresences(prev => {
        const newState = cloneDeep(prev);
        delete newState[id];

        // textEdit ADD
        /*
        if(editorRef.current) {
          const cursors = editorRef.current.getModule("cursors");
          cursors.removeCursor(id);
        }
        */

        return newState;
      });

      return;
    } else if (data.user && data.user.id) {
      if (!Object.keys(stateRef.current).includes(id)) {

        //console.log("first",id, stateRef.current)
        setPresences(prev => {
          const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
          const newState = cloneDeep(prev);
          //const styleId =xSheet.sheet.data.addStyle({bgcolor:color});
          newState[id] = {
            id,
            color,
            ...data,
            //styleId
          };

          // textEdit ADD
          /*
          if(editorRef.current) {
						const cursors = editorRef.current.getModule("cursors");
						if(data.editorCursor) {
							cursors.createCursor(id, data.user.name, prev.color);
							cursors.moveCursor(id, data.editorCursor);
							cursors.toggleFlag(id, true);
						} else {
							cursors.removeCursor(id);
						}
					}
					*/

          return newState;
        });

      } else {
        if (data.situation === "data_changed") {
          // update style
          const originData = JSON.parse(okdb.connection.collections[DATA_TYPE][documentId].data.data)

          /*
          var newStyleSheet ;

          if(data.selection){
              newStyleSheet = {
                  ...originData,
                  rows:{
                      ...originData.rows,
                      [data.selection.start.ri]:{
                          ...originData.rows[data.selection.start.ri],
                          cells:{
                              ...originData.rows[data.selection.start.ri]?.cells,
                              [data.selection.start.ci]:{
                                  ...originData.rows[data.selection.start.ri]?.cells.[data.selection.start.ci],
                                  style:stateRef.current[id].styleId
                              }
                          }
                      }
                  },
                  styles:xSheet.sheet.data.styles,
              }
          }else{
              newStyleSheet = {
                  ...originData,
                  styles:xSheet.sheet.data.styles,
              }
          }
          */

          //xSheet.sheet.loadData(newStyleSheet);
          //xSheet.sheet.data.setData(originData);
          xSheet.sheet.loadData(originData);

        }
      };
    }
  }

  const handleLoginInfoChange = (e) => {
    setCookie(e.target.name, e.target.value);
    e.persist();
    setValues(v => ({
      ...v,
      [e.target.name]: e.target.value
    }));
  };

  const handlePageIdChange = (e) => {
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
    if (values.userName !== "") {
      setDocumentId(name);
      setPageId(1);
    };
  }

  const resetSheet = () => {

    const originData = JSON.parse(okdb.connection.collections[DATA_TYPE][documentId].data.data);
    var newSheetData = {
      ...originData,
      rows: {
        len: MAX_LINE_NUM,
      },
    }

    Object.keys(originData.rows).filter(it => !isNaN(it)).map(rn => {
      Object.keys(originData.rows[rn].cells).map(cn => {
        if (originData.rows[rn].cells[cn].editable === false) {
          newSheetData = {
            ...newSheetData,
            rows: {
              ...newSheetData.rows,
              [rn]: {
                ...newSheetData.rows[rn],
                cells: {
                  ...newSheetData.rows[rn]?.cells,
                  [cn]: {
                    ...originData.rows[rn]?.cells[cn],
                    editable: false,
                  }
                }
              },
            },
          }
        }
      })
    })

    updateAll({
      updateData: newSheetData,
      situation: "data_changed",
    })

    // collaborators color
    newSheetData = {
      ...newSheetData,
      styles: xSheet.sheet.data.styles,
    }

    xSheet.sheet.loadData(newSheetData);
  }







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

        <div id="excel_show"  >
        	<div style={{marginLeft:"0.5em"}}>
        		<button className = "B6" type="button" onClick={()=>{
							document.getElementById("excel_show").style.display = "";
							document.getElementById("text_show").style.display = "none";
						}} >
								엑셀 <RiFileExcel2Fill/>
					 </button>
					 <button className = "B7" type="button" onClick={()=>{
							document.getElementById("excel_show").style.display = "none";
							document.getElementById("text_show").style.display = "";
						}}>
								워드 <RiFileWord2Fill/>
					 </button>
					<label className="input-file-button" for="input-file">
						엑셀 업로드<FcUpload/>
					</label>
					<input type="file" id="input-file" style={{display:"none"}} accept=".xls, .xlsx" onChange={(fileObject) => {ImportXLSX(xSheet, fileObject) }}/>
					<button className = "B2" onClick={() => ExportXLSX(xSheet,documentId)}>엑셀 다운로드<FcDownload/></button>
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

					 	</div>
						<div
							style={{ height: "83%", width: "auto" }}
							id="x-spreadsheet-demo"
						></div>
					</div>

					<div id="text_show" >
						<div style={{marginLeft:"0.5em"}}>
							<button className = "B6" type="button" onClick={()=>{
								document.getElementById("excel_show").style.display = "";
								document.getElementById("text_show").style.display = "none";
							}}>
									엑셀 <RiFileExcel2Fill/>
						 </button>
						 <button className = "B7" type="button" onClick={()=>{
								document.getElementById("excel_show").style.display = "none";
								document.getElementById("text_show").style.display = "";
							}}>
									워드 <RiFileWord2Fill/>
						 </button>
					 </div>
						<Paper>
							<div id="text-container"></div>
						</Paper>
					</div>


      </Grid>
      <Grid item md={2}>
        <div className="online-panel">
          <h4>온라인:</h4>
          <div className="online-item" key="000">
            <svg width="10" focusable="false" viewBox="0 0 10 10" aria-hidden="true" title="fontSize small" >
              <circle cx="5" cy="5" r="5" fill="#5552FF"></circle>
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


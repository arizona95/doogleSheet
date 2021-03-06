import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Viewer } from 'hwp.js';

function HWPViewerPage() {
  const url = 'download URL'
  const ref = useRef(null);

  useEffect(() => {
    loadFile()
  }, [])

  const showViewer = useCallback((file) => {
    const reader = new FileReader()

    reader.onloadend = (result) => {
      var _a;
      const bstr = (_a = result.target) === null || _a === void 0 ? void 0 : _a.result;

      if (bstr) {
        try {
          new Viewer(ref.current, bstr)
        }
      }
    }

    reader.readAsBinaryString(file)
  }, [])

  const loadFile = useCallback(() => {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function(event) {
      showViewer(new File([xhr.response], 'random'))
    };
    xhr.open('GET', url);
    xhr.send();
  }, [])

  return (
    <div className="viewer" ref={ref}/>
  )
}

export default HWPViewerPage
import * as XLSX from 'xlsx/dist/xlsx.full.min.js';
/*! xlsxspread.js (C) SheetJS LLC -- https://sheetjs.com/ */
/* eslint-env browser */
/*global XLSX */
/*exported stox, xtos */

/**
 * Converts data from SheetJS to x-spreadsheet
 *
 * @param  {Object} wb SheetJS workbook object
 *
 * @returns {Object[]} An x-spreadsheet data
 */
function stox(wb) {
  var out = [];
  wb.SheetNames.forEach(function (name) {
    var o = { name: name, rows: {} };
    var ws = wb.Sheets[name];
    var range = XLSX.utils.decode_range(ws['!ref']);
    // sheet_to_json will lost empty row and col at begin as default
    range.s = { r: 0, c: 0 };
    var aoa = XLSX.utils.sheet_to_json(ws, {
      raw: false,
      header: 1,
      range: range
    });

    aoa.forEach(function (r, i) {
      var cells = {};
      r.forEach(function (c, j) {
        cells[j] = { text: c };

        var cellRef = XLSX.utils.encode_cell({ r: i, c: j });

        if ( ws[cellRef] != null && ws[cellRef].f != null) {
          cells[j].text = "=" + ws[cellRef].f;
        }
      });
      o.rows[i] = { cells: cells };
    });

    o.merges = [];
    (ws["!merges"]||[]).forEach(function (merge, i) {
      //Needed to support merged cells with empty content
      if (o.rows[merge.s.r] == null) {
        o.rows[merge.s.r] = { cells: {} };
      }
      if (o.rows[merge.s.r].cells[merge.s.c] == null) {
        o.rows[merge.s.r].cells[merge.s.c] = {};
      }

      o.rows[merge.s.r].cells[merge.s.c].merge = [
        merge.e.r - merge.s.r,
        merge.e.c - merge.s.c
      ];

      o.merges[i] = XLSX.utils.encode_range(merge);
    });

    out.push(o);
  });

  return out;
}

/**
 * Converts data from x-spreadsheet to SheetJS
 *
 * @param  {Object[]} sdata An x-spreadsheet data object
 *
 * @returns {Object} A SheetJS workbook object
 */

 function importSheet(xSheet,file) {
 var input = file.target;
    var reader = new FileReader();
    reader.onload = function(){
        var fileData = reader.result;
        var wb = XLSX.read(fileData, {type : 'binary'});
        wb.SheetNames.forEach(function(sheetName){
	        var rowObj =XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
	        //console.log(JSON.stringify(rowObj));
        })
        try {
        xSheet.loadData(stox(wb));
        }catch (e) {
            console.log(e);
          }
    };
    reader.readAsBinaryString(input.files[0]);
 /*
 var reader = new FileReader();
  var new_sb = stox(file.target.files[0]);

  try {
    xSheet.loadData(new_sb);
  } catch (e) {
    console.log(e);
  }
  */
}


 export default importSheet;
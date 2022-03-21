import * as XLSX from 'xlsx/xlsx.mjs';

function xtos(sdata) {
  var out = XLSX.utils.book_new();
  sdata.forEach(function (xws) {
    var ws = {};
    var rowobj = xws.rows;
    for (var ri = 0; ri < rowobj.len; ++ri) {
      var row = rowobj[ri];
      if (!row) continue;

      var minCoord, maxCoord;
      Object.keys(row.cells).forEach(function (k) {
        var idx = +k;
        if (isNaN(idx)) return;

        var lastRef = XLSX.utils.encode_cell({ r: ri, c: idx });
        if (minCoord == null) {
          minCoord = { r: ri, c: idx };
        } else {
          if (ri < minCoord.r) minCoord.r = ri;
          if (idx < minCoord.c) minCoord.c = idx;
        }
        if (maxCoord == undefined) {
          maxCoord = { r: ri, c: idx };
        } else {
          if (ri > maxCoord.r) maxCoord.r = ri;
          if (idx > maxCoord.c) maxCoord.c = idx;
        }

        var cellText = row.cells[k].text, type = "s";
        if (!cellText) {
          cellText = "";
          type = "z";
        } else if (!isNaN(parseFloat(cellText))) {
          cellText = parseFloat(cellText);
          type = "n";
        } else if (cellText.toLowerCase() === "true" || cellText.toLowerCase() === "false") {
          cellText = Boolean(cellText);
          type = "b";
        }

        ws[lastRef] = { v: cellText, t: type };

        if (type == "s" && cellText[0] == "=") {
          ws[lastRef].f = cellText.slice(1);
        }

        if (row.cells[k].merge != null) {
          if (ws["!merges"] == null) ws["!merges"] = [];

          ws["!merges"].push({
            s: { r: ri, c: idx },
            e: {
              r: ri + row.cells[k].merge[0],
              c: idx + row.cells[k].merge[1]
            }
          });
        }
      });

      ws["!ref"] = XLSX.utils.encode_range({
        s: { r: minCoord.r, c: minCoord.c },
        e: { r: maxCoord.r, c: maxCoord.c }
      });
    }

    XLSX.utils.book_append_sheet(out, ws, xws.name);
  });

  return out;
}

function exportSheet(xSheet, filename) {
  /* build workbook from the grid data */
  var new_wb = xtos(xSheet.getData());
  console.log(new_wb);
  //console.log(XLSX.utils.sheet_to_json(new_wb.Sheets.sheet2));
  /* generate download */
  try {
    XLSX.writeFile(new_wb, filename + ".xlsx");
  } catch (e) {
    console.log(e);
  }
}

export default exportSheet;

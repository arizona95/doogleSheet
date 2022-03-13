var data = {
  name: "sheet1",
  freeze: "A1",
  styles: [
    {
      border: {
        bottom: ["thin", "#000"],
        top: ["thin", "#000"],
        left: ["thin", "#000"],
        right: ["thin", "#000"]
      }
    },
    {
      border: {
        bottom: ["thin", "#000"],
        top: ["thin", "#000"],
        left: ["thin", "#000"],
        right: ["thin", "#000"]
      },
      font: { bold: true }
    },
    { font: { bold: true } },
    {
      border: {
        bottom: ["thin", "#000"],
        top: ["thin", "#000"],
        left: ["thin", "#000"],
        right: ["thin", "#000"]
      },
      font: { bold: true },
      align: "center"
    },
    { font: { bold: true }, align: "center" }
  ],
  merges: ["A1:C1"],
  rows: {
    "0": {
      cells: {
        "0": { merge: [0, 2], style: 3, text: "MULTIPLY" },
        "1": { style: 4 },
        "2": { style: 4 }
      }
    },
    "1": {
      cells: {
        "0": { text: "1" },
        "1": { text: "=A2*2" },
        "2": { text: "=B2*2" }
      }
    },
    "2": {
      cells: {
        "0": { text: "=A2*2" },
        "1": { text: "=A3*2" },
        "2": { text: "=B3*2" }
      }
    },
    "3": {
      cells: {
        "0": { text: "=A3*2" },
        "1": { text: "=A4*2" },
        "2": { text: "=B4*2" }
      }
    },
    "4": {
      cells: {
        "0": { text: "=A4*2" },
        "1": { text: "=A5*2" },
        "2": { text: "=B5*2" }
      }
    },
    "5": {
      cells: {
        "0": { text: "=A5*2" },
        "1": { text: "=A6*2" },
        "2": { text: "=B6*2" }
      }
    },
    "6": {
      cells: {
        "0": { text: "=A6*2" },
        "1": { text: "=A7*2" },
        "2": { text: "=B7*2" }
      }
    },
    "7": {
      cells: {
        "0": { text: "=A7*2" },
        "1": { text: "=A8*2" },
        "2": { text: "=B8*2" }
      }
    },
    "8": {
      cells: {
        "0": { text: "=A8*2" },
        "1": { text: "=A9*2" },
        "2": { text: "=B9*2" }
      }
    },
    "9": {
      cells: {
        "0": { text: "=A9*2" },
        "1": { text: "=A10*2" },
        "2": { text: "=B10*2" }
      }
    },
    len: 100
  },
  cols: { len: 26 },
  validations: [],
  autofilter: {}
};

export default data;

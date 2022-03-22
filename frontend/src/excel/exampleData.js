var data = {
  name: "sheet1",
  survey: {},
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
  rows: {
    "0": {
      cells: {
        "0": { style: 3, text: "이름" },
        "1": { style: 3, text: "나이"},
        "2": { style: 3, text: "학번" }
      }
    },
    "1": {
      cells: {
        "0": { text: "1" },
        "1": { text: "=A2*2" },
        "2": { text: "=B2*2" }
      }
    },
    len: 100
  },
  cols: { len: 26 },
  validations: [],
  autofilter: {}
};

export default data;

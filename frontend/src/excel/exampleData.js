var data = {
  name: "sheet1",
  survey: {
     pages: [
      {
       name: "page1",
       elements: [
        {
         type: "text",
         name: "질문1"
        }
       ]
      }
     ]
    },
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
    len: 500
  },
  cols: { len: 26 },
  validations: [],
  autofilter: {}
};

var stringData = JSON.stringify(data);

export default stringData;

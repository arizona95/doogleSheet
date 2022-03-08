
const initialGrid = [
  [
    { readOnly: true, value: '' },
    { value: 'A', readOnly: true },
    { value: 'B', readOnly: true },
    { value: 'C', readOnly: true },
    { value: 'D', readOnly: true },
    { value: 'E', readOnly: true },
    { value: 'F', readOnly: true },
    { value: 'G', readOnly: true },
    { value: 'H', readOnly: true },
    { value: 'I', readOnly: true },
    { value: 'J', readOnly: true },
    { value: 'K', readOnly: true },
    { value: 'L', readOnly: true },
  ],  
];

const expences = [
  ""
  

];

for(let i = 0; i < 25; i++) {
  initialGrid.push([
    { readOnly: true, value: i+1 },
    { value: expences[i]? expences[i] : ""},
    { value: ""},
    { value: ""},
    { value: ""},
    { value: ""},
    { value: ""},
    { value: ""},
    { value: ""},
    { value: ""},
    { value: ""},
    { value: ""},
    { value: ""},
  ])
}

initialGrid.push([
  { readOnly: true, value: 26 },
  { value: "Total:",readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
  { value: 0, readOnly: true},
]);

export default initialGrid;
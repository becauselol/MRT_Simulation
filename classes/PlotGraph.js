
Plotly.newPlot('chart1', [{
  "type": "box",
  "name": "just q1/median/q3",
  "offsetgroup": "1",
  "q1": [ 1, 2, 1 ],
  "median": [ 2, 3, 2 ],
  "q3": [ 3, 4, 3 ]
},
{
  "type": "box",
  "name": "q1/median/q3/lowerfence/upperfence",
  "offsetgroup": "2",
  "q1": [ 1, 2, 1 ],
  "median": [ 2, 3, 2 ],
  "q3": [ 3, 4, 3 ],
  "lowerfence": [ 0, 1, 0 ],
  "upperfence": [ 4, 5, 4 ]
},
{
  "type": "box",
  "name": "all pre-computed stats",
  "offsetgroup": "3",
  "q1": [ 1, 2, 1 ],
  "median": [ 2, 3, 2 ],
  "q3": [ 3, 4, 3 ],
  "lowerfence": [ 0, 1, 0 ],
  "upperfence": [ 4, 5, 4 ],
  "mean": [ 2.2, 2.8, 2.2 ],
  "sd": [ 0.4, 0.4, 0.4 ],
  "notchspan": [ 0.2, 0.1, 0.2 ]
}], {
boxmode: 'group',
legend: {
x: 0,
y: 1, yanchor: 'bottom'
}
})

class FakeTrainData {
  constructor() {
    this.lines = ["ccl", "nsl", "nel", "dtl", "ewl", "tel"]

    // use Object.keys(obj.store) to iterate through, or just use obj.lines
    this.store = {}

    for (var i = 0; i < this.lines.length; i++) {
      this.store[this.lines[i]] = new StatCompact();
      this.store[this.lines[i]].fillRandomNumbers(20);
    }
  }
}
data1 = new FakeTrainData();
data2 = new FakeLineData();

var plot_data = []


for (j = 0; j < data1.lines.length; j++){
  line = data1.lines[j]
  var line_data ={"type": "box", "name" : line, "q1":[data1.store[line].q25()],
  "median": [data1.store[line].getMedian()], "q3": [data1.store[line].q75()], "lowerfence": [data1.store[line].getMin()], 
  "upperfence": [data1.store[line].getMax()], "mean":[data1.store[line].getMean()], "sd" : [data1.store[line].getStd()] };
	    plot_data.push(line_data); 
}

console.log(plot_data);

var layout = {
  boxmode: 'group',
  legend: {x: 1,y: 0, yanchor: 'bottom'}, 
  title : "Line Waiting Time (Boxplot)",
  yaxis: {
    title: 'waiting time',
    zeroline: false
  },
  boxmode: 'group'
};

Plotly.newPlot('chart1', plot_data, layout)

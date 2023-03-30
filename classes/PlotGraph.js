class Plotter {
  constructor() {}

  plotLineWaitTimes(plotId, dataStore) {
    var plot_data = []
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

    for (const [line, data] of Object.entries(dataStore.lineWaitTimes)) {
      var line_data ={
        "type": "box", 
        "name" : line, 
        "q1":[data.q25()],
        "median": [data.getMedian()], 
        "q3": [data.q75()], 
        "lowerfence": [data.getMin()], 
        "upperfence": [data.getMax()], 
        "mean":[data.getMean()], 
        "sd" : [data.getStd()] };

      plot_data.push(line_data); 
    }

    Plotly.newPlot(plotId, plot_data, layout)
  }

  plotChosenLineWaitTimes(plotId, dataStore, line) {

    var plot_data = []
    var layout = {
        boxmode: 'group',
        legend: {x: 1,y: 0, yanchor: 'bottom'}, 
        title : "Line Waiting Time (Boxplot) " + line + " line",
        yaxis: {
          title: 'waiting time',
          zeroline: false
        },
        boxmode: 'group'
    };

    for (const stationId of dataStore.lineStations[line]) {
      var data = dataStore.waitTimes[stationId][line]
      var line_data ={
        "type": "box", 
        "name" : stationId, 
        "q1":[data.q25()],
        "median": [data.getMedian()], 
        "q3": [data.q75()], 
        "lowerfence": [data.getMin()], 
        "upperfence": [data.getMax()], 
        "mean":[data.getMean()], 
        "sd" : [data.getStd()] };

      plot_data.push(line_data); 
    }

    Plotly.newPlot(plotId, plot_data, layout)
  }
}



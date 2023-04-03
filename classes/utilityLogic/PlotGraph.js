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
        "sd" : [data.getStd()]};

      plot_data.push(line_data); 
    }

    Plotly.newPlot(plotId, plot_data, layout)
  }

  plotTravelTimes(plotId, dataStore) {
    var labels = Object.keys(dataStore.travelTimes)

    var zData = []
    for (const iId of labels) {
      zData.push([])
      var row = zData[zData.length - 1]

      for (const jId of labels) {
        var val
        if (iId == jId) {
          val = null
        } else {
          val = dataStore.travelTimes[iId][jId].getMean()
          if (val == 0) {
            val = null
          }
        }
        row.push(val)
      }
    }
    var data = [
      {
        z: zData,
        x: labels,
        y: labels,
        type: 'heatmap',
        hoverongaps: false
      }
    ];

    Plotly.newPlot(plotId, data);
  }

  initStationCommCount(plotId, dataStore, stationId) {
    var layout = {
      legend: {
        y: 0.5,
        traceorder: 'reversed',
        font: {size: 16},
        yref: 'paper'
      }};
    Plotly.newPlot(plotId, [{
      mode: 'lines+markers',
      line: {shape: 'hv'},
      type: 'scatter',
      x: dataStore.stationCommuterCount[stationId].time,
      y: dataStore.stationCommuterCount[stationId].count,
      text: dataStore.stationCommuterCount[stationId].event
    }], layout)
  }

  updateStationCommCount(plotId, update, stationId) {
    Plotly.extendTraces(plotId, {
      x: [[(update.time).toFixed(2)]],
      y: [[update.count]],
      text: [[update.event]]
    }, [0])
  }

  updateCommCount(simStepUpdate, dataStore) {
    console.debug(simStepUpdate)
    for (const [stationId, updates] of Object.entries(simStepUpdate)) {
      for (const update of updates) {
        for (const [key, value] of Object.entries(update)) {
          if (key == "station_count") {
            this.updateStationCommCount("chart" + stationId, value, stationId)
          }
        }
      } 
    }
  }
}



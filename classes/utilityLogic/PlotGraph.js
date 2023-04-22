class Plotter {
  constructor() {}
  
 
  filterBtn(dataStore){
    var select = document.getElementById("select");
    removeOptions(select)
    var data = dataStore.getLineCodeArray()
    for(var i = 0; i < data.length; i++)
    {
        var option = document.createElement("OPTION"),
            txt = document.createTextNode(data[i]);
        option.appendChild(txt);
        option.setAttribute("value",data[i]);
        select.insertBefore(option,select.lastChild);
    }
  }

  filterBtnstn(dataStore,element){
    var select = document.getElementById(element);
    removeOptions(select)
    var data = dataStore.nameMap
    console.log(data)
    for(const [key, value] of Object.entries(data))
    {
        var option = document.createElement("OPTION"),
            txt = document.createTextNode(value);
        option.appendChild(txt);
        option.setAttribute("value",value);
        select.insertBefore(option,select.lastChild);
    }
  }

  //get user's line selection

  getChosenLine(){
    var select = document.getElementById('select');
    var chosenLine = select.options[select.selectedIndex].text;
    return chosenLine
  }

  // get user's station selection
  getChosenStn(id){
    var select = document.getElementById(id);
    var chosenStn = select.options[select.selectedIndex].text;
    

    return chosenStn
  }



  plotLineWaitTimes(plotId, dataStore, line_colour) {
    var plot_data = []
    var layout = {
        boxmode: 'group',
        legend: {x: 1,y: 0, yanchor: 'bottom'}, 
        title : "Line Waiting Time (Boxplot)",
        yaxis: {
          title: 'waiting time',
          zeroline: false
        },
        boxmode: 'group',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
          size: 14,
          color: '#ffffff'
        }
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
        "sd" : [data.getStd()], 
        "marker" : {color: line_colour[line]},
      };

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
        boxmode: 'group',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
          size: 14,
          color: '#ffffff'
        }
    };

    for (const stationId of dataStore.lineStations[line]) {
      var data = dataStore.waitTimes[stationId][line]
      var line_data ={
        "type": "box", 
        "name" : dataStore.nameMap[stationId], 
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

    var layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        size: 14,
        color: '#ffffff'
      }
    }

    Plotly.newPlot(plotId, data, layout);
  }

  initStationCommCount(plotId, dataStore, stationName) {
    var stationId = Object.keys(dataStore.nameMap).find(key => dataStore.nameMap[key] === stationName)
    
    console.log(stationId)
    var layout = {
      legend: {
        y: 0.5,
        traceorder: 'reversed',
        font: {size: 16},
        yref: 'paper'
      },
      title : "No. of people over time (in station)",
      yaxis: {
        title: 'No. of people',
        zeroline: false
      },
      xaxis: {
        title: 'Time (min)',
        zeroline: false
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        size: 14,
        color: '#ffffff'
      }
    };
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



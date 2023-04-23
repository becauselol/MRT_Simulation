class Plotter {
  constructor() {}
  
  // set up graph filter button with line names
  filterBtn(dataStore){
    // get dropdown html element
    var select = document.getElementById("select");
    // clear current dropdown options
    removeOptions(select)
    // get all line names
    var data = dataStore.getLineCodeArray()
    // add line names to dropdown menu as options
    for(var i = 0; i < data.length; i++)
    {
        var option = document.createElement("OPTION"), // get option html element
            txt = document.createTextNode(data[i]); // create node with line name
        option.appendChild(txt); // add into option
        option.setAttribute("value",data[i]); // set html attribute as value
        select.insertBefore(option,select.lastChild); // insert into dropdown menu
    }
  }

  // set up graph filter button with station names
  filterBtnstn(dataStore,element){
    // get dropdown html element
    var select = document.getElementById(element);
    // clear current dropdown options
    removeOptions(select)
    // get station data
    var data = dataStore.nameMap
    // console.log(data)

    // add station names to dropdown menu
    for(const [key, value] of Object.entries(data))
    {
        var option = document.createElement("OPTION"), // get option html element
            txt = document.createTextNode(value); // create node with station name
        option.appendChild(txt); // add into option
        option.setAttribute("value",value); // set html attribute as value
        select.insertBefore(option,select.lastChild); // insert into dropdown menu
    }
  }

  //get user's line selection
  getChosenLine(){
    // get html element of line filter button
    var select = document.getElementById('select');
    // get text of selected option
    var chosenLine = select.options[select.selectedIndex].text;

    return chosenLine
  }

  // get user's station selection
  getChosenStn(id){
    // get html element of station filter button
    var select = document.getElementById(id);
    // get text of selected option
    var chosenStn = select.options[select.selectedIndex].text;

    return chosenStn
  }


// plot boxplot of wait times across all lines
  plotLineWaitTimes(plotId, dataStore, line_colour) {
    var plot_data = [] // initialise empty array for data

    // set layout of plot
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

    // for each line in data, access parameters needed for plotting boxplot
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

      plot_data.push(line_data); // push into array
    }

    Plotly.newPlot(plotId, plot_data, layout) // plot graph
  }

  // plot boxplot of selected line wait time
  plotChosenLineWaitTimes(plotId, dataStore, line) {
    var plot_data = [] // initialise empty array for data

    // set layout for plot
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

    // for each station obtain values for boxplot and add into array
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

      plot_data.push(line_data); // add into array
    }

    Plotly.newPlot(plotId, plot_data, layout) // plot boxplot

  }

  // plot no. of people at a station (time-series)
  initStationCommCount(plotId, dataStore, stationName) {
    // identify stationId from selected station name
    var stationId = Object.keys(dataStore.nameMap).find(key => dataStore.nameMap[key] === stationName)    
    // console.log(stationId)

    // set up layout for plot
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

    // plot time-series
    Plotly.newPlot(plotId, [{
      mode: 'lines+markers',
      line: {shape: 'hv'},
      type: 'scatter',
      x: dataStore.stationCommuterCount[stationId].time, // corresponding time
      y: dataStore.stationCommuterCount[stationId].count, // number of people at station
      text: dataStore.stationCommuterCount[stationId].event
    }], layout)
  }

  // updateStationCommCount(plotId, update, stationId) {
  //   Plotly.extendTraces(plotId, {
  //     x: [[(update.time).toFixed(2)]],
  //     y: [[update.count]],
  //     text: [[update.event]]
  //   }, [0])
  // }

  // updateCommCount(simStepUpdate, dataStore) {
  //   console.debug(simStepUpdate)
  //   for (const [stationId, updates] of Object.entries(simStepUpdate)) {
  //     for (const update of updates) {
  //       for (const [key, value] of Object.entries(update)) {
  //         if (key == "station_count") {
  //           this.updateStationCommCount("chart" + stationId, value, stationId)
  //         }
  //       }
  //     } 
  //   }
  // }
}



// get the canvas context to draw in
let canvas = document.getElementById("myCanvas")
let ctx = canvas.getContext('2d')

// define the start and end hours
var startHour = 6
var endHour = 25

// tracks if the sim is running 
var isRunning = false;
// tracks if any changes were made
var changesMade = false
// var creatorMode = false;

// dimensions of the canvas
var maxX = 960;
var maxY = 540;

// default values
const defaultTrainCap = 900 
const defaultTrainInterArrival = 4

var fps = 10; // frames per real time second 
// FPS needs to be at least 5 and all waitTimes of trains and edge weights must be at least 1
var timestep = 1/fps;

// input parameters from simulation
const trainCapacity = document.getElementById("traincap");
const interArrival = document.getElementById("arrtime");
var inputPara = {trainCap:defaultTrainCap, interArrival: defaultTrainInterArrival}; // dictionary for all input parameters
trainCapacity.value = inputPara.trainCap.toString()
interArrival.value = inputPara.interArrival.toString()

// new line parameters from simulation
const inputFrom = document.getElementById("frmstn");
const inputTo = document.getElementById("tostn");
const inputTime = document.getElementById("timeT");
var newLineArr = [[]]
var allNewLines = {}

// set some default values for UI
document.getElementById("drawtrain").checked = true
document.getElementById("drawstn").checked = true
document.getElementById("colour").value = "#ffffff"


//intiialize graph and drawer
var metro = new Metro("Singapore MRT");
var drawer = new MapDrawer(ctx, maxX, maxY);

// initialize processor and parse the relevant information
var processor = new InputProcessor()
processor.init()
processor.parseStationString(stationString)
processor.parseEdgeStringDict(edgesMap)
processor.parseEdgeColours(edgeColourString)
// set defaults for lines
processor.setDefaultTrainLineCapacities(inputPara.trainCap)
processor.setDefaultTrainLinePeriod(inputPara.interArrival)

// initialize datastores
var dataStore = new DataStore()
var csvDataStore = new CSVDataStore();

// initialize the plotter
var plotter = new Plotter()

// function is to initialize and refresh the metro system
function init() {
	// init metro
	metro.init("Singapore MRT")

	// construct the metro
	processor.constructMetroGraph(metro, drawer, spawnDataString)

	// add trains
	for (const lineCode of processor.chosenLines) {
		processor.addTrainsWithPeriod(metro, lineCode, processor.trainPeriod[lineCode], processor.trainCapacities[lineCode])
	}

	// get the paths for commuters
	metro.getPathsFromStartStation();
	metro.constructCommuterGraph();
	metro.constructInterchangePaths();

	// initialize dataStores
	dataStore.init(metro)
	csvDataStore.init(metro.stationDict, startHour, endHour)

	// reset system params for metro
	metro.hour = startHour
	metro.sysTime = startHour * 60

	// init graph filter button with train stns and lines
	setButton1(dataStore)

	// create the buttons for the plotter
	plotter.filterBtn(dataStore)
	plotter.filterBtnstn(dataStore, "selectstn1")
	plotter.filterBtnstn(dataStore, "selectstn2")

	// init graphs
	plotter.plotLineWaitTimes("chart1", dataStore, metro.metroLineColours);
	plotter.plotChosenLineWaitTimes("chart2", dataStore, plotter.getChosenLine());
	plotter.initStationCommCount("chartstation1", dataStore, plotter.getChosenStn("selectstn1"));
	plotter.initStationCommCount("chartstation2", dataStore, plotter.getChosenStn( "selectstn2"));
	
}

// to change line parameters based on line chosen by user for parameter input
function updateButton(){
	document.getElementById("trainstn").innerHTML = "" ;
	var chosenLine = document.getElementById("trainline").value
	trainCapacity.value = processor.trainCapacities[chosenLine].toString()
	interArrival.value = processor.trainPeriod[chosenLine].toString()
}

// sets default parameters for line
function setDefaultParameters() {
	if(isRunning) {
		alert("Please pause the simulation to make changes")
		return
	}

	var chosenLine = document.getElementById("trainline").value

	interArrival.value = inputPara.interArrival
	trainCapacity.value = inputPara.trainCap

	processor.trainPeriod[chosenLine] = parseFloat(inputPara.interArrival);
	processor.trainCapacities[chosenLine] = parseInt(inputPara.trainCap)

	alert("Default parameters updated for line: " + chosenLine)

	changesMade = true;
}

// update simulation parameters with user's new inputs
function updateParameters(){
	if(isRunning) {
		alert("Please pause the simulation to make changes")
		return
	}

	var chosenLine = document.getElementById("trainline").value

	// check if input parameters are valid
	if (parseFloat(interArrival.value) < 1) {
		alert("Inter arrival time cannot be less than 1\nSetting to default values")
		setDefaultParameters()
		return 
	}
	var line_duration = metro.getLineDuration(chosenLine)
	if (parseFloat(interArrival.value) > line_duration) {
		alert("Inter arrival time cannot be more than the line duration of " + line_duration + "\nSetting to default values")
		setDefaultParameters()
		return 
	}

	if (parseInt(trainCapacity.value) < 1) {
		alert("Train capacities must be at least 1\nSetting to default values")
		setDefaultParameters()
		return
	}

	processor.trainPeriod[chosenLine] = parseFloat(interArrival.value);
	processor.trainCapacities[chosenLine] = parseInt(trainCapacity.value)
	// console.log(inputPara)
	alert("Parameters updated for line: " + chosenLine)
	changesMade = true;
}


//update graph
function updateGraph(){
	plotter.plotChosenLineWaitTimes("chart2", dataStore, plotter.getChosenLine());
	plotter.initStationCommCount("chartstation1", dataStore, plotter.getChosenStn( "selectstn1"));
	plotter.initStationCommCount("chartstation2", dataStore, plotter.getChosenStn( "selectstn2"));
}

// toggles the simulation to be running or not
function toggleSim() {
	// if it is not running and changes have been made
	if (!isRunning && changesMade) {
		alert("Please reset the simulation to reflect the changes")
		return
	}

	// otherwise toggle
	isRunning = !isRunning
	console.log(`is running: ${isRunning}`)

	// if it is paused
    if (!isRunning) {
    	// we plot the graphs
		updateGraph();
        plotter.plotLineWaitTimes("chart1", dataStore, metro.metroLineColours);
        // plotter.plotTravelTimes("chartTravelTime", dataStore);

    }
}

// reset the simulation
function resetSim() {
	if(isRunning) {
		alert("Please pause the simulation to make changes")
		return
	}
	// init the classes and variables
	init()
	changesMade = false
	alert("Simulation has been reset and is ready to run")
}

// set the whole map to be the default
function setDefault() {
	if(isRunning) {
		alert("Please pause the simulation to make changes")
		return
	}

	// reset the chosen lines to default
	processor.chosenLines = [...processor.defaultLines]
	processor.setDefaultTrainLineCapacities(inputPara.trainCap)
	processor.setDefaultTrainLinePeriod(inputPara.interArrival)

	var chosenLine = document.getElementById("trainline").value

	interArrival.value = inputPara.interArrival
	trainCapacity.value = inputPara.trainCap
	alert("Default parameters set for all lines and all new lines are removed")
	changesMade = true
}

// download the station data into a zip file
function downloadStationRunData() {
	if(isRunning) {
		alert("Please pause the simulation to download data")
		return
	}
	var zip = new JSZip();

	// create the csv content
    var csvContent = csvDataStore.writeStationCSVString()
        
    zip.file("stationData.csv", csvContent);

    zip.generateAsync({
        type: "base64"
    }).then(function(content) {
        window.location.href = "data:application/zip;base64," + content;
    });       
}

// download the train data into a zip file
function downloadTrainRunData() {
	if(isRunning) {
		alert("Please pause the simulation to download data")
		return
	}
	var zip = new JSZip();
	// create the csv content
    var csvContent = csvDataStore.writeTrainCSVString()
        
    zip.file("trainData.csv", csvContent);

    zip.generateAsync({
        type: "base64"
    }).then(function(content) {
        window.location.href = "data:application/zip;base64," + content;
    });       
}

// draws the map (the key animation step)
function draw_map() {
		// updates the text about the time
		document.getElementById("time").textContent =
		"Current time is " +
		metro.sysTime.toFixed(2) +
		" minutes or " +
		(metro.sysTime / 60).toFixed(2) +
		" hours";

		// gets the drawing inputs to see which version to draw
		var edgeCheck = document.getElementById("checkedge").checked
		var heat_stnCheck = document.getElementById("check-heat-stn").checked
		var heat_trainCheck = document.getElementById("check-heat-train").checked
		var drawStn = document.getElementById("drawstn").checked
		var drawTrain = document.getElementById("drawtrain").checked
		var heat_train_limit = parseFloat(document.getElementById("heat-train-limit").value)

		// if the simulation is running
		if (isRunning) {
			// take a simulation step
			metro.simStep(timestep, dataStore, csvDataStore);

			// draw map
			drawer.drawMap(metro, drawStn, drawTrain, heat_stnCheck, edgeCheck, heat_trainCheck, heat_train_limit);
			

		} else {
			// if it is paused, just draw the map with no additional input
			drawer.drawMap(metro, drawStn, drawTrain, heat_stnCheck, edgeCheck, heat_trainCheck, heat_train_limit);
			
		}

		// if the metro finishes running since it reaches the end hour
        if (metro.hour == endHour) {
        	if (isRunning) {
        		toggleSim()
        	}
        }

		// refresh to the next frame
		window.requestAnimationFrame(draw_map);
}

// Ready, set, go
init();
draw_map();
setButton1(dataStore); //set line dropdown selection (inputer parameters)
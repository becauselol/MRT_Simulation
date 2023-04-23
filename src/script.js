let canvas = document.getElementById("myCanvas")
let ctx = canvas.getContext('2d')

var startHour = 6
var endHour = 25

var isRunning = false;
var changesMade = false
// var creatorMode = false;

var maxX = 960;
var maxY = 540;

const defaultTrainCap = 900 
const defaultTrainInterArrival = 4

var fps = 10; // frames per real time second // FPS needs to be at least 5 and all waitTimes of trains and edge weights must be at least 1
var timestep = 1/fps;

// default input parameters
var lineTrainTimes = {}
for (const lineCode of Object.keys(edgesMap)){
	lineTrainTimes[lineCode] = 4
}

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

document.getElementById("drawtrain").checked = true
document.getElementById("drawstn").checked = true
//intiialize graph and drawer
var metro = new Metro("Singapore MRT");
var drawer = new MapDrawer(ctx, maxX, maxY);
var processor = new InputProcessor()
processor.init()
processor.parseStationString(stationString)
processor.parseEdgeStringDict(edgesMap)
processor.parseEdgeColours(edgeColourString)
processor.setDefaultTrainLineCapacities(inputPara.trainCap)
processor.setDefaultTrainLinePeriod(inputPara.interArrival)

var dataStore = new DataStore()

var csvDataStore = new CSVDataStore();
var plotter = new Plotter()


function init() {
	metro.init("Singapore MRT")

	processor.constructMetroGraph(metro, drawer, spawnDataString)

	for (const lineCode of processor.chosenLines) {
		processor.addTrainsWithPeriod(metro, lineCode, processor.trainPeriod[lineCode], processor.trainCapacities[lineCode])
	}

	metro.getPathsFromStartStation();
	metro.constructCommuterGraph();
	metro.constructInterchangePaths();

	
	dataStore.init(metro)
	csvDataStore.init(metro.stationDict, startHour, endHour)

	metro.hour = startHour
	metro.sysTime = startHour * 60

	// init graph filter button with train stns and lines
	setButton1(dataStore)

	plotter.filterBtn(dataStore)
	plotter.filterBtnstn(dataStore, "selectstn1")
	plotter.filterBtnstn(dataStore, "selectstn2")

	// init graphs
	plotter.plotLineWaitTimes("chart1", dataStore, metro.metroLineColours);
	plotter.plotChosenLineWaitTimes("chart2", dataStore, plotter.getChosenLine());
	plotter.plotTravelTimes("chartTravelTime", dataStore);
	plotter.initStationCommCount("chartstation1", dataStore, plotter.getChosenStn("selectstn1"));
	plotter.initStationCommCount("chartstation2", dataStore, plotter.getChosenStn( "selectstn2"));
	
}

// to change station button based on line chosen by user for parameter input
function updateButton(){

	document.getElementById("trainstn").innerHTML = "" ;
	var chosenLine = document.getElementById("trainline").value
	trainCapacity.value = processor.trainCapacities[chosenLine].toString()
	interArrival.value = processor.trainPeriod[chosenLine].toString()
	// setButton2(dataStore)
}

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



function draw_map() {
		document.getElementById("time").textContent =
		"Current time is " +
		metro.sysTime.toFixed(2) +
		" minutes or " +
		(metro.sysTime / 60).toFixed(2) +
		" hours";

		var edgeCheck = document.getElementById("checkedge").checked
		var heat_stnCheck = document.getElementById("check-heat-stn").checked
		var heat_trainCheck = document.getElementById("check-heat-train").checked
		var drawStn = document.getElementById("drawstn").checked
		var drawTrain = document.getElementById("drawtrain").checked
		var heat_train_limit = parseFloat(document.getElementById("heat-train-limit").value)
		if (isRunning) {
			// take a simulation step
			metro.simStep(timestep, dataStore, csvDataStore);

			// draw map
			drawer.drawMap(metro, drawStn, drawTrain, heat_stnCheck, edgeCheck, heat_trainCheck, heat_train_limit);
			

		} else {
			// if it is paused, just draw the map with no additional input
			drawer.drawMap(metro, drawStn, drawTrain, heat_stnCheck, edgeCheck, heat_trainCheck, heat_train_limit);
			
		}

        if (metro.hour == endHour) {
        	if (isRunning) {
        		toggleSim()
        	}
        }
		// refresh to the next frame
		window.requestAnimationFrame(draw_map);
}


//update graph
function updateGraph(){
	plotter.plotChosenLineWaitTimes("chart2", dataStore, plotter.getChosenLine());
	plotter.initStationCommCount("chartstation1", dataStore, plotter.getChosenStn( "selectstn1"));
	plotter.initStationCommCount("chartstation2", dataStore, plotter.getChosenStn( "selectstn2"));
}


function toggleSim() {
	if (!isRunning && changesMade) {
		alert("Please reset the simulation to reflect the changes")
		return
	}

	isRunning = !isRunning
	console.log(`is running: ${isRunning}`)
    if (!isRunning) {

		updateGraph();
        plotter.plotLineWaitTimes("chart1", dataStore, metro.metroLineColours);
        plotter.plotTravelTimes("chartTravelTime", dataStore);

    }
}

function resetSim() {
	if(isRunning) {
		alert("Please pause the simulation to make changes")
		return
	}
	// init the functions
	init()
	changesMade = false
	alert("Simulation has been reset and is ready to run")
}

function setDefault() {
	if(isRunning) {
		alert("Please pause the simulation to make changes")
		return
	}
	processor.chosenLines = [...processor.defaultLines]
	processor.setDefaultTrainLineCapacities(inputPara.trainCap)
	processor.setDefaultTrainLinePeriod(inputPara.interArrival)
	
	var chosenLine = document.getElementById("trainline").value

	interArrival.value = inputPara.interArrival
	trainCapacity.value = inputPara.trainCap
	alert("Default parameters set for all lines and all new lines are removed")
	changesMade = true
}

function downloadStationRunData() {
	if(isRunning) {
		alert("Please pause the simulation to download data")
		return
	}
	var zip = new JSZip();
    var csvContent = csvDataStore.writeStationCSVString()
        
    zip.file("stationData.csv", csvContent);

    zip.generateAsync({
        type: "base64"
    }).then(function(content) {
        window.location.href = "data:application/zip;base64," + content;
    });       
}

function downloadTrainRunData() {
	if(isRunning) {
		alert("Please pause the simulation to download data")
		return
	}
	var zip = new JSZip();
    var csvContent = csvDataStore.writeTrainCSVString()
        
    zip.file("trainData.csv", csvContent);

    zip.generateAsync({
        type: "base64"
    }).then(function(content) {
        window.location.href = "data:application/zip;base64," + content;
    });       
}


// Ready, set, go
init();
draw_map();
setButton1(dataStore); //set line dropdown selection (inputer parameters)
// setButton2(dataStore); //set station dropdown selection (input parameters)


//testing 
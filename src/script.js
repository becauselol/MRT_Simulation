let canvas = document.getElementById("myCanvas")
let ctx = canvas.getContext('2d')

var startHour = 6
var endHour = 24

var isRunning = false;
// var creatorMode = false;

var maxX = 960;
var maxY = 540;

var fps = 10; // frames per real time second // FPS needs to be at least 5 and all waitTimes of trains and edge weights must be at least 1
var timestep = 1/fps;

const trainCapacity = document.getElementById("traincap");
const interArrival = document.getElementById("arrtime");
const spawnRate = document.getElementById("spawnrate");
var inputPara = {trainCap:0, interArrival: 0, spawnRate :0 };

const inputFrom = document.getElementById("frmstn");
const inputTo = document.getElementById("tostn");
var newLineArr = []
var allNewLines = {}


//intiialize graph and drawer
var metro = new Metro("Singapore MRT");
var drawer = new MapDrawer(ctx, maxX, maxY);
var processor = new InputProcessor()
var dataStore = new DataStore()

var csvDataStore = new CSVDataStore();
var plotter = new Plotter()


function init() {
	metro.init("Singapore MRT")
	processor.init()
	processor.parseStationString(stationString)
	processor.parseEdgeStringDict(edgesMap)
	processor.parseEdgeColours(edgeColourString)

	processor.constructMetroGraph(metro, drawer, spawnDataString)

	for (const lineCode of Object.keys(edgesMap)) {
		processor.addTrainsWithPeriod(metro, lineCode, 4, 900)
	}

	metro.getPathsFromStartStation();
	metro.constructCommuterGraph();
	metro.constructInterchangePaths();

	
	dataStore.init(metro)
	csvDataStore.init(metro.stationDict, startHour, endHour)

	metro.hour = startHour
	metro.sysTime = startHour * 60
	

	// set parameters to initial
	trainCapacity.value = 0;
	interArrival.value = 0;
	spawnRate.value = 0;
	
}

function updateButton(){

	document.getElementById("trainstn").innerHTML = "" ;
	setButton2(dataStore)
}

function updateParameters(){
	console.log(trainCapacity.value, interArrival.value, spawnRate.value);
	inputPara.interArrival = interArrival.value;
	inputPara.spawnRate = spawnRate.value;
	inputPara.trainCap = trainCapacity.value;
	console.log(inputPara)

}

function newLineUpdate(){
	// when next clicked save content
	var stn_i1 = document.getElementById("frmstn").value;
	var stn_i2 = document.getElementById("tostn").value;
	console.log(stn_i1, stn_i2);

	newLineArr.push([stn_i1,stn_i2]);
	console.log(newLineArr);
	// refresh input
	inputFrom.value = "";
	inputTo.value = "";

}

function saveLine(){
	// take arr and convert to string
	//Make new line key
	allNewLines[getLineName()] = null
	for (var stnPair in newLineArr) {
		allNewLines.push(stnPair.join(","))
	}
	// add to main dictionary
  }

function getLineName(){
	 var newLineName = document.getElementById("name").value

	 return newLineName
}

function draw_map() {
		  document.getElementById("time").textContent =
		    "Current time is " +
		    metro.sysTime.toFixed(2) +
		    " minutes or " +
		    (metro.sysTime / 60).toFixed(2) +
		    " hours";

		if (isRunning) {
			// take a simulation step
			metro.simStep(timestep, dataStore, csvDataStore);

			// draw map
			drawer.drawMap(metro);

		} else {
			// if it is paused, just draw the map with no additional input
			drawer.drawMap(metro);
			
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
	plotter.plotChosenLineWaitTimes("chartRed", dataStore, plotter.getChosenLine());
}

document.getElementById('select').addEventListener('change', updateGraph, false);

function toggleSim() {
	isRunning = !isRunning
	console.log(`is running: ${isRunning}`)
    if (!isRunning) {
		plotter.filterBtn(dataStore)
        plotter.plotLineWaitTimes("chart1", dataStore, metro.metroLineColours)
        //plotter.plotChosenLineWaitTimes("chartRed", dataStore, plotter.getChosenLine())
        plotter.plotChosenLineWaitTimes("chartPurple", dataStore, "ewl")
        plotter.plotTravelTimes("chartTravelTime", dataStore)
        plotter.initStationCommCount("chartstation1", dataStore, "station1")
		plotter.initStationCommCount("chartstation2", dataStore, "station2")
		// plotter.initStationTrainCommCount("chartstation3", dataStore, "station3")
		// plotter.initStationCommCount("chartstation4", dataStore, "station4")
		// plotter.initStationCommCount("chartstation5", dataStore, "station5")
		//plotter.updateGraph(plotter.plotChosenLineWaitTimes("chartRed", dataStore, plotter.getChosenLine()))
    }
}

function resetSim() {
	// update the variables
	// document.getElementById("traincap").value = '';

	// init the functions
	init()
}

function downloadStationRunData() {
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
	var zip = new JSZip();
    var csvContent = csvDataStore.writeTrainCSVString()
        
    zip.file("trainData.csv", csvContent);

    zip.generateAsync({
        type: "base64"
    }).then(function(content) {
        window.location.href = "data:application/zip;base64," + content;
    });       
}

// function downloadRunData() {
// 	var zip = new JSZip();

// 	var csvContent = csvDataStore.writeStationCSVString()
        
//     zip.file("stationData.csv", csvContent);

//     var csvContent = csvDataStore.writeTrainCSVString()
        
//     zip.file("trainData.csv", csvContent);

//     zip.generateAsync({
//         type: "base64"
//     }).then(function(content) {
//         window.location.href = "data:application/zip;base64," + content;
//     });       
// }
// function toggleCreate() {
// 	creatorMode = !creatorMode
// }

// Ready, set, go
init();
draw_map();
setButton1(dataStore);
setButton2(dataStore);
document.getElementById('trainline').addEventListener('change', updateButton, false);
document.getElementById('save').addEventListener("click", saveLine, false);;
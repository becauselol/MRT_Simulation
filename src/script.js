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
const inputTime = document.getElementById("timeT");
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

	// init graphs
	plotter.filterBtn(dataStore)
	plotter.filterBtnstn(dataStore, "selectstn1")
	plotter.filterBtnstn(dataStore, "selectstn2")
	plotter.plotLineWaitTimes("chart1", dataStore, metro.metroLineColours);
	plotter.plotChosenLineWaitTimes("chart2", dataStore, plotter.getChosenLine());
	plotter.plotTravelTimes("chartTravelTime", dataStore);
	plotter.initStationCommCount("chartstation1", dataStore, plotter.getChosenStn("selectstn1"));
	plotter.initStationCommCount("chartstation2", dataStore, plotter.getChosenStn( "selectstn2"));
	// plotter.initStationCommCount("chartstation2", dataStore, "station2");
	
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
	var time = document.getElementById("timeT").value;

	console.log(stn_i1, stn_i2, time);

	newLineArr.push([stn_i1,stn_i2, time]);
	console.log(newLineArr);
	// refresh input
	inputFrom.value = "";
	inputTo.value = "";
	inputTime.value = "";

}

function saveLine(){
	// take arr and convert to string
	//Make new line key
	var lineName = getLineName()
	var colour = document.getElementById("colour").value

	allNewLines[lineName] = []
	console.log(newLineArr)
	allNewLines[lineName].push(colour)
	for (const stnPair of newLineArr) {


		allNewLines[lineName].push(stnPair.join(","))
		console.log(allNewLines)
	}
	newLineArr = []
	// add to main dictionary
	allNewLines[lineName] = allNewLines[lineName].join("\n")
	console.log(allNewLines[lineName])
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
			drawer.drawMap(metro, "trainColour");

		} else {
			// if it is paused, just draw the map with no additional input
			drawer.drawMap(metro, "trainColour");
			
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

// document.getElementById('select').addEventListener('change', updateGraph, false);

function toggleSim() {
	isRunning = !isRunning
	console.log(`is running: ${isRunning}`)
    if (!isRunning) {
		updateGraph();
        plotter.plotLineWaitTimes("chart1", dataStore, metro.metroLineColours);
        plotter.plotTravelTimes("chartTravelTime", dataStore);

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
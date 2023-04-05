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

	// for (const lineCode of Object.keys(edgesMap)) {
	// 	processor.addTrainsWithPeriod(metro, lineCode, 4, 900)
	// }

	metro.getPathsFromStartStation();
	// metro.constructCommuterGraph();
	// metro.constructInterchangePaths();

	
	dataStore.init(metro)
	csvDataStore.init(metro.stationDict, startHour, endHour)

	metro.hour = startHour
	metro.sysTime = startHour * 60
}

function updateButton(){

	document.getElementById("trainstn").innerHTML = "" ;
	setButton2(dataStore)
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
init()
draw_map()
setButton1(dataStore)
setButton2(dataStore)
document.getElementById('trainline').addEventListener('change', updateButton, false);
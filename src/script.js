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

// input parameters from simulation
const trainCapacity = document.getElementById("traincap");
const interArrival = document.getElementById("arrtime");
const spawnRate = document.getElementById("spawnrate");
var inputPara = {trainCap:0, interArrival: 0, spawnRate :0 }; // dictionary for all input parameters

// new line parameters from simulation
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

	// init graph filter button with train stns and lines
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
	setButton2(dataStore)
}

// update simulation parameters with user's new inputs
function updateParameters(){
	inputPara.interArrival = interArrival.value;
	inputPara.spawnRate = spawnRate.value;
	inputPara.trainCap = trainCapacity.value;
	// console.log(inputPara)

}

function newLineUpdate(){
	// when next clicked save values into array
	var stn_i1 = document.getElementById("frmstn").value;
	var stn_i2 = document.getElementById("tostn").value;
	var time = document.getElementById("timeT").value;

	newLineArr.push([stn_i1,stn_i2, time]);

	// refresh/re-initialise input values
	inputFrom.value = "";
	inputTo.value = "";
	inputTime.value = "";

}

// get new line name  
function getLineName(){
	var newLineName = document.getElementById("name").value

	return newLineName
}

function saveLine(){
	
	// get line name and colour
	var lineName = getLineName()
	var colour = document.getElementById("colour").value

	// Make new line key
	allNewLines[lineName] = []

	// add color into dictionary 
	allNewLines[lineName].push(colour)
	for (const stnPair of newLineArr) {

		// take stn arr and convert to string
		allNewLines[lineName].push(stnPair.join(","))
	}
	newLineArr = [] //empty out stn array 

	// add to main dictionary
	allNewLines[lineName] = allNewLines[lineName].join("\n")
	// console.log(allNewLines[lineName])
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

		if (isRunning) {
			// take a simulation step
			metro.simStep(timestep, dataStore, csvDataStore);

			// draw map
			drawer.drawMap(metro, drawStn, drawTrain, heat_stnCheck, edgeCheck, heat_trainCheck );
			

		} else {
			// if it is paused, just draw the map with no additional input
			drawer.drawMap(metro, drawStn, drawTrain, heat_stnCheck, edgeCheck, heat_trainCheck );
			
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
	isRunning = !isRunning
	console.log(`is running: ${isRunning}`)
    if (!isRunning) {

		updateGraph();
        plotter.plotLineWaitTimes("chart1", dataStore, metro.metroLineColours);
        plotter.plotTravelTimes("chartTravelTime", dataStore);

    }
}

function resetSim() {

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
setButton1(dataStore); //set line dropdown selection (inputer parameters)
setButton2(dataStore); //set station dropdown selection (input parameters)
document.getElementById('trainline').addEventListener('change', updateButton, false); //change stn button based on selection
document.getElementById('save').addEventListener("click", saveLine, false); //save new line input

//testing 
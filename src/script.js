//test
var canvas = document.getElementById('myCanvas'); 
var ctx = canvas.getContext('2d');

var canvas = document.getElementById('heatCanvas'); 
var heatCtx = canvas.getContext('2d');

var maxX = 960;
var maxY = 540;

var isRunning = false;
var isPaused = true;

function pause() {
  isRunning = false;
  isPaused = true;
  clearInterval(simTimer);
}

// function runsim()
//process all the station data
var metroDataProcessor = new MetroDataProcesser();
metroDataProcessor.parseStationString(stationString);
for (const [lineName, edges] of Object.entries(edgesMap)) {
	metroDataProcessor.parseEdgeString(lineName, edges);
}
metroDataProcessor.parseEdgeColours(edgeColourString)

//intiialize graph and drawer
var metroGraph = new MetroGraph("Singapore MRT");
var mapDrawer = new MapDrawer(ctx, maxX, maxY);
var heatMapDrawer = new MapDrawer(heatCtx, maxX, maxY);

metroDataProcessor.constructMetroGraph(metroGraph, mapDrawer);

//find all the shortest paths between stations
metroGraph.floydWarshall();
metroGraph.getAllPathPairs();

//initializes a train at every station
metroGraph.initTrainAtStation();

/** Code to run on initialization of page */
function init() {
	window.requestAnimationFrame(draw);
}

/** function that loops and draws everything */
function draw() {

	metroGraph.update();

	mapDrawer.drawMap(metroGraph);

	heatMapDrawer.drawHeatMap(metroGraph);

	window.requestAnimationFrame(draw);
}

init();


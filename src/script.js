//test
var canvas = document.getElementById('myCanvas'); 
var ctx = canvas.getContext('2d');

var maxX = 960;
var maxY = 540;

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

metroDataProcessor.constructMetroGraph(metroGraph, mapDrawer);

//initializes a train at every station
// metroGraph.initTrainAllStations();
metroGraph.addTrain(0, new Train(0, "ewl", 0, metroGraph.metroPaths["ewlFW"][0]))

/** Code to run on initialization of page */
function init() {
	window.requestAnimationFrame(draw);
}

/** function that loops and draws everything */
function draw() {

	metroGraph.update();

	mapDrawer.drawMap(metroGraph);

	window.requestAnimationFrame(draw);
}

init();


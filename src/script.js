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

var midX = 200
var midY = 200

var processor = new InputProcessor()
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

var dataStore = new DataStore()
dataStore.init(metro)

var plotter = new Plotter()

metro.hour = startHour
metro.sysTime = startHour * 60

function draw_map() {

		if (isRunning) {
			// take a simulation step
			var simStepUpdate = metro.simStep(timestep, dataStore);

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


function toggleSim() {
	isRunning = !isRunning
	console.log(`is running: ${isRunning}`)
    if (!isRunning) {
        plotter.plotLineWaitTimes("chart1", dataStore)
        plotter.plotChosenLineWaitTimes("chartRed", dataStore, "nsl")
        plotter.plotChosenLineWaitTimes("chartPurple", dataStore, "ewl")
        plotter.plotTravelTimes("chartTravelTime", dataStore)
        plotter.initStationCommCount("chartstation1", dataStore, "station12")
		plotter.initStationCommCount("chartstation2", dataStore, "station94")
		plotter.initStationTrainCommCount("chartstation3", dataStore, "station3")
		plotter.initStationCommCount("chartstation4", dataStore, "station4")
		plotter.initStationCommCount("chartstation5", dataStore, "station5")
    }
}

function resetSim() {

}

function downloadRunData() {
    var zip = new JSZip();
    for (var i = 0; i < 5; i++) {
        var txt = 'hello';
        zip.file("file" + i + ".txt", txt);
    }
    zip.generateAsync({
        type: "base64"
    }).then(function(content) {
        window.location.href = "data:application/zip;base64," + content;
    });       
}
// function toggleCreate() {
// 	creatorMode = !creatorMode
// }

// Ready, set, go
draw_map()
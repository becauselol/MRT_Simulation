let canvas = document.getElementById("myCanvas")
let ctx = canvas.getContext('2d')


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

var station_data = `Station1 red01,-100,0
Station 2 red02/pur02,0,0
Station 3 red03/pur03,100,0
Station 4 pur01,0,-100
Station 5 pur04,0,100`

var travel_data = {
	"pur": `pur01,pur02,2
pur02,pur03,2
pur03,pur04,2`,

	"red": `red01,red02,2
red02,red03,2`
}

var edgeColour = `red,red
pur,purple`

// not being used at the moment
train_wait_time = `red01,1
red02,1
red03,1
pur01,1
pur04,1`

var period = 5

var processor = new InputProcessor()
processor.parseStationString(station_data)
processor.parseEdgeStringDict(travel_data)
processor.parseEdgeColours(edgeColour)

processor.constructMetroGraph(metro, drawer)
processor.addTrainsWithPeriod(metro, "red", 12, 18)
processor.addTrainsWithPeriod(metro, "pur", 18, 18)

metro.getPathsFromStartStation();
metro.constructCommuterGraph();
metro.constructInterchangePaths();

var dataStore = new DataStore()
dataStore.init(metro)

var plotter = new Plotter()


function draw_map() {

		if (isRunning) {
			// take a simulation step
			var simStepUpdate = metro.simStep(timestep, dataStore);

			// draw map
			drawer.drawMap(metro);

			// plotter.updateCommCount(simStepUpdate)
		// } else if (creatorMode) {
		// 	// else if in creator mode (draw creator map)
		// 	drawer.drawCreatorMap(metro, mouseX, mouseY);
            // plotter.plotLineWaitTimes("chart1", dataStore)
            // plotter.plotChosenLineWaitTimes("chartRed", dataStore, "red")
            // plotter.plotChosenLineWaitTimes("chartPurple", dataStore, "purple")
		} else {
			// if it is paused, just draw the map with no additional input
			drawer.drawMap(metro);
			
		}

        
		// refresh to the next frame
		window.requestAnimationFrame(draw_map);
}


function toggleSim() {
	isRunning = !isRunning
	console.log(`is running: ${isRunning}`)
    if (!isRunning) {
        plotter.plotLineWaitTimes("chart1", dataStore)
        plotter.plotChosenLineWaitTimes("chartRed", dataStore, "red")
        plotter.plotChosenLineWaitTimes("chartPurple", dataStore, "pur")
        plotter.plotTravelTimes("chartTravelTime", dataStore)
        plotter.initStationCommCount("chartstation1", dataStore, "station1")
		plotter.initStationCommCount("chartstation2", dataStore, "station2")
		plotter.initStationCommCount("chartstation3", dataStore, "station3")
		plotter.initStationCommCount("chartstation4", dataStore, "station4")
		plotter.initStationCommCount("chartstation5", dataStore, "station5")
    }
}

// function toggleCreate() {
// 	creatorMode = !creatorMode
// }

// Ready, set, go
draw_map()
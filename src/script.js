let canvas = document.getElementById("myCanvas")
let ctx = canvas.getContext('2d')

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 1
let MAX_ZOOM = 5
let MIN_ZOOM = 0.1
let SCROLL_SENSITIVITY = 0.0005

var isRunning = false;
// var creatorMode = false;

var maxX = 960;
var maxY = 540;

var fps = 20; // frames per real time second // FPS needs to be at least 5 and all waitTimes of trains and edge weights must be at least 1
var timestep = 1/fps;

//intiialize graph and drawer
var metro = new Metro("Singapore MRT");
var drawer = new MapDrawer(ctx, maxX, maxY);

var midX = 0
var midY = 0
console.debug(midX, midY)

var station1 = new Station("station1", midX - 100, midY, name="station1", codes = ["red"], waitTime=1)
var station2 = new Station("station2", midX, midY, name="station2", codes = ["red", "purple"], waitTime=1)
var station3 = new Station("station3", midX + 100, midY, name="station3", codes = ["red", "purple"], waitTime=1)
station1.pathCodes.add("red")
station2.pathCodes.add("red")
station3.pathCodes.add("red")
station3.pathCodes.add("purple")
station2.pathCodes.add("purple")

station1.addNeighbour("red", "FW", "station2", 2)
station2.addNeighbour("red", "FW", "station3", 2)
station3.addNeighbour("red", "BW", "station2", 2)
station2.addNeighbour("red", "BW", "station1", 2)

var station4 = new Station("station4", midX, midY - 100, name="station4", codes = ["purple"], waitTime=1)
var station5 = new Station("station5", midX, midY + 100, name="station5", codes = ["purple"], waitTime=1)
station4.pathCodes.add("purple")
station5.pathCodes.add("purple")

station4.addNeighbour("purple", "FW", "station2", 2)
station2.addNeighbour("purple", "BW", "station4", 2)

station3.addNeighbour("purple", "BW", "station2", 2)
station2.addNeighbour("purple", "FW", "station3", 2)

station5.addNeighbour("purple", "BW", "station3", 2)
station3.addNeighbour("purple", "FW", "station5", 2)


var stations = {
	"station1": station1,
	"station2": station2,
	"station3": station3,
	"station4": station4,
	"station5": station5
}


for (const [stationId, station] of Object.entries(stations)) {
    metro.addStation(station);
}
metro.metroLineStartStation = {"red": "station1", "purple": "station4"};
metro.metroLineColours = {"red": "red", "purple": "purple"};

metro.getPathsFromStartStation();

var train1 = new Train("train1", 
	pathCode = "red", 
	prev = station1.coords, 
	prevId="station1",
    capacity=3)

var train2 = new Train("train2", 
    pathCode = "purple", 
    prev = station4.coords, 
    prevId="station4",
    capacity=3)

metro.trainDict["train1"] = train1
metro.trainDict["train2"] = train2
var pos = {"x": 0, "y": 0}
window.addEventListener('mousemove',() => {
	var rect = canvas.getBoundingClientRect();
  pos.x = (event.clientX - cameraOffset.x - rect.left) / cameraZoom
  pos.y = (event.clientY - cameraOffset.y - rect.top) / cameraZoom
  // console.log(pos)
}, false);

metro.constructCommuterGraph();
metro.constructInterchangePaths();

var dataStore = new DataStore()
dataStore.init(metro)

var plotter = new Plotter()


function draw_map() {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight

		// Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
		ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
		ctx.scale(cameraZoom, cameraZoom)
		ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
		ctx.clearRect(-canvas.width,-canvas.height, window.innerWidth, window.innerHeight)
        // ctx.fillStyle = "black"
        // ctx.fillRect(-canvas.width, -canvas.height, window.innerWidth, window.innerHeight);

		if (isRunning) {
			// take a simulation step
			metro.simStep(timestep, dataStore);

			// draw map
			drawer.drawMap(metro);
			drawer.drawDisplay(metro, pos)
		// } else if (creatorMode) {
		// 	// else if in creator mode (draw creator map)
		// 	drawer.drawCreatorMap(metro, mouseX, mouseY);
            plotter.plotLineWaitTimes("chart1", dataStore)
            // plotter.plotChosenLineWaitTimes("chartRed", dataStore, "red")
            // plotter.plotChosenLineWaitTimes("chartPurple", dataStore, "purple")
		} else {
			// if it is paused, just draw the map with no additional input
			drawer.drawMap(metro);
			drawer.drawDisplay(metro, pos)
			
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
        plotter.plotChosenLineWaitTimes("chartPurple", dataStore, "purple")
    }
}

// function toggleCreate() {
// 	creatorMode = !creatorMode
// }

// Ready, set, go
draw_map()
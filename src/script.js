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

var midX = Math.floor(window.innerWidth / 10) + 200
var midY = Math.floor(window.innerHeight / 10) + 200
console.log(midX, midY)
var station1 = new Station("station1", midX - 100, midY, name="station1", codes = ["red"], waitTime=1)
var station2 = new Station("station2", midX, midY, name="station2", codes = ["red", "purple"], waitTime=1)
var station3 = new Station("station3", midX + 100, midY, name="station3", codes = ["red"], waitTime=1)
station1.addNeighbour("red", "FW", "station2")
station2.addNeighbour("red", "FW", "station3")
station3.addNeighbour("red", "BW", "station2")
station2.addNeighbour("red", "BW", "station1")

var station4 = new Station("station4", midX, midY - 100, name="station4", codes = "purple", waitTime=1)
var station5 = new Station("station5", midX, midY + 100, name="station5", codes = "purple", waitTime=1)
station4.addNeighbour("purple", "FW", "station2")
station2.addNeighbour("purple", "FW", "station5")
station5.addNeighbour("purple", "BW", "station2")
station2.addNeighbour("purple", "BW", "station4")

var stations = {
	"station1": station1,
	"station2": station2,
	"station3": station3,
	"station4": station4,
	"station5": station5
}

var edges = {
	"station1_station2": 2,
	"station2_station1": 2,
	"station2_station3": 2,
	"station3_station2": 2,
	"station4_station2": 2,
	"station2_station4": 2,
	"station5_station2": 2,
	"station2_station5": 2
}

metro.stationDict = stations
metro.edgeDict = edges
metro.metroLineStartStation = {"red": "station1", "purple": "station4"};
metro.metroLineColours = {"red": "red", "purple": "purple"};

var train1 = new Train("train1", 
	pathCode = "red", 
	prev = station1.coords, 
	prevId="station1")

metro.trainDict["train1"] = train1
var pos = {"x": 0, "y": 0}
window.addEventListener('mousemove',() => {
	var rect = canvas.getBoundingClientRect();
  pos.x = event.clientX - rect.left
  pos.y = event.clientY - rect.top
}, false);


function draw_map() {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight

		// Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
		// ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
		// ctx.scale(cameraZoom, cameraZoom)
		// ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
		ctx.clearRect(0,0, window.innerWidth, window.innerHeight)


		if (isRunning) {
			// take a simulation step
			metro.simStep(timestep);

			// draw map
			drawer.drawMap(metro);
			drawer.drawDisplay(metro, pos)
		// } else if (creatorMode) {
		// 	// else if in creator mode (draw creator map)
		// 	drawer.drawCreatorMap(metro, mouseX, mouseY);

		} else {
			// if it is paused, just draw the map with no additional input
			drawer.drawMap(metro);
			drawer.drawDisplay(metro, pos)
			
		}

		// refresh to the next frame
		window.requestAnimationFrame(draw_map);
}

// ALL the zooming and dragging logic
// Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }        
    }
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

function onPointerDown(e)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
    dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
}

function onPointerMove(e)
{
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
    }
}

function handleTouch(e, singleTouchHandler)
{
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e)
{
    e.preventDefault()
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (initialPinchDistance == null)
    {
        initialPinchDistance = currentDistance
    }
    else
    {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function adjustZoom(zoomAmount, zoomFactor)
{
    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor)
        {
            console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
        }
        
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        
        console.log(zoomAmount)
    }
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
// end of zooming and dragging logic

function toggleSim() {
	isRunning = !isRunning
	console.log(`is running: ${isRunning}`)
}

// function toggleCreate() {
// 	creatorMode = !creatorMode
// }

// Ready, set, go
draw_map()
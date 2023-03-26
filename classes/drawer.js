/** Class representing a MapDrawer.
 * 
 * The main job of the MapDrawer class is to draw station, edges and trains as required
 */
class MapDrawer {

    /**
     * Create a MapDrawer class
     * @param {Context} ctx - Provides the context class to draw the map with
     * @param {integer} width - width of the canvas element
     * @param {integer} height - height of the canvas element
     * */
	constructor(ctx, width, height, x_padding=10, y_padding=10) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.x_padding = x_padding;
        this.y_padding = y_padding;
        this.HOVER_RADIUS = 10;
	}

    /**
     * Draws a station in the canvas context
     * @param {Station} station - station object to be drawn
     * */
    drawStation(station) {
        this.ctx.beginPath();
        this.ctx.arc(station.coords.x, station.coords.y, 5, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 3;
        // line color
        this.ctx.strokeStyle = 'gray';
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Draws a Train in the canvas context
     * @param {Train} train - train object to be drawn
     * */
    drawTrain(train) {
        //train codethis.
        this.ctx.beginPath();
        this.ctx.arc(train.coords.x, train.coords.y, 1, 0, 2*Math.PI, true);
        this.ctx.lineWidth = 5;
        // line color
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Draws an Edge in the canvas context
     * @param {Edge} edge - edge object to be drawn
     * */
    drawEdge(station1, station2, colour) {
        this.ctx.beginPath();
        this.ctx.moveTo(station1.coords.x, station1.coords.y);
        this.ctx.lineTo(station2.coords.x, station2.coords.y);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = colour;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Draws the whole MetroGraph in the canvas context
     * @param {MetroGraph} metroGraph - draws the metroGraph as required
     * */
    drawMap(metroGraph) {
        // this.ctx.clearRect(0, 0, this.width, this.height);
        // console.log("words?")
        //Iterate over all the objects and draw them as required
        // console.log(metroGraph)
        for (const [lineCode, stationId] of Object.entries(metroGraph.metroLineStartStation)) {
            var curr = metroGraph.stationDict[stationId]
            var nextId = curr.getNeighbourId(lineCode, "FW")
            var next = metroGraph.stationDict[nextId]
            var colour = metroGraph.metroLineColours[lineCode]
            
            // utilizes the linked list concept to draw the lines
            while (next !== undefined) {
                this.drawEdge(curr, next, colour);
                curr = next;
                nextId = curr.getNeighbourId(lineCode, "FW")
                next = metroGraph.stationDict[nextId]
            }
        }

        for (const [stationId, station] of Object.entries(metroGraph.stationDict)) {
            this.drawStation(station);
        }

        for (const [trainId, train] of Object.entries(metroGraph.trainDict)) {
            this.drawTrain(train);
        }
    }

    drawDisplay(metroGraph, pos) {
        // tell the browser we're handling this event
        // console.log(pos)
        var mouseX = pos.x
        var mouseY = pos.y

        this.drawMap(metroGraph);
        for (const [stationId, station] of Object.entries(metroGraph.stationDict)) {
            var h = station
            var dx = mouseX - h.coords.x;
            var dy = mouseY - h.coords.y;
            if (dx * dx + dy * dy < this.HOVER_RADIUS * this.HOVER_RADIUS) {
                // console.log("true")
                ctx.font = "20px Verdana";
                ctx.fillText(station.commuters.length, h.coords.x - 20, h.coords.y - 15);
            }
        } 
    }
}

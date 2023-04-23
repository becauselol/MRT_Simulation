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
     * @param {integer} x_padding - padding of the canvas on the x side
     * @param {integer} y_padding - padding of the canvas on the y side
     * */
	constructor(ctx, width, height, x_padding=10, y_padding=10) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.x_padding = x_padding;
        this.y_padding = y_padding;
	}

    /**
     * Draws a station in the canvas context
     * @param {Station} station - station object to be drawn
     * @param {String} colour - the colour to draw the station with
     * */
    drawStation(station, colour="gray") {
        // draws a hollow circle to represent the station
        this.ctx.beginPath();
        this.ctx.arc(station.coords.x, station.coords.y, 5, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 3;
        // line color
        this.ctx.strokeStyle = colour;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Draws a Train in the canvas context
     * @param {Train} train - train object to be drawn
     * @param {String} colour - the colour to draw the train with
     * */
    drawTrain(train, colour = "black") {
        // draws a circle to represent the train
        this.ctx.beginPath();
        this.ctx.arc(train.coords.x, train.coords.y, 1, 0, 2*Math.PI, true);
        this.ctx.lineWidth = 5;
        // line color
        this.ctx.strokeStyle = colour
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Draws an Edge in the canvas context
     * @param {Station} station1 - the station to draw the edge from
     * @param {Station} station2 - the station to draw the edge to
     * @param {String} colour - the colour to draw the edge
     * */
    drawEdge(station1, station2, colour = "black") {
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
     * Takes a value from 0 to 1 and converts it to a HSL colour to input into the map
     * Taken from: https://stackoverflow.com/questions/12875486/what-is-the-algorithm-to-create-colors-for-a-heatmap
     * */
    heatMapColorforValue(value){
        var h = (1.0 - value) * 240
        return "hsl(" + h + ", 100%, 50%)";
    }

    /**
     * Draws the whole MetroGraph in the canvas context
     * @param {MetroGraph} metroGraph - draws the metroGraph as required
     * @param {bool} drawStations - whether to draw stations
     * @param {bool} drawTrains - whether to draw trains
     * @param {bool} stationHeatColour - whether to draw the heatmap of station commuters
     * @param {bool} edgeBlackColour - whether to draw all edges as black
     * @param {bool} trainHeatColour - whether to draw the heatmap of train commuters
     * @param {Float} trainCapacityLimit - number between 0 to 1 to determine which level of capacity is critical
     * @param {String} mode - the type of commuter count at stations to consider ("total", "transit", "terminating") (not in use)
     * */
    drawMap(metroGraph, 
        drawStations=true, 
        drawTrains=true, 
        stationHeatColour=false, 
        edgeBlackColour=false, 
        trainHeatColour=false, 
        trainCapacityLimit=0.8, 
        mode="transit") {

        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // draws all the edges of each line
        for (const [lineCode, stationId] of Object.entries(metroGraph.metroLineStartStation)) {
            var curr = metroGraph.stationDict[stationId]
            var nextId = curr.getNeighbourId(lineCode, "FW")
            var next = metroGraph.stationDict[nextId]
            if (edgeBlackColour) {
                var colour = "black"
            } else {
                var colour = metroGraph.metroLineColours[lineCode]
            }
            
            // utilizes the linked list concept to draw the lines
            while (next !== undefined) {
                this.drawEdge(curr, next, colour);
                curr = next;
                nextId = curr.getNeighbourId(lineCode, "FW")
                next = metroGraph.stationDict[nextId]
            }
        }

        // draws the stations as required depending on the various boolean conditions
        if (drawStations) {
            if (stationHeatColour){
                var stationMinMax = metroGraph.getStationCountMinMax(mode)
                var min = stationMinMax[0]
                var max = stationMinMax[1]
            }

            for (const [stationId, station] of Object.entries(metroGraph.stationDict)) {
                if (stationHeatColour) {
                    if (mode == "total") {
                        var count = station.getCommuterCount()
                    } else {
                        var count = station.commuters[mode].length
                    }

                    // min-max scaling for the heat colour value
                    var heatScale = ((count - min) / (max - min)).toFixed(6);
                    var colour = this.heatMapColorforValue(heatScale);
                } else {
                    var colour = "gray"
                }
                this.drawStation(station, colour);
            }
        }

        // draws the trains as required depending on the various boolean conditions
        if (drawTrains) {
            for (const [trainId, train] of Object.entries(metroGraph.trainDict)) {
                if (trainHeatColour) {
                    var count = train.getCommuterCount()
                    
                    // scaling for the heat colour value
                    var heatScale = (count/(trainCapacityLimit*train.capacity)).toFixed(6);
                    if (heatScale > 1) {
                        heatScale = 1;
                    }
                    var colour = this.heatMapColorforValue(heatScale);
                    this.drawTrain(train, colour);
                } else {
                    this.drawTrain(train);
                }
            }
        }
        
    }
}

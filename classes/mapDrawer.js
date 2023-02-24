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
	}

    /**
     * Draws a station in the canvas context
     * @param {Station} station - station object to be drawn
     * */
    drawStation(station) {
        this.ctx.beginPath();
        this.ctx.arc(station.x, station.y, 5, 0, 2 * Math.PI, false);
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
        this.ctx.arc(train.x, train.y, 1, 0, 2*Math.PI, true);
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
    drawEdge(edge, attr = 'colour') {
        this.ctx.beginPath();
        this.ctx.moveTo(edge.head.x, edge.head.y);
        this.ctx.lineTo(edge.tail.x, edge.tail.y);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = edge[attr];
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Draws the whole MetroGraph in the canvas context
     * @param {MetroGraph} metroGraph - draws the metroGraph as required
     * */
    drawMap(metroGraph) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // technically the code should grab a random ass 
        var q = [0];
        var visited = new Set();
        visited.add(0);

        while (q.length > 0) {
            var currId = q.pop();
            var curr = metroGraph.stations[currId];

            // console.log(curr);
            for (const [stationId, edge] of Object.entries(curr["neighbours"])) {
                var n = metroGraph.stations[stationId];
                if (stationId == currId) {
                    continue;
                }
                this.drawEdge(edge)

                if (!visited.has(n.id)) {
                    visited.add(n.id);
                    q.push(n.id);

                }
            }
        }

        for (const [stationId, station] of Object.entries(metroGraph.stations)) {
            this.drawStation(station);
        }
        for (const [trainId, train] of Object.entries(metroGraph.trains)) {
            this.drawTrain(train);
        }
    }


    /**
     * Takes a value from 0 to 1 and converts it to a HSL colour to input into the map
     * Taken from: https://stackoverflow.com/questions/12875486/what-is-the-algorithm-to-create-colors-for-a-heatmap
     * */
    heatMapColorforValue(value){
        var h = (1.0 - value) * 240
        return "hsl(" + h + ", 100%, 50%)";
    }

    drawHeatEdge(edge, min, max, commuterData) {
        //update edgeData
        edge.heatScale = ((edge.commuterData.allTimeTotal - min) / (max - min)).toFixed(6);
        edge.heatColour = this.heatMapColorforValue(edge.heatScale);

        this.ctx.beginPath();
        this.ctx.moveTo(edge.head.x, edge.head.y);
        this.ctx.lineTo(edge.tail.x, edge.tail.y);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = edge.heatColour;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Draws the whole MetroGraph in the canvas context
     * Important is that data needs to draw the undirectedEdge data
     * @param {MetroGraph} metroGraph - draws the metroGraph as required
     * */
    drawHeatMap(metroGraph) {
        //for all edges, assign a 
        var edgeStats = metroGraph.getUndirectedEdgeStats();

        this.ctx.clearRect(0, 0, this.width, this.height);
        // technically the code should grab a random ass 
        var q = [0];
        var visited = new Set();
        visited.add(0);

        while (q.length > 0) {
            var currId = q.pop();
            var curr = metroGraph.stations[currId];

            // console.log(curr);
            for (const [stationId, edge] of Object.entries(curr["neighboursUndirected"])) {
                var n = metroGraph.stations[stationId];
                if (stationId == currId) {
                    continue;
                }
                this.drawHeatEdge(edge, edgeStats[0], edgeStats[1], metroGraph.commuterData)

                if (!visited.has(n.id)) {
                    visited.add(n.id);
                    q.push(n.id);

                }
            }
        }

        for (const [stationId, station] of Object.entries(metroGraph.stations)) {
            this.drawStation(station);
        }
        for (const [trainId, train] of Object.entries(metroGraph.trains)) {
            this.drawTrain(train);
        }
    }
}
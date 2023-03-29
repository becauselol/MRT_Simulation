// Class that can process data to help create metro
class MetroDataProcesser {
	/** Creates a MetroDataProcessor
	 * Initializes it with no stations and edges
	 * */
	constructor() {
		this.stationList = [];
		this.edgeMap = {};
		this.edgeColours = {};

		this.min_lat = Number.MAX_SAFE_INTEGER;
		this.min_long = Number.MAX_SAFE_INTEGER;
		this.max_lat = Number.MIN_SAFE_INTEGER;
		this.max_long = Number.MIN_SAFE_INTEGER;
	}
	
	/** Parses a string of stations in the format "name code, latitude, longitude"
	 * @param {String} stationString a long chain of strings
	 * */
	parseStationString(stationString) {
		// splits the string by the new line
		// to get each individual station detail
		var stationArr = stationString.split("\n");

		// for each station in the arr
		for (var idx=0; idx < stationArr.length; idx++) {
			// split the string by commas to get each individual detail
			// Converts the original values to ["name code", lat, long]
			let row = stationArr[idx].split(",")
			row[1] = parseFloat(row[1]);
			row[2] = parseFloat(row[2]);
			this.stationList.push(row);

			//logic to check for min and max lat long
			this.min_lat = Math.min(this.min_lat, row[1])
			this.max_lat = Math.max(this.max_lat, row[1])
			this.min_long = Math.min(this.min_long, row[2])
			this.max_long = Math.max(this.max_long, row[2])
		}
	}


	/** Parses a string of Edges in the format "stationCodeFrom, stationCodeTo, timeToTravel"
	 * @param {String} lineName - the name of the metro line for the edges to process
	 * @param {String} edgeString - the string that stores all the edges
	 * */
	parseEdgeString(lineName, edgeString) {
		// Splits the string by newline to get each Edge description
		this.edgeMap[lineName] = edgeString.split("\n");

		//for each edge
		for (var idx=0; idx < this.edgeMap[lineName].length; idx++) {
			//Splits the format into an array for easier processing later
			this.edgeMap[lineName][idx] = this.edgeMap[lineName][idx].split(",");
			this.edgeMap[lineName][idx][2] = parseInt(this.edgeMap[lineName][idx][2]);
		}
	}

	/** Parses a set of values where each line is "line, lineColour"
	 * Helps set the colour of each metro line
	 * @param {String} edgeColourString - string containing the set of values to assign metrolines to a colour
	 * */
	parseEdgeColours(edgeColourString) {
		// split by new line
		var edgeColourArr = edgeColourString.split("\n");

		// for each item in the array
		for (var idx=0; idx < edgeColourArr.length; idx++) {
			//split further so it becomes [line, lineColour]
			var tempArr = edgeColourArr[idx].split(",");
			var edgeCode = tempArr[0];
			var edgeColour = tempArr[1];
			
			//store the data in an Object for easy access later
			this.edgeColours[edgeCode] = edgeColour;
		}
	}

	/* Construct stations to be added to a MetroGraph object
	 * @param {MetroGraph} metroGraph - the graph to add stations to
	 * @param {MapDrawer} mapDrawer - the mapdrawer of the graph (required to scale the stations accordingly)
	 * */
	constructStations(metroGraph, mapDrawer) {
		//scaling + adding stations
		var counter = 0;
		for (var idx=0; idx < this.stationList.length; idx++) {
			var name = this.stationList[idx][0];

			//perform min-max scaling on lat long
			var x = ((this.stationList[idx][1] - this.min_lat) * mapDrawer.width) / (this.max_lat - this.min_lat);
			var y = ((this.stationList[idx][2] - this.max_long) * mapDrawer.height) / (this.min_long - this.max_long);

			//get codes
			var all_codes = name.split(" ").slice(-1)[0];
			var codes = all_codes.split("/");

			// temporary thing to only plot ccl
			var ccl = false;
			for (var i = 0; i < codes.length; i++) {
				if (codes[i].slice(0,2) == "CC") {
					ccl = true;
				}
			}
			if (ccl) {
				//add Station to metroGraph
				metroGraph.addStation(counter, new Station(counter, x + mapDrawer.x_padding, y + mapDrawer.y_padding, name, codes));
				counter++;
			}
			
		}
	}


	/* Construct paths to be added to a MetroGraph object
	 * @param {MetroGraph} metroGraph - the graph to add stations to
	 * */
	constructMapPaths(metroGraph) {
		for (const [edgeCode, edges] of Object.entries(this.edgeMap)) {
			// temporary thing to only plot ccl
			if (edgeCode != "ccl") {
				continue;
			}
			var colour = this.edgeColours[edgeCode];

			//initialize empty path for FW and BW (forwards and backwards)
			metroGraph.metroPaths[edgeCode + "FW"] = [];
			metroGraph.metroPaths[edgeCode + "BW"] = [];

			for (var idx=0; idx < edges.length; idx++) {
				//get stationId
				var a = metroGraph.stationCodeMap[edges[idx][0]];
				var b = metroGraph.stationCodeMap[edges[idx][1]];
				var weight = edges[idx][2];

				//create new edges
				var undirEdge = new Edge(metroGraph.stations[a], metroGraph.stations[b], colour)
				var abEdge = new DirectedEdge(metroGraph.stations[a], metroGraph.stations[b], weight, colour, undirEdge);
				var baEdge = new DirectedEdge(metroGraph.stations[b], metroGraph.stations[a], weight, colour, undirEdge);

				metroGraph.undirectedEdges.push(undirEdge);
				metroGraph.edges.push(abEdge);
				metroGraph.edges.push(baEdge);

				//add edges to adjacency list
				metroGraph.stations[a].addNeighbourUndirected(b, undirEdge);
				metroGraph.stations[b].addNeighbourUndirected(a, undirEdge);
				metroGraph.stations[a].addNeighbour(b, abEdge);
				metroGraph.stations[b].addNeighbour(a, baEdge);

				//add pathCodes to the stations
				metroGraph.stations[a].pathCodes.add(edgeCode);
				metroGraph.stations[b].pathCodes.add(edgeCode);

				//add stations to the path
				//add start station
				if (idx == 0) {
					metroGraph.metroPaths[edgeCode + "FW"].push(metroGraph.stations[a]);
					metroGraph.metroPaths[edgeCode + "BW"].unshift(metroGraph.stations[a]);
				}
				//add subsequent edge
				metroGraph.metroPaths[edgeCode + "FW"].push(abEdge);
				metroGraph.metroPaths[edgeCode + "BW"].unshift(baEdge);
				//add next station
				metroGraph.metroPaths[edgeCode + "FW"].push(metroGraph.stations[b]);
				metroGraph.metroPaths[edgeCode + "BW"].unshift(metroGraph.stations[b]);

			}
		}
	}

	/* Construct a new metroGraph
	 * @param {MetroGraph} metroGraph - the metroGraph object to add the station and paths to
	 * @param {MapDrawer} mapDrawer - mapDrawer object to reference for the canvas size
	 * */
	constructMetroGraph(metroGraph, mapDrawer) {
		// construc the stations
		this.constructStations(metroGraph, mapDrawer);
		// construct the map paths
		this.constructMapPaths(metroGraph);
	}

}

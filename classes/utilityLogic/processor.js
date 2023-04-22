class InputProcessor {
	constructor() {
		this.init()
	}

	init() {
		this.defaultLines = ["nsl", "ccl", "nel", "dtl", "tel", "cgl", "ewl"]
		this.chosenLines = ["nsl", "ccl", "nel", "dtl", "tel", "cgl", "ewl"]
		this.edgeMap = {}
		this.stationList = []
		this.stationDict = {}
		this.edgeColours = {}
		this.codeStationRef = {}
		this.metroLineStartStation = {}
		this.spawnData = {}
	}

	setDefaultTrainLineCapacities(capacity) {
		this.trainCapacities = {}
		for (const line of this.chosenLines) {
			this.trainCapacities[line] = capacity
		}
	}

	setDefaultTrainLinePeriod(period) {
		this.trainPeriod = {}
		for (const line of this.chosenLines) {
			this.trainPeriod[line] = period
		}
	}

	parseStationString(stationString) {
		this.min_lat = Number.MAX_SAFE_INTEGER;
		this.min_long = Number.MAX_SAFE_INTEGER;
		this.max_lat = Number.MIN_SAFE_INTEGER;
		this.max_long = Number.MIN_SAFE_INTEGER;

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

	parseSpawnDataString(spawnDataString) {
		var spawnArr = spawnDataString.split("\n");
		// console.debug(this.codeStationRef)
		for (var idx=0; idx < spawnArr.length; idx++) {
			// split the string by commas to get each individual detail
			// Converts the original values to ["name code", lat, long]
			let row = spawnArr[idx].split(",")

			

			row[0] = parseFloat(row[0]);
			row[3] = parseFloat(row[3]);

			row[1] = row[1].split("/")[0]
			row[2] = row[2].split("/")[0]
			// console.debug(row)

			var hour = row[0]
			var rate = row[3]
			var sourceId = this.codeStationRef[row[1]]
			var destId = this.codeStationRef[row[2]]

			if (sourceId === undefined || destId === undefined) {
				continue;
			}

			var sourceStation = this.stationDict[sourceId]

			if (!(destId in sourceStation.spawnRate)) {
				sourceStation.spawnRate[destId] = new Array(25); 
				for (let i=0; i<25; ++i) sourceStation.spawnRate[destId][i] = 0;
			}

			// we go by the minute
			sourceStation.spawnRate[destId][hour] = parseFloat((rate/60).toFixed(6))
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

	edgeStringLineDuration(lineName) {
		var sum = 0
		for (const [key, arr] of Object.entries(this.edgeMap[lineName])) {
			sum += arr[2]
		}
		return sum
	}

	parseEdgeStringDict(edgeDict) {
		for (const [lineName, edgeString] of Object.entries(edgeDict)) {
			this.parseEdgeString(lineName, edgeString)
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

	constructStationDict(mapDrawer) {
		//scaling + adding stations
		var counter = 1;
		for (var idx=0; idx < this.stationList.length; idx++) {
			var name = this.stationList[idx][0];

			//perform min-max scaling on lat long
			var x = ((this.stationList[idx][1] - this.min_lat) * mapDrawer.width) / (this.max_lat - this.min_lat);
			var y = ((this.stationList[idx][2] - this.max_long) * mapDrawer.height) / (this.min_long - this.max_long);

			//get codes
			var all_codes = name.split(" ").slice(-1)[0];
			var codes = all_codes.split("/");
			var stationId = "station" + counter
			for (const c of codes) {
				this.codeStationRef[c] = stationId
			}

			//add Station to metroGraph
			if (codes.length > 1) {
				var waitTime = 0.67
			} else {
				var waitTime = 0.42
			}

			this.stationDict[stationId] = new Station(stationId, x + mapDrawer.x_padding, y + mapDrawer.y_padding, name, codes, waitTime);
			counter++;
		}
	}

	constructEdges() {
		for (const line of this.chosenLines) {
			var edges = this.edgeMap[line]
			for (var idx=0; idx < edges.length; idx++) {
				//get stationId
				var aId = this.codeStationRef[edges[idx][0]];
				var bId = this.codeStationRef[edges[idx][1]];
				var a = this.stationDict[aId]
				var b = this.stationDict[bId]
				var weight = edges[idx][2];

				// initialize the start of the line
				if (idx == 0) {
					this.metroLineStartStation[line] = aId
				}

				a.addNeighbour(line, "FW", bId, weight - b.waitTime)
				b.addNeighbour(line, "BW", aId, weight - b.waitTime)
			}
		}
	}


	/* Construct a new metroGraph
	 * @param {MetroGraph} metroGraph - the metroGraph object to add the station and paths to
	 * @param {MapDrawer} mapDrawer - mapDrawer object to reference for the canvas size
	 * */
	constructMetroGraph(metroGraph, mapDrawer, spawnDataString) {
		// construct the stations
		this.constructStationDict(mapDrawer);

		this.parseSpawnDataString(spawnDataString)
		// construct the map paths
		this.constructEdges();

		for (const [key, station] of Object.entries(this.stationDict)) {
			metroGraph.addStation(station)
		}

		metroGraph.metroLineStartStation = this.metroLineStartStation
		metroGraph.metroLineColours = this.edgeColours
	}

	addTrainsWithPeriod(metroGraph, lineCode, period, capacity) {
		console.debug(`placing trains for line ${lineCode}`)
		var duration = metroGraph.getLineDuration(lineCode)
		var maxTrains = Math.floor(duration / period)

		console.debug(`Placing ${maxTrains} trains`)
		var trainPlaced = 0

		var interval = (duration / maxTrains).toFixed(10)
		console.debug(`Interval to place trains at: ${interval}`)
		var overall_lag = 0
		while (trainPlaced < maxTrains) {
			metroGraph.placeTrainAtStart(lineCode, capacity)

			// progress until we hit interval
			while (metroGraph.sysTime < interval) {
				metroGraph.onlyTrainSimStep(0.01)
			}
			overall_lag += (metroGraph.sysTime - interval)
			// console.debug(`time ${metroGraph.sysTime.toFixed(2)}: train placed and progressed ${metroGraph.sysTime.toFixed(2)} with interval ${interval}`)
			// reset the systime
			metroGraph.sysTime = 0
			trainPlaced++
		}
		console.debug(`overall lag: ${overall_lag}`)
	}
	

}
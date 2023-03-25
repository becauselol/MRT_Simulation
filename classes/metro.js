class Metro {
	constructor(name) {
		this.sysTime = 0;
		this.name = name;

		//stations
		this.stationCount = 0;
		this.stationDict = {}

		//trains
		this.trainCount = 0;
		this.trainDict = {};

		// tracks

		// stores weights
		this.edgeDict = {};

		this.metroPaths = {};
		this.metroLineStartStation = {};
		this.metroLineColours = {};
		
		this.commuterPaths = {};
	}

	getPathsFromStartStation() {
		for (const [lineCode, stationId] of Object.entries(this.metroLineStartStation)) {
			this.metroPaths[`${lineCode}_FW`] = [];

			var forwardPath = this.metroPaths[`${lineCode}_FW`]

			var curr = this.stationDict[stationId]
            var nextId = curr.neighbours[`${lineCode}_FW`]
            var next = this.stationDict[nextId]
            
            // utilizes the linked list concept to draw the lines
            while (next !== undefined) {
                forwardPath.push(curr.id)
                curr = next;
                nextId = curr.neighbours[`${lineCode}_FW`]
                next = this.stationDict[nextId]
            }
            forwardPath.push(curr.id)

            this.metroPaths[`${lineCode}_BW`] = [];

			var backwardPath = this.metroPaths[`${lineCode}_BW`]

            var nextId = curr.neighbours[`${lineCode}_BW`]
            var next = this.stationDict[nextId]

            // utilizes the linked list concept to draw the lines
            while (next !== undefined) {
                backwardPath.push(curr.id)
                curr = next;
                nextId = curr.neighbours[`${lineCode}_BW`]
                next = this.stationDict[nextId]
            }
            backwardPath.push(curr.id)
		}
	}

		// Implements Floyd Warshall All-Pairs Shortest Path 
	// used to compute the shortest distance between each station
	// Runs in O(n^3) time
	//Taken from a senior (https://github.com/mickey1356/sim_project/blob/master/src/map.js)
	floydWarshall() {
		var station_ids = Object.keys(this.stationDict)
		const N = station_ids.length;
	    this.dist = {};
	    this.next = {};
	    let i = 0;

	    for (const stationId of Object.keys(this.stationDict)) {
	    	this.dist[stationId] = {};
	    	this.next[stationId] = {};

	    	for (const id of Object.keys(this.stationDict)) {
	    		this.dist[stationId][id] = Infinity
	    		this.next[stationId][id] = null
	    	}
	    }

	    for (const i of Object.keys(this.stationDict)) {
	    	for (const [lineCodeDirection, j] of Object.entries(this.stationDict[i].neighbours)) {
	    		var edgeWeight = this.edgeDict[i + "_" + j]
	    		this.dist[i][j] = edgeWeight;
				this.next[i][j] = j;
	    	}
	    }

	    for (const i of Object.keys(this.stationDict)) {
	    	this.dist[i][i] = 0;
	    	this.next[i][i] = i;
	    }

	    for (const k of Object.keys(this.stationDict)) {
	    	for (const i of Object.keys(this.stationDict)) {
	    		for (const j of Object.keys(this.stationDict)) {
	    			if (this.dist[i][j] > this.dist[i][k] + this.dist[k][j]) {
						this.dist[i][j] = this.dist[i][k] + this.dist[k][j];
						this.next[i][j] = this.next[i][k];
					}
	    		}
	    	}
	    }

	    // subtract all the wait times
	    console.log("fw done");
	}

	// function to get the path between stations
	/* @param {number} startStation - stationId of the station to start search from
	 * @param {number} targetStation - stationId of the station to target:
	 * */
	// Taken from a senior (https://github.com/mickey1356/sim_project/blob/master/src/map.js)
	getPathToStation(startStation, targetStation) {
		// have to search for the indices, unfortunately
		var u = startStation;
		var v = targetStation;
		// for (let i = 0; i < this.stations.length; i++) {
		// 	if (this.stations[i] === startStation) u = i;
		// 	else if (this.stations[i] === targetStation) v = i;
		// }

		if (this.next[u][v] === null) return []; // this should never happen

		let path = [u];
		while (u != v) {
			u = this.next[u][v];
			path.push(u);
		}
		return path;
	}


	/* Helper function to return the intersect of two values
	 * @param {Set} a
	 * @param {Set} b
	 * @return {Set} c
	 * */
	intersectSets(a, b) {
		const c = new Set;
		a.forEach(v => b.has(v) && c.add(v));
		return c;
	}

	//https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
	//check if x is in y
	/* Helper function to check if ys contains xs
	 * @param {Set} ys
	 * @param {Set} xs
	 * @return {bool}
	 * */
	hasSet(ys, xs) { return [...xs].every((x) => ys.has(x)); }

	/* Helper function to check if the direction of the path to take
	 * should be forward or backwards
	 * @param {String} pathCode - the metroPath to check (e.g. "ccl")
	 * @param {Station} startStation - the Station object of the start station
	 * @param {Station} targetStation - the Station object of the target station
	 * @return {String} the direction that the user should take (either "FW" or "BW")
	 * */
	getDirection(pathCode, startStation, targetStation) {
		if (this.metroPaths[pathCode + "FW"].indexOf(startStation) < this.metroPaths[pathCode + "FW"].indexOf(targetStation)) {
			return "FW"
		} else {
			return "BW"
		}
	}

	/* Convert a path to a commuter path
	 * Basically strips the path down to the places where 
	 * Commuters need to get off/on a train
	 * 
	 * @param {Array} path - array of path items where it contains the Station objects.
	 * @return {Array[Array]} commuter path where each item is [Station, pathCode + direction]
	 * */
	convertToCommuterPath(path) {
		var startStation = this.stationDict[path[0]]
		var currentCode = startStation.pathCodes;
		//initialize with previous to know where to board
		var interchanges = [[path[0]]];

		// add all the interchanges
		
		// for each item in path
		for (var i = 0; i < path.length; i++) {
			var currStation = this.stationDict[path[i]]
			//check if there is any similarity in the pathCodes thus far
			var commonCode = this.intersectSets(currentCode, currStation.pathCodes);

			//if there is no common code, the Commuter needed 
			//to interchange at the previous station.
			if (commonCode.size == 0) {
				//get the code that the Commuter needs to interchange at	
				var code = currentCode.entries().next().value[1]

				//add the corresponding path code to interchanges
				interchanges[interchanges.length - 1].push(code + this.getDirection(code, path[i-2], path[i-1]))

				//update the current code
				currentCode = currStation.pathCodes;
				
				//set the current station as an interchange
				interchanges.push([path[i-1]]);
			} else {
				//otherwise update current code as the commonCode
				currentCode = commonCode;
			}
		}

		//add the last pathCode to interchanges
		var code = currentCode.entries().next().value[1]
		interchanges[interchanges.length - 1].push(code + this.getDirection(code, interchanges[interchanges.length - 1], path[path.length - 1]))
		interchanges.push([path[path.length - 1], code])
		
		//return
		return interchanges;
	}

	// //get all path pairs and store them as commuterPaths
	getAllPathPairs() {
		for (const i of Object.keys(this.stationDict)) {
			for (const j of Object.keys(this.stationDict)) {
				var path = this.getPathToStation(i, j)
				if (path == []) {
					continue;
				}
				//get both the forward path and backward path between stations
				this.commuterPaths[`${i}_${j}`] = this.convertToCommuterPath(path);
				//simply reverse the order of stations to get the reverse order to travel
				this.commuterPaths[`${j}_${i}`] = this.convertToCommuterPath(path.reverse());
			}
		}

        console.log("all paths found");
	}

	trainSimStep(timestep, train) {
		switch (train.state) {
			// if it is moving
			case TrainState.MOVING:
				// console.log("moving")
				// get edge weight
				var weight = this.edgeDict[`${train.prevId}_${train.nextId}`]

				// update lambda
				train.lambda += timestep / weight // need to scale by weight

				train.getCoords()

				// if lambda > 1 train has reached
				if (train.lambda >= 1) {
					// console.log("switch to alighting")
					train.state = TrainState.ALIGHTING
					train.lambda = 0;

					// update the coordinates to show it is ON the station
					train.prev = train.next;
					train.prevId = train.nextId;
				}
				break;

			case TrainState.ALIGHTING:
				// console.log("alighting")
				// increment the timestamp of waiting (lambda)
				train.lambda += timestep

				// we need to alight all commuters on the train and 
				// move them to the station it has reached



				// the train is now waiting
				train.state = TrainState.WAITING
				break;

			case TrainState.WAITING:
				// console.log("waiting")
				train.lambda += timestep

				var currStation = this.stationDict[train.prevId]
				if (train.lambda >= currStation.waitTime) {
					// console.log("switch to boarding")
					train.state = TrainState.BOARDING;
				}
				break;

			case TrainState.BOARDING:
				console.log("boarding")
				// board the passengers

				train.state = TrainState.MOVING
				train.lambda = 0

				// get the next place to move to
				var currStation = this.stationDict[train.prevId]
				var nextStationId = currStation.neighbours[`${train.pathCode}_${train.direction}`]

				if (nextStationId === undefined) {
					train.direction = (train.direction == "FW") ? "BW" : "FW"
					nextStationId = currStation.neighbours[`${train.pathCode}_${train.direction}`]
				}

				var nextStation = this.stationDict[nextStationId]

				train.nextId = nextStationId
				train.next = nextStation.coords
				train.getCoords()
				break;
		}
	}

	stationSimStepSpawn(timestep, station) {
		station.spawnTime += timestep;

		if (station.spawnTime >= station.spawnFreq) {
			var comm = new Commuter(
					"station2",
					this.sysTime
				)
			station.commuters.push(comm)
			station.spawnTime = 0;
		}
	}

	stationSimStepTerminate(timestep, station) {
		station.termTime += timestep;

		if (station.termTime >= station.termFreq) {
			station.commuters.pop()
			station.termTime = 0;
		}
	}

	simStep(timestep){
		for (const [stationId, station] of Object.entries(this.stationDict)) {
            this.stationSimStepSpawn(timestep, station);
        }

        for (const [trainId, train] of Object.entries(this.trainDict)) {
            this.trainSimStep(timestep, train);
        }

        for (const [stationId, station] of Object.entries(this.stationDict)) {
            this.stationSimStepTerminate(timestep, station);
        }

        this.sysTime += timestep
	}
}
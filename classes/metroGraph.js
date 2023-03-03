/** Class representing a metro system */
class MetroGraph {
	
	/** Creates a Metro Graph
	 * @param {String} name - Name of the Metro System
	 * @param {Map} stations - Stores all the station, initialized as an empty Map (key: id, value: Station)
	 * */
	constructor(name) {
		this.name = name;
		this.stations = {};
		// this.trainController = trainController; //KIV not sure how to implement the trainController rn
		this.trains = {};
		this.edges = [];
		this.undirectedEdges = [];
		this.stationCodeMap = {};
		this.metroPaths = {};
		this.metroLineColours = {};
		this.trainCount = 0;
		this.commuterPaths = {};

		/**
		* Stats to track
		* - all time passengers
		* - number that have completed their journeys
		* - currentActive should be allTimeTotal - completedJourneys
		* - when people get spawned, we increment currentActive and allTimeTotal
		* - then when people exit the system, we decrement currentActive and increment completed Journeys
		*/
		this.commuterData = {
			"allTimeTotal": 0,
			"completedJourneys": 0,
			"currentActive": 0
		};
		this.completedJourneys = 0;
		this.data = {}
	}

	/** Add Station to the Metro System
	 * @param {integer} stationId - unique id of the Station
	 * @param {Station} station - Station object to store in the map
	 * */
	addStation(stationId, station) {
		this.stations[stationId] = station;

		//helps map the station code to the station
		for (var idx=0; idx < station.codes.length; idx++) {
			this.stationCodeMap[station.codes[idx]] = stationId;
		}
	}

	/** Add Train to the Metro System
	 * @param {integer} trainId - unique id of the Train
	 * @param {Train} train - train object to store in the map
	 * */
	addTrain(trainId, train) {
		this.trains[trainId] = train;
	}

	// Intiializes a train at every station going in both forward and backward directions
	initTrainAllStations() {
		// for every metro path
		for (const [pathCodeTotal, path] of Object.entries(this.metroPaths)) {

			//split it into the pathCode and the direction
			var pathCode = pathCodeTotal.substring(0, pathCodeTotal.length - 2);
			var direction = pathCodeTotal.substring(pathCodeTotal.length - 2, pathCodeTotal.length);

			// for every item in a path
			for (var idx=0;idx < path.length; idx++) {

				// if it is not a station, continue
				if (!(path[idx] instanceof Station)) {
					continue;
				}

				// if it is the last station in the list, do not create a train there
				if (idx == path.length - 1) {
					continue;
				}

				// otherwise create a train and increment the train count
				this.trains[this.trainCount] = new Train(this.trainCount, pathCode, idx, path[idx], direction);
				this.trainCount++;
			}
		}
	}

	// Implements Floyd Warshall All-Pairs Shortest Path 
	// used to compute the shortest distance between each station
	// Runs in O(n^3) time
	//Taken from a senior (https://github.com/mickey1356/sim_project/blob/master/src/map.js)
	floydWarshall() {
		const N = Object.keys(this.stations).length;
	    this.dist = [];
	    this.next = [];
	    let i = 0;

	    for (i = 0; i < N; i++) {
			let tDist = [];
			let tNext = [];
			for (let j = 0; j < N; j++) {
				tDist.push(Infinity);
				tNext.push(null);
			}
			this.dist.push(tDist);
			this.next.push(tNext);
	    }

	    for (i = 0; i < N; i++) {
			for (const [neighbourId, edge] of Object.entries(this.stations[i].neighbours)) {
				for (let j = 0; j < N; j++) {
					if (this.stations[j] === edge.tail) {
						this.dist[i][j] = edge.weight;
						this.next[i][j] = j;
						break;
					}
				}
			}
	    }

	    for (i = 0; i < N; i++) {
			this.dist[i][i] = 0;
			this.next[i][i] = i;
	    }

	    for (let k = 0; k < N; k++) {
			for (i = 0; i < N; i++) {
				for (let j = 0; j < N; j++) {
					if (this.dist[i][j] > this.dist[i][k] + this.dist[k][j]) {
						this.dist[i][j] = this.dist[i][k] + this.dist[k][j];
						this.next[i][j] = this.next[i][k];
					}
				}
			}
	    }
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

		let path = [this.stations[u]];
		while (u != v) {
			u = this.next[u][v];
			path.push(this.stations[u]);
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
		var currentCode = path[0].pathCodes;
		//initialize with previous to know where to board
		var interchanges = [[path[0]]];

		// add all the interchanges
		
		// for each item in path
		for (var i = 0; i <path.length; i++) {
			
			//check if there is any similarity in the pathCodes thus far
			var commonCode = this.intersectSets(currentCode, path[i].pathCodes);

			//if there is no common code, the Commuter needed 
			//to interchange at the previous station.
			if (commonCode.size == 0) {
				//get the code that the Commuter needs to interchange at	
				var code = currentCode.entries().next().value[1]

				//add the corresponding path code to interchanges
				interchanges[interchanges.length - 1].push(code + this.getDirection(code, path[i-2], path[i-1]))

				//update the current code
				currentCode = path[i].pathCodes;
				
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
		const N = Object.keys(this.stations).length;

		for (let i = 0; i < N; i++) {
			for (let j = i + 1; j < N; j++) {
				var path = this.getPathToStation(i, j)

				//get both the forward path and backward path between stations
				this.commuterPaths[i.toString() + "_" + j.toString()] = this.convertToCommuterPath(path);
				//simply reverse the order of stations to get the reverse order to travel
				this.commuterPaths[j.toString() + "_" + i.toString()] = this.convertToCommuterPath(path.reverse());
			}
		}

        console.log("all paths found");
	}

	// function to update the progress of the simulation
	update() {
		
		// temporary update object to track all the station updates
		var stationUpdate = {
			"spawned": 0,
			"completedJourneys": 0
		}

		// for each train, update the trains to move to next time step
		for (const [trainId, train] of Object.entries(this.trains)) {
			//moves the trains
			train.update(this.metroPaths);
		}

		//for each station, update the station to move to next time step
		for (const [stationId, station] of Object.entries(this.stations)) {
			var updateData = station.update(Object.keys(this.stations).length, this.commuterPaths)

			// update the overall stationUpdate
			for (const [key, value] of Object.entries(stationUpdate)) {
				stationUpdate[key] += updateData[key];
			}
		}

		// update all the corresponding commuterData
		this.commuterData['allTimeTotal'] += stationUpdate['spawned']
		this.commuterData['completedJourneys'] += stationUpdate['completedJourneys']
		this.commuterData['currentActive'] = this.commuterData['currentActive'] + stationUpdate['spawned'] - stationUpdate['completedJourneys']
	}

	// returns the min and max value of the allTimeTotal commuterData
	// from the undirectedEdges
	// @return {Array} [min, max] values
	getUndirectedEdgeStats() {
		var min = Number.MAX_SAFE_INTEGER;
		var max = Number.MIN_SAFE_INTEGER;

		for (var i = 0; i < this.undirectedEdges.length; i++) {
			max = Math.max(max, this.undirectedEdges[i].commuterData.allTimeTotal)
			min = Math.min(min, this.undirectedEdges[i].commuterData.allTimeTotal)
		}

		return [min, max]
	}
}

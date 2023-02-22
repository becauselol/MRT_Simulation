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
		this.stationCodeMap = {};
		this.metroPaths = {};
		this.metroLineColours = {};
		this.trainCount = 0;
		this.commuterPaths = {};
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

	initTrainAllStations() {
		for (const [pathCodeTotal, path] of Object.entries(this.metroPaths)) {

			var pathCode = pathCodeTotal.substring(0, pathCodeTotal.length - 2);
			var direction = pathCodeTotal.substring(pathCodeTotal.length - 2, pathCodeTotal.length);

			for (var idx=0;idx < path.length; idx++) {
				if (!(path[idx] instanceof Station)) {
					continue;
				}

				if (idx == path.length - 1) {
					continue;
				}
				this.trains[this.trainCount] = new Train(this.trainCount, pathCode, idx, path[idx], direction);
				this.trainCount++;
			}
		}
	}

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

	intersectSets(a, b) {
        const c = new Set;
        a.forEach(v => b.has(v) && c.add(v));
        return c;
    }

    //https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
    //check if x is in y
    hasSet(ys, xs) {
    	return [...xs].every((x) => ys.has(x));
	}

	getDirection(pathCode, startStation, targetStation) {
		if (this.metroPaths[pathCode + "FW"].indexOf(startStation) < this.metroPaths[pathCode + "FW"].indexOf(targetStation)) {
			return "FW"
		} else {
			return "BW"
		}
	}

	convertToCommuterPath(path) {
		//stores the pathCodes that the commuter needs to take
		var pathCodes = [];
		var possiblePathCodes = new Set();
		for (var i=0; i < path.length; i++) {
			//if there are no paths it is considering
			// add all the possible codes it should take
			if (possiblePathCodes.size == 1 ) {
				if (possiblePathCodes.entries().next().value[1] != pathCodes[pathCodes.length - 1]) {
					pathCodes.push(possiblePathCodes.entries().next().value[1]);
				}
				possiblePathCodes.clear();
			} else if (possiblePathCodes.size == 0) {
				for (const pathCode of path[i].pathCodes) {
					possiblePathCodes.add(pathCode);
				}
			} else {
				//it is currently considering some path
				//take intersection with the new station
				possiblePathCodes = this.intersectSets(possiblePathCodes, path[i].pathCodes);
			}
		}
		console.log(possiblePathCodes);
		if (possiblePathCodes.size > 0) {
			pathCodes.push(possiblePathCodes.entries().next().value[1]);
		}
		console.log(pathCodes);
		//interchanges[idx] is stored in the format [station, pathCode]
		//station means which station the commuter should board the train
		//pathCode is the pathCode that the commuter should board the train
		var commuterPath = [[path[0], pathCodes[0] + this.getDirection(pathCodes[0], path[0], path[1])]];
		var interchanges = [];
		var j = 1;
		for (var i=1; i < pathCodes.length; i++) {
			interchanges = [];
			var check = new Set([pathCodes[i], pathCodes[i-1]])
			while (j < path.length && !this.hasSet(path[j].pathCodes, check)) {
				j++;
			}
			var details = [];
			details.push(path[j]);
			details.push(pathCodes[i] + this.getDirection(pathCodes[i], path[j], path[j+1]));

			commuterPath.push(details);
		}

		commuterPath.push([path[path.length - 1], pathCodes[pathCodes.length - 1]]);

		return commuterPath;
	}

	// //get all path pairs and store them as commuterPaths
	getAllPathPairs() {
		const N = Object.keys(this.stations).length;

		for (let i = 0; i < N; i++) {
	        for (let j = i + 1; j < N; j++) {
	        	console.log(i, j)
				var path = this.getPathToStation(i, j)

				this.commuterPaths[i.toString() + "_" + j.toString()] = this.convertToCommuterPath(path);
				this.commuterPaths[j.toString() + "_" + i.toString()] = this.convertToCommuterPath(path.reverse());
			}
        }

        console.log("all paths found");
	}

	update() {
		for (const [trainId, train] of Object.entries(this.trains)) {
			train.update(this.metroPaths);
		}

		// for (const [stationId, station] of Object.entries(this.stations)) {
		// 	station.update()
		// }
	}
}
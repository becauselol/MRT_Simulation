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

		// stores weights
		this.edgeDict = {};

		this.metroPaths = {};
		this.metroLineStartStation = {};
		this.metroLineColours = {};
		
		this.commuterGraph = new CommuterGraph()
		this.commuterInterchangeWaitTime = {};
		this.interchangePaths = {}
	}

	addStation(station) {
		//add it to stationDict
		this.stationDict[station.id] = station

		for (const [line, lineDict] of Object.entries(station.lines)) {
			for (const [direction, edgeDetails] of Object.entries(lineDict)) {
				var neighbourId = station.getNeighbourId(line, direction)
				var weight = station.getNeighbourWeight(line, direction)
				if (this.edgeDict[station.id] === undefined) {
					this.edgeDict[station.id] = {}
				}
				if (this.edgeDict[station.id][neighbourId] === undefined) {
					this.edgeDict[station.id][neighbourId] = {}
				}
				this.edgeDict[station.id][neighbourId][line] = weight
			}
		}
	}

	getEdgeWeight(line, stationId, nextId) {
		return this.edgeDict[stationId][nextId][line]
	}

	constructCommuterGraph() {
		// create all the interchange nodes and nodes in general
		for (const [stationId, station] of Object.entries(this.stationDict)) {
			// for each pathcode create a "station"
			station.pathCodes.forEach(element => {
				var nodeId = `${stationId}.${element}`
				this.commuterGraph.nodeDict[nodeId] = new CommuterNode(stationId, nodeId, element)
			})
			
			// create edge weights for each possible combination of interchanges
			for (const i of station.pathCodes) {
  				for (const j of station.pathCodes) {
  					if (i == j) {
  						continue
  					}
  					var iId = `${stationId}.${i}`
  					var jId = `${stationId}.${j}`

  					var time = this.commuterInterchangeWaitTime[`${iId}_${jId}`];
  					if (time === undefined) {
  						time = 0.1;
  					}
  					if (this.commuterGraph.edgeDict[iId] === undefined) {
  						this.commuterGraph.edgeDict[iId] = {}
  					}
  					this.commuterGraph.edgeDict[iId][jId] = time

  				}
			}
		}

		// now we need to add the weights to those CommuterNodes
		for (const [i, jDict] of Object.entries(this.edgeDict)) {
			for (const [j, lineDict] of Object.entries(jDict)) {
				for (const [line, weight] of Object.entries(lineDict)) {
					if (this.commuterGraph.edgeDict[`${i}.${line}`] === undefined) {
						this.commuterGraph.edgeDict[`${i}.${line}`] = {}
					}
					this.commuterGraph.edgeDict[`${i}.${line}`][`${j}.${line}`] = weight + this.stationDict[i].waitTime
				}
			}
		}
	}

	getDirection(pathCode, startStation, targetStation) {
		if (this.metroPaths[pathCode]["FW"].indexOf(startStation) < this.metroPaths[pathCode]["FW"].indexOf(targetStation)) {
			return "FW"
		} else {
			return "BW"
		}
	}

	// construct the instructions for the commuters
	constructInterchangePaths() {
		if (Object.keys(this.commuterGraph.commuterPaths) == 0) {
			this.commuterGraph.floydWarshall()
			this.commuterGraph.getAllPathPairs();
		}

		for (const [i, stationI] of Object.entries(this.stationDict)) {
			this.interchangePaths[i] = {}
			for (const [j, stationJ] of Object.entries(this.stationDict)) {
				if (i == j) {
					continue;
				}
				this.interchangePaths[i][j] = []

				// take the fastest one amongst all the possible pathCode combis
				// create edge weights for each possible combination of interchanges
				var min_time = Infinity
				var chosen_start_line = null
				var chosen_target_line = null

				for (const iCode of stationI.pathCodes) {
	  				for (const jCode of stationJ.pathCodes) {
	  					var timeTaken = this.commuterGraph.dist[`${i}.${iCode}`][`${j}.${jCode}`]

	  					if (timeTaken < min_time) {
	  						min_time = timeTaken
	  						chosen_start_line = iCode;
	  						chosen_target_line = jCode;
	  					}
	  				}
				}
				if (min_time == Infinity) {
					console.log("no path?")
					continue;
				}

				var chosen_paths = this.commuterGraph.commuterPaths[`${i}.${chosen_start_line}`][`${j}.${chosen_target_line}`]
				var interchangePaths = []
				for (const path of chosen_paths) {
					var direction = this.getDirection(chosen_start_line, i, path[1].split(".")[0])

					var pathDetails = {"board": [`${chosen_start_line}_${direction}`], "alight": []}

					for (var p = 1; p < path.length; p++) {
						var prev = path[p - 1];
						var next = path[p];

						var prevDetails = prev.split(".")
						var nextDetails = next.split(".")
						if (prevDetails[1] != nextDetails[1]) {
							pathDetails["alight"].push(prevDetails[0])

							direction = this.getDirection(chosen_start_line, nextDetails[0], path[p+1].split(".")[0])
							pathDetails["board"].push(`${nextDetails[1]}_${direction}`)
						}
					}

					pathDetails["alight"].push(j)
					this.interchangePaths[i][j].push(pathDetails)
				}
			}
		}
	}

	// construct the path
	getPathsFromStartStation() {
		for (const [lineCode, stationId] of Object.entries(this.metroLineStartStation)) {
			if (this.metroPaths[lineCode] === undefined) {
				this.metroPaths[lineCode] = {};
			}
			this.metroPaths[lineCode]["FW"] = [];

			var forwardPath = this.metroPaths[lineCode]["FW"]

			var curr = this.stationDict[stationId]

            var nextId = curr.getNeighbourId(lineCode, "FW")
            var next = this.stationDict[nextId]
            
            // utilizes the linked list concept to draw the lines
            while (next !== undefined) {
                forwardPath.push(curr.id)
                curr = next;
                nextId = curr.getNeighbourId(lineCode, "FW")
                next = this.stationDict[nextId]
            }
            forwardPath.push(curr.id)

            this.metroPaths[lineCode]["BW"] = [];

			var backwardPath = this.metroPaths[lineCode]["BW"]

            var nextId = curr.getNeighbourId(lineCode, "BW")
            var next = this.stationDict[nextId]

            // utilizes the linked list concept to draw the lines
            while (next !== undefined) {
                backwardPath.push(curr.id)
                curr = next;
                nextId = curr.getNeighbourId(lineCode, "BW")
                next = this.stationDict[nextId]
            }
            backwardPath.push(curr.id)
    	}
	}

	trainSimStep(timestep, train) {
		switch (train.state) {
			// if it is moving
			case TrainState.MOVING:
				// console.log("moving")
				// get edge weight
				var weight = this.getEdgeWeight(train.pathCode, train.prevId, train.nextId)

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

					// Check if we need to change direction
					var currStation = this.stationDict[train.prevId]
					var nextStationId = currStation.getNeighbourId(train.pathCode, train.direction)

					if (nextStationId === undefined) {
						train.direction = (train.direction == "FW") ? "BW" : "FW"
					}
				}
				break;

			case TrainState.ALIGHTING:

				// console.log("alighting")
				// increment the timestamp of waiting (lambda)
				train.lambda += timestep

				// we need to alight all commuters on the train and 
				// move them to the station it has reached
				// board the passengers
				var currStation = this.stationDict[train.prevId]
				var alightingPassengers = train.commuters[train.prevId]

				//update target of commuters
				//check who needs to be boarded
				if (alightingPassengers === undefined) {
					train.state = TrainState.BOARDING
					return;
				}

				while (alightingPassengers.length > 0) {
					// get the target location to alight
					var currCommuter = alightingPassengers[0];
					if (currStation.id == currCommuter.target) {
						currStation.commuters["terminating"].push(currCommuter)
						alightingPassengers.splice(0, 1)
						continue;
					}
					// again we add some randomness by letting them choose the shortest path to board at
					var path_options = this.interchangePaths[train.prevId][currCommuter.target]
					var path_choice = path_options[Math.floor(Math.random() * path_options.length)]

					var boardingTarget = path_choice.board[0]

					if (currStation.commuters[boardingTarget] === undefined) {
						currStation.commuters[boardingTarget] = []
					}
					currStation.commuters[boardingTarget].push(currCommuter)
					alightingPassengers.splice(0, 1)
				}


				// the train is now waiting
				train.state = TrainState.BOARDING
				break;

			case TrainState.BOARDING:
				train.lambda += timestep

				// board the passengers
				var currStation = this.stationDict[train.prevId]
				var boardingPassengers = currStation.commuters[`${train.pathCode}_${train.direction}`]
				// var boardingCommuters = this.commuters.filter(x => x.pathCode == this.trains[idx].pathCode)
				//update target of commuters
				//check who needs to be boarded
				if (boardingPassengers === undefined) {
					train.state = TrainState.WAITING
					return;
				}
				while (train.getCommuterCount() <= train.capacity && boardingPassengers.length > 0) {
					// get the target location to alight
					var currCommuter = boardingPassengers[0];

					// again we add some randomness by letting them choose the shortest path to alight at
					var path_options = this.interchangePaths[train.prevId][currCommuter.target]
					var path_choice = path_options[Math.floor(Math.random() * path_options.length)]

					var alightTarget = path_choice.alight[0]

					if (train.commuters[alightTarget] === undefined) {
						train.commuters[alightTarget] = []
					}
					train.commuters[alightTarget].push(currCommuter)
					boardingPassengers.splice(0, 1)
				}

				train.state = TrainState.WAITING
				break;

			case TrainState.WAITING:
				// console.log("waiting")
				train.lambda += timestep

				var currStation = this.stationDict[train.prevId]
				if (train.lambda >= currStation.waitTime) {
					// console.log("switch to boarding")
					train.state = TrainState.MOVING;
					train.lambda = 0

					// get the next place to move to
					var currStation = this.stationDict[train.prevId]
					var nextStationId = currStation.getNeighbourId(train.pathCode, train.direction)

					if (nextStationId === undefined) {
						train.direction = (train.direction == "FW") ? "BW" : "FW"
						nextStationId = currStation.getNeighbourId(train.pathCode, train.direction)
					}

					var nextStation = this.stationDict[nextStationId]

					train.nextId = nextStationId
					train.next = nextStation.coords
					train.getCoords()
				}
				break;
		}
	}

	stationSimStepSpawn(timestep, station) {
		station.spawnTime += timestep;

		if (station.spawnTime >= station.spawnFreq) {
			// pick a random station
			var options = Object.keys(this.stationDict)
			var choice = options[Math.floor(Math.random() * options.length)]

			if (choice == station.id) {
				station.spawnTime = 0;
				return;
			}

			var comm = new Commuter(
					choice,
					this.sysTime
				)

			var path_options = this.interchangePaths[station.id][choice]
			var path_choice = path_options[Math.floor(Math.random() * path_options.length)]

			var board = path_choice.board[0]
			// the board/alight
			if (station.commuters[board] === undefined) {
				station.commuters[board] = []
			}
			station.commuters[board].push(comm)
			station.spawnTime = 0;
		}
	}

	stationSimStepTerminate(timestep, station) {
		station.termTime += timestep;

		if (station.termTime >= station.termFreq) {
			for (const [key, value] of Object.entries(station.commuters)) {
				if (value.length > 0) {
					value.pop()
					station.termTime = 0;
					return;
				}
			}

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
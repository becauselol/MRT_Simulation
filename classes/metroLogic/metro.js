class Metro {
	constructor(name) {
		this.init(name)
	}

	init(name) {
		this.sysTime = 0;
		this.hour = 0;
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
				var chosen_lines = []

				for (const iCode of stationI.pathCodes) {
	  				for (const jCode of stationJ.pathCodes) {
	  					var timeTaken = this.commuterGraph.dist[`${i}.${iCode}`][`${j}.${jCode}`]

	  					if (timeTaken < min_time) {
	  						min_time = timeTaken
	  						chosen_lines = [[iCode, jCode]]
	  					} else if (timeTaken == min_time) {
	  						chosen_lines.push([iCode, jCode])
	  					}

	  				}
				}
				if (min_time == Infinity) {
					console.debug("no path?")
					continue;
				}

				var chosen_paths = {}
				for (const pairs of chosen_lines) {
					chosen_paths[`${pairs[0]}.${pairs[1]}`] = this.commuterGraph.commuterPaths[`${i}.${pairs[0]}`][`${j}.${pairs[1]}`]
				}
				// console.debug(chosen_paths)

				for (const [key, possible_paths] of Object.entries(chosen_paths)) {
					var chosenLineCodes = key.split(".")

					for (const path of possible_paths) {
						var direction = this.getDirection(chosenLineCodes[0], i, path[1].split(".")[0])

						var board = `${chosenLineCodes[0]}_${direction}`
						var alight = undefined

						for (var p = 1; p < path.length; p++) {
							var prev = path[p - 1];
							var next = path[p];

							var prevDetails = prev.split(".")
							var nextDetails = next.split(".")
							if (p < path.length - 1 && prevDetails[1] != nextDetails[1]) {
								alight = prevDetails[0]
								break
							}
						}
						if (alight === undefined) {
							alight = j
						}

						if (!(board in this.interchangePaths[i][j])) {
							this.interchangePaths[i][j][board] = []
						}
						// if (!this.interchangePaths[i][j][board].includes(alight)) {
						// 	this.interchangePaths[i][j][board].push(alight)
						// }
						this.interchangePaths[i][j][board].push(alight)
					}
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

	getLineDuration(lineCode) {
		var stationId = this.metroLineStartStation[lineCode]
		var curr = this.stationDict[stationId]

        var nextId = curr.getNeighbourId(lineCode, "FW")
        var next = this.stationDict[nextId]
        
        var duration = 0
        // utilizes the linked list concept to draw the lines
        while (next !== undefined) {
        	duration += curr.waitTime
        	duration += curr.getNeighbourWeight(lineCode, "FW")

            curr = next;
            nextId = curr.getNeighbourId(lineCode, "FW")
            next = this.stationDict[nextId]
        }

        // complete the full cycle
        duration = duration * 2

       	return duration
	}

	placeTrainAtStart(lineCode, capacity) {
		this.trainCount++
		var stationId = this.metroLineStartStation[lineCode]
		var trainId = "train" + this.trainCount
		this.trainDict[trainId] = new Train(trainId, 
			lineCode, 
			this.stationDict[stationId].coords, 
			stationId,
			capacity)
	}

	stationCommCountUpdate(station, event) {
		return new StationCommuterCount(
				station.id,
				this.sysTime,
				event,
				station.getCommuterCount()
			)
	}

	trainCommCountUpdate(train, event) {
		return new TrainCommuterCount(
				train.prevId,
				this.sysTime,
				event,
				train.getCommuterCount()
			)
	}

	trainMoveStep(timestep, train) {
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

		return {}
	}

	trainAlightStep(timestep, train) {
		
		// increment the timestamp of waiting (lambda)
		train.lambda += timestep

		var train_count = this.trainCommCountUpdate(train, "pre_alight")

		// we need to alight all commuters on the train and 
		// move them to the station it has reached
		// board the passengers
		var currStation = this.stationDict[train.prevId]

		if (!(train.prevId in train.commuters)) {
			train.commuters[train.prevId] = []
			train.state = TrainState.BOARDING
			return {};
		}

		var alightingPassengers = train.commuters[train.prevId]

		//update target of commuters
		//check who needs to be boarded

		var alight_count = alightingPassengers.length

		for (const currCommuter of alightingPassengers) {
			// get the target location to alight
			currCommuter.arrivalTime = this.sysTime;

			if (currStation.id == currCommuter.target) {
				currStation.commuters["terminating"].push(currCommuter)
				continue;
			}

			if (currStation.commuters["transit"] === undefined) {
				currStation.commuters["transit"] = []
			}
			currStation.commuters["transit"].push(currCommuter)
		}

		train.commuters[train.prevId] = []
		// if (alight_count > 0) {
		// 	console.debug("time " + this.sysTime.toFixed(2) + ": " + train.id + " alighting " + alight_count + " passengers at station " + currStation.name)
		// }
		
		// the train is now waiting
		train.state = TrainState.BOARDING

		var station_count = this.stationCommCountUpdate(currStation, "post_alight")

		return {
			"train_count": train_count,
			"station_count": station_count,
			"alight_count": alight_count,
			"csv_train_count": train_count.count
		}
	}

	trainBoardStep(timestep, train) {
		train.lambda += timestep

		var train_count = this.trainCommCountUpdate(train, "pre_board")

		// board the passengers
		var currStation = this.stationDict[train.prevId]
		var boardingPassengers = currStation.commuters["transit"]
		var trainDirection = `${train.pathCode}_${train.direction}`
		//update target of commuters
		//check who needs to be boarded

		var waitTimeUpdate = new WaitTimeUpdate(currStation.id, train.pathCode, train.direction)

		var numberOnTrain = train.getCommuterCount()

		var boardIndexes = []

		for (const [index, commuter] of boardingPassengers.entries()) {
			if (numberOnTrain > train.capacity) {
				console.debug(`seems like train is full on ${trainDirection}`)
				break;
			}

			if (!Object.keys(this.interchangePaths[currStation.id][commuter.target]).includes(trainDirection)) {
				continue;
			}

			boardIndexes.push(index)

			numberOnTrain++;
		}
		// console.debug(trainDirection)
		boardIndexes.reverse()

		var board_count = boardIndexes.length;
		//board commuters accordingly (last to first) cos array problems
		for (const idx of boardIndexes) {
			//get the commuter
			var commuter = boardingPassengers.splice(idx, 1)[0]

			// again we add some randomness by letting them choose the shortest path to alight at
			var path_options = this.interchangePaths[train.prevId][commuter.target][trainDirection]

			var alightTarget = path_options[Math.floor(Math.random() * path_options.length)]

			waitTimeUpdate.addUpdate(parseFloat((this.sysTime - commuter.arrivalTime).toFixed(1)))

			if (!(alightTarget in train.commuters)) {
				train.commuters[alightTarget] = []
			}
			//board the commuter
			train.commuters[alightTarget].push(commuter);
		}

		train.state = TrainState.WAITING
		// console.debug("time " + this.sysTime.toFixed(2) + ": " + train.id + " boarding " + board_count + " passengers at station " + currStation.name)
		var station_count = this.stationCommCountUpdate(currStation, "post_board")

		return {
			"train_count": train_count,
			"station_count": station_count,
			"wait_time": waitTimeUpdate,
			"board_count": board_count
		}
	}

	trainWaitStep(timestep, train) {
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

			var nextStation = this.stationDict[nextStationId]

			train.nextId = nextStationId
			train.next = nextStation.coords
			train.getCoords()
		}

		return {}
	}

	trainSimStep(timestep, train) {
		var update = {}
		switch (train.state) {
			// if it is moving
			case TrainState.MOVING:
				update = this.trainMoveStep(timestep, train)
				break;

			case TrainState.ALIGHTING:
				update = this.trainAlightStep(timestep, train)
				break;

			case TrainState.BOARDING:
				update = this.trainBoardStep(timestep, train)
				break;

			case TrainState.WAITING:
				update = this.trainWaitStep(timestep, train)
				break;
		}

		return update
	}

	stationSimStepSpawn(timestep, station) {

		// var pre_count = this.stationCommCountUpdate(station, "pre_spawn")
		// console.debug(station.id, this.hour)
		// console.debug(`spawning for ${station.id}`)
		if (!(this.hour in station.spawnRate)) {
			return {}
		}
		var count = 0
		// console.debug(`actually spawning for ${station.id}`)
		for (const [destId, rate] of Object.entries(station.spawnRate[this.hour])) {
			if (!(destId in station.nextSpawn)) {
				station.nextSpawn[destId] = this.sysTime - timestep + randomExponential(rate)
			}
			while (this.sysTime > station.nextSpawn[destId]) {
				var comm = new Commuter(
					station.id,
					destId,
					parseFloat(station.nextSpawn[destId].toFixed(2))
				)

				// the board/alight
				if (station.commuters["transit"] === undefined) {
					station.commuters["transit"] = []
				}
				station.commuters["transit"].push(comm)

				station.nextSpawn[destId] += randomExponential(rate)

				count++
			}
		}
		// if (count > 0) {
		// 	console.debug(`time ${this.sysTime.toFixed(2)}: spawning ${count} passengers at ${station.name}`)
		// }
		
		var count_update = this.stationCommCountUpdate(station, "post_spawn")
		return {
			"station_count": count_update,
			"tap_in": count
		}
	}

	stationSimStepTerminate(timestep, station) {
		if (station.commuters["terminating"].length == 0) {
			return {}
		}

		var count = station.commuters["terminating"].length
		// console.debug("time " + this.sysTime.toFixed(2) + ": terminating "+ station.commuters["terminating"].length +" commuters at " + station.name)
		
		var travelTimeUpdate = new TravelTimeUpdate(station.id)
		for (const commuter of station.commuters["terminating"]) {
			var originId = commuter.origin
			var timeTaken = Math.round(this.sysTime - commuter.spawnTime)
			travelTimeUpdate.addUpdate(originId, timeTaken)
		}

		// terminate all the commuters
		station.commuters["terminating"] = []

		var count_update = this.stationCommCountUpdate(station, "post_terminate")

		return {
			"station_count": count_update,
			"travel_time": travelTimeUpdate,
			"tap_out": count
		}
	}

	onlyTrainSimStep(timestep) {
		for (const [trainId, train] of Object.entries(this.trainDict)) {
            this.trainSimStep(timestep, train);
        }
        this.sysTime += timestep
	}

	simStep(timestep, dataStore, csvDataStore){
		// console.groupCollapsed("timestep: " + this.sysTime)
		for (const [stationId, station] of Object.entries(this.stationDict)) {
            var update = this.stationSimStepSpawn(timestep, station);
            dataStore.update(update)

            //update csv data
            if (update !== undefined && update['tap_in'] !== undefined) {
            	csvDataStore.updateTapIn(this.hour, stationId, update["tap_in"])
            }
            
        }

        for (const [trainId, train] of Object.entries(this.trainDict)) {
            var update = this.trainSimStep(timestep, train);
            dataStore.update(update)
            csvDataStore.update(this.hour, update, train.prevId, train.pathCode, train.direction)
        }

        for (const [stationId, station] of Object.entries(this.stationDict)) {
            var update = this.stationSimStepTerminate(timestep, station);
            dataStore.update(update)

            //update csv data
            if (update !== undefined && update['tap_out'] !== undefined) {
            	csvDataStore.updateTapOut(this.hour, stationId, update["tap_out"])
            }

            csvDataStore.updateStationCount(this.hour, stationId, station.getCommuterCount())
        }
        		// if we go into the new hour
		if (Math.floor(this.sysTime/60) < Math.floor((this.sysTime + timestep)/60)) {
			this.hour += 1
			for (const [stationId, station] of Object.entries(this.stationDict)) {
				station.nextSpawn = {}
			}
		}
        // console.groupEnd("timestep: " + this.sysTime)
        this.sysTime += timestep
        // this.sysTime = this.sysTime.toFixed(2)
        return 
	}
}
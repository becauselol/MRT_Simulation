// class that represents the whole metro system
class Metro {
	// initializer of metro
	constructor(name) {
		this.init(name)
	}

	// initializes the metro with the necessary parameters
	init(name) {
		// system level parameters
		this.sysTime = 0;
		this.hour = 0;
		this.name = name;

		//stations storage
		this.stationCount = 0;
		this.stationDict = {} //storage of station objects

		//train storage
		this.trainCount = 0;
		this.trainDict = {}; //storage of train objects

		// stores weights
		this.edgeDict = {}; //provides easy access to all the edge weights

		//
		this.metroPaths = {}; //stores the paths of various lines
		this.metroLineStartStation = {}; //stores the start station of each line
		this.metroLineColours = {}; //stores the colours to draw each line
		
		this.commuterGraph = new CommuterGraph() //commuter graph for commuter path finding

		//commuter wait times at each station, 
		// values can be set to change commuter movement behaviour
		this.commuterInterchangeWaitTime = {}; 
		//paths that commuters will take, tells them which location to interchange at
		this.interchangePaths = {} 
	}


	/*
	* UTILITY FUNCTIONS
	*/
	// function to add a station to the metro system
	// assumes each station to already have neighbours declared
	addStation(station) {
		//add it to stationDict
		this.stationDict[station.id] = station

		// add the relevant edge information
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

	// retrieves edge weight
	getEdgeWeight(line, stationId, nextId) {
		return this.edgeDict[stationId][nextId][line]
	}

	// constructs a commuter graph to create commuter paths
	constructCommuterGraph() {
		// create all the nodes of the commuter graph
		for (const [stationId, station] of Object.entries(this.stationDict)) {

			// for each metro line passing at the station create a node
			station.pathCodes.forEach(element => {
				// we append it with .code to identify each line passing through the station as its own node
				var nodeId = `${stationId}.${element}`
				this.commuterGraph.nodeDict[nodeId] = new CommuterNode(stationId, nodeId, element)
			})
			
			// create edge weights for each possible combination of interchanges
			// this creates a "travel time" when interchanging at a station
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

	// gets the direction of whether the movement between stations is "FW" (forwards) or "BW" (backwards)
	// with respect to the metro line path
	getDirection(pathCode, startStation, targetStation) {
		if (this.metroPaths[pathCode]["FW"].indexOf(startStation) < this.metroPaths[pathCode]["FW"].indexOf(targetStation)) {
			return "FW"
		} else {
			return "BW"
		}
	}

	// construct the instructions for the commuters
	constructInterchangePaths() {
		// if the commuterpath is not initialized, we initialize it by running
		// floyd warshall and get all path pairs
		if (Object.keys(this.commuterGraph.commuterPaths) == 0) {
			this.commuterGraph.floydWarshall()
			this.commuterGraph.getAllPathPairs();
		}

		// for every pair of stations
		for (const [i, stationI] of Object.entries(this.stationDict)) {
			this.interchangePaths[i] = {}
			for (const [j, stationJ] of Object.entries(this.stationDict)) {
				// if it is to itself, we ignore the path creation
				if (i == j) {
					continue;
				}
				this.interchangePaths[i][j] = []

				// take the fastest one amongst all the possible pathCode combinations 
				// (e.g. ewl to dtl or nsl to dtl? for a path from raffles place to bugis)
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

				// if there is no path continue
				// should not occur
				if (min_time == Infinity) {
					console.debug("no path?")
					continue;
				}

				// based on the chosen paths, we store them temporarily to work with
				var chosen_paths = {}
				for (const pairs of chosen_lines) {
					chosen_paths[`${pairs[0]}.${pairs[1]}`] = this.commuterGraph.commuterPaths[`${i}.${pairs[0]}`][`${j}.${pairs[1]}`]
				}
				// console.debug(chosen_paths)

				// based on each pair of lines possible
				for (const [key, possible_paths] of Object.entries(chosen_paths)) {
					// we find the chosen line codes
					var chosenLineCodes = key.split(".")

					// based on each possible paths
					for (const path of possible_paths) {

						var direction = this.getDirection(chosenLineCodes[0], i, path[1].split(".")[0])

						// we retrieve the initial line code and direction to board
						var board = `${chosenLineCodes[0]}_${direction}`

						// but we don't know where to alight
						var alight = undefined

						// we check for any changes in the linecode in our path
						for (var p = 1; p < path.length; p++) {
							var prev = path[p - 1];
							var next = path[p];

							var prevDetails = prev.split(".")
							var nextDetails = next.split(".")

							// if it exist, then that is where a commuter needs to alight
							if (p < path.length - 1 && prevDetails[1] != nextDetails[1]) {
								alight = prevDetails[0]
								break
							}
						}

						// if alight is still not defined that means there is no need to interchange
						// the alight target is simply the destination
						if (alight === undefined) {
							alight = j
						}

						if (!(board in this.interchangePaths[i][j])) {
							this.interchangePaths[i][j][board] = []
						}
						
						// add the corresponding alight location based on what we need to board
						this.interchangePaths[i][j][board].push(alight)
					}
				}
			}
		}
	}

	// construct the paths
	getPathsFromStartStation() {

		// for each line we find the metroPaths
		for (const [lineCode, stationId] of Object.entries(this.metroLineStartStation)) {
			if (this.metroPaths[lineCode] === undefined) {
				this.metroPaths[lineCode] = {};
			}
			// we first construct the "FW" (forwards) paths
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

            // we then construct the "BW" (backwards) paths
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

	// A function to calculate how long it takes to travel one whole loop along any single MRT line
	getLineDuration(lineCode) {

		// similar to getPathsFromStartStation()
		// uses a traversal of the stations like a linked list
		// to retrieve and accumulate the travel time
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

        var nextId = curr.getNeighbourId(lineCode, "BW")
        var next = this.stationDict[nextId]
        while (next !== undefined) {
        	duration += curr.waitTime
        	duration += curr.getNeighbourWeight(lineCode, "BW")

            curr = next;
            nextId = curr.getNeighbourId(lineCode, "BW")
            next = this.stationDict[nextId]
        }

       	return duration
	}

	// retrieves the station commuter count and
	// determines the maximum and minimum number of commuters across all stations
	getStationCountMinMax(mode = "transit") {
		var min = Number.MAX_SAFE_INTEGER;
		var max = Number.MIN_SAFE_INTEGER;

		for (const [stationId, station] of Object.entries(this.stationDict)) {
			if (mode == "total") {
				max = Math.max(max, station.commuters["terminating"].length + station.commuters["transit"].length)
				min = Math.min(min, station.commuters["terminating"].length + station.commuters["transit"].length)
			} else {
				max = Math.max(max, station.commuters[mode].length)
				min = Math.min(min, station.commuters[mode].length)
			}
		}
			
		// returns an array of minimum and maximum
		return [min, max]
	}

	// this function simply places a single train at the specified start station
	placeTrainAtStart(lineCode, capacity) {
		// increments the train count to keep track
		this.trainCount++

		// retrieves the target station to start at
		var stationId = this.metroLineStartStation[lineCode]

		// construct the id
		var trainId = "train" + this.trainCount

		// add the train to trainDict
		this.trainDict[trainId] = new Train(trainId, 
			lineCode, 
			this.stationDict[stationId].coords, 
			stationId,
			capacity)
	}

	// function to easily update the station commuter count
	stationCommCountUpdate(station, event) {
		return new StationCommuterCount(
				station.id,
				this.sysTime,
				event,
				station.getCommuterCount()
			)
	}

	// function to easily update the train commuter count
	trainCommCountUpdate(train, event) {
		return new TrainCommuterCount(
				train.prevId,
				this.sysTime,
				event,
				train.getCommuterCount()
			)
	}

	/*
	* SIMULATION RELATED FUNCTIONS
	*/
	/*TRAIN RELATED*/
	// the simulation step for a train to move betweens stations
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

	// the simulation step for a train to allow people to alight at a station
	trainAlightStep(timestep, train) {
		
		// increment the timestamp of waiting (lambda)
		train.lambda += timestep

		// count the people on the train before alighting
		var train_count = this.trainCommCountUpdate(train, "pre_alight")

		// we need to alight all commuters on the train and 
		// move them to the station it has reached
		var currStation = this.stationDict[train.prevId]

		if (!(train.prevId in train.commuters)) {
			train.commuters[train.prevId] = []
			train.state = TrainState.WAITING
			return {};
		}

		var alightingPassengers = train.commuters[train.prevId]

		var alight_count = alightingPassengers.length

		// check who needs to terminate or who is transiting
		// among all passengers alighting
		for (const currCommuter of alightingPassengers) {
			// get the target location to alight
			currCommuter.arrivalTime = this.sysTime;

			// if they have reached their target, add them to terminating
			if (currStation.id == currCommuter.target) {
				currStation.commuters["terminating"].push(currCommuter)
				continue;
			}

			if (currStation.commuters["transit"] === undefined) {
				currStation.commuters["transit"] = []
			}
			// otherwise they are transiting
			currStation.commuters["transit"].push(currCommuter)
		}

		// remove the people who have alighted from the train
		train.commuters[train.prevId] = []
		
		// the train is now waiting
		train.state = TrainState.WAITING

		// count number of people on train
		var station_count = this.stationCommCountUpdate(currStation, "post_alight")

		// return the necessary updates
		return {
			"train_count": train_count,
			"station_count": station_count,
			"alight_count": alight_count,
			"csv_train_count": train_count.count
		}
	}

	// the simulation step for a train to allow people to board a train
	trainBoardStep(timestep, train) {
		train.lambda += timestep

		// count number of people on train
		var train_count = this.trainCommCountUpdate(train, "pre_board")

		// board the passengers
		var currStation = this.stationDict[train.prevId]
		var boardingPassengers = currStation.commuters["transit"]
		var trainDirection = `${train.pathCode}_${train.direction}`
		
		// initialize a wait time update
		var waitTimeUpdate = new WaitTimeUpdate(currStation.id, train.pathCode, train.direction)

		var numberOnTrain = train.getCommuterCount()

		// stores the indexes of the commuters who need to board
		var boardIndexes = []

		//update target of commuters
		//check who needs to be boarded
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

		var board_count = boardIndexes.length;
		boardIndexes.reverse()
		//board commuters accordingly (last to first) cos array problems
		for (const idx of boardIndexes) {
			//get the commuter
			var commuter = boardingPassengers.splice(idx, 1)[0]

			// again we add some randomness by letting them choose the shortest path to alight at
			var path_options = this.interchangePaths[train.prevId][commuter.target][trainDirection]

			var alightTarget = path_options[Math.floor(Math.random() * path_options.length)]

			// update the time that they spent waiting into the waitTimeUpdate
			waitTimeUpdate.addUpdate(parseFloat((this.sysTime - commuter.arrivalTime).toFixed(1)))

			if (!(alightTarget in train.commuters)) {
				train.commuters[alightTarget] = []
			}
			//board the commuter
			train.commuters[alightTarget].push(commuter);
		}

		// change the trains tate to moving
		train.state = TrainState.MOVING
		
		var station_count = this.stationCommCountUpdate(currStation, "post_board")

		// return the necessary updates
		return {
			"train_count": train_count,
			"station_count": station_count,
			"wait_time": waitTimeUpdate,
			"board_count": board_count
		}
	}

	// the simulation step for a train that is waiting
	trainWaitStep(timestep, train) {
		// increment the lambda
		train.lambda += timestep

		var currStation = this.stationDict[train.prevId]
		// if the train is about to leave
		if (train.lambda >= currStation.waitTime - timestep) {
			// change state to boarding
			train.state = TrainState.BOARDING;

			// set lambda to 0 in preparation for moving
			train.lambda = 0

			// get the next place to move to
			var currStation = this.stationDict[train.prevId]
			var nextStationId = currStation.getNeighbourId(train.pathCode, train.direction)

			var nextStation = this.stationDict[nextStationId]

			// set the coords of place to go towards
			train.nextId = nextStationId
			train.next = nextStation.coords
			train.getCoords()
		}

		// no updates to return
		return {}
	}

	// simulation step for the train
	trainSimStep(timestep, train) {
		var update = {}

		// depending on the state, we do the corresponding step
		switch (train.state) {
			// if it is moving
			case TrainState.MOVING:
				update = this.trainMoveStep(timestep, train)
				break;

			case TrainState.ALIGHTING:
				update = this.trainAlightStep(timestep, train)
				break;

			case TrainState.WAITING:
				update = this.trainWaitStep(timestep, train)
				break;
			
			case TrainState.BOARDING:
				update = this.trainBoardStep(timestep, train)
				break;
		}

		// return the update
		return update
	}

	/*STATION RELATEDs*/
	// simulation step to spawn people
	stationSimStepSpawn(timestep, station) {

		// keep count of total number of people spawning
		var count = 0

		// stores all the spawning customers
		var spawnedCommuters = []

		// for each possible destination, we spawn the commuters
		for (const [destId, rates] of Object.entries(station.spawnRate)) {

			// we spawn depending on the predefined rate of arrival
			var rate = rates[this.hour]
			if (rate == 0) {
				continue
			}

			// find out how many spawn at that station
			var numberToSpawn = randomPoisson(rate*timestep)
			count = count + numberToSpawn

			// add the required number of commuters
			for (var i = 0; i < numberToSpawn; i++) {
				var comm = new Commuter(
					station.id,
					destId,
					this.sysTime
				)
				spawnedCommuters.push(comm)
			}
		}

		// shuffle the spawned customers for real life reprentation
		shuffle(spawnedCommuters)

		// add them to the transit array
		station.commuters["transit"].push(...spawnedCommuters)
		
		// count number of people at a station
		var count_update = this.stationCommCountUpdate(station, "post_spawn")

		// return the updates
		return {
			"station_count": count_update,
			"tap_in": count
		}
	}

	// simulation step to terminate people
	stationSimStepTerminate(timestep, station) {
		// if there is no one, just return
		if (station.commuters["terminating"].length == 0) {
			return {}
		}

		// count number of people terinating
		var count = station.commuters["terminating"].length
		
		// update the travel times of each commuter
		var travelTimeUpdate = new TravelTimeUpdate(station.id)
		for (const commuter of station.commuters["terminating"]) {
			var originId = commuter.origin
			var timeTaken = Math.round(this.sysTime - commuter.spawnTime)
			travelTimeUpdate.addUpdate(originId, timeTaken)
		}

		// terminate all the commuters
		station.commuters["terminating"] = []

		// count number of people at a station
		var count_update = this.stationCommCountUpdate(station, "post_terminate")

		// return the necessary updates
		return {
			"station_count": count_update,
			"travel_time": travelTimeUpdate,
			"tap_out": count
		}
	}

	// simulate only movement of trains without any station updates
	// function is to help place the trains onto the lines
	onlyTrainSimStep(timestep) {
		for (const [trainId, train] of Object.entries(this.trainDict)) {
            this.trainSimStep(timestep, train);
        }
        this.sysTime += timestep
	}

	// an overall simulation step
	// main driver of the simulation
	simStep(timestep, dataStore, csvDataStore){

		// first we spawn all the commuters in the timestep and have them enter the system
		for (const [stationId, station] of Object.entries(this.stationDict)) {
            var update = this.stationSimStepSpawn(timestep, station);

            // update the datastore
            dataStore.update(update)

            //update csv data
            if (update !== undefined && update['tap_in'] !== undefined) {
            	csvDataStore.updateTapIn(this.hour, stationId, update["tap_in"])
            }
            
        }

        // then we update the movements of all the trains and commuters
        for (const [trainId, train] of Object.entries(this.trainDict)) {
            var update = this.trainSimStep(timestep, train);

            // update the datastore
            dataStore.update(update)

            // update csv data
            csvDataStore.update(this.hour, update, train.prevId, train.pathCode, train.direction)
        }

        // we then terminate all the commuters that are leaving the system
        for (const [stationId, station] of Object.entries(this.stationDict)) {
            var update = this.stationSimStepTerminate(timestep, station);

            // update the datastore
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
		}

        this.sysTime += timestep
        return 
	}
}
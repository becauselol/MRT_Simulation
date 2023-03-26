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
		this.commuterGraph = new CommuterGraph()
		this.commuterInterchangeWaitTime = {};
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

	getPathsFromStartStation() {
		for (const [lineCode, stationId] of Object.entries(this.metroLineStartStation)) {
			if (this.metroPaths[lineCode] === undefined) {
				this.metroPaths[lineCode] = {};
			}
			this.metroPaths[lineCode]["FW"] = [];

			var forwardPath = this.metroPaths[lineCode]["FW"]

			var curr = this.stationDict[stationId]
			console.log(curr)
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
				var nextStationId = currStation.getNeighbourId(train.pathCode, train.direction)

				if (nextStationId === undefined) {
					train.direction = (train.direction == "FW") ? "BW" : "FW"
					nextStationId = currStation.getNeighbourId(train.pathCode, train.direction)
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
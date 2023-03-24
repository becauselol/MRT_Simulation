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

	trainSimStep(timestep, train) {
		switch (train.state) {
			// if it is moving
			case TrainState.MOVING:
				console.log("moving")
				// get edge weight
				var weight = this.edgeDict[`${train.prevId}_${train.nextId}`]

				// update lambda
				train.lambda += timestep / weight // need to scale by weight

				train.getCoords()

				// if lambda > 1 train has reached
				if (train.lambda >= 1) {
					console.log("switch to alighting")
					train.state = TrainState.ALIGHTING
					train.lambda = 0;

					// update the coordinates to show it is ON the station
					train.prev = train.next;
					train.prevId = train.nextId;
				}
				break;

			case TrainState.ALIGHTING:
				console.log("alighting")
				// increment the timestamp of waiting (lambda)
				train.lambda += timestep

				// we need to alight all commuters on the train and 
				// move them to the station it has reached



				// the train is now waiting
				train.state = TrainState.WAITING
				break;

			case TrainState.WAITING:
				console.log("waiting")
				train.lambda += timestep

				var currStation = this.stationDict[train.prevId]
				if (train.lambda >= currStation.waitTime) {
					console.log("switch to boarding")
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

	simStep(timestep){
		// for (const [stationId, station] of Object.entries(metroGraph.stationDict)) {
        //     this.stationSimStepSpawn(station);
        // }

        for (const [trainId, train] of Object.entries(this.trainDict)) {
            this.trainSimStep(timestep, train);
        }

        // for (const [stationId, station] of Object.entries(metroGraph.stationDict)) {
        //     this.stationSimStepTerminate(station);
        // }
	}
}
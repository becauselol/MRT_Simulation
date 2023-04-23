// a few classes created to help with easy updating of station/train commuter count

// each class comprises of 
// the time of event, 
// the type of event 
// and the count at that time and event
class StationCommuterCount {
	constructor(stationId, time, event, count) {
		this.stationId = stationId;
		this.time = time;
		this.event = event;
		this.count = count;
	}
}

class TrainCommuterCount {
	constructor(stationId, time, event, count) {
		this.stationId = stationId;
		this.time = time;
		this.event = event;
		this.count = count;
	}
}

// dataframe to store all the datapoints of train commuter counts
class TrainCommDF {
	constructor(stationId) {
		this.stationId = stationId
		this.time = []
		this.event = []
		this.count = []
	}

	// method to add data from the trainCommCount object
	addData(trainCommCount) {
		this.time.push(trainCommCount.time)
		this.event.push(trainCommCount.event)
		this.count.push(trainCommCount.count)
	}
}

// dataframe to store all the datapoints of station commuter counts
class StationCommDF {
	constructor(stationId) {
		this.stationId = stationId
		this.time = []
		this.event = []
		this.count = []
	}

	// method to add data from the stationCommCount object
	addData(stationCommCount) {
		this.time.push(stationCommCount.time)
		this.event.push(stationCommCount.event)
		this.count.push(stationCommCount.count)
	}
}

// structure to store the wait time updates of a specific
// station, line and direction
class WaitTimeUpdate {
	constructor(stationId, lineCode, direction) {
		this.stationId = stationId;
		this.lineCode = lineCode
		this.direction = direction
		this.update = []
	}

	// method to add to the update
	addUpdate(value) {
		this.update.push(value)
	}
}

// class to store the travel time updates from an origin to a target
class TravelTimeUpdate {
	constructor(targetId) {
		this.targetId = targetId;
		this.update = {}
	}

	// method to add to the update
	addUpdate(originId, value) {
		if (!(originId in this.update)) {
			this.update[originId] = []
		}
		this.update[originId].push(value)
	}
}

// DataStore class to store all the data from one simulation run of the system
class DataStore {
	constructor() {
		// the various statistics we want to keep track of
		this.waitTimes = {}
		this.travelTimes = {}
		this.stationCommuterCount = {}
		this.stationTrainCommuterCount = {}
		this.lineWaitTimes = {}
		this.lineStations = {}
		this.nameMap = {}
	}

	// initialization method that needs to be called to reset datastore
	init(metro) {
		this.waitTimes = {}
		this.travelTimes = {}
		this.stationCommuterCount = {}
		this.stationTrainCommuterCount = {}
		this.lineWaitTimes = {}
		this.lineStations = {}
		this.nameMap = {}
		
		var initTrainCount = new TrainCommuterCount(0, "init", 0)
		var initStationCount = new StationCommuterCount(0, "init", 0)

		console.debug("initializing data store")
		// intiializes all the data we need for each station
		for (const [stationId, station] of Object.entries(metro.stationDict)) {
			// stores the name to know how to map
			this.nameMap[stationId] = station.name

			// station commuter count
			this.stationCommuterCount[stationId] = new StationCommDF(stationId)
			this.stationCommuterCount[stationId].addData(initStationCount)

			// train commuter count as well
			this.stationTrainCommuterCount[stationId] = new TrainCommDF(stationId)
			this.stationTrainCommuterCount[stationId].addData(initTrainCount)

			// waitTimes and travel times storage data using StatCompact
			this.waitTimes[stationId] = {}
			this.travelTimes[stationId] = {}
			for (const targetId of Object.keys(metro.stationDict)) {
				if (stationId == targetId) {
					continue
				}
				this.travelTimes[stationId][targetId] = new StatCompact()
			}

			for (const line of Object.keys(station.lines)) {
				this.waitTimes[stationId][line] = new StatCompact()
			}
		}

		// and for each linecode and path we also have 
		// an overall StatCompact to keep track of wait times
		for (const [lineCode, paths] of Object.entries(metro.metroPaths)) {
			this.lineWaitTimes[lineCode] = new StatCompact()
			this.lineStations[lineCode] = [...paths["FW"]]
		}
	}

	// returns the lines that the datastore is using
	getLineCodeArray() {
		return Object.keys(this.lineStations)
	}

	// updates the train count based on the trainCommCount update
	updateTrainCount(trainCommCount) {
		var stationId = trainCommCount.stationId
		this.stationTrainCommuterCount[stationId].addData(trainCommCount)
	} 

	// updates the station count based on the stationCommCount update
	updateStationCount(stationCommCount) {
		var stationId = stationCommCount.stationId
		this.stationCommuterCount[stationId].addData(stationCommCount)
	}

	// updates the wait times based on the waitTimeUpdate
	updateWaitTime(waitTimeUpdate) {
		var stationId = waitTimeUpdate.stationId
		var lineCode = waitTimeUpdate.lineCode
		for (const value of waitTimeUpdate.update) {
			this.waitTimes[stationId][lineCode].addValue(value)
			this.lineWaitTimes[lineCode].addValue(value)
		}
	}

	// updates the travel times based on the travelTimeUpdate
	updateTravelTime(travelTimeUpdate) {
		var targetId = travelTimeUpdate.targetId
		for (const [originId, update] of Object.entries(travelTimeUpdate.update)) {
			for (const value of update) {
				this.travelTimes[originId][targetId].addValue(value)
			}
		}
	}

	// general update function
	update(update) {
		// if no updates return
		if (update === undefined || Object.keys(update).length == 0) {
			return;
		}

		// otherwise for each packet of update
		// we use the key to determine which statistic to update
		for (const [key, updatePacket] of Object.entries(update)) {
			switch (key) {
				case "train_count":
					this.updateTrainCount(updatePacket)
					break;
				case "station_count":
					this.updateStationCount(updatePacket)
					break;
				case "wait_time":
					this.updateWaitTime(updatePacket)
					break;
				case "travel_time":
					this.updateTravelTime(updatePacket)
					break;
			}
		}
	}
}

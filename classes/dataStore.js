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

// helps with plotting
class TrainCommDF {
	constructor(stationId) {
		this.stationId = stationId
		this.time = []
		this.event = []
		this.count = []
	}

	addData(trainCommCount) {
		this.time.push(trainCommCount.time)
		this.event.push(trainCommCount.event)
		this.count.push(trainCommCount.count)
	}
}

// helps with plotting
class StationCommDF {
	constructor(stationId) {
		this.stationId = stationId
		this.time = []
		this.event = []
		this.count = []
	}

	addData(stationCommCount) {
		this.time.push(stationCommCount.time)
		this.event.push(stationCommCount.event)
		this.count.push(stationCommCount.count)
	}
}

class WaitTimeUpdate {
	constructor(stationId) {
		this.stationId = stationId;
		this.update = []
	}

	addUpdate(value) {
		this.update.push(value)
	}
}

class TravelTimeUpdate {
	constructor(targetId) {
		this.targetId = targetId;
		this.update = {}
	}

	addUpdate(originId, value) {
		if (!(originId in this.update)) {
			this.update[originId] = []
		}
		this.update[originId].push(value)
	}
}

class DataStore {
	constructor() {
		this.waitTimes = {}
		this.travelTimes = {}
		this.stationCommuterCount = {}
		this.stationTrainCommuterCount = {}
	}

	init(metro) {
		console.debug("initializing data store")
		for (const stationId of Object.keys(metro.stationDict)) {
			this.stationCommuterCount[stationId] = new StationCommDF(stationId)
			this.stationTrainCommuterCount[stationId] = new TrainCommDF(stationId)
			this.waitTimes[stationId] = []
			this.travelTimes[stationId] = {}
			for (const targetId of Object.keys(metro.stationDict)) {
				if (stationId == targetId) {
					continue
				}
				this.travelTimes[stationId][targetId] = []
			}
		}
	}

	updateTrainCount(trainCommCount) {
		var stationId = trainCommCount.stationId
		this.stationTrainCommuterCount[stationId].addData(trainCommCount)
	} 

	updateStationCount(stationCommCount) {
		var stationId = stationCommCount.stationId
		this.stationCommuterCount[stationId].addData(stationCommCount)
	}

	updateWaitTime(waitTimeUpdate) {
		var stationId = waitTimeUpdate.stationId
		this.waitTimes[stationId].push(...waitTimeUpdate.update)
	}

	updateTravelTime(travelTimeUpdate) {
		var targetId = travelTimeUpdate.targetId
		for (const [originId, update] of Object.entries(travelTimeUpdate.update)) {
			this.travelTimes[originId][targetId].push(...update)
		}
	}

	update(update) {
		if (update === undefined || Object.keys(update).length == 0) {
			return;
		}
		for (const [key, value] of Object.entries(update)) {
			switch (key) {
				case "train_count":
					this.updateTrainCount(value)
					break;
				case "station_count":
					this.updateStationCount(value)
					break;
				case "wait_time":
					this.updateWaitTime(value)
					break;
				case "travel_time":
					this.updateTravelTime(value)
					break;
			}
		}
	}
}

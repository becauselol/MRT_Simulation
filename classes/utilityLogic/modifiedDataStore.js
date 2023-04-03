// when I say statistics i refer to: total, count, mean, sdev, min, max, median, q1, q3

// data we want to store
// station
// hour 
// tap in (total of people who spawn)
// tap out (total of people who terminate)
// alight statistics (taken when people alight)
// board statistics (taken when people board)
// waitTime statistics (taken based on when people board)
// stationCount statistics (taken over a per timestep basis)
// trainCount statistics (taken over a per timestep basis)

// travel data
// station
// destination
// hour
// travel time statistics

class StationDataStore {
	constructor() {
		this.tapIn = 0
		this.tapOut = 0
		this.alightCount = new StatCompact()
		this.boardCount = new StatCompact()
		this.waitTime = new StatCompact()
		this.stationCount = new StatCompact()
	}
}

class TrainDataStore {
	constructor() {
		this.alightCount = new StatCompact()
		this.boardCount = new StatCompact()
		this.waitTime = new StatCompact()
		this.trainCount = new StatCompact()
	}
}

class CSVDataStore {
	constructor(stationDict, min_hour, max_hour) {
		this.data = {}
		this.trainData = {}

		for (var hr = min_hour; hr < max_hour + 1; hr++) {
			this.data[hr] = {}
			this.trainData[hr] = {}

			for (const [stationId, station] of Object.entries(stationDict)) {
				this.data[hr][stationId] = new StationDataStore()

				this.trainData[hr][stationId] = {}
				for (const [line, dirDict] of Object.entries(station.lines)) {
					this.trainData[hr][stationId][line] = {}
					for (const direction of Object.keys(dirDict)) {
						this.trainData[hr][stationId][line][direction] = new TrainDataStore
					}
				}
			}
		}	
	}

	updateTapIn(hour, stationId, count) {
		this.data[hour][stationId].tapIn += count;
	}

	updateTapOut(hour, stationId, count) {
		this.data[hour][stationId].tapOut += count;
	}

	updateAlightCount(hour, stationId, count, line, direction) {
		this.data[hour][stationId].alightCount.addValue(count)
		this.trainData[hour][stationId][line][direction].alightCount.addValue(count)
	}

	updateBoardCount(hour, stationId, count, line, direction) {
		this.data[hour][stationId].boardCount.addValue(count)
		this.trainData[hour][stationId][line][direction].boardCount.addValue(count)
	}

	updateWaitTime(hour, waitTimeUpdate) {
		var stationId = waitTimeUpdate.stationId
		var line = waitTimeUpdate.lineCode
		var direction = waitTimeUpdate.direction
		for (const value of waitTimeUpdate.update) {
			this.data[hour][stationId].waitTime.addValue(value)
			this.trainData[hour][stationId][line][direction].waitTime.addValue(value)
		}
	}

	updateTrainCount(hour, stationId, count, line, direction) {
		this.trainData[hour][stationId][line][direction].trainCount.addValue(count)
	}

	updateStationCount(hour, stationId, count) {
		this.data[hour][stationId].stationCount.addValue(count)
	}

	update(hour, update, stationId, line, direction) {
		if (update === undefined || Object.keys(update).length == 0) {
			return;
		}
		for (const [key, value] of Object.entries(update)) {
			switch (key) {
				case "alight_count":
					this.updateAlightCount(hour, stationId, value, line, direction)
					break;
				case "board_count":
					this.updateBoardCount(hour, stationId, value, line, direction)
					break;
				case "csv_train_count":
					this.updateTrainCount(hour, stationId, value, line, direction)
					break;
				case "wait_time":
					this.updateWaitTime(hour, value)
					break;
			}
		}
	}


}
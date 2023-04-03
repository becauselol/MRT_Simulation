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
		this.alightCount = StatCompact()
		this.boardCount = StatCompact()
		this.waitTime = StatCompact()
		this.stationCount = StatCompact()
	}
}

class TrainDataStore {
	constructor() {
		this.alightCount = StatCompact()
		this.boardCount = StatCompact()
		this.waitTime = StatCompact()
		this.trainCount = StatCompact()
	}
}

class OverallDataStore {
	constructor(stationDict, min_hour, max_hour) {
		this.data = {}
		this.trainData = {}

		for (var hr = min_hour; hr < max_hour + 1; hr++) {
			this.data[hr] = {}
			this.trainData[hr] = {}

			for (const [stationId, station] of Object.entries(stationDict)) {
				this.data[hr][stationId] = new StationDataStore()

				this.trainData[hr][stationId] = {}

			}
		}	
	}

	updateTapIn(hour, stationId, count) {
		this.data[hour][stationId].tapIn += count;
	}

	updateTapOut(hour, stationId, count) {
		this.data[hour][stationId].tapOut += count;
	}


}
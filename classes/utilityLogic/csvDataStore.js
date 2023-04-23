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

// stores the essential data we need for analysis for each station
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

// stores the essential data we need for analysis for each train
class TrainDataStore {
	constructor() {
		this.alightCount = new StatCompact()
		this.boardCount = new StatCompact()
		this.waitTime = new StatCompact()
		this.trainCount = new StatCompact()
	}
}

// CSVDataStore class for the data that is to be written to csvs
class CSVDataStore {
	constructor() {}

	// initializes the CSVDataStore based on the requirements
	init(stationDict, min_hour, max_hour) {
		this.data = {}
		this.trainData = {}
		this.nameMap = {}

		// for every hour the simulation is active
		for (var hr = min_hour; hr < max_hour; hr++) {
			this.data[hr] = {}
			this.trainData[hr] = {}

			// we store data for each train
			for (const [stationId, station] of Object.entries(stationDict)) {
				this.data[hr][stationId] = new StationDataStore()
				this.nameMap[stationId] = station.name
				this.trainData[hr][stationId] = {}

				// as well as for each type of train passing through that station
				for (const [line, dirDict] of Object.entries(station.lines)) {
					this.trainData[hr][stationId][line] = {}
					for (const direction of Object.keys(dirDict)) {
						this.trainData[hr][stationId][line][direction] = new TrainDataStore
					}
				}
			}
		}
	}

	// updates tap in count at a station for that hour
	updateTapIn(hour, stationId, count) {
		this.data[hour][stationId].tapIn += count;
	}

	// updates tap out count at a station for that hour
	updateTapOut(hour, stationId, count) {
		this.data[hour][stationId].tapOut += count;
	}

	// updates alight count at a station for a specific type of train for that hour
	updateAlightCount(hour, stationId, count, line, direction) {
		this.data[hour][stationId].alightCount.addValue(count)
		this.trainData[hour][stationId][line][direction].alightCount.addValue(count)
	}

	// updates board count at a station for a specific type of train for that hour
	updateBoardCount(hour, stationId, count, line, direction) {
		this.data[hour][stationId].boardCount.addValue(count)
		this.trainData[hour][stationId][line][direction].boardCount.addValue(count)
	}

	// updates wait time at a station for that hour
	updateWaitTime(hour, waitTimeUpdate) {
		var stationId = waitTimeUpdate.stationId
		var line = waitTimeUpdate.lineCode
		var direction = waitTimeUpdate.direction
		for (const value of waitTimeUpdate.update) {
			// updates the overall station
			this.data[hour][stationId].waitTime.addValue(value)
			// as well as for each type of train
			this.trainData[hour][stationId][line][direction].waitTime.addValue(value)
		}
	}

	// updates the train count statistics
	updateTrainCount(hour, stationId, count, line, direction) {
		this.trainData[hour][stationId][line][direction].trainCount.addValue(count)
	}

	// updates the station count statistics
	updateStationCount(hour, stationId, count) {
		this.data[hour][stationId].stationCount.addValue(count)
	}

	// general update function
	update(hour, update, stationId, line, direction) {
		// if no updates return
		if (update === undefined || Object.keys(update).length == 0) {
			return;
		}

		// otherwise depending on the update packet
		// call the corresponding function to update the statistic
		for (const [key, updatePacket] of Object.entries(update)) {
			switch (key) {
				case "alight_count":
					this.updateAlightCount(hour, stationId, updatePacket, line, direction)
					break;
				case "board_count":
					this.updateBoardCount(hour, stationId, updatePacket, line, direction)
					break;
				case "csv_train_count":
					this.updateTrainCount(hour, stationId, updatePacket, line, direction)
					break;
				case "wait_time":
					this.updateWaitTime(hour, updatePacket)
					break;
			}
		}
	}

	// writes the station data CSV
	writeStationCSVString(verbose=false) {
		var headers = ["hour", "stationName", "tapIn", "tapOut"]
		if (verbose) {
			var header_figures = ["mean", "sd", "min", "q1", "median", "q3", "max", "count", "total"]
		} else {
			var header_figures = ["mean", "sd", "count"]
		}
		
		var stats = ["alightCount", "boardCount", "waitTime", "stationCount"]
		for (const s of stats) {
			for (const f of header_figures) {
				headers.push(s + "_" + f)
			}
		}

		var lineData = [headers]
		for (const [hour, stationDict] of Object.entries(this.data)) {
			for (const [stationId, stationData] of Object.entries(stationDict)) {
				var row_data = [hour, this.nameMap[stationId], stationData.tapIn, stationData.tapOut]

				if (verbose) {
					row_data.push(...stationData.alightCount.getNineFigureArray())
					row_data.push(...stationData.boardCount.getNineFigureArray())
					row_data.push(...stationData.waitTime.getNineFigureArray())
					row_data.push(...stationData.stationCount.getNineFigureArray())
				} else {
					row_data.push(...stationData.alightCount.getMeanStdCountArray())
					row_data.push(...stationData.boardCount.getMeanStdCountArray())
					row_data.push(...stationData.waitTime.getMeanStdCountArray())
					row_data.push(...stationData.stationCount.getMeanStdCountArray())
				}

				
				lineData.push(row_data.join(","))
			}
			
		}

		return lineData.join("\n")
	}

	// writes the train data CSV
	writeTrainCSVString(verbose=false) {
		var headers = ["hour", "stationName", "line", "direction"]

		if (verbose) {
			var header_figures = ["mean", "sd", "min", "q1", "median", "q3", "max", "count", "total"]
		} else {
			var header_figures = ["mean", "sd", "count"]
		}

		var stats = ["alightCount", "boardCount", "waitTime", "trainCount"]
		for (const s of stats) {
			for (const f of header_figures) {
				headers.push(s + "_" + f)
			}
		}

		var lineData = [headers]
		for (const [hour, stationDict] of Object.entries(this.trainData)) {
			for (const [stationId, lineDict] of Object.entries(stationDict)) {
				for (const [line, directionDict] of Object.entries(lineDict)) {
					for (const [direction, trainData] of Object.entries(directionDict)) {
						var row_data = [hour, this.nameMap[stationId], line, direction]

						if (verbose) {
							row_data.push(...trainData.alightCount.getNineFigureArray())
							row_data.push(...trainData.boardCount.getNineFigureArray())
							row_data.push(...trainData.waitTime.getNineFigureArray())
							row_data.push(...trainData.trainCount.getNineFigureArray())
						} else {
							row_data.push(...trainData.alightCount.getMeanStdCountArray())
							row_data.push(...trainData.boardCount.getMeanStdCountArray())
							row_data.push(...trainData.waitTime.getMeanStdCountArray())
							row_data.push(...trainData.trainCount.getMeanStdCountArray())
						}
						lineData.push(row_data.join(","))
					}
				}
			}
			
		}

		return lineData.join("\n")
	}
}
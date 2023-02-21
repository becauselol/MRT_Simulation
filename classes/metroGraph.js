/** Class representing a metro system */
class MetroGraph {
	
	/** Creates a Metro Graph
	 * @param {String} name - Name of the Metro System
	 * @param {Map} stations - Stores all the station, initialized as an empty Map (key: id, value: Station)
	 * */
	constructor(name) {
		this.name = name;
		this.stations = {};
		// this.trainController = trainController; //KIV not sure how to implement the trainController rn
		this.trains = {};
		this.stationCodeMap = {};
		this.metroPaths = {};
		this.metroLineColours = {};
	}

	/** Add Station to the Metro System
	 * @param {integer} stationId - unique id of the Station
	 * @param {Station} station - Station object to store in the map
	 * */
	addStation(stationId, station) {
		this.stations[stationId] = station;

		//helps map the station code to the station
		for (var idx=0; idx < station.codes.length; idx++) {
			this.stationCodeMap[station.codes[idx]] = stationId;
		}
	}

	/** Add Train to the Metro System
	 * @param {integer} trainId - unique id of the Train
	 * @param {Train} train - train object to store in the map
	 * */
	addTrain(trainId, train) {
		this.trains[trainId] = train;
	}

	initTrainAllStations() {
		for (const [pathCode, path] of Object.entries(this.metroPaths)) {
			for (idx in path) {
				if (idx == 0 || idx == path.length - 1) {
					this.trains.push(new Train(idx, path, parseInt(idx)));
				} else {
					this.trains.push(new Train(idx, path, parseInt(idx), 1));
					this.trains.push(new Train(idx, path, parseInt(idx), -1))
				}

			}
			
		}
	}

	update() {
		for (const [trainId, train] of Object.entries(this.trains)) {
			train.update(this.metroPaths);
		}
	}
}
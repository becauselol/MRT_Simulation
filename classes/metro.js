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
		this.edgeDict = {};

		this.metroPaths = {};
		this.metroLineColours = {};
		
		this.commuterPaths = {};
	}

}
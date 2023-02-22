/** Class representing a Station. */
class Station {
	/**
     * Create a Station.
     * @param {number} id - unique id of the station
     * @param {number} x - latitude of the station
     * @param {number} y - longitude of the station
     * @param {string} name - the name of the station
     * @param {Array} codes - code name of the station to understand which line it is part of
     * @param {Map} neighbours - maps all the neighbours to the respective edge that connects them (key: id, value: Edge)
     * @param {Array} commuters - list of all commuters at the station
     * @param {number} waitTime - time trains should spend waiting at each station
     */
	constructor(id, x, y, name="", codes = [], waitTime=1) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.name = name;
		this.codes = codes;
		this.neighbours = {};
		this.commuters = [];
		this.waitTime = waitTime;
		this.pathCodes = new Set();
		this.trains = [];

		this.spawnNo = 1;
		this.spawnProb = 0.2;
	} 

	/** Add neighbour to the current station 
	* @param {number} neighbour_id - unique id of the neighbour
	* @param {Edge} edge - the edge connecting these two 
	*/
	addNeighbour(neighbourId, edge) {
		this.neighbours[neighbourId] = edge
	}

	spawnNewCommuters() {
		//code to spawn commuters
	}

	alightCommuters() {
		//checks if commuters have reached
		//transfers them from trains to stations
	}

	boardCommuters() {
		var boardingCommuters = this.commuters.filter(x => x.pathCode == this.trains[idx].pathCode)
		//update target of commuters

		//board commuters accordingly
	}

	removeReachedCommuters() {
		//check if commuters have reached end
		//commuters get removed from system
	}

	update() {
		this.spawnNewCommuters();


		for (var idx = 0; idx < this.trains.length; idx++) {
			//alight passengers
			this.alightCommuters();

			//board passengers
			this.boardCommuters();

			//handle passenger states
			//check for any who have reached
			this.removeReachedCommuters();
		}
	}
}
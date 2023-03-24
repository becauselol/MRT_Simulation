/** Class representing a Station. */
class Station {

	/**
	* Create a Station.
	* @param {String} id - unique id of the station
	* @param {Object} coords - (x,y) coordinates
	* @param {string} name - the name of the station
	* @param {Set} codes - code name of the station to understand which line it is part of
	* @param {Map} neighbours - (key: pathCode_direction, value: station_id)
	* @param {Array} commuters - list of all commuters at the station
	* @param {number} waitTime - time trains should spend waiting at each station
	* @param {Set} pathCodes - the pathCodes that the station services (basically the direction and lines trains go)
	* @param {number} spawnNo - the max number of Commuters that can be spawned
	* @param {float} spawnProb - the probability of spawning commuters in a single frame
	*/
	constructor(id, x, y, name="", codes = [], waitTime=1) {
		this.id = id;
		this.coords = {
			"x": x,
			"y": y
		}
		this.name = name;
		this.codes = codes;
		this.neighbours = {};
		this.commuters = [];
		this.waitTime = waitTime;
		this.pathCodes = new Set();

		// parameters that deal with the spawn rate of Commuters
		this.spawnNo = 1;
		this.spawnProb = 0.05;
	}

	/** Add neighbour to the current station 
	* @param {number} neighbour_id - unique id of the neighbour
	* @param {DirectedEdge} edge - the edge connecting these two 
	*/
	addNeighbour(line, direction, neighbourId) {
		this.neighbours[`${line}_${direction}`] = neighbourId
	}
}
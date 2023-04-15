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
	constructor(id, x, y, name="", codes = [], waitTime=0.42) {
		this.id = id;
		this.coords = {
			"x": x,
			"y": y
		}
		this.name = name;
		this.codes = codes;
		this.neighbours = {};
		this.lines = {};

		// commuters is an object of lists where key: lineCode_direction and value: list of commuters waiting for that train
		this.commuters = {"terminating": [], "transit": []};
		this.waitTime = waitTime;
		this.pathCodes = new Set();

		// parameters that deal with the spawn rate of Commuters
		this.spawnRate = {}
		this.nextSpawn = {}
	}

	/** Add neighbour to the current station 
	* @param {number} neighbour_id - unique id of the neighbour
	* @param {DirectedEdge} edge - the edge connecting these two 
	*/
	addNeighbour(line, direction, neighbourId, weight) {
		this.pathCodes.add(line)

		if (this.lines[line] === undefined) {
			this.lines[line] = {}
		}
		this.lines[line][direction] = {"id": neighbourId, "weight": weight}
		if (this.neighbours[neighbourId] === undefined) {
			this.neighbours[neighbourId] = [`${line}_${direction}`]
		} else {
			this.neighbours[neighbourId].push(`${line}_${direction}`)
		}

	}

	getNeighbourId(line, direction) {
		if (this.lines[line] === undefined) {
			return undefined
		}
		if (this.lines[line][direction] === undefined) {
			return undefined
		}
		return this.lines[line][direction].id
	}

	getNeighbourWeight(line, direction) {
		if (this.lines[line] === undefined) {
			return undefined
		}
		if (this.lines[line][direction] === undefined) {
			return undefined
		}
		return this.lines[line][direction].weight
	}

	getLineDirections(neighbourId) {
		return this.neighbours[neighbourId]
	}

	getCommuterCount() {
		var amount = 0
		for (const [station, arr] of Object.entries(this.commuters)) {
			amount += arr.length;
		}
		return amount
	}
}
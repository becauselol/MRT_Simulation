/** Class representing a Station. */
class Station {

	/**
	* Create a Station.
	* @param {String} id - unique id of the station
	* @param {Object} coords - (x,y) coordinates
	* @param {String} name - the name of the station
	* @param {Array} codes - code name of the station to understand which line it is part of
	* @param {Object} neighbours - (key: pathCode_direction, value: station_id)
	* @param {Object[Array]} commuters - list of all commuters at the station (terminating or transiting)
	* @param {number} waitTime - time trains should spend waiting at each station
	* @param {Set} pathCodes - the pathCodes that the station services (basically the direction and lines trains go)
	* @param {Object[Array]} spawnRate - the rate of spawning commuters from current station to 
	* 										(key: destination, value: array of rates based on the hour)
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

	// retrieves the id of a neighbour depending on the line and direction
	getNeighbourId(line, direction) {
		if (this.lines[line] === undefined) {
			return undefined
		}
		if (this.lines[line][direction] === undefined) {
			return undefined
		}
		return this.lines[line][direction].id
	}

	// retrieves the time taken to travel to a neighbour based on the line and direction
	getNeighbourWeight(line, direction) {
		if (this.lines[line] === undefined) {
			return undefined
		}
		if (this.lines[line][direction] === undefined) {
			return undefined
		}
		return this.lines[line][direction].weight
	}

	// figure out which direction a specific neighbour ID is at
	getLineDirections(neighbourId) {
		return this.neighbours[neighbourId]
	}

	// counts the number of commuters on a train
	getCommuterCount() {
		var amount = 0
		for (const [station, arr] of Object.entries(this.commuters)) {
			amount += arr.length;
		}
		return amount
	}
}
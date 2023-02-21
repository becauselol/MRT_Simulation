/** Class representing a Station. */
class Station {
	/**
     * Create a Station.
     * @param {number} id - unique id of the station
     * @param {number} start - the unique id of the starting station.
     * @param {number} target - the unique id of the next station to alight at.
     * @param {number} end - the unique id of the station wher the user journey ends
     * @param {Array} path - the path commuters will take. It only stores the locations where users need to change lines
     * @param {number} location - the unique id of the station/train that it is at 
     * @param {number} state - the state of the agent
     */
	constructor(id, x, y, name="", codes = []) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.name = name;
		this.code = codes;
		this.neighbours = {};
	} 

	addNeighbour(id, edge) {
		this.neighbours[id] = edge
	}
}
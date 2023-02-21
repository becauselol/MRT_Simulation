/* variable containing the various commuterStates */
const CommuterState = {
	"WAITING": 101, // moving to the target station
	"MOVING": 102, // waiting for the train
	"ALIGHTING": 103, //alighting at the current station
	"REACHED": 104, // reached the target station
}

/** Class representing a Commuter. */
class Commuter {
	 /**
     * Create a Commuter.
     * @param {number} id - unique id of the commuter
     * @param {number} start - the unique id of the starting station.
     * @param {number} target - the unique id of the next station to alight at.
     * @param {number} end - the unique id of the station wher the user journey ends
     * @param {Array} path - the path commuters will take. It only stores the locations where users need to change lines
     * @param {number} location - the unique id of the station/train that it is at 
     * @param {number} state - the state of the agent
     */
	constructor(id, start, path, state=CommuterState.WAITING) {
		this.id = id;
		this.start = start;
		this.target = path[1];
		this.end - path[-1];
		this.path = path;
		this.location = path[0]
		this.state = state;
	}

	/** 
	 * Moves Commuter to the next time step
	 */
	update() {

	}
}
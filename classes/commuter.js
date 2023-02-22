/* variable containing the various commuterStates */
const CommuterState = {
	"WAITING": 101, // waiting for the train (this is handled by station (can be interchange/just start journey))
	"MOVING": 102, // moving to the target station  (after waiting, go to moving, also by station)
	"ALIGHTING": 103, // alighting at the current station (once you reach a station, train flags them as alighting)
	"REACHED": 104, // reached the target station (if commuter is alighting, then we will toggle to reached by the station)
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
	constructor(id, path, state=CommuterState.WAITING) {
		this.id = id;
		this.path = path;
		this.state = state;
	}

	isThisMyTrain(pathCode) {
		return this.path[0][1] == pathCode;
	}

	updateTarget() {
		//after boarding
		//update target
		this.path.unshift(0);
	}

	hasReached(stationId) {
		//check if it reach some interchange
		return this.path[0][0].id == stationId;
	}

	hasReachedEnd() {
		//check if it reached the last item in path
		return this.path.length == 1;
	}
}
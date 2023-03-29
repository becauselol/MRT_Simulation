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
     * @param {Array} path - the path commuters will take. It only stores the locations where users need to change lines
     * 				path items are stored in the form [stationId, pathCode]
     * 				lets Commuters know which stationId to be at and which pathCode to take
     * @param {number} location - the unique id of the station/train that it is at 
     * @param {number} state - the state of the agent
     * @param {number} arrivalTime - the time the agent arrived at a certain station
     */
	constructor(path, spawnTime=0, state=CommuterState.WAITING) {
		this.path = path;
		this.state = state;
		this.arrivalTime = spawnTime;
		this.spawnTime = spawnTime;
	}

	/**
	 * Method for a commuter to check if they should board a train
	 * Commuters can only board a train if they are waiting
	 * @param {String} pathCode - a pathCode (e.g. 'cclFW') that tells a commuter which direction and line to board a train
	 * @returns {bool} whether the train is theirs or not
	 * */
	isThisMyTrain(pathCode) {
		if (this.state == CommuterState.WAITING) {
			return this.path[0][1] == pathCode;
		}
		return false;
	}

	/**
	 * Method to update the path of the user
	 * Removes the most recent target from this.path
	 * Doing so updates the users path to the next target
	 *
	 * Also sets this.state to MOVING
	 *
	 * updateTarget() is used when Commuters board a train
	 * */
	updateTarget() {
		//after boarding
		//update target
		this.path.shift();
		this.state = CommuterState.MOVING;
	}
	
	/**
	 * Method to alight a Commuter
	 * Simply sets their state to WAITING
	 * */
	alighted() {
		this.state = CommuterState.WAITING;
	}
	
	/**
	 * Check if a user has reached their desired station
	 * User can only reach a station if they are MOVING
	 * @param {number} stationId - the stationId that the train is currently at
	 * @returns {bool} whether the commuter has reached the desired station
	 * */
	hasReached(stationId) {
		//check if it reach some interchange
		// console.log(this.state);
		if (this.state == CommuterState.MOVING) {
			
			return this.path[0][0].id == stationId;
		}		
		return false
	}

	/**
	 * Checks if a Commuter has reached their final destination
	 * A Commuter has reached the end of their journey once they have only one target left on their path
	 * @returns {bool} whether the Commuter has completed their journey
	 * */
	hasReachedEnd() {
		//check if it reached the last item in path
		return this.path.length == 1;
	}
}

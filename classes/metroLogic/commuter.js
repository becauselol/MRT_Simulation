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
     * @param {String} target - target station id
     * @param {number} state - the state of the agent
     * @param {number} arrivalTime - the time the agent arrived at a certain station
     * @param {number} spawnTime - the time the agent arrived at a certain station
     */
	constructor(id, origin, target, spawnTime, state=CommuterState.WAITING) {
		this.id = id
		this.origin = origin
		this.target = target;
		this.state = state;
		this.arrivalTime = spawnTime;
		this.spawnTime = spawnTime;
		this.cumWaitingTime = 0;
	}

}
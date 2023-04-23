/** Class representing a Commuter. */
class Commuter {

	 /**
     * Create a Commuter.
     * @param {String} origin - origin station id
     * @param {String} target - target station id
     * @param {number} arrivalTime - the time the agent arrived at a certain station
     * @param {number} spawnTime - the time the agent arrived at a certain station
     */
	constructor(origin, target, spawnTime) {
		this.origin = origin
		this.target = target;
		this.arrivalTime = spawnTime;
		this.spawnTime = spawnTime;
	}

}
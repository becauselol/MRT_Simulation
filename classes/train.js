/* variable containing the various TrainStates */
const TrainState = {
	"WAITING": 101, // train is waiting for people to board
	"MOVING": 102, // train is moving from one place to the next
	"TERMINATED": 103, //train is to be removed from the system
	"REACHED": 104, // reached the target station
}


/** Class representing a Train. */
class Train {
	/**
     * Create a Train.
     * @param {number} id - unique id of the train
     * @param {Array} path - the path trains will take. Stores every station and edge that the station is required to stop at/travel along
     * @param {float} lambda - the current position that the train is at (0 or 1 if at stations) (0 < lambda < 1 if travelling)
     * @param {Edge/Station} currentLocation - if train not moving, it will be at a Station, if it is moving, then it is on an Edge
     * @param {number} state - the state of the agent
     * @param {number} capacity - the max number of commuters on a train
     * @param {Array} commuters - stores the commuters that are on a train
     */
	constructor(id, pathCode, currentLocation, direction='FW', state=TrainState.WAITING, capacity=300, lambda=0) {
		this.id = id;
		this.pathCode = pathCode;
		this.direction = direction;
		this.lambda = lambda;
		this.curLocation = currentLocation;
		this.state = state;
		this.capacity = capacity;
		this.commuters = [];
	}

	nextLocation(path) {
		
	}

	move() {
		this.lambda = this.lambda + 0.01
		this.x = this.lerp(this.initialX, this.target.x, this.lambda);
      	this.y = this.lerp(this.initialY, this.target.y, this.lambda);
	}

	lerp(a, b, alpha) {
		return a + alpha * ( b - a )
	}

	update() {

	}
}
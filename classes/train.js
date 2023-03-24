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
     * @param {String} id - unique id of the train
     * @param {String} pathCode - the path code of the train e.g. "ccl"
     * @param {String} direction - the direction the train will take "FW" or "BW"
     * @param {float} lambda - the current position that the train is at (0 or 1 if at stations) (0 < lambda < 1 if travelling)
     * @param {Object} prevId/nextId - Station id of previous and next stations
     * @param {Object} prev/next - Object of x and y values of the previous and next location (if prev == next then not moving)
     * @param {number} state - the state of the agent
     * @param {number} capacity - the max number of commuters on a train
     * @param {Array} commuters - stores the commuters that are on a train
     */
	constructor(id, pathCode, prev, prevId, next=null, nextId=null, direction='FW', state=TrainState.WAITING, capacity=300, lambda=0) {
		this.id = id;

		// stuff that handles the line and direction
		this.pathCode = pathCode;
		this.direction = direction;

		this.prevId = prevId
		if (nextId === null) {
			this.nextId = prevId;
		} else {
			this.nextId = nextId
		}
		
		// stuff that handles coordinates
		this.lambda = lambda;
		this.prev = prev;
		if (next === null) {
			this.next = prev;
		} else {
			this.next = next
		}
		this.getCoords();

		// state
		this.state = state;

		//commuter related
		this.capacity = capacity;
		this.commuters = [];
	}

	lerp(a, b, alpha) {
		return a + alpha * ( b - a )
	}

	getCoords() {
		this.x = this.lerp(this.prev.x, this.next.x, this.lambda);
  		this.y = this.lerp(this.prev.y, this.next.y, this.lambda);
	}

	hasReached() {
		return (this.lambda >= 1);
	}
}
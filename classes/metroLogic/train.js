/* variable containing the various TrainStates */
const TrainState = {
	"WAITING": 201, // train is waiting for people to board
	"MOVING": 202, // train is moving from one place to the next
	"ALIGHTING": 203, //train is to be removed from the system
	"BOARDING": 204, // reached the target station
}


/** Class representing a Train. */
class Train {

	/**
     * Create a Train.
     * @param {String} id - unique id of the train
     * @param {String} pathCode - the path code of the train e.g. "ccl"
     * @param {String} direction - the direction the train will take "FW" or "BW"
     * @param {float} lambda - the current position that the train is at (0 or 1 if at stations) (0 < lambda < 1 if travelling)
     * 							- represents the time spent at a station (if at a station)
     * @param {Object} prevId/nextId - Station id of previous and next stations
     * @param {Object} prev/next - Object of x and y values of the previous and next location (if prev == next then not moving)
     * @param {number} state - the state of the agent
     * @param {number} capacity - the max number of commuters on a train
     * @param {Object[Array]} commuters - stores the commuters that are on a train
     * 									- (key: station that commuters alight at, value: array of commuters alighting at a station)
     */
	constructor(id, pathCode, prev, prevId, capacity, next=null, nextId=null, direction='FW', state=TrainState.WAITING, lambda=0) {
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
		this.coords = {"x":0, "y":0}
		this.getCoords();

		// state
		this.state = state;

		//commuter related
		this.capacity = capacity;

		// commuters is an object of lists where 
		// key: station that they are alighting at and 
		// value: list of commuters waiting for that train
		this.commuters = {};
	}

	// linear interpolation to get the coordinate of the train to draw
	lerp(a, b, alpha) {
		return a + alpha * ( b - a )
	}

	// returns the (x, y) coordinate of the train with reference to the map
	getCoords() {
		this.coords.x = this.lerp(this.prev.x, this.next.x, this.lambda);
  		this.coords.y = this.lerp(this.prev.y, this.next.y, this.lambda);
	}

	// check if a train has reached its destination
	hasReached() {
		return (this.lambda >= 1);
	}

	// counts the number of people on a train
	getCommuterCount() {
		var amount = 0
		for (const [station, arr] of Object.entries(this.commuters)) {
			amount += arr.length;
		}
		return amount
	}
}
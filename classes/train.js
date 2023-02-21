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
	constructor(id, pathCode, currentLocation, place, direction='FW', state=TrainState.WAITING, capacity=300, lambda=0) {
		this.id = id;
		this.pathCode = pathCode;
		this.direction = direction;
		this.lambda = lambda;
		this.curLocation = currentLocation;
		this.place = place;
		this.state = state;
		this.capacity = capacity;
		this.commuters = [];
		this.waitTime = 0;

		this.getCoords();
	}

	getCoords() {
		if (this.place instanceof Edge) {
			this.x = this.lerp(this.place.head.x, this.place.tail.x, this.lambda);
      		this.y = this.lerp(this.place.head.y, this.place.tail.y, this.lambda);
		} else if (this.place instanceof Station) {
			this.x = this.place.x;
			this.y = this.place.y;
		}
	}

	hasReached() {
		return (this.lambda >= 1);
	}

	nextLocation(paths) {
		//check if next location is in bounds
		var path = paths[this.pathCode + this.direction]

		// go to next location
		this.curLocation++

		// if we go past the list
		if (this.curLocation >= path.length) {
			//change directions
			this.direction = (this.direction == "FW") ? "BW" : "FW"
			var path = paths[this.pathCode + this.direction]
			this.curLocation = 1;
		}

		//check where the next location is now
		this.place = path[this.curLocation];

		// if it is an edge
		if (this.place instanceof Edge) {
			//we move
			this.waitTime = 0;
			this.lambda = 0; //reset lambda
			this.state = TrainState.MOVING;
		} else if (this.place instanceof Station) {
			this.waitTime = 0; //reset waittime
			this.lambda = 0;
			this.state = TrainState.WAITING;
		}

		//if not, retrieve and change to the other path
		//if next location is edge

	}

	move() {
		if (this.place instanceof Edge) {
			this.lambda = this.lambda + 0.01
			this.x = this.lerp(this.place.head.x, this.place.tail.x, this.lambda);
	      	this.y = this.lerp(this.place.head.y, this.place.tail.y, this.lambda);
      }
	}

	lerp(a, b, alpha) {
		return a + alpha * ( b - a )
	}

	update(paths) {
		switch (this.state) {
			case TrainState.WAITING: 
				//increase wait duration
				this.waitTime += 0.01;
				if (this.waitTime >= paths[this.pathCode + this.direction][this.curLocation].waitTime) {
					this.nextLocation(paths)
				}

			case TrainState.MOVING:
				this.move();
				if (this.hasReached()) {
					this.nextLocation(paths);
				}
		}
	}
}
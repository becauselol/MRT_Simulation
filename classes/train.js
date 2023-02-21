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
     * Create a Commuter.
     * @param {number} id - unique id of the commuter
     * @param {Array} path - the path commuters will take. It only stores the locations where users need to change lines
     * @param {number} location - the unique id of the station/train that it is at 
     * @param {number} state - the state of the agent
     */
	constructor(id, path, currentStation, state=TrainState.WAITING, capacity=300) {
		this.id=id;
		this.path=path;
		this.curPos=0;
		this.curStation = path[currentStation]
		this.nextStation = path[currentStation + 1]
		this.state=state;
		this.capacity=capacity;
	}
}
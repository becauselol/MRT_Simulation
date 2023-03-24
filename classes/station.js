/** Class representing a Station. */
class Station {

	/**
	* Create a Station.
	* @param {number} id - unique id of the station
	* @param {number} x - latitude of the station
	* @param {number} y - longitude of the station
	* @param {string} name - the name of the station
	* @param {Set} codes - code name of the station to understand which line it is part of
	* @param {Map} neighbours - maps all the neighbours to the respective edge that connects them (key: id, value: Edge)
	* @param {Map} neighboursUndirected - maps all the neighbours to the respective UNDIRECTED edge that connects them
	* @param {Array} commuters - list of all commuters at the station
	* @param {number} waitTime - time trains should spend waiting at each station
	* @param {Set} pathCodes - the pathCodes that the station services (basically the direction and lines trains go)
	* @param {Array} trains - the trains that are at the station
	* @param {number} spawnNo - the max number of Commuters that can be spawned
	* @param {float} spawnProb - the probability of spawning commuters in a single frame
	* @param {Object} commuterData - stores the corresponding commuterData that is necessary
	*/
	constructor(id, x, y, name="", codes = [], waitTime=1) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.name = name;
		this.codes = codes;
		this.neighbours = {};
		this.neighboursUndirected = {};
		this.commuters = [];
		this.waitTime = waitTime;
		this.pathCodes = new Set();
		this.trains = [];
		this.commuterWaitTime = {};

		// parameters that deal with the spawn rate of Commuters
		this.spawnNo = 1;
		this.spawnProb = 0.05;

		//commuter data of each station
		/**
		 * We want to track a few things
		 * - all time usage of the station
		 * - rest is idk yet, up to the ideas
		 * */
		this.commuterData = {
			"allTimeTotal": 0
		}
	} 

	/** Add neighbour to the current station 
	* @param {number} neighbour_id - unique id of the neighbour
	* @param {DirectedEdge} edge - the edge connecting these two 
	*/
	addNeighbour(neighbourId, edge) {
		this.neighbours[neighbourId] = edge
	}

	/** Add neighbour to the current station 
	* @param {number} neighbour_id - unique id of the neighbour
	* @param {Edge} edge - the undirected edge connecting these two 
	*/
	addNeighbourUndirected(neighbourId, edge) {
		this.neighboursUndirected[neighbourId] = edge
	}

	/* Function to spawn new commuters
	 * @param {number} stationLength - the maximum number of stations to choose from
	 * @param {Object} paths - the object that has all the possible Commuter paths
	 * @return {number} spawnCount is the number of commuters spawned in this time step
	 * */
	spawnNewCommuters(sysTime, stationLength, paths, spawnTime) {
		//code to spawn commuters
		var spawnCount = 0
		
		// for the max number we can spawn
		for (var i = 0; i < this.spawnNo; i++) {

			// we can spawn if it has a value lower than spawn prob
			if (Math.random() < this.spawnProb) {
				//Find a random station to move towards
				var to = Math.floor(Math.random() * stationLength)
				//if it is going to the current station, ignore it
				if (to == this.id) {
					continue;
				}

				//otherwise find the path from the path object
				var path = paths[this.id.toString() + "_" + to.toString()]
				//copy it to the commuter
				var pathCopy = [...path]
				var commuter = new Commuter(pathCopy, sysTime)

				//add commuter to the station and increment spawnCount
				this.commuters.push(commuter)
				spawnCount++;
			}
		}

		return spawnCount;
	}

	/* Function to decide which commuters should alight a train
	 * */
	alightCommuters() {
		// var boardingCommuters = this.commuters.filter(x => x.pathCode == this.trains[idx].pathCode)
		//update target of commuters
		var idxToAlight = [];
		//check who needs to be boarded
		for (var train = 0; train < this.trains.length; train++) {
			for (var i = 0; i < this.trains[train].commuters.length; i++) {

				//simply call hasReached() on each Commuter to see if they have reached
				var alight = this.trains[train].commuters[i].hasReached(this.id)
				
				//if they have reached, add them to the alighting array
				if (alight) {
					idxToAlight.push([i, train]);
				}
			}
		}
		
		//alight commuters accordingly (last to first) cos array problems
		for (var i = idxToAlight.length - 1; i > -1; i--) {
			var commuter = this.trains[idxToAlight[i][1]].commuters.splice(idxToAlight[i][0], 1)[0]
			commuter.alighted();
			this.commuters.push(commuter);
		}
	}


	/* Function to decide which commuters should board a train
	 * */
	boardCommuters() {
		// var boardingCommuters = this.commuters.filter(x => x.pathCode == this.trains[idx].pathCode)
		//update target of commuters
		var idxToBoard = [];
		let con = false;
		//check who needs to be boarded
		for (var i = 0; i < this.commuters.length; i++) {
			for (var train = 0; train < this.trains.length; train++) {
				// if the train reaches capacity
				if (this.trains[train].commuters.length >= this.trains[train].capacity) {
					// stop boarding commuters for this train
					// console.log("some train is at capacity")
					// console.log(this.trains[train].commuters.length>=this.trains[train].capacity)
					// console.log(this.trains[train].commuters.length, this.trains[train].capacity)
					let con = true;
					// console.log(con)
					break;
				}
				if (con) {
					console.log("nani")
				}
				//using isThisMyTrain() method, we will check whether to board the train
				var board = this.commuters[i].isThisMyTrain(this.trains[train].pathCode + this.trains[train].direction)

				//if so then we add them to boarding and include what train they need to board
				if (board) {
					// console.log(this.trains[train].capacity)
					// console.log(this.trains[train].commuters.length >= this.trains[train].capacity)
					idxToBoard.push([i, train]);
				}
				con = false;
			}
		}

		//board commuters accordingly (last to first) cos array problems
		for (var i = idxToBoard.length - 1; i > -1; i--) {
			//get the commuter
			var commuter = this.commuters.splice(idxToBoard[i][0], 1)[0]
			//update the target of the commuter since it has fulfilled
			commuter.updateTarget();
			//board the commuter
			this.trains[idxToBoard[i][1]].commuters.push(commuter);
		}
	}

	/* Function to remove the commuters that have reached the end of their journey
	 * */
	removeReachedCommuters() {
		//check if commuters have reached end
		//commuters get removed from system
		var idxToRemove = [];
		//check who needs to be boarded
		for (var i = 0; i < this.commuters.length; i++) {		
			//simply call hasReachedEnd() to check if the Commuters journey has ended
			var end = this.commuters[i].hasReachedEnd()

			if (end) {
				idxToRemove.push(i);
			}
		}
		
		//Remove commuters accordingly (last to first) cos array problems
		for (var i = idxToRemove.length - 1; i > -1; i--) {
			this.commuters.splice(idxToRemove[i],1)
		}
		//keep track of how many people have completed their journeys
		return idxToRemove.length;
	}

	/* Update Station to move to next timestep
	 * */
	update(sysTime, stationLength, paths) {
		var updateData = {
			"spawned": 0,
			"completedJourneys": 0
		}

		//spawn new commuters
		updateData["spawned"] += this.spawnNewCommuters(sysTime, stationLength, paths);

		var completedPeople = 0;
		
		//alight passengers
		this.alightCommuters();
		
		//handle passenger states
		//check for any who have reached
		updateData["completedJourneys"] += this.removeReachedCommuters();


		//board passengers
		this.boardCommuters();

		return updateData;

	}
}

/** Class representing a Station. */
class Station {
	/**
     * Create a Station.
     * @param {number} id - unique id of the station
     * @param {number} x - latitude of the station
     * @param {number} y - longitude of the station
     * @param {string} name - the name of the station
     * @param {Array} codes - code name of the station to understand which line it is part of
     * @param {Map} neighbours - maps all the neighbours to the respective edge that connects them (key: id, value: Edge)
     * @param {Array} commuters - list of all commuters at the station
     * @param {number} waitTime - time trains should spend waiting at each station
     */
	constructor(id, x, y, name="", codes = [], waitTime=1) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.name = name;
		this.codes = codes;
		this.neighbours = {};
		this.commuters = [];
		this.waitTime = waitTime;
		this.pathCodes = new Set();
		this.trains = [];

		this.spawnNo = 1;
		this.spawnProb = 0.05;
	} 

	/** Add neighbour to the current station 
	* @param {number} neighbour_id - unique id of the neighbour
	* @param {Edge} edge - the edge connecting these two 
	*/
	addNeighbour(neighbourId, edge) {
		this.neighbours[neighbourId] = edge
	}

	spawnNewCommuters(stationLength, paths) {
		//code to spawn commuters
		for (var i = 0; i < this.spawnNo; i++) {
			if (Math.random() < this.spawnProb) {
				var to = Math.floor(Math.random() * stationLength)
				if (to == this.id) {
					continue;
				}
				var path = paths[this.id.toString() + "_" + to.toString()]
				var pathCopy = [...path]
				var commuter = new Commuter(pathCopy)
				this.commuters.push(commuter)
			}
		}
	}

	alightCommuters() {
		// var boardingCommuters = this.commuters.filter(x => x.pathCode == this.trains[idx].pathCode)
		//update target of commuters
		var idxToAlight = [];
		//check who needs to be boarded
		for (var train = 0; train < this.trains.length; train++) {
			for (var i = 0; i < this.trains[train].commuters.length; i++) {
				var alight = this.trains[train].commuters[i].hasReached(this.id)
				
				if (alight) {

					idxToAlight.push([i, train]);
				}
			}
		}
		
		//board commuters accordingly (last to first) cos array problems
		for (var i = idxToAlight.length - 1; i > -1; i--) {
			var commuter = this.trains[idxToAlight[i][1]].commuters.splice(idxToAlight[i][0], 1)[0]
			commuter.alighted();
			this.commuters.push(commuter);
		}
	}

	boardCommuters(trains) {
		// var boardingCommuters = this.commuters.filter(x => x.pathCode == this.trains[idx].pathCode)
		//update target of commuters
		var idxToBoard = [];
		//check who needs to be boarded
		for (var i = 0; i < this.commuters.length; i++) {
			for (var train = 0; train < this.trains.length; train++) {
				var board = this.commuters[i].isThisMyTrain(this.trains[train].pathCode + this.trains[train].direction)

				if (board) {
					idxToBoard.push([i, train]);
				}
			}
		}

		//board commuters accordingly (last to first) cos array problems
		for (var i = idxToBoard.length - 1; i > -1; i--) {
			var commuter = this.commuters.splice(idxToBoard[i][0], 1)[0]
			commuter.updateTarget();
			this.trains[idxToBoard[i][1]].commuters.push(commuter);
		}
	}

	removeReachedCommuters() {
		//check if commuters have reached end
		//commuters get removed from system
		// var boardingCommuters = this.commuters.filter(x => x.pathCode == this.trains[idx].pathCode)
		//update target of commuters
		var idxToRemove = [];
		//check who needs to be boarded
		for (var i = 0; i < this.commuters.length; i++) {		
			var end = this.commuters[i].hasReachedEnd()

			if (end) {
				// console.log("board this bij");
				idxToRemove.push(i);
			}
		}
		
		//board commuters accordingly (last to first) cos array problems
		for (var i = idxToRemove.length - 1; i > -1; i--) {
			this.commuters.splice(idxToRemove[i],1)
		}
		return idxToRemove.length;
	}

	update(stationLength, paths) {
		this.spawnNewCommuters(stationLength, paths);

		var completedPeople = 0;
			//alight passengers
		this.alightCommuters();
		//handle passenger states
		//check for any who have reached
		completedPeople += this.removeReachedCommuters();


		//board passengers
		this.boardCommuters();

		return completedPeople;

	}
}
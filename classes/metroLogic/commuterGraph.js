// commuter node that has the original station ID it represents
// as well as the line code that the specific node represents
// it represents being at a specific station and waiting at a specific platform
class CommuterNode {
	constructor(originalId, id, code) {
		this.originalId = originalId
		this.id = id
		this.code = code
	} 
}

// a graph for commuters to find their path between places
class CommuterGraph {
	constructor() {
		this.nodeDict = {}
		this.edgeDict = {}
		this.commuterPaths = {}
	}

	// Floyd Warshall's Algorithm for finding all pairs shortest path
	floydWarshall() {
		var nodeOrder = Object.keys(this.nodeDict)

	    this.dist = {};
	    this.next = {};
	    this.count = {};

	    // initialization steps
	    for (const stationId of nodeOrder) {
	    	this.dist[stationId] = {};
	    	this.next[stationId] = {};
	    	this.count[stationId] = {};

	    	for (const id of nodeOrder) {
	    		this.dist[stationId][id] = Infinity
	    		this.next[stationId][id] = [-1]
	    		this.count[stationId][id] = 0;
	    	}
	    }

	    for (const [i, iDict] of Object.entries(this.edgeDict)) {
	    	for (const [j, weight] of Object.entries(iDict)) {
	    		this.dist[i][j] = weight;
				this.next[i][j] = [-1];
				this.count[i][j] = 1
	    	}
	    }

	    for (const i of nodeOrder) {
	    	this.dist[i][i] = 0;
	    	this.next[i][i] = [];
	    }

	    // relaxation of edges to find the paths
	    for (const k of nodeOrder) {
	    	for (const i of nodeOrder) {
	    		for (const j of nodeOrder) {
	    			if (this.dist[i][k] + this.dist[k][j] < this.dist[i][j]) {
						this.dist[i][j] = this.dist[i][k] + this.dist[k][j];
						this.next[i][j] = []
						this.next[i][j].push(k)
						this.count[i][j] = 1
					} else if (this.dist[i][j] == this.dist[i][k] + this.dist[k][j] &&  k != j && k != i && this.dist[i][j] != Infinity) {
						this.next[i][j].push(k);
						this.count[i][j]++
					}
	    		}
	    	}
	    }

	    console.log("fw done");
	}

	// function to get the path between stations
	/* @param {number} startStation - stationId of the station to start search from
	 * @param {number} targetStation - stationId of the station to target:
	 */
	// Referenced from stack overflow (https://stackoverflow.com/questions/11370041/floyd-warshall-all-shortest-paths)
	getPathsToStation(i, j, it=0) {
		var allPaths = [];
		if (this.next[i][j].length == 0) {
			return allPaths
		}

		for (const k of this.next[i][j]) {
			if (k == -1) {
				allPaths.push([i, j])
			} else {
				var path_i_k = this.getPathsToStation(i, k, it+1);
				var path_k_j = this.getPathsToStation(k, j, it+1);

				for (const i_k of path_i_k) {
					for (const k_j of path_k_j) {
						var i_k_copy = [...i_k]
						i_k_copy.pop()
						for (const el of k_j) {
							i_k_copy.push(el)
						}
						allPaths.push(i_k_copy)
					}
				}
			}
		}

		// this removes any duplicate paths
		if (it == 0) {
			var temp = []
			var check = new Set()
			for (var i = 0; i < allPaths.length; i++) {
				if (i==0 || !check.has(JSON.stringify(allPaths[i])))  {
					temp.push(allPaths[i]);
					check.add(JSON.stringify(allPaths[i]))
				}
			}
			allPaths = temp
		}
		return allPaths
	}

	//get all path pairs and store them as commuterPaths
	getAllPathPairs() {
		var station_ids = Object.keys(this.nodeDict)
		const N = station_ids.length;

		for (let i = 0; i < N; i++) {
			if (this.commuterPaths[station_ids[i]] === undefined) {
				this.commuterPaths[station_ids[i]] = {}
			}
			for (let j = i + 1; j < N; j++) {
				if (this.commuterPaths[station_ids[j]] === undefined) {
					this.commuterPaths[station_ids[j]] = {}
				}
				var paths = this.getPathsToStation(station_ids[i], station_ids[j])
				if (paths == []) {
					continue;
				}

				var forwardPaths = []
				for (const p of paths) {
					forwardPaths.push([...p])
				}
				this.commuterPaths[station_ids[i]][station_ids[j]] = forwardPaths

				var reversePaths = []
				// reverse all the paths
				for (const p of paths) {
					reversePaths.push([...p.reverse()])
				}
				this.commuterPaths[station_ids[j]][station_ids[i]] = reversePaths
			}
		}

        console.log("all paths found");
	}
}
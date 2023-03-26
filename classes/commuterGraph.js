class CommuterNode {
	constructor(originalId, id, code) {
		this.originalId = originalId
		this.id = id
		this.code = code
		this.dist = {}
		this.next = {}
	} 
}

class CommuterGraph {
	constructor() {
		this.nodeDict = {}
		this.edgeDict = {}
		this.commuterPaths = {}
	}

	floydWarshall() {

	    this.dist = {};
	    this.next = {};
	    let i = 0;
	    console.log(this.dist)
	    for (const stationId of Object.keys(this.nodeDict)) {
	    	this.dist[stationId] = {};
	    	this.next[stationId] = {};

	    	for (const id of Object.keys(this.nodeDict)) {
	    		this.dist[stationId][id] = Infinity
	    		this.next[stationId][id] = null
	    	}
	    	console.log(this.dist)
	    }
	    console.log(this.dist)

	    for (const i of Object.keys(this.nodeDict)) {
	    	for (const [lineCodeDirection, j] of Object.entries(this.nodeDict[i])) {
	    		console.log(i + "_" + j)
	    		var edgeWeight = this.edgeDict[i + "_" + j]
	    		this.dist[i][j] = edgeWeight;
				this.next[i][j] = [j];
	    	}
	    	// console.log(this.dist)
	    }
	    console.log(this.dist)
	    for (const i of Object.keys(this.nodeDict)) {
	    	this.dist[i][i] = 0;
	    	this.next[i][i] = [i];
	    }

	    for (const k of Object.keys(this.nodeDict)) {
	    	for (const i of Object.keys(this.nodeDict)) {
	    		for (const j of Object.keys(this.nodeDict)) {
	    			if (this.dist[i][j] > this.dist[i][k] + this.dist[k][j]) {
						this.dist[i][j] = this.dist[i][k] + this.dist[k][j];
						this.next[i][j] = [this.next[i][k]];
					}
					if (this.dist[i][j] = this.dist[i][k] + this.dist[k][j]) {
						this.next[i][j].push(...this.next[i][k]);
					}
	    		}
	    	}
	    }

	    for (const i of Object.keys(this.nodeDict)) {
	    	for (const j of Object.keys(this.dist[i])) {
	    		if (i == j) {
	    			continue;
	    		}
	    		this.dist[i][j] -= this.nodeDict[i].waitTime
	    	}
	    }

	    // subtract all the wait times
	    console.log("fw done");
	}
}
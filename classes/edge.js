/** Class representing a Edge between stations. */
class Edge {	
	/**
	* Create an undirected edge
	* @param {Station} head - the Station that the Edge originates from
	* @param {Station} tail - the Station that the Edge terminates at 
	* @param {number} weight - the time it takes to travel from one station to another
	* @param {string} colour - the colour that the line is labelled
	* @param {Object} commuterData - data of commuters passing through
	* @param {float} heatScale - number between 0 and 1 which determines how "hot" a edge is
	* @param {string} heatColour - HSL value of the edge that represents how "hot a edge is"
	*/
	constructor(head, tail, colour) {
		this.head = head;
		this.tail = tail;
		this.colour = colour;
		this.commuterData = {
			"allTimeTotal": 0
		}
		this.heatScale = 0;
		this.heatColour = "hsl(240, 100%, 50%)"
	}
}

class DirectedEdge extends Edge {
	/**
	* Create an edge
	* @param {Station} head - the Station that the Edge originates from
	* @param {Station} tail - the Station that the Edge terminates at 
	* @param {number} weight - the time it takes to travel from one station to another
	* @param {string} colour - the colour that the line is labelled
	* @param {Edge} undirectedEdge - the undirected edge that is in some sense a "parent" of the DirectedEdge
	*/
	constructor(head, tail, weight, colour, edge) {
		super(head, tail, colour)
		this.weight = weight;
		this.undirectedEdge = edge
	}
}

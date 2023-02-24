/** Class representing a Edge between stations. */
class Edge {
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
	*/
	constructor(head, tail, weight, colour, edge) {
		super(head, tail, colour)
		this.weight = weight;
		this.undirectedEdge = edge
	}
}
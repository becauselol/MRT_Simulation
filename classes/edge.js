/** Class representing a Edge between stations. */
class Edge {
	/**
	* Create an edge
	* @param {Station} head - the Station that the Edge originates from
	* @param {Station} tail - the Station that the Edge terminates at 
	* @param {number} weight - the time it takes to travel from one station to another
	* @param {string} colour - the colour that the line is labelled
	*/
	constructor(head, tail, weight, colour) {
		this.head = head;
		this.tail = tail;
		this.weight = weight;
		this.colour = colour;
		this.commuterData = {
			"allTimeTotal": 0
		}
		this.heatScale = 0;
		this.heatColour = "hsl(240, 100%, 50%)"
	}
}
/** Class representing a Edge between stations. */
class Edge {
	/**
	* Create an edge
	* @param {number} weight - the time it takes to travel from one station to another
	* @param {string} colour - the colour that the line is labelled
	*/
	constructor(weight, colour) {
		this.weight = weight;
		this.colour = colour;
	}
}
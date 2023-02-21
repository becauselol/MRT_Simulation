class Station {
	constructor(id, x, y, name="", codes = []) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.name = name;
		this.code = codes;
		this.neighbours = {};
	} 

	addNeighbour(id, edge) {
		this.neighbours[id] = edge
	}
}
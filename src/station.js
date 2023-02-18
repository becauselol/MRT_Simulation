// each station will be an object
// it has the attribute edges
// edges will contatin key-value pairs of edge  
class Station {
	constructor(id, x, y, name="") {
		this.id = id;
		this.x = x;
		this.y = y;
		this.name = name;
		this.code = this.getCodes();
		this.neighbours = {};
	}

	getCodes() {
		var all_codes = this.name.split(" ").slice(-1)[0];
		var codes = all_codes.split("/");
		// var code_set = new Set();
		// for (idx in codes) {
		// 	code_set.add(codes[idx]);
		// }
		return codes;
	}

	addNeighbour(id, line) {
		this.neighbours[id] = line
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
		ctx.lineWidth = 3;
		// line color
		ctx.strokeStyle = 'gray';
		ctx.stroke();
	}
}


class Line {
	constructor(weight = 1, colour = "black") {
		this.weight = weight;
		this.colour = colour;
	}
}
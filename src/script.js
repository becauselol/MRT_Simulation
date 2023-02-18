//test
var canvas = document.getElementById('myCanvas'); 
var ctx = canvas.getContext('2d');

var max_x = 960;
var max_y = 540;

var min_lat = Number.MAX_SAFE_INTEGER;
var min_long = Number.MAX_SAFE_INTEGER;
var max_lat = Number.MIN_SAFE_INTEGER;
var max_long = Number.MIN_SAFE_INTEGER;
for (idx in clean_data) {
	min_lat = Math.min(min_lat, clean_data[idx][1])
	max_lat = Math.max(max_lat, clean_data[idx][1])
	min_long = Math.min(min_long, clean_data[idx][2])
	max_long = Math.max(max_long, clean_data[idx][2])
}

var stations = {};

//scaling + add stations
for (idx in clean_data) {
	var name = clean_data[idx][0];
	var x = ((clean_data[idx][1] - min_lat) * max_x) / (max_lat - min_lat);
	var y = ((clean_data[idx][2] - max_long) * max_y) / (min_long - max_long);
	stations[idx] = new Station(idx, x + 10, y + 10, name)
}

var mrt_colour = {
	'ewl': 'green',
	'dtl': 'blue',
	'nsl': 'red',
	'nel': 'purple',
	'ccl': 'orange',
	'tel': 'brown',
	'crl': 'lime'
}

var mrt_path = {
	'ewl': [],
	'cgl': [],
	'dtl': [],
	'nsl': [],
	'nel': [],
	'ccl': [],
	'tel': [],
	'crl': [],
	'cpl': []
};

var mrt_code = {};
for (const [key, value] of Object.entries(stations)) {
	for (idx in stations[key].code) {
		mrt_code[stations[key].code[idx]] = key;
	}
}

for (const [key, value] of Object.entries(edges)) {
	var colour = mrt_colour[key];

	for (idx in value) {
		//add stations to the path
		if (idx == 0) {
			mrt_path[key].push(stations[mrt_code[value[idx][0]]]);
		}
		mrt_path[key].push(stations[mrt_code[value[idx][1]]]);

		//add stations as neighbours
		var a = mrt_code[value[idx][0]];
		var b = mrt_code[value[idx][1]];
		var weight = value[idx][2];

		var line = new Line(weight, colour);
		stations[a].addNeighbour(stations[b].id, line);
		stations[b].addNeighbour(stations[a].id, line);
	}
}

var trains = [];
for (const [key, value] of Object.entries(mrt_path)) {
	for (idx in value) {
		if (idx == 0 || idx == value.length - 1) {
			trains.push(new Train(key, value, parseInt(idx)));
		} else {
			trains.push(new Train(key, value, parseInt(idx), 1));
			trains.push(new Train(key, value, parseInt(idx), -1))
		}

	}
	
}



function init() {
	window.requestAnimationFrame(draw);
}

function draw() {
	ctx.clearRect(0,0,960,540);

	var q = [0];
	var visited = new Set();
	visited.add(1);

	while (q.length > 0) {
		name = q.pop();
		curr = stations[name];

		//draw circle
		curr.draw(ctx);

		// console.log(curr);
		for (const [key, value] of Object.entries(curr["neighbours"])) {
			n = stations[key];
			if (key == name) {
				continue;
			}
			ctx.beginPath();
			ctx.moveTo(curr.x, curr.y);
			ctx.lineTo(n.x, n.y);
			ctx.lineWidth = 5;
			ctx.strokeStyle = value.colour;
			ctx.lineCap = 'round';
			ctx.stroke();

			if (!visited.has(n.id)) {


				visited.add(n.id);
				q.push(n.id);

			}
		}
	}

	for (const [key, value] of Object.entries(stations)) {
		value.draw(ctx);
	}

	for (const [key, value] of Object.entries(trains)) {
		value.draw(ctx);
	}
	


	window.requestAnimationFrame(draw);
}

init();
// for (i = 10; i < canvas.height; i += 20) 
// {
// ctx.moveTo(0, i);
// ctx.lineTo(canvas.width, i);
// ctx.stroke();
// }
// for (i = 10; i < canvas.width; i += 20) 
// {
// ctx.moveTo(i, 0);
// ctx.lineTo(i,canvas.height);
// ctx.stroke();
// }

// draw circles for places where there are stations

// draw corresponding edges between stations


class Train {
	constructor(id, path, startIdx=0, direction=1, capacity=300, loops = false) {
		this.id = id;
		
		let startStation = path[startIdx];
		this.x = startStation.x;
		this.y = startStation.y;
		this.initialX = startStation.x;
		this.initialY = startStation.y;

		this.path = path;

		this.capacity = capacity;
		this.occupancy = 0;

		this.state = 1;
		this.wait = 0;

		this.location = startIdx;

		this.loops = loops;
		if (this.location + 1 == this.path.length) {
			this.direction = -1;
			this.target = this.path[this.location - 1];
		} else if (direction == 1) {
			this.target = this.path[this.location + 1];
			this.direction = 1;
		} else {
			this.target = this.path[this.location - 1];
			this.direction = -1;
		}



		this.lambda = 1;
	}

	hasReached() {
		return (this.lambda >= 1);
	}
	//move to next station
	nextStation() {
		this.lambda = 0;
		
		if (this.loops) {
			this.location = (this.location + this.direction) % this.path.length;
		} else {
			this.location += this.direction;
			if (this.location == this.path.length - 1) {
				this.direction = -1;
			}
			if (this.location == 0) {
				this.direction = 1;
			}
		}
		
		this.initialX = this.x;
		this.initialY = this.y;
		this.target = this.path[this.location];
	}

	move() {
		this.lambda = this.lambda + 0.01
		this.x = this.lerp(this.initialX, this.target.x, this.lambda);
      	this.y = this.lerp(this.initialY, this.target.y, this.lambda);
	}

	lerp(a, b, alpha) {
		return a + alpha * ( b - a )
	}

	draw() {
		//train code
		ctx.beginPath();
		ctx.arc(this.x, this.y, 1, 0, 2*Math.PI, true);
		ctx.lineWidth = 5;
		// line color
		ctx.strokeStyle = 'black';
		ctx.stroke();
		ctx.closePath();

		//if state == 1, move the train
		if (this.state == 1) {
			let reached = this.hasReached();
			if (reached) {
				this.nextStation();
				// console.log(train.target.name)
			} else {
				this.move();
			}
		}
		//if reach target, move to next target in list
	}
}

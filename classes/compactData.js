class StatCompact {
	constructor() {
		this.vals = []
		this.mean = 0
		this.var = 0
		this.min = 0
		this.max = 0
	}

	addValue(value) {
		// add to the frequency
		this.vals.push(value)
		//update the various statistics
		var old_mean = this.mean
		this.mean = old_mean + (value - old_mean) / this.vals.length;

		var old_var = this.var;
		if (this.vals.length > 1) {
			this.var = (1 - (1/(this.vals.length - 1))) * old_var + this.vals.length * Math.pow((this.mean - old_mean), 2)
		}
		
		this.vals.sort()

		if (value < this.min) {
			this.min = value;
		}

		if (value > this.max) {
			this.max = value;
		}
	}

	getSum() {
		return this.vals.reduce((a, b) => a + b, 0)
	}
	getMean() {
		return this.mean;
	}

	getVar() {
		return this.var
	}

	getStd() {
		return Math.pow(this.var, 0.5)
	}

	getMin() {
		return this.min;
	}

	getMax() {
		return this.max;
	}

	getMedian() {
		return this.quantile(0.5);
	}

	// https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
	quantile(q) {
	    const pos = (this.vals.length - 1) * q;
	    const base = Math.floor(pos);
	    const rest = pos - base;
	    if (this.vals[base + 1] !== undefined) {
	        return this.vals[base] + rest * (this.vals[base + 1] - this.vals[base]);
	    } else {
	        return this.vals[base];
	    }
	}

	q25() {
		return this.quantile(.25)
	}

	q75() {
		return this.quantile(.75)
	}

	fillRandomNumbers(n=10) {
		for(var i = 0 ; i < n; i++) {
			this.addValue(Math.floor(Math.random() * 10))
		}
	}
}


class FakeTrainData {
	constructor() {
		this.lines = ["ccl", "nsl", "nel", "dtl", "ewl", "tel"]

		// use Object.keys(obj.store) to iterate through, or just use obj.lines
		this.store = {}

		for (var i = 0; i < this.lines.length; i++) {
			this.store[this.lines[i]] = new StatCompact();
			this.store[this.lines[i]].fillRandomNumbers(20);
		}
	}
}

class FakeLineData {
	constructor() {
		this.stations = 31;
		this.line = "ccl";

		// use Object.keys(obj.store) to iterate through, or just use obj.lines
		this.store = [];

		for (var i = 0; i < this.stations; i++) {
			this.store.push(new StatCompact());
			this.store[i].fillRandomNumbers(20);
		}
	}
}
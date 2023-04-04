class StatCompact {
	constructor() {
		this.freq = {}
		this.keys = []
		this.mean = 0
		this.var = 0
		this.min = Number.MAX_SAFE_INTEGER
		this.max = Number.MIN_SAFE_INTEGER
		this.sum = 0
		this.count = 0
	}

	// binary search to find and insert
	searchInsertPosition(target) {
		var left = 0;
	    var right = this.keys.length - 1;
	    var pivot = 0;
	    while (left <= right) {
	        pivot = Math.floor((right - left)/2) + left
	        if (this.keys[pivot] > target) {
	            right = pivot - 1
	        } else if (this.keys[pivot] < target) {
	            left = pivot + 1
	        } else {
	            return pivot
	        }
	    }
	    if (this.keys[pivot] > target) {
	        return pivot
	    } else {
	        return pivot + 1
	    }
	}

	addValue(value) {
		this.count++
		this.sum += value
		// add to the frequency
		if (!(value in this.freq)) {
			this.freq[value] = 0
			var insertPos = this.searchInsertPosition(value)
			this.keys.splice(insertPos, 0, value)
		}
		this.freq[value]++
		//update the various statistics
		var old_mean = this.mean
		this.mean = old_mean + (value - old_mean) / this.count;

		var old_var = this.var;
		if (this.count > 1) {
			this.var = (1 - (1/(this.count - 1))) * old_var + this.count * Math.pow((this.mean - old_mean), 2)
		}

		if (value < this.min) {
			this.min = value;
		}

		if (value > this.max) {
			this.max = value;
		}
	}

	getSum() {
		return this.sum
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

	// broken quantile function. does not work as intended
	quantile(q) {
	    const pos = (this.count + 1) * q;
	    var tot = 0;
		for(var i=0; i < this.keys.length; i++){
		    tot += this.freq[this.keys[i]];
		    if(tot >= pos) { 
		        var upper_med = this.keys[i]; 
		        break; 
		    }

		    var lower_med = this.keys[i];
		    
		}
		// console.debug(lower_med, upper_med)
		return upper_med;
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

	getNineFigureArray() {
		return [this.getMean(), this.getStd(), this.getMin(), this.q25(), this.getMedian(), this.q75(), this.getMax(), this.count, this.getSum()]
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
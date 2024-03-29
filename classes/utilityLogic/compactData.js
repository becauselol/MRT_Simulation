// class created for efficient storage of data
// stores data as frequencies instead of a whole list of data
class StatCompact {
    constructor() {
        this.freq = {} // frequency counts of different keys
        this.keys = [] // stores the keys in sorted order, allows for iteration
        this.mean = 0 // mean of the data
        this.var = 0 // variance of the data
        this.min = Number.MAX_SAFE_INTEGER // minimum of the data
        this.max = Number.MIN_SAFE_INTEGER // maximum of the data
        this.sum = 0 // sum of all values in the dataset
        this.count = 0 // counts the number of datapoints
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

    // adds a value to statcompact
    // updates the mean and sd recursively
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

    // getter methods
    getSum() {return this.sum}
    getMean() {return this.mean;}
    getVar() {return this.count > 1 ? this.var : 0;}
    getStd() {return this.count > 1 ? Math.pow(this.var, 0.5) : 0}
    getMin() {return this.count > 0 ? this.min : 0;}
    getMax() {return this.count > 0 ? this.max : 0;}
    getMedian() {return this.quantile(0.5);}
    q25() {return this.quantile(.25)}
    q75() {return this.quantile(.75)}

    // function to determine various quantile statistics
    // semi works(?) so not very reliable
    quantile(q) {
        // determine the necessary frequency count
        const pos = (this.count+1) * q;
        if (Number.isInteger(pos)) {
            var upper_pos = pos;
            var lower_pos = pos;
        } else {
            var upper_pos = Math.ceil(pos)
            var lower_pos = Math.floor(pos)
        }
        var tot = 0;
        var upper_med = null 
        var lower_med = null

        // iterates through the keys until the frequency count is 
        // past a certain threshold based on the chosen quantile
        // then calculates the median based on the keys
        for(var i=0; i < this.keys.length; i++){
            tot += this.freq[this.keys[i]];
            if(upper_med == null && upper_pos <= tot) { 
                var upper_med = this.keys[i]; 
            }

            if(lower_med == null && lower_pos <= tot) { 
                var lower_med = this.keys[i]; 
            }

            if (upper_med != null && lower_med != null) {
                break;
            }
        }
        return  upper_pos != lower_pos ? (upper_med + lower_med)/2 : lower_med
    }

    // returns detailed statistics
    getNineFigureArray() {
        return [
            this.getMean(), 
            this.getStd(), 
            this.getMin(), 
            this.q25(), 
            this.getMedian(), 
            this.q75(), 
            this.getMax(), 
            this.count, 
            this.getSum()]
    }

    //returns succinct statistics
    getMeanStdCountArray() {
        return [
            this.getMean(), 
            this.getStd(), 
            this.count]
    } 
}



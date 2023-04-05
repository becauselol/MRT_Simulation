
var slider1 = document.getElementById("myRange1");
var output1 = document.getElementById("demo1");
output1.innerHTML = slider1.value;

var slider2 = document.getElementById("myRange2");
var output2 = document.getElementById("demo2");
output2.innerHTML = slider2.value;

function outputVal(slider, output) {
    slider.oninput = function() {
        output.innerHTML = this.value;
    }
}

outputVal(slider1, output1)
outputVal(slider2, output2)
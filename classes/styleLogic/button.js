// make buttons for input parameter

// for line dropdown selection
function setButton1(dataStore){

    var selectL = document.getElementById("trainline");
    removeOptions(selectL)
    var data = dataStore.getLineCodeArray();


    for(var i = 0; i < data.length; i++)
    {
        var option = document.createElement("OPTION"),
            txt = document.createTextNode(data[i]);
        option.appendChild(txt);
        option.setAttribute("value",data[i]);
        selectL.insertBefore(option,selectL.lastChild);
    }


}

function resetStartModal() {
  document.getElementById("name").value = ""
  document.getElementById("colour").value = "#ffffff"
  document.getElementById("startstn").value = ""
  newLineArr = [[]]
}

function setNewLineInit() {

    // check if inputs are ok
    var newLineName = document.getElementById("name").value
    var startStation = document.getElementById("startstn").value.toUpperCase()
    var colour = document.getElementById("colour").value

    if (newLineName == "" || startStation == "") {
        alert("Please fill in all fields")
        replace('newline', 'newline')
        return
    }
    if (newLineName.includes(" ") || newLineName.includes(".") || newLineName.includes("/") || newLineName.includes(",")) {
        alert("No spaces, full stops, slashes or commas allowed in line name")
        replace('newline', 'newline')
        return
    }
    if (newLineName in processor.chosenLines) {
        alert("Choose another line name, " + newLineName + " already exists")
        replace('newline', 'newline')
        return
    }

    if (!(startStation in processor.codeStationRef)) {
        alert("Chosen Station " + startStation.toUpperCase() + " is not a valid station")
        replace('newline', 'newline')
        return
    }

    newLineArr[0].push(startStation)

    replace('newline', 'newlineNxt')

}

function newLineUpdate(){
    // when next clicked save values into array
    // var stn_i1 = document.getElementById("frmstn").value;
    var stn_i2 = document.getElementById("tostn").value.toUpperCase();
    var time = document.getElementById("timeT").value;

    if (stn_i2 == "" || time == "") {
        alert("Please fill in all fields")
        replace('newlineNxt', 'newlineNxt')
        return false
    }

    if (!(stn_i2 in processor.codeStationRef)) {
        alert("Chosen Station " + stn_i2.toUpperCase() + " is not a valid station")
        replace('newlineNxt', 'newlineNxt')
        return false
    }

    if (stn_i2 == getPrevStn()) {
        alert("Next Station cannot go to previous station")
        replace('newlineNxt', 'newlineNxt')
        return false
    }

    if (parseFloat(time) < 1) {
        alert("No station travel time can be less than 1")
        replace('newlineNxt', 'newlineNxt')
        return false
    }

    newLineArr[newLineArr.length - 1].push(stn_i2)
    newLineArr[newLineArr.length - 1].push(time)
    newLineArr.push([stn_i2]);

    // refresh/re-initialise input values
    // inputFrom.value = "";
    inputTo.value = "";
    inputTime.value = "";
    replace('newlineNxt', 'newlineNxt')
    return true
}

// get new line name  
function getLineName(){
    var newLineName = document.getElementById("name").value

    return newLineName
}

function getPrevStn() {
    if (newLineArr[0].length == 0) {
        return ""
    }
    return newLineArr[newLineArr.length - 1][0]
}

function saveLine(){

    res = newLineUpdate()
    if (!res) {
        return false
    }
    // get line name and colour
    var lineName = getLineName()
    var colour = document.getElementById("colour").value

    // Make new line key
    var temp = []
    newLineArr.pop()
    // add color into dictionary 
    for (const stnPair of newLineArr) {
        // take stn arr and convert to string
        temp.push(stnPair.join(","))
    }

    var newEdgeString = temp.join("\n")
    processor.parseEdgeString(lineName, newEdgeString)
    processor.edgeColours[lineName] = colour 
    if (!(lineName in processor.chosenLines)) {
        processor.chosenLines.push(lineName)
    }
    processor.trainPeriod[lineName] = inputPara.interArrival
    processor.trainCapacities[lineName] = inputPara.trainCap
    newLineArr = [[]] //empty out stn array 
    alert("New Line Added\n" +
        "Check simulation!");
    resetStartModal();
    changesMade = true
    return true
    // add to main dictionary
}

// replace current div with another div
function replace( hide, show ) {
    document.getElementById(hide).style.display="none";
    document.getElementById(show).style.display="flex";
    document.getElementById("linename").innerHTML = "Line Name: " + getLineName()
    document.getElementById("prevstn").innerHTML = "previous station: " + getPrevStn()
  }


 // adding options to drop down selection
function removeOptions(selectElement) {
     var i, L = selectElement.options.length - 1;
     for(i = L; i >= 0; i--) {
        selectElement.remove(i);
     }
  }

// alert when new line added



// function newLine() {
//     var x = document.getElementById("newline");
//     console.log(x.style.display)
//     if (x.style.display == "none") {
//       x.style.display = "flex";
//     } else {
//       x.style.display = "none";

//     }
//   }


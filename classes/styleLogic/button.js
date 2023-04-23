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

// resets the start modal for creating a new line
function resetStartModal() {
  document.getElementById("name").value = ""
  document.getElementById("colour").value = "#ffffff"
  document.getElementById("startstn").value = ""
  newLineArr = [[]]
}

// function that is called after the newline modal comes up
// when we move to next
// it checks if the names, start stationa nd colour are valid
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

    // initialize the first station
    newLineArr[0].push(startStation)

    // move to next modal
    replace('newline', 'newlineNxt')

}

// function creates the new neighbour in the edge
function newLineUpdate(){

    // when next clicked save values into array
    var toStation = document.getElementById("tostn").value.toUpperCase();
    var time = document.getElementById("timeT").value;

    // check for valid inputs
    if (toStation == "" || time == "") {
        alert("Please fill in all fields")
        replace('newlineNxt', 'newlineNxt')
        return false
    }

    if (!(toStation in processor.codeStationRef)) {
        alert("Chosen Station " + toStation.toUpperCase() + " is not a valid station")
        replace('newlineNxt', 'newlineNxt')
        return false
    }

    if (toStation == getPrevStn()) {
        alert("Next Station cannot go to previous station")
        replace('newlineNxt', 'newlineNxt')
        return false
    }

    if (parseFloat(time) < 1) {
        alert("No station travel time can be less than 1")
        replace('newlineNxt', 'newlineNxt')
        return false
    }

    // add the nextStation in the line
    newLineArr[newLineArr.length - 1].push(toStation)
    newLineArr[newLineArr.length - 1].push(time)
    newLineArr.push([toStation]);

    // refresh/re-initialise input values
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

// gets the previous station in newLineArr
function getPrevStn() {
    // if there is nothing in newLineArr
    if (newLineArr.length == 0 || newLineArr[0].length == 0) {
        // return empty
        return ""
    }
    return newLineArr[newLineArr.length - 1][0]
}

// function to save the line
function saveLine(){

    // updates the 
    var updateOk = newLineUpdate()
    if (!updateOk) {
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

    // make the newEdgeString
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


// make buttons for input parameter

// for line dropdown selection
function setButton1(dataStore){
    // get html element of button
    var selectL = document.getElementById("trainline");
    // remove all options in dropdown
    removeOptions(selectL)
    // get all train line names
    var data = dataStore.getLineCodeArray();

    for(var i = 0; i < data.length; i++)
    {
        var option = document.createElement("OPTION"), // create option of dropdown element
            txt = document.createTextNode(data[i]); // create text node with line name
        option.appendChild(txt); // add text node to option
        option.setAttribute("value",data[i]); // set attribute as value
        selectL.insertBefore(option,selectL.lastChild); //insert into option
    }


}

// for station dropdown selection
function setButton2(dataStore){
    // get html element of buttons
    var selectL = document.getElementById("trainline");
    var selectS = document.getElementById("trainstn");

    // get chosen line name
    var chosenLine = selectL.options[selectL.selectedIndex].text;
    var dataS = dataStore.lineStations[chosenLine]; // extract data corresponding to chosen line
    for(var i = 0; i < dataS.length; i++)
    {
        var stationName = dataStore.nameMap[dataS[i]] // get station names of chosen line
        var option = document.createElement("OPTION"), // create option
            txt = document.createTextNode(stationName); // create text node with station name
        option.appendChild(txt); // append to option
        option.setAttribute("value",stationName); // set attribute
        selectS.insertBefore(option,selectS.lastChild); // insert into dropdown button
    }

}

function setNewLineInit() {
    var startStation = document.getElementById("startstn").value
    var colour = document.getElementById("colour").value
    newLineArr[0].push(startStation)

    replace('newline', 'newlineNxt')
}

// replace current div with another div
function replace( hide, show ) {
    document.getElementById(hide).style.display="none"; // hide display
    document.getElementById(show).style.display="flex"; // show display
    document.getElementById("linename").innerHTML = getLineName()
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
function newlinealert() {
    alert("New Line Added\n" +
        "Check simulation!");
}


// function newLine() {
//     var x = document.getElementById("newline");
//     console.log(x.style.display)
//     if (x.style.display == "none") {
//       x.style.display = "flex";
//     } else {
//       x.style.display = "none";

//     }
//   }


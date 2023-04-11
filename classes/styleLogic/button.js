function setButton1(dataStore){

    var selectL = document.getElementById("trainline");

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


function setButton2(dataStore){
    var selectL = document.getElementById("trainline");
    var selectS = document.getElementById("trainstn");
    var chosenLine = selectL.options[selectL.selectedIndex].text;
    var dataS = dataStore.lineStations[chosenLine];
    for(var i = 0; i < dataS.length; i++)
    {
        var stationName = dataStore.nameMap[dataS[i]]
        var option = document.createElement("OPTION"),
            txt = document.createTextNode(stationName);
        option.appendChild(txt);
        option.setAttribute("value",stationName);
        selectS.insertBefore(option,selectS.lastChild);
    }

}

function replace( hide, show ) {
    document.getElementById(hide).style.display="none";
    document.getElementById(show).style.display="flex";
    document.getElementById("linename").innerHTML = getLineName()
  }


function newLine() {
    var x = document.getElementById("newline");
    console.log(x.style.display)
    if (x.style.display === "none") {
      x.style.display = "flex";
    } else {
      x.style.display = "none";

    }
  }


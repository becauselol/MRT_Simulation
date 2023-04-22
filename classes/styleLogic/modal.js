// create modal for new line button


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("newlinebtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Get the <span> element that closes the modal
var savebtn = document.getElementById("save");



// When the user clicks the button, open the modal 
btn.onclick = function() {
  if(isRunning) {
    alert("Please pause the simulation to make changes")
    return
  }
  
  modal.style.display = "block";
  replace('newlineNxt', 'newline');

}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  resetStartModal()
}

// When the user clicks save btn, close modal
// When the user clicks on <span> (x), close the modal
savebtn.onclick = function() {
  res = saveLine()
  if (res) {
    modal.style.display = "none"; 
  }

}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    resetStartModal()
  }
}

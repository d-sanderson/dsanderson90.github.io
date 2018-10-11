window.onload = myPageGreeter();

function myPageGreeter() {
	var person;
	person = prompt("What is your Name?", " ");
	if(person == null || person == " ") {
		alert("User cancelled the prompt.");
	} else {
		alert("Hello " + person + "! Welcome to my Pro-Dev Page!");
	}
}
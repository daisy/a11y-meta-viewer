
/* result dialog */

var result_dialog = document.getElementById("result");
var result_close = document.querySelector("dialog#result button");

result_close.addEventListener("click", () => {
  result_dialog.close();
});

/* process input metadata */

function processXML() {

	var xml = document.getElementById('input_packagedoc').value;
	
	// reest the result pane
	var result_field = document.getElementById('result_body');
		result_field.textContent = '';
	
	console.clear();
	
	var result;
	
	if (xml.match('<package ')) {
		result = packageProcessor.processPackageDoc(xml, result_field);
	}
	
	else if (xml.match('<ONIXMessage ')) {
		result = onixProcessor.processOnixRecord(xml, result_field);
	}
	
	else {
		alert('Invalid xml document - package or onix root element not found');
		return;
	}
	
	if (result) {
		result_field.appendChild(result);
		result_dialog.showModal();
	}
}


/* explainer dialog */

var expl_dialog = document.getElementById("explainer");
var expl_body = document.getElementById("explainer_body");

function showExplainer(id) {
	expl_body.innerHTML = packageProcessor.getExplainer(id);
	expl_dialog.showModal();
}

var expl_close = document.querySelector("dialog#explainer button");

expl_close.addEventListener("click", () => {
  expl_dialog.close();
});

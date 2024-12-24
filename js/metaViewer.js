
/* result dialog */

var result_dialog = document.getElementById('result');
var result_close_button = document.getElementById("result-close-button");
var result_close_img = document.getElementById("result-close-img");

result_close_button.addEventListener("click", () => {
  document.getElementById("result").close();
});

result_close_img.addEventListener("click", () => {
  document.getElementById("result").close();
});

/* process input metadata */

function processXML() {

	var xml = document.getElementById('input_packagedoc').value;
	
	// reest the result pane
	var result_field = document.getElementById('result-body');
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

function writeExplainerLink(id) {
	var a = document.createElement('a');
		a.href = '#';
		a.classList.add('explainer-link');
		a.onclick = function () { showExplainer(id); return false; }
		a.title = 'Show explainer for this field';
	
	var img = document.createElement('img');
		img.src = 'graphics/info.png';
		img.alt = 'Show explainer for this field';
		img.onmouseover = function () { this.src = 'graphics/info_hover.png' }
		img.onmouseout = function () { this.src = 'graphics/info.png' }
	
	a.appendChild(img);
	
	return a;
}

var explainer_dialog = document.getElementById("explainer");

function showExplainer(id) {
	var expl_body = document.getElementById("explainer-body");
		expl_body.innerHTML = document.getElementById(id).innerHTML;
	explainer_dialog.showModal();
}

var explainer_close_button = document.getElementById("explainer-close-button");
var explainer_close_img = document.getElementById("explainer-close-img");

explainer_close_button.addEventListener('click', () => {
  explainer_dialog.close();
});

explainer_close_img.addEventListener('click', () => {
  explainer_dialog.close();
});

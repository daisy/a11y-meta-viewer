
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
	
	// to be replaced with select box option later
	var lang = 'en-us'; // document.getElementById('lang').value;
	
	var vocab = getVocab(lang);
	var mode = document.querySelector('input[name="mode"]:checked').value;
	var punctuation = getPunctuation(lang);
	
	var result;
	
	if (xml.match('<package ')) {
		var version = xml.match('version="2.0"') ? 'epub2' : 'epub3';
		result = packageProcessor.processPackageDoc(xml, version, vocab, mode);
	}
	
	else if (xml.match('<ONIXMessage ')) {
		result = onixProcessor.processOnixRecord(xml, 'onix', vocab, mode);
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




/* return the vocabulary strings in the preferred locale */

function getVocab(lang) {

	var vocab;
	
	switch (lang) {
		default:
			vocab = en_us;
	}
	
	return vocab;
	
}




/* language-specific punctuation */

function getPunctuation(lang) {
	var punctuation;
	
	switch (lang) {
		default:
			punctuation = document.createTextNode('.');
	}
	
	return punctuation;
}




/* common header and explainer dialog */

function makeHeader(str, id) {
	var hd_block = document.createElement('div');
		hd_block.classList.add('grid-hd');
		
	var hd = document.createElement('h3');
		hd.appendChild(document.createTextNode(str));
	hd_block.appendChild(hd);
	
	if (id) {
		hd_block.appendChild(writeExplainerLink(id));
	}
	
	return hd_block;
}

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

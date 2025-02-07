
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

function processRecord() {

	var xml = document.getElementById('input_record').value;
	
	if (!metaDisplayProcessor.initialize({
			record_as_text: xml
		})) {
		return;
	}
	
	showDisplayMetadata(false);
}

function reprocessRecord() {

	var lang = document.getElementById('lang').value;
	var vocab = getVocab(lang);
	var punctuation = getPunctuation(lang);
	
	var mode = document.getElementById('mode').value;
	
	var suppressNoInfo = document.getElementById('no-info').value == 'hide' ? true : false;
	
	if (!metaDisplayProcessor.reinitialize({
			vocab: vocab,
			punctuation: punctuation,
			mode: mode
		})) {
		return;
	}
	
	showDisplayMetadata(suppressNoInfo);
}

function showDisplayMetadata(suppressNoInfo) {

	// reest the result pane
	var result_field = document.getElementById('result-body');
		result_field.textContent = '';
	
	console.clear();
	
	var result = document.createElement('div');
		result.classList.add('grid');
	
	// 3.1 Ways of reading
	
	var ways_result = metaDisplayProcessor.processWaysOfReading();
	
	if (ways_result.hasMetadata || !suppressNoInfo) {
	
		result.appendChild(makeHeader('ways-of-reading'));
		
		// add grid styling to returned div
		ways_result.displayHTML.classList.add('grid-body');

		result.appendChild(ways_result.displayHTML);
	}
	
	// 3.2 Conformance
	
	var conf_result = metaDisplayProcessor.processConformance();
	
	if (conf_result.hasMetadata || !suppressNoInfo) {
	
		result.appendChild(makeHeader('conformance'));
		
		// add grid styling to returned div
		conf_result.displayHTML.classList.add('grid-body');

		result.appendChild(conf_result.displayHTML);
	}
	
	// 3.3 Navigation
	
	var nav_result = metaDisplayProcessor.processNavigation();
	
	if (nav_result.hasMetadata || !suppressNoInfo) {
	
		result.appendChild(makeHeader('navigation'));
		
		// add grid styling to returned div
		nav_result.displayHTML.classList.add('grid-body');

		result.appendChild(nav_result.displayHTML);
	}
	
	// 3.4 Rich content
	
	var rc_result = metaDisplayProcessor.processRichContent();
	
	if (rc_result.hasMetadata || !suppressNoInfo) {
	
		result.appendChild(makeHeader('rich-content'));
		
		// add grid styling to returned div
		rc_result.displayHTML.classList.add('grid-body');

		result.appendChild(rc_result.displayHTML);
	}
	
	// 3.5 Hazards
	
	var hazard_result = metaDisplayProcessor.processHazards();
	
	if (hazard_result.hasMetadata || !suppressNoInfo) {
	
		result.appendChild(makeHeader('hazards'));
		
		// add grid styling to returned div
		hazard_result.displayHTML.classList.add('grid-body');

		result.appendChild(hazard_result.displayHTML);
	}
	
	// 3.6 Accessibility summary
	
	var sum_result = metaDisplayProcessor.processAccessibilitySummary();
	
	if (sum_result.hasMetadata || !suppressNoInfo) {
	
		result.appendChild(makeHeader('accessibility-summary'));
		
		// add grid styling to returned div
		sum_result.displayHTML.classList.add('grid-body');

		result.appendChild(sum_result.displayHTML);
	}
	
	// 3.7 Legal considerations
	
	var legal_result = metaDisplayProcessor.processLegal();
	
	if (legal_result.hasMetadata || !suppressNoInfo) {
	
		result.appendChild(makeHeader('legal-considerations'));
		
		// add grid styling to returned div
		legal_result.displayHTML.classList.add('grid-body');

		result.appendChild(legal_result.displayHTML);
	}
	
	// 3.8 Additional accessibility information
	
	var aai_result = metaDisplayProcessor.processAdditionalA11yInfo();
	
	// additional information is never shown if there is nothing to display - it doesn't have a no information available string
	if (aai_result.hasMetadata) {
	
		result.appendChild(makeHeader('additional-accessibility-information'));
		
		// add grid styling to returned div
		aai_result.displayHTML.classList.add('grid-body');

		result.appendChild(aai_result.displayHTML);
	}
	
	
	if (result) {
		result_field.appendChild(result);
		result_dialog.showModal();
	}
}



/* common header and explainer dialog */

function makeHeader(id, expl_id) {

	var hd_block = document.createElement('div');
		hd_block.classList.add('grid-hd');
	
	var hd_str = metaDisplayProcessor.getHeader(id, '');
	
	var hd = document.createElement('h3');
		hd.appendChild(document.createTextNode(hd_str));
	hd_block.appendChild(hd);
	
	if (expl_id) {
		hd_block.appendChild(writeExplainerLink(expl_id));
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


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


var result_save_button = document.getElementById("result-save-button");

result_save_button.addEventListener("click", () => {
	saveResult();
});


/* process input metadata */

function processRecord() {

	console.clear();
	
	var xml = document.getElementById('input_record').value;
	
	if (!metaDisplayProcessor.initialize({
			record_as_text: xml
		})) {
		return;
	}
	
	showDisplayMetadata(false, 'html');
	
	// set the language field in the viewer
	document.getElementById('lang').value = metaDisplayProcessor.getLanguage();
}

function reprocessRecord() {

	console.clear();
	
	var lang = document.getElementById('lang').value;
	
	var mode = document.getElementById('mode').value;

	var format = document.getElementById('format').value;

	if (!metaDisplayProcessor.reinitialize({
			lang: lang,
			mode: mode,
			format: format
		})) {
		return;
	}
	
	var suppressNoInfo = document.getElementById('no-info').value == 'hide' ? true : false;
	
	showDisplayMetadata(suppressNoInfo, format);

}

function showDisplayMetadata(suppressNoInfo, output_format) {

	// reset the result pane
	var result_field = document.getElementById('result-body');
		result_field.textContent = '';
	
	var result;
	
	if (output_format === 'html') {
		result = document.createElement('div');
		result.classList.add('grid');
	}
	
	else {
		
		var pub_meta = metaDisplayProcessor.processGeneralInfo();
		
		result = '{';
		result += '\n\t"about": {';
		result += '\n\t\t"title": "' + pub_meta.title + '",';
		result += '\n\t\t"publisher": "' + pub_meta.publisher + '",';
		result += '\n\t\t"language": "' + pub_meta.lang + '",';
		result += '\n\t\t"generator": {'
		result += '\n\t\t\t"name": "DAISY Accessibility Metadata Viewer",';
		result += '\n\t\t\t"version": "0.1.0",';
		result += '\n\t\t\t"created": "' + new Date().toISOString() + '"';
		result += '\n\t\t},'
		result += '\n\t\t"localization": {';
		result += '\n\t\t\t"creator": "' + pub_meta.translation.creator + '",';
		result += '\n\t\t\t"language": "' + pub_meta.translation.lang + '",';
		result += '\n\t\t\t"version": "' + pub_meta.translation.version + '"';
		result += '\n\t\t}'
		result += '\n\t},'
	}
	
	// 3.1 Ways of reading
	
	var ways_result = metaDisplayProcessor.processWaysOfReading();
	
	if (ways_result.hasMetadata || !suppressNoInfo) {
	
		var id = 'ways-of-reading';
		
		var hd = makeHeader(id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, hd, ways_result.display);
		}
		else {
			result += formatJSON(id, hd, ways_result.display);
		}
	}
	
	// 3.2 Conformance
	
	var conf_result = metaDisplayProcessor.processConformance();
	
	if (conf_result.hasMetadata || !suppressNoInfo) {
		var id = 'conformance';
		
		var hd = makeHeader(id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, hd, conf_result.display);
		}
		else {
			result += "," + formatJSON(id, hd, conf_result.display);
		}
	}
	
	// 3.3 Navigation
	
	var nav_result = metaDisplayProcessor.processNavigation();
	
	if (nav_result.hasMetadata || !suppressNoInfo) {
	
		var id = 'navigation';
		
		var hd = makeHeader(id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, hd, nav_result.display);
		}
		else {
			result += "," + formatJSON(id,hd, nav_result.display);
		}
	}
	
	// 3.4 Rich content
	
	var rc_result = metaDisplayProcessor.processRichContent();
	
	if (rc_result.hasMetadata || !suppressNoInfo) {
	
		var id = 'rich-content';
		
		var hd = makeHeader(id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, hd, rc_result.display);
		}
		else {
			result += "," + formatJSON(id, hd, rc_result.display);
		}
	}
	
	// 3.5 Hazards
	
	var hazard_result = metaDisplayProcessor.processHazards();
	
	if (hazard_result.hasMetadata || !suppressNoInfo) {
	
		var id = 'hazards';
		
		var hd = makeHeader(id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, hd, hazard_result.display);
		}
		else {
			result += "," + formatJSON(id, hd, hazard_result.display);
		}
	}
	
	// 3.6 Accessibility summary
	
	var sum_result = metaDisplayProcessor.processAccessibilitySummary();
	
	if (sum_result.hasMetadata || !suppressNoInfo) {
	
		var id = 'accessibility-summary';
		
		var hd = makeHeader(id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, hd, sum_result.display);
		}
		else {
			result += "," + formatJSON(id, hd, sum_result.display);
		}
	}
	
	// 3.7 Legal considerations
	
	var legal_result = metaDisplayProcessor.processLegal();
	
	if (legal_result.hasMetadata || !suppressNoInfo) {
	
		var id = 'legal-considerations';
		
		var hd = makeHeader(id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, hd, legal_result.display);
		}
		else {
			result += "," + formatJSON(id, hd, legal_result.display);
		}
	}
	
	// 3.8 Additional accessibility information
	
	var aai_result = metaDisplayProcessor.processAdditionalA11yInfo();
	
	// additional information is never shown if there is nothing to display - it doesn't have a no information available string
	if (aai_result.hasMetadata) {
	
		var id = 'additional-accessibility-information';
		
		var hd = makeHeader(id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, hd, aai_result.display);
		}
		else {
			result += "," + formatJSON(id, hd, aai_result.display);
		}
	}
	
	
	// Translation metadata
	/* 
	var meta_result = metaDisplayProcessor.processTranslationMetadata();
	
	var meta_hd = makeHeader('metadata', output_format);
	
	if (output_format === 'html') {
		formatHTML(result, hd, meta_result.display);
	}
	else {
		result += "," + formatJSON(id, hd, meta_result.display);
	}
	*/
	
	if (result) {
		if (output_format === 'html') {
			result_field.appendChild(result);
		}
		else {
			var pre = document.createElement('pre');
				pre.innerHTML = result + '\n}';
			result_field.appendChild(pre);
		}
		result_dialog.showModal();
	}
}



/* common header and explainer dialog */

function makeHeader(id, format) {

	var hd_str = metaDisplayProcessor.getHeader(id, '');
	
	if (format === 'json') {
		return JSON.stringify(hd_str);
	}
	
	else {
		var hd_block = document.createElement('div');
			hd_block.classList.add('grid-hd');
		
		var hd = document.createElement('h3');
			hd.appendChild(document.createTextNode(hd_str));
		hd_block.appendChild(hd);
		
		// if (expl_id) {
		// 	hd_block.appendChild(writeExplainerLink(expl_id));
		// }
		
		return hd_block;
	}
}


function formatHTML(result, hd, display) {
	result.appendChild(hd);
	display.classList.add('grid-body');
	result.appendChild(display);
}


function formatJSON(id, hd, statements) {
	return '\n\t"' + id + '": {\n\t\t"title": ' + hd + ',\n\t\t"statements": ' + statements + '\n\t}';
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


/* record selection */

var sel_dialog = document.getElementById('selectRecord');

function selectRecord() {
	sel_dialog.showModal();
}

var selectRecord_close_button = document.getElementById("selectRecord-close-button");
var selectRecord_close_img = document.getElementById("selectRecord-close-img");

selectRecord_close_button.addEventListener('click', () => {
  sel_dialog.close();
});

selectRecord_close_img.addEventListener('click', () => {
  sel_dialog.close();
});



// save the current result display

function saveResult() {

	const isJSON = document.getElementById('format').value === 'json' ? true : false;
	
	let html_head = '<!DOCTYPE html>\n<html lang="' + document.getElementById('lang').value + '>\n<head>\n<meta charset="utf-8">\n<title>Accessibility Statements</title>\n<style>html, body { margin: 0; padding: 2rem; } body { font-family: Calibri,Helvetica,Arial,sans-serif; font-size: 1.2rem; background-color: rgb(251,252,253); color: rgb(0,0,0); line-height: 2.6rem; } h3 { display: inline-block; font-size: 94%; margin: 0; } div.grid-body > h4 { font-size: 94%; font-weight: normal; font-style: italic; margin-top: 4rem; } div.grid { display: grid; grid-template-columns: fit-content(40%) 1fr; gap: 2rem; } div.grid-body > * { font-size: 98%; padding-top: 0; margin-top: 0; } div.grid-body ul { padding-left: 2rem; }</style>\n</head>\n<body>\n';
	
	let html_foot = '</body>\n</html>';
	
	const markupContent = isJSON ? document.querySelector('#result-body > pre').innerHTML : html_head + document.getElementById('result-body').outerHTML + html_foot;
	
	const blob = new Blob([markupContent], { type: (isJSON ? 'text/json' : 'text/html') + ';charset=utf-8' });
	
	const blobUrl = URL.createObjectURL(blob);
	
	const anchor = document.createElement('a');
		anchor.href = blobUrl;
		anchor.download = isJSON ? 'result.json' : 'result.html';
	
	document.body.appendChild(anchor);
	
	anchor.click();
	
	document.body.removeChild(anchor);
	URL.revokeObjectURL(blobUrl);
}




async function loadRecord(record_file) {

	const response = await fetch('./samples/' + record_file);
	
	const record = await response.text();
	
	document.getElementById('input_record').value = record;
	
	sel_dialog.close();

}


/* result dialog */

const result_dialog = document.getElementById('result');
const result_close_button = document.getElementById("result-close-button");
const result_close_img = document.getElementById("result-close-img");

result_close_button.addEventListener("click", () => {
	closeResult();
});

result_close_img.addEventListener("click", () => {
	closeResult();
});


const result_save_button = document.getElementById("result-save-button");

result_save_button.addEventListener("click", () => {
	saveResult();
});


/* process input metadata */

function processRecord() {

	console.clear();
	
	const xml = document.getElementById('input_record').value;
	
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
	
	const lang = document.getElementById('lang').value;
	
	const mode = document.getElementById('mode').value;

	const format = document.getElementById('format').value;

	if (!metaDisplayProcessor.reinitialize({
			lang: lang,
			mode: mode,
			format: format
		})) {
		return;
	}
	
	const suppressNoInfo = document.getElementById('no-info').value == 'hide' ? true : false;
	
	showDisplayMetadata(suppressNoInfo, format);

}

function showDisplayMetadata(suppressNoInfo, output_format) {

	// reset the result pane
	const result_field = document.getElementById('result-body');
		result_field.textContent = '';
	
	let result = '';
	
	if (output_format === 'html') {
		result = document.createElement('div');
		result.classList.add('grid');
	}
	
	else {
		
		const pub_meta = metaDisplayProcessor.processGeneralInfo();
		
		result = '{';
		result += '\n\t"about": {';
			result += '\n\t\t"created": "' + new Date().toISOString() + '",';
			result += formatJSONBlock('generator', {name: 'DAISY Accessibility Metadata Viewer', version: '0.1.0'}, 2, true);
			result += formatJSONBlock('localization', {creator: pub_meta.translation.creator, language: pub_meta.translation.lang, version: pub_meta.translation.version}, 2, true);
			result += formatJSONBlock('publication', {title: pub_meta.pub.title, identifier: pub_meta.pub.id, publisher: pub_meta.pub.publisher, language: pub_meta.pub.lang}, 2, false);
		result += '\n\t},'
	}
	
	// 3.1 Ways of reading
	
	const ways_result = metaDisplayProcessor.processWaysOfReading();
	
	if (ways_result.hasMetadata || !suppressNoInfo) {
	
		const ways_id = 'ways-of-reading';
		
		const ways_hd = makeHeader(ways_id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, ways_hd, ways_result.display);
		}
		else {
			result += formatJSON(ways_id, ways_hd, ways_result.display);
		}
	}
	
	// 3.2 Conformance
	
	const conf_result = metaDisplayProcessor.processConformance();
	
	if (conf_result.hasMetadata || !suppressNoInfo) {
		const conf_id = 'conformance';
		
		const conf_hd = makeHeader(conf_id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, conf_hd, conf_result.display);
		}
		else {
			result += "," + formatJSON(conf_id, conf_hd, conf_result.display);
		}
	}
	
	// 3.3 Navigation
	
	const nav_result = metaDisplayProcessor.processNavigation();
	
	if (nav_result.hasMetadata || !suppressNoInfo) {
	
		const nav_id = 'navigation';
		
		const nav_hd = makeHeader(nav_id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, nav_hd, nav_result.display);
		}
		else {
			result += "," + formatJSON(nav_id, nav_hd, nav_result.display);
		}
	}
	
	// 3.4 Rich content
	
	const rc_result = metaDisplayProcessor.processRichContent();
	
	if (rc_result.hasMetadata || !suppressNoInfo) {
	
		const rc_id = 'rich-content';
		
		const rc_hd = makeHeader(rc_id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, rc_hd, rc_result.display);
		}
		else {
			result += "," + formatJSON(rc_id, rc_hd, rc_result.display);
		}
	}
	
	// 3.5 Hazards
	
	const hazard_result = metaDisplayProcessor.processHazards();
	
	if (hazard_result.hasMetadata || !suppressNoInfo) {
	
		const haz_id = 'hazards';
		
		const haz_hd = makeHeader(haz_id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, haz_hd, hazard_result.display);
		}
		else {
			result += "," + formatJSON(haz_id, haz_hd, hazard_result.display);
		}
	}
	
	// 3.6 Accessibility summary
	
	const sum_result = metaDisplayProcessor.processAccessibilitySummary();
	
	if (sum_result.hasMetadata || !suppressNoInfo) {
	
		const sum_id = 'accessibility-summary';
		
		const sum_hd = makeHeader(sum_id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, sum_hd, sum_result.display);
		}
		else {
			result += "," + formatJSON(sum_id, sum_hd, sum_result.display);
		}
	}
	
	// 3.7 Legal considerations
	
	const legal_result = metaDisplayProcessor.processLegal();
	
	if (legal_result.hasMetadata || !suppressNoInfo) {
	
		const legal_id = 'legal-considerations';
		
		const legal_hd = makeHeader(legal_id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, legal_hd, legal_result.display);
		}
		else {
			result += "," + formatJSON(legal_id, legal_hd, legal_result.display);
		}
	}
	
	// 3.8 Additional accessibility information
	
	const aai_result = metaDisplayProcessor.processAdditionalA11yInfo();
	
	// additional information is never shown if there is nothing to display - it doesn't have a no information available string
	if (aai_result.hasMetadata) {
	
		const aai_id = 'additional-accessibility-information';
		
		const aai_hd = makeHeader(aai_id, output_format);
		
		if (output_format === 'html') {
			formatHTML(result, aai_hd, aai_result.display);
		}
		else {
			result += "," + formatJSON(aai_id, aai_hd, aai_result.display);
		}
	}
	
	
	if (result) {
		if (output_format === 'html') {
			result_field.appendChild(result);
		}
		else {
			const pre = document.createElement('pre');
				pre.innerHTML = result + '\n}';
			result_field.appendChild(pre);
		}
		result_dialog.showModal();
	}
}



/* common header and explainer dialog */

function makeHeader(id, format) {

	const hd_str = metaDisplayProcessor.getHeader(id, '');
	
	if (format === 'json') {
		return JSON.stringify(hd_str);
	}
	
	else {
		const hd_block = document.createElement('div');
			hd_block.classList.add('grid-hd');
		
		const hd = document.createElement('h3');
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


function formatJSONBlock(name, properties, tabs, comma) {

	let indent = '\n';
	
	for (let i = 1; i <= tabs; i++) {
		indent += '\t';
	}
	
	let json = indent + '"' + name + '": {';
	
	const props = Object.keys(properties);
	const lastProperty = props[props.length - 1];
	
	for (let property of Object.keys(properties)) {
		
		if (properties[property]) {
			json += indent + '\t"' + property + '": ' + JSON.stringify(properties[property]);
			
			if (property !== lastProperty) {
				json += ',';
			}
		}
		
		else {
			if (property === lastProperty) {
				json = json.replace(/,$/, '');
			}
		}
	}
	
	json += '\n\t\t}';
	
	if (comma) {
		json += ',';
	}
	
	return json;

}


function writeExplainerLink(id) {
	const a = document.createElement('a');
		a.href = '#';
		a.classList.add('explainer-link');
		a.onclick = function () { showExplainer(id); return false; }
		a.title = 'Show explainer for this field';
	
	const img = document.createElement('img');
		img.src = 'graphics/info.png';
		img.alt = 'Show explainer for this field';
		img.onmouseover = function () { this.src = 'graphics/info_hover.png' }
		img.onmouseout = function () { this.src = 'graphics/info.png' }
	
	a.appendChild(img);
	
	return a;
}

const explainer_dialog = document.getElementById("explainer");

function showExplainer(id) {
	const expl_body = document.getElementById("explainer-body");
		expl_body.innerHTML = document.getElementById(id).innerHTML;
	explainer_dialog.showModal();
}

const explainer_close_button = document.getElementById("explainer-close-button");
const explainer_close_img = document.getElementById("explainer-close-img");

explainer_close_button.addEventListener('click', () => {
  explainer_dialog.close();
});

explainer_close_img.addEventListener('click', () => {
  explainer_dialog.close();
});


/* record selection */

const sel_dialog = document.getElementById('selectRecord');

function selectRecord() {
	sel_dialog.showModal();
}

const selectRecord_close_button = document.getElementById("selectRecord-close-button");
const selectRecord_close_img = document.getElementById("selectRecord-close-img");

selectRecord_close_button.addEventListener('click', () => {
  sel_dialog.close();
});

selectRecord_close_img.addEventListener('click', () => {
  sel_dialog.close();
});



// close the result dialog and reset the configuration options

function closeResult() {
	document.getElementById('result').close();
	document.getElementById('mode').value = 'compact';
	document.getElementById('format').value = 'html';
	document.getElementById('no-info').value = 'show';
}



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

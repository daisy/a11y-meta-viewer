
const metadataViewer = (function() {

	/* process input metadata */
	
	function processRecord(save) {
	
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
		
		if (save) {
			saveResult();
		}
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
		const html_header = document.createElement('div');
			html_header.classList.add('pub');
		
		const pub_meta = metaDisplayProcessor.processGeneralInfo();
		
		if (output_format === 'html') {
			const pub_h2 = document.createElement('h3');
				pub_h2.appendChild(document.createTextNode(pub_meta.pub.title));
			
			html_header.appendChild(pub_h2);
			
			if (pub_meta.pub.publisher || pub_meta.pub.id) {
				const pub_label = document.createElement('div');
					pub_label.classList.add('sub');
				
				const pub_identifier = pub_meta.pub.id ? pub_meta.pub.id.replace(/urn:[^:]+:/i, '') : '';
				
				if (pub_meta.pub.publisher && pub_identifier) {
					pub_label.innerHTML = pub_meta.pub.publisher + ' &#8212; ' + pub_identifier;
				}
				
				else {
					// formatting doesn't matter as only one actually has a value
					pub_label.innerHTML = pub_meta.pub.publisher + pub_identifier;
				}
					
				html_header.appendChild(pub_label);
			}
			
			result = document.createElement('div');
			result.classList.add('grid');
		}
		
		else {
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
				result_field.appendChild(html_header);
				result_field.appendChild(result);
			}
			else {
				const pre = document.createElement('pre');
					pre.innerHTML = result + '\n}';
				result_field.appendChild(pre);
			}
			
			document.getElementById('result').showModal();
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

	return {
		process: function() {
			return processRecord();
		},
		
		reprocess: function() {
			return reprocessRecord();
		}
	}

})();

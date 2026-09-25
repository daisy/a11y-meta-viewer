/* validate input metadata */

var _isONIX = false;

var _errors = [];
var _warnings = [];

var _hazards;
var _conformance;

const escapeHtml = unsafe => {
	return unsafe
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(/ xmlns="[^"]+"/g, '');
};



function validateRecord() {

	console.clear();
	
	_errors = [];
	_warnings = [];
	
	resetVariables();
	
	var xml = document.getElementById('input_record').value;
	
	if (!xml) {
		alert('No metadata provided.');
		return;
	}
	
	var record;
	
	try {
		var parser = new DOMParser();
		record = parser.parseFromString(xml, "text/xml");
	}
	
	catch (e) {
		alert('Error parsing metadata record: ' + e);
		record = null;
	}
	
	if (!record) {
		return;
	}
	
	var root = record.documentElement;
	var input_format = 'epub3';
	
	if (root.nodeName == 'package') {
		_isONIX = false;
		input_format = root.getAttribute('version') == '2.0' ? 'epub2' : input_format;
		validateEPUB(record, input_format);
	}
	
	else if (root.nodeName == 'ONIXMessage') {
		_isONIX = true;
		validateONIX(record);
	}
	
	else {
		_errors.push('Invalid xml document - package or onix root element not found');
	}
	
	displayResult();
	
}



function validateEPUB(record, input_format) {

	evalidate('conformsTo', ['required', 'duplicates', 'claim'], input_format, record);
	
	evalidate('certifiedBy', ['required', 'duplicates'], input_format, record);
	
	evalidate('accessibilityFeature', ['required', 'single', 'duplicates', 'terms'], input_format, record);
	
	evalidate('accessModeSufficient', ['required', 'duplicates', 'terms'], input_format, record);
	
	evalidate('accessibilityHazard', ['required', 'single', 'duplicates', 'terms'], input_format, record);
	
	evalidate('accessMode', ['recommended', 'single', 'duplicates', 'terms'], input_format, record);
	
	evalidate('accessibilitySummary', ['recommended', 'duplicates'], input_format, record);

	evalidate('contactEmail', ['duplicates', 'single', 'email'], input_format, record);

}


var terms = {};

	terms.accessibilityFeature = [ 'ARIA', 'index', 'pageBreakMarkers', 'printPageNumbers', 'pageNavigation',
			'readingOrder', 'structuralNavigation', 'tableOfContents', 'taggedPDF', 'alternativeText',
			'audioDescription', 'closedCaptions', 'describedMath', 'longDescription', 'openCaptions',
			'signLanguage', 'transcript', 'displayTransformability', 'synchronizedAudioText', 'timingControl',
			'unlocked', 'ChemML', 'latex', 'latex-chemistry', 'MathML', 'MathML-chemistry', 'ttsMarkup',
			'highContrastAudio', 'highContrastDisplay', 'largePrint', 'braille', 'tactileGraphic', 'tactileObject', 
			'fullRubyAnnotations', 'horizontalWriting', 'rubyAnnotations', 'verticalWriting', 
			'withAdditionalWordSegmentation', 'withoutAdditionalWordSegmentation', 'none', 'unknown' ];

	terms.accessibilityFeature_lc = terms.accessibilityFeature.map(item => item.toLowerCase());
	terms.accessibilityFeature_deprecated = [ 'annotations',  'bookmarks',  'captions' ];

	terms.accessModeSufficient = ['textual', 'visual', 'auditory', 'tactile'];
	terms.accessModeSufficient_lc = terms.accessModeSufficient.map(item => item.toLowerCase());

	terms.accessibilityHazard = ['flashing', 'motionSimulation', 'sound', 'none', 'unknown',
						'noFlashingHazard', 'noMotionSimulationHazard', 'noSoundHazard',
						'unknownFlashingHazard', 'unknownMotionSimulationHazard', 'unknownSoundHazard'];
	terms.accessibilityHazard_lc = terms.accessibilityHazard.map(item => item.toLowerCase());
	
	terms.accessMode = ['textual', 'visual', 'auditory', 'tactile', 'chartOnVisual', 'chemOnVisual',
						'colorDependent', 'diagramOnVisual', 'mathOnVisual', 'musicOnVisual', 'textOnVisual'];
	terms.accessMode_lc = terms.accessMode.map(item => item.toLowerCase());
	


// epub validation routines

function evalidate(property, checks, format, record) {

	// get all matching property declarations
	
	var xpath = epub[property][format];
	
	var nodes = record.evaluate( xpath, record, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	
	
	// check for one or more instance of a property
	
	if (checks.includes('required') && !nodes) {
		_errors.push(messages[property]['required']);
		return;
	}
	
	else if (checks.includes('recommended') && !nodes) {
		_warnings.push(messages[property]['recommended']);
		return;
	}
	
	
	// value checks to run
	let check = {};
		check.terms = checks.includes('terms');
		check.claim = checks.includes('claim');
		check.email = checks.includes('email');
		check.single = checks.includes('single');
	
	let valid_claim = false;
	let ams_arrays = [];
	let found = [];
	
	for (var i = 0; i < nodes.snapshotLength; i++) {
	
		const value = nodes.snapshotItem(i).textContent.trim();
		
		if (check.terms) {
		
			if (!terms[property].includes(value)) {
			
				if (terms.hasOwnProperty(property+'_lc') && terms[property+'_lc'].includes(value.toLowerCase())) {
					
					let correct_spelling = '';
					
					for (term of terms[property]) {
						if (term.toLowerCase() === value.toLowerCase()) {
							correct_spelling = term;
							break;
						}
					}
					
					_warnings.push(messages[property]['spelling'].replace('%var%', escapeHtml(value)).replace('%val%', correct_spelling));
				}
				
				else {
					_warnings.push(messages[property]['unknown'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
				}
			}
			
			else if (terms.hasOwnProperty(property+'_deprecated') && terms[property+'_deprecated'].includes(value.toLowerCase())) {
				_warnings.push(messages[property]['deprecated'].replace('%var%', escapeHtml(value)));
			}
		}
		
		
		if (check.claim) {
		
			if (value.match('EPUB Accessibility 1\.[12] - WCAG 2\.[0-2] Level A{1,3}')
				|| value.match('http://www\.idpf\.org/epub/a11y/accessibility-20170105.html#wcag-a{1,3}')) {
				valid_claim = true;
			}
		}
		
		if (check.email) {
			checkEmail(value);
		}
		
		if (check.single) {
			if (value.match(/[\s,]/)) {
				_errors.push(messages['general']['single'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
			}
		}
		
		
		// check for duplicates
		
		if (found.includes(value.toLowerCase())) {
			if (property === 'accessibilitySummary') {
				_warnings.push(messages[property]['duplicates']);
			}
			
			else {
				_warnings.push(messages[property]['duplicates'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
			}
		}
		
		else {
			found.push(value.toLowerCase());
		}
		
		
		// compile values for property-specific checks
		
		if (property === 'accessModeSufficient') {
			if (value.match(/\s/) && !value.match(/,/)) {
				_errors.push(messages[property]['separator'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
			}
			var arr = value.split(/[\s,]+/);
			ams_arrays.push(arr);
		}
		
		else if (property === 'accessibilityHazard') {
			var hazard = value.toLowerCase();
			if (_hazards.hasOwnProperty(hazard)) {
				_hazards[hazard] = true;
			}
		}
	}
	
	if (check.claim) {
		if (!valid_claim) {
			_errors.push(messages[property]['claim']);
		}
	}
	
	if (property === 'accessibilityFeature') {
		checkFeatureConsistency(found);
	}
	
	if (property === 'accessModeSufficient' && ams_arrays.length > 0) {
		
		const arraysEqualIgnoreOrder = (a, b) => {
			if (a.length !== b.length) return false;
			
			const sortedA = [...a].sort();
			const sortedB = [...b].sort();
			
			return sortedA.every((val, index) => val === sortedB[index]);
		};
		
		for (var i = 0; i < ams_arrays.length; i++) {
			
			// check for identical sets in same or different order
			for (var k = i+1; k < ams_arrays.length; k++) {
				if (arraysEqualIgnoreOrder(ams_arrays[i], ams_arrays[k])) {
					_errors.push(messages[property]['duplicates'].replace('%var%', escapeHtml(ams_arrays[k])));
				}
			}
		}
	}
	
	if (property === 'accessibilityHazard') {
		checkHazards();
	}
}



function checkEmail(email) {
	var input = document.getElementById('email');
		input.value = email;
	
	if (! (typeof input.checkValidity === 'function' ? input.checkValidity() : /\S+@\S+\.\S+/.test(email))) {
		_errors.push(messages['contactEmail']['email']);
	}
}







function validateONIX(record) {

	ovalidate('conformsTo', ['required'], record);
	ovalidate('certifiedBy', ['required'], record);
	ovalidate('accessibilityFeature', ['required'], record);
	ovalidate('accessModeSufficient', ['required'], record);
	ovalidate('accessibilityHazard', ['required'], record);
	ovalidate('accessMode', ['recommended'], record);
	ovalidate('accessibilitySummary', ['recommended'], record);
	ovalidate('contactEmail', ['email'], record);

}


let map = {};

	map.hazards = {
		'1200': 'none',
		'1213': 'flashing',
		'1214': 'noFlashingHazard',
		'1224': 'unknownFlashingHazard',
		'1217': 'motionSimulation',
		'1218': 'noMotionSimulationHazard',
		'1226': 'unknownMotionSimulationHazard',
		'1215': 'sound',
		'1216': 'noSoundHazard',
		'1225': 'unknownSoundHazard',
		'0908': 'unknown'
	};

	map.features = {
		'0914': 'alternativeText',
		'0930': 'ARIA',
		'V215': 'audioDescription',	
		'0918': 'ChemML',
		'V210': 'closedCaptions',	
		'0953': 'describedMath',
		'0936': 'displayTransformability',
		'0927': 'highContrastAudio',
		'0937': 'highContrastDisplay',
		'0912': 'index',
		'LTE': 'largePrint',
		'UTP': 'largePrint',
		'0935': 'latex',
		'0954': 'latex-chemsitry',
		'0915': 'longDescription',
		'0916': 'longDescription',
		'0917': 'MathML',
		'0934': 'MathML-chemistry',
		'0909': 'none',
		'0919': 'pageBreakMarkers',
		'0941': 'pageNavigation',
		'0913': 'readingOrder',
		'V213': 'signLanguage',
		'0929': 'structuralNavigation',
		'0920': 'synchronizedAudioText',
		'0911': 'tableOfContents',
		'0905': 'taggedPDF',
		'0906': 'taggedPDF',
		'V212': 'transcript',
		'0921': 'ttsMarkup',
		'0908': 'unknown',
		'00': 'unlocked',
		'0931': 'noequiv',
		'0932': 'noequiv',
		'0925': 'noequiv',
		'0922': 'noequiv',
		'0924': 'noequiv',
		'0910': 'noequiv',
		'0938': 'noequiv',
		'0939': 'noequiv',
		'0940': 'noequiv'
	};


function ovalidate(property, checks, record) {

	var nodes = getNodes(property, record);
	
	if (nodes.length === 0) {
		
		if (property === 'accessModeSufficient') {
			_errors.push(messages['accessModeSufficient']['oreq'])
		}
		
		else if (checks.includes('required')) {
			_errors.push(messages[property]['required']);
		}
		
		else if (checks.includes('recommended')) {
			_warnings.push(messages[property]['recommended']);
		}
		
		return;
	}
	
	let found = [];
	
	nodes.forEach(function(node) {
		
		let type = '';
		let value = '';
		let desc = '';
		
		if (node.tagName === 'ProductFormFeature') {
		
			type = node.querySelector('ProductFormFeatureType')
			
			if (type) {
				type = type.textContent.trim();
			}
			
			value = node.querySelector('ProductFormFeatureValue');
			
			if (value) {
				value = value.textContent.trim();
			}
			
			desc = node.querySelector('ProductFormFeatureDescription');
			
			if (desc) {
				desc = desc.textContent.trim();
			}
		}
		
		else {
			value = node.textContent.trim();
		}
		
		const id = (type && value) ? type + value : value;
		
		if (property === 'conformsTo') {
			if (_conformance.hasOwnProperty(id)) {
				if (_conformance[id]) {
					_warnings.push(messages['conformsTo']['onixdup'].replace('%var%', escapeHtml(value)));
				}
				else {
					_conformance[id] = true;
				}
			}
		}
		
		else if (property === 'certifiedBy') {
			if (found.includes(desc.toLowerCase())) {
				_warnings.push(messages['certifiedBy']['duplicates'].replace('%var%', escapeHtml(desc)));
			}
			else {
				found.push(desc.toLowerCase());
			}
		}
		
		else if (property === 'accessibilityFeature') {
			if (found.includes(map.features[id])) {
				_warnings.push(messages['accessibilityFeature']['duplicates'].replace('%tag%', '<code>' + escapeHtml(node.outerHTML) + '</code>'));
			}
			else {
				found.push(map.features[id]);
			}
		}
		
		else if (property === 'accessibilityHazard') {
			if (map.hazards.hasOwnProperty(id)) {
				if (_hazards[map.hazards[id]]) {
					_warnings.push(messages['accessibilityHazard']['onixdup'].replace('%var%', escapeHtml(value)));
				}
				else {
					_hazards[map.hazards[id]] = true;
				}
			}
		}
		
		if (property === 'accessibilitySummary') {
			if ((_conformance['0902'] || _conformance['0903']) && value === '92') {
				_errors.push(messages['accessibilitySummary']['summary11for10']);
			}
			
			else if (_conformance['0904'] && value === '00') {
				_errors.push(messages['accessibilitySummary']['summary10for11']);
			}
		}
		
		if (checks.includes('email')) {
			checkEmail(desc);
		}
	});
	
	if (property === 'conformsTo') {
		checkConformance();
	}
	
	if (property === 'accessibilityHazard') {
		checkHazards();
	}
	
	if (property === 'accessibilityFeature') {
		checkFeatureConsistency(found);
	}
}



function getNodes(property, record) {

	var xpaths = onix[property];
	
	var nodes = [];
	
	xpaths.forEach(function(xpath) {
		var matches = record.evaluate( xpath, record, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );
		let node = matches.iterateNext();
		while (node) {
			nodes.push(node);
			node = matches.iterateNext();
		}
	});
	
	return nodes;

}




// resets all hazard statuses

function resetVariables() {
	_conformance = {
		'0902': false,
		'0903': false,
		'0904': false,
		'0908': false,
		'0909': false,
		'0980': false,
		'0981': false,
		'0982': false,
		'0984': false,
		'0985': false,
		'0986': false
	},
	
	_hazards = {
		flashing: false,
		motionsimulation: false,
		sound: false,
		none: false,
		noflashinghazard: false,
		nomotionsimulationhazard: false,
		nosoundhazard: false,
		unknown: false,
		unknownflashinghazard: false,
		unknownmotionsimulationhazard: false
	}
}



// check for invalid or incomplete conformance claims

function checkConformance() {

	let stray_claims = false;
	
	if (_conformance['0908'] || _conformance['0909']) {
	
		if (_conformance['0908'] && _conformance['0909']) {
			_errors.push(messages['conformsTo']['nounknown']);
		}
		
		else {
		
			for (var key of Object.keys(_conformance)) {
				
				if ((key === '0908') || (key === '0909')) {
					continue;
				}
				
				else if (_conformance[key]) {
					if (_conformance['0908']) {
						_errors.push(messages['conformsTo']['unknownmix']);
						break;
					}
					else {
						_errors.push(messages['conformsTo']['inaccessiblemix']);
						break;
					}
				}
			}
		}
	}
	
	else if (_conformance['0902'] || _conformance['0903']) {
	
		if (_conformance['0902'] && _conformance['0903']) {
			_errors.push(messages['conformsTo']['dual10']);
		}
		
		else {
		
			for (var key of Object.keys(_conformance)) {
				
				if ((key === '0902') || (key === '0903')) {
					continue;
				}
				
				else if (_conformance[key]) {
					_errors.push(messages['conformsTo']['epub10mix']);
					break;
				}
			}
		}
	}
	
	else if (_conformance['0904']) {
	
		if (!_conformance['0980'] && !_conformance['0981'] && !_conformance['0982']) {
			_errors.push(messages['conformsTo']['nowcag']);
		}
		
		if (!_conformance['0984'] && !_conformance['0985'] && !_conformance['0986']) {
			_errors.push(messages['conformsTo']['nolevel']);
		}
	}
	
	else {
		_errors.push(messages['conformsTo']['noepub']);
	}
}



// check for conflicting accessibility features

function checkFeatureConsistency(features) {
	
	if (features.includes('none') && features.length > 1) {
		_errors.push(messages['accessibilityFeature']['none_mix']);
	}
	
	if (features.includes('unknown') && features.length > 1) {
		_errors.push(messages['accessibilityFeature']['unknown_mix']);
	}
	
	if (features.includes('withadditionalwordsegmentation') && features.includes('withoutadditionalwordsegmentation')) {
		_errors.push(messages['accessibilityFeature']['seg_mix']);
	}
	
	if (features.includes('horizontalwriting') && features.includes('verticalwriting')) {
		_errors.push(messages['accessibilityFeature']['mode_mix']);
	}
	
	if (features.includes('rubyannotations') && features.includes('fullrubyannotations')) {
		_errors.push(messages['accessibilityFeature']['ruby_mix']);
	}
	
	if (features.includes('taggedpdf')) {
		_errors.push(messages['accessibilityFeature']['pdf']);
	}
}


// check for invalid hazard declaration pairings

function checkHazards() {

	if (_hazards['none']) {
	
		if (_hazards['noflashinghazard'] || _hazards['nomotionsimulationhazard'] || _hazards['nosoundhazard']) {
			_warnings.push(messages['accessibilityHazard']['none_indiv'])
		}
		
		else if (_hazards['flashing'] || _hazards['motionsimulation'] || _hazards['sound'] || _hazards['unknown'] || 
			_hazards['unknownflashinghazard'] || _hazards['unknownmotionsimulationhazard'] || _hazards['unknownsoundhazard']) {
			_errors.push(messages['accessibilityHazard']['none_mix']);
		}
	
	}
	
	if (_hazards['unknown']) {
		
		if (_hazards['unknownflashinghazard'] || _hazards['unknownmotionsimulationhazard'] || _hazards['unknownsoundhazard']) {
			_warnings.push(messages['accessibilityHazard']['unknown_indiv']);
		}
		
		else if (_hazards['flashing'] || _hazards['motionsimulation'] || _hazards['sound'] || _hazards['unknown'] || 
			_hazards['noflashinghazard'] || _hazards['nomotionsimulationhazard'] || _hazards['nosoundhazard']) {
			_errors.push(messages['accessibilityHazard']['unknown_mix']);
		}
	}
	
	if (_hazards['flashing'] && _hazards['noflashinghazard']) {
		_errors.push(messages['accessibilityHazard']['flashing_none']);
	}
	
	if (_hazards['flashing'] && _hazards['unknownflashinghazard']) {
		_errors.push(messages['accessibilityHazard']['flashing_unknown']);
	}
	
	if (_hazards['noflashinghazard'] && _hazards['unknownflashinghazard']) {
		_errors.push(messages['accessibilityHazard']['noflashing_unknown']);
	}
	
	if (_hazards['motionsimulation'] && _hazards['nomotionsimulationhazard']) {
		_errors.push(messages['accessibilityHazard']['motion_none']);
	}
	
	if (_hazards['motionsimulation'] && _hazards['unknownmotionsimulationhazard']) {
		_errors.push(messages['accessibilityHazard']['motion_unknown']);
	}
	
	if (_hazards['nomotionsimulationhazard'] || _hazards['unknownmotionsimulationhazard']) {
		_errors.push(messages['accessibilityHazard']['nomotion_unknown']);
	}
	
	if (_hazards['sound'] && _hazards['nosoundhazard']) {
		_errors.push(messages['accessibilityHazard']['sound_none']);
	}
	
	if (_hazards['sound'] && _hazards['unknownsoundhazard']) {
		_errors.push(messages['accessibilityHazard']['sound_unknown']);
	}
	
	if (_hazards['nosoundhazard'] || _hazards['unknownsoundhazard']) {
		_errors.push(messages['accessibilityHazard']['nosound_unknown']);
	}
}



// namespace resolver for the JS xpath processor
function nsResolver(prefix) {
	switch (prefix) {
		case 'xml':
			return 'http://www.w3.org/XML/1998/namespace';
		case 'dc':
			return 'http://purl.org/dc/elements/1.1/';
		case 'onix':
			return "http://ns.editeur.org/onix/3.0/reference";
		case 'opf':
			return "http://www.idpf.org/2007/opf";
	}
}




function displayResult() {

	let err_div = document.getElementById('validation-result');
	
	let h2 = err_div.parentNode.querySelector('h2');
		h2.classList = '';
	
	let result = '';
	
	if (_errors.length || _warnings.length) {
	
		if (_errors.length) {
			result += '<p>The following errors were found:</p>';
			result += '<ul>';
			_errors.forEach(function (err) {
				result += '<li>' + err + '</li>';
			});
			result += '</ul>';
		}
		
		if (_warnings.length) {
			result += '<p>The following warnings were found:</p>';
			result += '<ul>';
			_warnings.forEach(function (warn) {
				result += '<li>' + warn + '</li>';
			})
			result += '</ul>';
		}
		
		result += '</ul>';
		h2.classList.add('fail');
	}
	
	else {
		result = '<p>No errors or warnings found.</p>';
		h2.classList.add('pass');
	}
	
	result += '<p class="disclaimer">Note: Validation is limited to accessibility metadata checks. Other errors and warnings may exist in the metadata.</p>'
	
	err_div.innerHTML = result;
	err_div.parentNode.removeAttribute('hidden');
	err_div.parentNode.scrollIntoView();

}

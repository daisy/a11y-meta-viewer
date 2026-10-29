/* validate input metadata */

let _format = '';

let _record = null;

let _msg = {};

let _hazards = {};
let _conformance = {};
let _certifier = false;

const escapeHtml = unsafe => {
	return unsafe
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(/ xmlns="[^"]+"/g, '');
};



function validateRecord() {

	resetVariables();
	
	const xml = document.getElementById('input_record').value;
	
	if (!xml) {
		alert('No metadata provided.');
		return;
	}
	
	try {
		const parser = new DOMParser();
		_record = parser.parseFromString(xml, "text/xml");
		
		const parserError = _record.getElementsByTagName("parsererror");
		
		if (parserError.length > 0) {
			const error = parserError[0].textContent.replace(/This page.*?:/, '').replace(/Below is a.*/, '');
			_msg.errors.push('Error parsing xml: ' + error);
		}
	}
	
	catch (e) {
		alert('Error parsing metadata record: ' + e);
		_record = null;
	}
	
	if (!_record) {
		return;
	}
	
	const root = _record.documentElement;
	
	if (root.nodeName == 'package') {
		_format = root.getAttribute('version') == '2.0' ? 'epub2' : 'epub3';
		validateEPUB();
	}
	
	else if (root.nodeName == 'ONIXMessage') {
		_format = 'onix';
		validateONIX();
	}
	
	else {
		_msg.errors.push('Invalid xml document - package or onix root element not found');
	}
	
	displayResult();
	
}



function validateEPUB() {

	evalidate('conformsTo', ['required', 'duplicates', 'claim']);
	
	evalidate('certifiedBy', ['required', 'duplicates']);
	
	evalidate('certifierCredential', ['duplicates']);
	
	evalidate('certifierReport', ['duplicates', 'url']);
	
	evalidate('accessibilityFeature', ['required', 'single', 'duplicates', 'terms']);
	
	evalidate('accessModeSufficient', ['required']);
	
	evalidate('accessibilityHazard', ['required', 'single', 'duplicates', 'terms']);
	
	evalidate('accessMode', ['recommended', 'single', 'duplicates', 'terms']);
	
	evalidate('accessibilitySummary', ['recommended', 'duplicates']);

	evalidate('contactEmail', ['duplicates', 'single', 'email']);

	evalidate('a11y', []);

	evalidate('accessibilityAPI', ['deprecated', 'single', 'duplicates', 'terms']);

	evalidate('accessibilityControl', ['deprecated', 'single', 'duplicates', 'terms']);
}


const terms = {};

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
	
	terms.accessibilityAPI = ['AndroidAccessibility', 'ATK', 'AT-SPI', 'FuchsiaAccessibility', 'iAccessible2',
								'JavaAccessibility', 'MSAA', 'NSAccessibility', 'UIAccessibility', 'UIAutomation'];
	terms.accessibilityAPI_lc = terms.accessibilityAPI.map(item => item.toLowerCase());
	terms.accessibilityAPI_deprecated = [ 'aria', 'blackberryaccessibility', 'iosaccessibility', 'macosxaccessibility' ];
	
	terms.accessibilityControl = ['fullKeyboardControl', 'fullMouseControl', 'fullSwitchControl', 'fullTouchControl',
									'fullVideoControl', 'fullVoiceControl' ];
	terms.accessibilityControl_lc = terms.accessibilityControl.map(item => item.toLowerCase());


// epub validation routines

function evalidate(property, checks) {

	// get all matching property declarations
	
	const xpath = _epub[property][_format];
	
	const nodes = _record.evaluate( xpath, _record, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	
	
	// check for one or more instance of a property
	
	if (checks.includes('required') && !nodes.snapshotLength) {
		_msg.errors.push(_messages[property]['required']);
		return;
	}
	
	else if (checks.includes('recommended') && !nodes.snapshotLength) {
		_msg.warnings.push(_messages[property]['recommended']);
		return;
	}
	
	else if (checks.includes('deprecated') && nodes.snapshotLength) {
		_msg.usage.push(_messages.general.deprecated.replace('%var%', '<code>'+property+'</code>'));
	}
	
	else {
		if (property === 'certifiedBy') {
			// store presence for later comparison with the credential and report
			_certifier = true;
		}
	}
	
	
	// value checks to run
	const check = {};
		check.terms = checks.includes('terms');
		check.claim = checks.includes('claim');
		check.email = checks.includes('email');
		check.single = checks.includes('single');
		check.duplicates = checks.includes('duplicates');
		check.url = checks.includes('url');
	
	let valid_claim = false;
	const ams_arrays = [];
	const found = [];
	
	for (let i = 0; i < nodes.snapshotLength; i++) {
	
		const value = (_format === 'epub3') ? nodes.snapshotItem(i).textContent.trim() : nodes.snapshotItem(i).getAttribute('content').trim();
		
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
					
					_msg.warnings.push(_messages[property]['spelling'].replace('%var%', escapeHtml(value)).replace('%val%', correct_spelling));
				}
				
				else if (terms.hasOwnProperty(property+'_deprecated') && terms[property+'_deprecated'].includes(value.toLowerCase())) {
					_msg.warnings.push(_messages[property]['deprecated'].replace('%var%', escapeHtml(value)));
				}
				
				else {
					_msg.warnings.push(_messages[property]['unknown'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
				}
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
				_msg.errors.push(_messages['general']['single'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
			}
		}
		
		if (check.url) {
			try {
				new URL(value);
			} catch (err) {
				_msg.errors.push(_messages[property]['badurl'].replace('%var%', '<code>' + escapeHtml(value) + '</code>'));
			}
			
			if (!value.match(/^https?:/i)) {
				_msg.warnings.push(_messages[property]['nohttp']);
			}
		}
		
		
		// check for duplicates
		
		if (check.duplicates) {
			if (found.includes(value.toLowerCase())) {
				if (property === 'accessibilitySummary') {
					_msg.warnings.push(_messages[property]['duplicates']);
				}
				
				else if (property === 'certifierCredential' || property === 'certifierReport') {
					_msg.warnings.push(_messages[property]['duplicates'].replace('%tag%', '<code>' + escapeHtml(value) + '</code>'));
				}
				
				else {
					_msg.warnings.push(_messages[property]['duplicates'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
				}
			}
			
			else {
				found.push(value.toLowerCase());
			}
		}
		
		
		// compile values for property-specific checks
		
		if (property === 'accessModeSufficient') {
			if (value.match(/\s/) && !value.match(/,/)) {
				_msg.errors.push(_messages[property]['separator'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
			}
			const arr = value.split(/[\s,]+/);
			ams_arrays.push(arr);
		}
		
		else if (property === 'accessibilityHazard') {
			const hazard = value.toLowerCase();
			if (_hazards.hasOwnProperty(hazard)) {
				_hazards[hazard] = true;
			}
		}
		
		
		// check if it's an known property
		
		if (property === 'a11y') {
			const pname = (_format === 'epub2') ? nodes.snapshotItem(i).getAttribute('name') : (nodes.snapshotItem(i).getAttribute('property') ? nodes.snapshotItem(i).getAttribute('property') : nodes.snapshotItem(i).getAttribute('rel'));
			
			if (   pname !== 'a11y:certifiedBy'
				&& pname !== 'a11y:certifierCredential'
				&& pname !== 'a11y:certifierReport'
				&& pname !== 'a11y:contactEmail'
				&& pname !== 'a11y:brailleCellType'
				&& pname !== 'a11y:brailleSystem'
				&& pname !== 'a11y:completeTranscription'
				&& pname !== 'a11y:minimumCells'
				&& pname !== 'a11y:minimumLines'
				&& pname !== 'a11y:producer'
				&& pname !== 'a11y:tactileGraphics' ) {
				_msg.usage.push(_messages.general.unknown_property.replace('%var%', '<code>'+pname+'</code>'));
			}
		}
	}
	
	if (check.claim) {
		if (!valid_claim) {
			_msg.errors.push(_messages[property]['claim']);
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
		
		for (let i = 0; i < ams_arrays.length; i++) {
			
			// check for identical sets in same or different order
			for (let k = i+1; k < ams_arrays.length; k++) {
				if (arraysEqualIgnoreOrder(ams_arrays[i], ams_arrays[k])) {
					_msg.errors.push(_messages[property]['duplicates'].replace('%var%', escapeHtml(ams_arrays[k].join(','))));
				}
			}
			
			// check for unknown values within the set
			
			ams_arrays[i].forEach(function(value) {
			
				if (!terms['accessModeSufficient'].includes(value)) {
				
					if (terms['accessModeSufficient_lc'].includes(value.toLowerCase())) {
						
						let correct_spelling = '';
						
						for (term of terms['accessModeSufficient_lc']) {
							if (term.toLowerCase() === value.toLowerCase()) {
								correct_spelling = term;
								break;
							}
						}
						
						_msg.warnings.push(_messages['accessModeSufficient']['spelling'].replace('%var%', escapeHtml(value)).replace('%val%', correct_spelling));
					}
					
					else {
						_msg.warnings.push(_messages['accessModeSufficient']['unknown'].replace('%tag%', '<code>' + escapeHtml(nodes.snapshotItem(i).outerHTML) + '</code>'));
					}
				}
			});
		}
	}
	
	if (property === 'accessibilityHazard') {
		checkHazards();
	}
}



function checkEmail(email) {
	const input = document.getElementById('email');
		input.value = email;
	
	if (! (typeof input.checkValidity === 'function' ? input.checkValidity() : /\S+@\S+\.\S+/.test(email))) {
		_msg.errors.push(_messages['contactEmail']['email']);
	}
}







function validateONIX() {

	ovalidate('conformsTo', ['required']);
	ovalidate('certifiedBy', ['required']);
	ovalidate('certifierCredential', []);
	ovalidate('certifierReport', []);
	ovalidate('accessibilityFeature', ['required']);
	ovalidate('accessModeSufficient', ['required']);
	ovalidate('accessibilityHazard', ['required']);
	ovalidate('accessMode', ['recommended']);
	ovalidate('accessibilitySummary', ['recommended']);
	ovalidate('contactEmail', ['email']);

}


const map = {};

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


function ovalidate(property, checks) {

	const nodes = getNodes(property);
	
	if (nodes.length === 0) {
		
		if (property === 'accessModeSufficient') {
			_msg.errors.push(_messages['accessModeSufficient']['oreq'])
		}
		
		else if (checks.includes('required')) {
			_msg.errors.push(_messages[property]['required']);
		}
		
		else if (checks.includes('recommended')) {
			_msg.warnings.push(_messages[property]['recommended']);
		}
		
		return;
	}
	
	const found = [];
	
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
					_msg.warnings.push(_messages['conformsTo']['onixdup'].replace('%var%', escapeHtml(value)));
				}
				else {
					_conformance[id] = true;
				}
			}
		}
		
		else if ((property === 'certifiedBy') || (property === 'certifierCredential') || (property === 'certifierReport')) {
			if (found.includes(desc.toLowerCase())) {
				_msg.warnings.push(_messages[property]['duplicates'].replace('%tag%', escapeHtml(desc)));
			}
			else {
				found.push(desc.toLowerCase());
			}
			
			if (property === 'certifierReport') {
				try {
					new URL(desc);
				} catch (err) {
					_msg.errors.push(_messages[property]['badurl'].replace('%var%', '<code>' + escapeHtml(desc) + '</code>'));
				}
				
				if (!desc.match(/^https?:/i)) {
					_msg.warnings.push(_messages[property]['nohttp']);
				}
			}
		}
		
		else if (property === 'accessibilityFeature') {
			if (found.includes(map.features[id])) {
				_msg.warnings.push(_messages['accessibilityFeature']['duplicates'].replace('%tag%', '<code>' + escapeHtml(node.outerHTML) + '</code>'));
			}
			else {
				found.push(map.features[id]);
			}
		}
		
		else if (property === 'accessibilityHazard') {
			if (map.hazards.hasOwnProperty(id)) {
				if (_hazards[map.hazards[id]]) {
					_msg.warnings.push(_messages['accessibilityHazard']['onixdup'].replace('%var%', escapeHtml(value)));
				}
				else {
					_hazards[map.hazards[id]] = true;
				}
			}
		}
		
		if (property === 'accessibilitySummary') {
			if ((_conformance['0902'] || _conformance['0903']) && value === '92') {
				_msg.errors.push(_messages['accessibilitySummary']['summary11for10']);
			}
			
			else if (_conformance['0904'] && value === '00') {
				_msg.errors.push(_messages['accessibilitySummary']['summary10for11']);
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



function getNodes(property) {

	const xpaths = _onix[property];
	
	const nodes = [];
	
	xpaths.forEach(function(xpath) {
		const matches = _record.evaluate( xpath, _record, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );
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

	console.clear();
	
	_format = '';
	_record = null;
	
	_msg.errors = [];
	_msg.warnings = [];
	_msg.usage = [];
	
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
		unknownmotionsimulationhazard: false,
		unknownsoundhazard: false
	}
	
	_certifier = false;
}



// check for invalid or incomplete conformance claims

function checkConformance() {

	if (_conformance['0908'] || _conformance['0909']) {
	
		if (_conformance['0908'] && _conformance['0909']) {
			_msg.errors.push(_messages['conformsTo']['nounknown']);
		}
		
		else {
		
			for (let key of Object.keys(_conformance)) {
				
				if ((key === '0908') || (key === '0909')) {
					continue;
				}
				
				else if (_conformance[key]) {
					if (_conformance['0908']) {
						_msg.errors.push(_messages['conformsTo']['unknownmix']);
						break;
					}
					else {
						_msg.errors.push(_messages['conformsTo']['inaccessiblemix']);
						break;
					}
				}
			}
		}
	}
	
	else if (_conformance['0902'] || _conformance['0903']) {
	
		if (_conformance['0902'] && _conformance['0903']) {
			_msg.errors.push(_messages['conformsTo']['dual10']);
		}
		
		else {
		
			for (let key of Object.keys(_conformance)) {
				
				if ((key === '0902') || (key === '0903')) {
					continue;
				}
				
				else if (_conformance[key]) {
					_msg.errors.push(_messages['conformsTo']['epub10mix']);
					break;
				}
			}
		}
	}
	
	else if (_conformance['0904']) {
	
		if (!_conformance['0980'] && !_conformance['0981'] && !_conformance['0982']) {
			_msg.errors.push(_messages['conformsTo']['nowcag']);
		}
		
		if (!_conformance['0984'] && !_conformance['0985'] && !_conformance['0986']) {
			_msg.errors.push(_messages['conformsTo']['nolevel']);
		}
	}
	
	else {
		_msg.errors.push(_messages['conformsTo']['noepub']);
	}
}



// check for conflicting accessibility features

function checkFeatureConsistency(features) {
	
	if (features.includes('none')) {
		if (features.length > 1) {
			_msg.errors.push(_messages['accessibilityFeature']['none_mix']);
		}
		else {
			_msg.errors.push(_messages['accessibilityFeature']['none_invalid']);
		}
	}
	
	if (features.includes('unknown')) {
		if (features.length > 1) {
			_msg.errors.push(_messages['accessibilityFeature']['unknown_mix']);
		}
		else {
			_msg.errors.push(_messages['accessibilityFeature']['unknown_invalid']);
		}
	}
	
	if (features.includes('withadditionalwordsegmentation') && features.includes('withoutadditionalwordsegmentation')) {
		_msg.errors.push(_messages['accessibilityFeature']['seg_mix']);
	}
	
	if (features.includes('horizontalwriting') && features.includes('verticalwriting')) {
		_msg.errors.push(_messages['accessibilityFeature']['mode_mix']);
	}
	
	if (features.includes('rubyannotations') && features.includes('fullrubyannotations')) {
		_msg.errors.push(_messages['accessibilityFeature']['ruby_mix']);
	}
	
	if (features.includes('taggedpdf')) {
		_msg.errors.push(_messages['accessibilityFeature']['pdf']);
	}
}


// check for invalid hazard declaration pairings

function checkHazards() {

	let hazardCount = 0;
	
	Object.keys(_hazards).forEach(function(haz) {
		if (_hazards[haz]) {
			hazardCount += 1;
		}
	});
	
	if (hazardCount == 0) {
		
	}
	
	if (_hazards['none']) {
	
		if (_hazards['noflashinghazard'] || _hazards['nomotionsimulationhazard'] || _hazards['nosoundhazard']) {
			_msg.warnings.push(_messages['accessibilityHazard']['none_indiv'])
		}
		
		else if (_hazards['flashing'] || _hazards['motionsimulation'] || _hazards['sound'] || _hazards['unknown'] || 
			_hazards['unknownflashinghazard'] || _hazards['unknownmotionsimulationhazard'] || _hazards['unknownsoundhazard']) {
			_msg.errors.push(_messages['accessibilityHazard']['none_mix']);
		}
	
	}
	
	if (_hazards['unknown']) {
		
		if (_hazards['unknownflashinghazard'] || _hazards['unknownmotionsimulationhazard'] || _hazards['unknownsoundhazard']) {
			_msg.warnings.push(_messages['accessibilityHazard']['unknown_indiv']);
		}
		
		else if (_hazards['flashing'] || _hazards['motionsimulation'] || _hazards['sound'] || _hazards['none'] || 
			_hazards['noflashinghazard'] || _hazards['nomotionsimulationhazard'] || _hazards['nosoundhazard']) {
			_msg.errors.push(_messages['accessibilityHazard']['unknown_mix']);
		}
		
		_msg.errors.push(_messages['accessibilityHazard']['unknown_invalid']);
	}
	
	if (!_hazards['none'] && !_hazards['unknown'] && hazardCount > 0) {
		const flash = (_hazards['flashing'] || _hazards['noflashinghazard'] || _hazards['unknownflashinghazard']);
		const motion = (_hazards['motionsimulation'] || _hazards['nomotionsimulationhazard'] || _hazards['unknownmotionsimulationhazard']);
		const sound = (_hazards['sound'] || _hazards['nosoundhazard'] || _hazards['unknownsoundhazard']);
		if (!(flash && motion && sound)) {
			_msg.errors.push(_messages['accessibilityHazard']['individual_incomplete']);
		}
	}
	
	if (_hazards['flashing'] && _hazards['noflashinghazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['flashing_none']);
	}
	
	if (_hazards['flashing'] && _hazards['unknownflashinghazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['flashing_unknown']);
	}
	
	if (_hazards['noflashinghazard'] && _hazards['unknownflashinghazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['noflashing_unknown']);
	}
	
	if (_hazards['unknownflashinghazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['flashing_invalid']);
	}
	
	if (_hazards['motionsimulation'] && _hazards['nomotionsimulationhazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['motion_none']);
	}
	
	if (_hazards['motionsimulation'] && _hazards['unknownmotionsimulationhazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['motion_unknown']);
	}
	
	if (_hazards['nomotionsimulationhazard'] && _hazards['unknownmotionsimulationhazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['nomotion_unknown']);
	}
	
	if (_hazards['unknownmotionsimulationhazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['motion_invalid']);
	}
	
	if (_hazards['sound'] && _hazards['nosoundhazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['sound_none']);
	}
	
	if (_hazards['sound'] && _hazards['unknownsoundhazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['sound_unknown']);
	}
	
	if (_hazards['nosoundhazard'] && _hazards['unknownsoundhazard']) {
		_msg.errors.push(_messages['accessibilityHazard']['nosound_unknown']);
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

	const err_div = document.getElementById('validation-result');
	
	const h2 = err_div.parentNode.querySelector('h2');
		h2.classList = '';
	
	let result = '';
	
	if (_msg.errors.length || _msg.warnings.length || _msg.usage.length) {
	
		['errors', 'warnings', 'usage'].forEach(function(type) {
			
			if (_msg[type].length) {
				result += '<h3>' + _messages.ui[type] + '</h3>';
				result += '<ul>';
				_msg[type].forEach(function (message) {
					result += '<li>' + message + '</li>';
				});
				result += '</ul>';
			}
		});
		
		h2.classList.add('fail');
	}
	
	else {
		result = '<p>' + _messages.ui.clean + '</p>';
		h2.classList.add('pass');
	}
	
	result += '<p class="disclaimer">' + _messages.ui.disclaimer + '</p>';
	
	err_div.innerHTML = result;
	err_div.parentNode.removeAttribute('hidden');
	err_div.parentNode.scrollIntoView();

}

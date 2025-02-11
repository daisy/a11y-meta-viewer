
/* 
 * This code implements the display algorithms defined in
 * - https://w3c.github.io/publ-a11y/a11y-meta-display-guide/2.0/draft/techniques/epub-metadata/
 * - https://w3c.github.io/publ-a11y/a11y-meta-display-guide/2.0/draft/techniques/onix-metadata/
 *
 * It merges the algorithms to avoid duplicating code.
 * Differences between the epub and onix techniques' variables and outputs are noted throughout.
 */

'use strict';

var metaDisplayProcessor = (function() {
	
	var _record = null;
	var _format = null;
	var _isONIX = false;
	var _lang = 'en-us';
	var _vocab = null;
	var _mode = 'compact';
	
	function initialize(param) {
	
		resetProcessing();
		
		if (!param.hasOwnProperty('record_as_text') || !param.record_as_text) {
			alert('No metadata provided.');
			return false;
		}
		
		/* 
		 * The specification calls the preprocessing step for every technique but that's
		 * omitted from this code. The _record variable is only configured once
		 */  
		
		var record = preprocessing(param.record_as_text);
		
		if (!record) {
			return false;
		}
		
		_record = record;
		
		var root = _record.documentElement;
		
		if (root.nodeName == 'package') {
			_format = root.getAttribute('version') == '2.0' ? 'epub2' : 'epub3';
			
			if (_format == 'epub3') {
				var lang = root.getAttribute('xml:lang');
				_lang = lang ? lang : 'en-us';
			}
			
			else {
				var lang = _record.evaluate('//opf:meta/@xml:lang', _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
				_lang = lang ? lang : 'en-us';
			}
		}
		
		else if (root.nodeName == 'ONIXMessage') {
			_format = 'onix';
			_isONIX = true;
			
			var lang = _record.evaluate('//onix:ONIXRecord/onix:Product/onix:Language/onixLanguageCode', _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			
			if (!lang) {
				_lang = 'en-us';
			}
			
			else {
				switch (lang) {
					case 'eng':
						_lang = 'en-us';
					default:
						_lang = 'en-us';
				}
			}
		}
		
		else {
			alert('Invalid xml document - package or onix root element not found');
			return false;
		}
		
		// language-specific control settings
		_vocab = getVocab(_lang);
		
		return true;
	}
	
	
	function reinitialize(param) {
	
		_lang = param.lang;
		_vocab = getVocab(_lang);
		
		if (!param.hasOwnProperty('mode') || !param.mode) {
			alert('Display output mode not specified.');
			return false;
		}
		
		_mode = param.mode;
		
		return true;
	}
	
	
	function resetProcessing() {
		_record = null;
		_format = null;
		_isONIX = false;
		_lang = 'en-us',
		_vocab = null;
		_mode = 'compact';
	}
	
	
	/* 
	 * 3.1 Ways of reading
	 */
	
	function waysOfReading() {
	
		// return values
		var result = {};
			result.hasMetadata = true; // this value is never changed to false as this field always displays
			result.displayHTML = document.createElement('div'); // container div for the results
		
		/* 
		 * 3.1.1 Visual adjustments
		 */
		 
		// 3.1.1.2 Variables setup
		
		var all_textual_content_can_be_modified = checkForNode(xpath.ways_of_reading.all_textual_content_can_be_modified[_format]);
		
		var is_fixed_layout = checkForNode(xpath.ways_of_reading.is_fixed_layout[_format]);
		
		// 3.1.1.3 Instructions
		
		var vis_result = document.createElement('p');
		
		if (all_textual_content_can_be_modified) {
			vis_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-visual-adjustments-modifiable'][_mode]));
		}
		
		else if (is_fixed_layout) {
			vis_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-visual-adjustments-unmodifiable'][_mode]));
		}
		
		else {
			vis_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-visual-adjustments-unknown'][_mode]));
		}
		
		// Following additions are not in the algorithm
		
		// add punctuation - not in algorithm
		vis_result.appendChild(getPunctuation());
		
		result.displayHTML.appendChild(vis_result);
		
		
		/* 
		 * 3.1.2 Supports nonvisual reading
		 */
		 
		// 3.1.2.2 Variables setup
		
		var all_necessary_content_textual = checkForNode(xpath.ways_of_reading.all_necessary_content_textual[_format]); 
		
		var audio_only_content = checkForNode(xpath.ways_of_reading.audio_only_content[_format]);
		
		// onix algorithm only
		var real_text = _isONIX ? checkForNode(xpath.ways_of_reading.real_text[_format]) : false;
		
		
		// epub algorithm only
		var some_sufficient_text = !_isONIX ? checkForNode(xpath.ways_of_reading.some_sufficient_text[_format]) : false;
		
		var textual_alternatives = checkForNode(xpath.ways_of_reading.textual_alternatives[_format]);
		
		if (!textual_alternatives && _isONIX) {
			// onix transcript check requires a different xpath - only test if text alternatives haven't already been found
			textual_alternatives = checkForNode(xpath.ways_of_reading.transcripts[_format]);
		}
		
		// epub algorithm only
		var visual_only_content = !_isONIX ? checkForNode(xpath.ways_of_reading.visual_only_content[_format]) : false;
		
		
		
		// 3.1.2.3 Instructions
		
		var nonvis_result = document.createElement('p');
		
		if (all_necessary_content_textual) {
			nonvis_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-readable'][_mode]));
		}
		
		else if (some_sufficient_text || textual_alternatives || real_text) {
			nonvis_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-not-fully'][_mode]));
		}
		
		else if (audio_only_content || visual_only_content) {
			nonvis_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-not-readable'][_mode]));
		}
		
		else {
			nonvis_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-no-metadata'][_mode]));
		}
		
		// add punctuation - not in algorithm
		nonvis_result.appendChild(getPunctuation());
		
		result.displayHTML.appendChild(nonvis_result);
		
		if (textual_alternatives) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-alt-text'][_mode]));
		
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			result.displayHTML.appendChild(p);
		}
		
		
		
		
		/* 
		 * 3.1.3 Prerecorded audio
		 */
		 
		// 3.1.3.2 Variables setup
		var all_content_audio = checkForNode(xpath.ways_of_reading.all_content_audio[_format]);
		
		// onix algorithm only
		var all_content_pre_recorded = _isONIX ? checkForNode(xpath.ways_of_reading.all_content_pre_recorded[_format]) : false;
		
		// epub algorithm only
		var audio_content = !_isONIX ? checkForNode(xpath.ways_of_reading.audio_content[_format]) : false;
		
		// onix algorithm only
		var audiobook = _isONIX ? checkForNode(xpath.ways_of_reading.audiobook[_format]) : false;

		// onix algorithm only
		var non_textual_content_audio = _isONIX ? checkForNode(xpath.ways_of_reading.non_textual_content_audio[_format]) : false;
		
		// onix algorithm only
		var non_textual_content_audio_in_video = _isONIX ? checkForNode(xpath.ways_of_reading.non_textual_content_audio_in_video[_format]) : false;
		
		// onix has to check two variables for media overlays
		var synchronised_pre_recorded_audio = !_isONIX ?
											checkForNode(xpath.ways_of_reading.synchronised_pre_recorded_audio[_format]) :
											(checkForNode(xpath.ways_of_reading.synchronised_pre_recorded_audio[_format])
												&& checkForNode(xpath.ways_of_reading.synchronised_pre_recorded_audio_2[_format]));
		
		
		// 3.1.3.3 Instructions
		
		var prerec_result = document.createElement('p');
		
		// algorithms for the formats are currently too different to combine
		
		if (_isONIX) {
			if (all_content_audio && !synchronised_pre_recorded_audio) {
				prerec_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-only'][_mode]));
			}
			
			else if ((audiobook || non_textual_content_audio || non_textual_content_audio_in_video) && !all_content_pre_recorded) {
				prerec_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-complementary'][_mode]));
			}
			
			else if (all_content_pre_recorded && synchronised_pre_recorded_audio) {
				prerec_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-synchronized'][_mode]));
			}
			
			else {
				prerec_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-no-metadata'][_mode]));
			}
		}
		
		else {
			if (synchronised_pre_recorded_audio) {
				prerec_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-synchronized'][_mode]));
			}
			
			else if (all_content_audio) {
				prerec_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-only'][_mode]));
			}
			
			else if (audio_content) {
				prerec_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-complementary'][_mode]));
			}
			
			else {
				prerec_result.appendChild(document.createTextNode(_vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-no-metadata'][_mode]));
			}
		}
		
		// add punctuation - not in algorithm
		prerec_result.appendChild(getPunctuation());
		
		result.displayHTML.appendChild(prerec_result);
		
		return result;
	}
	
	
	
	/* 
	 * 3.2 Conformance
	 */
	 
	function conformance() {
		
		// return values
		var result = {};
			result.hasMetadata = true; // this value is never changed to false as this field always displays
			result.displayHTML = document.createElement('div'); // container div for the results
		
		// 3.2.2 Variables setup
		
		var conf_info = _isONIX ? processONIXConformance() : processEPUBConformance();
			conf_info.certifier = _record.evaluate(xpath.conformance.certifier[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			conf_info.certifier_credentials = _record.evaluate(xpath.conformance.certifier_credentials[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			conf_info.certification_date = _record.evaluate(xpath.conformance.certification_date[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			conf_info.certifier_report = _record.evaluate(xpath.conformance.certifier_report[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 3.2.3 Instructions
		
		var conf_metadata = !_isONIX ? (conf_info.epub_version || conf_info.wcag_version) : (conf_info.epub_accessibility_10 || conf_info.epub_accessibility_11 || conf_info.wcag_20 || conf_info.wcag_21 || conf_info.wcag_22);
		
		if (!conf_metadata) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(_vocab.conformance['conformance-no'][_mode]))
			result.displayHTML.appendChild(p);
		}
		
		else {
		
			var conf_p = document.createElement('p');
			
			if (conf_info.wcag_level == 'AAA' || conf_info.level_aaa) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-aaa'][_mode]));
			}
			
			else if (conf_info.wcag_level == 'AA' || conf_info.level_aa) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-aa'][_mode]));
			}
			
			else if (conf_info.wcag_level == 'A' || conf_info.level_a) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-a'][_mode]));
			}
			
			// add punctuation - not in algorithm
			conf_p.appendChild(getPunctuation());
			
			result.displayHTML.appendChild(conf_p);
			
			
			if (conf_info.certifier) {
				var cert_p = document.createElement('p');
				
				cert_p.appendChild(document.createTextNode(_vocab.conformance['conformance-certifier'][_mode]));
				cert_p.appendChild(document.createTextNode(conf_info.certifier));
				
				// add punctuation - not in algorithm
				cert_p.appendChild(getPunctuation());
				
				result.displayHTML.appendChild(cert_p);
			}
			
			if (conf_info.certifier_credentials) {
				
				var cred_p = document.createElement('p');
				
				cred_p.appendChild(document.createTextNode(_vocab.conformance['conformance-certifier-credentials'][_mode]));
				
				if (conf_info.certifier_credentials.match('^http')) {
					var cert_link = document.createElement('a');
						cert_link.href = conf_info.certifier_credentials;
						cert_link.appendChild(document.createTextNode(conf_info.certifier_credentials));
					cred_p.appendChild(cert_link);
				}
				
				else {
					cred_p.appendChild(document.createTextNode(conf_info.certifier_credentials));
				}
				
				// add punctuation - not in algorithm
				cred_p.appendChild(getPunctuation());
				
				result.displayHTML.appendChild(cred_p);
			}
			
			var detconf_hd = document.createElement('h4');
				detconf_hd.appendChild(document.createTextNode(_vocab.conformance['conformance-details-title']));
			result.displayHTML.appendChild(detconf_hd);
			
			var conf_p = document.createElement('p');
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-claim'][_mode]));
			
			/* epub accessibility version */
			if (conf_info.epub_version === '1.0' || conf_info.epub_accessibility_11) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-epub-accessibility-1-0'][_mode]));
			}
			
			else if (conf_info.epub_version === '1.1' || conf_info.epub_accessibility_10) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-epub-accessibility-1-1'][_mode]));
			}
			
			/* wcag version */
			if (conf_info.wcag_version === '2.2' || conf_info.wcag_22) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-wcag-2-2'][_mode]));
			}
			
			else if (conf_info.wcag_version === '2.1' || conf_info.wcag_21) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-wcag-2-1'][_mode]));
			}
			
			else if (conf_info.wcag_version === '2.0' || conf_info.wcag_20) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-wcag-2-0'][_mode]));
			}
			
			/* wcag level */
			if (conf_info.wcag_level === 'AAA' || conf_info.level_aaa) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-level-aaa'][_mode]));
			}
			
			else if (conf_info.wcag_level === 'AA' || conf_info.level_aa) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-level-aa'][_mode]));
			}
			
			else if (conf_info.wcag_level === 'A' || conf_info.levela) {
				conf_p.appendChild(document.createTextNode(_vocab.conformance['conformance-level-a'][_mode]));
			}

			// add punctuation - not in algorithm
			conf_p.appendChild(getPunctuation());
			
			result.displayHTML.appendChild(conf_p);
			
			if (conf_info.certification_date) {
			
				var cert_p = document.createElement('p');
					cert_p.appendChild(document.createTextNode(_vocab.conformance['conformance-certification-info'][_mode]));
					cert_p.appendChild(document.createTextNode(conf_info.certification_date));
				
				// add punctuation - not in algorithm
				cert_p.appendChild(getPunctuation());
				
				result.displayHTML.appendChild(cert_p);
			}
			
			if (conf_info.certifier_report) {
				
				var rep_p = document.createElement('p');
				
				var rep_link = document.createElement('a');
					rep_link.href = conf_info.certifier_credentials;
					rep_link.appendChild(document.createTextNode(_vocab.conformance['conformance-certifier-report'][_mode]));
				rep_p.appendChild(rep_link);
				
				// add punctuation - not in algorithm
				rep_p.appendChild(getPunctuation());
				
				result.displayHTML.appendChild(rep_p);
			}
		}
		
		return result;
	}
	
	
	function processEPUBConformance() {
		
		var conf_info = {};
		
		if (checkForNode(xpath.conformance.epub10a[_format])) {
			conf_info.epub_format = '1.0';
			conf_info.wcag_format = '2.0';
			conf_info.wcag_level = 'A';
		}
		
		if (checkForNode(xpath.conformance.epub10aa[_format])) {
			conf_info.epub_format = '1.0';
			conf_info.wcag_format = '2.0';
			conf_info.wcag_level = 'AA';
		}
		
		if (checkForNode(xpath.conformance.epub10aaa[_format])) {
			conf_info.epub_format = '1.0';
			conf_info.wcag_format = '2.0';
			conf_info.wcag_level = 'AAA';
		}
		
		// js evaluate() can't handle this expression: 
		// /opf:package/opf:metadata/opf:meta[@property="dcterms:conformsTo" and matches(normalize-space(), "EPUB Accessibility 1\.1 - WCAG 2\.[0-2] Level [A]+")]
		// using contains() instead to match most of it
		
		var conformance = _record.evaluate(xpath.conformance.conformance[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		if (conformance) {
		
			conformance = conformance.trim();
			
			conf_info.epub_version = '1.1';

			var version_re = new RegExp('EPUB Accessibility 1\\.1 - WCAG (2\\.[0-2]) Level [A]+');
			conf_info.wcag_version = conformance.replace(version_re, '$1');

			var level_re = new RegExp('EPUB Accessibility 1\\.1 - WCAG 2\\.[0-2] Level ');
			conf_info.wcag_level = conformance.replace(level_re, '');
		}
		
		// set empty keys for unused onix variables
		
		conf_info.epub_accessibility_10;
		conf_info.epub_accessibility_11;
		conf_info.level_a;
		conf_info.level_aa;
		conf_info.level_aaa;
		conf_info.lia_compliant;
		conf_info.wcag_20;
		conf_info.wcag_21;
		conf_info.wcag_22;
		
		return conf_info;
	}
	
	
	
	function processONIXConformance() {
	
		var conf_info = {}
			conf_info.epub_accessibility_10 = checkForNode(xpath.conformance.epub_accessibility_10_1[_format]) || checkForNode(xpath.conformance.epub_accessibility_10_2[_format]);
			conf_info.epub_accessibility_11 = checkForNode(xpath.conformance.epub_accessibility_11[_format]);
			conf_info.level_a = checkForNode(xpath.conformance.level_a_1[_format]) || checkForNode(xpath.conformance.level_a_2[_format]);
			conf_info.level_aa = checkForNode(xpath.conformance.level_aa_1[_format]) || checkForNode(xpath.conformance.level_aa_2[_format]);
			conf_info.level_aaa = checkForNode(xpath.conformance.level_aaa[_format]);
			conf_info.lia_compliant = checkForNode(xpath.conformance.lia_compliant[_format]);
			conf_info.wcag_20 = checkForNode(xpath.conformance.wcag_20_1[_format]) || checkForNode(xpath.conformance.wcag_20_2[_format]) || checkForNode(xpath.conformance.wcag_20_3[_format]);
			conf_info.wcag_21 = checkForNode(xpath.conformance.wcag_21[_format]);
			conf_info.wcag_22 = checkForNode(xpath.conformance.wcag_22[_format]);
		
		// set empty keys for unused epub variables
		conf_info.epub_format;
		conf_info.wcag_format;
		conf_info.wcag_level;
		
		return conf_info;
	}
	
	
	
	
	
	/* 
	 * 3.3 Navigation
	 */
	
	function navigation() {
	
		// return values
		var result = {};
			result.hasMetadata = true;
			result.displayHTML = document.createElement('div'); // container div for the results
		
		// 3.3.2 Variables setup
		
		var index_navigation = checkForNode(xpath.navigation.index_navigation[_format]);
		
		var next_previous_structural_navigation = checkForNode(xpath.navigation.next_previous_structural_navigation[_format]);
		
		var page_navigation = checkForNode(xpath.navigation.page_navigation[_format]);
		
		var table_of_contents_navigation = checkForNode(xpath.navigation.table_of_contents_navigation[_format]);
		
		// 3.3.3 Instructions
		
		if (table_of_contents_navigation || index_navigation || page_navigation || next_previous_structural_navigation) {
			
			var navigation = document.createElement('ul');
			
			if (table_of_contents_navigation) {
				var li = document.createElement('li');
					li.appendChild(document.createTextNode(_vocab.navigation['navigation-toc'][_mode]));
				navigation.appendChild(li);
			}
			
			if (index_navigation) {
				var li = document.createElement('li');
					li.appendChild(document.createTextNode(_vocab.navigation['navigation-index'][_mode]));
				navigation.appendChild(li);
			}
			
			if (page_navigation) {
				var li = document.createElement('li');
					li.appendChild(document.createTextNode(_vocab.navigation['navigation-page-navigation'][_mode]));
				navigation.appendChild(li);
			}
			
			if (next_previous_structural_navigation) {
				var li = document.createElement('li');
					li.appendChild(document.createTextNode(_vocab.navigation['navigation-structural'][_mode]));
				navigation.appendChild(li);
			}
			
			result.displayHTML.appendChild(navigation);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(_vocab.navigation['navigation-no-metadata'][_mode]));
				
				// add punctuation - not in algorithm
				p.appendChild(getPunctuation());
			
			result.displayHTML.appendChild(p);
			
			result.hasMetadata = false;
		}
		
		return result;
	}
	
	
	/* 
	 * 3.4 Rich content
	 */
	 
	 function richContent() {
	 
		// return values
		var result = {};
			result.hasMetadata = true;
			result.displayHTML = document.createElement('div'); // container div for the results
		
		// 3.4.2 Variables setup
		
		// onix algorithm only
		var charts_diagrams_as_non_graphical_data = _isONIX ? checkForNode(xpath.rich_content.charts_diagrams_as_non_graphical_data[_format]) : false;
		
		// epub algorithm only
		var chemical_formula_as_latex = !_isONIX ? checkForNode(xpath.rich_content.chemical_formula_as_latex[_format]) : false;
		
		var chemical_formula_as_mathml = checkForNode(xpath.rich_content.chemical_formula_as_mathml[_format]);
		
		var closed_captions = checkForNode(xpath.rich_content.closed_captions[_format]);
		
		// epub algorithm only
		var contains_charts_diagrams = !_isONIX ? checkForNode(xpath.rich_content.contains_charts_diagrams[_format]) : false;
		
		// epub algorithm only
		var contains_chemical_formula = !_isONIX ? checkForNode(xpath.rich_content.contains_chemical_formula[_format]) : false;
		
		var contains_math_formula = checkForNode(xpath.rich_content.contains_math_formula[_format]);
		
		var full_alternative_textual_descriptions = checkForNode(xpath.rich_content.full_alternative_textual_descriptions[_format]);
		
		var math_formula_as_latex = checkForNode(xpath.rich_content.math_formula_as_latex[_format]);
		
		var math_formula_as_mathml = checkForNode(xpath.rich_content.math_formula_as_mathml[_format]);
		
		var open_captions = checkForNode(xpath.rich_content.open_captions[_format]);
		
		var transcript = checkForNode(xpath.rich_content.transcript[_format]);

		// onix algorithm only
		var short_textual_alternative_images = _isONIX ? checkForNode(xpath.rich_content.short_textual_alternative_images[_format]) : false;


		// 3.4.3 Instructions
		
		var richcontent = document.createElement('ul');
		
		if (math_formula_as_mathml) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-accessible-math-as-mathml'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (math_formula_as_latex) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-accessible-math-as-latex'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (contains_math_formula) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-accessible-math-described'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (chemical_formula_as_mathml) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-accessible-chemistry-as-mathml'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (chemical_formula_as_latex) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-accessible-chemistry-as-latex'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (charts_diagrams_as_non_graphical_data || full_alternative_textual_descriptions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-extended'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (full_alternative_textual_descriptions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-extended'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (closed_captions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-closed-captions'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (open_captions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-open-captions'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (transcript) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-transcript'][_mode]));
			richcontent.appendChild(li);
		}
		
		if (richcontent.childElementCount) {
			result.displayHTML.appendChild(richcontent);
		}
		
		var unknown_rich_content = 
				(_isONIX) ?
					(!(math_formula_as_mathml || math_formula_as_latex || (contains_math_formula && short_textual_alternative_images) || chemical_formula_as_mathml || charts_diagrams_as_non_graphical_data || full_alternative_textual_descriptions || closed_captions || open_captions || transcript))
					: (!(math_formula_as_mathml || math_formula_as_latex || (contains_math_formula && full_alternative_textual_descriptions) || chemical_formula_as_mathml || full_alternative_textual_descriptions || closed_captions || open_captions || transcript));
		
		if (unknown_rich_content) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(_vocab['rich-content']['rich-content-unknown'][_mode]));
			
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			result.displayHTML.appendChild(p);
			
			result.hasMetadata = false;
		}
		
		return result;
	}	
	
	
	/* 
	 * 3.5 Hazards
	 */
	
	function hazards() {
	
		// return values
		var result = {};
			result.hasMetadata = true;
			result.displayHTML = document.createElement('div'); // container div for the results
		
		// 3.5.2 Variables setup
		
		var flashing_hazard = checkForNode(xpath.hazards.flashing_hazard[_format]);
		
		var motion_simulation_hazard = checkForNode(xpath.hazards.motion_simulation_hazard[_format]);
		
		var no_flashing_hazards = checkForNode(xpath.hazards.no_flashing_hazards[_format]);
		
		var no_hazards_or_warnings_confirmed = checkForNode(xpath.hazards.no_hazards_or_warnings_confirmed[_format]);
		
		var no_motion_hazards = checkForNode(xpath.hazards.no_motion_hazards[_format]);
		
		var no_sound_hazards = checkForNode(xpath.hazards.no_sound_hazards[_format]);
		
		var sound_hazard = checkForNode(xpath.hazards.sound_hazard[_format]);
		
		var unknown_if_contains_hazards = checkForNode(xpath.hazards.unknown_if_contains_hazards[_format]);
		
		// 3.5.3 Instructions
		
		if (no_hazards_or_warnings_confirmed || (no_flashing_hazards && no_motion_hazards && no_sound_hazards)) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(_vocab['hazards']['hazards-none'][_mode]));
			result.displayHTML.appendChild(p);
		}
		
		else if (flashing_hazard || motion_simulation_hazard || sound_hazard) {
		
			if (flashing_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode(_vocab['hazards']['hazards-flashing'][_mode]));
			
				// add punctuation - not in algorithm
				p.appendChild(getPunctuation());
				
				result.displayHTML.appendChild(p);
			}
			
			if (motion_simulation_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode(_vocab['hazards']['hazards-motion'][_mode]));
			
				// add punctuation - not in algorithm
				p.appendChild(getPunctuation());
				
				result.displayHTML.appendChild(p);
			}
			
			if (sound_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode(_vocab['hazards']['hazards-sound'][_mode]));
			
				// add punctuation - not in algorithm
				p.appendChild(getPunctuation());
				
				result.displayHTML.appendChild(p);
			}
		}

		else if (unknown_if_contains_hazards) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(_vocab['hazards']['hazards-unknown'][_mode]));
		
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			result.displayHTML.appendChild(p);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(_vocab['hazards']['hazards-no-metadata'][_mode]));
		
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			result.displayHTML.appendChild(p);
			
			result.hasMetadata = false;
		}
		
		
		return result;
	}
	
	
	/* 
	 * 3.6 Accessibility summary
	 */
	 
	 function accessibilitySummary() {
	 
		// return values
		var result = {};
			result.hasMetadata = true;
			result.displayHTML = document.createElement('div'); // container div for the results
		
		// 3.6.2 Variables setup
		
		// onix algorithm only
		var accessibility_addendum = _isONIX ? _record.evaluate(xpath.summary.accessibility_addendum[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue : '';

		var accessibility_summary =  _record.evaluate(xpath.summary.accessibility_summary[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// onix algorithm only
		var known_limited_accessibility = _isONIX ? _record.evaluate(xpath.summary.known_limited_accessibility[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue : '';
		
		// onix algorithm only
		var lang_attribute_accessibility_addendum = _isONIX ? _record.evaluate(xpath.summary.lang_attribute_accessibility_addendum[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue : '';
		
		var lang_attribute_accessibility_summary = _record.evaluate(xpath.summary.lang_attribute_accessibility_summary[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// onix algorithm only
		var lang_known_limited_accessibility = _isONIX ? _record.evaluate(xpath.summary.lang_known_limited_accessibility[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue : '';
		
		var language_of_text = _record.evaluate(xpath.summary.language_of_text[_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;


		// 3.6.3 Instructions
		
		var sum_result = document.createElement('p');
		
		var language_accessibility_addendum;
		var language_accessibility_summary;
		var language_known_limited_accessibility;
		
		if (lang_attribute_accessibility_addendum) {
			language_accessibility_addendum = lang_attribute_accessibility_addendum;
		}
		
		else {
			language_accessibility_addendum = language_of_text;
		}
		
		if (lang_known_limited_accessibility) {
			language_known_limited_accessibility = lang_known_limited_accessibility;
		}
		
		else {
			language_known_limited_accessibility = language_of_text;
		}
		
		if (lang_attribute_accessibility_summary) {
			language_accessibility_summary = lang_attribute_accessibility_summary;
		}
		
		else {
			language_accessibility_summary = language_of_text;
		}
		
		
		
		if (known_limited_accessibility) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(known_limited_accessibility));
				p.lang = language_known_limited_accessibility;
			result.displayHTML.appendChild(p);
		}
		
		if (accessibility_addendum) {
			var p = document.createElement('p');
				P.appendChild(document.createTextNode(accessibility_addendum));
				P.lang = language_accessibility_addendum;
			result.displayHTML.appendChild(p);
		}
		
		else if (accessibility_summary) {
			sum_result.appendChild(document.createTextNode(accessibility_summary));
			sum_result.lang = language_accessibility_summary;
		}
		
		else {
			sum_result.appendChild(document.createTextNode(_vocab['accessibility-summary']['accessibility-summary-no-metadata'][_mode]));
			
			// add punctuation - not in algorithm
			sum_result.appendChild(getPunctuation());
			
			result.hasMetadata = false;
		}
		
		result.displayHTML.appendChild(sum_result);
		
		return result;
	}
	
	
	/* 
	 * 3.7 Legal considerations
	 */
	
	function legal() {
	
		// return values
		var result = {};
			result.hasMetadata = true;
			result.displayHTML = document.createElement('div'); // container div for the results
		
		// 3.7.2 Variables setup
		var exemption = checkForNode(xpath.legal.exemption[_format]);
		
		// 3.7.3 Instructions
		
		var legal_result = document.createElement('p');
		
		if (exemption) {
			legal_result.appendChild(document.createTextNode(_vocab['legal-considerations']['legal-considerations-exempt'][_mode]));
		}
		
		else {
			legal_result.appendChild(document.createTextNode(_vocab['legal-considerations']['legal-considerations-no-metadata'][_mode]));
			
			result.hasMetadata = false;
		}
		
		// add punctuation - not in algorithm
		legal_result.appendChild(getPunctuation());
		
		result.displayHTML.appendChild(legal_result);
		
		return result;
	}
	
	
	/* 
	 * 3.8 Additional accessibility information
	 */
	 
	 function additionalA11yInfo() {
	 
		// return values
		var result = {};
			result.hasMetadata = false; // assume no metadata and flip as testing
			result.displayHTML = document.createElement('div'); // container div for the results
		
		// 3.8.2 Variables setup
		
		// epub algorithm only
		var aria = _format == !_isONIX ? checkForNode(xpath.add_info.aria[_format]) : false;
		
		// epub algorithm only
		var audio_descriptions = !_isONIX ? checkForNode(xpath.add_info.audio_descriptions[_format]) : false;
		
		// epub algorithm only
		var braille = !_isONIX ? checkForNode(xpath.add_info.braille[_format]) : false;
		
		// onix algorithm only
		var color_not_sole_means_of_conveying_information = _isONIX ? checkForNode(xpath.add_info.color_not_sole_means_of_conveying_information[_format]) : false;
		
		// onix algorithm only
		var dyslexia_readability = _isONIX ? checkForNode(xpath.add_info.dyslexia_readability[_format]) : false;

		// epub algorithm only
		var full_ruby_annotations = !_isONIX ? checkForNode(xpath.add_info.full_ruby_annotations[_format]) : false;
		
		var high_contrast_between_foreground_and_background_audio = checkForNode(xpath.add_info.high_contrast_between_foreground_and_background_audio[_format]);
		
		var high_contrast_between_text_and_background = checkForNode(xpath.add_info.high_contrast_between_text_and_background[_format]);
		
		// epub algorithm only
		var large_print = !_isONIX ? checkForNode(xpath.add_info.large_print[_format]) : false;
		
		// epub algorithm only
		var page_break_markers = !_isONIX ? checkForNode(xpath.add_info.page_break_markers[_format]) : false;
		
		// epub algorithm only
		var ruby_annotations = !_isONIX ? checkForNode(xpath.add_info.ruby_annotations[_format]) : false;
		
		var sign_language = checkForNode(xpath.add_info.sign_language[_format]);
		
		// epub algorithm only
		var tactile_graphic = !_isONIX ? checkForNode(xpath.add_info.tactile_graphic[_format]) : false;
		
		// epub algorithm only
		var tactile_object = !_isONIX ? checkForNode(xpath.add_info.tactile_object[_format]) : false;
		
		var text_to_speech_hinting = checkForNode(xpath.add_info.text_to_speech_hinting[_format]);

		// onix algorithm only
		var ultra_high_contrast_between_text_and_background = _isONIX ? checkForNode(xpath.add_info.ultra_high_contrast_between_text_and_background[_format]) : false;
		
		// onix algorithm only
		var visible_page_numbering = _isONIX ? checkForNode(xpath.add_info.page_break_markers[_format]) : false;
		
		// onix algorithm only
		var without_background_sounds = _isONIX ? checkForNode(xpath.add_info.without_background_sounds[_format]) : false;
		
		
		// 3.8.3 Instructions
		
		var add_info = [];
		
		if (aria) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-aria'][_mode]);
		}
		
		if (audio_descriptions) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-audio-descriptions'][_mode]);
		}
		
		if (braille) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-braille'][_mode]);
		}
		
		if (color_not_sole_means_of_conveying_information) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-color-not-sole-means-of-conveying-information'][_mode]);
		}
		
		if (dyslexia_readability) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-dyslexia-readability'][_mode]);
		}
		
		if (full_ruby_annotations) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-full-ruby-annotations'][_mode]);
		}
		
		if (high_contrast_between_foreground_and_background_audio) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-high-contrast-between-foreground-and-background-audio'][_mode]);
		}
		
		if (high_contrast_between_text_and_background) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-high-contrast-between-text-and-background'][_mode]);
		}
		
		if (large_print) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-large-print'][_mode]);
		}
		
		if (page_break_markers) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-page-breaks'][_mode]);
		}
		
		if (sign_language) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-sign-language'][_mode]);
		}
		
		if (ruby_annotations) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-ruby-annotations'][_mode]);
		}
		
		if (tactile_object) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-tactile-objects'][_mode]);
		}
		
		if (tactile_graphic) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-tactile-graphics'][_mode]);
		}
		
		if (text_to_speech_hinting) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-text-to-speech-hinting'][_mode]);
		}
		
		if (ultra_high_contrast_between_text_and_background) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-ultra-high-contrast-between-text-and-background'][_mode]);
		}
		
		if (visible_page_numbering) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-visible-page-numbering'][_mode]);
		}
		
		if (without_background_sounds) {
			add_info.push(_vocab['additional-accessibility-information']['additional-accessibility-information-without-background-sounds'][_mode]);
		}
		
		var aai = document.createElement('ul');
		
		add_info.sort().forEach((info) => {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode(info));
			aai.appendChild(li);
			result.hasMetadata = true;
		});
		
		result.displayHTML.appendChild(aai);
		
		return result;
	}
	
	
	// 3.1 Preprocessing
	
	function preprocessing(record_as_text) {
		
		var record;
		
		try {
			var parser = new DOMParser();
			record = parser.parseFromString(record_as_text, "text/xml");
		}
		
		catch (e) {
			alert('Error parsing metadata record: ' + e);
			record = null;
		}
		
		return record;
	}
	
	
	// 3.2 Check for node
	
	function checkForNode(path) {
		var result = _record.evaluate(path, _record, nsResolver, XPathResult.BOOLEAN_TYPE, null);
		return result.booleanValue;
	}
	
	
	// other functions
	
	// get the heading for a section or subsection
	function getHeader(id, sub_hd) {
		var title_id = id + (sub_hd ? '-' + sub_hd : '-title');
		if (id && _vocab.hasOwnProperty(id) && _vocab[id].hasOwnProperty(title_id)) {
			return _vocab[id][title_id];
		}
		else {
			return '';
		}
	}
	
	// namespace resolver for the JS xpath processor
	function nsResolver(prefix) {
		switch (prefix) {
			case 'xml':
				return 'http://www.w3.org/XML/1998/namespace';
			default:
				if (_isONIX) {
					return "http://ns.editeur.org/onix/3.0/reference";
				}
				else {
					return "http://www.idpf.org/2007/opf";
				}
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
	
	function getPunctuation() {
		switch (lang) {
			default:
				return document.createTextNode('.');
		}
	}
	
	
	return {
		initialize: function(param) {
			return initialize(param);
		},
		
		reinitialize: function(param) {
			return reinitialize(param);
		},
		
		processWaysOfReading: function() {
			return waysOfReading();
		},
		
		processConformance: function() {
			return conformance();
		},
		
		processNavigation: function() {
			return navigation();
		},
		
		processRichContent: function() {
			return richContent();
		},
		
		processHazards: function() {
			return hazards();
		},
		
		processAccessibilitySummary: function() {
			return accessibilitySummary();
		},
		
		processLegal: function() {
			return legal();
		},
		
		processAdditionalA11yInfo: function() {
			return additionalA11yInfo();
		},
		
		getDisplay: function() {
			return _result;
		},
		
		getHeader: function(id, sub_hd) {
			return getHeader(id, sub_hd);
		}
	}
})();

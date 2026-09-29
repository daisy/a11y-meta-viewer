
/* 
 * This code implements the display algorithms defined in
 * - https://w3c.github.io/publ-a11y/a11y-meta-display-guide/2.0/draft/techniques/epub-metadata/
 * - https://w3c.github.io/publ-a11y/a11y-meta-display-guide/2.0/draft/techniques/onix-metadata/
 *
 * It merges the algorithms to avoid duplicating code.
 * Differences between the epub and onix techniques' variables and outputs are noted throughout.
 */

const metaDisplayProcessor = (function() {
	
	let _record = null;
	let _input_format = null;
	let _output_format = 'html';
	let _isONIX = false;
	let _lang = 'en';
	let _vocab = null;
	let _mode = 'compact';
	let _punctuation = '.';
	
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
		
		const record = preprocessing(param.record_as_text);
		
		if (!record) {
			return false;
		}
		
		_record = record;
		
		const root = _record.documentElement;
		let lang = '';
		
		if (root.nodeName == 'package') {
			_input_format = root.getAttribute('version') == '2.0' ? 'epub2' : 'epub3';
			
			if (_input_format == 'epub3') {
				lang = root.getAttribute('xml:lang');
			}
			
			else {
				lang = _record.evaluate('//opf:meta/@xml:lang', _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			}
			
			if (!lang) {
				console.log("No language code found. Defaulting to English.");
				_lang = 'en';
			}
			
			else {
				_lang = lang;
			}
		}
		
		else if (root.nodeName == 'ONIXMessage') {
			_input_format = 'onix';
			_isONIX = true;
			
			lang = _record.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:Language/onix:LanguageCode', _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			
			if (!lang) {
				console.log("No language code found. Defaulting to English.");
				_lang = 'en';
			}
			
			else {
				
				if (langMap.hasOwnProperty(lang)) {
					_lang = langMap[lang];
				}
				
				else {
					console.log("Unknown language code " + lang + ". Defaulting to English.");
					_lang = 'en';
				}
			}
		}
		
		else {
			alert('Invalid xml document - package or onix root element not found');
			return false;
		}
		
		_lang = _lang.toLowerCase();
		
		if (!_lang.includes('fr-') && !_lang.includes('es-')) {
			_lang = _lang.replace(/-.*/,'');
		}
		
		else if (_lang == 'fr') {
			_lang = 'fr-fr';
		}
		
		else if (_lang == 'es') {
			_lang = 'es-es';
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
		_output_format = param.format;
		_punctuation = getPunctuation();
		
		return true;
	}
	
	
	function resetProcessing() {
		_record = null;
		_input_format = null;
		_output_format = 'html';
		_isONIX = false;
		_lang = 'en',
		_vocab = null;
		_mode = 'compact';
		_punctuation = '.';
	}
	
	
	/* 
	 * 3.1 Ways of reading
	 */
	
	function waysOfReading() {
	
		// return values
		const result = {};
			result.hasMetadata = true; // this value is never changed to false as this field always displays
			result.display = _output_format === 'html' ? document.createElement('div') : '[';
		
		/* 
		 * 3.1.1 Visual adjustments
		 */
		 
		// 3.1.1.2 Variables setup
		
		const all_textual_content_can_be_modified = checkForNode(xpath.ways_of_reading.all_textual_content_can_be_modified[_input_format]);
		
		const is_fixed_layout = checkForNode(xpath.ways_of_reading.is_fixed_layout[_input_format]);
		
		// 3.1.1.3 Instructions
		
		const vis_result = document.createElement('p');
		let statement = '';
		
		if (all_textual_content_can_be_modified) {
			statement = _vocab['ways-of-reading']['ways-of-reading-visual-adjustments-modifiable'][_mode];
			if (_output_format === 'html') {
				vis_result.appendChild(document.createTextNode(statement));
			}
			else {
				result.display += jsonFormat({value: statement, comma: false, tabs: 3, punctuate: true});
			}
		}
		
		else if (is_fixed_layout) {
			statement = _vocab['ways-of-reading']['ways-of-reading-visual-adjustments-unmodifiable'][_mode];
			if (_output_format === 'html') {
				vis_result.appendChild(document.createTextNode(statement));
			}
			else {
				result.display += jsonFormat({value: statement, comma: false, tabs: 3, punctuate: true});
			}
		}
		
		else {
			statement = _vocab['ways-of-reading']['ways-of-reading-visual-adjustments-unknown'][_mode];
			if (_output_format === 'html') {
				vis_result.appendChild(document.createTextNode(statement));
			}
			else {
				result.display += jsonFormat({value: statement, comma: false, tabs: 3, punctuate: true});
			}
		}
		
		if (_output_format === 'html') {
			// add punctuation - not in algorithm
			vis_result.appendChild(document.createTextNode(_punctuation));
			result.display.appendChild(vis_result);
		}
		
		
		/* 
		 * 3.1.2 Supports nonvisual reading
		 */
		 
		// 3.1.2.2 Variables setup
		
		const all_necessary_content_textual = checkForNode(xpath.ways_of_reading.all_necessary_content_textual[_input_format]); 
		
		const audio_only_content = checkForNode(xpath.ways_of_reading.audio_only_content[_input_format]);
		
		// onix algorithm only
		const real_text = _isONIX ? checkForNode(xpath.ways_of_reading.real_text[_input_format]) : false;
		
		
		// epub algorithm only
		const some_sufficient_text = !_isONIX ? checkForNode(xpath.ways_of_reading.some_sufficient_text[_input_format]) : false;
		
		const textual_alternatives = checkForNode(xpath.ways_of_reading.textual_alternatives[_input_format]);
		
		if (!textual_alternatives && _isONIX) {
			// onix transcript check requires a different xpath - only test if text alternatives haven't already been found
			textual_alternatives = checkForNode(xpath.ways_of_reading.transcripts[_input_format]);
		}
		
		// epub algorithm only
		const visual_only_content = !_isONIX ? checkForNode(xpath.ways_of_reading.visual_only_content[_input_format]) : false;
		
		
		
		// 3.1.2.3 Instructions
		
		const nonvis_result = document.createElement('p');
		
		if (all_necessary_content_textual) {
			statement = _vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-readable'][_mode];
			if (_output_format === 'html') {
				nonvis_result.appendChild(document.createTextNode(statement));
			}
			else {
				result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
			}
		}
		
		else if (some_sufficient_text || textual_alternatives || real_text) {
			statement = _vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-not-fully'][_mode];
			if (_output_format === 'html') {
				nonvis_result.appendChild(document.createTextNode(statement));
			}
			else {
				result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
			}
		}
		
		else if (audio_only_content || visual_only_content) {
			statement = _vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-not-readable'][_mode];
			if (_output_format === 'html') {
				nonvis_result.appendChild(document.createTextNode(statement));
			}
			else {
				result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
			}
		}
		
		else {
			statement = _vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-no-metadata'][_mode];
			if (_output_format === 'html') {
				nonvis_result.appendChild(document.createTextNode(statement));
			}
			else {
				result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
			}
		}
		
		if (_output_format === 'html') {
			// add punctuation - not in algorithm
			nonvis_result.appendChild(document.createTextNode(_punctuation));
			result.display.appendChild(nonvis_result);
		}
		
		if (textual_alternatives) {
			
			statement = _vocab['ways-of-reading']['ways-of-reading-nonvisual-reading-alt-text'][_mode];
			
			if (_output_format === 'html') {
				const p = document.createElement('p');
					p.appendChild(document.createTextNode(statement));
			
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode(_punctuation));
				result.display.appendChild(p);
			}
			else {
				result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
			}
		}
		
		
		
		
		/* 
		 * 3.1.3 Prerecorded audio
		 */
		 
		// 3.1.3.2 Variables setup
		const all_content_audio = checkForNode(xpath.ways_of_reading.all_content_audio[_input_format]);
		
		// onix algorithm only
		const all_content_pre_recorded = _isONIX ? checkForNode(xpath.ways_of_reading.all_content_pre_recorded[_input_format]) : false;
		
		// epub algorithm only
		const audio_content = !_isONIX ? checkForNode(xpath.ways_of_reading.audio_content[_input_format]) : false;
		
		// onix algorithm only
		const audiobook = _isONIX ? checkForNode(xpath.ways_of_reading.audiobook[_input_format]) : false;

		// onix algorithm only
		const non_textual_content_audio = _isONIX ? checkForNode(xpath.ways_of_reading.non_textual_content_audio[_input_format]) : false;
		
		// onix algorithm only
		const non_textual_content_audio_in_video = _isONIX ? checkForNode(xpath.ways_of_reading.non_textual_content_audio_in_video[_input_format]) : false;
		
		// onix has to check two variables for media overlays
		const synchronised_pre_recorded_audio = !_isONIX ?
											checkForNode(xpath.ways_of_reading.synchronised_pre_recorded_audio[_input_format]) :
											(checkForNode(xpath.ways_of_reading.synchronised_pre_recorded_audio[_input_format])
												&& checkForNode(xpath.ways_of_reading.synchronised_pre_recorded_audio_2[_input_format]));
		
		
		// 3.1.3.3 Instructions
		
		const prerec_result = document.createElement('p');
		
		// algorithms for the formats are currently too different to combine
		
		if (_isONIX) {
			if (all_content_audio && !synchronised_pre_recorded_audio) {
				statement = _vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-only'][_mode];
				if (_output_format === 'html') {
					prerec_result.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
				}
			}
			
			else if ((audiobook || non_textual_content_audio || non_textual_content_audio_in_video) && !all_content_pre_recorded) {
				statement = _vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-complementary'][_mode];
				if (_output_format === 'html') {
					prerec_result.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
				}
			}
			
			else if (all_content_pre_recorded && synchronised_pre_recorded_audio) {
				statement = _vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-synchronized'][_mode];
				if (_output_format === 'html') {
					prerec_result.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
				}
			}
			
			else {
				statement = _vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-no-metadata'][_mode];
				if (_output_format === 'html') {
					prerec_result.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
				}
			}
		}
		
		else {
			if (synchronised_pre_recorded_audio) {
				statement = _vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-synchronized'][_mode];
				if (_output_format === 'html') {
					prerec_result.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
				}
			}
			
			else if (all_content_audio) {
				statement = _vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-only'][_mode];
				if (_output_format === 'html') {
					prerec_result.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
				}
			}
			
			else if (audio_content) {
				statement = _vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-complementary'][_mode];
				if (_output_format === 'html') {
					prerec_result.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
				}
			}
			
			else {
				statement = _vocab['ways-of-reading']['ways-of-reading-prerecorded-audio-no-metadata'][_mode];
				if (_output_format === 'html') {
					prerec_result.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
				}
			}
		}
		
		if (_output_format === 'html') {
			// add punctuation - not in algorithm
			prerec_result.appendChild(document.createTextNode(_punctuation));
			result.display.appendChild(prerec_result);
		}
		
		else {
			result.display += '\n\t\t]';
		}
		
		return result;
	}
	
	
	
	/* 
	 * 3.2 Conformance
	 */
	 
	function conformance() {
		
		// return values
		const result = {};
			result.hasMetadata = true; // this value is never changed to false as this field always displays
			result.display = _output_format === 'html' ? document.createElement('div') : '[';
		
		// 3.2.2 Variables setup
		
		const conf_info = _isONIX ? processONIXConformance() : processEPUBConformance();
		
			conf_info.conformance = _vocab['conformance']['conformance-details-claim'][_mode];
			
			conf_info.certifier = _record.evaluate(xpath.conformance.certifier[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			
			conf_info.certifier_credentials = _record.evaluate(xpath.conformance.certifier_credential[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			
			conf_info.certification_date = _record.evaluate(xpath.conformance.certification_date[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
			
			conf_info.certifier_report = _record.evaluate(xpath.conformance.certifier_report[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 3.2.3 Instructions
		
		const conf_metadata = !_isONIX ? (conf_info.epub_version || conf_info.wcag_version) : (conf_info.epub_accessibility_10 || conf_info.epub_accessibility_11 || conf_info.wcag_20 || conf_info.wcag_21 || conf_info.wcag_22);
		
		if (!conf_metadata) {
			statement = _vocab.conformance['conformance-no'][_mode];
			if (_output_format === 'html') {
				const p = document.createElement('p');
					p.appendChild(document.createTextNode(statement))
				result.display.appendChild(p);
			}
			else {
				result.display += JSON.stringify(statement + _punctuation);
			}
		}
		
		else {
		
			const conf_p = document.createElement('p');
			
			if (conf_info.wcag_level == 'AAA' || conf_info.level_aaa) {
				statement = _vocab.conformance['conformance-aaa'][_mode];
				if (_output_format === 'html') {
					conf_p.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: false, tabs: 3, punctuate: true});
				}
			}
			
			else if (conf_info.wcag_level == 'AA' || conf_info.level_aa) {
				statement = _vocab.conformance['conformance-aa'][_mode];
				if (_output_format === 'html') {
					conf_p.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: false, tabs: 3, punctuate: true});
				}
			}
			
			else if (conf_info.wcag_level == 'A' || conf_info.level_a) {
				statement = _vocab.conformance['conformance-a'][_mode];
				if (_output_format === 'html') {
					conf_p.appendChild(document.createTextNode(statement));
				}
				else {
					result.display += jsonFormat({value: statement, comma: false, tabs: 3, punctuate: true});
				}
			}
			
			if (_output_format === 'html') {
				// add punctuation - not in algorithm
				conf_p.appendChild(document.createTextNode(_punctuation));
				result.display.appendChild(conf_p);
			}
			
			
			if (conf_info.certifier) {
				
				statement = _vocab.conformance['conformance-certifier'][_mode].replace('{certifier}', conf_info.certifier) + _punctuation;
					
				if (_output_format === 'html') {
					const cert_p = document.createElement('p');
						cert_p.appendChild(document.createTextNode(statement));
					result.display.appendChild(cert_p);
				}
				
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: false});
				}
			}
			
			if (conf_info.certifier_credentials) {
				
				statement = _vocab.conformance['conformance-certifier-credentials'][_mode];
				const credential = document.createElement('p');
				
				if (conf_info.certifier_credentials.match('^http') && _output_format !== 'json') {
					
					let display = conf_info.certifier_credentials;
					
					if (conf_info.certifier_credentials == 'https://bornaccessible.org/certification/gca-credential/') {
						display = '<img src="https://daisy.github.io/a11y-meta-viewer/graphics/GCA.png" alt="Benetech Global Certified Accessible" height="80"/>';
					}
					
					statement = statement.replace('{certifier_credentials}', '<a href="' + conf_info.certifier_credentials + '">' + display + '</a>' + _punctuation);
					credential.innerHTML = statement;
				}
				
				else {
					statement = statement.replace('{certifier_credentials}', conf_info.certifier_credentials + _punctuation);
					
					if (_output_format === 'html') {
						credential.innerHTML = statement;
					}
				}
				
				if (_output_format === 'html') {
					result.display.appendChild(credential);
				}
				else {
					result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: false});
				}
			}
			
			let det_conf = _output_format === 'html' ? document.createElement('details') : '\n\t\t],\n\t\t"details": {';
			
			if (_mode == 'descriptive' && _output_format === 'html') {
				det_conf.setAttribute('open', 'open');
			}
			
			const det_hd = _vocab.conformance['conformance-details-title'];
			
			if (_output_format === 'html') {
				const det_sum = document.createElement('summary');
					det_sum.appendChild(document.createTextNode(det_hd));
				
				det_conf.appendChild(det_sum);
			}
			
			else {
				det_conf += '\n\t\t\t"title": ' + JSON.stringify(det_hd) + ',\n\t\t\t"conformance": ';
			}
			
			/* build the conformance claim */
			let conf_claim = _vocab.conformance['conformance-details-claim'][_mode];
			
			/* epub accessibility version */
			if (conf_info.epub_version === '1.1' || conf_info.epub_accessibility_11) {
				conf_claim = conf_claim.replace('{epub_accessibility}', _vocab.conformance['conformance-details-epub-accessibility-1-1'][_mode]);
			}
			
			else if (conf_info.epub_version === '1.0' || conf_info.epub_accessibility_10) {
				conf_claim = conf_claim.replace('{epub_accessibility}', _vocab.conformance['conformance-details-epub-accessibility-1-0'][_mode]);
			}
			
			else {
				conf_claim = conf_claim.replace('{epub_accessibility}', '');
			}
			
			/* wcag version */
			if (conf_info.wcag_version === '2.2' || conf_info.wcag_22) {
				conf_claim = conf_claim.replace('{wcag_version}', _vocab.conformance['conformance-details-wcag-2-2'][_mode]);
			}
			
			else if (conf_info.wcag_version === '2.1' || conf_info.wcag_21) {
				conf_claim = conf_claim.replace('{wcag_version}', _vocab.conformance['conformance-details-wcag-2-1'][_mode]);
			}
			
			else if (conf_info.wcag_version === '2.0' || conf_info.wcag_20) {
				conf_claim = conf_claim.replace('{wcag_version}', _vocab.conformance['conformance-details-wcag-2-0'][_mode]);
			}
			
			else {
				conf_claim = conf_claim.replace('{wcag_version}', '');
			}
			
			/* wcag level */
			if (conf_info.wcag_level === 'AAA' || conf_info.level_aaa) {
				conf_claim = conf_claim.replace('{wcag_level}', _vocab.conformance['conformance-details-level-aaa'][_mode]);
			}
			
			else if (conf_info.wcag_level === 'AA' || conf_info.level_aa) {
				conf_claim = conf_claim.replace('{wcag_level}', _vocab.conformance['conformance-details-level-aa'][_mode]);
			}
			
			else if (conf_info.wcag_level === 'A' || conf_info.levela) {
				conf_claim = conf_claim.replace('{wcag_level}', _vocab.conformance['conformance-details-level-a'][_mode]);
			}
			
			else {
				conf_claim = conf_claim.replace('{wcag_level}', '');
			}
			
			conf_claim += _punctuation;
			
			if (_output_format === 'html') {
				const ext_conf_p = document.createElement('p');
					ext_conf_p.appendChild(document.createTextNode(conf_claim));
				det_conf.appendChild(ext_conf_p);
			}
			
			else {
				det_conf += JSON.stringify(conf_claim);
			}
			
			if (conf_info.certification_date) {
			
				const localized_date = conf_info.certification_date;
				
				if (conf_info.certification_date.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*?)?/)) {
					const report_date = new Date(conf_info.certification_date.replace('-','/').replace(/T.+/, ''));
					const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
					localized_date = report_date.toLocaleDateString(_lang, options);
				}
				
				statement = _vocab.conformance['conformance-details-certification-info'][_mode].replace('{certification_date}', localized_date) + _punctuation;
				
				if (_output_format === 'html') {
					const certifier_p = document.createElement('p');
						certifier_p.appendChild(document.createTextNode(statement));
					det_conf.appendChild(certifier_p);
				}
				
				else {
					det_conf += ',\n\t\t\t"certification-date": ' + JSON.stringify(statement);
				}
			}
			
			if (conf_info.certifier_report) {
				
				statement = _vocab.conformance['conformance-details-certifier-report'][_mode];
				
				if (_output_format === 'html') {
					statement = statement.replace(/\[([^\]]+)\]/, '<a href="' + conf_info.certifier_report + '">$1</a>') + _punctuation;
					
					const rep_p = document.createElement('p');
						rep_p.innerHTML = statement;
					
					det_conf.appendChild(rep_p);
				}
				
				else {
					det_conf += ',\n\t\t\t"certifier-report": {\n\t\t\t\t"statement": ' + JSON.stringify(statement) + ',\n\t\t\t\t"url": ' + JSON.stringify(conf_info.certifier_report) + '\n\t\t\t}';
				}
			}
			
			if (_output_format === 'html') {
				result.display.appendChild(det_conf);
			}
			else {
				result.display += det_conf + '\n\t\t}';
			}
		}
		
		return result;
	}
	
	
	function processEPUBConformance() {
		
		const conf_info = {};
		
		// js evaluate() can't handle this expression: 
		// /opf:package/opf:metadata/opf:meta[@property="dcterms:conformsTo" and matches(normalize-space(), "EPUB Accessibility 1\.1 - WCAG 2\.[0-2] Level [A]+")]
		// using contains() instead to match most of it
		
		let conformance = _record.evaluate(xpath.conformance.conformance[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		const epub10_wcag20a = checkForNode(xpath.conformance.epub10a[_input_format]);
		
		const epub10_wcag20aa = checkForNode(xpath.conformance.epub10aa[_input_format]);
		
		const epub10_wcag20aaa = checkForNode(xpath.conformance.epub10aaa[_input_format]);
		
		if (conformance) {
		
			conformance = conformance.trim();
			
			conf_info.epub_version = '1.1';

			const version_re = new RegExp('EPUB Accessibility 1\\.1 - WCAG (2\\.[0-2]) Level [A]+');
			conf_info.wcag_version = conformance.replace(version_re, '$1');

			const level_re = new RegExp('EPUB Accessibility 1\\.1 - WCAG 2\\.[0-2] Level ');
			conf_info.wcag_level = conformance.replace(level_re, '');
		}
		
		else if (epub10_wcag20aaa) {
			conf_info.epub_version = '1.0';
			conf_info.wcag_version = '2.0';
			conf_info.wcag_level = 'AAA';
		}
		
		else if (epub10_wcag20aa) {
			conf_info.epub_version = '1.0';
			conf_info.wcag_version = '2.0';
			conf_info.wcag_level = 'AA';
		}
		
		else if (epub10_wcag20a) {
			conf_info.epub_version = '1.0';
			conf_info.wcag_version = '2.0';
			conf_info.wcag_level = 'A';
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
	
		const conf_info = {}
			conf_info.epub_accessibility_10 = checkForNode(xpath.conformance.epub_accessibility_10_1[_input_format]) || checkForNode(xpath.conformance.epub_accessibility_10_2[_input_format]);
			conf_info.epub_accessibility_11 = checkForNode(xpath.conformance.epub_accessibility_11[_input_format]);
			conf_info.level_a = checkForNode(xpath.conformance.level_a_1[_input_format]) || checkForNode(xpath.conformance.level_a_2[_input_format]);
			conf_info.level_aa = checkForNode(xpath.conformance.level_aa_1[_input_format]) || checkForNode(xpath.conformance.level_aa_2[_input_format]);
			conf_info.level_aaa = checkForNode(xpath.conformance.level_aaa[_input_format]);
			conf_info.lia_compliant = checkForNode(xpath.conformance.lia_compliant[_input_format]);
			conf_info.wcag_20 = checkForNode(xpath.conformance.wcag_20_1[_input_format]) || checkForNode(xpath.conformance.wcag_20_2[_input_format]) || checkForNode(xpath.conformance.wcag_20_3[_input_format]);
			conf_info.wcag_21 = checkForNode(xpath.conformance.wcag_21[_input_format]);
			conf_info.wcag_22 = checkForNode(xpath.conformance.wcag_22[_input_format]);
		
		// set empty keys for unused epub variables
		conf_info.epub_input_format;
		conf_info.wcag_input_format;
		conf_info.wcag_level;
		
		return conf_info;
	}
	
	
	
	
	
	/* 
	 * 3.3 Navigation
	 */
	
	function navigation() {
	
		// return values
		const result = {};
			result.hasMetadata = true;
			result.display = _output_format === 'html' ? document.createElement('div') : '[';
		
		// 3.3.2 Variables setup
		
		const index_navigation = checkForNode(xpath.navigation.index_navigation[_input_format]);
		
		const next_previous_structural_navigation = checkForNode(xpath.navigation.next_previous_structural_navigation[_input_format]);
		
		const page_navigation = checkForNode(xpath.navigation.page_navigation[_input_format]);
		
		const table_of_contents_navigation = checkForNode(xpath.navigation.table_of_contents_navigation[_input_format]);
		
		// 3.3.3 Instructions
		
		if (table_of_contents_navigation || index_navigation || page_navigation || next_previous_structural_navigation) {
			
			const navigation = document.createElement('ul');
			
			if (table_of_contents_navigation) {
				statement = _vocab.navigation['navigation-toc'][_mode];
				
				if (_output_format === 'html') {
					const li_nav = document.createElement('li');
						li_nav.appendChild(document.createTextNode(statement));
					navigation.appendChild(li_nav);
				}
				
				else {
					result.display += jsonFormat({value: statement, comma: false, tabs: 3, punctuate: false});
				}
			}
			
			if (index_navigation) {
			
				statement = _vocab.navigation['navigation-index'][_mode];
				
				if (_output_format === 'html') {
					const li_idx = document.createElement('li');
						li_idx.appendChild(document.createTextNode(statement));
					navigation.appendChild(li_idx);
				}
				
				else {
					result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: false});
				}
			}
			
			if (page_navigation) {
			
				statement = _vocab.navigation['navigation-page-navigation'][_mode];
				
				if (_output_format === 'html') {
					const li_page = document.createElement('li');
						li_page.appendChild(document.createTextNode(statement));
					navigation.appendChild(li_page);
				}
				
				else {
					result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: false});
				}
			}
			
			if (next_previous_structural_navigation) {
			
				statement = _vocab.navigation['navigation-structural'][_mode];
				
				if (_output_format === 'html') {
					const li_str = document.createElement('li');
						li_str.appendChild(document.createTextNode(statement));
					navigation.appendChild(li_str);
				}
				
				else {
					result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: false});
				}
			}
			
			if (_output_format === 'html') {
				result.display.appendChild(navigation);
			}
		}
		
		else {
		
			if (_output_format === 'html') {
				const p = document.createElement('p');
					p.appendChild(document.createTextNode(_vocab.navigation['navigation-no-metadata'][_mode]));
					
					// add punctuation - not in algorithm
					p.appendChild(document.createTextNode(_punctuation));
				
				result.display.appendChild(p);
			}
			
			else {
				result.display += '\n\t\t\t' + JSON.stringify(statement);
			}
			
			result.hasMetadata = false;
		}
		
		if (_output_format === 'json') {
			result.display += '\n\t\t]';
		}
		
		return result;
	}
	
	
	/* 
	 * 3.4 Rich content
	 */
	 
	 function richContent() {
	 
		// return values
		const result = {};
			result.hasMetadata = true;
			result.display = _output_format === 'html' ? document.createElement('div') : '[';
		
		// 3.4.2 Variables setup
		
		// onix algorithm only
		const charts_diagrams_as_non_graphical_data = _isONIX ? checkForNode(xpath.rich_content.charts_diagrams_as_non_graphical_data[_input_format]) : false;
		
		// epub algorithm only
		const chemical_formula_as_latex = !_isONIX ? checkForNode(xpath.rich_content.chemical_formula_as_latex[_input_format]) : false;
		
		const chemical_formula_as_mathml = checkForNode(xpath.rich_content.chemical_formula_as_mathml[_input_format]);
		
		const closed_captions = checkForNode(xpath.rich_content.closed_captions[_input_format]);
		
		// epub algorithm only
		const contains_charts_diagrams = !_isONIX ? checkForNode(xpath.rich_content.contains_charts_diagrams[_input_format]) : false;
		
		// epub algorithm only
		const contains_chemical_formula = !_isONIX ? checkForNode(xpath.rich_content.contains_chemical_formula[_input_format]) : false;
		
		const contains_math_formula = checkForNode(xpath.rich_content.contains_math_formula[_input_format]);
		
		const full_alternative_textual_descriptions = checkForNode(xpath.rich_content.full_alternative_textual_descriptions[_input_format]);
		
		const math_formula_as_latex = checkForNode(xpath.rich_content.math_formula_as_latex[_input_format]);
		
		const math_formula_as_mathml = checkForNode(xpath.rich_content.math_formula_as_mathml[_input_format]);
		
		const open_captions = checkForNode(xpath.rich_content.open_captions[_input_format]);
		
		const transcript = checkForNode(xpath.rich_content.transcript[_input_format]);

		// onix algorithm only
		const short_textual_alternative_images = _isONIX ? checkForNode(xpath.rich_content.short_textual_alternative_images[_input_format]) : false;


		// 3.4.3 Instructions
		
		const richcontent = document.createElement('ul');
		
		if (math_formula_as_mathml) {
		
			statement = _vocab['rich-content']['rich-content-accessible-math-as-mathml'][_mode];
			
			if (_output_format === 'html') {
				const li_rc = document.createElement('li');
					li_rc.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_rc);
			}
			
			else {
				result.display += '\n\t\t\t' + JSON.stringify(statement);
			}
		}
		
		if (math_formula_as_latex) {
		
			statement = _vocab['rich-content']['rich-content-accessible-math-as-latex'][_mode];
			
			if (_output_format === 'html') {
				const li_ml = document.createElement('li');
					li_ml.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_ml);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (contains_math_formula) {
		
			statement = _vocab['rich-content']['rich-content-accessible-math-described'][_mode];
			
			if (_output_format === 'html') {
				const li_math = document.createElement('li');
					li_math.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_math);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (chemical_formula_as_mathml) {
		
			statement = _vocab['rich-content']['rich-content-accessible-chemistry-as-mathml'][_mode];
			
			if (_output_format === 'html') {
				const li_cm = document.createElement('li');
					li_cm.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_cm);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (chemical_formula_as_latex) {

			statement = _vocab['rich-content']['rich-content-accessible-chemistry-as-latex'][_mode];
			
			if (_output_format === 'html') {
				const li_cl = document.createElement('li');
					li_cl.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_cl);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (charts_diagrams_as_non_graphical_data || full_alternative_textual_descriptions) {
		
			statement = _vocab['rich-content']['rich-content-extended'][_mode];
			
			if (_output_format === 'html') {
				const li_cd = document.createElement('li');
					li_cd.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_cd);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (full_alternative_textual_descriptions) {
		
			statement = _vocab['rich-content']['rich-content-extended'][_mode];
			
			if (_output_format === 'html') {
				const li_alt = document.createElement('li');
					li_alt.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_alt);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (closed_captions) {
		
			statement = _vocab['rich-content']['rich-content-closed-captions'][_mode];
			
			if (_output_format === 'html') {
				const li_cc = document.createElement('li');
					li_cc.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_cc);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (open_captions) {
		
			statement = _vocab['rich-content']['rich-content-open-captions'][_mode];
			
			if (_output_format === 'html') {
				const li_oc = document.createElement('li');
					li_oc.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_oc);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (transcript) {
		
			statement = _vocab['rich-content']['rich-content-transcript'][_mode];
			
			if (_output_format === 'html') {
				const li_tr = document.createElement('li');
					li_tr.appendChild(document.createTextNode(statement));
				richcontent.appendChild(li_tr);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
		}
		
		if (richcontent.childElementCount && _output_format === 'html') {
			result.display.appendChild(richcontent);
		}
		
		const unknown_rich_content = 
				(_isONIX) ?
					(!(math_formula_as_mathml || math_formula_as_latex || (contains_math_formula && short_textual_alternative_images) || chemical_formula_as_mathml || charts_diagrams_as_non_graphical_data || full_alternative_textual_descriptions || closed_captions || open_captions || transcript))
					: (!(math_formula_as_mathml || math_formula_as_latex || (contains_math_formula && full_alternative_textual_descriptions) || chemical_formula_as_mathml || full_alternative_textual_descriptions || closed_captions || open_captions || transcript));
		
		if (unknown_rich_content) {
			
			statement = _vocab['rich-content']['rich-content-unknown'][_mode] + _punctuation;
			
			if (_output_format === 'html') {
				const p = document.createElement('p');
					p.appendChild(document.createTextNode(statement));
				
				result.display.appendChild(p);
			}
			
			else {
				result.display += '\n\t\t\t' + JSON.stringify(statement);
			}
			
			result.hasMetadata = false;
		}
		
		if (_output_format === 'json') {
			result.display += '\n\t\t]';
		}
		
		return result;
	}	
	
	
	/* 
	 * 3.5 Hazards
	 */
	
	function hazards() {
	
		// return values
		const result = {};
			result.hasMetadata = true;
			result.display = _output_format === 'html' ? document.createElement('div') : '[';
		
		// 3.5.2 Variables setup
		
		const flashing_hazard = checkForNode(xpath.hazards.flashing_hazard[_input_format]);
		
		const motion_simulation_hazard = checkForNode(xpath.hazards.motion_simulation_hazard[_input_format]);
		
		const no_flashing_hazard = checkForNode(xpath.hazards.no_flashing_hazard[_input_format]);
		
		const no_hazards_or_warnings_confirmed = checkForNode(xpath.hazards.no_hazards_or_warnings_confirmed[_input_format]);
		
		const no_motion_hazard = checkForNode(xpath.hazards.no_motion_hazard[_input_format]);
		
		const no_sound_hazard = checkForNode(xpath.hazards.no_sound_hazard[_input_format]);
		
		const sound_hazard = checkForNode(xpath.hazards.sound_hazard[_input_format]);
		
		const unknown_flashing_hazard = checkForNode(xpath.hazards.unknown_flashing_hazard[_input_format]);
		
		const unknown_if_contains_hazards = checkForNode(xpath.hazards.unknown_if_contains_hazards[_input_format]);
		
		const unknown_motion_hazard = checkForNode(xpath.hazards.unknown_motion_hazard[_input_format]);
		
		const unknown_sound_hazard = checkForNode(xpath.hazards.unknown_sound_hazard[_input_format]);
		
		// 3.5.3 Instructions
		
		if (no_hazards_or_warnings_confirmed || (no_flashing_hazard && no_motion_hazard && no_sound_hazard)) {
			
			statement = _vocab['hazards']['hazards-none'][_mode] + _punctuation;
			
			if (_output_format === 'html') {
				const p_nohaz = document.createElement('p');
					p_nohaz.appendChild(document.createTextNode(statement));
				result.display.appendChild(p_nohaz);
			}
			
			else {
				result.display += '\n\t\t\t' + JSON.stringify(statement);
			}
		}

		else if (unknown_if_contains_hazards || (unknown_flashing_hazard && unknown_motion_hazard && unknown_sound_hazard)) {
			
			statement = _vocab['hazards']['hazards-unknown'][_mode] + _punctuation;
			
			if (_output_format === 'html') {
				const p_unk = document.createElement('p');
					p_unk.appendChild(document.createTextNode(statement));
				result.display.appendChild(p_unk);
			}
			
			else {
				result.display += '\n\t\t\t' + JSON.stringify(statement);
			}
		}
		
		else if (flashing_hazard || motion_simulation_hazard || sound_hazard
				|| no_flashing_hazard || no_motion_hazard || no_sound_hazard
				|| unknown_flashing_hazard || unknown_motion_hazard || unknown_sound_hazard) {
		
			const hazards = [];
			
			if (flashing_hazard && _vocab['hazards'].hasOwnProperty('hazards-flashing')) {
				hazards.push(_vocab['hazards']['hazards-flashing'][_mode]);
			}
			
			if (motion_simulation_hazard && _vocab['hazards'].hasOwnProperty('hazards-motion')) {
				hazards.push(_vocab['hazards']['hazards-motion'][_mode]);
			}
			
			if (sound_hazard && _vocab['hazards'].hasOwnProperty('hazards-sound')) {
				hazards.push(_vocab['hazards']['hazards-sound'][_mode]);
			}
			
			if (unknown_flashing_hazard && _vocab['hazards'].hasOwnProperty('hazards-flashing-unknown')) {
				hazards.push(_vocab['hazards']['hazards-flashing-unknown'][_mode]);
			}
			
			if (unknown_motion_hazard && _vocab['hazards'].hasOwnProperty('hazards-motion-unknown')) {
				hazards.push(_vocab['hazards']['hazards-motion-unknown'][_mode]);
			}
			
			if (unknown_sound_hazard && _vocab['hazards'].hasOwnProperty('hazards-sound-unknown')) {
				hazards.push(_vocab['hazards']['hazards-sound-unknown'][_mode]);
			}
			
			if (no_flashing_hazard && _vocab['hazards'].hasOwnProperty('hazards-flashing-none')) {
				hazards.push(_vocab['hazards']['hazards-flashing-none'][_mode]);
			}
			
			if (no_motion_hazard && _vocab['hazards'].hasOwnProperty('hazards-motion-none')) {
				hazards.push(_vocab['hazards']['hazards-motion-none'][_mode]);
			}
			
			if (no_sound_hazard && _vocab['hazards'].hasOwnProperty('hazards-sound-none')) {
				hazards.push(_vocab['hazards']['hazards-sound-none'][_mode]);
			}
			
			if (hazards.length == 1) {
				
				statement = hazards[0] + _punctuation;
				
				if (_output_format === 'html') {
					const p_haz = document.createElement('p');
						p_haz.appendChild(document.createTextNode(statement));
					
					result.display.appendChild(p_haz);
				}
				
				else {
					result.display += '\n\t\t\t' + JSON.stringify(statement);
				}
			}
			
			else {
			
				const ul = document.createElement('ul');
				
				hazards.forEach(function(hazard) {
				
					statement = hazard + _punctuation;
					
					if (_output_format === 'html') {
						const li = document.createElement('li');
							li.appendChild(document.createTextNode(statement));
						
						ul.appendChild(li);
					}
					
					else {
						result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
					}
				});
				
				if (_output_format === 'html') {
					result.display.appendChild(ul);
				}
			}
		}
		
		else {
		
			statement = _vocab['hazards']['hazards-no-metadata'][_mode] + _punctuation;
			
			if (_output_format === 'html') {
				const p_nometa = document.createElement('p');
					p_nometa.appendChild(document.createTextNode(statement));
				
				result.display.appendChild(p_nometa);
			}
			
			else {
				result.display += '\n\t\t\t' + JSON.stringify(statement);
			}
			
			result.hasMetadata = false;
		}
		
		
		if (_output_format === 'json') {
			result.display += '\n\t\t]';
		}
		
		return result;
	}
	
	
	/* 
	 * 3.6 Accessibility summary
	 */
	 
	 function accessibilitySummary() {
	 
		// return values
		const result = {};
			result.hasMetadata = true;
			result.display = _output_format === 'html' ? document.createElement('div') : '[';
		
		// 3.6.2 Variables setup
		
		// onix algorithm only
		const accessibility_addendum = _isONIX ? _record.evaluate(xpath.summary.accessibility_addendum[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue : '';

		const accessibility_summary =  _record.evaluate(xpath.summary.accessibility_summary[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// onix algorithm only
		const known_limited_accessibility = _isONIX ? _record.evaluate(xpath.summary.known_limited_accessibility[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue : '';
		
		// onix algorithm only
		const lang_attribute_accessibility_addendum = _isONIX ? _record.evaluate(xpath.summary.lang_attribute_accessibility_addendum[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue : '';
		
		const lang_attribute_accessibility_summary = _record.evaluate(xpath.summary.lang_attribute_accessibility_summary[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// onix algorithm only
		const lang_known_limited_accessibility = _isONIX ? _record.evaluate(xpath.summary.lang_known_limited_accessibility[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue : '';
		
		const language_of_text = _record.evaluate(xpath.summary.language_of_text[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;

		// onix algorithm only
		const accessibility_summary_publisher_contact = _record.evaluate(xpath.summary.accessibility_summary_publisher_contact[_input_format], _record, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		

		// 3.6.3 Instructions
		
		const sum_result = document.createElement('p');
		
		let language_accessibility_addendum = '';
		let language_accessibility_summary = '';
		let language_known_limited_accessibility = '';
		
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
			if (_output_format === 'html') {
				const p_kla = document.createElement('p');
					p_kla.appendChild(document.createTextNode(known_limited_accessibility));
					p_kla.lang = language_known_limited_accessibility;
				result.display.appendChild(p_kla);
			}
			
			else {
				result.display += '\n\t\t\t' + JSON.stringify(known_limited_accessibility);
			}
		}
		
		if (accessibility_addendum) {
			if (_output_format === 'html') {
				const p_aa = document.createElement('p');
					p_aa.appendChild(document.createTextNode(accessibility_addendum));
					p_aa.lang = language_accessibility_addendum;
				result.display.appendChild(p_aa);
			}
			
			else {
				result.display += jsonFormat(known_limited_accessibility, (result.display !== '['), 3);
			}
		}
		
		else if (accessibility_summary) {
			if (_output_format === 'html') {
				sum_result.appendChild(document.createTextNode(accessibility_summary));
				sum_result.lang = language_accessibility_summary;
			}
			
			else {
				result.display += jsonFormat({value: accessibility_summary, comma: (result.display !== '['), tabs: 3, punctuate: false});
			}
		}
		
		else {
			
			statement = _vocab['accessibility-summary']['accessibility-summary-no-metadata'][_mode] + _punctuation;
			
			if (_output_format === 'html') {
				sum_result.appendChild(document.createTextNode(statement));
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: (result.display !== '['), tabs: 3, punctuate: true});
			}
			
			result.hasMetadata = false;
		}
		
		if (accessibility_summary_publisher_contact) {
			statement = _vocab['accessibility-summary']['accessibility-summary-publisher-contact'][_mode] + _punctuation;
			const contact_email = '<a href="mailto:' + accessibility_summary_publisher_contact + '">' + accessibility_summary_publisher_contact + '</a>';
			
			statement = statement.replace('{accessibility_summary_publisher_contact}', contact_email);
			
			if (_output_format === 'html') {
				const p_pca = document.createElement('p');
					p_pca.innerHTML = statement;
				sum_result.appendChild(p_pca);
			}
			
			else {
				result.display += jsonFormat({value: statement, comma: true, tabs: 3, punctuate: true});
			}
			
			result.hasMetadata = true;
		}
		
		if (_output_format === 'html') {
			result.display.appendChild(sum_result);
		}
		
		else {
			result.display += '\n\t\t]';
		}
		
		return result;
	}
	
	
	/* 
	 * 3.7 Legal considerations
	 */
	
	function legal() {
	
		// return values
		const result = {};
			result.hasMetadata = true;
			result.display = _output_format === 'html' ? document.createElement('div') : '[';
		
		// 3.7.2 Variables setup
		const exemption = checkForNode(xpath.legal.exemption[_input_format]);
		
		// 3.7.3 Instructions
		
		const legal_result = document.createElement('p');
		let statement = '';
		
		if (exemption) {
			statement = _vocab['legal-considerations']['legal-considerations-exempt'][_mode] + _punctuation;
		}
		
		else {
			statement = _vocab['legal-considerations']['legal-considerations-no-metadata'][_mode] + _punctuation;
			result.hasMetadata = false;
		}
		
		if (_output_format === 'html') {
			legal_result.appendChild(document.createTextNode(statement));
			result.display.appendChild(legal_result);
		}
		
		else {
			result.display += '\n\t\t\t' + JSON.stringify(statement);
			result.display += '\n\t\t]';
		}
		
		return result;
	}
	
	
	/* 
	 * 3.8 Additional accessibility information
	 */
	 
	 function additionalA11yInfo() {
	 
		// return values
		const result = {};
			result.hasMetadata = false; // assume no metadata and flip as testing
			result.display = _output_format === 'html' ? document.createElement('div') : '[';
		
		// 3.8.2 Variables setup
		
		// epub algorithm only
		const aria = _input_format == !_isONIX ? checkForNode(xpath.add_info.aria[_input_format]) : false;
		
		// epub algorithm only
		const audio_descriptions = !_isONIX ? checkForNode(xpath.add_info.audio_descriptions[_input_format]) : false;
		
		// epub algorithm only
		const braille = !_isONIX ? checkForNode(xpath.add_info.braille[_input_format]) : false;
		
		// onix algorithm only
		const color_not_sole_means_of_conveying_information = _isONIX ? checkForNode(xpath.add_info.color_not_sole_means_of_conveying_information[_input_format]) : false;
		
		// onix algorithm only
		const dyslexia_readability = _isONIX ? checkForNode(xpath.add_info.dyslexia_readability[_input_format]) : false;

		// epub algorithm only
		const full_ruby_annotations = !_isONIX ? checkForNode(xpath.add_info.full_ruby_annotations[_input_format]) : false;
		
		const high_contrast_between_foreground_and_background_audio = checkForNode(xpath.add_info.high_contrast_between_foreground_and_background_audio[_input_format]);
		
		const high_contrast_between_text_and_background = checkForNode(xpath.add_info.high_contrast_between_text_and_background[_input_format]);
		
		// epub algorithm only
		const large_print = !_isONIX ? checkForNode(xpath.add_info.large_print[_input_format]) : false;
		
		// epub algorithm only
		const page_break_markers = !_isONIX ? checkForNode(xpath.add_info.page_break_markers[_input_format]) : false;
		
		// epub algorithm only
		const ruby_annotations = !_isONIX ? checkForNode(xpath.add_info.ruby_annotations[_input_format]) : false;
		
		const sign_language = checkForNode(xpath.add_info.sign_language[_input_format]);
		
		// epub algorithm only
		const tactile_graphic = !_isONIX ? checkForNode(xpath.add_info.tactile_graphic[_input_format]) : false;
		
		// epub algorithm only
		const tactile_object = !_isONIX ? checkForNode(xpath.add_info.tactile_object[_input_format]) : false;
		
		const text_to_speech_hinting = checkForNode(xpath.add_info.text_to_speech_hinting[_input_format]);

		// onix algorithm only
		const ultra_high_contrast_between_text_and_background = _isONIX ? checkForNode(xpath.add_info.ultra_high_contrast_between_text_and_background[_input_format]) : false;
		
		// onix algorithm only
		const visible_page_numbering = _isONIX ? checkForNode(xpath.add_info.page_break_markers[_input_format]) : false;
		
		// onix algorithm only
		const without_background_sounds = _isONIX ? checkForNode(xpath.add_info.without_background_sounds[_input_format]) : false;
		
		
		// 3.8.3 Instructions
		
		const add_info = [];
		
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
		
		const aai = document.createElement('ul');
		
		add_info.sort().forEach((info) => {
			if (_output_format === 'html') {
				const li = document.createElement('li');
					li.appendChild(document.createTextNode(info));
				aai.appendChild(li);
			}
			else {
				result.display += jsonFormat({value: info, comma: (result.display !== '['), tabs: 3, punctuate: false});
			}
			result.hasMetadata = true;
		});
		
		if (_output_format === 'html') {
			result.display.appendChild(aai);
		}
		
		else {
			result.display += '\n\t\t]';
		}
		
		return result;
	}
	
	
	// 3.1 Preprocessing
	
	function preprocessing(record_as_text) {
		
		let record = null;
		
		try {
			const parser = new DOMParser();
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
		const result = _record.evaluate(path, _record, nsResolver, XPathResult.BOOLEAN_TYPE, null);
		return result.booleanValue;
	}
	
	
	// other functions
	
	// get the heading for a section or subsection
	function getHeader(id, sub_hd) {
		const title_id = id + (sub_hd ? '-' + sub_hd : '-title');
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
			case 'dc':
				return 'http://purl.org/dc/elements/1.1/';
			case 'onix':
				return "http://ns.editeur.org/onix/3.0/reference";
			case 'opf':
				return "http://www.idpf.org/2007/opf";
		}
	}
	
	// formats the json array values
	function jsonFormat(options) {
		
		let indent = options.comma ? ',\n' : '\n';
		
		if (options.tabs) {
			for (let i = 0; i < options.tabs; i++) {
				indent += '\t';
			}
		}
		
		return indent + JSON.stringify(options.value + (options.punctuate ? _punctuation : ''));
	}
	
	
	/* return the vocabulary strings in the preferred locale */
	
	function getVocab(lang) {
	
		let vocab = null;
		
		switch (lang) {
			case "de":
				vocab = de;
				break;
				
			case "es-es":
				vocab = es_es;
				break;
			
			case "fr-fr":
				vocab = fr_fr;
				break;
				
			case "it":
				vocab = it;
				break;
				
			case "ja":
				vocab = ja;
				break;
				
			case "sv":
				vocab = sv;
				break;
			
			default:
				vocab = en;
		}
		
		return vocab;
		
	}
	
	/* language-specific punctuation */
	
	function getPunctuation() {
		switch (_lang) {
			default:
				return '.';
		}
	}
	
	
	
	/* info about the processing */
	
	function generalInfo() {
		
		const result = {};
			result.title = '';
			result.publisher = '';
			result.lang = '';
			result.translation = {};
			result.translation.creator = '';
			result.translation.lang = '';
			result.translation.version = '';
			result.translation.desc = '';
		
		const title_node = _record.evaluate( xpath['pub_info']['title'][_input_format], _record, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
		
		if (title_node.snapshotLength) {
		
			if (_isONIX) {
				let prefix = title_node.snapshotItem(0).querySelector('TitlePrefix');
				
				if (prefix) {
					result.title = prefix.innerHTML + ' ';
				}
				
				let title = title_node.snapshotItem(0).querySelector('TitleWithoutPrefix');
				
				if (title) {
					result.title += title.innerHTML;
				}
			}
			
			else {
				result.title = title_node.snapshotItem(0).textContent.trim();
			}
		}
		
		const pub_node = _record.evaluate( xpath['pub_info']['publisher'][_input_format], _record, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
		
		if (pub_node.snapshotLength) {
			result.publisher = pub_node.snapshotItem(0).textContent.trim();
		}
		
		const lang_node = _record.evaluate( xpath['pub_info']['language'][_input_format], _record, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
		
		if (lang_node.snapshotLength) {
			result.lang = lang_node.snapshotItem(0).textContent.trim();
			// correct three-letter onix language code
			if (_isONIX && langMap.hasOwnProperty(result.lang)) {
				result.lang = langMap[result.lang];
			}
		}
		
		
		// add translator
		if (_vocab['metadata'].hasOwnProperty('author')) {
			result.translation.creator = _vocab['metadata']['author'];
		}
		
		// add translation language
		if (_vocab['metadata'].hasOwnProperty('language')) {
			result.translation.lang = _vocab['metadata']['language'];
		}
		
		// add version
		if (_vocab['metadata'].hasOwnProperty('version')) {
			result.translation.version = _vocab['metadata']['version'];
		}
		
		// add description
		if (_vocab['metadata'].hasOwnProperty('description')) {
			result.translation.desc = _vocab['metadata']['description'];
		}
		
		return result;
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
		
		processGeneralInfo: function() {
			return generalInfo();
		},
		
		getDisplay: function() {
			return _result;
		},
		
		getHeader: function(id, sub_hd) {
			return getHeader(id, sub_hd);
		},
		
		getLanguage: function() {
			return _lang;
		}
	}
})();

const langMap = {
	aar: "aa",
	abk: "ab",
	afr: "af",
	aka: "ak",
	alb: "sq",
	amh: "am",
	ara: "ar",
	arg: "an",
	arm: "hy",
	asm: "as",
	ava: "av",
	ave: "ae",
	aym: "ay",
	aze: "az",
	bak: "ba",
	bam: "bm",
	baq: "eu",
	bel: "be",
	ben: "bn",
	bih: "bh",
	bis: "bi",
	bos: "bs",
	bre: "br",
	bul: "bg",
	bur: "my",
	cat: "ca",
	cha: "ch",
	che: "ce",
	chi: "zh",
	chu: "cu",
	chv: "cv",
	cor: "kw",
	cos: "co",
	cre: "cr",
	cze: "cs",
	dan: "da",
	div: "dv",
	dut: "nl",
	dzo: "dz",
	eng: "en",
	epo: "eo",
	est: "et",
	ewe: "ee",
	fao: "fo",
	fij: "fj",
	fin: "fi",
	fre: "fr",
	fry: "fy",
	ful: "ff",
	geo: "ka",
	ger: "de",
	gla: "gd",
	gle: "ga",
	glg: "gl",
	glv: "gv",
	gre: "el",
	grn: "gn",
	guj: "gu",
	hat: "ht",
	hau: "ha",
	heb: "he",
	her: "hz",
	hin: "hi",
	hmo: "ho",
	hrv: "hr",
	hun: "hu",
	ibo: "ig",
	ice: "is",
	ido: "io",
	iii: "ii",
	iku: "iu",
	ile: "ie",
	ina: "ia",
	ind: "id",
	ipk: "ik",
	ita: "it",
	jav: "jv",
	jpn: "ja",
	kal: "kl",
	kan: "kn",
	kas: "ks",
	kau: "kr",
	kaz: "kk",
	khm: "km",
	kik: "ki",
	kin: "rw",
	kir: "ky",
	kom: "kv",
	kon: "kg",
	kor: "ko",
	kua: "kj",
	kur: "ku",
	lao: "lo",
	lat: "la",
	lav: "lv",
	lim: "li",
	lin: "ln",
	lit: "lt",
	ltz: "lb",
	lub: "lu",
	lug: "lg",
	mac: "mk",
	mah: "mh",
	mal: "ml",
	mao: "mi",
	mar: "mr",
	may: "ms",
	mlg: "mg",
	mlt: "mt",
	mon: "mn",
	nau: "na",
	nav: "nv",
	nbl: "nr",
	nde: "nd",
	ndo: "ng",
	nep: "ne",
	nno: "nn",
	nob: "nb",
	nor: "no",
	nya: "ny",
	oci: "oc",
	oji: "oj",
	ori: "or",
	orm: "om",
	oss: "os",
	pan: "pa",
	per: "fa",
	pli: "pi",
	pol: "pl",
	por: "pt",
	pus: "ps",
	que: "qu",
	roh: "rm",
	rum: "ro",
	run: "rn",
	rus: "ru",
	sag: "sg",
	san: "sa",
	sin: "si",
	slo: "sk",
	slv: "sl",
	sme: "se",
	smo: "sm",
	sna: "sn",
	snd: "sd",
	som: "so",
	sot: "st",
	spa: "es",
	srd: "sc",
	srp: "sr",
	ssw: "ss",
	sun: "su",
	swa: "sw",
	swe: "sv",
	tah: "ty",
	tam: "ta",
	tat: "tt",
	tel: "te",
	tgk: "tg",
	tgl: "tl",
	tha: "th",
	tib: "bo",
	tir: "ti",
	ton: "to",
	tsn: "tn",
	tso: "ts",
	tuk: "tk",
	tur: "tr",
	twi: "tw",
	uig: "ug",
	ukr: "uk",
	urd: "ur",
	uzb: "uz",
	ven: "ve",
	vie: "vi",
	vol: "vo",
	wel: "cy",
	wln: "wa",
	wol: "wo",
	xho: "xh",
	yid: "yi",
	yor: "yo",
	zha: "za",
	zul: "zu"
};

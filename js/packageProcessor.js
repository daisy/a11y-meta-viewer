
'use strict';

var packageProcessor = (function() {
	
	function processPackageDoc(package_document_as_text, version, vocab, style) {
	
		var result = document.createElement('div');
			result.classList.add('grid');
		
		/* 
		 * The specification calls the preprocessing step for every technique but that's
		 * omitted from this code. The package_document variable is only configured once
		 */  
		
		var package_document = preprocessing(package_document_as_text);
		
		if (!package_document) {
			return;
		}
		
		/* 
		 * 4.1 Ways of reading
		 */
		
		// add header
		result.appendChild(makeHeader(vocab['ways-of-reading']['ways-of-reading-title'], ''));
		
		// grid grouping element
		var wor_group = document.createElement('div');
			wor_group.classList.add('grid-body');
		
		/* 
		 * 4.1.1 Visual adjustments
		 */
		 
		// 4.1.1.2 Variables setup
		var all_textual_content_can_be_modified = checkForNode(package_document, xpath.all_textual_content_can_be_modified[version]);
		var is_fixed_layout = checkForNode(package_document, xpath.is_fixed_layout[version]);
		
		// 4.1.1.3 Instructions
		
		var vis_result = document.createElement('p');
		
		if (is_fixed_layout) {
			vis_result.appendChild(document.createTextNode(vocab['visual-adjustments']['visual-adjustments-unmodifiable'][style]));
		}
		
		else if (all_textual_content_can_be_modified) {
			vis_result.appendChild(document.createTextNode(vocab['visual-adjustments']['visual-adjustments-modifiable'][style]));
		}
		
		else {
			vis_result.appendChild(document.createTextNode(vocab['visual-adjustments']['visual-adjustments-unknown'][style]));
		}
		
		// Following additions are not in the algorithm
		
		// add punctuation - not in algorithm
		vis_result.appendChild(getPunctuation());
		
		wor_group.appendChild(vis_result);
		
		
		/* 
		 * 4.1.2 Supports nonvisual reading
		 */
		 
		// 4.1.2.2 Variables setup
		var all_necessary_content_textual = checkForNode(package_document, xpath.all_necessary_content_textual[version]);
		var non_textual_content_images = checkForNode(package_document, xpath.non_textual_content_images[version]);
		var textual_alternative_images = checkForNode(package_document, xpath.textual_alternative_images[version]);
		
		// 4.1.2.3 Instructions
		
		if (textual_alternative_images) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(vocab['nonvisual-reading']['nonvisual-reading-alt-text'][style]));
		
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			wor_group.appendChild(p);
		}
		
		var nonvis_result = document.createElement('p');
		
		if (all_necessary_content_textual) {
			nonvis_result.appendChild(document.createTextNode(vocab['nonvisual-reading']['nonvisual-reading-readable'][style]));
		}
		
		else if (non_textual_content_images && !textual_alternative_images) {
			nonvis_result.appendChild(document.createTextNode(vocab['nonvisual-reading']['nonvisual-reading-not-fully'][style]));
		}
		
		else {
			nonvis_result.appendChild(document.createTextNode(vocab['nonvisual-reading']['nonvisual-reading-may-not-fully'][style]));
		}
		
		// add punctuation - not in algorithm
		nonvis_result.appendChild(getPunctuation());
		
		wor_group.appendChild(nonvis_result);
		
		
		/* 
		 * 4.1.3 Prerecorded audio
		 */
		 
		// 4.1.3.2 Variables setup
		var all_content_audio = checkForNode(package_document, xpath.all_content_audio[version]);
		var synchronised_pre_recorded_audio = checkForNode(package_document, xpath.synchronised_pre_recorded_audio[version]);
		var audio_content = checkForNode(package_document, xpath.audio_content[version]);
		
		// 4.1.3.3 Instructions
		
		var prerec_result = document.createElement('p');
		
		if (all_content_audio) {
			prerec_result.appendChild(document.createTextNode('Prerecorded audio only'));
		}
		
		else if (synchronised_pre_recorded_audio) {
			prerec_result.appendChild(document.createTextNode('Prerecorded audio synchronized with text'));
		}
		
		else if (audio_content) {
			prerec_result.appendChild(document.createTextNode('Complementary audio and text'));
		}
		
		else {
			prerec_result.appendChild(document.createTextNode('No information is available about prerecorded audio'));
		}
		
		// add punctuation - not in algorithm
		prerec_result.appendChild(getPunctuation());
		
		wor_group.appendChild(prerec_result);
		result.appendChild(wor_group);
		
		
		/* 
		 * 4.2 Conformance
		 */
		 
		// 4.2.2 Variables setup
		var conformance_string = '';
		var wcag_level = '';
		
		if (checkForNode(package_document, xpath.epub10a[version])) {
			conformance_string = 'EPUB Accessibility 1.0 WCAG 2.0 Level A';
			wcag_level = 'A';
		}
		
		if (checkForNode(package_document, xpath.epub10aa[version])) {
			conformance_string = 'EPUB Accessibility 1.0 WCAG 2.0 Level AA';
			wcag_level = 'AA';
		}
		
		if (checkForNode(package_document, xpath.epub10aaa[version])) {
			conformance_string = 'EPUB Accessibility 1.0 WCAG 2.0 Level AAA';
			wcag_level = 'AAA';
		}
		
		// js evaluate() can't handle this expression: 
		// /opf:package/opf:metadata/opf:meta[@property="dcterms:conformsTo" and matches(normalize-space(), "EPUB Accessibility 1\.1 - WCAG 2\.[0-2] Level [A]+")]
		// using contains() instead to match most of it
		
		var conformance = package_document.evaluate(xpath.conformance[version], package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		if (conformance) {
		
			conformance = conformance.trim();
			
			conformance_string = conformance.replace(' - ', ' ').trim();
			
			var level_re = new RegExp('EPUB Accessibility 1\\.1 - WCAG 2\\.[0-2] Level ');
			wcag_level = conformance.replace(level_re, '');
		}
		
		var certifier = package_document.evaluate(xpath.certifier[version], package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certifier_credentials = package_document.evaluate(xpath.certifier_credentials[version], package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certification_date = package_document.evaluate(xpath.certification_date[version], package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certifier_report = package_document.evaluate(xpath.certifier_report[version], package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 4.2.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Conformance', ''));
		
		// grid grouping element
		var conf_group = document.createElement('div');
			conf_group.classList.add('grid-body');
		
		if (!conformance_string) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available.'))
			conf_group.appendChild(p);
		}
		
		else {
		
			var conf_p = document.createElement('p');
			
			if (wcag_level == 'AAA') {
				conf_p.appendChild(document.createTextNode('This publication exceeds accepted accessibility standards'));
			}
			
			else if (wcag_level == 'AA') {
				conf_p.appendChild(document.createTextNode('This publication meets accepted accessibility standards'));
			}
			
			else if (wcag_level == 'A') {
				conf_p.appendChild(document.createTextNode('This publication meets minimum accessibility standards'));
			}
			
			// add punctuation - not in algorithm
			conf_p.appendChild(getPunctuation());
			
			conf_group.appendChild(conf_p);
			
			
			if (certifier) {
				var cert_p = document.createElement('p');
				
				cert_p.appendChild(document.createTextNode('This publication is certified by '));
				cert_p.appendChild(document.createTextNode(certifier));
				
				// add punctuation - not in algorithm
				cert_p.appendChild(getPunctuation());
				
				conf_group.appendChild(cert_p);
			}
			
			if (certifier_credentials) {
				
				var cred_p = document.createElement('p');
				
				cred_p.appendChild(document.createTextNode('The certifier\'s credential is '));
				
				if (certifier_credentials.match('^http')) {
					var cert_link = document.createElement('a');
						cert_link.href = certifier_credentials;
						cert_link.appendChild(document.createTextNode(certifier_credentials));
					cred_p.appendChild(cert_link);
				}
				
				else {
					cred_p.appendChild(document.createTextNode(certifier_credentials));
				}
				
				// add punctuation - not in algorithm
				cred_p.appendChild(getPunctuation());
				
				conf_group.appendChild(cred_p);
			}
			
			var detconf_hd = document.createElement('h4');
				detconf_hd.appendChild(document.createTextNode('Detailed Conformance Information'));
			conf_group.appendChild(detconf_hd);
			
			var conf_p = document.createElement('p');
				conf_p.appendChild(document.createTextNode('This publication claims to meet '));
				conf_p.appendChild(document.createTextNode(conformance_string));
				
			// add punctuation - not in algorithm
			conf_p.appendChild(getPunctuation());
			
			conf_group.appendChild(conf_p);
			
			var cert_p = document.createElement('p');
			
			if (certification_date || certifier || certifier_credentials) {
				cert_p.appendChild(document.createTextNode('The publication was certified '));
			}
			
			if (certification_date) {
				cert_p.appendChild(document.createTextNode(' on '));
				cert_p.appendChild(document.createTextNode(certification_date));
			}
			
			// add punctuation - not in algorithm
			cert_p.appendChild(getPunctuation());
			
			conf_group.appendChild(cert_p);
			
			if (certifier_report) {
				
				var rep_p = document.createElement('p');
				
				var rep_link = document.createElement('a');
					rep_link.href = certifier_credentials;
					rep_link.appendChild(document.createTextNode('For more information refer to the certifier\'s report'));
				rep_p.appendChild(rep_link);
				
				// add punctuation - not in algorithm
				rep_p.appendChild(getPunctuation());
				
				conf_group.appendChild(rep_p);
			}
		}
		
		result.appendChild(conf_group);
		

		/* 
		 * 4.3 Navigation
		 */
		 
		// 4.3.2 Variables setup
		var table_of_contents_navigation = checkForNode(package_document, xpath.table_of_contents_navigation[version]);
		var index_navigation = checkForNode(package_document, xpath.index_navigation[version]);
		var page_navigation = checkForNode(package_document, xpath.page_navigation[version]);
		var next_previous_structural_navigation = checkForNode(package_document, xpath.next_previous_structural_navigation[version]);
		
		// 4.3.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Navigation', ''));
		
		// grid grouping element
		var nav_group = document.createElement('div');
			nav_group.classList.add('grid-body');
		
		if (table_of_contents_navigation || index_navigation || page_navigation || next_previous_structural_navigation) {
			
			var navigation = document.createElement('ul');
			
			if (table_of_contents_navigation) {
				var li = document.createElement('li');
					li.appendChild(document.createTextNode('Table of contents'));
				navigation.appendChild(li);
			}
			
			if (index_navigation) {
				var li = document.createElement('li');
					li.appendChild(document.createTextNode('Index'));
				navigation.appendChild(li);
			}
			
			if (page_navigation) {
				var li = document.createElement('li');
					li.appendChild(document.createTextNode('Go to page'));
				navigation.appendChild(li);
			}
			
			if (next_previous_structural_navigation) {
				var li = document.createElement('li');
					li.appendChild(document.createTextNode('Headings'));
				navigation.appendChild(li);
			}
			
			nav_group.appendChild(navigation);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
				
				// add punctuation - not in algorithm
				p.appendChild(getPunctuation());
			
			nav_group.appendChild(p);
		}
		
		result.appendChild(nav_group);
		
		
		/* 
		 * 4.4 Rich content
		 */
		 
		// 4.4.2 Variables setup
		var contains_charts_diagrams = checkForNode(package_document, xpath.contains_charts_diagrams[version]);
		var long_text_descriptions = checkForNode(package_document, xpath.long_text_descriptions[version]);
		var contains_chemical_formula = checkForNode(package_document, xpath.contains_chemical_formula[version]);
		var chemical_formula_as_latex = checkForNode(package_document, xpath.chemical_formula_as_latex[version]);
		var chemical_formula_as_mathml = checkForNode(package_document, xpath.chemical_formula_as_mathml[version]);
		var contains_math_formula = checkForNode(package_document, xpath.contains_math_formula[version]);
		var math_formula_as_latex = checkForNode(package_document, xpath.math_formula_as_latex[version]);
		var math_formula_as_mathml = checkForNode(package_document, xpath.math_formula_as_mathml[version]);
		var closed_captions = checkForNode(package_document, xpath.closed_captions[version]);
		var open_captions = checkForNode(package_document, xpath.open_captions[version]);
		var transcript = checkForNode(package_document, xpath.transcript[version]);
		
		// 4.4.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Rich content', ''));
		
		// grid grouping element
		var rc_group = document.createElement('div');
			rc_group.classList.add('grid-body');
		
		var richcontent = document.createElement('ul');
		
		if (math_formula_as_mathml) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Math as MathML'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (math_formula_as_latex) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Math as LaTeX'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (contains_math_formula) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Math as images with text description'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (chemical_formula_as_mathml) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Chemical formulas in MathML'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (chemical_formula_as_latex) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Chemical formulas in LaTex'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (long_text_descriptions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Information-rich images are described by extended descriptions'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (closed_captions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Videos have closed captions'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (open_captions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Videos have open captions'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (transcript) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Has transcript'));
			
			// add punctuation - not in algorithm
			li.appendChild(getPunctuation());
			
			richcontent.appendChild(li);
		}
		
		if (richcontent.childElementCount) {
			rc_group.appendChild(richcontent);
		}
		
		if (!(math_formula_as_mathml || math_formula_as_latex || (contains_math_formula && long_text_descriptions) || chemical_formula_as_mathml || long_text_descriptions || closed_captions || open_captions || transcript)) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
			
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			rc_group.appendChild(p);
		}
		
		result.appendChild(rc_group);
		
		
		/* 
		 * 4.5 Hazards
		 */
		 
		// 4.5.2 Variables setup
		var no_hazards_or_warnings_confirmed = checkForNode(package_document, xpath.no_hazards_or_warnings_confirmed[version]);
		var flashing_hazard = checkForNode(package_document, xpath.flashing_hazard[version]);
		var no_flashing_hazards = checkForNode(package_document, xpath.no_flashing_hazards[version]);
		var motion_simulation_hazard = checkForNode(package_document, xpath.motion_simulation_hazard[version]);
		var no_motion_hazards = checkForNode(package_document, xpath.no_motion_hazards[version]);
		var sound_hazard = checkForNode(package_document, xpath.sound_hazard[version]);
		var no_sound_hazards = checkForNode(package_document, xpath.no_sound_hazards[version]);
		var unknown_if_contains_hazards = checkForNode(package_document, xpath.unknown_if_contains_hazards[version]);
		
		// 4.5.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Hazards', ''));
		
		// grid grouping element
		var haz_group = document.createElement('div');
			haz_group.classList.add('grid-body');
		
		if (no_hazards_or_warnings_confirmed || (no_flashing_hazards && no_motion_hazards && no_sound_hazards)) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No hazards'));
			haz_group.appendChild(p);
		}
		
		else if (flashing_hazard || motion_simulation_hazard || sound_hazard) {
		
			if (flashing_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode('Flashing'));
			
				// add punctuation - not in algorithm
				p.appendChild(getPunctuation());
				
				haz_group.appendChild(p);
			}
			
			if (motion_simulation_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode('Motion simulation'));
			
				// add punctuation - not in algorithm
				p.appendChild(getPunctuation());
				
				haz_group.appendChild(p);
			}
			
			if (sound_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode('Loud sounds'));
			
				// add punctuation - not in algorithm
				p.appendChild(getPunctuation());
				
				haz_group.appendChild(p);
			}
		}

		else if (unknown_if_contains_hazards) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('The presence of hazards is unknown'));
		
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			haz_group.appendChild(p);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
		
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			haz_group.appendChild(p);
		}
		
		result.appendChild(haz_group);
		
		
		/* 
		 * 4.6 Accessibility summary
		 */
		 
		// 4.6.2 Variables setup
		var accessibility_summary =  package_document.evaluate(xpath.accessibility_summary[version], package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var lang_attribute_accessibility_summary = package_document.evaluate(xpath.lang_attribute_accessibility_summary[version], package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var language_of_text = package_document.evaluate(xpath.language_of_text[version], package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 4.6.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Accessibility summary', ''));
		
		// grid grouping element
		var sum_group = document.createElement('div');
			sum_group.classList.add('grid-body');
		
		var sum_result = document.createElement('p');
		
		var language_accessibility_summary;
		
		if (lang_attribute_accessibility_summary) {
			language_accessibility_summary = lang_attribute_accessibility_summary;
		}
		
		else {
			language_accessibility_summary = language_of_text;
		}
		
		if (accessibility_summary) {
			sum_result.appendChild(document.createTextNode(accessibility_summary));
			sum_result.lang = language_accessibility_summary;
		}
		
		else {
			sum_result.appendChild(document.createTextNode('No information is available'));
			
			// add punctuation - not in algorithm
			sum_result.appendChild(getPunctuation());
		}
		
		sum_group.appendChild(sum_result);
		result.appendChild(sum_group);
		
		
		/* 
		 * 4.7 Legal considerations
		 */
		 
		// 4.7.2 Variables setup
		var eaa_exemption_micro_enterprises = checkForNode(package_document, xpath.eaa_exemption_micro_enterprises[version]);
		var eaa_exception_disproportionate_burden = checkForNode(package_document, xpath.eaa_exception_disproportionate_burden[version]);
		var eaa_exception_fundamental_modification = checkForNode(package_document, xpath.eaa_exception_fundamental_modification[version]);
		
		// 4.7.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Legal considerations', ''));
		
		// grid grouping element
		var legal_group = document.createElement('div');
			legal_group.classList.add('grid-body');
		
		var legal_result = document.createElement('p');
		
		if (eaa_exemption_micro_enterprises || eaa_exception_disproportionate_burden || eaa_exception_fundamental_modification) {
			legal_result.appendChild(document.createTextNode('Claims an accessibility exemption in some jurisdictions'));
		}
		
		else {
			legal_result.appendChild(document.createTextNode('No information is available'));
		}
		
		// add punctuation - not in algorithm
		legal_result.appendChild(getPunctuation());
		
		legal_group.appendChild(legal_result);
		result.appendChild(legal_group);
		
		
		/* 
		 * 4.8 Additional accessibility information
		 */
		 
		// add header
		result.appendChild(makeHeader('Additional accessibility information', ''));
		
		var aai = document.createElement('ul');
		
		// grid grouping element
		var aai_group = document.createElement('div');
			aai_group.classList.add('grid-body');
		
		// 4.8.1 Adaptation
		// 4.8.1.2 Variables setup
		var audio_descriptions = checkForNode(package_document, xpath.audio_descriptions[version]);
		var braille = checkForNode(package_document, xpath.braille[version]);
		var tactile_graphic = checkForNode(package_document, xpath.tactile_graphic[version]);
		var tactile_object = checkForNode(package_document, xpath.tactile_object[version]);
		var sign_language = checkForNode(package_document, xpath.sign_language[version]);
		
		// 4.8.1.3 Instructions
		
		if (audio_descriptions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Audio descriptions'));
			aai.appendChild(li);
		}
		
		if (braille) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Braille'));
			aai.appendChild(li);
		}
		
		if (tactile_graphic) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Tactile graphics'));
			aai.appendChild(li);
		}
		
		if (tactile_object) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Tactile 3D objects'));
			aai.appendChild(li);
		}
		
		if (sign_language) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Sign language'));
			aai.appendChild(li);
		}
		
		// 4.8.2 Clarity
		// 4.8.2.2 Variables setup
		var aria = checkForNode(package_document, xpath.aria[version]);
		var full_ruby_annotations = checkForNode(package_document, xpath.full_ruby_annotations[version]);
		var text_to_speech_hinting = checkForNode(package_document, xpath.text_to_speech_hinting[version]);
		var high_contrast_between_foreground_and_background_audio = checkForNode(package_document, xpath.high_contrast_between_foreground_and_background_audio[version]);
		var high_contrast_between_text_and_background = checkForNode(package_document, xpath.high_contrast_between_text_and_background[version]);
		var large_print = checkForNode(package_document, xpath.large_print[version]);
		var page_break_markers = checkForNode(package_document, xpath.page_break_markers[version]);
		var ruby_annotations = checkForNode(package_document, xpath.ruby_annotations[version]);
		
		// 4.8.2.3 Instructions
		
		if (aria) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('ARIA'));
			aai.appendChild(li);
		}
		
		if (full_ruby_annotations) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Full ruby annotations'));
			aai.appendChild(li);
		}
		
		if (text_to_speech_hinting) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Text-to-speech hinting provided'));
			aai.appendChild(li);
		}
		
		if (high_contrast_between_foreground_and_background_audio) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('High contrast between foreground and background audio'));
			aai.appendChild(li);
		}
		
		if (high_contrast_between_text_and_background) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('High contrast between text and background'));
			aai.appendChild(li);
		}
		
		if (large_print) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Large print'));
			aai.appendChild(li);
		}
		
		if (page_break_markers) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Page breaks'));
			aai.appendChild(li);
		}
		
		if (ruby_annotations) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Ruby annotations'));
			aai.appendChild(li);
		}
		
		aai_group.appendChild(aai);
		result.appendChild(aai_group);
		
		return result;
		
	}
	
	// 3.1 Preprocessing
	
	function preprocessing(package_document_as_text) {
		
		var package_document;
		
		try {
			var parser = new DOMParser();
			package_document = parser.parseFromString(package_document_as_text, "text/xml");
		}
		
		catch (e) {
			alert('Error parsing package document: ' + e);
			package_document = null;
		}
		
		return package_document;
	}
	
	
	// 3.2 Check for node
	
	function checkForNode(package_document, path) {
		var result = package_document.evaluate(path, package_document, nsResolver, XPathResult.BOOLEAN_TYPE, null);
		return result.booleanValue;
	}
	
	
	// other functions
	
	function nsResolver(prefix) {
		switch (prefix) {
			case 'xml':
				return 'http://www.w3.org/XML/1998/namespace';
			default:
				return "http://www.idpf.org/2007/opf";
		}
	}	
	
	
	return {
		processPackageDoc: function(packageDoc, version, vocab, style) {
			return processPackageDoc(packageDoc, version, vocab, style);
		}
	}	
})();


'use strict';

var onixProcessor = (function() {

	function processOnixRecord(onix_record_as_text, version, vocab, style) {
	
		var result = document.createElement('div');
			result.classList.add('grid');
		
		/* 
		 * The specification calls the preprocessing step for every technique but that's
		 * omitted from this code. The onix variable is only configured once
		 */  
		
		var onix = preprocessing(onix_record_as_text);
		
		if (!onix) {
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
		var all_textual_content_can_be_modified = checkForNode(onix, xpath.all_textual_content_can_be_modified[version]);
		var is_fixed_layout = checkForNode(onix, xpath.is_fixed_layout[version]) && !checkForNode(onix, xpath.is_reflow[version]);
		
		// 4.1.1.3 Instructions
		
		var vis_result = document.createElement('p');
		
		if (all_textual_content_can_be_modified) {
			vis_result.appendChild(document.createTextNode(vocab['visual-adjustments']['visual-adjustments-modifiable'][style]));
		}
		
		else if (is_fixed_layout) {
			vis_result.appendChild(document.createTextNode(vocab['visual-adjustments']['visual-adjustments-unmodifiable'][style]));
		}
		
		else {
			vis_result.appendChild(document.createTextNode(vocab['visual-adjustments']['visual-adjustments-unknown'][style]));
		}
		
		// add punctuation - not in algorithm
		vis_result.appendChild(getPunctuation());
		
		wor_group.appendChild(vis_result);
		
		
		/* 
		 * 4.1.2 Supports nonvisual reading
		 */
		 
		 // 4.1.2.2 Variables setup
		 var all_necessary_content_textual = checkForNode(onix, xpath.all_necessary_content_textual[version]);
		 var real_text = checkForNode(onix, xpath.real_text[version]);
		 var non_textual_content_images = checkForNode(onix, xpath.non_textual_content_images[version]);
		 var textual_alternative_images = checkForNode(onix, xpath.textual_alternative_images[version]);
		
		// 4.1.2.3 Instructions
		
		// add header
		
		if (all_necessary_content_textual) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(vocab['nonvisual-reading']['nonvisual-reading-readable'][style]));
				
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			wor_group.appendChild(p);
			
			if (textual_alternative_images) {
				var p2 = document.createElement('p');
					p2.appendChild(document.createTextNode(vocab['nonvisual-reading']['nonvisual-reading-alt-text'][style]));
					
				// add punctuation - not in algorithm
				p2.appendChild(getPunctuation());
				
				wor_group.appendChild(p2);
			}
		}
		
		else if (real_text && non_textual_content_images && !textual_alternative_images) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(vocab['nonvisual-reading']['nonvisual-reading-not-fully'][style]));
			
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			wor_group.appendChild(p);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(vocab['nonvisual-reading']['nonvisual-reading-may-not-fully'][style]));
			
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			wor_group.appendChild(p);
		}
		
		
		/* 
		 * 4.1.3 Pre-recorded audio
		 */
		 
		 // 4.1.3.2 Variables setup
		 var audiobook = checkForNode(onix, xpath.audiobook[version]);
		 var all_content_audio = checkForNode(onix, xpath.all_content_audio[version]);
		 var all_content_pre_recorded = checkForNode(onix, xpath.all_content_pre_recorded[version]);
		 var synchronised_pre_recorded_audio = checkForNode(onix, xpath.synchronised_pre_recorded_audio_1[version] && checkForNode(onix, xpath.synchronised_pre_recorded_audio_2[version]));
		 var non_textual_content_audio = checkForNode(onix, xpath.non_textual_content_audio[version]);
		 var non_textual_content_audio_in_video = checkForNode(onix, xpath.non_textual_content_audio_in_video[version]);
		
		// 4.1.3.3 Instructions
		
		var prerec_result = document.createElement('p');
		
		if (all_content_audio && !synchronised_pre_recorded_audio) {
			prerec_result.appendChild(document.createTextNode('Prerecorded audio only'));
		}
		
		else if ((audiobook || non_textual_content_audio || non_textual_content_audio_in_video) && !all_content_pre_recorded) {
			prerec_result.appendChild(document.createTextNode('Complementary audio and text'));
		}
		
		else if (all_content_pre_recorded && synchronised_pre_recorded_audio) {
			prerec_result.appendChild(document.createTextNode('Prerecorded audio synchronized with text'));
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
		var epub_accessibility_10 = checkForNode(onix, xpath.epub_accessibility_10_1[version]) || checkForNode(onix, xpath.epub_accessibility_10_2[version]);
		var epub_accessibility_11 = checkForNode(onix, xpath.epub_accessibility_11[version]);
		var wcag_20 = checkForNode(onix, xpath.wcag_20_1[version]) || checkForNode(onix, xpath.wcag_20_2[version]) || checkForNode(onix, xpath.wcag_20_3[version]);
		var wcag_21 = checkForNode(onix, xpath.wcag_21[version]);
		var wcag_22 = checkForNode(onix, xpath.wcag_22[version]);
		var level_a = checkForNode(onix, xpath.level_a_1[version]) || checkForNode(onix, xpath.level_a_2[version]);
		var level_aa = checkForNode(onix, xpath.level_aa_1[version]) || checkForNode(onix, xpath.level_aa_2[version]);
		var level_aaa = checkForNode(onix, xpath.level_aaa[version]);
		var lia_compliant = checkForNode(onix, xpath.lia_compliant[version]);
		var certifier = onix.evaluate(xpath.certifier[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certifier_credentials = onix.evaluate(xpath.certifier_credentials[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certification_date = onix.evaluate(xpath.certification_date[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certifier_report = onix.evaluate(xpath.certifier_report[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 4.2.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Conformance', ''));
		
		// grid grouping element
		var conf_group = document.createElement('div');
			conf_group.classList.add('grid-body');
		
		var conf_p = document.createElement('p');
		
		if (((epub_accessibility_10 || epub_accessibility_11 || wcag_20 || wcag_21 || wcag_22) && (level_a || level_aa || level_aaa)) || lia_compliant) {
		
			if (level_aaa) {
				conf_p.appendChild(document.createTextNode('This publication exceeds accepted accessibility standards'));
			}
			
			else if (level_aa || lia_compliant) {
				conf_p.appendChild(document.createTextNode('This publication meets accepted accessibility standards'));
			}
			
			else if (level_a) {
				conf_p.appendChild(document.createTextNode('This publication meets minimum accessibility standards'));
			}
		}
		
		else {
			conf_p.appendChild(document.createTextNode('The publication does not include a conformance statement'));
		}
		
		// add punctuation - not in algorithm
		conf_p.appendChild(getPunctuation());
		
		conf_group.appendChild(conf_p);

		if (certifier) {
			var cert_p = document.createElement('p');
				cert_p.appendChild(document.createTextNode('This publication was certified by '));
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
		
		if (epub_accessibility_10 || epub_accessibility_11 || wcag_20 || wcag_21 || wcag_22 || level_aaa || level_aa || level_a) {
			conf_p.appendChild(document.createTextNode('This publication claims to meet '));
		}
		
		if (epub_accessibility_10) {
			conf_p.appendChild(document.createTextNode('EPUB Accessibility 1.0 '));
		}
		
		else if (epub_accessibility_11) {
			conf_p.appendChild(document.createTextNode('EPUB Accessibility 1.1 '));
		}
		
		if (wcag_22) {
			conf_p.appendChild(document.createTextNode('WCAG 2.2 '));
		}
		
		else if (wcag_21) {
			conf_p.appendChild(document.createTextNode('WCAG 2.1 '));
		}
		
		else if (wcag_20) {
			conf_p.appendChild(document.createTextNode('WCAG 2.0 '));
		}
		
		if (level_aaa) {
			conf_p.appendChild(document.createTextNode('Level AAA'));
		}
			
		else if (level_aa) {
			conf_p.appendChild(document.createTextNode('Level AA'));
		}
		
		else if (level_a) {
			conf_p.appendChild(document.createTextNode('Level A'));
		}
		
		// add punctuation - not in algorithm
		conf_p.appendChild(getPunctuation());
		
		conf_group.appendChild(conf_p);
		
		if (certification_date) {
			var cert_p = document.createElement('p');
				cert_p.appendChild(document.createTextNode('The publication was certified on '));
				cert_p.appendChild(document.createTextNode(certification_date));
			
			// add punctuation - not in algorithm
			cert_p.appendChild(getPunctuation());
			
			conf_group.appendChild(cert_p);
		}
		
		if (certifier_report) {
			var rep_p = document.createElement('p');
			
			rep_p.appendChild(document.createTextNode('For more information refer to the certifier\'s report '));
			
			var rep_link = document.createElement('a');
				rep_link.href = certifier_credentials;
				rep_link.appendChild(document.createTextNode(certifier_report));
			rep_p.appendChild(rep_link);
			
			// add punctuation - not in algorithm
			rep_p.appendChild(getPunctuation());
			
			conf_group.appendChild(rep_p);
		}
		
		result.appendChild(conf_group);
		

		/* 
		 * 4.3 Navigation
		 */
		 
		// 4.3.2 Variables setup
		var table_of_contents_navigation = checkForNode(onix, xpath.table_of_contents_navigation[version]);
		var index_navigation = checkForNode(onix, xpath.index_navigation[version]);
		var print_equivalent_page_numbering = checkForNode(onix, xpath.print_equivalent_page_numbering[version]);
		var next_previous_structural_navigation = checkForNode(onix, xpath.next_previous_structural_navigation[version]);
		
		// 4.3.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Navigation', ''));
		
		// grid grouping element
		var nav_group = document.createElement('div');
			nav_group.classList.add('grid-body');
		
		if (table_of_contents_navigation || index_navigation || print_equivalent_page_numbering || next_previous_structural_navigation) {
			
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
			
			if (print_equivalent_page_numbering) {
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
		var charts_diagrams_as_non_graphical_data = checkForNode(onix, xpath.charts_diagrams_as_non_graphical_data[version]);
		var full_alternative_textual_descriptions = checkForNode(onix, xpath.full_alternative_textual_descriptions[version]);
		var chemical_formula_as_mathml = checkForNode(onix, xpath.chemical_formula_as_mathml[version]);
		var math_formula_as_latex = checkForNode(onix, xpath.math_formula_as_latex[version]);
		var math_formula_as_mathml = checkForNode(onix, xpath.math_formula_as_mathml[version]);
		var contains_math_formula = checkForNode(onix, xpath.contains_math_formula[version]);
		var short_textual_alternative_images = checkForNode(onix, xpath.short_textual_alternative_images[version]);
		var closed_captions = checkForNode(onix, xpath.closed_captions[version]);
		var open_captions = checkForNode(onix, xpath.open_captions[version]);
		var transcript = checkForNode(onix, xpath.transcript[version]);
		
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
			richcontent.appendChild(li);
		}
		
		if (chemical_formula_as_mathml) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Chemical formulas in MathML'));
			richcontent.appendChild(li);
		}
		
		if (charts_diagrams_as_non_graphical_data || full_alternative_textual_descriptions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Information-rich images are described by extended descriptions'));
			richcontent.appendChild(li);
		}
		
		if (closed_captions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Videos have closed captions'));
			richcontent.appendChild(li);
		}
		
		if (open_captions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Videos have open captions'));
			richcontent.appendChild(li);
		}
		
		if (transcript) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Has transcript'));
			richcontent.appendChild(li);
		}
		
		if (richcontent.childElementCount) {
			rc_group.appendChild(richcontent);
		}
		
		if (!(math_formula_as_mathml || math_formula_as_latex || (contains_math_formula && short_textual_alternative_images) || chemical_formula_as_mathml || charts_diagrams_as_non_graphical_data || full_alternative_textual_descriptions || closed_captions || open_captions || transcript)) {
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
		var no_hazards_or_warnings_confirmed = checkForNode(onix, xpath.no_hazards_or_warnings_confirmed[version]);
		var flashing_hazard = checkForNode(onix, xpath.flashing_hazard[version]);
		var no_flashing_hazards = checkForNode(onix, xpath.no_flashing_hazards[version]);
		var motion_simulation_hazard = checkForNode(onix, xpath.motion_simulation_hazard[version]);
		var no_motion_hazards = checkForNode(onix, xpath.no_motion_hazards[version]);
		var sound_hazard = checkForNode(onix, xpath.sound_hazard[version]);
		var no_sound_hazards = checkForNode(onix,xpath.no_sound_hazards[version]);
		var unknown_if_contains_hazards = checkForNode(onix, xpath.unknown_if_contains_hazards[version]);
		
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
		 
		 // Note xpaths in the techniques that end in /(@lang|ancestor::*/@lang)[last()]
		 // had to be made two separate selections (.../@lang | .../ancestor::*/@lang)
		 // for compatibility with xpath 1.0 processing
		 
		 // 4.6.2 Variables setup
		var accessibility_addendum = onix.evaluate(xpath.accessibility_addendum[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var lang_attribute_accessibility_addendum = onix.evaluate(xpath.lang_attribute_accessibility_addendum[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var known_limited_accessibility = onix.evaluate(xpath.known_limited_accessibility[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var lang_known_limited_accessibility = onix.evaluate(xpath.lang_known_limited_accessibility[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var accessibility_summary = onix.evaluate(xpath.accessibility_summary[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var lang_attribute_accessibility_summary = onix.evaluate(xpath.lang_attribute_accessibility_summary[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var language_of_text = onix.evaluate(xpath.language_of_text[version], onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 4.6.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Accessibility summary', ''));
		
		// grid grouping element
		var sum_group = document.createElement('div');
			sum_group.classList.add('grid-body');
		
		var language_accessibility_addendum;
		var language_known_limited_accessibility;
		var language_accessibility_summary;
		
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
			sum_group.appendChild(p);
		}
		
		if (accessibility_addendum) {
			var p = document.createElement('p');
				P.appendChild(document.createTextNode(accessibility_addendum));
				P.lang = language_accessibility_addendum;
			sum_group.appendChild(p);
		}
		
		else if (accessibility_summary) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode(accessibility_summary));
				p.lang = language_accessibility_summary;
			sum_group.appendChild(p);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
			
			// add punctuation - not in algorithm
			p.appendChild(getPunctuation());
			
			sum_group.appendChild(p);
		}
		
		result.appendChild(sum_group);
		
		
		/* 
		 * 4.7 Legal considerations
		 */
		 
		 // 4.7.2 Variables setup
		var eaa_exemption_micro_enterprises = checkForNode(onix, xpath.eaa_exemption_micro_enterprises[version]);
		var eaa_exception_disproportionate_burden = checkForNode(onix, xpath.eaa_exception_disproportionate_burden[version]);
		var eaa_exception_fundamental_modification = checkForNode(onix, xpath.eaa_exception_fundamental_modification[version]);
		
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
		var dyslexia_readability = checkForNode(onix, xpath.dyslexia_readability[version]);
		var sign_language = checkForNode(onix, xpath.sign_language[version]);
		
		// 4.8.1.3 Instructions
		
		if (dyslexia_readability) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Dyslexia readability'));
			aai.appendChild(li);
		}
		
		if (sign_language) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Sign language'));
			aai.appendChild(li);
		}
		
		
		// 4.8.2 Clarity
		// 4.8.2.2 Variables setup
		var text_to_speech_hinting = checkForNode(onix, xpath.text_to_speech_hinting[version]);
		var color_not_sole_means_of_conveying_information = checkForNode(onix, xpath.color_not_sole_means_of_conveying_information[version]);
		var high_contrast_between_text_and_background = checkForNode(onix, xpath.high_contrast_between_text_and_background[version]);
		var ultra_high_contrast_between_text_and_background = checkForNode(onix, xpath.ultra_high_contrast_between_text_and_background[version]);
		var visible_page_numbering = checkForNode(onix, xpath.visible_page_numbering[version]);
		var high_contrast_between_foreground_and_background_audio = checkForNode(onix, xpath.high_contrast_between_foreground_and_background_audio[version]);
		var without_background_sounds = checkForNode(onix, xpath.without_background_sounds[version]);

		// 4.8.2.3 Instructions
		
		var clarity = [];
		
		if (text_to_speech_hinting) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Text-to-speech hinting provided'));
			aai.appendChild(li);
		}
		
		if (color_not_sole_means_of_conveying_information) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Color is not the sole means of conveying information'));
			aai.appendChild(li);
		}
		
		if (high_contrast_between_text_and_background) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('High contrast between text and background'));
			aai.appendChild(li);
		}
		
		if (ultra_high_contrast_between_text_and_background) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Ultra high contrast between text and background'));
			aai.appendChild(li);
		}
		
		if (visible_page_numbering) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Visible page numbering'));
			aai.appendChild(li);
		}
		
		if (high_contrast_between_foreground_and_background_audio) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('High contrast between foreground and background audio'));
			aai.appendChild(li);
		}
		
		if (without_background_sounds) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Without background sounds'));
			aai.appendChild(li);
		}
		
		aai_group.appendChild(aai);
		result.appendChild(aai_group);
		
		return result;
	}
	
	// 3.1 Preprocessing
	
	function preprocessing(onix_record_as_text) {
		
		var onix;
		
		try {
			var parser = new DOMParser();
			onix = parser.parseFromString(onix_record_as_text, "text/xml");
		}
		
		catch (e) {
			alert('Error parsing onix record: ' + e);
			onix = null;
		}
		
		return onix;
	}
	
	
	// 3.2 Check for node
	
	function checkForNode(onix, path) {
		var result = onix.evaluate(path, onix, nsResolver, XPathResult.BOOLEAN_TYPE, null);
		return result.booleanValue;
	}
	
	function nsResolver(prefix) {
		switch (prefix) {
			case 'xml':
				return 'http://www.w3.org/XML/1998/namespace';
			default:
				return "http://ns.editeur.org/onix/3.0/reference";
		}
	}	
	
	return {
		processOnixRecord: function(onixRecord, version, vocab, style) {
			return processOnixRecord(onixRecord, version, vocab, style);
		}
	}

})();

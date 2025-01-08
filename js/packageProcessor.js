
'use strict';

var packageProcessor = (function() {

	const hd_type = 'h3';
	
	function processPackageDoc(package_document_as_text) {
	
		var result = document.createElement('div');
		
		/* 
		 * The specification calls the preprocessing step for every technique but that's
		 * omitted from this code. The package_document variable is only configured once
		 */  
		
		var package_document = preprocessing(package_document_as_text);
		
		if (!package_document) {
			return;
		}
		
		/* 
		 * 4.1 Visual adjustments
		 */
		 
		// 4.1.2 Variables setup
		var all_textual_content_can_be_modified = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="displayTransformability"]');
		var is_fixed_layout = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="rendition:layout" and normalize-space()="pre-paginated"]');
		
		// 4.1.3 Instructions
		
		var vis_hd = document.createElement(hd_type);
			vis_hd.appendChild(document.createTextNode('Visual adjustments'));
		result.appendChild(vis_hd);
			
		// add explainer
		result.appendChild(writeExplainerLink('epub-visualAdjustments'));
		
		var vis_result = document.createElement('p');
		
		if (is_fixed_layout) {
			vis_result.appendChild(document.createTextNode('Appearance cannot be modified'));
		}
		
		else if (all_textual_content_can_be_modified) {
			vis_result.appendChild(document.createTextNode('Appearance can be modified'));
		}
		
		else {
			vis_result.appendChild(document.createTextNode('Appearance modifiability not known'));
		}
		
		// Following additions are not in the algorithm
		
		// add punctuation
		vis_result.appendChild(document.createTextNode('.'));
		
		result.appendChild(vis_result);
		
		
		/* 
		 * 4.2 Supports nonvisual reading
		 */
		 
		// 4.2.2 Variables setup
		var all_necessary_content_textual = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessModeSufficient" and normalize-space()="textual"]');
		var non_textual_content_images = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessMode" and contains(" chartOnVisual chemOnVisual diagramOnVisual mathOnVisual musicOnVisual textOnVisual ", normalize-space())]');
		var textual_alternative_images = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and contains(" longDescription alternativeText describedMath ", normalize-space())]');
		
		// 4.2.3 Instructions
		
		var nonvis_hd = document.createElement(hd_type);
			nonvis_hd.appendChild(document.createTextNode('Supports nonvisual reading'));
			
			// add explainer
			nonvis_hd.appendChild(writeExplainerLink('nonvisualReading'));
		
		result.appendChild(nonvis_hd);
		
		var nonvis_result = document.createElement('p');
		
		if (textual_alternative_images) {
			nonvis_result.appendChild(document.createTextNode('Has alt text'));
		}
		
		if (all_necessary_content_textual) {
			nonvis_result.appendChild(document.createTextNode('Readable in read aloud or dynamic braille'));
		}
		
		else if (non_textual_content_images && !textual_alternative_images) {
			nonvis_result.appendChild(document.createTextNode('Not fully readable in read aloud or dynamic braille'));
		}
		
		else {
			nonvis_result.appendChild(document.createTextNode('May not be fully readable in read aloud or dynamic braille'));
		}
		
		// add punctuation - not in algorithm
		nonvis_result.appendChild(document.createTextNode('.'));
		
		result.appendChild(nonvis_result);
		
		
		/* 
		 * 4.3 Conformance
		 */
		 
		// 4.3.2 Variables setup
		var conformance_string = '';
		var wcag_level = '';
		
		if (checkForNode(package_document, '/package/metadata/link[@rel="dcterms:conformsTo" and @href="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-a"] | /package/metadata/meta[@property="dcterms:conformsTo" and normalize-space() = "http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-a"]')) {
			conformance_string = 'EPUB Accessibility 1.0 WCAG 2.0 Level A';
			wcag_level = 'A';
		}
		
		if (checkForNode(package_document, '/package/metadata/link[@rel="dcterms:conformsTo" and @href="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"] | /package/metadata/meta[@property="dcterms:conformsTo" and text() = "http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"]')) {
			conformance_string = 'EPUB Accessibility 1.0 WCAG 2.0 Level AA';
			wcag_level = 'AA';
		}
		
		if (checkForNode(package_document, '/package/metadata/link[@rel="dcterms:conformsTo" and @href="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aaa"] | /package/metadata/meta[@property="dcterms:conformsTo" and text() = "http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aaa"]')) {
			conformance_string = 'EPUB Accessibility 1.0 WCAG 2.0 Level AAA';
			wcag_level = 'AAA';
		}
		
		// js evaluate() can't handle this expression: 
		// /opf:package/opf:metadata/opf:meta[@property="dcterms:conformsTo" and matches(normalize-space(), "EPUB Accessibility 1\.1 - WCAG 2\.[0-2] Level [A]+")]
		// using contains() instead to match most of it
		
		var conformance = package_document.evaluate('/opf:package/opf:metadata/opf:meta[@property="dcterms:conformsTo" and contains(normalize-space(), "EPUB Accessibility 1.1 - WCAG 2.")]', package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		if (conformance) {
			conformance_string = conformance.replace(' - ', ' ');
			
			var level_re = new RegExp('EPUB Accessibility 1\\.1 - WCAG 2\\.[0-2] Level ');
			wcag_level = conformance.replace(level_re, '');
		}
		
		var certifier = package_document.evaluate('/opf:package/opf:metadata/opf:meta[@property="a11y:certifiedBy"]', package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certifier_credentials = package_document.evaluate('/opf:package/opf:metadata/opf:meta[@property="a11y:certifierCredential"]', package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certification_date = package_document.evaluate('/opf:package/opf:metadata/opf:meta[@property="dcterms:date" and @refines=//opf:meta[@property="a11y:certifiedBy"]/@id]', package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certifier_report = package_document.evaluate('/opf:package/opf:metadata/opf:meta[@property="a11y:certifierReport"]', package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 4.3.3 Instructions
		
		var conf_hd = document.createElement(hd_type);
			conf_hd.appendChild(document.createTextNode('Conformance'));
		result.appendChild(conf_hd);
		
		if (!conformance_string) {
			result.appendChild(document.createTextNode('No information is available.'));
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
			conf_p.appendChild(document.createTextNode('.'));
			
			result.appendChild(conf_p);
			
			
			if (certifier) {
				var cert_p = document.createElement('p');
				
				cert_p.appendChild(document.createTextNode('This publication is certified by '));
				cert_p.appendChild(document.createTextNode(certifier));
				
				// add punctuation - not in algorithm
				cert_p.appendChild(document.createTextNode('.'));
				
				result.appendChild(cert_p);
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
				cred_p.appendChild(document.createTextNode('.'));
				
				result.appendChild(cred_p);
			}
			
			var detconf_hd = document.createElement(hd_type);
				detconf_hd.appendChild(document.createTextNode('Detailed Conformance Information'));
			result.appendChild(detconf_hd);
			
			var conf_p = document.createElement('p');
				conf_p.appendChild(document.createTextNode('This publication claims to meet '));
				conf_p.appendChild(document.createTextNode(conformance_string));
				
				// add punctuation - not in algorithm
				conf_p.appendChild(document.createTextNode('.'));
			
			result.appendChild(conf_p);
			
			var cert_p = document.createElement('p');
			
			if (certification_date || certifier || certifier_credentials) {
				cert_p.appendChild(document.createTextNode('The publication was certified '));
			}
			
			if (certification_date) {
				cert_p.appendChild(document.createTextNode(' on '));
				cert_p.appendChild(document.createTextNode(certification_date));
			}
			
			// add punctuation - not in algorithm
			cert_p.appendChild(document.createTextNode('.'));
			
			result.appendChild(cert_p);
			
			if (certifier_report) {
				
				var rep_p = document.createElement('p');
				
				var rep_link = document.createElement('a');
					rep_link.href = certifier_credentials;
					rep_link.appendChild(document.createTextNode('For more information refer to the certifier\'s report'));
				rep_p.appendChild(rep_link);
				
				// add punctuation - not in algorithm
				rep_p.appendChild(document.createTextNode('.'));
				
				result.appendChild(rep_p);
			}
		}
		

		/* 
		 * 4.4 Prerecorded audio
		 */
		 
		// 4.4.2 Variables setup
		var all_content_audio = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessModeSufficient" and normalize-space()="auditory"]');
		var synchronised_pre_recorded_audio = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="sychronizedAudioText"]');
		var audio_content = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessMode" and normalize-space()="auditory"]');
		
		// 4.4.3 Instructions
		
		var prerec_hd = document.createElement(hd_type);
			prerec_hd.appendChild(document.createTextNode('Prerecorded audio'));
		result.appendChild(prerec_hd);
		
		var prerec_result = document.createElement('p');
		
		if (all_content_audio) {
			prerec_result.appendChild(document.createTextNode('Audio only'));
		}
		
		else if (synchronised_pre_recorded_audio) {
			prerec_result.appendChild(document.createTextNode('Synchronized audio and text'));
		}
		
		else if (audio_content) {
			prerec_result.appendChild(document.createTextNode('Complementary audio and text'));
		}
		
		else {
			prerec_result.appendChild(document.createTextNode('No information is available'));
		}
		
		// add punctuation - not in algorithm
		prerec_result.appendChild(document.createTextNode('.'));
		
		result.appendChild(prerec_result);
		
		
		/* 
		 * 4.5 Navigation
		 */
		 
		// 4.5.2 Variables setup
		var table_of_contents_navigation = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="tableOfContents"]');
		var index_navigation = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="index"]');
		var page_navigation = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="pageNavigation"]');
		var next_previous_structural_navigation = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="structuralNavigation"]');
		
		// 4.5.3 Instructions
		
		var nav_hd = document.createElement(hd_type);
			nav_hd.appendChild(document.createTextNode('Navigation'));
		result.appendChild(nav_hd);
		
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
			
			result.appendChild(navigation);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
				
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode('.'));
			
			result.appendChild(p);
		}
		
		
		/* 
		 * 4.6 Rich content
		 */
		 
		// 4.6.2 Variables setup
		var contains_charts_diagrams = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessMode" and normalize-space()="chartOnVisual"]');
		var long_text_descriptions = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="longDescriptions"]');
		var contains_chemical_formula = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessMode" and normalize-space()="chemOnVisual"]');
		var chemical_formula_as_latex = checkForNode(package_document, '/package/metadata/meta[@property="schema:accessibilityFeature" and normalize-space()="latex-chemistry"]');
		var chemical_formula_as_mathml = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="MathML-chemistry"]');
		var contains_math_formula = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="describedMath"]');
		var math_formula_as_latex = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="latex"]');
		var math_formula_as_mathml = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="MathML"]');
		var closed_captions = checkForNode(package_document, '/package/metadata/meta[@property="schema:accessibilityFeature" and normalize-space()="closedCaptions"]');
		var open_captions = checkForNode(package_document, '/package/metadata/meta[@property="schema:accessibilityFeature" and normalize-space()="openCaptions"]');
		var transcript = checkForNode(package_document, '/package/metadata/meta[@property="schema:accessibilityFeature" and normalize-space()="transcript"]');
		
		// 4.6.3 Instructions
		
		var rc_hd = document.createElement(hd_type);
			rc_hd.appendChild(document.createTextNode('Rich content'));
		result.appendChild(rc_hd);
		
		var richcontent = document.createElement('ul');
		
		if (math_formula_as_mathml) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Math as MathML'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (math_formula_as_latex) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Math as LaTeX'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (contains_math_formula) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Math as images with text description'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (chemical_formula_as_mathml) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Chemical formulas in MathML'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (chemical_formula_as_latex) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Chemical formulas in LaTex'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (long_text_descriptions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Information-rich images are described by extended descriptions'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (closed_captions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Videos have closed captions'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (open_captions) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Videos have open captions'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (transcript) {
			var li = document.createElement('li');
				li.appendChild(document.createTextNode('Has transcript'));
			
			// add punctuation - not in algorithm
			li.appendChild(document.createTextNode('.'));
			
			richcontent.appendChild(li);
		}
		
		if (richcontent.childElementCount) {
			result.appendChild(richcontent);
		}
		
		if (!(math_formula_as_mathml || math_formula_as_latex || (contains_math_formula && long_text_descriptions) || chemical_formula_as_mathml || long_text_descriptions || closed_captions || open_captions || transcript)) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
			
			// add punctuation - not in algorithm
			p.appendChild(document.createTextNode('.'));
			
			result.appendChild(p);
		}
		
		
		/* 
		 * 4.7 Hazards
		 */
		 
		 // 4.7.2 Variables setup
		var no_hazards_or_warnings_confirmed = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="none"]');
		var flashing_hazard = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="flashing"]');
		var no_flashing_hazards = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="noFlashingHazard"]');
		var motion_simulation_hazard = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="motionSimulation"]');
		var no_motion_hazards = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="noMotionSimulation"]');
		var sound_hazard = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="sound"]');
		var no_sound_hazards = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="noSoundHazard"]');
		var unknown_if_contains_hazards = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="unknown"]');
		
		// 4.7.3 Instructions
		
		var haz_hd = document.createElement(hd_type);
			haz_hd.appendChild(document.createTextNode('Hazards'));
		result.appendChild(haz_hd);
		
		if (no_hazards_or_warnings_confirmed || (no_flashing_hazards && no_motion_hazards && no_sound_hazards)) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No hazards'));
			result.appendChild(p);
		}
		
		else if (flashing_hazard || motion_simulation_hazard || sound_hazard) {
		
			if (flashing_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode('Flashing'));
			
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode('.'));
				
				result.appendChild(p);
			}
			
			if (motion_simulation_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode('Motion simulation'));
			
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode('.'));
				
				result.appendChild(p);
			}
			
			if (sound_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode('Loud sounds'));
			
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode('.'));
				
				result.appendChild(p);
			}
		}

		else if (unknown_if_contains_hazards) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('The presence of hazards is unknown'));
		
			// add punctuation - not in algorithm
			p.appendChild(document.createTextNode('.'));
			
			result.appendChild(p);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
		
			// add punctuation - not in algorithm
			p.appendChild(document.createTextNode('.'));
			
			result.appendChild(p);
		}
		
		
		/* 
		 * 4.8 Accessibility summary
		 */
		 
		 // 4.8.2 Variables setup
		var accessibility_summary =  package_document.evaluate('/opf:package/opf:metadata/opf:meta[@property="schema:accessibilitySummary"][1]', package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var lang_attribute_accessibility_summary = package_document.evaluate('(/opf:package/opf:metadata/opf:meta[@property="schema:accessibilitySummary"][1]/@xml:lang | /opf:package/@xml:lang)[last()]', package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var language_of_text = package_document.evaluate('/opf:package/opf:metadata/dc:language[1]', package_document, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 4.8.3 Instructions
		
		var sum_hd = document.createElement(hd_type);
			sum_hd.appendChild(document.createTextNode('Accessibility summary'));
		result.appendChild(sum_hd);
		
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
			sum_result.appendChild(document.createTextNode('.'));
		}
		
		result.appendChild(sum_result);
		
		
		/* 
		 * 4.9 Legal considerations
		 */
		 
		 // 4.9.2 Variables setup
		var eaa_exemption_micro_enterprises = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="a11y:exemption" and normalize-space()="eaa-microenterprise"]');
		var eaa_exception_disproportionate_burden = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="a11y:exemption" and normalize-space()="eaa-disproportionate-burden"]');
		var eaa_exception_fundamental_modification = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="a11y:exemption" and normalize-space()="eaa-fundamental-alteration"]');
		
		// 4.9.3 Instructions
		
		var legal_hd = document.createElement(hd_type);
			legal_hd.appendChild(document.createTextNode('Legal considerations'));
		result.appendChild(legal_hd);
		
		var legal_result = document.createElement('p');
		
		if (eaa_exemption_micro_enterprises || eaa_exception_disproportionate_burden || eaa_exception_fundamental_modification) {
			legal_result.appendChild(document.createTextNode('Claims an accessibility exemption in some jurisdictions'));
		}
		
		else {
			legal_result.appendChild(document.createTextNode('No information is available'));
		}
		
		// add punctuation - not in algorithm
		legal_result.appendChild(document.createTextNode('.'));
		
		result.appendChild(legal_result);
		
		
		/* 
		 * 4.10 Additional accessibility information
		 */
		 
		var aai_hd = document.createElement(hd_type);
			aai_hd.appendChild(document.createTextNode('Additional accessibility information'));
		result.appendChild(aai_hd);
		
		var aai = document.createElement('ul');
		
		// 4.10.1 Adaptation
		// 4.10.1.2 Variables setup
		var audio_descriptions = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="audioDescription"]');
		var braille = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="braille"]');
		var tactile_graphic = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="tactileGraphic"]');
		var tactile_object = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="tactileObject"]');
		var sign_language = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="signLanguage"]');
		
		// 4.10.1.3 Instructions
		
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
		
		// 4.10.2 Clarity
		// 4.10.2.2 Variables setup
		var aria = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="aria"]');
		var full_ruby_annotations = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="fullRubyAnnotations"]');
		var text_to_speech_hinting = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="ttsMarkup"]');
		var high_contrast_between_foreground_and_background_audio = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="highContrastAudio"]');
		var high_contrast_between_text_and_background = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="highContrastDisplay"]');
		var large_print = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="largePrint"]');
		var page_break_markers = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="pageBreakMarkers"]');
		var ruby_annotations = checkForNode(package_document, '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="rubyAnnotations"]');
		
		// 4.10.2.3 Instructions
		
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
		
		result.appendChild(aai);
		
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
	
	function nsResolver(prefix) {
		switch (prefix) {
			case 'xml':
				return 'http://www.w3.org/XML/1998/namespace';
			default:
				return "http://www.idpf.org/2007/opf";
		}
	}	
	
	
	return {
		processPackageDoc: function(packageDoc) {
			return processPackageDoc(packageDoc);
		}
	}	
})();

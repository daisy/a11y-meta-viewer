
'use strict';

var onixProcessor = (function() {

	function processOnixRecord(onix_record_as_text) {
	
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
		 * 4.1 Visual adjustments
		 */
		 
		// 4.1.2 Variables setup
		var all_textual_content_can_be_modified = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "36"]');
		var is_fixed_layout = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[normalize-space() = "E201"]') && !checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[normalize-space() = "E200"]');
		
		// 4.1.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Visual adjustments', ''));
		
		// grid grouping element
		var vis_group = document.createElement('div');
			vis_group.classList.add('grid-body');
		
		var vis_result = document.createElement('p');
		
		if (all_textual_content_can_be_modified) {
			vis_result.appendChild(document.createTextNode('Appearance can be modified'));
		}
		
		else if (is_fixed_layout) {
			vis_result.appendChild(document.createTextNode('Appearance cannot be modified'));
		}
		
		else {
			vis_result.appendChild(document.createTextNode('No information is available'));
		}
		
		// add punctuation - not in algorithm
		vis_result.appendChild(document.createTextNode('.'));
		
		vis_group.appendChild(vis_result);
		result.appendChild(vis_group);
		
		
		/* 
		 * 4.2 Supports nonvisual reading
		 */
		 
		 // 4.2.2 Variables setup
		 var all_necessary_content_textual = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "52"]');
		 var real_text = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:PrimaryContentType = "10" or onix:ProductContentType = "10"]');
		 var non_textual_content_images = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[contains(" 07 18 19 12 49 20 ", onix:PrimaryContentType) or contains(" 07 18 19 12 49 20 ", onix:ProductContentType)]');
		 var textual_alternative_images = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and (onix:ProductFormFeatureValue = "14" or onix:ProductFormFeatureValue = "15" or onix:ProductFormFeatureValue = "16")]');
		
		// 4.2.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Supports nonvisual reading', ''));
		
		// grid grouping element
		var nonvis_group = document.createElement('div');
			nonvis_group.classList.add('grid-body');
		
		if (all_necessary_content_textual) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('Readable in read aloud or dynamic braille'));
				
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode('.'));
			
			nonvis_group.appendChild(p);
			
			if (textual_alternative_images) {
				var p2 = document.createElement('p');
					p2.appendChild(document.createTextNode('Has alt text'));
					
					// add punctuation - not in algorithm
					p2.appendChild(document.createTextNode('.'));
				
				nonvis_group.appendChild(p2);
			}
		}
		
		else if (real_text && non_textual_content_images && !textual_alternative_images) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('Not fully readable in read aloud or dynamic braille'));
				
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode('.'));
			
			nonvis_group.appendChild(p);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('May not be fully readable in read aloud or dynamic braille'));
			
			// add punctuation - not in algorithm
			p.appendChild(document.createTextNode('.'));
			
			nonvis_group.appendChild(p);
		}
		
		result.appendChild(nonvis_group);
		
		
		/* 
		 * 4.3 Conformance
		 */
		 
		// 4.3.2 Variables setup
		var epub_accessibility_10 = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "02"]')  || checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "03"]');
		var epub_accessibility_11 = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "04"]');
		var wcag_20 = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "80"]') || checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "02"]') || checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "03"]');
		var wcag_21 = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "81"]');
		var wcag_22 = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "82"]');
		var level_a = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "84"]') || checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "02"]');
		var level_aa = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "85"]') || checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "03"]');
		var level_aaa = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "86"]');
		var lia_compliant = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "01"]');
		var certifier  = onix.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "90"]/onix:ProductFormFeatureDescription', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certifier_credentials  = onix.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "93"]/onix:ProductFormFeatureDescription', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certification_date  = onix.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "91"]/onix:ProductFormFeatureDescription', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var certifier_report  = onix.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "94"]/onix:ProductFormFeatureDescription', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 4.3.3 Instructions
		
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
		conf_p.appendChild(document.createTextNode('.'));
		
		conf_group.appendChild(conf_p);

		if (certifier) {
			var cert_p = document.createElement('p');
				cert_p.appendChild(document.createTextNode('This publication was certified by '));
				cert_p.appendChild(document.createTextNode(certifier));
			
			// add punctuation - not in algorithm
			cert_p.appendChild(document.createTextNode('.'));
			
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
			cred_p.appendChild(document.createTextNode('.'));
			
			conf_group.appendChild(cred_p);
		}
		
		var detconf_hd = document.createElement('p');
			detconf_hd.classList.add('sub-hd');
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
		conf_p.appendChild(document.createTextNode('.'));
		
		conf_group.appendChild(conf_p);
		
		if (certification_date) {
			var cert_p = document.createElement('p');
				cert_p.appendChild(document.createTextNode('The publication was certified on '));
				cert_p.appendChild(document.createTextNode(certification_date));
				
				// add punctuation - not in algorithm
				cert_p.appendChild(document.createTextNode('.'));
			
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
			rep_p.appendChild(document.createTextNode('.'));
			
			conf_group.appendChild(rep_p);
		}
		
		result.appendChild(conf_group);
		

		/* 
		 * 4.4 Pre-recorded audio
		 */
		 
		 // 4.4.2 Variables setup
		 var audiobook = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:PrimaryContentType = "81" or onix:ProductContentType = "81"]');
		 var all_content_audio = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "39"]');
		 var all_content_pre_recorded = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "51"]');
		 var synchronised_pre_recorded_audio = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "20"]') && checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[normalize-space() = "A305"]');
		 var non_textual_content_audio = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[contains(" 21 22 ", onix:PrimaryContentType) or contains(" 21 22 ", onix:ProductContentType)]');
		 var non_textual_content_audio_in_video = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[contains(" 06 25 26 27 28 29 30 ", onix:PrimaryContentType) or contains(" 06 25 26 27 28 29 30 ", onix:ProductContentType)]');
		
		// 4.4.3 Instructions
		
		// add header
		result.appendChild(makeHeader('Prerecorded audio', ''));
		
		// grid grouping element
		var prerec_group = document.createElement('div');
			prerec_group.classList.add('grid-body');
		
		var prerec_result = document.createElement('p');
		
		if (all_content_audio && !synchronised_pre_recorded_audio) {
			prerec_result.appendChild(document.createTextNode('Audio only'));
		}
		
		else if ((audiobook || non_textual_content_audio || non_textual_content_audio_in_video) && !all_content_pre_recorded) {
			prerec_result.appendChild(document.createTextNode('Complementary audio and text'));
		}
		
		else if (all_content_pre_recorded && synchronised_pre_recorded_audio) {
			prerec_result.appendChild(document.createTextNode('Prerecorded audio synchronized with text'));
		}
		
		else {
			prerec_result.appendChild(document.createTextNode('No information is available'));
		}
		
		// add punctuation - not in algorithm
		prerec_result.appendChild(document.createTextNode('.'));
		
		prerec_group.appendChild(prerec_result);
		result.appendChild(prerec_group);
		
		
		/* 
		 * 4.5 Navigation
		 */
		 
		// 4.5.2 Variables setup
		var table_of_contents_navigation = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "11"]');
		var index_navigation = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "12"]');
		var print_equivalent_page_numbering = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "19"]');
		var next_previous_structural_navigation = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "29"]');
		
		// 4.5.3 Instructions
		
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
				p.appendChild(document.createTextNode('.'));
			
			nav_group.appendChild(p);
		}
		
		result.appendChild(nav_group);
		
		
		/* 
		 * 4.6 Rich content
		 */
		 
		 // 4.6.2 Variables setup
		var charts_diagrams_as_non_graphical_data = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "16"]');
		var full_alternative_textual_descriptions = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "15"]');
		var chemical_formula_as_mathml = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "34"]');
		var math_formula_as_latex = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "35"]');
		var math_formula_as_mathml = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "17"]');
		var contains_math_formula = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail/DescriptiveDetail[PrimaryContentType = "48" or ContentType = "48"]');
		var short_textual_alternative_images = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "14"]');
		var closed_captions = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail[ProductFormDetail = "V210"]');
		var open_captions = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail[ProductFormDetail = "V211"]');
		var transcript = checkForNode(onix, '/ONIXMessage/Product/DescriptiveDetail[ProductFormDetail = "V212"]');
		
		// 4.6.3 Instructions
		
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
		
		if (charts_diagrams_as_non_graphical_data || full_alternative_textual_descriptions) {
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
			rc_group.appendChild(richcontent);
		}
		
		if (!(math_formula_as_mathml || math_formula_as_latex || (contains_math_formula && short_textual_alternative_images) || chemical_formula_as_mathml || charts_diagrams_as_non_graphical_data || full_alternative_textual_descriptions || closed_captions || open_captions || transcript)) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
			
			// add punctuation - not in algorithm
			p.appendChild(document.createTextNode('.'));
			
			rc_group.appendChild(p);
		}
		
		result.appendChild(rc_group);
		
		
		/* 
		 * 4.7 Hazards
		 */
		 
		 // 4.7.2 Variables setup
		var no_hazards_or_warnings_confirmed = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "00"]');
		var flashing_hazard = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "13"]');
		var no_flashing_hazards = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "14"]');
		var motion_simulation_hazard = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "17"]');
		var no_motion_hazards = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "18"]');
		var sound_hazard = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "15"]');
		var no_sound_hazards = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "16"]');
		var unknown_if_contains_hazards = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "08"]');
		
		// 4.7.3 Instructions
		
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
				p.appendChild(document.createTextNode('.'));
				
				haz_group.appendChild(p);
			}
			
			if (motion_simulation_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode('Motion simulation'));
			
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode('.'));
				
				haz_group.appendChild(p);
			}
			
			if (sound_hazard) {
				var p = document.createElement('p');
					p.appendChild(document.createTextNode('Loud sounds'));
			
				// add punctuation - not in algorithm
				p.appendChild(document.createTextNode('.'));
				
				haz_group.appendChild(p);
			}
		}

		else if (unknown_if_contains_hazards) {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('The presence of hazards is unknown'));
		
			// add punctuation - not in algorithm
			p.appendChild(document.createTextNode('.'));
			
			haz_group.appendChild(p);
		}
		
		else {
			var p = document.createElement('p');
				p.appendChild(document.createTextNode('No information is available'));
		
			// add punctuation - not in algorithm
			p.appendChild(document.createTextNode('.'));
			
			haz_group.appendChild(p);
		}
		
		result.appendChild(haz_group);
		
		
		/* 
		 * 4.8 Accessibility summary
		 */
		 
		 // Note xpaths in the techniques that end in /(@lang|ancestor::*/@lang)[last()]
		 // had to be made two separate selections (.../@lang | .../ancestor::*/@lang)
		 // for compatibility with xpath 1.0 processing
		 
		 // 4.8.2 Variables setup
		var accessibility_addendum  = onix.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "92"]/onix:ProductFormFeatureDescription', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var lang_attribute_accessibility_addendum = onix.evaluate('(/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "92"]/onix:ProductFormFeatureDescription/@lang | /onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "92"]/onix:ProductFormFeatureDescription/ancestor::*/@lang)[last()]', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var known_limited_accessibility  = onix.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "09"]/onix:ProductFormFeatureDescription', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var lang_known_limited_accessibility = onix.evaluate('(/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "09"]/onix:ProductFormFeatureDescription/@lang | /onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "09"]/onix:ProductFormFeatureDescription/ancestor::*/@lang)[last()]', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var accessibility_summary  = onix.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "00"]/onix:ProductFormFeatureDescription', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var lang_attribute_accessibility_summary = onix.evaluate('(/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "00"]/onix:ProductFormFeatureDescription/@lang | /onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "00"]/onix:ProductFormFeatureDescription/ancestor::*/@lang)[last()]', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		var language_of_text  = onix.evaluate('/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:Language[onix:LanguageRole="01"]/onix:LanguageCode', onix, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
		
		// 4.8.3 Instructions
		
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
			p.appendChild(document.createTextNode('.'));
			
			sum_group.appendChild(p);
		}
		
		result.appendChild(sum_group);
		
		
		/* 
		 * 4.9 Legal considerations
		 */
		 
		 // 4.9.2 Variables setup
		var eaa_exemption_micro_enterprises = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "75"]');
		var eaa_exception_disproportionate_burden = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "76"]');
		var eaa_exception_fundamental_modification = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "77"]');
		
		// 4.9.3 Instructions
		
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
		legal_result.appendChild(document.createTextNode('.'));
		
		legal_group.appendChild(legal_result);
		result.appendChild(legal_group);
		
		
		/* 
		 * 4.10 Additional accessibility information
		 */
		 
		// add header
		result.appendChild(makeHeader('Additional accessibility information', ''));
		
		var aai = document.createElement('ul');
		
		// grid grouping element
		var aai_group = document.createElement('div');
			aai_group.classList.add('grid-body');
		
		// 4.10.1 Adaptation
		// 4.10.1.2 Variables setup
		var dyslexia_readability = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "24"]');
		var sign_language = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:ProductFormDetail = "V213"]');
		
		// 4.10.1.3 Instructions
		
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
		
		
		// 4.10.2 Clarity
		// 4.10.2.2 Variables setup
		var text_to_speech_hinting = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "21"]');
		var color_not_sole_means_of_conveying_information = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "25"]');
		var high_contrast_between_text_and_background = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "26"]');
		var ultra_high_contrast_between_text_and_background = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "37"]');
		var visible_page_numbering = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:ProductFormDetail = "E205"]');
		var high_contrast_between_foreground_and_background_audio = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "27"]');
		var without_background_sounds = checkForNode(onix, '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:ProductFormDetail = "A312"]');

		// 4.10.2.3 Instructions
		
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
		processOnixRecord: function(onixRecord) {
			return processOnixRecord(onixRecord);
		}
	}

})();

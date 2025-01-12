
var xpath = {
	all_textual_content_can_be_modified: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="displayTransformability"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="displayTransformability"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "36"]'
	},
	is_fixed_layout: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="rendition:layout" and normalize-space()="pre-paginated"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="rendition:layout" and @content="pre-paginated"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[normalize-space() = "E201"]'
	},
	is_reflow: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[normalize-space() = "E200"]'
	},
	all_necessary_content_textual: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessModeSufficient" and normalize-space()="textual"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessModeSufficient" and @content="textual"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "52"]'
	},
	real_text: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:PrimaryContentType = "10" or onix:ProductContentType = "10"]'
	},
	non_textual_content_images: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessMode" and contains(" chartOnVisual chemOnVisual diagramOnVisual mathOnVisual musicOnVisual textOnVisual ", normalize-space())]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessMode" and contains(" chartOnVisual chemOnVisual diagramOnVisual mathOnVisual musicOnVisual textOnVisual ", @content)]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[contains(" 07 18 19 12 49 20 ", onix:PrimaryContentType) or contains(" 07 18 19 12 49 20 ", onix:ProductContentType)]'
	},
	textual_alternative_images: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and contains(" longDescription alternativeText describedMath ", normalize-space())]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and contains(" longDescription alternativeText describedMath ", @content)]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and (onix:ProductFormFeatureValue = "14" or onix:ProductFormFeatureValue = "15" or onix:ProductFormFeatureValue = "16")]'
	},
	epub10a: {
		epub3: '/package/metadata/link[@rel="dcterms:conformsTo" and @href="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-a"] | /package/metadata/meta[@property="dcterms:conformsTo" and normalize-space() = "http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-a"]',
		epub2: '/package/metadata/meta[@name="dcterms:conformsTo" and @content="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-a"]'
	},
	epub10aa: {
		epub3: '/package/metadata/link[@rel="dcterms:conformsTo" and @href="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"] | /package/metadata/meta[@property="dcterms:conformsTo" and text() = "http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"]',
		epub2: '/package/metadata/meta[@name="dcterms:conformsTo" and @content="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"]'
	},
	epub10aaa: {
		epub3: '/package/metadata/link[@rel="dcterms:conformsTo" and @href="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aaa"] | /package/metadata/meta[@property="dcterms:conformsTo" and text() = "http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aaa"]',
		epub2: '/package/metadata/meta[@name="dcterms:conformsTo" and @content="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aaa"]'
	},
	conformance: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="dcterms:conformsTo" and contains(normalize-space(), "EPUB Accessibility 1.1 - WCAG 2.")]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="dcterms:conformsTo" and contains(@content, "EPUB Accessibility 1.1 - WCAG 2.")]/@content'
	},
	epub_accessibility_10_1: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "02"]'
	},
	epub_accessibility_10_2: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "03"]'
	},
	epub_accessibility_11: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "04"]'
	},
	wcag_20_1: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "80"]'
	},
	wcag_20_2: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "02"]'
	},
	wcag_20_3: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "03"]'
	},
	wcag_21: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "81"]'
	},
	wcag_22: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "82"]'
	},
	level_a_1: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "84"]'
	},
	level_a_2: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "02"]'
	},
	level_aa_1: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "85"]'
	},
	level_aa_2: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "03"]'
	},
	level_aaa: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "86"]'
	},
	lia_compliant: {
		onix: '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "01"]'
	},
	certifier: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="a11y:certifiedBy"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="a11y:certifiedBy"]/@content',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "90"]/onix:ProductFormFeatureDescription'
	},
	certifier_credentials: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="a11y:certifierCredential"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="a11y:certifierCredential"]/@content',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "93"]/onix:ProductFormFeatureDescription'
	},
	certification_date: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="dcterms:date" and @refines=//opf:meta[@property="a11y:certifiedBy"]/@id]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="dcterms:date"]/@content',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "91"]/onix:ProductFormFeatureDescription'
	},
	certifier_report: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="a11y:certifierReport"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="a11y:certifierReport"]/@content',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "94"]/onix:ProductFormFeatureDescription'
	},
	audiobook: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:PrimaryContentType = "81" or onix:ProductContentType = "81"]'
	},
	all_content_audio: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessModeSufficient" and normalize-space()="auditory"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessModeSufficient" and @content="auditory"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "39"]'
	},
	all_content_pre_recorded: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "51"]'
	},
	synchronised_pre_recorded_audio: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="sychronizedAudioText"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="sychronizedAudioText"]'
	},
	synchronised_pre_recorded_audio_1: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "20"]'
	},
	synchronised_pre_recorded_audio_2: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[normalize-space() = "A305"]'
	},
	audio_content: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessMode" and normalize-space()="auditory"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessMode" and @content="auditory"]'
	},
	non_textual_content_audio: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[contains(" 21 22 ", onix:PrimaryContentType) or contains(" 21 22 ", onix:ProductContentType)]'
	},
	non_textual_content_audio_in_video: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[contains(" 06 25 26 27 28 29 30 ", onix:PrimaryContentType) or contains(" 06 25 26 27 28 29 30 ", onix:ProductContentType)]'
	},
	table_of_contents_navigation: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="tableOfContents"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="tableOfContents"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "11"]'
	},
	index_navigation: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="index"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="index"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "12"]'
	},
	page_navigation: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="pageNavigation"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="pageNavigation"]'
	},
	print_equivalent_page_numbering: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "19"]'
	},
	next_previous_structural_navigation: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="structuralNavigation"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="structuralNavigation"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "29"]'
	},
	contains_charts_diagrams: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessMode" and normalize-space()="chartOnVisual"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessMode" and @content="chartOnVisual"]'
	},
	charts_diagrams_as_non_graphical_data: {
		onix: '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "16"]'
	},
	long_text_descriptions: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="longDescriptions"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="longDescriptions"]'
	},
	full_alternative_textual_descriptions: {
		onix: '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "15"]'
	},
	short_textual_alternative_images: {
		onix: '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "14"]'
	},
	contains_chemical_formula: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessMode" and normalize-space()="chemOnVisual"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessMode" and @content="chemOnVisual"]'
	},
	chemical_formula_as_latex: {
		epub3: '/package/metadata/meta[@property="schema:accessibilityFeature" and normalize-space()="latex-chemistry"]',
		epub2: '/package/metadata/meta[@name="schema:accessibilityFeature" and @content="latex-chemistry"]'
	},
	chemical_formula_as_mathml: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="MathML-chemistry"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="MathML-chemistry"]',
		onix: '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "34"]'
	},
	contains_math_formula: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="describedMath"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="describedMath"]',
		onix: '/ONIXMessage/Product/DescriptiveDetail/DescriptiveDetail[PrimaryContentType = "48" or ContentType = "48"]'
	},
	math_formula_as_latex: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="latex"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="latex"]',
		onix: '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "35"]'
	},
	math_formula_as_mathml: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="MathML"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="MathML"]',
		onix: '/ONIXMessage/Product/DescriptiveDetail/ProductFormFeature[ProductFormFeatureType = "09" and ProductFormFeatureValue = "17"]'
	},
	closed_captions: {
		epub3: '/package/metadata/meta[@property="schema:accessibilityFeature" and normalize-space()="closedCaptions"]',
		epub2: '/package/metadata/meta[@name="schema:accessibilityFeature" and @content="closedCaptions"]',
		onix: '/ONIXMessage/Product/DescriptiveDetail[ProductFormDetail = "V210"]'
	},
	open_captions: {
		epub3: '/package/metadata/meta[@property="schema:accessibilityFeature" and normalize-space()="openCaptions"]',
		epub2: '/package/metadata/meta[@name="schema:accessibilityFeature" and @content="openCaptions"]',
		onix: '/ONIXMessage/Product/DescriptiveDetail[ProductFormDetail = "V211"]'
	},
	transcript: {
		epub3: '/package/metadata/meta[@property="schema:accessibilityFeature" and normalize-space()="transcript"]',
		epub2: '/package/metadata/meta[@name="schema:accessibilityFeature" and @content="transcript"]',
		onix: '/ONIXMessage/Product/DescriptiveDetail[ProductFormDetail = "V212"]'
	},
	no_hazards_or_warnings_confirmed: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="none"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityHazard" and @content="none"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "00"]'
	},
	flashing_hazard: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="flashing"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityHazard" and @content="flashing"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "13"]'
	},
	no_flashing_hazards: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="noFlashingHazard"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityHazard" and @content="noFlashingHazard"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "14"]'
	},
	motion_simulation_hazard: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="motionSimulation"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityHazard" and @content="motionSimulation"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "17"]'
	},
	no_motion_hazards: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="noMotionSimulation"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityHazard" and @content="noMotionSimulation"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "18"]'
	},
	sound_hazard: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="sound"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityHazard" and @content="sound"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "15"]'
	},
	no_sound_hazards: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="noSoundHazard"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityHazard" and @content="noSoundHazard"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "16"]'
	},
	unknown_if_contains_hazards: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityHazard" and normalize-space()="unknown"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityHazard" and @content="unknown"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "08"]'
	},
	accessibility_summary: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilitySummary"][1]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilitySummary"][1]/@content',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "00"]/onix:ProductFormFeatureDescription'
	},
	lang_attribute_accessibility_summary: {
		epub3: '(/opf:package/opf:metadata/opf:meta[@property="schema:accessibilitySummary"][1]/@xml:lang | /opf:package/@xml:lang)[last()]',
		epub2: '(/opf:package/opf:metadata/opf:meta[@name="schema:accessibilitySummary"][1]/@xml:lang | /opf:package/@xml:lang)[last()]',
		onix: '(/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "00"]/onix:ProductFormFeatureDescription/@lang | /onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "00"]/onix:ProductFormFeatureDescription/ancestor::*/@lang)[last()]'
	},
	language_of_text: {
		epub3: '/opf:package/opf:metadata/dc:language[1]',
		epub2: '/opf:package/opf:metadata/dc:language[1]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:Language[onix:LanguageRole="01"]/onix:LanguageCode'
	},
	accessibility_addendum: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "92"]/onix:ProductFormFeatureDescription'
	},
	lang_attribute_accessibility_addendum: {
		onix: '(/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "92"]/onix:ProductFormFeatureDescription/@lang | /onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "92"]/onix:ProductFormFeatureDescription/ancestor::*/@lang)[last()]'
	},
	known_limited_accessibility: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "09"]/onix:ProductFormFeatureDescription'
	},
	lang_known_limited_accessibility: {
		onix: '(/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "09"]/onix:ProductFormFeatureDescription/@lang | /onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "09"]/onix:ProductFormFeatureDescription/ancestor::*/@lang)[last()]'
	},
	eaa_exemption_micro_enterprises: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="a11y:exemption" and normalize-space()="eaa-microenterprise"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="a11y:exemption" and @content="eaa-microenterprise"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "75"]'
	},
	eaa_exception_disproportionate_burden: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="a11y:exemption" and normalize-space()="eaa-disproportionate-burden"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="a11y:exemption" and @content="eaa-disproportionate-burden"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "76"]'
	},
	eaa_exception_fundamental_modification: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="a11y:exemption" and normalize-space()="eaa-fundamental-alteration"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="a11y:exemption" and @content="eaa-fundamental-alteration"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "77"]'
	},
	audio_descriptions: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="audioDescription"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="audioDescription"]'
	},
	braille: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="braille"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="braille"]'
	},
	tactile_graphic: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="tactileGraphic"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="tactileGraphic"]'
	},
	tactile_object: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="tactileObject"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="tactileObject"]'
	},
	dyslexia_readability: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "24"]'
	},
	sign_language: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="signLanguage"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="signLanguage"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:ProductFormDetail = "V213"]'
	},
	aria: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="aria"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="aria"]'
	},
	full_ruby_annotations: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="fullRubyAnnotations"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="fullRubyAnnotations"]'
	},
	text_to_speech_hinting: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="ttsMarkup"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="ttsMarkup"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "21"]'
	},
	high_contrast_between_foreground_and_background_audio: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="highContrastAudio"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="highContrastAudio"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "27"]'
	},
	without_background_sounds: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:ProductFormDetail = "A312"]'
	},
	high_contrast_between_text_and_background: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="highContrastDisplay"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="highContrastDisplay"]',
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "26"]'
	},
	ultra_high_contrast_between_text_and_background: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "37"]'
	},
	large_print:  {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="largePrint"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="largePrint"]'
	},
	color_not_sole_means_of_conveying_information: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "25"]'
	},
	page_break_markers: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="pageBreakMarkers"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="pageBreakMarkers"]'
	},
	visible_page_numbering: {
		onix: '/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:ProductFormDetail = "E205"]'
	},
	ruby_annotations: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property="schema:accessibilityFeature" and normalize-space()="rubyAnnotations"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name="schema:accessibilityFeature" and @content="rubyAnnotations"]'
	}
};

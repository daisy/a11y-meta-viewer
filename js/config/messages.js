
var messages = {
	
	conformsTo: {
		required: 'No conformance claims found.',
		duplicates: 'Duplicate conformance claim found: %tag%',
		claim: 'None of the conformance claims contain a valid EPUB Accessibility identifier.',
		nounknown: 'Inaccessible and unknown accessibility claims cannot both be declared.',
		noepub: 'No information about the EPUB Accessibility version provided.',
		unknownmix: 'An unknown accessibility claim cannot also declare conformance to EPUB Accessibility or WCAG using code list 196',
		unknownmix: 'An inaccessibility claim cannot also declare conformance to EPUB Accessibility or WCAG using code list 196',
		dual10: 'Claims of conformance to EPUB Accessibility 1.0 at both Level A and Level AA found. Only specify the highest level achieved.',
		nowcag: 'The WCAG version conformed to must be declared.',
		nolevel: 'The WCAG level conformed to must be declared.',
		onixdup: 'Duplicate conformance claim value "%var%" declared from code list 196.'
	},
	
	certifiedBy: {
		required: 'Evaluator not declared.',
		duplicates: 'Duplicate evaluator declared: %tag%'
	},
	
	accessibilityFeature: {
		required: 'At least one accessibility feature is required.',
		duplicates: 'Duplicate accessibility feature declared: %tag%',
		spelling: 'Non-standard capitalization "%var%" found in accessibility feature declaration. Expected "%val%".',
		unknown: 'Unknown accessibility feature declaration: %tag%',
		deprecated: 'Accessibility feature "%var%" is deprecated.',
		none_mix: 'Declares both that there are no accessibility features and that there are accessibility features.',
		unknown_mix: 'Declares both that accessibility features are unknown and that there are accessibility features.',
		seg_mix: 'The accessibility features "withAdditionalWordSegmentation" and "withoutAdditionalWordSegmentation" must not be declared together.',
		mode_mix: 'The accessibility features "verticalWriting" and "horizontalWriting" must not be declared together.',
		ruby_mix: 'The accessibility features "rubyAnnotations" and "fullRubyAnnotations" must not be declared together.',
		pdf: 'The accessibility feature "taggedPDF" is not valid for EPUB publications.'
	},
	
	accessModeSufficient: {
		required: 'At least one set of sufficient access modes is required.',
		oreq: 'No sufficient access modes found. This error can be ignored if ONIX does not yet have a value for the content.',
		duplicates: 'Duplicate sufficient access mode set "%var%" declared.',
		unknown: 'Unknown sufficient access mode type "%var%".',
		separator: 'Sufficient access mode values must be separated by commas: %tag%'
	},
	
	accessibilityHazard: {
		required: 'No information about accessibility hazards has been provided.',
		duplicates: 'Duplicate accessibility hazard declared: %tag%',
		unknown: 'Unknown hazard type "%var%".',
		none_indiv: 'Do not declare a global no hazard value as well as individual no hazard values.',
		none_mix: 'Do not mix a no hazard declaration with any other hazard declarations.',
		unknown_indiv: 'Do not mix an unknown hazard declaration with the individual unknown hazard values.',
		unknown_mix: 'Do not mix an unknown hazard declaration with any other hazard declarations.',
		flashing_none: 'Declares both that there is a flashing and that there is not a flashing hazard.',
		flashing_unknown: 'Declares both that there is a flashing and that a flashing hazard is unknown.',
		noflashing_unknown: 'Declares both that there is no flashing hazard and that a flashing hazard is unknown.',
		motion_none: 'Declares both that there is a motion simulation hazard and that there is not a motion simulation.',
		motion_unknown: 'Declares both a motion simulation and an unknownmotion simulation hazard.',
		nomotion_unknown: 'Declares both that there is no motion simulation hazard and that a motion simulation hazard is unknown.',
		sound_none: 'Declares both that there is a sound hazard and there is not a sound hazard.',
		sound_unknown: 'Declares both that there is a sound hazard and that a sound hazard is unknown.',
		nosound_unknown: 'Declares both that there is no sound hazard and that a sound hazard is unknown.',
		onixdup: 'Duplicate hazard value "%var%" declared.'
	},
	
	accessMode: {
		recommended: 'At least one access mode is recommended.',
		duplicates: 'Duplicate access mode declared: %tag%',
		unknown: 'Unknown access mode type "%var%".'
	},
	
	accessibilitySummary: {
		recommended: 'An accessibility summary may be needed if there is important information not captured by the other accessibility metadata.',
		duplicates: 'More than one accessibility summary declared. Multiple summaries are not likely to be rendered and the property cannot be repeated for translations.',
		summary11for10: 'Do not use List 196 Code 99 to supply a summary for publications that conform to EPUB Accessibility 1.0.',
		summary10for11: 'Do not use List 196 Code 00 to supply a summary for publications that conform to EPUB Accessibility 1.1 and above.'
	},
	
	contactEmail: {
		duplicates: 'More than one accessibility contact declared. Multiple addresses are not likely to be rendered.',
		email: 'The accessibility contact email must be a valid email address.'
	},
	
	general: {
		single: 'Do not declare multiple values in a single tag: %tag%'
	}
};

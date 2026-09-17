
var epub = {
	
	conformsTo: {
		epub3: '/opf:package/opf:metadata/opf:*[@property = "dcterms:conformsTo"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "dcterms:conformsTo"]'
	},
	
	certifiedBy: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "a11y:certifiedBy"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "a11y:certifiedBy"]'
	},
	
	accessibilityFeature: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "schema:accessibilityFeature"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "schema:accessibilityFeature"]'
	},
	
	accessModeSufficient: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "schema:accessModeSufficient"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "schema:accessModeSufficient"]'
	},
	
	accessibilityHazard: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "schema:accessibilityHazard"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "schema:accessibilityHazard"]'
	},
	
	accessMode: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "schema:accessMode"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "schema:accessMode"]'
	},
	
	accessibilitySummary: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "schema:accessibilitySummary"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "schema:accessibilitySummary"]'
	},
	
	contactEmail: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "a11y:contactEmail"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "a11y:contactEmail"]'
	}
};

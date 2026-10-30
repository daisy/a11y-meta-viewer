
const _epub = {
	
	a11y: {
		epub3: '/opf:package/opf:metadata/opf:*[contains(@property, "a11y:") or contains(@rel, "a11y:")]',
		epub2: '/opf:package/opf:metadata/opf:meta[contains(@name, "a11y:")]'
	},
	
	conformsTo: {
		epub3: '/opf:package/opf:metadata/opf:*[@rel = "dcterms:conformsTo"]/@href|/opf:package/opf:metadata/opf:meta[@property = "dcterms:conformsTo"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "dcterms:conformsTo"]'
	},
	
	certifiedBy: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "a11y:certifiedBy"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "a11y:certifiedBy"]'
	},
	
	date: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "dcterms:date"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "dcterms:date"]'
	},
	
	certifierCredential: {
		epub3: '/opf:package/opf:metadata/opf:link[@rel = "a11y:certifierCredential"]/@href|/opf:package/opf:metadata/opf:meta[@property = "a11y:certifierCredential"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "a11y:certifierCredential"]'
	},
	
	certifierReport: {
		epub3: '/opf:package/opf:metadata/opf:link[@rel = "a11y:certifierReport"]/@href|/opf:package/opf:metadata/opf:meta[@property = "a11y:certifierReport"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "a11y:certifierReport"]'
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
	},
	
	accessibilityAPI: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "schema:accessibilityAPI"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "schema:accessibilityAPI"]'
	},
	
	accessibilityControl: {
		epub3: '/opf:package/opf:metadata/opf:meta[@property = "schema:accessibilityControl"]',
		epub2: '/opf:package/opf:metadata/opf:meta[@name = "schema:accessibilityControl"]'
	}
};

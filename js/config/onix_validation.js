
var onix = {

	conformsTo: [
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and ((onix:ProductFormFeatureValue >= 2 and onix:ProductFormFeatureValue <= 4) or (onix:ProductFormFeatureValue >= 80 and onix:ProductFormFeatureValue <= 86))]'
	],
	
	certifiedBy: [
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and (onix:ProductFormFeatureValue = "90" or onix:ProductFormFeatureValue = "93")]'
	],
	
	contactEmail: [
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "99"]'
	],
	
	accessibilityFeature: [
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and (onix:ProductFormFeatureValue >= 8 and onix:ProductFormFeatureValue <= 54)]', // code list 196 feature values
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[. = "V210"]', // closed captions
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[. = "V211"]', // open captions
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[. = "V212"]', // transcripts
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[. = "V213"]', // sign language
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[. = "V214"]', // textual description of audio
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[. = "V215"]', // audio description
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[. = "A312"]', // no background sound
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormDetail[. = "E205"]', // page break markers
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:EditionType[. = "LTE" or . = "ULP"]', // large text edition
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:EpubTechnicalProtection[. = "00"]' // unlocked
	],
	
	accessibilityHazard: [
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "00"]', // none
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "08"]', // unknown
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "13"]', // flashing
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "14"]', // no flashing
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "24"]', // unknown flashing
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "17"]', // motion
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "18"]', // no motion
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "26"]', // unknown motion
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "15"]', // sound
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "16"]', // no sound
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "12" and onix:ProductFormFeatureValue = "25"]' // unknown sound
	],
	
	accessMode: [
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[(onix:PrimaryContentType >= 1 and onix:PrimaryContentType <= 4) or (onix:PrimaryContentType >= 6 and onix:PrimaryContentType <= 7) or (onix:PrimaryContentType >= 10 and onix:PrimaryContentType <= 13) or (onix:PrimaryContentType >= 16 and onix:PrimaryContentType <= 28) or (onix:PrimaryContentType >= 44 and onix:PrimaryContentType <= 45) or (onix:PrimaryContentType >= 47 and onix:PrimaryContentType <= 50)]',
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[(onix:ProductContentType >= 1 and onix:ProductContentType <= 4) or (onix:ProductContentType >= 6 and onix:ProductContentType <= 7) or (onix:ProductContentType >= 10 and onix:ProductContentType <= 13) or (onix:ProductContentType >= 16 and onix:ProductContentType <= 28) or (onix:ProductContentType >= 44 and onix:ProductContentType <= 45) or (onix:ProductContentType >= 47 and onix:ProductContentType <= 50)]'
	],
	
	accessModeSufficient: [
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and (onix:ProductFormFeatureValue = 51 or onix:ProductFormFeatureValue = 52)]',
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail[onix:PrimaryContentType = "01" or onix:ProductContentType = "01"]'
	],
	
	accessibilitySummary: [
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "00"]',
		'/onix:ONIXMessage/onix:Product/onix:DescriptiveDetail/onix:ProductFormFeature[onix:ProductFormFeatureType = "09" and onix:ProductFormFeatureValue = "92"]'
	]
}
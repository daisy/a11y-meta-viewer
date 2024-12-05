
function processXML() {

	var xml = document.getElementById('input_packagedoc').value;
	/* the following test is not in the spec */
	
	if (xml.match('<package ')) {
		packageProcessor.processPackageDoc(xml)
	}
	
	else if (xml.match('<ONIXMessage ')) {
		onixProcessor.processOnixRecord(xml)
	}
	
	else {
		alert('Invalid xml document - package or onix root element not found');
		return;
	}
}

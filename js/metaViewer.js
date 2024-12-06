
var close_button = {};
	close_button['Close'] = function() {
		$(this).dialog('close');
	};

var meta_dialog = $("#meta-result").dialog({
	autoOpen: false,
	height: 450,
	width: '60vw',
	top: '5vw',
	modal: true,
	buttons: close_button
});

function processXML() {

	var xml = document.getElementById('input_packagedoc').value;
	
	// reest the result pane
	var result_field = document.getElementById('result');
		result_field.textContent = '';
	
	console.clear();
	
	var result;
	
	if (xml.match('<package ')) {
		result = packageProcessor.processPackageDoc(xml, result_field);
	}
	
	else if (xml.match('<ONIXMessage ')) {
		result = onixProcessor.processOnixRecord(xml, result_field);
	}
	
	else {
		alert('Invalid xml document - package or onix root element not found');
		return;
	}
	
	if (result) {
		result_field.appendChild(result);
		
		if (meta_dialog) {
			meta_dialog.dialog('open');
		}
	}
}


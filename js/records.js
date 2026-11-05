
/* result dialog */

const result_dialog = document.getElementById('result');
const result_close_button = document.getElementById("result-close-button");
const result_close_img = document.getElementById("result-close-img");

result_close_button.addEventListener("click", () => {
	closeResult();
});

result_close_img.addEventListener("click", () => {
	closeResult();
});


const result_save_button = document.getElementById("result-save-button");

result_save_button.addEventListener("click", () => {
	saveResult();
});


/* record selection */

const sel_dialog = document.getElementById('selectRecord');

function selectRecord() {
	sel_dialog.showModal();
}

const selectRecord_close_button = document.getElementById("selectRecord-close-button");
const selectRecord_close_img = document.getElementById("selectRecord-close-img");

selectRecord_close_button.addEventListener('click', () => {
  sel_dialog.close();
});

selectRecord_close_img.addEventListener('click', () => {
  sel_dialog.close();
});



// close the result dialog and reset the configuration options

function closeResult() {
	document.getElementById('result').close();
	document.getElementById('mode').value = 'compact';
	document.getElementById('format').value = 'html';
	document.getElementById('no-info').value = 'show';
}



// save the current result display

function saveResult() {

	const isJSON = document.getElementById('format').value === 'json' ? true : false;
	
	const html_head = '<!DOCTYPE html>\n<html lang="' + document.getElementById('lang').value + '>\n<head>\n<meta charset="utf-8">\n<title>Accessibility Statements</title>\n<style>html, body { margin: 0; padding: 1rem 2rem; } body { font-family: Calibri,Helvetica,Arial,sans-serif; font-size: 1.2rem; background-color: rgb(251,252,253); color: rgb(0,0,0); line-height: 2.6rem; } h3 { display: inline-block; font-size: 94%; margin: 0; } div.grid-body > h4 { font-size: 94%; font-weight: normal; font-style: italic; margin-top: 4rem; } div.grid { display: grid; grid-template-columns: fit-content(40%) 1fr; gap: 2rem; } div.grid-body > * { font-size: 98%; padding-top: 0; margin-top: 0; } div.grid-body ul { padding-left: 2rem; } div.pub { margin-bottom: 2rem; } div.pub h3 { color: rgb(32,53,139); font-size: 120% }</style>\n</head>\n<body>\n';
	
	const html_foot = '</body>\n</html>';
	
	const markupContent = isJSON ? document.querySelector('#result-body > pre').innerHTML : html_head + document.getElementById('result-body').outerHTML + html_foot;
	
	const blob = new Blob([markupContent], { type: (isJSON ? 'text/json' : 'text/html') + ';charset=utf-8' });
	
	const blobUrl = URL.createObjectURL(blob);
	
	const anchor = document.createElement('a');
		anchor.href = blobUrl;
		anchor.download = isJSON ? 'result.json' : 'result.html';
	
	document.body.appendChild(anchor);
	
	anchor.click();
	
	document.body.removeChild(anchor);
	URL.revokeObjectURL(blobUrl);
}




async function loadRecord(record_file) {

	const response = await fetch('./samples/' + record_file);
	
	const record = await response.text();
	
	document.getElementById('input_record').value = record;
	
	sel_dialog.close();

}

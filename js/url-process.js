
/* process a record submitted to the page
	no additional work is going into this feature - submitting records via get is too restricted
*/

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

const validate = params.validate && params.validate === 'true' ? true : false;
const save = params.save && params.save === 'true' ? true : false;

// github/iis/etc. won't allow long query strings by default so also accounting for record via fragment
const recordFrag = window.location.hash && window.location.hash.startsWith('#record-') ? true : false;

if (params.record || recordFrag) {
	
	document.getElementById('input_record').value = params.record ? params.record : decodeURIComponent(window.location.hash.substring(8));
	
	if (validate) {
		metadataValidator.validate()
	}
	
	else {
		metadataViewer.process(save);
	}
}

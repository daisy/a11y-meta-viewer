
function writeExplainerLink(id) {
	const a = document.createElement('a');
		a.href = '#';
		a.classList.add('explainer-link');
		a.onclick = function () { showExplainer(id); return false; }
		a.title = 'Show explainer for this field';
	
	const img = document.createElement('img');
		img.src = 'graphics/info.png';
		img.alt = 'Show explainer for this field';
		img.onmouseover = function () { this.src = 'graphics/info_hover.png' }
		img.onmouseout = function () { this.src = 'graphics/info.png' }
	
	a.appendChild(img);
	
	return a;
}

const explainer_dialog = document.getElementById("explainer");

function showExplainer(id) {
	const expl_body = document.getElementById("explainer-body");
		expl_body.innerHTML = document.getElementById(id).innerHTML;
	explainer_dialog.showModal();
}

const explainer_close_button = document.getElementById("explainer-close-button");
const explainer_close_img = document.getElementById("explainer-close-img");

explainer_close_button.addEventListener('click', () => {
  explainer_dialog.close();
});

explainer_close_img.addEventListener('click', () => {
  explainer_dialog.close();
});


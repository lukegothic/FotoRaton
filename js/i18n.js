FR = window.FR || {};
FR.i18n = (function() {
	var lang = (window.navigator.userLanguage || window.navigator.language || "es").toLowerCase().split("-")[0];
	var strings = {
		"es": {
			title: "Localizador de urinarios"
			, closest: "�El m�s cercano!"
		}
		, "en": {
			title: "WC Locator"
			, closest: "Closest one!"
		}
	}
	var setLanguage = function(_lang) {
		lang = _lang;
	};	
	return {
		setLanguage: setLanguage
		, data: strings[lang]
	}
})();
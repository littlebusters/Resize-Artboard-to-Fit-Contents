let application = require("application");

function getUiLabel(appLang = 'en') {
    if ('en' === appLang) appLang = 'default';
    let langFilePath = './i18l/' + appLang + '.json';
    try {
        let label = require(langFilePath);
        return label;
    }
    catch (e) {
        langFilePath = './i18l/default.json';
        let defaultLabel = require(langFilePath);

        return defaultLabel;
    }
}
const uiLabel = getUiLabel(application.appLanguage);

module.exports = {
    uiLabel
}
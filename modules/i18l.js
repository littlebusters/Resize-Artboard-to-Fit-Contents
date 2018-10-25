let application = require("application");

function getUiLabel(appLang) {
    if ('en' === appLang) appLang = 'default';
    let langFilePath = './i18l/' + appLang + '.json';
    let label = require(langFilePath);

    return label;
}
const uiLabel = getUiLabel(application.appLanguage);

module.exports = {
    uiLabel
}
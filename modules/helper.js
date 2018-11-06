const fs = require("uxp").storage.localFileSystem;
const configFile = 'config.json';
const dom = sel => document.querySelector(sel);
const {uiLabel} = require('./i18l');

function validateNum(val) {
    if (isNaN(val - 0)) {
        return false;
    } else {
        return true;
    }
}

function createDialog(defaultVal) {

    document.body.innerHTML = `
<style>
    #title {
        margin-bottom: 16px;
        font-size: 16px;
    }
    h2 {
        margin-top: 16px;
    }
    label {
        padding-top: 8px;
    }
    input {
        width: 70px;
    }
    .formgroup {
        padding: 0 8px 8px;
    }
    .note {
        font-size: 12px;
    }
</style>
<dialog id="dialog">
	<form id="form" method="dialog">
		<h1 id="title">${uiLabel.title}</h1>
		<h2>${uiLabel.labelSize}</h2>
		<div class="formgroup row">
            <div class="row">
                <label for="width">${uiLabel.labelSizeWidth}</label>
                <input id="width" type="number" step="1" placeholder="0" value="${defaultVal.width}" />
            </div>
            <div class="row">
                <label for="height">${uiLabel.labelSizeHeight}</label>
                <input id="height" type="number" step="1" placeholder="0" value="${defaultVal.height}" />
            </div>
        </div>
		<h2>${uiLabel.labelOffset}</h2>
		<div class="formgroup row">
            <div class="row">
                <label for="offsetBottom">${uiLabel.labelOffsetBottom}</label>
                <input id="offsetBottom" type="number" step="1" placeholder="0" value="${defaultVal.offsetBottom}" />
            </div>
		</div>
        <p class="note">${uiLabel.note}</p>
		<footer>
			<button id="cancel">Cancel</button>
			<button id="ok" type="submit" uxp-variant="cta">OK</button>
		</footer>
	</form>
</dialog>
`;
    const dialog = dom('#dialog');
    const form = dom('#form');
    const width = dom('#width');
    const height = dom('#height');
    const offsetBottom = dom('#offsetBottom');
    const cancel = dom('#cancel');
    const ok = dom('#ok');

    // Cancel button event
    const cancelDialog = () => dialog.close('reasonCanceled');
    cancel.addEventListener('click', cancelDialog);
    cancel.addEventListener('keypress', cancelDialog);

    // OK button event
    const confirmedDialog = (e) => {
        let config = {};
        config.width = width.value;
        config.height = height.value;
        config.offsetBottom = offsetBottom.value;
        dialog.close(config);
        e.preventDefault();
    };
    ok.addEventListener('click', confirmedDialog);
    ok.addEventListener('keypress', confirmedDialog);

    form.onsubmit = confirmedDialog;

    return dialog;

}

function createAlert(title, msg) {
	document.body.innerHTML = `
<style>
    dialog {
        display: flex;
        flex-direction: row-reverse;
    }
    #title {
        padding-bottom: 7px;
        border-bottom: 1px solid #ccc;
        font-size: 14px;
    }
    .plugin-icon {
        width: 48px;
        height: 48px;
        margin-right: 16px;
        border-radius: 4px;
        background-image: url(../images/resize-to-fit-icon.png);
        background-repeat: no-repeat;
        background-size: cover;
    }
</style>
<dialog id="dialog">
	<form id="form" method="dialog">
		<h1 id="title">${uiLabel[title]}</h1>
		<p>${uiLabel[msg]}</p>
		<footer>
			<button id="ok" type="submit" uxp-variant="cta">OK</button>
		</footer>
	</form>
	<div class="plugin-icon"></div>
</dialog>
`;
	const ok = dom('#ok');
	const cancelDialog = () => dialog.close();
	ok.addEventListener('click', cancelDialog);
	ok.addEventListener('keypress', cancelDialog);

	return dom('#dialog');
}

async function readConfig() {
    let entry = await openFile();

    if (entry) {
        return JSON.parse(await entry.read());
    } else {
        // Set and return default values if config.json is not found
        let defaultVal = {"width": 0, "height": 0, "offsetBottom": 0};
        const pluginDataFolder = await fs.getDataFolder();
        const buffer = await pluginDataFolder.createFile(configFile);
        buffer.write(JSON.stringify(defaultVal));

        return defaultVal;
    }
}

async function writeConfig(val) {
    let entry = await openFile();

    if (entry) {
        await entry.write(JSON.stringify(val));

        return true;
    } else {
        // Create file and write value if config.json is not found
        const pluginDataFolder = await fs.getDataFolder();
        const buffer = await pluginDataFolder.createFile(configFile);
        buffer.write(JSON.stringify(val));

        return true;
    }
}

async function openFile() {
    const pluginDataFolder = await fs.getDataFolder();
    const entries = await pluginDataFolder.getEntries();

    // Seek a config.json
    for (let i = 0; i < entries.length; i++) {
        if (configFile === entries[i].name) {
            return await entries[i];
        }
    }

    return false;
}

module.exports = {
    validateNum,
    createDialog,
    readConfig,
    writeConfig,
    createAlert
}
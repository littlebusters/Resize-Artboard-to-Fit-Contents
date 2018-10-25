const Artboard = require("scenegraph").Artboard;
const fs = require("uxp").storage.localFileSystem;
const configFile = 'config.json';
const {uiLabel} = require('./modules/i18l');
console.log(uiLabel);

console.log('-----');

async function resizeToFit(selection) {
    let sel = selection.items;
    let config = await readConfig();
    console.log(config);

    for (let selLng = 0; selLng < sel.length; selLng++) {
        let node = sel[selLng];
        let minX = node.boundsInParent.width;
        let minY = node.boundsInParent.height;
        let maxX = 0;
        let maxY = 0;

        if (node instanceof Artboard && 0 < node.children.length) {
            node.children.forEach(function (childNode) {
                let bounds = childNode.boundsInParent;
                if (minX > bounds.x) minX = bounds.x;
                if (maxX < bounds.x + bounds.width) maxX = bounds.x + bounds.width;
                if (minY > bounds.y) minY = bounds.y;
                if (maxY < bounds.y + bounds.height) maxY = bounds.y + bounds.height;
            });
            node.children.forEach(function (childNode) {
                let bounds = childNode.boundsInParent;
                let objX = -minX;
                let objY = -minY;
                if (0 < config.width) objX = 0;
                if (0 < config.height) objY = 0;
                console.log(objX + ' / ' + objY + '  |  ' + minX + ' / ' + minY + '  |  ' + maxX + ' / ' + maxY);
                childNode.moveInParentCoordinates(objX, objY);
            });
            let width = maxX - minX;
            let height = maxY - minY;
            if (0 < config.width) {
                width = config.width;
                minX = 0;
                minY = 0;
            }
            if (0 < config.height) {
                height = config.height;
                minX = 0;
                minY = 0;
            }

            node.resize(width, height + config.offsetBottom);
            node.moveInParentCoordinates(minX, minY);
        }

    }
}

async function resizeToFitPluginSettings() {
    console.log('Start readConfig');
    const defaultVal = await readConfig();
    console.log('createDialog');
    const dialog = createDialog(defaultVal);
    try {
        console.log('showModal');
        const result = await dialog.showModal();
        console.log(result);
        if ('reasonCanceled' !== result) {
            console.log('-->');
            console.log(defaultVal);
            let config = {}
            config.width = (checkValue(result.width)) ? Math.abs(result.width - 0) : defaultVal.width;
            config.height = (checkValue(result.height)) ? Math.abs(result.height - 0) : defaultVal.height;
            config.offsetBottom = (checkValue(result.offsetBottom)) ? result.offsetBottom - 0 : defaultVal.offsetBottom;
            await writeConfig(config)
            console.log(config);
        } else {
            console.log('Canceled');
        }
    } catch (e) {
        console.log(e);
    }

}

function checkValue(val) {
    if (isNaN(val - 0)) {
        return false;
    } else {
        return true;
    }
}

const dom = sel => document.querySelector(sel);
function createDialog(defaultVal) {
    console.log('-> Run createDialog');
    console.log(defaultVal);

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
		<h1 id="title">Resize Artboard to Fit Content Settings</h1>
		<h2>Fix values</h2>
		<div class="formgroup row">
            <div class="row">
                <label for="width">Width</label>
                <input id="width" type="number" step="1" placeholder="0" value="${defaultVal.width}" />
            </div>
            <div class="row">
                <label for="height">Height</label>
                <input id="height" type="number" step="1" placeholder="0" value="${defaultVal.height}" />
            </div>
        </div>
		<h2>Offset bounding</h2>
		<div class="formgroup row">
            <div class="row">
                <label for="offsetBottom">Bottom</label>
                <input id="offsetBottom" type="number" step="1" placeholder="0" value="${defaultVal.offsetBottom}" />
            </div>
		</div>
        <p class="note">"0" is follows the size of the content.</p>
		<footer>
			<button id="cancel">Cancel</button>
			<button id="ok" type="submit" uxp-variant="cta">OK</button>
		</footer>
	</form>
</dialog>
`
    const dialog = dom('#dialog');
    const form = dom('#form');
    const width = dom('#width');
    const height = dom('#height');
    const offsetBottom = dom('#offsetBottom');
    const cancel = dom('#cancel');
    const ok = dom('#ok');

    const cancelDialog = () => dialog.close('reasonCanceled');
    cancel.addEventListener('click', cancelDialog);
    cancel.addEventListener('keypress', cancelDialog);

    const confirmedDialog = (e) => {
        console.log('confirmedDialog');
        let config = {};
        config.width = width.value;
        config.height = height.value;
        config.offsetBottom = offsetBottom.value;
        dialog.close(config);
        e.preventDefault();
    }
    ok.addEventListener('click', confirmedDialog);
    ok.addEventListener('keypress', confirmedDialog);

    form.onsubmit = confirmedDialog;

    return dialog;

}

async function readConfig() {
    const pluginDataFolder = await fs.getDataFolder();
    const entries = await pluginDataFolder.getEntries();
    let entry;
    for (let i = 0; i < entries.length; i++) {
        if (configFile === entries[i].name) {
            console.log('Config file Found');
            entry = await entries[i].read();
            break;
        }
    }
    if (entry) {
        console.log('Read config file');
        return JSON.parse(entry);
    } else {
        console.log('Config file not found');
        let defaultVal = {"width": 0, "height": 0, "offsetBottom": 0};
        const buffer = await pluginDataFolder.createFile(configFile);
        buffer.write(JSON.stringify(defaultVal));

        return defaultVal;
    }
}

async function writeConfig(val) {
    const pluginDataFolder = await fs.getDataFolder();
    const entries = await pluginDataFolder.getEntries();
    let entry;
    for (let i = 0; i < entries.length; i++) {
        if (configFile === entries[i].name) {
            console.log('Config file Found');
            entry = await entries[i];
            break;
        }
    }
    if (entry) {
        console.log('Write config file');
        entry.write(JSON.stringify(val));

        return true;
    } else {
        console.log('Config file not found');
        const buffer = await pluginDataFolder.createFile(configFile);
        buffer.write(JSON.stringify(val));

        return true;
    }
}

module.exports = {
    commands: {
        "ResizeToFit": resizeToFit,
        "ResizeToFitSettings": resizeToFitPluginSettings
    }
};

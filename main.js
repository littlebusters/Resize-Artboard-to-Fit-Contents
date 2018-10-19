const Artboard = require("scenegraph").Artboard;

function resizeToFit(selection) {
    let sel = selection.items;

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
                childNode.moveInParentCoordinates(-(minX), -(minY));
            });

            node.resize(maxX - minX, maxY - minY);
            node.moveInParentCoordinates(minX, minY);
        }

    }
}

module.exports = {
    commands: {
        "ResizeToFit": resizeToFit
    }
};

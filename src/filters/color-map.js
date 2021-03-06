import colorMapUrl from "/images/colormap.png"

export default function() {
    const colorMap = this.resources.colormap.texture;

    this.addFilter('ColorMapFilter', {
        enabled: false,
        args: [colorMap, false],
        oncreate(folder) {
            folder.add(this, 'mix', 0, 1);
            folder.add(this, 'nearest');

            this._noop = function() {
                // noop
            };
            folder.add(this, '_noop').name(`<img src="${colorMapUrl}" width="220" height="13">`);
        },
    });
}
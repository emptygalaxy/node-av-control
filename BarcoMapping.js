class BarcoMapping
{
    constructor()
    {
        /**
         *
         * @type {BarcoPresetMapping[]}
         * @private
         */
        this._mapping = null;
    }



    /**
     *
     * @param {BarcoPresetMapping[]} mapping
     */
    loadMapping(mapping)
    {
        this._mapping = mapping;
    }

    /**
     *
     * @param {string} path
     * @param {boolean|null} reloadOnChange
     */
    loadMappingFile(path, reloadOnChange)
    {
        if(reloadOnChange == null)
            reloadOnChange = true;

        // path = untildify(path);

        console.log('first load started');
        this.reloadMappingFile(path);
        console.log('first load finished');

        if(reloadOnChange) {
            fs.watchFile(path, (curr, prev) => {
                this.reloadMappingFile(path);
            });
        }
    }

    /**
     *
     * @param {string} path
     */
    reloadMappingFile(path)
    {
        csv()
            .fromFile(path)
            .then((jsonObj)=>{

                /**
                 * @type {BarcoPresetMapping[]}
                 */
                let mappings = [];
                for(let index in jsonObj)
                {
                    let row = jsonObj[index];
                    mappings.push(new BarcoPresetMapping(row));
                }

                loadMapping(mappings);
            })
        // const jsonArray=await csv().fromFile(path);
        // loadMapping(jsonArray);
    }

    /**
     *
     * @param {string} name
     * @return {number}
     */
    getPresetId(name)
    {
        for(let i=0; i<this._mapping.length; i++)
        {
            let mapping = this._mapping[i];
            if(mapping.PresetName === name)
                return mapping.PresetId;
        }

        return -1;
    }

}

class BarcoPresetMapping
{
    constructor(data)
    {
        /**
         *
         * @type {number}
         */
        this.PresetId = 0;

        /**
         *
         * @type {string}
         */
        this.PresetName = null;

        this.build(data);
    }

    build(data)
    {
        if(data.PresetId != null)
            this.PresetId = parseInt(data.PresetId);
        if(data.PresetName != null)
            this.PresetName = data.PresetName;
    }
}

exports.BarcoMapping = BarcoMapping;
exports.BarcoPresetMapping = BarcoPresetMapping;
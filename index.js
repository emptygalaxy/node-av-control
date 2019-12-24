const fs = require('fs');
const midi = require('midi');
const csv = require('csvtojson');
const barco = require('barco-event-controller');

const BarcoMapping = require('./BarcoMapping.js').BarcoMapping;
const BarcoPresetMapping = require('./BarcoMapping.js').BarcoPresetMapping;


let input   = new midi.input();
input.on('message', handleMidiInputMessage);

let barcoMapping = new BarcoMapping();

/**
 *
 * @param {BarcoPresetMapping[]} mapping
 */
function loadBarcoMapping(mapping)
{
    barcoMapping.loadMapping(mapping);
}



/**
 *
 * @param {string} ip
 * @param {number} port
 */
function connectBarco(ip, port)
{
    barco.connect(ip, port);
}

/**
 * Handle the message coming in
 * @param {number} deltaTime
 * @param {number[]} message
 */
function handleMidiInputMessage(deltaTime, message)
{
    console.log('m:' + message + ' d:' + deltaTime);

    let noteon  = message[0]>(127+16);
    let channel = (message[0] - 127) % 16;
    let note = message[1];
    let velocity = message[2];

    handleNoteChange(noteon, channel, note, velocity);
}

/**
 *
 * @param {boolean} noteOn
 * @param {number} channel
 * @param {number} note
 * @param {number} velocity
 */
function handleNoteChange(noteOn, channel, note, velocity)
{
    console.log('handleNoteChange', channel, note, velocity);

    for(let i in _mapping)
    {
        let item = _mapping[i];

        if(item.Active === true && item.Channel === channel && item.Note === note && item.Velocity === velocity)
        {
            var presetName = item.BarcoPreset;
            var presetId = barcoMapping.getPresetId(presetName);
            if(presetId > -1) {

                barco.activatePreset(preset=presetId, mode=0);
                setTimeout(function(){barco.transitionAll()}, 100);
            }
        }
    }
}

/**
 *
 */
function open()
{
    input.openVirtualPort('AV Control');

}



/**
 *
 * @param {MidiNoteMapping[]} mapping
 */
function loadMapping(mapping)
{
    _mapping = mapping;
}

/**
 *
 * @param {string} path
 * @param {boolean|null} reloadOnChange
 */
function loadMappingFile(path, reloadOnChange)
{
    if(reloadOnChange == null)
        reloadOnChange = true;

    // path = untildify(path);

    console.log('first load started');
    reloadMappingFile(path);
    console.log('first load finished');

    if(reloadOnChange) {
        fs.watchFile(path, (curr, prev) => {
            reloadMappingFile(path);
        });
    }
}

/**
 *
 * @param {string} path
 */
function reloadMappingFile(path)
{
    csv()
        .fromFile(path)
        .then((jsonObj)=>{

            /**
             * @type {MidiNoteMapping[]}
             */
            let mappings = [];
            for(let index in jsonObj)
            {
                let row = jsonObj[index];
                mappings.push(new MidiNoteMapping(row));
            }

            loadMapping(mappings);
        })
    // const jsonArray=await csv().fromFile(path);
    // loadMapping(jsonArray);
}

class MidiNoteMapping
{
    constructor(data)
    {
        /**
         * Name of the setting
         * @type {string}
         */
        this.Name = null;

        /**
         * Midi Channel
         * @type {number}
         */
        this.Channel = 0;

        /**
         * Midi Note number
         * @type {number}
         */
        this.Note = 0;

        /**
         * Midi Velocity
         * @type {number}
         */
        this.Velocity = 0;

        /**
         * Mapping active or not
         * @type {boolean}
         */
        this.Active = true;

        /**
         *
         * @type {string}
         */
        this.BarcoPreset = null;

        this.build(data);
    }

    build(data)
    {
        if(data.Name != null)
            this.Name = data.Name;
        if(data.Channel != null)
            this.Channel = parseInt(data.Channel);
        if(data.Note != null)
            this.Note = parseInt(data.Note);
        if(data.Velocity != null)
            this.Velocity = parseInt(data.Velocity);
        if(data.Active != null)
            this.Active = (data.Active !== "false");
        if(data.BarcoPreset != null)
            this.BarcoPreset = data.BarcoPreset;
    }
}

exports.connectBarco = connectBarco;
exports.loadBarcoMapping = loadBarcoMapping;
exports.BarcoPresetMapping = BarcoPresetMapping;
exports.loadMapping = loadMapping;
exports.loadMappingFile = loadMappingFile;
exports.open = open;
const av = require('./');
const BarcoPresetMapping = av.BarcoPresetMapping;

av.connectBarco('192.168.50.100', 9999);
// av.loadBarcoMappingFile('sample.js');
av.loadBarcoMapping([
    new BarcoPresetMapping({PresetId: 1, PresetName: 'Mac Pro'}),
    new BarcoPresetMapping({PresetId: 2, PresetName: 'CAMS'})
])

av.loadMappingFile('sample.csv');

av.open();
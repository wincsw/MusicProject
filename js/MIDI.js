
//Define number of MIDI busses used as outputs
let selectedOutput1 = null; 
let selectedOutput2 = null;
let selectedOutput3 = null;

let selectedInput = null;
let entryToNote = null; // Stores last transmitted MIDI-Note

const _midiScale = [0, 127];
const _avgGpSizeRange = [3, 15];
const _avgSpeedRange = [0, 6];
const _entryPosRange = [1, 12];

WebMidi.enable()
    .then(onEnabled)
    .catch(err => alert("MIDI could not be enabled: " + err));


function onEnabled() {

    if (WebMidi.outputs.length < 1) {
    outputsDiv.innerHTML = "No MIDI output devices detected.";
  } else {
    selectedOutput1 = WebMidi.outputs[0];
    selectedOutput2 = WebMidi.outputs[1];
    selectedOutput3 = WebMidi.outputs[2];


    if (!selectedOutput1) { // check first or all outputs
        alert("No output selected!");
        return;
    }}
    // const outputsDiv = document.getElementById("outputs");
    // const inputsDiv = document.getElementById("inputs");

    // // === Outputs ===
    // if (WebMidi.outputs.length < 1) {
    //     outputsDiv.innerHTML = "No MIDI output devices detected.";
    // } else {
    //     const outList = document.createElement("ul");

    //     WebMidi.outputs.forEach((outputDevice, index) => {
    //         const li = document.createElement("li");
    //         const btn = document.createElement("button");
    //         btn.textContent = `Use: ${outputDevice.name}`;
    //         btn.onclick = () => {
    //             selectedOutput = outputDevice;
    //             document.getElementById("note_controls").style.display = "block";
    //             document.getElementById("cc-controls").style.display = "block";
    //             outputsDiv.innerHTML += `<p>Selected output: ${outputDevice.name}</p>`;
    //             console.log("Selected output:", outputDevice.name);
    //         };
    //         li.appendChild(document.createTextNode(`${index}: ${outputDevice.name} `));
    //         li.appendChild(btn);
    //         outList.appendChild(li);
    //     });

    //     outputsDiv.appendChild(outList);
    // }

    // // === Inputs ===
    // // we don't need this
    // if (WebMidi.inputs.length < 1) {
    //     inputsDiv.innerHTML = "No MIDI input devices detected.";
    // } else {
    //     const inList = document.createElement("ul");

    //     WebMidi.inputs.forEach((inputDevice, index) => {
    //         const li = document.createElement("li");
    //         const btn = document.createElement("button");
    //         btn.textContent = `Use: ${inputDevice.name}`;
    //         btn.onclick = () => {
    //             selectedInput = inputDevice;
    //             inputsDiv.innerHTML += `<p>Selected input: ${inputDevice.name}</p>`;
    //             console.log("Selected input:", inputDevice.name);

    //             // Clear previous listeners if any
    //             selectedInput.removeListener();

    //             // Add listeners
    //             selectedInput.addListener("noteon", e => {
    //                 console.log(`IN → Note On: ${e.note.name}${e.note.octave} (Velocity: ${e.velocity})`);
    //             });

    //             selectedInput.addListener("controlchange", e => {
    //                 console.log(`IN → CC ${e.controller.number} = ${e.value}`);
    //             });
    //         };
    //         li.appendChild(document.createTextNode(`${index}: ${inputDevice.name} `));
    //         li.appendChild(btn);
    //         inList.appendChild(li);
    //     });

    //     inputsDiv.appendChild(inList);
    // }
}

function sendToMidi(groupObj, exiting) {
    console.log(`Exiting: ${exiting}
        leader: ${groupObj.leader},
        dominantSpecies: ${groupObj.dominantSpecies},
        size: ${groupObj.size},
        speed: ${groupObj.speed},
        entryPosition: ${groupObj.entryPosition},
        exitPosition: ${groupObj.exitPosition},
        members: ${groupObj.members}`);

    // only trigger during entry 
    if (exiting) {
        return;
    }
    // all channel and ccnumber here are dummy
    let channel = null;
    let ccNumber = null;
    switch (groupObj.dominantSpecies) {
        // pitch 
        case 0:
            // note
            entryToNote = MapValue(groupObj.entryPosition, _entryPosRange, [24,36]);
            SendNote(entryToNote, 1, selectedOutput1);

            // chord partials
            let sizeToChord = MapValue(groupObj.size, _avgGpSizeRange, _midiScale);
            SendCC(120, sizeToChord, 1, selectedOutput1);

            break;

        // water pluck LFO
        case 1:
            // LFO speed/frequency 
            let speedTofreq_pluck = MapValue(groupObj.speed, _avgSpeedRange, _midiScale);
            SendCC(121, speedTofreq_pluck, 2, selectedOutput2);
            SendNote(0 + entryToNote, 2, selectedOutput2); // Update pitch and trigger 'impact' modulation

            // depth
            let sizeToDepth_pluck = MapValue(groupObj.size, _avgGpSizeRange, _midiScale);
            SendCC(122, sizeToDepth_pluck, 2, selectedOutput2);
            break;

        // lead stab LFO 
        case 2:
                // LFO speed/frequency 
            let speedTofreq_stab = MapValue(groupObj.speed, _avgSpeedRange, _midiScale);
            SendCC(121, speedTofreq_stab, 3, selectedOutput3);
            SendNote(0 + entryToNote, 2, selectedOutput3);

            // depth
            let sizeToDepth_stab = MapValue(groupObj.size, _avgGpSizeRange, _midiScale);
            SendCC(122, sizeToDepth_stab, 3, selectedOutput3);
            break;


        // lead stab sequences
        case 3:
            let sizeToSteps_stab = MapValue(groupObj.size, _avgGpSizeRange, _midiScale);
            SendCC(124, sizeToSteps_stab, 4, selectedOutput3);
            break;

        // sub bass sequences 
        case 4:
            let sizeToSteps_bass = MapValue(groupObj.size, _avgGpSizeRange, _midiScale);
            SendCC(124, sizeToSteps_bass, 5, selectedOutput1);
            break;

        // volumn toggle for pluck, stab, basss
        case 5:
            let speedToVol = MapValue(groupObj.speed, _avgSpeedRange, _midiScale);
            let channels = [2,4,5]; // dummy
            let entryToChannel = MapValue(groupObj.entryPosition, _entryPosRange, [0, 2]);

            SendCC(125, speedToVol, channels[entryToChannel], selectedOutput1);
    }
}

// -- map value from old range to new range --
function MapValue(value, oldRange, newRange) {
    let ratio = (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]);
    let mappedValue = Math.round(ratio * (value - oldRange[0]) + newRange[0]);
    console.log(typeof mappedValue);

    console.log(`Map ${value} from ${oldRange[0]} - ${oldRange[1]} to ${newRange[0]} - ${newRange[1]} (ratio of ${ratio}) = ${mappedValue}`);

    return (mappedValue);
}

// -- modifier for the LFO of water pluck and lead stab
function LFOMode(speed, groupSize, ccNumber, channel) {

    // LFO speed/frequency 
    let speedTofreq = MapValue(speed, _avgSpeedRange, _midiScale);
    SendCC(ccNumber, speedTofreq, channel);

    // depth
    let sizeToDepth = MapValue(groupSize, _avgGpSizeRange, _midiScale);
    SendCC(ccNumber, sizeToDepth, channel, sel);

}

// === Outgoing note ===
function SendNote(note, channel, output) {
    if (!output) { // dummy output and assign later depend what it is call on the final computer 
        alert("No Note output selected!");
        return;
    }

    
    const velocity = 0.9;
    const duration = 1000;

    output.playNote(note, channel,{ velocity });
    setTimeout(() => {
        output.stopNote(note, channel);
    }, duration);

    console.log(`Sent ${note} to channel ${channel}`);
};

// === Outgoing CC ===
function SendCC(ccNumber, value, channel, output) {
    console.log(output);
    if (!output) {
        alert("No CC output selected!");
        return;
    }

    output.sendControlChange(ccNumber, value, channel);

    console.log(`Sent CC ${ccNumber} = ${value} to channel ${channel}`);
};

let selectedOutput = null;
let selectedInput = null;
const _midiScale = [0, 127];
const _avgGpSizeRange = [3, 15];
const _avgSpeedRange = [0, 3];
const _entryPosRange = [1, 12];

WebMidi.enable()
    .then(onEnabled)
    .catch(err => alert("MIDI could not be enabled: " + err));

function onEnabled() {
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

    // all channel and ccnumber here are dummy
    let channel = null;
    let ccNumber = null;
    switch (groupObj.dominantSpecies) {
        // pitch 
        case 0:
            // NOTE: trigger only went note is entering?
            if (exiting) {
                break;
            }
            // note
            let entryToNote = Math.round(MapValue(groupObj.entryPosition, _entryPosRange, _midiScale));
            SendNote(entryToNote, channel);

            // chord partials
            let sizeToChord = Math.round(MapValue(groupObj.size, _avgGpSizeRange, _midiScale));
            SendCC(ccNumber, sizeToChord, channel);

            break;

        // water pluck LFO
        case 1:
            LFOMode(groupObj.speed, groupObj.size, ccNumber, channel);
            break;

        // lead stab LFO 
        case 2:
            LFOMode(groupObj.speed, groupObj.size, ccNumber, channel);
            break;

        // lead stab sequences
        case 3:
            let sizeToSteps_stab = Math.round(MapValue(groupObj.size, _avgGpSizeRange, _midiScale));
            SendCC(ccNumber, sizeToSteps_stab, channel);
            break;

        // sub bass sequences 
        case 4:
            let sizeToSteps_bass = MapValue(groupObj.size, _avgGpSizeRange, _midiScale);
            SendCC(ccNumber, sizeToSteps_bass, channel);
            break;

        // volumn toggle for pluck, stab, basss
        case 5:
            let volueRange = (0, 100); // not sure
            let speedToVol = MapValue(groupObj.speed, _avgSpeedRange, volueRange);
            let channels = [3, 5, 7];
            let entryToChannel = Math.round(MapValue(groupObj.entryPosition, _entryPosRange, [0, 2]));

            SendCC(ccNumber, speedToVol, channels[entryToChannel]);
    }
}

// -- map value from old range to new range --
function MapValue(value, oldRange, newRange) {
    let ratio = (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]);
    let mappedValue = ratio * (value - oldRange[0]) + newRange[0];
    console.log(`Map ${value} from ${oldRange[0]} - ${oldRange[1]} to ${newRange[0]} - ${newRange[1]} (ratio of ${ratio}) = ${mappedValue}`);
    return (mappedValue);
}

// -- modifier for the LFO of water pluck and lead stab
function LFOMode(speed, groupSize, ccNumber, channel) {
    // NOTE: do we need to round the value to integer?

    // LFO speed/frequency 
    let speedTofreq = MapValue(speed, _avgSpeedRange, _midiScale);
    SendCC(ccNumber, speedTofreq, channel);

    // depth
    let sizeToDepth = MapValue(groupSize, _avgGpSizeRange, _midiScale);
    // NOTE: not sure if this is mapped to the midi scale
    SendCC(ccNumber, sizeToDepth, channel);

}

// === Outgoing note ===
function SendNote(note, channel) {
    // if (!selectedOutput) { // dummy output and assign later depend what it is call on the final computer 
    //     alert("No output selected!");
    //     return;
    // }

    // const velocity = 0.9;
    // const duration = 50;

    // selectedOutput.playNote(note, channel, { velocity });
    // setTimeout(() => {
    //     selectedOutput.stopNote(note, channel);
    // }, duration);

    console.log(`Sent ${note} to channel ${channel}`);
};

// === Outgoing CC ===
function SendCC(ccNumber, value, channel) {
    // if (!selectedOutput) {
    //     alert("No output selected!");
    //     return;
    // }

    // selectedOutput.sendControlChange(ccNumber, value, channel);
    // ccNumber: id of the cc message

    console.log(`Sent CC ${ccNumber} = ${value} to channel ${channel}`);
};

let selectedOutput = null;
let selectedInput = null;

WebMidi.enable()
    .then(onEnabled)
    .catch(err => alert("MIDI could not be enabled: " + err));

function onEnabled() {
    const outputsDiv = document.getElementById("outputs");
    const inputsDiv = document.getElementById("inputs");

    // === Outputs ===
    if (WebMidi.outputs.length < 1) {
        outputsDiv.innerHTML = "No MIDI output devices detected.";
    } else {
        const outList = document.createElement("ul");

        WebMidi.outputs.forEach((outputDevice, index) => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.textContent = `Use: ${outputDevice.name}`;
            btn.onclick = () => {
                selectedOutput = outputDevice;
                document.getElementById("note_controls").style.display = "block";
                document.getElementById("cc-controls").style.display = "block";
                outputsDiv.innerHTML += `<p>Selected output: ${outputDevice.name}</p>`;
                console.log("Selected output:", outputDevice.name);
            };
            li.appendChild(document.createTextNode(`${index}: ${outputDevice.name} `));
            li.appendChild(btn);
            outList.appendChild(li);
        });

        outputsDiv.appendChild(outList);
    }

    // === Inputs ===
    if (WebMidi.inputs.length < 1) {
        inputsDiv.innerHTML = "No MIDI input devices detected.";
    } else {
        const inList = document.createElement("ul");

        WebMidi.inputs.forEach((inputDevice, index) => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.textContent = `Use: ${inputDevice.name}`;
            btn.onclick = () => {
                selectedInput = inputDevice;
                inputsDiv.innerHTML += `<p>Selected input: ${inputDevice.name}</p>`;
                console.log("Selected input:", inputDevice.name);

                // Clear previous listeners if any
                selectedInput.removeListener();

                // Add listeners
                selectedInput.addListener("noteon", e => {
                    console.log(`IN → Note On: ${e.note.name}${e.note.octave} (Velocity: ${e.velocity})`);
                });

                selectedInput.addListener("controlchange", e => {
                    console.log(`IN → CC ${e.controller.number} = ${e.value}`);
                });
            };
            li.appendChild(document.createTextNode(`${index}: ${inputDevice.name} `));
            li.appendChild(btn);
            inList.appendChild(li);
        });

        inputsDiv.appendChild(inList);
    }
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
}

// === Outgoing note ===
window.sendNote = function (note) {
    if (!selectedOutput) {
        alert("No output selected!");
        return;
    }

    const channel = 1;
    const velocity = 0.9;
    const duration = 1000;

    selectedOutput.playNote(note, channel, { velocity });
    setTimeout(() => {
        selectedOutput.stopNote(note, channel);
    }, duration);

    console.log(`Sent: ${note}`);
};

// === Outgoing CC ===
window.sendCC = function (ccNumber, value) {
    if (!selectedOutput) {
        alert("No output selected!");
        return;
    }

    const channel = 1;
    selectedOutput.sendControlChange(ccNumber, value, channel);

    console.log(`Sent CC ${ccNumber} = ${value}`);
};

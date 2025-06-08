# Clusters

This is the Clusters particle simulator in JavaScript

View it online: 
https://ventrella.com/Clusters/

Overview here:
https://ventrella.com/Clusters/intro.html


# MIDI Setup

The MIDI application uses virtual MIDI buses to route MIDI from the Clusters simulator to a DAW or MIDI Device, in this case Ableton Live 12. To set up virtual MIDI buses on mac using the IAC Driver, please refer to this tutorial: https://help.ableton.com/hc/en-us/articles/209774225-Setting-up-a-virtual-MIDI-bus. Depending on if and how much separate note data is communicated, one or multiple buses may be required. In the Template project we're using three MIDI buses, one for each channel in the project that is receiving own MIDI Note triggers.

# MIDI Channel and CC Mappings

For intelligibilty the CC controls for each channel in Live is assigned to its own MIDI channel and the same type of control are assigned the same CC numbers on their respecitve MIDI channels. --refer to the table---
To set up the template project as configured in the MIDI.js file, the MIDI input setup for each Live channel is as follows:
- Main pad: IAC-driver (Bus 1), All Channels
- Pluck: IAC-driver (Bus 2), All Channels
- Lead Stab: IAC-driver (Bus 3), All Channels
- Bass: IAC-driver (Bus 1), All Channels


In order not to interfere with reserved CC numbers of instruments used in the template project CC numbers 120-125 are used. This does not abide by MIDI standard (https://studiocode.dev/resources/midi-cc/) but can be easily changed in the MIDI.js file. 

# Template MIDI Effects

The Ableton MIDI effect rack allows a user to receive and modify incoming MIDI to a Live channel, before it is used by a MIDI instrument. In this project, this is used to vary the same (or small amounts of) MIDI information and adjust it to fit different purposes. An incoming MIDI note can be transposed to a different octave, multiplied into a chord, or used as a trigger for a MIDI envelope.
For each audiochannel in this template, multiple configurations of MIDI manipulation are set up in different chains in the effect rack. This could be for example five chains where an incoming MIDI note is turned in to five different chords. Our chain selector utilizes a range of 0-127 within which any number of chains are evenly distributed (C1: 0-9, C2: 10-19, and so on). Using a macro control to move the chain selector, this allows us to use the same full range (0-127) of MIDI CC messages in all applications of CC messaging in this project.

# Chord select
The main pad channel utilizes an Ableton MIDI Effect Rack to alter the harmonic richness of the pad sound. Five chains each containing the Chord MIDI effect with an increasing amount of shifts vary the contents of the 'chord' being sent to the instrument all the way from two to six tones. The five chains are spread out evenly over the 128 values of the 'Chord select' macro control.

# Sequence select
The pluck, stab and bass channels all use MIDI Effect Racks to switch between four increasingly busy sequences. The four chains are spread out evenly over the 128 values of the 'Seq select' macro control.

# Impact modulation
The pluck and lead channels in the Template project use an Envelope MIDI and an LFO module to create a decaying burst of LFO modulation. Triggered by an incoming MIDI note, the Envelope MIDI generates an ADSR shaped signal modulating the LFO rate. The LFO is then used to modulate any optional soundshaping parameters such as filter envelopes of the MIDI instrument.



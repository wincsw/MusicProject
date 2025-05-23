
var canvasID = document.getElementById('clustersCanvas');
var canvas = canvasID.getContext('2d');
var canvasRectangle = canvasID.getBoundingClientRect();

"use strict";

const RIGHT_PANEL_WIDTH = 400;
const MAX_GRABBED = 100;

//const AVERAGE_SOCIAL_FORCES = true;
//const NON_AVERAGE_FORCE_SCALE = 0.02;

canvasID.width = window.innerWidth - 20;
canvasID.height = window.innerHeight - 20;

var viewportWidth = canvasID.width - RIGHT_PANEL_WIDTH;
var viewportHeight = canvasID.height;

//----------------------
function Clusters() {
    const MOUSE_RADIUS = 30.0;
    const SAMPLE_RADIUS = 60.0;
    const GROUP_RADIUS = 25.0;
    const MOTION_BLUR_SLIDER_RES = 100;

    //----------------------------------	
    // genetics
    //----------------------------------	
    const NUM_INDIVIDUALS = 20;
    const MAX_GENES = 1000;
    const MUTATION_RATE = 0.05;
    const CROSSOVER_RATE = 0.1;
    const TOURNAMENT_NUMBER = 2;
    const FITNESS_DECREASE = -0.01;
    const FITNESS_SCALE = 5.0;
    const SIMULATION_DURATION = 200;

    //----------------------------------	
    // rendering and animation
    //----------------------------------	
    //const SHOWING_SENSORS 	= true;
    const START_PAUSE = 50;

    //-------------------------
    function GrabbedParticle() {
        this.offset = new Vector2D();
        this.id = NULL_INDEX;
    }

    //------------------------------------------------
    // local variables
    //------------------------------------------------	
    let _particles = new Array(MAX_PARTICLES);
    let _view = new View();
    //let _sensors		= new Array();
    let _grabSet = new Array();
    let _sampleSet = new Array();
    let _groups = new Array();
    let _grabState = 0;
    let _numGrabbed = 0;
    let _ecosystem = new Ecosystem();
    let _forceEditor = new ForceEditor();
    let _mouseDown = false;
    let _sampleOn = false; // key s used for setting sample radius
    let _sampleX = 0;
    let _sampleY = 0;
    let _frozen = false;
    let _mouseX = 0;
    let _mouseY = 0;
    let _updateFreq = 0;
    let _startClock = 0;
    let _GARunning = false;
    let _GA = new GA();
    let _GAClock = 0;
    let _GAGeneration = 0;
    let _GACurrentEco = NULL_INDEX;
    let _extendedPoint;

    //--------------------------------------
    // create the array of _particles
    //--------------------------------------
    for (let i = 0; i < MAX_PARTICLES; i++) {
        _particles[i] = new Particle();
    }

    /*
    //--------------------------------------
    // create the array of sensors
    //--------------------------------------
    for (let s=0; s<NUM_SENSORS; s++)
    {
        _sensors[s] = new Sensor(); 
    }    
    */

    //--------------------------------------
    // create the grab set
    //--------------------------------------
    for (let g = 0; g < MAX_GRABBED; g++) {
        _grabSet[g] = new GrabbedParticle();
    }


    //-------------------------------------
    this.setCanvasSize = function (w, h) {
        canvasID.width = w;
        canvasID.height = h;

        viewportWidth = canvasID.width;
        viewportHeight = canvasID.height;

    }

    //----------------------------
    this.initialize = function () {
        //-------------------------
        // initialize ecosystem
        //-------------------------
        _ecosystem.initialize();

        //--------------------------------------
        // initialize the particle array
        //--------------------------------------
        for (let i = 0; i < MAX_PARTICLES; i++) {
            _particles[i].species = 0;
            _particles[i].position.clear();
            _particles[i].velocity.clear();

            for (let f = 0; f < MAX_FORCE_STEPS; f++) {
                _particles[i].forces[f].clear();
            }
        }

        //--------------------------------------
        // initialize the array of sensors
        //--------------------------------------
        //this.initializeSensors();

        _GAGeneration = 0;
        _GAClock = 0;
        _updateFreq = 10;
        _startClock = 0;

        //-------------------
        // do a resize now!
        //-------------------
        this.resize();

        //-----------------------------------
        // load the default ecosystem...
        //-----------------------------------
        //this.loadEcosystem( ECO_ACROBATS ); 
        //this.loadEcosystem( ECO_FLUID ); 
        //this.loadEcosystem( ECO_DEMO ); 
        //this.loadEcosystem( -1 ); 

        this.loadEcosystem(ECO_ALLIANCES);
        _ecosystem.blur = 0.2;


        //this.loadEcosystem( ECO_DEMO );		


        //-----------------------------------------------------------------------
        // initialize lil-gui
        //-----------------------------------------------------------------------
        const gui = new lil.GUI();

        obj = {
            Particles: _ecosystem.numParticles,
            Species: _ecosystem.numSpecies,
            //Trails: _ecosystem.blur,
            Ecosystem: 'Alliances',
            // ChangeColor: function () {
            //     _ecosystem.randomizeSpeciesColors();

            //     for (let i = 0; i < MAX_PARTICLES; i++) {
            //         _particles[i].setColor(_ecosystem.species[_particles[i].species].color);
            //     }
            // },
            Pause: function () {
                if (_frozen) {
                    _frozen = false;
                }
                else {
                    _frozen = true;
                }
            },
            Zap: function () {
                for (let i = 0; i < MAX_PARTICLES; i++) {
                    let x = -40.0 * ONE_HALF + Math.random() * 40.0;
                    let y = -40.0 * ONE_HALF + Math.random() * 40.0;

                    _particles[i].velocity.setXY(x, y);
                }
            }
        }

        const particleSlider = gui.add(obj, 'Particles', MIN_PARTICLES, MAX_PARTICLES, 1)
        particleSlider.onFinishChange(value => {
            _ecosystem.numParticles = value;
            console.log(`New Particle Number: ${_ecosystem.numParticles}`);
        });
        particleSlider.listen(true);
        const speciesSlider = gui.add(obj, 'Species', MIN_SPECIES, MAX_SPECIES, 1);
        speciesSlider.onFinishChange(value => {
            //_ecosystem.numSpecies = value;
            this.setNumSpecies( value );
            console.log(`New Species Number: ${_ecosystem.numSpecies}`);
        });
        speciesSlider.listen(true);


        // gui.add(obj, 'Trails', 0, 1, 0.01).onFinishChange(value => {
        //     _ecosystem.blur = value;
        //     console.log(`New Motion Blue Value: ${_ecosystem.blur}`);
        // });

        const ecosystemDropDown = gui.add(obj, 'Ecosystem', ['Demo', 'Acrobats', 'Field', 'Gems', 'Mitosis', 'Alliances', 'Planets', 'Red Menace', 'Stigmergy', 'Pollack', 'Simplify', 'Dreamtime']);
        ecosystemDropDown.onChange(value => {
            if (value == "Demo") { this.loadEcosystem(ECO_DEMO); }
            else if (value === "Bang") { this.loadEcosystem(ECO_BANG); }
            else if (value === "Field") { this.loadEcosystem(ECO_FIELD); }
            else if (value === "Gems") { this.loadEcosystem(ECO_GEMS); }
            else if (value === "Mitosis") { this.loadEcosystem(ECO_MITOSIS); }
            else if (value === "Alliances") { this.loadEcosystem(ECO_ALLIANCES); }
            else if (value === "Planets") { this.loadEcosystem(ECO_PLANETS); }
            else if (value === "Red Menace") { this.loadEcosystem(ECO_RED_MENACE); }
            else if (value === "Pollack") { this.loadEcosystem(ECO_POLLACK); }
            else if (value === "Simplify") { this.loadEcosystem(ECO_SIMPLIFY); }
            else if (value === "Dreamtime") { this.loadEcosystem(ECO_DREAM); }

            particleSlider.setValue(_ecosystem.numParticles);
            particleSlider.updateDisplay();
            speciesSlider.setValue(_ecosystem.numSpecies);
            speciesSlider.updateDisplay();
            _ecosystem.blur = 0.2;

        });

        // gui.add(obj, 'ChangeColor');
        gui.add(obj, 'Zap');
        gui.add(obj, 'Pause');


        // document.getElementById('numParticlesSlider').min = MIN_PARTICLES;
        // document.getElementById('numParticlesSlider').max = MAX_PARTICLES;

        // document.getElementById('numSpeciesSlider').min = MIN_SPECIES;
        // document.getElementById('numSpeciesSlider').max = MAX_SPECIES;

        // document.getElementById('motionBlurSlider').min = 0;
        // document.getElementById('motionBlurSlider').max = MOTION_BLUR_SLIDER_RES;

        // document.getElementById("numParticlesInput").value = _ecosystem.numParticles;
        // document.getElementById("numSpeciesInput").value = _ecosystem.numSpecies;
        // document.getElementById("motionBlurInput").value = _ecosystem.blur;

        //-----------------------------------
        // initialize force editor...
        //-----------------------------------
        _forceEditor.initialize();

        //-----------------------------------
        // initialize view...
        //-----------------------------------
        _view.initialize();

        //canvas.fillStyle = "rgb( 160, 160, 160 )";
        //canvas.fillRect( 0, 0, viewportWidth, viewportHeight );		

        //----------------------------------------------------------
        // initial drawing of the background of the control panel
        //----------------------------------------------------------
        //canvas.fillStyle = "rgb( 160, 160, 160 )";
        //canvas.fillRect( viewportWidth, 0, viewportWidth + 100, viewportHeight );		



        //------------------------------------------------
        // the first call to update starts the timer...
        //------------------------------------------------
        this.update();
    }

    /*
    //------------------------------
    this.initializeSensors = function()
    {
        for (let s=0; s<NUM_SENSORS; s++)
        {
            _sensors[s].initialize();
        }            
    }
    */

    //------------------------
    this.resize = function () {
        // canvasID.width = window.innerWidth - 20;
        // canvasID.height = window.innerHeight - 20;

        // viewportWidth = canvasID.width - RIGHT_PANEL_WIDTH;
        // viewportHeight = canvasID.height;
        canvasID.width = window.innerWidth - 20;
        canvasID.height = window.innerHeight - 20;

        viewportWidth = canvasID.width;
        viewportHeight = canvasID.height;
    }

    //------------------------
    this.update = function () {
        if (_startClock < START_PAUSE) {
            _startClock++;
        }
        else {
            if (!_frozen) {
                for (let i = 0; i < _ecosystem.numParticles; i++) {
                    _particles[i].update();

                    //------------------------------------
                    // update _particles interactions
                    //------------------------------------
                    this.updateParticleInteractions(i);

                    //----------------------------------------------------------
                    // scroll the array of force steps and apply delayed force
                    //----------------------------------------------------------
                    for (let s = 0; s < _ecosystem.species[_particles[i].species].steps; s++) {
                        _particles[i].forces[s].copyFrom(_particles[i].forces[s + 1]);
                    }

                    _particles[i].addForce(_particles[i].forces[0].x, _particles[i].forces[0].y);
                }
            }
        }

        //----------------------------------------        
        // genetic algorithm...      
        //----------------------------------------   
        if (_GARunning) {
            //this.updateSensors();

            /*
            _GAClock++;     
        	
            if ( _GAClock > SIMULATION_DURATION )
            {
                _GAClock = 0;
            	
                _GAGeneration ++;
	
                let fitness = this.calculateFitness();
	
                _GA.setFitnessOfIndividual( _GACurrentEco, fitness );
	
                this.updateGeneticAlgorithm();
            }
            */
        }

        //----------------------------        
        // update the force editor...      
        //----------------------------  
        //_forceEditor.update( _mouseX, _mouseY, _mouseDown );

        //-------------------------------------        
        // check for grabbing particles...      
        //-------------------------------------
        if (_mouseDown) {
            if (_grabState === 0) {
                _grabState = 1;

                let grabIndex = 0;

                for (let i = 0; i < _ecosystem.numParticles; i++) {
                    let xx = _particles[i].position.x - _mouseX;
                    let yy = _particles[i].position.y - _mouseY;

                    let distance = Math.sqrt(xx * xx + yy * yy);
                    if (distance < MOUSE_RADIUS) {
                        if (grabIndex < MAX_GRABBED - 1) {
                            _grabState = 2;
                            _grabSet[grabIndex].id = i;
                            _grabSet[grabIndex].offset.setXY(xx, yy);
                            grabIndex++;
                        }
                    }
                }

                _numGrabbed = grabIndex;
            }
            else if (_grabState === 2) {
                //-------------------------------------------
                // move them grabbed particles along...      
                //-------------------------------------------
                for (let i = 0; i < _numGrabbed; i++) {
                    _particles[_grabSet[i].id].setPosition
                        (
                            _mouseX + _grabSet[i].offset.x,
                            _mouseY + _grabSet[i].offset.y
                        );
                }
            }
        }

        //-------------------------------------        
        // monitor sample area     
        //-------------------------------------
        if (_sampleOn){
            for (let i = 0; i < _ecosystem.numParticles; i++) {
                let xx = _particles[i].position.x - _sampleX;
                let yy = _particles[i].position.y - _sampleY;

                let distance = Math.sqrt(xx * xx + yy * yy);
                if ((distance < SAMPLE_RADIUS) && !_sampleSet.find(id => id === i)) {  // check if particle falls within sample area and is not already in area (sampleset)
                    _sampleSet.push(i);
                    const entryPosition = getSlice(_particles[i].position.x,_particles[i].position.y,_sampleX,_sampleY,SAMPLE_RADIUS);
                    console.log("Particle", i, "entering at position", entryPosition);
                    if (!_groups.some(g => g.members.includes(i))){  // check if particle is not already a group member
                        _extendedPoint = extendFromEntry(_sampleX, _sampleY, _particles[i].position.x, _particles[i].position.y, GROUP_RADIUS-5);
                        //--- check if there is a group around the extended point
                        let groupSet = new Array();
                        groupSet.push(i); // add leader to the group
                        for (let j = 0; j < _ecosystem.numParticles; j++) {
                            let dx = _particles[j].position.x - _extendedPoint.x;
                            let dy = _particles[j].position.y - _extendedPoint.y;

                            let distance = Math.sqrt(dx * dx + dy * dy);
                            // if particle is within group radius view and not already in groupSet and not in another group...
                            if ((distance < GROUP_RADIUS) && !groupSet.find(id => id === j) && !_groups.some(g => g.members.includes(j))) {
                                groupSet.push(j);
                            }
                        }
                        if (groupSet.length > 2){ // group has to be 3 or more to be a group
                            // create group
                            console.log("leader", i, "group", groupSet);
                            _groups.push(createGroup(groupSet, _particles, entryPosition)); // add created group to the groups array
                            console.log("groups add", _groups);
                        }
                    }
                }
            }

            //--- check if any sampled particles have left the sample area
            for (let i = 0; i < _sampleSet.length; i++) {
                let xx = _particles[_sampleSet[i]].position.x - _sampleX;
                let yy = _particles[_sampleSet[i]].position.y - _sampleY;

                let distance = Math.sqrt(xx * xx + yy * yy);
                if (distance > SAMPLE_RADIUS) {
                    console.log("Particle", _sampleSet[i], "leaving area")
                    if (_groups.find(id => (id.leader === _sampleSet[i]))){ //remove group from groups if leaving particle is a group leader
                        reportGroupLeaving(_groups, _sampleSet[i]); 
                        _groups = _groups.filter(id => !(id.leader === _sampleSet[i]));
                        console.log("groups rem", _groups);
                    }
                    _sampleSet = _sampleSet.filter(id => !(id === _sampleSet[i])); //remove particle index from set
                }
            }
        }
        //_view.update();      

        //---------------------------
        // render everything...
        //---------------------------
        this.render(_view);

        //---------------------------
        // trigger next update...
        //---------------------------
        this.timer = setTimeout("clusters.update()", _updateFreq);
    }

    /*
    //---------------------------------
    this.updateSensors = function()
    {
        for (let s=0; s<NUM_SENSORS; s++)
        {
            _sensors[s].update();
        	
            //-------------------------------------
            // find nearby cluster particles
            //-------------------------------------
            for (let p=0; p<_ecosystem.numParticles; p++)
            {
                let xx = _particles[p].position.x - _sensors[s].position.x;
                let yy = _particles[p].position.y - _sensors[s].position.y;
                
                let distanceSquared = xx*xx + yy*yy;
                
                if (( distanceSquared < SENSOR_RADIUS * SENSOR_RADIUS )
                &&  ( distanceSquared > ZERO ))
                {
                    let distance = Math.sqrt( distanceSquared );
                    //_sensors[s].velocity.x += ( xx / distance ) * SENSOR_ATTRACTION;
                    //_sensors[s].velocity.y += ( yy / distance ) * SENSOR_ATTRACTION;
                	
                    let x = ( xx / distance ) * SENSOR_ATTRACTION;
                    let y = ( yy / distance ) * SENSOR_ATTRACTION;
                    _sensors[s].addForce( x, y );
                }
            }					
        }    
    }
    */

    //--------------------------------------------
    this.updateParticleInteractions = function (i) {
        let x__ = 0.0;
        let y__ = 0.0;
        let num = 0;

        //----------------------------------------------
        // scan through the other particles
        //----------------------------------------------
        for (let n = 0; n < _ecosystem.numParticles; n++) {
            if (n != i) {
                //-------------------------------------------------------------
                // calculate distance
                //-------------------------------------------------------------
                let xx = _particles[n].position.x - _particles[i].position.x;
                let yy = _particles[n].position.y - _particles[i].position.y;

                let distanceSquared = xx * xx + yy * yy;

                let socialRadius = _ecosystem.species[_particles[i].species].socialRadius[_particles[n].species];

                if (distanceSquared < socialRadius * socialRadius) {
                    let distance = Math.sqrt(distanceSquared);

                    if (distance > ZERO) {
                        let xDir = xx / distance;
                        let yDir = yy / distance;

                        //---------------------------------------------------------------------------------------------
                        // collision
                        //---------------------------------------------------------------------------------------------
                        let collisionRadius = _ecosystem.species[_particles[i].species].collisionRadius[_particles[n].species];
                        if (distance < collisionRadius) {
                            let collisionForce
                                = (ONE - (distance / collisionRadius))
                                * _ecosystem.species[_particles[i].species].collisionForce[_particles[n].species];
                            _particles[i].addForce(-xDir * collisionForce, -yDir * collisionForce);
                        }

                        let socialForce = _ecosystem.species[_particles[i].species].socialForce[_particles[n].species];

                        //--------------------------------------------------------------------------------------------
                        // ramp down (attenuate with distance)
                        //--------------------------------------------------------------------------------------------
                        if (_ecosystem.species[_particles[i].species].socialRamp[_particles[n].species]) {
                            socialForce *= (ONE - (distance / socialRadius));
                            socialForce *= 2;
                        }

                        x__ += xDir * socialForce;
                        y__ += yDir * socialForce;
                        num++;

                        /*
                        // As an experiment, instead of the above, I am just crafting the entire force-field here...
                        
                        let f = 1.0 - ( distance / socialRadius );
                        
                        f = Math.pow( f, 4.0 );
                        
                        f *= 0.6;
                        
                        _particles[i].addForce( -xDir * f, -yDir * f );
                        */
                    }
                }
            }
        }

        let steps = _ecosystem.species[_particles[i].species].steps;

        if (num > 0) {
            if (_ecosystem.species[_particles[i].species].averageForces) {
                _particles[i].forces[steps].x = x__ / num;
                _particles[i].forces[steps].y = y__ / num;
            }
            else {
                _particles[i].forces[steps].x = x__ * _ecosystem.species[_particles[i].species].nonAverageForce;
                _particles[i].forces[steps].y = y__ * _ecosystem.species[_particles[i].species].nonAverageForce;
            }
        }
        else {
            _particles[i].forces[steps].clear();
        }
    }


    /*
    //-----------------------------------
    this.calculateFitness = function()
    {
        let fitness = ZERO;
    	
        for (let s=0; s<NUM_SENSORS; s++)
        {
            let distance = _sensors[s].position.getDistanceTo( _sensors[s].startPosition ); 
            fitness += distance;			
        }
    	
        fitness /= canvasID.width;		// normalize in space
        fitness /= NUM_SENSORS;		// normalize by num sensors
        fitness *= FITNESS_SCALE;	// arbitrary scalar 

        return fitness;
    }
    */

    //------------------------------
    this.render = function (view) {
        //---------------------------------------------------------------------
        // clear the screen
        //---------------------------------------------------------------------
        canvas.fillStyle = "rgba( 0, 0, 0, " + (1.0 - _ecosystem.blur) + " )";
        canvas.fillRect(0, 0, viewportWidth, viewportHeight);

        //-----------------------------------
        // draw the particles
        //-----------------------------------	
        for (let i = 0; i < _ecosystem.numParticles; i++) {
            _particles[i].render(view);
        }

        //-----------------------------------
        // draw the mouse cursor
        //-----------------------------------	
        if (_mouseDown) {
            if (_mouseX < viewportWidth) {
                canvas.lineWidth = 2;
                canvas.strokeStyle = "rgb( 100, 100, 100 )";
                canvas.beginPath();
                canvas.arc(_mouseX, _mouseY, MOUSE_RADIUS, 0, Math.PI * 2, false);
                canvas.stroke();
            }

            //--------------------------------------------------
            // redraw the background of the control panel, as
            // other things may have splattered all over it.
            //--------------------------------------------------
            //canvas.fillStyle = "rgb( 160, 160, 160 )";
            //canvas.fillRect( viewportWidth, 0, viewportWidth + 100, viewportHeight );		
            canvas.clearRect(viewportWidth, 0, viewportWidth + 100, viewportHeight);
        }

        //-------------------------------------        
        // draw sample area     
        //-------------------------------------
        if (_sampleOn){

            if (_mouseX < viewportWidth) {
                canvas.lineWidth = 2;
                canvas.strokeStyle = "rgb( 255, 255, 100 )";
                canvas.beginPath();
                canvas.arc(_sampleX, _sampleY, SAMPLE_RADIUS, 0, Math.PI * 2, false);
                canvas.stroke();
            }

        }
        //-------------------------------------        
        // draw temp group search area     
        //-------------------------------------
        if (_sampleOn && _extendedPoint){

            if (_mouseX < viewportWidth) {
                canvas.lineWidth = 2;
                canvas.strokeStyle = "rgb( 255, 0, 0 )";
                canvas.beginPath();
                canvas.arc(_extendedPoint.x, _extendedPoint.y, GROUP_RADIUS, 0, Math.PI * 2, false);
                canvas.stroke();
            }

        }


        //------------------
        // GA
        //------------------
        if (_GARunning) {
            /*
            //-----------------------------------
            // draw the sensors
            //-----------------------------------	
            if ( SHOWING_SENSORS )
            {
                this.renderSensors();
            }
            */


            //_GA.renderGenePlot		( 20, 20, 200, 100 );        
            //_GA.renderFitnessBars	( 20, 140, 200, 100 );   

            /*
            //------------------------------------
            // show simulation progress bar...
            //------------------------------------
            let width = 5;
            canvas.beginPath();
            canvas.lineWidth = width; 		
            canvas.strokeStyle = "rgb( 140, 255, 120 )"; 		
        	
            let f = _GAClock / SIMULATION_DURATION;
            canvas.strokeRect( width, canvasID.height-width, ( canvasID.width - width * 2 ) * f, canvasID.height-width );	
            canvas.closePath();	
        	
            canvas.font = "16px Arial";
            canvas.fillStyle = "rgb( 200, 200, 200 )"; 		
            canvas.fillText( "generation: " + _GAGeneration, 20, canvasID.height - 30 );	
            */
        }

        //------------------------------------
        // draw a frame around everything....
        //------------------------------------
        canvas.lineWidth = 1;
        canvas.strokeStyle = "rgb( 200, 200, 200 )";
        canvas.strokeRect(1, 1, viewportWidth - 1, viewportHeight - 1);

        //------------------------------
        // render the force editor....
        //------------------------------
        _forceEditor.render();
    }

    /*
    //-------------------------------
    this.renderSensors = function()
    {	
        for (let s=0; s<NUM_SENSORS; s++)
        {
            _sensors[s].render();
        }   
    }
    */

    //-----------------------------
    this.togglePause = function () {
        if (_frozen) {
            _frozen = false;
        }
        else {
            _frozen = true;
        }
    }

    //-----------------------------------------
    this.onButtonSelected = function (id) {

        //this.startRunningGA();



        if (id === "buttonGems") { this.loadEcosystem(ECO_GEMS); }
        else if (id === "buttonAlliances") { this.loadEcosystem(ECO_ALLIANCES); }
        else if (id === "buttonMenace") { this.loadEcosystem(ECO_RED_MENACE); }
        else if (id === "buttonAcrobats") { this.loadEcosystem(ECO_ACROBATS); }
        else if (id === "buttonMitosis") { this.loadEcosystem(ECO_MITOSIS); }
        else if (id === "buttonPlanets") { this.loadEcosystem(ECO_PLANETS); }
        else if (id === "buttonPurple") { this.loadEcosystem(ECO_PURPLE); }
        else if (id === "buttonSimplify") { this.loadEcosystem(ECO_SIMPLIFY); }
        else if (id === "buttonField") { this.loadEcosystem(ECO_FIELD); }
        else if (id === "buttonBang") { this.loadEcosystem(ECO_BANG); }
        else if (id === "buttonDemo") { this.loadEcosystem(ECO_DEMO); }
        else if (id === "buttonPollack") { this.loadEcosystem(ECO_POLLACK); }
        else if (id === "buttonDream") { this.loadEcosystem(ECO_DREAM); }
        else if (id === "buttonColors") {
            _ecosystem.randomizeSpeciesColors();

            for (let i = 0; i < MAX_PARTICLES; i++) {
                _particles[i].setColor(_ecosystem.species[_particles[i].species].color);
            }
        }
        else if (id === "buttonGA") {
            if (!_GARunning) {
                this.startRunningGA();
            }
        }
        else if (id === "buttonFreeze") {
            this.togglePause();
        }
        else if (id === "buttonZap") {
            //console.log( "zap" );
            this.zap(40.0);
        }
        else if (id === "buttonSave") {
            _ecosystem.save("saved-ecosystem");
        }
        else if (id === "buttonGAGood") {
            console.log("GA good");

            _GAGeneration++;

            //---------------------------------------------------------------
            // reward this individual (ecosystem)...
            //---------------------------------------------------------------
            console.log("set fitness of ecosystem " + _GACurrentEco);
            _GA.setFitnessOfIndividual(_GACurrentEco, 1.0);

            if (_GARunning) {
                this.updateGeneticAlgorithm();
            }
        }
        else if (id === "buttonGANext") {
            console.log("GA next");

            if (_GARunning) {
                this.updateGeneticAlgorithm();
            }
        }
    }


    //--------------------------------
    this.startRunningGA = function () {
        _GA.initialize(NUM_INDIVIDUALS, MAX_GENES);
        _GA.setMutationRate(MUTATION_RATE);
        _GA.setCrossoverRate(CROSSOVER_RATE);
        _GA.randomizePopulationFitness(0.7);

        //-------------------------------------------------------------
        // randomize population genes and create their phenotypes...
        //-------------------------------------------------------------
        _GA.randomizePopulationGenes();

        for (let e = 0; e < NUM_INDIVIDUALS; e++) {
            this.generatePhenotype(e);
        }

        _GAClock = 0;
        _GARunning = true;

        // do it now...
        this.updateGeneticAlgorithm();
    }

    //-----------------------------------------
    this.updateGeneticAlgorithm = function () {
        //--------------------------------------------------------------
        // Decay all fitness values to keep things fresh over time...
        //--------------------------------------------------------------
        _GA.addToAllFitnessValues(FITNESS_DECREASE);

        //-------------------------------------------------
        // get the lowest-fit and replace it with the 
        // offspring of two relatively-fit individuals...
        //-------------------------------------------------
        _GACurrentEco = _GA.getLowestFitIndividual();

        //console.log( "_GACurrentEco = " + _GACurrentEco );

        let parent1 = _GA.getRelativelyFitIndividualByTourament(TOURNAMENT_NUMBER);
        let parent2 = _GA.getRelativelyFitIndividualByTourament(TOURNAMENT_NUMBER);

        //console.log( "parent1 = " + parent1 + "; parent2 = " + parent2 );

        _GA.setAsChildOfParents(_GACurrentEco, parent1, parent2);

        this.generatePhenotype(_GACurrentEco);

        //--------------------------------------------------------------------------------
        // init the sliders and input values
        //--------------------------------------------------------------------------------
        // document.getElementById('numParticlesSlider').value = _ecosystem.numParticles;
        // document.getElementById('numSpeciesSlider').value = _ecosystem.numSpecies;
        // document.getElementById('motionBlurSlider').value = Math.floor(_ecosystem.blur * MOTION_BLUR_SLIDER_RES);

        // document.getElementById("numParticlesInput").value = _ecosystem.numParticles;
        // document.getElementById("numSpeciesInput").value = _ecosystem.numSpecies;
        // document.getElementById("motionBlurInput").value = _ecosystem.blur;


        this.initializeParticlePositions();

        //----------------------------------
        // reset all sensor values
        //----------------------------------
        //this.initializeSensors();
    }


    //--------------------------------------
    this.generatePhenotype = function (e) {
        //console.log( "generate phenotype for ecosystem " + e );			

        let geneIndex = 0;

        _ecosystem.numSpecies = MIN_SPECIES + Math.floor(_GA.getGene(e, geneIndex) * (MAX_SPECIES - MIN_SPECIES)); geneIndex++;

        //_ecosystem.numSpecies = 1;				

        _ecosystem.numParticles = MIN_PARTICLES + Math.floor(_GA.getGene(e, geneIndex) * (MAX_PARTICLES - MIN_PARTICLES)); geneIndex++;
        _ecosystem.diskSize = MIN_DISK_RATIO + (_GA.getGene(e, geneIndex) * (MAX_DISK_RATIO - MIN_DISK_RATIO)); geneIndex++;

        _ecosystem.diskSize *= viewportHeight * ONE_HALF;

        _ecosystem.blur = _GA.getGene(e, geneIndex); geneIndex++;
        _ecosystem.blur = Math.sqrt(_ecosystem.blur);

        _ecosystem.initMode = Math.floor(_GA.getGene(e, geneIndex) * NUM_INIT_MODES); geneIndex++;

        _ecosystem.initMode = INIT_MODE_DISK;
        //_ecosystem.diskSize = viewportHeight * 0.1;

        /*	
        this.diskSize = 20.0;
        this.numParticles = 800 + Math.floor( Math.random() * 400 );
        
        this.numSpecies = 1 + Math.floor( Math.random() * MAX_SPECIES );
        
        let r = Math.random();
        let curvedMotionBlur = Math.sqrt(r);  
        
        curvedMotionBlur = curvedMotionBlur.toFixed(2);
        this.blur = curvedMotionBlur;
        
        this.randomizeAllSpecies();
        
        this.initMode = INIT_MODE_DISK;	
        */


        /*
        let steppingLikelihood = 0.4;
        
        for (let s=0; s<MAX_SPECIES; s++)
        {
            this.species[s].steps = MIN_FORCE_STEPS;
        	
            if ( Math.random() < steppingLikelihood )                 
            {
                this.species[s].steps += Math.floor( ( MAX_FORCE_STEPS - MIN_FORCE_STEPS ) * Math.random() );   
            }
                    	
            for (let f=0; f<MAX_SPECIES; f++)
            {
                this.species[s].collisionForce [f] = Math.random() * MAX_COLLISION_FORCE;            
                this.species[s].collisionRadius[f] = Math.random() * MAX_COLLISION_RADIUS;            
                this.species[s].socialForce [f] = -MAX_SOCIAL_FORCE + Math.random() * MAX_SOCIAL_FORCE * 2.0;
                this.species[s].socialRadius[f] = this.species[s].collisionRadius[f] + MAX_SOCIAL_RADIUS * Math.random();
            }	
        }
        
        this.randomizeSpeciesColors();
        */





        /*
        numParticles
        initMode
        diskSize
        blur
        scale
        species
        */


        for (let s = 0; s < MAX_SPECIES; s++) {
            let steppingLikelihood = 0.4;
            let chance = _GA.getGene(e, geneIndex); geneIndex++;
            if (chance < steppingLikelihood) {
                _ecosystem.species[s].steps = MIN_FORCE_STEPS + Math.floor((MAX_FORCE_STEPS - MIN_FORCE_STEPS) * _GA.getGene(e, geneIndex)); geneIndex++;
            }
            else {
                _ecosystem.species[s].steps = MIN_FORCE_STEPS;
            }

            let r = Math.floor(55 + _GA.getGene(e, geneIndex) * 200); geneIndex++;
            let g = Math.floor(55 + _GA.getGene(e, geneIndex) * 200); geneIndex++;
            let b = Math.floor(55 + _GA.getGene(e, geneIndex) * 200); geneIndex++;
            let a = MIN_ALPHA + _GA.getGene(e, geneIndex) * (MAX_ALPHA - MIN_ALPHA); geneIndex++;

            _ecosystem.species[s].setColor(r, g, b, a);

            for (let f = 0; f < _ecosystem.numSpecies; f++) {
                _ecosystem.species[s].collisionForce[f] = _GA.getGene(e, geneIndex) * MAX_COLLISION_FORCE; geneIndex++;
                _ecosystem.species[s].collisionRadius[f] = _GA.getGene(e, geneIndex) * MAX_COLLISION_RADIUS; geneIndex++;
                _ecosystem.species[s].socialForce[f] = -MAX_SOCIAL_FORCE + _GA.getGene(e, geneIndex) * MAX_SOCIAL_FORCE * 2.0; geneIndex++;
                _ecosystem.species[s].socialRadius[f] = _ecosystem.species[s].collisionRadius[f] + MAX_SOCIAL_RADIUS * _GA.getGene(e, geneIndex); geneIndex++;
                _ecosystem.species[s].socialRamp[f] = (_GA.getGene(e, geneIndex) > ONE_HALF); geneIndex++;
            }
        }

        this.setNumSpecies(_ecosystem.numSpecies);

        if (geneIndex >= MAX_GENES) {
            console.log("Oops: geneIndex is " + geneIndex + ", which is >= MAX_GENES!");
        }

        /*
                for (let i=0; i<MAX_PARTICLES; i++)
                {
                    _particles[i].setColor( _ecosystem.species[ _particles[i].species ].color );
                }
        */

    }


    //--------------------------------
    this.mouseDown = function (x, y) {
        _mouseDown = true;
        _mouseX = x;
        _mouseY = y;
    }

    //--------------------------------
    this.mouseMove = function (x, y) {
        _mouseX = x;
        _mouseY = y;
    }

    //------------------------------
    this.mouseUp = function (x, y) {
        _mouseDown = false;
        _mouseX = x;
        _mouseY = y;

        _grabState = 0;
    }
    
    //--------------------------------
    this.sDown = function () {
        _sampleOn = !_sampleOn;
        _sampleX = _mouseX;
        _sampleY = _mouseY;
    }

    //--------------------------
    this.printGenes = function () {
    }

    //-------------------------------
    this.loadEcosystem = function (e) {
        //---------------------------
        // load that puppy!
        //---------------------------
        _ecosystem.loadEcosystem(e);

        //---------------------------------------------
        // some specific things to deal with here...
        //---------------------------------------------
        _view.scale = _ecosystem.scale;
        _startClock = 0;
        _frozen = false;

        for (let i = 0; i < MAX_PARTICLES; i++) {
            _particles[i].species = Math.floor(Math.random() * _ecosystem.numSpecies);

            _particles[i].setColorRGBA
                (
                    _ecosystem.species[_particles[i].species].red,
                    _ecosystem.species[_particles[i].species].green,
                    _ecosystem.species[_particles[i].species].blue,
                    _ecosystem.species[_particles[i].species].alpha
                );

            _particles[i].setHalo(_ecosystem.species[_particles[i].species].halo);
            _particles[i].setFriction(_ecosystem.species[_particles[i].species].friction);
        }

        //-------------------------------------------------------
        // set the positions of the particles...
        //-------------------------------------------------------
        this.initializeParticlePositions();

        //--------------------------------------------------------------------------------
        // init the sliders and input values
        //--------------------------------------------------------------------------------
        // document.getElementById('numParticlesSlider').value = _ecosystem.numParticles;
        // document.getElementById('numSpeciesSlider').value = _ecosystem.numSpecies;
        // document.getElementById('motionBlurSlider').value = Math.floor(_ecosystem.blur * MOTION_BLUR_SLIDER_RES);

        // document.getElementById("numParticlesInput").value = _ecosystem.numParticles;
        // document.getElementById("numSpeciesInput").value = _ecosystem.numSpecies;
        // document.getElementById("motionBlurInput").value = _ecosystem.blur;

        //---------------------------------------
        // clear the viewport
        //---------------------------------------
        canvas.fillStyle = "rgba( 0, 0, 0 )";
        canvas.fillRect(0, 0, viewportWidth, viewportHeight);
    }

    //-----------------------------------------------------
    this.initializeParticlePositions = function () {
        //-----------------------------------------------
        // clear our any remaining velocities and forces
        //-----------------------------------------------
        this.clearVelocitiesAndForces();

        //------------------------------------
        // default
        //------------------------------------
        for (let i = 0; i < MAX_PARTICLES; i++) {
            _particles[i].setPosition
                (
                    PARTICLE_RADIUS + Math.random() * (viewportWidth - PARTICLE_RADIUS * 2),
                    viewportHeight * ONE_HALF + 0.001 * Math.random()
                );
        }

        //------------------------------------
        // whole screen
        //------------------------------------
        if (_ecosystem.initMode === INIT_MODE_FULL) {
            for (let i = 0; i < MAX_PARTICLES; i++) {
                _particles[i].setPosition
                    (
                        PARTICLE_RADIUS + Math.random() * (viewportWidth - PARTICLE_RADIUS * 2),
                        PARTICLE_RADIUS + Math.random() * (canvasID.height - PARTICLE_RADIUS * 2)
                    );
            }
        }
        //------------------------------------
        // demo
        //------------------------------------
        if (_ecosystem.initMode === INIT_MODE_DEMO) {
            for (let p = 0; p < _ecosystem.numParticles; p++) {
                _particles[p].species = 2;
            }

            _particles[0].species = 0;
            _particles[1].species = 1;
            _particles[2].species = 1;
            _particles[3].species = 1;
            _particles[4].species = 1;
            _particles[5].species = 1;
            _particles[6].species = 1;

            for (let p = 0; p < _ecosystem.numParticles; p++) {
                _particles[p].setColor(_ecosystem.species[_particles[p].species].color);
            }

            let cx = viewportWidth * ONE_HALF;
            let cy = viewportHeight * ONE_HALF;

            _particles[0].setPosition(cx, cy);

            let j = 150;
            for (let p = 1; p < _ecosystem.numParticles; p++) {
                _particles[p].setPosition(cx - j * 0.5 + j * Math.random(), cy - j * 0.5 + j * Math.random());
            }
        }
        /*
        //----------------------------------------------
        // buncho particles trapped inside a circle...
        //----------------------------------------------
        else if ( _ecosystem.initMode === INIT_MODE_CIRCLE )
        {
            //let radius = viewportHeight * 0.4;
            let n = Math.floor( _ecosystem.numParticles * ONE_HALF );

            for (let i=0; i<n; i++)
            {
                let f = i/n;				
                let x = viewportWidth  * ONE_HALF + _ecosystem.diskSize * Math.sin( f * PI2 );
                let y = viewportHeight * ONE_HALF + _ecosystem.diskSize * Math.cos( f * PI2 );
            	
                _particles[i].setPosition( x, y );
            	
                x = viewportWidth  * ONE_HALF + _ecosystem.diskSize * 0.5 * Math.sin( f * PI2 );
                y = viewportHeight * ONE_HALF + _ecosystem.diskSize * 0.5 * Math.cos( f * PI2 );
            	
                _particles[i+n].setPosition( x, y );
            	
            }
        }
        */

        //-----------------------------------------
        // along the bottom
        //-----------------------------------------
        else if (_ecosystem.initMode === INIT_MODE_BOTTOM) {
            for (let i = 0; i < MAX_PARTICLES; i++) {
                _particles[i].setPosition
                    (
                        PARTICLE_RADIUS + Math.random() * (viewportWidth - PARTICLE_RADIUS * 2),
                        _particles[i].position.y = viewportHeight - PARTICLE_RADIUS
                    );
            }
        }
        //-----------------------------------------
        // along the top
        //-----------------------------------------
        else if (_ecosystem.initMode === INIT_MODE_TOP) {
            for (let i = 0; i < MAX_PARTICLES; i++) {
                _particles[i].setPosition
                    (
                        PARTICLE_RADIUS + Math.random() * (viewportWidth - PARTICLE_RADIUS * 2),
                        _particles[i].position.y = PARTICLE_RADIUS
                    );
            }
        }

        /*
        //---------------------------------------
        // Just two particles left and right
        //---------------------------------------
        else if ( _ecosystem.initMode === INIT_MODE_TWO )
        {
            _particles[0].setPosition( viewportWidth  * ONE_HALF - _ecosystem.diskSize, viewportHeight * ONE_HALF );
            _particles[1].setPosition( viewportWidth  * ONE_HALF + _ecosystem.diskSize, viewportHeight * ONE_HALF );
        }
        */
        //----------------------------------------
        // in a disk in the middle of the screen
        //----------------------------------------
        else if (_ecosystem.initMode === INIT_MODE_DISK) {
            for (let i = 0; i < MAX_PARTICLES; i++) {
                let angle = Math.random();
                let radius = Math.sqrt(Math.random()) * _ecosystem.diskSize;

                let radian = angle * Math.PI * 2.0;

                _particles[i].setPosition
                    (
                        viewportWidth / 2.0 + radius * Math.sin(radian),
                        canvasID.height / 2.0 + radius * Math.cos(radian)
                    );
            }
        }
        //----------------------------------------
        // stripes
        //----------------------------------------
        else if (_ecosystem.initMode === INIT_MODE_STRIPES) {
            for (let i = 0; i < MAX_PARTICLES; i++) {
                let f = i / MAX_PARTICLES;
                let s = _particles[i].species / _ecosystem.numSpecies;

                _particles[i].setPosition(f * viewportWidth, s * canvasID.height);
            }
        }
        //----------------------------------------
        // edges
        //----------------------------------------
        else if (_ecosystem.initMode === INIT_MODE_EDGES) {
            for (let i = 0; i < MAX_PARTICLES; i++) {
                if (Math.random() < ONE_HALF) {
                    _particles[i].position.y = PARTICLE_RADIUS + Math.random() * (canvasID.height - PARTICLE_RADIUS * 2);
                    if (Math.random() < ONE_HALF) {
                        _particles[i].position.x = PARTICLE_RADIUS;
                    }
                    else {
                        _particles[i].position.x = viewportWidth - PARTICLE_RADIUS;
                    }
                }
                else {
                    _particles[i].position.x = PARTICLE_RADIUS + Math.random() * (viewportWidth - PARTICLE_RADIUS * 2);
                    if (Math.random() < ONE_HALF) {
                        _particles[i].position.y = PARTICLE_RADIUS;
                    }
                    else {
                        _particles[i].position.y = canvasID.height - PARTICLE_RADIUS;
                    }
                }
            }
        }
        //----------------------------------------
        // blobs
        //----------------------------------------
        else if (_ecosystem.initMode === INIT_MODE_BLOBS) {
            let left = 210;
            let spacing = 12;

            for (let t = 0; t < _ecosystem.numSpecies; t++) {
                let s = 0;
                let y = canvasID.height / 2.0;

                for (let i = 0; i < MAX_PARTICLES; i++) {
                    if (_particles[i].species == t) {
                        s++;
                        _particles[i].position.x = left + t * 40 + s * spacing;

                        if (s > 10) {
                            s = 0;
                            y += spacing;
                        }

                        _particles[i].position.y = y + Math.random();
                    }
                }
            }
        }
    }

    //-------------------------------------------
    this.clearVelocitiesAndForces = function () {
        for (let i = 0; i < MAX_PARTICLES; i++) {
            _particles[i].velocity.clear();

            let steps = _ecosystem.species[_particles[i].species].steps;

            _particles[i].forces[steps].clear();
        }
    }

    //------------------------
    this.zap = function (z) {
        for (let i = 0; i < MAX_PARTICLES; i++) {
            /*
            let direction = new Vector2D();
                    	
            direction.x = _particles[i].position.x - viewportWidth  * ONE_HALF;
            direction.y = _particles[i].position.y - viewportHeight * ONE_HALF;
        	
            let magnitude = 0.1;
    	
            _particles[i].velocity.addScaled( direction, magnitude );
            */

            let x = -z * ONE_HALF + Math.random() * z;
            let y = -z * ONE_HALF + Math.random() * z;

            _particles[i].velocity.setXY(x, y);
        }
    }

    //-------------------------------------
    // this.onSliderChanged = function (id) {
    //     let min = document.getElementById(id).min;
    //     let max = document.getElementById(id).max;
    //     let val = document.getElementById(id).value;

    //     let fraction = (val - min) / (max - min);

    //     //console.log( "slider '" + id + "' changed: value = " + fraction );  

    //     if (id === "numParticlesSlider") {
    //         _ecosystem.numParticles = MIN_PARTICLES + Math.floor(fraction * (MAX_PARTICLES - MIN_PARTICLES));
    //         document.getElementById("numParticlesInput").value = _ecosystem.numParticles;
    //     }
    //     else if (id === "numSpeciesSlider") {
    //         let newNumSpecies = MIN_SPECIES + Math.floor(fraction * (MAX_SPECIES - MIN_SPECIES));
    //         this.setNumSpecies(newNumSpecies);
    //         document.getElementById("numSpeciesInput").value = _ecosystem.numSpecies;
    //     }
    //     else if (id === "motionBlurSlider") {
    //         _ecosystem.blur = fraction;
    //         document.getElementById("motionBlurInput").value = _ecosystem.blur;
    //     }
    // }

    //---------------------------------------------
    // this.addToInputString = function (id, event) {
    //     //-------------------------------------------------
    //     // characters accumulate as the user types keys...
    //     //-------------------------------------------------
    //     let inputString = event.currentTarget.value;

    //     if (event.key === 'Enter') {
    //         if (id === "numParticlesInput") {
    //             let intValue = parseInt(inputString);

    //             _ecosystem.numParticles = intValue;

    //             if (_ecosystem.numParticles > MAX_PARTICLES) { _ecosystem.numParticles = MAX_PARTICLES; }
    //             if (_ecosystem.numParticles < MIN_PARTICLES) { _ecosystem.numParticles = MIN_PARTICLES; }

    //             document.getElementById("numParticlesInput").value = _ecosystem.numParticles;
    //             document.getElementById("numSpeciesSlider").value = _ecosystem.numSpecies;
    //         }
    //         else if (id === "numSpeciesInput") {
    //             let newNumSpecies = parseInt(inputString);

    //             if (newNumSpecies > MAX_SPECIES) { newNumSpecies = MAX_SPECIES; }
    //             if (newNumSpecies < MIN_SPECIES) { newNumSpecies = MIN_SPECIES; }

    //             this.setNumSpecies(newNumSpecies);

    //             document.getElementById("numSpeciesInput").value = _ecosystem.numSpecies;
    //             this.setSliderValue("numSpeciesSlider", _ecosystem.numSpecies);

    //             /*
    //                             _ecosystem.numSpecies = intValue;

    //                             if ( _ecosystem.numSpecies > MAX_SPECIES ) { _ecosystem.numSpecies = MAX_SPECIES; }
    //                             if ( _ecosystem.numSpecies < MIN_SPECIES ) { _ecosystem.numSpecies = MIN_SPECIES; }

    //                             this.setNumSpecies( _ecosystem.numSpecies );

    //                             document.getElementById( "numSpeciesInput"    ).value = _ecosystem.numSpecies;
    //                             this.setSliderValue( "numSpeciesSlider", _ecosystem.numSpecies ); 
    //             */
    //         }
    //         else if (id === "motionBlurInput") {
    //             let floatValue = parseFloat(inputString);

    //             //console.log( floatValue );            	

    //             _ecosystem.blur = floatValue;

    //             let sliderValue = Math.floor(_ecosystem.blur * MOTION_BLUR_SLIDER_RES);
    //             document.getElementById('motionBlurSlider').value = sliderValue;

    //             //this.setSliderValue( "motionBlurSlider", sliderValue ); 
    //         }



    //         /*
    //         let floatValue = parseFloat( inputString );
    //         //console.log( "ok: " + floatValue );

    //         //-------------------------------------------------
    //         // set the associated slider value...
    //         //-------------------------------------------------
    //         //let sliderFraction = ZERO;

    //         if ( id === "rangeInput" 	 ) { this.setSliderNormalizedValue( "rangeSlider", 		floatValue ); }
    //         if ( id === "modulusInput" 	 ) { this.setSliderNormalizedValue( "modulusSlider", 	floatValue ); }
    //         if ( id === "exoponentInput" ) { this.setSliderNormalizedValue( "exponentSlider", 	floatValue ); }
    //         */
    //     }
    // }


    //------------------------------------------------
    // set num species
    //------------------------------------------------
    this.setNumSpecies = function (newNumSpecies) {
        //------------------------------------------------------------------------
        // hard to explain, but...if num species is the same, then do this...
        //------------------------------------------------------------------------
        if (newNumSpecies === _ecosystem.numSpecies) {
            for (let i = 0; i < MAX_PARTICLES; i++) {
                _particles[i].species = Math.floor(Math.random() * _ecosystem.numSpecies);
                _particles[i].setColor(_ecosystem.species[_particles[i].species].color);
            }
        }
        //------------------------------------------------------------------------
        // if numSpecies goes lower, then we have to change the particles with
        // now-bogus species values to lower values so they are within range.
        //------------------------------------------------------------------------
        if (newNumSpecies < _ecosystem.numSpecies) {
            //console.log( "<" );			
            _ecosystem.numSpecies = newNumSpecies;

            for (let i = 0; i < MAX_PARTICLES; i++) {
                if (_particles[i].species >= _ecosystem.numSpecies) {
                    //console.log( _particles[i].species );
                    _particles[i].species = Math.floor(Math.random() * _ecosystem.numSpecies);
                    _particles[i].setColor(_ecosystem.species[_particles[i].species].color);
                }
            }
        }
        //-----------------------------------------------------------
        // if numSpecies goes higher, then we will change a subset
        // of existing particles to acquire the new  species values.
        //-----------------------------------------------------------
        else if (newNumSpecies > _ecosystem.numSpecies) {
            // test 1: just reinit everyone's species...
            for (let i = 0; i < MAX_PARTICLES; i++) {
                _particles[i].species = Math.floor(Math.random() * newNumSpecies);
                _particles[i].setColor(_ecosystem.species[_particles[i].species].color);
            }

            /*
            //console.log( ">" );		
                    	
            //---------------------------------------------------------------
            // okay - I need to choose a random subset of the particles, 
            // and the size of that set should be 
            // numParticlers * ( 1 - _ecosystem.numSpecies / newNumSpecies ).
            //
            // Then I need to set the species of those particles to a 
            // random number from _ecosystem.numSpecies to newNumSpecies - 1.
            //---------------------------------------------------------------
            let diff 		= newNumSpecies - _ecosystem.numSpecies;			
            let fraction 	= diff / _ecosystem.numSpecies;
            let subsetSize 	= Math.floor( _ecosystem.numParticles * fraction );
            let searching 	= true;
            let numFound 	= 0;
            let particleID 	= 0;
        	
            //console.log( fraction );	

            while ( searching )
            {
                if ( _particles[ particleID ].species < _ecosystem.numSpecies - 1 )
                {
                    numFound ++;
                	
                    _particles[ particleID ].species = _ecosystem.numSpecies + Math.floor( Math.random() * diff );
                    _particles[ particleID ].setColor( _ecosystem.species[ _particles[ particleID ].species ].color );
                	
                    particleID ++;
                }
                            	
                if ( numFound >= subsetSize )
                {
                    searching = false;
                }			

                particleID ++;

                if ( particleID >= _ecosystem.numParticles )
                {
                    //console.log( "searching = false" );		
                    searching = false;
                }			
            }
            */

            _ecosystem.numSpecies = newNumSpecies;

            // document.getElementById("numSpeciesSlider").value = _ecosystem.numSpecies;
            // document.getElementById("numSpeciesInput").value = _ecosystem.numSpecies;
        }
    }


    //----------------------------------
    // what? I need the x and y? 
    //----------------------------------
    this.arrowRight = function (x, y) {
        this.printGenes();
    }
}


//-------------------------------
document.onkeydown = function (e) {
    //if (e.keyCode === 37) { clusters.arrowLeft(); }
    //if (e.keyCode === 39) { clusters.arrowRight(); }
    if (e.key === 's' || e.key === 'S') {
        clusters.sDown();
    }
}

//--------------------------------
document.onmousedown = function (e) {
    clusters.mouseDown(e.pageX - canvasRectangle.left, e.pageY - canvasID.offsetTop);
}

//---------------------------------
document.onmousemove = function (e) {
    clusters.mouseMove(e.pageX - canvasRectangle.left, e.pageY - canvasID.offsetTop);
}

//-------------------------------
document.onmouseup = function (e) {
    clusters.mouseUp(e.pageX - canvasRectangle.left, e.pageY - canvasID.offsetTop);
}




// Touch events
document.ontouchstart = function (e) {
    // Prevent default behavior (e.g., scrolling)
    e.preventDefault();

    // Get touch coordinates
    const touch = e.touches[0]; // Get the first touch point
    //const x = touch.pageX - canvasRectangle.left;
    //const y = touch.pageY - canvasID.offsetTop;

    clusters.mouseDown(touch.pageX - canvasRectangle.left, touch.pageY - canvasID.offsetTop);
};

// Optionally handle touch move and touch end if needed
document.ontouchmove = function (e) {
    e.preventDefault(); // Prevent default behavior
    const touch = e.touches[0]; // Get the first touch point
    clusters.mouseMove(touch.pageX - canvasRectangle.left, touch.pageY - canvasID.offsetTop);
};

document.ontouchend = function (e) {
    const touch = e.touches[0]; // Get the first touch point
    clusters.mouseMove(touch.pageX - canvasRectangle.left, touch.pageY - canvasID.offsetTop);
};





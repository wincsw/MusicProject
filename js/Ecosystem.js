"use strict";

//------------------------------	
// ecosystems
//------------------------------	
const ECO_NULL = -1;
const ECO_GEMS = 0;
const ECO_ALLIANCES = 1;
const ECO_RED_MENACE = 2;
const ECO_ACROBATS = 3;
const ECO_MITOSIS = 4;
const ECO_PLANETS = 5;
const ECO_SHIPS = 6;
const ECO_FIELD = 7;
const ECO_BANG = 8;
const ECO_SMALL_BANG = 9;
const ECO_DEMO = 10;
const ECO_POLLACK = 11;
const ECO_PURPLE = 12;
const ECO_SIMPLIFY = 13;
const ECO_FLUID = 14;
const ECO_DREAM = 15;
const NUM_ECOS = 16;

//------------------------------	
// init modes
//------------------------------	
const INIT_MODE_NULL = 0;
const INIT_MODE_FULL = 1;
const INIT_MODE_DISK = 2;
const INIT_MODE_STRIPES = 3;
const INIT_MODE_BOTTOM = 4;
const INIT_MODE_TOP = 5;
const INIT_MODE_EDGES = 6;
const INIT_MODE_BLOBS = 7;
const INIT_MODE_DEMO = 8;
const NUM_INIT_MODES = 9;

//--------------------------------------	
// limits and defaults
//--------------------------------------
const MIN_PARTICLES = 1;
const MAX_PARTICLES = 2000;
const MIN_SPECIES = 1;
const MAX_SPECIES = 12;
const MIN_COLLISION_FORCE = 0.0;
const MAX_COLLISION_FORCE = 2.0;
const MAX_SOCIAL_FORCE = 5.0;
const MIN_COLLISION_RADIUS = 0.0;
const MAX_COLLISION_RADIUS = 20.0;
const MAX_SOCIAL_RADIUS = 100.0;
const MAX_FORCE_STEPS = 6;
const MIN_ALPHA = 0.2;
const MAX_ALPHA = 1.0;
const DEFAULT_MOTION_BLUR = 0.9;
const ALLIANCE_MOTION_BLUR = 0.97;
const ALLIANCE_SPECIES = 6;
const MITOSIS_MOTION_BLUR = 0.9;
const DEFAULT_COLLISION_RADIUS = 8.64;

//----------------------
function Ecosystem() {
    this.numParticles = 10;
    this.numSpecies = 2;
    this.initMode = 0;
    this.diskSize = ZERO;
    this.blur = ZERO;
    this.scale = ZERO;
    this.species = new Array(MAX_SPECIES);

    //------------------------------------
    // create the array of species
    //------------------------------------
    for (let t = 0; t < MAX_SPECIES; t++) {
        this.species[t] = new Species();
    }

    //--------------------------------
    this.initialize = function () {
        this.loadDefaultEcosystem();
    }

    //-------------------------------------
    this.randomizeAllSpecies = function () {
        let steppingLikelihood = 0.4;

        for (let s = 0; s < MAX_SPECIES; s++) {
            this.species[s].halo = (Math.random() > 0.7);
            this.species[s].steps = 0;
            this.species[s].averageForces = (Math.random() > 0.333);
            this.species[s].nonAverageForce = 0.01;
            this.species[s].friction = 0.1 + Math.random() * 0.3;


            if (Math.random() < steppingLikelihood) {
                this.species[s].steps += Math.floor(MAX_FORCE_STEPS * Math.random());
            }

            for (let f = 0; f < MAX_SPECIES; f++) {
                this.species[s].collisionForce[f] = MIN_COLLISION_FORCE + Math.random() * (MAX_COLLISION_FORCE - MIN_COLLISION_FORCE);
                this.species[s].collisionRadius[f] = MIN_COLLISION_RADIUS + Math.random() * (MAX_COLLISION_RADIUS - MIN_COLLISION_RADIUS);
                this.species[s].socialForce[f] = -MAX_SOCIAL_FORCE + Math.random() * MAX_SOCIAL_FORCE * 2.0;
                this.species[s].socialRadius[f] = this.species[s].collisionRadius[f] + MAX_SOCIAL_RADIUS * Math.random();
                this.species[s].socialRamp[f] = (Math.random() > ONE_HALF);
            }
        }

        this.randomizeSpeciesColors();
    }

    //--------------------------------------------
    this.reduceToSpeciesPairs = function () {
        for (let f = 0; f < MAX_SPECIES; f++) {
            for (let s = 0; s < MAX_SPECIES; s++) {
                this.species[s].halo = this.species[f].halo;
                this.species[s].steps = this.species[f].steps;
                this.species[s].averageForces = this.species[f].averageForces;
                this.species[s].nonAverageForce = this.species[f].nonAverageForce;
                this.species[s].friction = this.species[f].friction;

                this.species[s].collisionForce[f] = this.species[f].collisionForce[s];
                this.species[s].collisionRadius[f] = this.species[f].collisionRadius[s];
                this.species[s].socialForce[f] = this.species[f].socialForce[s];
                this.species[s].socialRadius[f] = this.species[f].socialRadius[s];
                this.species[s].socialRamp[f] = this.species[f].socialRamp[s];
            }
        }
    }

    //--------------------------------------------
    this.randomizeSpeciesColors = function () {
        for (let s = 0; s < MAX_SPECIES; s++) {
            let red = Math.floor(55 + Math.random() * 200.0);
            let green = Math.floor(55 + Math.random() * 200.0);
            let blue = Math.floor(55 + Math.random() * 200.0);

            let alpha = MIN_ALPHA + (MAX_ALPHA - MIN_ALPHA) * Math.random();

            this.species[s].setColor(red, green, blue, alpha);
        }
    }

    //--------------------------------------
    this.loadDefaultEcosystem = function () {
        this.blur = DEFAULT_MOTION_BLUR;
        this.scale = ONE;
        this.numParticles = 100;
        this.numSpecies = 1;
        this.initMode = INIT_MODE_FULL;
        this.diskSize = 40.0;

        for (let t = 0; t < MAX_SPECIES; t++) {
            this.species[t].steps = 0;
            this.species[t].halo = false;
            this.species[t].friction = 0.2;
            this.species[t].red = 255;
            this.species[t].green = 255;
            this.species[t].blue = 255;
            this.species[t].alpha = 1;
            this.species[t].setColor(this.species[t].red, this.species[t].green, this.species[t].blue, this.species[t].alpha)
            this.species[t].averageForces = true;
            this.species[t].nonAverageForce = 0.02;

            for (let f = 0; f < MAX_SPECIES; f++) {
                this.species[t].collisionForce[f] = ZERO;
                this.species[t].collisionRadius[f] = ZERO;
                this.species[t].socialForce[f] = ZERO;
                this.species[t].socialRadius[f] = ZERO;
                this.species[t].socialRamp[f] = false;
            }
        }
    }

    //-------------------------------
    this.loadEcosystem = function (e) {
        //--------------------------------
        // set to defaults
        //--------------------------------
        this.loadDefaultEcosystem();

        //-----------------------------------------
        // Big Bang
        //-----------------------------------------
        if (e === ECO_BANG) {
            this.diskSize = 50.0;
            this.numParticles = 400 + Math.floor(Math.random() * 200);

            this.numSpecies = 1 + Math.floor(Math.random() * MAX_SPECIES);

            let r = Math.random();
            let curvedMotionBlur = Math.sqrt(r);

            curvedMotionBlur = curvedMotionBlur.toFixed(2);
            this.blur = curvedMotionBlur;

            this.randomizeAllSpecies();
            //this.reduceToSpeciesPairs();

            this.initMode = INIT_MODE_DISK;
            //this.initMode = INIT_MODE_BOTTOM;	
        }
        //-----------------------------------------
        // Big Bang (customized for a small canvas)
        //-----------------------------------------
        if (e === ECO_SMALL_BANG) {
            this.diskSize = 50.0;
            this.numParticles = 300 + Math.floor(Math.random() * 200);

            this.numSpecies = 3 + Math.floor(Math.random() * 5);

            let r = Math.random();
            let curvedMotionBlur = Math.sqrt(r);

            curvedMotionBlur = curvedMotionBlur.toFixed(2);
            this.blur = curvedMotionBlur;

            this.blur = 0;

            this.randomizeAllSpecies();

            this.initMode = INIT_MODE_FULL;
        }
        //-----------------------------------------
        // Alliances
        //-----------------------------------------
        else if (e === ECO_ALLIANCES) {
            this.numSpecies = ALLIANCE_SPECIES;
            this.numParticles = MAX_PARTICLES / 2;
            this.blur = ALLIANCE_MOTION_BLUR;

            for (let t = 0; t < this.numSpecies; t++) {
                this.species[t].setColor(100, 100, 100, 1.0);
            }

            // this.species[0].setColor(255, 0, 0, 1.0); // red
            // this.species[1].setColor(255, 75, 0, 1.0); // dark orange
            // this.species[2].setColor(255, 150, 0, 1.0); // orange
            // this.species[3].setColor(255, 200, 0, 1.0);
            // this.species[4].setColor(255, 255, 0, 1.0); // yellow
            // this.species[5].setColor(150, 255, 0, 1.0); // lime green
            // this.species[6].setColor(0, 180, 0, 1.0); // green
            // this.species[7].setColor(0, 200, 200, 1.0); // cyan
            // this.species[8].setColor(80, 80, 255, 1.0); // blue
            // this.species[9].setColor(60, 0, 255, 1.0);
            // this.species[10].setColor(160, 20, 255, 1.0); // violet
            // this.species[11].setColor(150, 0, 150, 1.0);

            this.species[0].setColor(255, 0, 0, 1.0); // red
            this.species[1].setColor(255, 150, 0, 1.0); // orange
            this.species[2].setColor(255, 255, 0, 1.0); // yellow
            this.species[3].setColor(0, 180, 0, 1.0); // green
            this.species[4].setColor(80, 80, 255, 1.0); // blue
            this.species[5].setColor(150, 0, 150, 1.0); // purple



            for (let t = 0; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].collisionForce[f] = 1.0;
                    this.species[t].collisionRadius[f] = 8.64;
                    this.species[t].socialForce[f] = -4.0 * 0.1;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }

            for (let t = 0; t < this.numSpecies; t++) {
                this.species[t].steps = 0;

                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].socialForce[f] = -4.0 * 0.2;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }

            let me = 4.0 * 0.2;
            let before = 4.0 * -0.5;
            let after = 4.0 * 0.5;

            for (let t = 0; t < this.numSpecies; t++) {
                let f0 = t - 1;
                let f1 = t;
                let f2 = t + 1;

                if (f0 < 0) { f0 = this.numSpecies - 1; }
                if (f2 > this.numSpecies - 1) { f2 = 0; }

                this.species[t].socialForce[f0] = before;
                this.species[t].socialForce[f1] = me;
                this.species[t].socialForce[f2] = after;
            }

            this.initMode = INIT_MODE_EDGES;
        }
        //-----------------------------------------
        // Field
        //-----------------------------------------
        else if (e === ECO_FIELD) {
            this.numSpecies = 2;
            this.numParticles = MAX_PARTICLES;
            this.initMode = INIT_MODE_DISK;
            this.diskSize = 5.0;

            this.species[0].setColor(160, 120, 255, 0.5, 1.0);
            this.species[0].steps = 2;
            this.species[0].collisionForce[0] = 0.0;
            this.species[0].collisionRadius[0] = 0.0;
            this.species[0].socialForce[0] = -1.0;
            this.species[0].socialRadius[0] = 20.0;

            this.species[0].collisionForce[1] = 0.0;
            this.species[0].collisionRadius[1] = 0.0;
            this.species[0].socialForce[1] = -1.0;
            this.species[0].socialRadius[1] = 20.0;

            this.species[1].setColor(100, 100, 200, 0.5, 1.0);
            this.species[1].steps = 2;
            this.species[1].collisionForce[0] = 0.0;
            this.species[1].collisionRadius[0] = 0.0;
            this.species[1].socialForce[0] = -1.0;
            this.species[1].socialRadius[0] = 20.0;

            this.species[1].collisionForce[1] = 0.0;
            this.species[1].collisionRadius[1] = 0.0;
            this.species[1].socialForce[1] = -1.0;
            this.species[1].socialRadius[1] = 20.0;
        }
        //-----------------------------------------
        // Fluid
        //-----------------------------------------
        else if (e === ECO_FLUID) {
            this.numSpecies = 2;
            this.numParticles = MAX_PARTICLES;
            this.initMode = INIT_MODE_FULL;
            this.diskSize = 50.0;

            this.species[0].setColor(200, 200, 200, 0.5, 1.0);
            this.species[0].averageForces = false;
            this.species[0].steps = 0;
            this.species[0].friction = 0.02;
            this.species[0].collisionForce[0] = 0.2;
            this.species[0].collisionRadius[0] = 20.0;
            this.species[0].socialForce[0] = 0.06;
            this.species[0].socialRadius[0] = 30.0;

            this.species[0].collisionForce[1] = 0.2;
            this.species[0].collisionRadius[1] = 20.0;
            this.species[0].socialForce[1] = 0.2;
            this.species[0].socialRadius[1] = 30.0;


            this.species[1].setColor(100, 150, 200, 0.5, 1.0);
            this.species[1].averageForces = false;
            this.species[1].steps = 0;
            this.species[1].friction = 0.01;
            this.species[1].collisionForce[1] = 0.2;
            this.species[1].collisionRadius[1] = 20.0;
            this.species[1].socialForce[1] = 0.2;
            this.species[1].socialRadius[1] = 30.0;

            this.species[1].collisionForce[0] = 0.2;
            this.species[1].collisionRadius[0] = 20.0;
            this.species[1].socialForce[0] = -0.4;
            this.species[1].socialRadius[0] = 30.0;
        }
        //-----------------------------------------
        // Mitosis
        //-----------------------------------------
        else if (e === ECO_MITOSIS) {
            this.numSpecies = 12;
            this.numParticles = MAX_PARTICLES;
            this.blur = MITOSIS_MOTION_BLUR;

            for (let t = 0; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].collisionForce[f] = 1.0;
                    this.species[t].collisionRadius[f] = 8.64;
                    this.species[t].socialForce[f] = -4.0 * 0.1;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }

            for (let t = 2; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].collisionForce[f] = 0.4;
                    this.species[t].socialForce[f] = f / this.numSpecies * 2.0 - t / this.numSpecies * 0.7;
                    this.species[t].socialRadius[f] = 81.0 * 0.5;
                }
            }

            this.species[0].setColor(100, 100, 100, 0.7);
            this.species[1].setColor(100, 60, 50, 0.7);
            this.species[2].setColor(200, 180, 120, 0.7);
            this.species[3].setColor(200, 180, 120, 0.7);
            this.species[4].setColor(200, 70, 70, 0.7);
            this.species[5].setColor(200, 180, 120, 0.7);
            this.species[6].setColor(150, 150, 120, 0.7);
            this.species[7].setColor(140, 100, 100, 0.7);
            this.species[8].setColor(200, 120, 100, 0.7);
            this.species[9].setColor(200, 120, 100, 0.7);
            this.species[10].setColor(200, 120, 120, 0.7);
            this.species[11].setColor(200, 120, 120, 0.7);

            this.diskSize = 40.0;
            this.initMode = INIT_MODE_DISK;
        }
        //-----------------------------------------
        // The Red Menace
        //-----------------------------------------
        else if (e === ECO_RED_MENACE) {
            this.numSpecies = 12;
            this.numParticles = MAX_PARTICLES;

            for (let t = 0; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].collisionForce[f] = 1.0;
                    this.species[t].collisionRadius[f] = 8.64;
                    this.species[t].socialForce[f] = -4.0 * 0.1;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }


            for (let s = 0; s < this.numSpecies; s++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[s].socialForce[f] = 4.0 * 0.1;
                    this.species[s].socialRadius[f] = 81.0 * 0.2;
                }
            }

            let fear = 4.0 * -1.0;
            let love = 4.0 * 1.2;

            let fearRadius = 81.0 * 0.5;
            let loveRadius = 81.0 * 0.9;

            this.species[0].setColor(200, 0, 0, 1.0);

            this.species[0].halo = true;

            //------------------------------------
            // everyone fears red except for red
            // and red loves everyone
            //------------------------------------
            for (let s = 1; s < this.numSpecies; s++) {
                this.species[0].socialForce[s] = love;
                this.species[0].socialRadius[s] = loveRadius;

                this.species[s].socialForce[0] = fear;
                this.species[s].socialRadius[0] = fearRadius * (s / this.numSpecies);

                let f = s / this.numSpecies;

                let red = 0.4 + f * 0.4;
                let green = 0.3 + f * 0.5;
                let blue = 0.5 + f * 0.2;

                let r = Math.floor(red * 255);
                let g = Math.floor(green * 255);
                let b = Math.floor(blue * 255);

                this.species[s].setColor(r, g, b, 1.0);
            }

            this.diskSize = 80.0;
            this.initMode = INIT_MODE_DISK;
        }
        //-----------------------------------------
        // Ships
        //-----------------------------------------
        else if (e === ECO_SHIPS) {
            this.numParticles = MAX_PARTICLES;
            this.numSpecies = 12;

            let redForce = -1.0;
            let redRadius = 10.0;

            for (let s = 0; s < this.numSpecies; s++) {
                let red = s / this.numSpecies;
                let green = 0.6 - s / this.numSpecies * 0.3;
                let blue = 1 - s / this.numSpecies;

                let r = Math.floor(red * 100);
                let g = Math.floor(green * 150);
                let b = Math.floor(blue * 255);

                this.species[s].setColor(r, g, b, 1.0);
            }

            this.species[1].setColor(200, 200, 100, 1.0);
            this.species[2].setColor(130, 130, 100, 1.0);

            this.species[0].socialForce[0] = redForce;
            this.species[0].socialRadius[0] = redRadius;
            this.species[0].socialForce[1] = redForce;
            this.species[0].socialRadius[1] = redRadius;
            this.species[0].socialForce[2] = redForce;
            this.species[0].socialRadius[2] = redRadius;
            this.species[0].socialForce[3] = redForce;
            this.species[0].socialRadius[3] = redRadius;
            this.species[0].socialForce[4] = redForce;
            this.species[0].socialRadius[4] = redRadius;
            this.species[0].socialForce[5] = redForce;
            this.species[0].socialRadius[5] = redRadius;


            this.species[1].socialForce[0] = 0.0;
            this.species[1].socialRadius[0] = 41.87992572411895;
            this.species[1].socialForce[1] = 0.6188263148069382;
            this.species[1].socialRadius[1] = 31.57806908339262;
            this.species[1].socialForce[2] = -2.252236846834421;
            this.species[1].socialRadius[2] = 16.67971832305193;
            this.species[1].socialForce[3] = 2.9319324381649494;
            this.species[1].socialRadius[3] = 75.86216926202178;
            this.species[1].socialForce[4] = 3.160645740106702;
            this.species[1].socialRadius[4] = 28.880391377955675;
            this.species[1].socialForce[5] = 1.0297179147601128;
            this.species[1].socialRadius[5] = 59.19801760092378;
            this.species[2].socialForce[0] = 0.0;
            this.species[2].socialRadius[0] = 49.67192802205682;
            this.species[2].socialForce[1] = -3.264488408342004;
            this.species[2].socialRadius[1] = 8.111502636224031;
            this.species[2].socialForce[2] = 3.478301437571645;
            this.species[2].socialRadius[2] = 81.76046648621559;
            this.species[2].socialForce[3] = -3.4177507925778627;
            this.species[2].socialRadius[3] = 48.5528220012784;
            this.species[2].socialForce[4] = -3.999166540801525;
            this.species[2].socialRadius[4] = 16.489134017378092;
            this.species[2].socialForce[5] = 0.6649601068347692;
            this.species[2].socialRadius[5] = 37.668375723063946;
            this.species[3].socialForce[0] = 0.0;
            this.species[3].socialRadius[0] = 21.195324823260307;
            this.species[3].socialForce[1] = 1.8835953641682863;
            this.species[3].socialRadius[1] = 41.92278680950403;
            this.species[3].socialForce[2] = 3.05437408387661;
            this.species[3].socialRadius[2] = 71.93124115094543;
            this.species[3].socialForce[3] = 0.30829014256596565;
            this.species[3].socialRadius[3] = 29.373187363147736;
            this.species[3].socialForce[4] = 2.692530371248722;
            this.species[3].socialRadius[4] = 17.34831178188324;
            this.species[3].socialForce[5] = -3.504735803231597;
            this.species[3].socialRadius[5] = 35.28821248188615;
            this.species[4].socialForce[0] = 0.0;
            this.species[4].socialRadius[0] = 35.6813519410789;
            this.species[4].socialForce[1] = -2.2478953283280134;
            this.species[4].socialRadius[1] = 29.27869377285242;
            this.species[4].socialForce[2] = 1.5714976619929075;
            this.species[4].socialRadius[2] = 67.66308366879821;
            this.species[4].socialForce[3] = 1.4469843301922083;
            this.species[4].socialRadius[3] = 24.738862734287977;
            this.species[4].socialForce[4] = -3.206526968628168;
            this.species[4].socialRadius[4] = 8.246950801461935;
            this.species[4].socialForce[5] = -3.382426990196109;
            this.species[4].socialRadius[5] = 20.83147009462118;
            this.species[5].socialForce[0] = 0.0;
            this.species[5].socialRadius[0] = 58.359155502170324;
            this.species[5].socialForce[1] = 0.5229634866118431;
            this.species[5].socialRadius[1] = 22.19472612813115;
            this.species[5].socialForce[2] = -0.3390012998133898;
            this.species[5].socialRadius[2] = 59.756876077502966;
            this.species[5].socialForce[3] = 0.20365052670240402;
            this.species[5].socialRadius[3] = 29.851365625858307;
            this.species[5].socialForce[4] = 2.2390960846096277;
            this.species[5].socialRadius[4] = 67.69483275339007;
            this.species[5].socialForce[5] = 1.7939001806080341;
            this.species[5].socialRadius[5] = 25.740952897816896;

            this.initMode = INIT_MODE_BLOBS;
        }
        //-----------------------------------------
        // Demo
        //-----------------------------------------
        else if (e === ECO_DEMO) {
            this.numParticles = MAX_PARTICLES;
            this.numSpecies = 6;
            this.initMode = INIT_MODE_FULL;
            this.diskSize = 200.0;

            for (let s = 0; s < MAX_SPECIES; s++) {
                this.species[s].halo = false;
                this.species[s].steps = 0;
                this.species[s].averageForces = false;
                this.species[s].nonAverageForce = 0.01;
                this.species[s].friction = 0.1;

                for (let f = 0; f < MAX_SPECIES; f++) {
                    this.species[s].collisionForce[f] = MIN_COLLISION_FORCE + Math.random() * (MAX_COLLISION_FORCE - MIN_COLLISION_FORCE);
                    this.species[s].collisionRadius[f] = MIN_COLLISION_RADIUS + Math.random() * (MAX_COLLISION_RADIUS - MIN_COLLISION_RADIUS);
                    this.species[s].socialForce[f] = -MAX_SOCIAL_FORCE + Math.random() * MAX_SOCIAL_FORCE * 2.0;
                    this.species[s].socialRadius[f] = this.species[s].collisionRadius[f] + MAX_SOCIAL_RADIUS * Math.random();
                    this.species[s].socialRamp[f] = (Math.random() > ONE_HALF);
                }
            }

            this.randomizeSpeciesColors();

            //step test...
            /*
            this.numParticles = 7 + 80;
            this.numSpecies = 3;
            this.initMode = INIT_MODE_DEMO;		
            this.diskSize = 200.0;
        	
            this.species[0].setColor( 255,  50,   50, 1.0 ); 
            this.species[1].setColor( 255,  255,   0, 1.0 ); 
            this.species[2].setColor(  50,  100, 200, 1.0 ); 

            this.species[0].steps = 0;              
            this.species[1].steps = 0; 

            this.species[1].socialRamp		[0] = false;
            this.species[1].socialForce 	[0] = 0.1;    
            this.species[1].socialRadius	[0] = 120;     
            this.species[1].collisionForce	[0] = 1; 
            this.species[1].collisionRadius	[0] = 10;
        	
            this.species[1].socialRamp		[1] = false;
            this.species[1].socialForce 	[1] = -0.1;      
            this.species[1].socialRadius	[1] = 9.0;     
            this.species[1].collisionForce	[1] = 10.0;  
            this.species[1].collisionRadius	[1] = 9.0;  



            this.species[2].steps = 5; 
        	
            this.species[2].socialRamp		[0] = false;
            this.species[2].socialForce 	[0] = 0.1;      
            this.species[2].socialRadius	[0] = 180.0;     
            this.species[2].collisionForce	[0] = 1;  
            this.species[2].collisionRadius	[0] = 10.0;  

            this.species[2].socialRamp		[1] = false;
            this.species[2].socialForce 	[1] = -3;      
            this.species[2].socialRadius	[1] = 50.0;     
            this.species[2].collisionForce	[1] = 1;  
            this.species[2].collisionRadius	[1] = 10.0;  

            this.species[2].socialRamp		[2] = false;
            this.species[2].socialForce 	[2] = -0.4;      
            this.species[2].socialRadius	[2] = 10.0;     
            this.species[2].collisionForce	[2] = 0.9;  
            this.species[2].collisionRadius	[2] = 10.0;  
            */
        }

        //-----------------------------------------
        // Demo
        //-----------------------------------------
        else if (e === ECO_DREAM) {
            this.numParticles = MAX_PARTICLES;
            this.numSpecies = 8;
            this.initMode = 2;
            this.diskSize = 50;
            this.blur = 0.8;
            this.scale = 1;

            this.initMode = INIT_MODE_EDGES;


            for (let s = 0; s < MAX_SPECIES; s++) {
                this.species[s].halo = true;
            }


            // species 0:                                                                  
            this.species[0].steps = 0;
            this.species[0].setColor(153, 81, 122, 0.6655960476497422);
            // force field for species 0:                                                  
            this.species[0].collisionForce[0] = 0.728907506586925;
            this.species[0].collisionRadius[0] = 16.154670027018707;
            this.species[0].socialForce[0] = 1.4944551013729068;
            this.species[0].socialRadius[0] = 55.03449942208762;
            // force field for species 1:                                                  
            this.species[0].collisionForce[1] = 0.4716552017141782;
            this.species[0].collisionRadius[1] = 15.311921995353684;
            this.species[0].socialForce[1] = -2.3785344140961104;
            this.species[0].socialRadius[1] = 58.97542576499758;
            // force field for species 2:                                                  
            this.species[0].collisionForce[2] = 1.1066592875749053;
            this.species[0].collisionRadius[2] = 0.5837518284813314;
            this.species[0].socialForce[2] = 4.3110656134987355;
            this.species[0].socialRadius[2] = 66.59916026528934;
            // force field for species 3:                                                  
            this.species[0].collisionForce[3] = 1.7086631005313548;
            this.species[0].collisionRadius[3] = 13.46845464254734;
            this.species[0].socialForce[3] = -1.9006677049672094;
            this.species[0].socialRadius[3] = 108.11060077898519;
            // force field for species 4:                                                  
            this.species[0].collisionForce[4] = 0.34068245068814895;
            this.species[0].collisionRadius[4] = 4.794558602992689;
            this.species[0].socialForce[4] = -2.231029995423727;
            this.species[0].socialRadius[4] = 95.32865507854417;
            // force field for species 5:                                                  
            this.species[0].collisionForce[5] = 1.263567122532531;
            this.species[0].collisionRadius[5] = 15.40749020271872;
            this.species[0].socialForce[5] = -0.07563934385222026;
            this.species[0].socialRadius[5] = 109.69778545538429;
            // force field for species 6:                                                  
            this.species[0].collisionForce[6] = 1.2443174739104192;
            this.species[0].collisionRadius[6] = 12.0402509932239;
            this.species[0].socialForce[6] = -2.8389416545400747;
            this.species[0].socialRadius[6] = 39.306605870759505;
            // force field for species 7:                                                  
            this.species[0].collisionForce[7] = 1.5653272179216042;
            this.species[0].collisionRadius[7] = 10.073567604952666;
            this.species[0].socialForce[7] = 0.005340251337501378;
            this.species[0].socialRadius[7] = 60.02947554858165;
            // species 1:                                                                  
            this.species[1].steps = 0;
            this.species[1].setColor(182, 186, 140, 0.4490693280347043);
            // force field for species 0:                                                  
            this.species[1].collisionForce[0] = 0.449462094507187;
            this.species[1].collisionRadius[0] = 8.250979798160493;
            this.species[1].socialForce[0] = 1.527653264954841;
            this.species[1].socialRadius[0] = 106.33909218032676;
            // force field for species 1:                                                  
            this.species[1].collisionForce[1] = 0.05765274379779095;
            this.species[1].collisionRadius[1] = 13.239493670345624;
            this.species[1].socialForce[1] = 3.036073235206354;
            this.species[1].socialRadius[1] = 39.404577700984596;
            // force field for species 2:                                                  
            this.species[1].collisionForce[2] = 0.47863366691274356;
            this.species[1].collisionRadius[2] = 11.680226334201658;
            this.species[1].socialForce[2] = -1.8786773570790527;
            this.species[1].socialRadius[2] = 84.26060025961357;
            // force field for species 3:                                                  
            this.species[1].collisionForce[3] = 1.6621865627740655;
            this.species[1].collisionRadius[3] = 11.698543629306133;
            this.species[1].socialForce[3] = -4.9471642277518715;
            this.species[1].socialRadius[3] = 70.74686745838662;
            // force field for species 4:                                                  
            this.species[1].collisionForce[4] = 0.6299192018083664;
            this.species[1].collisionRadius[4] = 16.369303271093543;
            this.species[1].socialForce[4] = -3.788062572679344;
            this.species[1].socialRadius[4] = 30.68497841008704;
            // force field for species 5:                                                  
            this.species[1].collisionForce[5] = 0.38437958824935525;
            this.species[1].collisionRadius[5] = 8.6718040347126;
            this.species[1].socialForce[5] = -1.0407804886833172;
            this.species[1].socialRadius[5] = 82.36119570318309;
            // force field for species 6:                                                  
            this.species[1].collisionForce[6] = 0.851422832601799;
            this.species[1].collisionRadius[6] = 19.823878744884404;
            this.species[1].socialForce[6] = -1.3332725677162491;
            this.species[1].socialRadius[6] = 42.16206518197782;
            // force field for species 7:                                                  
            this.species[1].collisionForce[7] = 0.8408256950517328;
            this.species[1].collisionRadius[7] = 19.119728527647627;
            this.species[1].socialForce[7] = 3.92485369018004;
            this.species[1].socialRadius[7] = 79.2363389989351;
            // species 2:                                                                  
            this.species[2].steps = 0;
            this.species[2].setColor(82, 83, 111, 0.9521412929024726);
            // force field for species 0:                                                  
            this.species[2].collisionForce[0] = 1.0928248475113633;
            this.species[2].collisionRadius[0] = 2.429666972930893;
            this.species[2].socialForce[0] = -3.035377003349775;
            this.species[2].socialRadius[0] = 29.20923549016771;
            // force field for species 1:                                                  
            this.species[2].collisionForce[1] = 0.24618941949490214;
            this.species[2].collisionRadius[1] = 7.624069415602827;
            this.species[2].socialForce[1] = -0.22490401564766138;
            this.species[2].socialRadius[1] = 65.61316761668706;
            // force field for species 2:                                                  
            this.species[2].collisionForce[2] = 0.456907469855258;
            this.species[2].collisionRadius[2] = 6.503770163188374;
            this.species[2].socialForce[2] = -1.9622357805321533;
            this.species[2].socialRadius[2] = 95.11492578673472;
            // force field for species 3:                                                  
            this.species[2].collisionForce[3] = 1.0259082710666032;
            this.species[2].collisionRadius[3] = 5.503951280251311;
            this.species[2].socialForce[3] = 1.541444141249774;
            this.species[2].socialRadius[3] = 88.14746503371612;
            // force field for species 4:                                                  
            this.species[2].collisionForce[4] = 0.7509728814263528;
            this.species[2].collisionRadius[4] = 15.726307702770546;
            this.species[2].socialForce[4] = 4.659067583088252;
            this.species[2].socialRadius[4] = 74.36881014906459;
            // force field for species 5:                                                  
            this.species[2].collisionForce[5] = 0.927804427059993;
            this.species[2].collisionRadius[5] = 17.305582709668407;
            this.species[2].socialForce[5] = -4.20163820202013;
            this.species[2].socialRadius[5] = 86.2945520087905;
            // force field for species 6:                                                  
            this.species[2].collisionForce[6] = 1.08224362992423;
            this.species[2].collisionRadius[6] = 18.923032852010877;
            this.species[2].socialForce[6] = 1.813849997913369;
            this.species[2].socialRadius[6] = 56.13929869436951;
            // force field for species 7:                                                  
            this.species[2].collisionForce[7] = 1.1386875059661492;
            this.species[2].collisionRadius[7] = 17.03361812628995;
            this.species[2].socialForce[7] = 3.3781297257658114;
            this.species[2].socialRadius[7] = 39.29327015441777;
            // species 3:                                                                  
            this.species[3].steps = 1;
            this.species[3].setColor(141, 114, 56, 0.8957871988547057);
            // force field for species 0:                                                  
            this.species[3].collisionForce[0] = 0.503758449086134;
            this.species[3].collisionRadius[0] = 14.646818944259943;
            this.species[3].socialForce[0] = 3.1257090735798787;
            this.species[3].socialRadius[0] = 35.42463423888109;
            // force field for species 1:                                                  
            this.species[3].collisionForce[1] = 0.7126390701273952;
            this.species[3].collisionRadius[1] = 6.667054048099881;
            this.species[3].socialForce[1] = 3.8446974707381596;
            this.species[3].socialRadius[1] = 96.01082572335636;
            // force field for species 2:                                                  
            this.species[3].collisionForce[2] = 0.6876258746132615;
            this.species[3].collisionRadius[2] = 14.837185937422548;
            this.species[3].socialForce[2] = 4.695564629742643;
            this.species[3].socialRadius[2] = 67.59801521258643;
            // force field for species 3:                                                  
            this.species[3].collisionForce[3] = 1.862782736398233;
            this.species[3].collisionRadius[3] = 14.059421433612316;
            this.species[3].socialForce[3] = 3.4979171620334313;
            this.species[3].socialRadius[3] = 54.364316409897846;
            // force field for species 4:                                                  
            this.species[3].collisionForce[4] = 1.2969017062179253;
            this.species[3].collisionRadius[4] = 14.522744268885576;
            this.species[3].socialForce[4] = -4.182251528473976;
            this.species[3].socialRadius[4] = 94.1067421649804;
            // force field for species 5:                                                  
            this.species[3].collisionForce[5] = 0.8614277876656462;
            this.species[3].collisionRadius[5] = 14.028505018609295;
            this.species[3].socialForce[5] = -2.001632482761171;
            this.species[3].socialRadius[5] = 96.65953869681681;
            // force field for species 6:                                                  
            this.species[3].collisionForce[6] = 1.7340342062536163;
            this.species[3].collisionRadius[6] = 9.371533280638554;
            this.species[3].socialForce[6] = 4.345396744035831;
            this.species[3].socialRadius[6] = 48.99179939022119;
            // force field for species 7:                                                  
            this.species[3].collisionForce[7] = 0.1909894518003017;
            this.species[3].collisionRadius[7] = 6.876569148396703;
            this.species[3].socialForce[7] = -4.450189592453821;
            this.species[3].socialRadius[7] = 90.57647878472079;
            // species 4:                                                                  
            this.species[4].steps = 1;
            this.species[4].setColor(76, 237, 94, 0.5055951941895145);
            // force field for species 0:                                                  
            this.species[4].collisionForce[0] = 0.8188126577716657;
            this.species[4].collisionRadius[0] = 2.376034703051002;
            this.species[4].socialForce[0] = -4.986688245879984;
            this.species[4].socialRadius[0] = 58.88282743625935;
            // force field for species 1:                                                  
            this.species[4].collisionForce[1] = 1.0450683088426116;
            this.species[4].collisionRadius[1] = 18.377758346905406;
            this.species[4].socialForce[1] = -4.036344098169451;
            this.species[4].socialRadius[1] = 88.98009180473316;
            // force field for species 2:                                                  
            this.species[4].collisionForce[2] = 0.33534366014147277;
            this.species[4].collisionRadius[2] = 4.398028252319428;
            this.species[4].socialForce[2] = 3.511449381523093;
            this.species[4].socialRadius[2] = 41.638369553895124;
            // force field for species 3:                                                  
            this.species[4].collisionForce[3] = 1.336135205583391;
            this.species[4].collisionRadius[3] = 14.76179835867369;
            this.species[4].socialForce[3] = -1.6510487692032227;
            this.species[4].socialRadius[3] = 68.40041696796833;
            // force field for species 4:                                                  
            this.species[4].collisionForce[4] = 0.799564859492494;
            this.species[4].collisionRadius[4] = 11.824813152951933;
            this.species[4].socialForce[4] = -2.2146634162672783;
            this.species[4].socialRadius[4] = 67.35263409798526;
            // force field for species 5:                                                  
            this.species[4].collisionForce[5] = 1.5028413228958497;
            this.species[4].collisionRadius[5] = 18.73036952731205;
            this.species[4].socialForce[5] = -4.286927007022334;
            this.species[4].socialRadius[5] = 105.80359178029931;
            // force field for species 6:                                                  
            this.species[4].collisionForce[6] = 0.3974370835076626;
            this.species[4].collisionRadius[6] = 0.17336167587354234;
            this.species[4].socialForce[6] = 3.818192692196826;
            this.species[4].socialRadius[6] = 3.057900228507928;
            // force field for species 7:                                                  
            this.species[4].collisionForce[7] = 0.7156488870698285;
            this.species[4].collisionRadius[7] = 11.784648289727551;
            this.species[4].socialForce[7] = 0.5321361554748529;
            this.species[4].socialRadius[7] = 72.63981535053456;
            // species 5:                                                                  
            this.species[5].steps = 1;
            this.species[5].setColor(162, 58, 253, 0.3011586504408384);
            // force field for species 0:                                                  
            this.species[5].collisionForce[0] = 0.3716306295052023;
            this.species[5].collisionRadius[0] = 1.3585710513472393;
            this.species[5].socialForce[0] = -2.04675315203224;
            this.species[5].socialRadius[0] = 25.427255921899267;
            // force field for species 1:                                                  
            this.species[5].collisionForce[1] = 0.5727115621279173;
            this.species[5].collisionRadius[1] = 16.835211065986805;
            this.species[5].socialForce[1] = 4.149189593236759;
            this.species[5].socialRadius[1] = 98.7168448947497;
            // force field for species 2:                                                  
            this.species[5].collisionForce[2] = 0.5260608242860361;
            this.species[5].collisionRadius[2] = 12.12225585860969;
            this.species[5].socialForce[2] = -0.997092879569732;
            this.species[5].socialRadius[2] = 54.601092231944264;
            // force field for species 3:                                                  
            this.species[5].collisionForce[3] = 0.9463353512573289;
            this.species[5].collisionRadius[3] = 17.36197611864974;
            this.species[5].socialForce[3] = 0.4420056150282816;
            this.species[5].socialRadius[3] = 31.903726506876886;
            // force field for species 4:                                                  
            this.species[5].collisionForce[4] = 1.414072668275056;
            this.species[5].collisionRadius[4] = 18.88287708715248;
            this.species[5].socialForce[4] = 3.545273380332606;
            this.species[5].socialRadius[4] = 103.50128636882103;
            // force field for species 5:                                                  
            this.species[5].collisionForce[5] = 1.2390971701730968;
            this.species[5].collisionRadius[5] = 8.04201661870114;
            this.species[5].socialForce[5] = 4.90309695103765;
            this.species[5].socialRadius[5] = 41.561242978566035;
            // force field for species 6:                                                  
            this.species[5].collisionForce[6] = 1.4497729845972946;
            this.species[5].collisionRadius[6] = 9.229128820489446;
            this.species[5].socialForce[6] = -3.97936161066325;
            this.species[5].socialRadius[6] = 79.22107903263041;
            // force field for species 7:                                                  
            this.species[5].collisionForce[7] = 1.7007068500960971;
            this.species[5].collisionRadius[7] = 6.969465865612506;
            this.species[5].socialForce[7] = -4.151883119735372;
            this.species[5].socialRadius[7] = 91.45503291533416;
            // species 6:                                                                  
            this.species[6].steps = 0;
            this.species[6].setColor(218, 203, 241, 0.7240253708655338);
            // force field for species 0:                                                  
            this.species[6].collisionForce[0] = 1.893394984618125;
            this.species[6].collisionRadius[0] = 14.837957529353744;
            this.species[6].socialForce[0] = 1.4396095207215094;
            this.species[6].socialRadius[0] = 58.21017101966071;
            // force field for species 1:                                                  
            this.species[6].collisionForce[1] = 1.895563360712863;
            this.species[6].collisionRadius[1] = 0.47535843588920157;
            this.species[6].socialForce[1] = -4.244514480413417;
            this.species[6].socialRadius[1] = 14.205304400841486;
            // force field for species 2:                                                  
            this.species[6].collisionForce[2] = 1.2810873053982161;
            this.species[6].collisionRadius[2] = 6.995965456122257;
            this.species[6].socialForce[2] = 3.2007637758672427;
            this.species[6].socialRadius[2] = 61.42279111512092;
            // force field for species 3:                                                  
            this.species[6].collisionForce[3] = 0.8654883082862572;
            this.species[6].collisionRadius[3] = 9.305126025354477;
            this.species[6].socialForce[3] = -4.132022793479515;
            this.species[6].socialRadius[3] = 17.631137206576227;
            // force field for species 4:                                                  
            this.species[6].collisionForce[4] = 1.3078519817101415;
            this.species[6].collisionRadius[4] = 8.065886734977079;
            this.species[6].socialForce[4] = -4.351741874810006;
            this.species[6].socialRadius[4] = 63.814085820391384;
            // force field for species 5:                                                  
            this.species[6].collisionForce[5] = 1.0031806067471218;
            this.species[6].collisionRadius[5] = 17.90289654265613;
            this.species[6].socialForce[5] = 1.961709607254143;
            this.species[6].socialRadius[5] = 105.90874816348173;
            // force field for species 6:                                                  
            this.species[6].collisionForce[6] = 1.8776798096697287;
            this.species[6].collisionRadius[6] = 19.01349221227345;
            this.species[6].socialForce[6] = 4.505557360934313;
            this.species[6].socialRadius[6] = 33.867366281098064;
            // force field for species 7:                                                  
            this.species[6].collisionForce[7] = 1.683855831754386;
            this.species[6].collisionRadius[7] = 4.973380232414515;
            this.species[6].socialForce[7] = 1.5770051369308096;
            this.species[6].socialRadius[7] = 9.992641548017378;
            // species 7:                                                                  
            this.species[7].steps = 0;
            this.species[7].setColor(58, 71, 232, 0.5645769103017378);
            // force field for species 0:                                                  
            this.species[7].collisionForce[0] = 0.556062425473697;
            this.species[7].collisionRadius[0] = 14.844237688159897;
            this.species[7].socialForce[0] = 1.1237431746913664;
            this.species[7].socialRadius[0] = 43.77937646691464;
            // force field for species 1:                                                  
            this.species[7].collisionForce[1] = 1.6877062603022652;
            this.species[7].collisionRadius[1] = 10.330276081529902;
            this.species[7].socialForce[1] = 0.46600469199292505;
            this.species[7].socialRadius[1] = 33.60752933966182;
            // force field for species 2:                                                  
            this.species[7].collisionForce[2] = 1.9689330677336998;
            this.species[7].collisionRadius[2] = 5.281414167223753;
            this.species[7].socialForce[2] = 3.7202356002736607;
            this.species[7].socialRadius[2] = 99.69913049156774;
            // force field for species 3:                                                  
            this.species[7].collisionForce[3] = 1.2176056123511636;
            this.species[7].collisionRadius[3] = 1.6635084067641293;
            this.species[7].socialForce[3] = 0.9600391479484642;
            this.species[7].socialRadius[3] = 54.40093738355985;
            // force field for species 4:                                                  
            this.species[7].collisionForce[4] = 0.21514455687154665;
            this.species[7].collisionRadius[4] = 9.071653410510649;
            this.species[7].socialForce[4] = 0.1286576504872059;
            this.species[7].socialRadius[4] = 99.23035206269547;
            // force field for species 5:                                                  
            this.species[7].collisionForce[5] = 1.0012295246682485;
            this.species[7].collisionRadius[5] = 4.396000398430351;
            this.species[7].socialForce[5] = 2.179346911342982;
            this.species[7].socialRadius[5] = 77.61305783333256;
            // force field for species 6:                                                  
            this.species[7].collisionForce[6] = 0.4203505243499399;
            this.species[7].collisionRadius[6] = 17.978716913140516;
            this.species[7].socialForce[6] = 0.650090832966983;
            this.species[7].socialRadius[6] = 79.82573270723319;
            // force field for species 7:                                                  
            this.species[7].collisionForce[7] = 0.8477568557294535;
            this.species[7].collisionRadius[7] = 13.651982906529094;
            this.species[7].socialForce[7] = -2.224340128298569;
            this.species[7].socialRadius[7] = 51.01207291588498;

            /*
            this.numParticles = 1200;                                         
            this.numSpecies = 11;                                            
            this.initMode = 2;                                              
            this.diskSize = 400;                                              
            this.blur = 0.79;                                              	
            this.scale = 1;                                              	
            // species 0:                                              		
            this.species[0].steps = 0;                                       
            this.species[0].setColor( 191, 150, 144, 0.34820528036574205 );  
            // force field for species 0:                                    
            this.species[0].collisionForce[0] = 0.9930306849839075;          
            this.species[0].collisionRadius[0] = 16.186903660503148;         
            this.species[0].socialForce[0] = 1.4985375768343143;             
            this.species[0].socialRadius[0] = 55.075167782944845;            
            // force field for species 1:                                    
            this.species[0].collisionForce[1] = 1.5008286500868195;          
            this.species[0].collisionRadius[1] = 14.685443180483297;         
            this.species[0].socialForce[1] = 3.347540620597252;              
            this.species[0].socialRadius[1] = 45.00516908876094;             
            // force field for species 2:                                    
            this.species[0].collisionForce[2] = 1.475651142135235;           
            this.species[0].collisionRadius[2] = 3.807743895527842;          
            this.species[0].socialForce[2] = 4.64122801245421;               
            this.species[0].socialRadius[2] = 10.579503364479908;            
            // force field for species 3:                                    
            this.species[0].collisionForce[3] = 0.4376835631034073;          
            this.species[0].collisionRadius[3] = 2.9200710260047402;         
            this.species[0].socialForce[3] = -1.6668109865946623;            
            this.species[0].socialRadius[3] = 76.70899487955023;             
            // force field for species 4:                                    
            this.species[0].collisionForce[4] = 0.78507339089561;            
            this.species[0].collisionRadius[4] = 15.38363369512939;          
            this.species[0].socialForce[4] = 4.0903678770562895;             
            this.species[0].socialRadius[4] = 84.30449053709653;             
            // force field for species 5:                                    
            this.species[0].collisionForce[5] = 1.8994586781335523;          
            this.species[0].collisionRadius[5] = 19.392089733860175;         
            this.species[0].socialForce[5] = 3.8949492589796115;             
            this.species[0].socialRadius[5] = 31.480193032362415;            
            // force field for species 6:                                    
            this.species[0].collisionForce[6] = 0.9087381136891126;          
            this.species[0].collisionRadius[6] = 2.722341622287814;          
            this.species[0].socialForce[6] = 2.7922819983207674;             
            this.species[0].socialRadius[6] = 77.61487553414992;             
            // force field for species 7:                                    
            this.species[0].collisionForce[7] = 1.9443234293316924;          
            this.species[0].collisionRadius[7] = 19.239808003996526;         
            this.species[0].socialForce[7] = 0.3032376365733125;             
            this.species[0].socialRadius[7] = 39.91384688261134;             
            // force field for species 8:                                    
            this.species[0].collisionForce[8] = 0.7741593959006758;          
            this.species[0].collisionRadius[8] = 16.116997553703946;         
            this.species[0].socialForce[8] = -4.238521898385744;             
            this.species[0].socialRadius[8] = 67.25606303726876;             
            // force field for species 9:                                    
            this.species[0].collisionForce[9] = 1.0629751454220069;          
            this.species[0].collisionRadius[9] = 4.259983776919514;          
            this.species[0].socialForce[9] = 2.5952549061014105;             
            this.species[0].socialRadius[9] = 40.16073462452624;             
            // force field for species 10:                                   
            this.species[0].collisionForce[10] = 0.30527401606440563;        
            this.species[0].collisionRadius[10] = 1.278662442587728;         
            this.species[0].socialForce[10] = 4.968498256603226;             
            this.species[0].socialRadius[10] = 3.4046906695882706;           
            // species 1:                                              		
            this.species[1].steps = 0;                                       
            this.species[1].setColor( 122, 82, 71, 0.375891808230731 );      
            // force field for species 0:                                    
            this.species[1].collisionForce[0] = 0.280637179457234;           
            this.species[1].collisionRadius[0] = 6.4047536770442175;         
            this.species[1].socialForce[0] = -4.272880303389789;             
            this.species[1].socialRadius[0] = 45.06322596547021;             
            // force field for species 1:                                    
            this.species[1].collisionForce[1] = 0.8855927708665194;          
            this.species[1].collisionRadius[1] = 3.9981161040477553;         
            this.species[1].socialForce[1] = -2.0078586345882323;            
            this.species[1].socialRadius[1] = 57.316886547643875;            
            // force field for species 2:                                    
            this.species[1].collisionForce[2] = 0.7320519224401525;          
            this.species[1].collisionRadius[2] = 8.950286135492284;          
            this.species[1].socialForce[2] = 2.771647123082208;              
            this.species[1].socialRadius[2] = 76.09077707014362;             
            // force field for species 3:                                    
            this.species[1].collisionForce[3] = 0.4540804589848473;          
            this.species[1].collisionRadius[3] = 7.500705487852399;          
            this.species[1].socialForce[3] = 1.6625492903905368;             
            this.species[1].socialRadius[3] = 39.616522624514396;            
            // force field for species 4:                                    
            this.species[1].collisionForce[4] = 1.5238511408366655;          
            this.species[1].collisionRadius[4] = 8.912188290106599;          
            this.species[1].socialForce[4] = 2.345407180405859;              
            this.species[1].socialRadius[4] = 68.95578200572584;             
            // force field for species 5:                                    
            this.species[1].collisionForce[5] = 1.0946425346760378;          
            this.species[1].collisionRadius[5] = 11.57015665891825;          
            this.species[1].socialForce[5] = -0.18412265739764067;           
            this.species[1].socialRadius[5] = 57.09919542092611;             
            // force field for species 6:                                    
            this.species[1].collisionForce[6] = 0.6774039377108223;          
            this.species[1].collisionRadius[6] = 15.461578620883603;         
            this.species[1].socialForce[6] = 0.0990808125260969;             
            this.species[1].socialRadius[6] = 74.70146903503662;             
            // force field for species 7:                                    
            this.species[1].collisionForce[7] = 1.1647075450337334;          
            this.species[1].collisionRadius[7] = 5.263613683365156;          
            this.species[1].socialForce[7] = -3.096637273101802;             
            this.species[1].socialRadius[7] = 50.75497890971434;             
            // force field for species 8:                                    
            this.species[1].collisionForce[8] = 1.1543845804719808;          
            this.species[1].collisionRadius[8] = 16.734808122189854;         
            this.species[1].socialForce[8] = -3.6335784845969044;            
            this.species[1].socialRadius[8] = 66.09355372657535;             
            // force field for species 9:                                    
            this.species[1].collisionForce[9] = 1.8108278155612676;          
            this.species[1].collisionRadius[9] = 4.674118104016458;          
            this.species[1].socialForce[9] = 1.9663264245100134;             
            this.species[1].socialRadius[9] = 77.54261727321729;             
            // force field for species 10:                                   
            this.species[1].collisionForce[10] = 0.9544177993176794;         
            this.species[1].collisionRadius[10] = 1.756518561420326;         
            this.species[1].socialForce[10] = -4.282605890543024;            
            this.species[1].socialRadius[10] = 85.06148308090009;            
            // species 2:                                              		
            this.species[2].steps = 0;                                       
            this.species[2].setColor( 76, 112, 221, 0.47888412251800316 );   
            // force field for species 0:                                    
            this.species[2].collisionForce[0] = 0.8022481120472993;          
            this.species[2].collisionRadius[0] = 3.7693493012877077;         
            this.species[2].socialForce[0] = -2.951754924495602;             
            this.species[2].socialRadius[0] = 87.22829272842758;             
            // force field for species 1:                                    
            this.species[2].collisionForce[1] = 1.3713093163062935;          
            this.species[2].collisionRadius[1] = 5.112270101992847;          
            this.species[2].socialForce[1] = -0.6921386545057011;            
            this.species[2].socialRadius[1] = 71.67259090703047;             
            // force field for species 2:                                    
            this.species[2].collisionForce[2] = 1.5686895620500303;          
            this.species[2].collisionRadius[2] = 16.126381572076465;         
            this.species[2].socialForce[2] = 4.847211535197808;              
            this.species[2].socialRadius[2] = 64.66409905894915;             
            // force field for species 3:                                    
            this.species[2].collisionForce[3] = 1.8081983892504694;          
            this.species[2].collisionRadius[3] = 13.096240453250353;         
            this.species[2].socialForce[3] = 0.10791975951355415;            
            this.species[2].socialRadius[3] = 60.211819210289896;            
            // force field for species 4:                                    
            this.species[2].collisionForce[4] = 1.3581069195429913;          
            this.species[2].collisionRadius[4] = 9.73901338267822;           
            this.species[2].socialForce[4] = 0.36105132733463474;            
            this.species[2].socialRadius[4] = 80.96709747161516;             
            // force field for species 5:                                    
            this.species[2].collisionForce[5] = 1.0843048017388837;          
            this.species[2].collisionRadius[5] = 1.6984237157140791;         
            this.species[2].socialForce[5] = 0.022986308847618986;           
            this.species[2].socialRadius[5] = 73.04123820717318;             
            // force field for species 6:                                    
            this.species[2].collisionForce[6] = 0.20693460450570145;         
            this.species[2].collisionRadius[6] = 11.194851714829227;         
            this.species[2].socialForce[6] = -4.310016821224439;             
            this.species[2].socialRadius[6] = 74.68790153100416;             
            // force field for species 7:                                    
            this.species[2].collisionForce[7] = 0.8130150217779555;          
            this.species[2].collisionRadius[7] = 6.742516350911842;          
            this.species[2].socialForce[7] = -4.206981254102048;             
            this.species[2].socialRadius[7] = 64.38765326656022;             
            // force field for species 8:                                    
            this.species[2].collisionForce[8] = 0.6338832853261451;          
            this.species[2].collisionRadius[8] = 10.557495412918625;         
            this.species[2].socialForce[8] = 3.7817175588763767;             
            this.species[2].socialRadius[8] = 73.8462195901145;              
            // force field for species 9:                                    
            this.species[2].collisionForce[9] = 1.4743166097047475;          
            this.species[2].collisionRadius[9] = 9.398135825366872;          
            this.species[2].socialForce[9] = 1.7717969084661416;             
            this.species[2].socialRadius[9] = 16.65295645516303;             
            // force field for species 10:                                   
            this.species[2].collisionForce[10] = 0.31212178133185753;        
            this.species[2].collisionRadius[10] = 15.900210542662151;        
            this.species[2].socialForce[10] = 0.19578414220731055;           
            this.species[2].socialRadius[10] = 115.02103957767395;           
            // species 3:                                              		
            this.species[3].steps = 0;                                       
            this.species[3].setColor( 224, 109, 187, 0.893657279749102 );    
            // force field for species 0:                                    
            this.species[3].collisionForce[0] = 1.1076744712784385;          
            this.species[3].collisionRadius[0] = 11.404724672648292;         
            this.species[3].socialForce[0] = 0.5587001240179479;             
            this.species[3].socialRadius[0] = 88.30616963342845;             
            // force field for species 1:                                    
            this.species[3].collisionForce[1] = 1.2189515940782039;          
            this.species[3].collisionRadius[1] = 11.612996026648794;         
            this.species[3].socialForce[1] = 0.8523354440037734;             
            this.species[3].socialRadius[1] = 68.83971661693225;             
            // force field for species 2:                                    
            this.species[3].collisionForce[2] = 0.23557974562615613;         
            this.species[3].collisionRadius[2] = 2.700798833812883;          
            this.species[3].socialForce[2] = 4.57338298697236;               
            this.species[3].socialRadius[2] = 74.11480331911417;             
            // force field for species 3:                                    
            this.species[3].collisionForce[3] = 1.581429765019809;           
            this.species[3].collisionRadius[3] = 17.178787458328305;         
            this.species[3].socialForce[3] = 1.2999249386277913;             
            this.species[3].socialRadius[3] = 65.04853446159014;             
            // force field for species 4:                                    
            this.species[3].collisionForce[4] = 0.5899472521791675;          
            this.species[3].collisionRadius[4] = 2.4238543812010627;         
            this.species[3].socialForce[4] = 4.676320317745617;              
            this.species[3].socialRadius[4] = 54.30941815737806;             
            // force field for species 5:                                    
            this.species[3].collisionForce[5] = 1.671714739550658;           
            this.species[3].collisionRadius[5] = 6.493666178881405;          
            this.species[3].socialForce[5] = -1.8385852803196103;            
            this.species[3].socialRadius[5] = 103.8072388124389;             
            // force field for species 6:                                    
            this.species[3].collisionForce[6] = 0.3837919880671885;          
            this.species[3].collisionRadius[6] = 4.329925251950266;          
            this.species[3].socialForce[6] = 2.9780018705032987;             
            this.species[3].socialRadius[6] = 97.00249713957403;             
            // force field for species 7:                                    
            this.species[3].collisionForce[7] = 0.1509783816825696;          
            this.species[3].collisionRadius[7] = 4.756550647812512;          
            this.species[3].socialForce[7] = -0.3273060006289974;            
            this.species[3].socialRadius[7] = 47.62339010837953;             
            // force field for species 8:                                    
            this.species[3].collisionForce[8] = 0.7123805836401191;          
            this.species[3].collisionRadius[8] = 19.364070236762842;         
            this.species[3].socialForce[8] = 4.402411399904786;              
            this.species[3].socialRadius[8] = 55.120247118714296;            
            // force field for species 9:                                    
            this.species[3].collisionForce[9] = 1.4459296711520393;          
            this.species[3].collisionRadius[9] = 6.313806003040248;          
            this.species[3].socialForce[9] = -0.13847592158788657;           
            this.species[3].socialRadius[9] = 40.71934008335102;             
            // force field for species 10:                                   
            this.species[3].collisionForce[10] = 0.7235909412237882;         
            this.species[3].collisionRadius[10] = 5.043336657556495;         
            this.species[3].socialForce[10] = 0.2034050197400381;            
            this.species[3].socialRadius[10] = 58.07142192832525;            
            // species 4:                                              		
            this.species[4].steps = 0;                                       
            this.species[4].setColor( 173, 248, 164, 0.4574901853207215 );   
            // force field for species 0:                                    
            this.species[4].collisionForce[0] = 0.2583646320018693;          
            this.species[4].collisionRadius[0] = 11.41828107278763;          
            this.species[4].socialForce[0] = 3.823850424708297;              
            this.species[4].socialRadius[0] = 62.41859469691901;             
            // force field for species 1:                                    
            this.species[4].collisionForce[1] = 1.3261743162733277;          
            this.species[4].collisionRadius[1] = 19.078493216372795;         
            this.species[4].socialForce[1] = -4.666995776272963;             
            this.species[4].socialRadius[1] = 102.39270258720845;            
            // force field for species 2:                                    
            this.species[4].collisionForce[2] = 1.6814960556774403;          
            this.species[4].collisionRadius[2] = 2.6800821015939813;         
            this.species[4].socialForce[2] = 4.130750750755235;              
            this.species[4].socialRadius[2] = 102.39707579416746;            
            // force field for species 3:                                    
            this.species[4].collisionForce[3] = 1.694075714862151;           
            this.species[4].collisionRadius[3] = 2.201988616023216;          
            this.species[4].socialForce[3] = 2.547914071409364;              
            this.species[4].socialRadius[3] = 19.866454966703834;            
            // force field for species 4:                                    
            this.species[4].collisionForce[4] = 1.167613609067514;           
            this.species[4].collisionRadius[4] = 8.184410521919304;          
            this.species[4].socialForce[4] = -2.3159994355428113;            
            this.species[4].socialRadius[4] = 83.39016195822813;             
            // force field for species 5:                                    
            this.species[4].collisionForce[5] = 1.8900259239748793;          
            this.species[4].collisionRadius[5] = 12.34836425481806;          
            this.species[4].socialForce[5] = 4.032019992931605;              
            this.species[4].socialRadius[5] = 74.39769366725457;             
            // force field for species 6:                                    
            this.species[4].collisionForce[6] = 1.1821790100269918;          
            this.species[4].collisionRadius[6] = 2.8859659169442753;         
            this.species[4].socialForce[6] = 1.3858897785654856;             
            this.species[4].socialRadius[6] = 93.47725628688569;             
            // force field for species 7:                                    
            this.species[4].collisionForce[7] = 0.4278196619850714;          
            this.species[4].collisionRadius[7] = 11.232562171559161;         
            this.species[4].socialForce[7] = -4.920889113636157;             
            this.species[4].socialRadius[7] = 50.37214411367843;             
            // force field for species 8:                                    
            this.species[4].collisionForce[8] = 0.2267137194897555;          
            this.species[4].collisionRadius[8] = 12.497995421531616;         
            this.species[4].socialForce[8] = -2.4875029270115934;            
            this.species[4].socialRadius[8] = 103.05827949742407;            
            // force field for species 9:                                    
            this.species[4].collisionForce[9] = 0.3962156669541326;          
            this.species[4].collisionRadius[9] = 9.2617955360896;            
            this.species[4].socialForce[9] = -2.0875996492752122;            
            this.species[4].socialRadius[9] = 81.33852597547246;             
            // force field for species 10:                                   
            this.species[4].collisionForce[10] = 1.220451938098614;          
            this.species[4].collisionRadius[10] = 13.778047631404274;        
            this.species[4].socialForce[10] = 2.863286291901421;             
            this.species[4].socialRadius[10] = 13.785749097512353;           
            // species 5:                                              		
            this.species[5].steps = 0;                                       
            this.species[5].setColor( 219, 196, 138, 0.6063227050639434 );   
            // force field for species 0:                                    
            this.species[5].collisionForce[0] = 0.006514487633890287;        
            this.species[5].collisionRadius[0] = 6.146808266779846;          
            this.species[5].socialForce[0] = 0.5776242728700707;             
            this.species[5].socialRadius[0] = 55.8749559261929;              
            // force field for species 1:                                    
            this.species[5].collisionForce[1] = 1.415258163489731;           
            this.species[5].collisionRadius[1] = 0.7044827833517986;         
            this.species[5].socialForce[1] = -0.8330465110109406;            
            this.species[5].socialRadius[1] = 89.49831523875632;             
            // force field for species 2:                                    
            this.species[5].collisionForce[2] = 1.832092884985602;           
            this.species[5].collisionRadius[2] = 10.313096681401655;         
            this.species[5].socialForce[2] = 4.882908342916208;              
            this.species[5].socialRadius[2] = 27.70555415492739;             
            // force field for species 3:                                    
            this.species[5].collisionForce[3] = 1.674794285966578;           
            this.species[5].collisionRadius[3] = 10.220958318904191;         
            this.species[5].socialForce[3] = -1.9457890944904;               
            this.species[5].socialRadius[3] = 54.67468752515806;             
            // force field for species 4:                                    
            this.species[5].collisionForce[4] = 0.10535969916144738;         
            this.species[5].collisionRadius[4] = 8.907740352384902;          
            this.species[5].socialForce[4] = 2.832617941523332;              
            this.species[5].socialRadius[4] = 77.34725992393194;             
            // force field for species 5:                                    
            this.species[5].collisionForce[5] = 1.7084336274793;             
            this.species[5].collisionRadius[5] = 7.334261420308598;          
            this.species[5].socialForce[5] = 0.17933148877879113;            
            this.species[5].socialRadius[5] = 105.89307617091875;            
            // force field for species 6:                                    
            this.species[5].collisionForce[6] = 0.042199424288664744;        
            this.species[5].collisionRadius[6] = 4.361828074555898;          
            this.species[5].socialForce[6] = -0.8517886456068986;            
            this.species[5].socialRadius[6] = 104.35741313173466;            
            // force field for species 7:                                    
            this.species[5].collisionForce[7] = 0.5878284327343875;          
            this.species[5].collisionRadius[7] = 9.930573503085448;          
            this.species[5].socialForce[7] = -4.581642367351724;             
            this.species[5].socialRadius[7] = 99.78582764638136;             
            // force field for species 8:                                    
            this.species[5].collisionForce[8] = 1.5126846197062336;          
            this.species[5].collisionRadius[8] = 1.4650398980651769;         
            this.species[5].socialForce[8] = -1.6194987480654088;            
            this.species[5].socialRadius[8] = 93.04288670646359;             
            // force field for species 9:                                    
            this.species[5].collisionForce[9] = 1.377259591456152;           
            this.species[5].collisionRadius[9] = 12.163291402252431;         
            this.species[5].socialForce[9] = -2.807320481106875;             
            this.species[5].socialRadius[9] = 55.45575541522023;             
            // force field for species 10:                                   
            this.species[5].collisionForce[10] = 0.02879376352261831;        
            this.species[5].collisionRadius[10] = 8.759463775421077;         
            this.species[5].socialForce[10] = -2.5970402246832123;           
            this.species[5].socialRadius[10] = 50.89854670624577;            
            // species 6:                                              		
            this.species[6].steps = 0;                                       
            this.species[6].setColor( 221, 143, 221, 0.9364468317274832 );   
            // force field for species 0:                                    
            this.species[6].collisionForce[0] = 0.48174217744241;            
            this.species[6].collisionRadius[0] = 12.366380790421424;         
            this.species[6].socialForce[0] = -3.0155509819199033;            
            this.species[6].socialRadius[0] = 75.42291007758777;             
            // force field for species 1:                                    
            this.species[6].collisionForce[1] = 0.7136997112731562;          
            this.species[6].collisionRadius[1] = 7.52432049820742;           
            this.species[6].socialForce[1] = 0.13100651200411484;            
            this.species[6].socialRadius[1] = 45.839418616538495;            
            // force field for species 2:                                    
            this.species[6].collisionForce[2] = 1.2980439481171886;          
            this.species[6].collisionRadius[2] = 19.936713469565113;         
            this.species[6].socialForce[2] = -0.8655815742283677;            
            this.species[6].socialRadius[2] = 81.15653052845693;             
            // force field for species 3:                                    
            this.species[6].collisionForce[3] = 0.4980872225148463;          
            this.species[6].collisionRadius[3] = 6.766820189815787;          
            this.species[6].socialForce[3] = -2.0515893881600467;            
            this.species[6].socialRadius[3] = 92.2367192106351;              
            // force field for species 4:                                    
            this.species[6].collisionForce[4] = 1.234354489722246;           
            this.species[6].collisionRadius[4] = 1.7164675868857548;         
            this.species[6].socialForce[4] = 3.116161133469028;              
            this.species[6].socialRadius[4] = 42.739148995128154;            
            // force field for species 5:                                    
            this.species[6].collisionForce[5] = 0.5493800115357941;          
            this.species[6].collisionRadius[5] = 8.170326295985571;          
            this.species[6].socialForce[5] = -3.265600604178096;             
            this.species[6].socialRadius[5] = 107.93538655419958;            
            // force field for species 6:                                    
            this.species[6].collisionForce[6] = 0.03125757484297376;         
            this.species[6].collisionRadius[6] = 6.51130098205037;           
            this.species[6].socialForce[6] = 4.087050885251207;              
            this.species[6].socialRadius[6] = 26.054855916767693;            
            // force field for species 7:                                    
            this.species[6].collisionForce[7] = 1.4353842552548455;          
            this.species[6].collisionRadius[7] = 6.752965645932479;          
            this.species[6].socialForce[7] = 2.787951094272981;              
            this.species[6].socialRadius[7] = 62.01952733458587;             
            // force field for species 8:                                    
            this.species[6].collisionForce[8] = 0.1043816250827585;          
            this.species[6].collisionRadius[8] = 9.481672718607776;          
            this.species[6].socialForce[8] = -3.2677292782044276;            
            this.species[6].socialRadius[8] = 101.34599013637822;            
            // force field for species 9:                                    
            this.species[6].collisionForce[9] = 0.5990595968109118;          
            this.species[6].collisionRadius[9] = 18.144359902811548;         
            this.species[6].socialForce[9] = -0.6959377380609659;            
            this.species[6].socialRadius[9] = 58.59897781981091;             
            // force field for species 10:                                   
            this.species[6].collisionForce[10] = 0.38960078007434484;        
            this.species[6].collisionRadius[10] = 12.032119581910592;        
            this.species[6].socialForce[10] = -4.44898810785281;             
            this.species[6].socialRadius[10] = 91.82261052223444;            
            // species 7:                                              		
            this.species[7].steps = 1;                                       
            this.species[7].setColor( 224, 179, 189, 0.6557340520827892 );   
            // force field for species 0:                                    
            this.species[7].collisionForce[0] = 1.2359560347784695;          
            this.species[7].collisionRadius[0] = 7.980370808594783;          
            this.species[7].socialForce[0] = -3.8883219781326437;            
            this.species[7].socialRadius[0] = 91.10553858748797;             
            // force field for species 1:                                    
            this.species[7].collisionForce[1] = 0.9512861990067827;          
            this.species[7].collisionRadius[1] = 6.560978581155257;          
            this.species[7].socialForce[1] = -1.4297966145748409;            
            this.species[7].socialRadius[1] = 96.96110125271007;             
            // force field for species 2:                                    
            this.species[7].collisionForce[2] = 1.0655501541952273;          
            this.species[7].collisionRadius[2] = 19.91362598848055;          
            this.species[7].socialForce[2] = -3.048642676158045;             
            this.species[7].socialRadius[2] = 102.43246352980808;            
            // force field for species 3:                                    
            this.species[7].collisionForce[3] = 1.1061768994083128;          
            this.species[7].collisionRadius[3] = 5.901489881845404;          
            this.species[7].socialForce[3] = -3.203057139460207;             
            this.species[7].socialRadius[3] = 66.99948919452376;             
            // force field for species 4:                                    
            this.species[7].collisionForce[4] = 1.597276442824242;           
            this.species[7].collisionRadius[4] = 18.426744577455914;         
            this.species[7].socialForce[4] = -4.014612685794848;             
            this.species[7].socialRadius[4] = 21.673406101659644;            
            // force field for species 5:                                    
            this.species[7].collisionForce[5] = 0.41376869351414536;         
            this.species[7].collisionRadius[5] = 0.53275113315576;           
            this.species[7].socialForce[5] = -3.6873913204549447;            
            this.species[7].socialRadius[5] = 8.556519852095686;             
            // force field for species 6:                                    
            this.species[7].collisionForce[6] = 0.8052379789535138;          
            this.species[7].collisionRadius[6] = 5.987009098728587;          
            this.species[7].socialForce[6] = -4.794163592099587;             
            this.species[7].socialRadius[6] = 14.453713899383832;            
            // force field for species 7:                                    
            this.species[7].collisionForce[7] = 0.9191851474821138;          
            this.species[7].collisionRadius[7] = 13.637615480817589;         
            this.species[7].socialForce[7] = -3.331025337624437;             
            this.species[7].socialRadius[7] = 25.766489665035905;            
            // force field for species 8:                                    
            this.species[7].collisionForce[8] = 1.2726216095870435;          
            this.species[7].collisionRadius[8] = 5.671729818419109;          
            this.species[7].socialForce[8] = 1.817632637815402;              
            this.species[7].socialRadius[8] = 43.160309308240606;            
            // force field for species 9:                                    
            this.species[7].collisionForce[9] = 0.5540455234968369;          
            this.species[7].collisionRadius[9] = 0.22318098417714483;        
            this.species[7].socialForce[9] = -1.266592204315895;             
            this.species[7].socialRadius[9] = 23.267246248985554;            
            // force field for species 10:                                   
            this.species[7].collisionForce[10] = 0.04530821472644764;        
            this.species[7].collisionRadius[10] = 10.246673081421465;        
            this.species[7].socialForce[10] = -4.5007856196759635;           
            this.species[7].socialRadius[10] = 32.07787386318321;            
            // species 8:                                              		
            this.species[8].steps = 4;                                       
            this.species[8].setColor( 226, 191, 241, 0.5424183513096572 );   
            // force field for species 0:                                    
            this.species[8].collisionForce[0] = 0.2657058501534215;          
            this.species[8].collisionRadius[0] = 5.948998695958954;          
            this.species[8].socialForce[0] = 0.44055356553402003;            
            this.species[8].socialRadius[0] = 47.04353436092107;             
            // force field for species 1:                                    
            this.species[8].collisionForce[1] = 0.15815933637679458;         
            this.species[8].collisionRadius[1] = 6.829690434614535;          
            this.species[8].socialForce[1] = 1.0017748711044554;             
            this.species[8].socialRadius[1] = 21.783885690745432;            
            // force field for species 2:                                    
            this.species[8].collisionForce[2] = 1.487723858762541;           
            this.species[8].collisionRadius[2] = 2.074176936727339;          
            this.species[8].socialForce[2] = -0.19428944391273095;           
            this.species[8].socialRadius[2] = 50.88436718657613;             
            // force field for species 3:                                    
            this.species[8].collisionForce[3] = 1.6322219767735753;          
            this.species[8].collisionRadius[3] = 2.7395113464201315;         
            this.species[8].socialForce[3] = -1.078623047320224;             
            this.species[8].socialRadius[3] = 63.014063711627095;            
            // force field for species 4:                                    
            this.species[8].collisionForce[4] = 1.5757491993713375;          
            this.species[8].collisionRadius[4] = 2.1920551148691025;         
            this.species[8].socialForce[4] = -0.8485841879782647;            
            this.species[8].socialRadius[4] = 36.66523266313288;             
            // force field for species 5:                                    
            this.species[8].collisionForce[5] = 1.9490560030561053;          
            this.species[8].collisionRadius[5] = 5.60707053442764;           
            this.species[8].socialForce[5] = 4.1348808077908;                
            this.species[8].socialRadius[5] = 46.6516870402038;              
            // force field for species 6:                                    
            this.species[8].collisionForce[6] = 0.9581450334435757;          
            this.species[8].collisionRadius[6] = 3.1273814477914463;         
            this.species[8].socialForce[6] = -3.0354523049610904;            
            this.species[8].socialRadius[6] = 58.17958085345967;             
            // force field for species 7:                                    
            this.species[8].collisionForce[7] = 0.6790395775410734;          
            this.species[8].collisionRadius[7] = 9.195346436775122;          
            this.species[8].socialForce[7] = 1.648428293983609;              
            this.species[8].socialRadius[7] = 10.18393078715344;             
            // force field for species 8:                                    
            this.species[8].collisionForce[8] = 1.8494133126330583;          
            this.species[8].collisionRadius[8] = 8.296276912763885;          
            this.species[8].socialForce[8] = 3.7945523435238044;             
            this.species[8].socialRadius[8] = 104.90528704419026;            
            // force field for species 9:                                    
            this.species[8].collisionForce[9] = 1.6216248801408168;          
            this.species[8].collisionRadius[9] = 11.09391106060082;          
            this.species[8].socialForce[9] = -4.831188199715871;             
            this.species[8].socialRadius[9] = 101.89879122517941;            
            // force field for species 10:                                   
            this.species[8].collisionForce[10] = 1.733412171351934;          
            this.species[8].collisionRadius[10] = 17.550001667744354;        
            this.species[8].socialForce[10] = -3.309109305825247;            
            this.species[8].socialRadius[10] = 67.63420205995757;            
            // species 9:                                              		
            this.species[9].steps = 0;                                       
            this.species[9].setColor( 124, 158, 174, 0.5367648014251035 );   
            // force field for species 0:                                    
            this.species[9].collisionForce[0] = 0.09568997984650163;         
            this.species[9].collisionRadius[0] = 1.3588763207200105;         
            this.species[9].socialForce[0] = 4.123937249382077;              
            this.species[9].socialRadius[0] = 89.46585381005343;             
            // force field for species 1:                                    
            this.species[9].collisionForce[1] = 1.404156003409674;           
            this.species[9].collisionRadius[1] = 19.137853899486515;         
            this.species[9].socialForce[1] = -4.789138465392616;             
            this.species[9].socialRadius[1] = 46.92728793126202;             
            // force field for species 2:                                    
            this.species[9].collisionForce[2] = 0.5004419638232631;          
            this.species[9].collisionRadius[2] = 15.423386108051393;         
            this.species[9].socialForce[2] = -2.439166258825687;             
            this.species[9].socialRadius[2] = 63.24976459152903;             
            // force field for species 3:                                    
            this.species[9].collisionForce[3] = 1.7732027967493202;          
            this.species[9].collisionRadius[3] = 4.052602825691361;          
            this.species[9].socialForce[3] = 2.8750923583949195;             
            this.species[9].socialRadius[3] = 14.231571480366375;            
            // force field for species 4:                                    
            this.species[9].collisionForce[4] = 0.3783440746024258;          
            this.species[9].collisionRadius[4] = 6.816069489441558;          
            this.species[9].socialForce[4] = -2.877722670307027;             
            this.species[9].socialRadius[4] = 67.93535881841214;             
            // force field for species 5:                                    
            this.species[9].collisionForce[5] = 1.2750554338624536;          
            this.species[9].collisionRadius[5] = 8.056046122187706;          
            this.species[9].socialForce[5] = -1.4264703479848984;            
            this.species[9].socialRadius[5] = 16.749914040126477;            
            // force field for species 6:                                    
            this.species[9].collisionForce[6] = 0.3951939208338646;          
            this.species[9].collisionRadius[6] = 12.149717140375738;         
            this.species[9].socialForce[6] = -4.076750570740943;             
            this.species[9].socialRadius[6] = 106.48302655590331;            
            // force field for species 7:                                    
            this.species[9].collisionForce[7] = 0.7772609342035799;          
            this.species[9].collisionRadius[7] = 5.109496987490898;          
            this.species[9].socialForce[7] = 2.2728426177882834;             
            this.species[9].socialRadius[7] = 19.732056413229788;            
            // force field for species 8:                                    
            this.species[9].collisionForce[8] = 1.7431362860155188;          
            this.species[9].collisionRadius[8] = 8.911777683919254;          
            this.species[9].socialForce[8] = -4.080816169004805;             
            this.species[9].socialRadius[8] = 19.92483154381223;             
            // force field for species 9:                                    
            this.species[9].collisionForce[9] = 0.9425113899002764;          
            this.species[9].collisionRadius[9] = 2.747105531922658;          
            this.species[9].socialForce[9] = -0.4592809120595689;            
            this.species[9].socialRadius[9] = 90.01721570239903;             
            // force field for species 10:                                   
            this.species[9].collisionForce[10] = 1.526765991811066;          
            this.species[9].collisionRadius[10] = 5.98264899338532;          
            this.species[9].socialForce[10] = -2.994256016093455;            
            this.species[9].socialRadius[10] = 69.2935355410442;             
            // species 10:                                              	
            this.species[10].steps = 0;                                      
            this.species[10].setColor( 66, 156, 222, 0.26247127443865337 );  
            // force field for species 0:                                    
            this.species[10].collisionForce[0] = 1.4748449637210752;         
            this.species[10].collisionRadius[0] = 0.20757514497868446;       
            this.species[10].socialForce[0] = -3.6058825809676556;           
            this.species[10].socialRadius[0] = 31.053867938635722;           
            // force field for species 1:                                    
            this.species[10].collisionForce[1] = 1.4817879357939354;         
            this.species[10].collisionRadius[1] = 10.123008907304595;        
            this.species[10].socialForce[1] = 1.976642554545399;             
            this.species[10].socialRadius[1] = 89.54198608407224;            
            // force field for species 2:                                    
            this.species[10].collisionForce[2] = 0.8560137824726073;         
            this.species[10].collisionRadius[2] = 11.713162811078949;        
            this.species[10].socialForce[2] = -1.7689040435985737;           
            this.species[10].socialRadius[2] = 104.19617246859099;           
            // force field for species 3:                                    
            this.species[10].collisionForce[3] = 1.5962179665166478;         
            this.species[10].collisionRadius[3] = 11.767635792969028;        
            this.species[10].socialForce[3] = -3.101569618070817;            
            this.species[10].socialRadius[3] = 65.75439170001087;            
            // force field for species 4:                                    
            this.species[10].collisionForce[4] = 1.4076032225730712;         
            this.species[10].collisionRadius[4] = 17.317302705279676;        
            this.species[10].socialForce[4] = -1.28330798658412;             
            this.species[10].socialRadius[4] = 25.38451366062761;            
            // force field for species 5:                                    
            this.species[10].collisionForce[5] = 1.7696443250246356;         
            this.species[10].collisionRadius[5] = 5.391222747951923;         
            this.species[10].socialForce[5] = 1.443019447093043;             
            this.species[10].socialRadius[5] = 70.44881729574244;            
            // force field for species 6:                                    
            this.species[10].collisionForce[6] = 0.5343416555997464;         
            this.species[10].collisionRadius[6] = 6.505728159592621;         
            this.species[10].socialForce[6] = -4.059778362018488;            
            this.species[10].socialRadius[6] = 97.94927764574611;            
            // force field for species 7:                                    
            this.species[10].collisionForce[7] = 1.5090204459723255;         
            this.species[10].collisionRadius[7] = 13.241334606356707;        
            this.species[10].socialForce[7] = -0.8937421390762363;           
            this.species[10].socialRadius[7] = 42.182820135202164;           
            // force field for species 8:                                    
            this.species[10].collisionForce[8] = 1.1057314935882048;         
            this.species[10].collisionRadius[8] = 8.875557410639203;         
            this.species[10].socialForce[8] = 4.946024276204202;             
            this.species[10].socialRadius[8] = 23.251313204074002;           
            // force field for species 9:                                    
            this.species[10].collisionForce[9] = 1.413865833292254;          
            this.species[10].collisionRadius[9] = 0.7021282140167973;        
            this.species[10].socialForce[9] = -2.9590787823481977;           
            this.species[10].socialRadius[9] = 3.6155870916314914;           
            // force field for species 10:                                   
            this.species[10].collisionForce[10] = 0.658417356988777;         
            this.species[10].collisionRadius[10] = 12.86271005166949;        
            this.species[10].socialForce[10] = 4.881884589187074;            
            this.species[10].socialRadius[10] = 85.39042421966893;           
            */





            /*
            this.numParticles = 1000;
            this.numSpecies = 6;
            this.initMode = INIT_MODE_FULL;		
            this.diskSize = 200.0;
    	
            for (let s=0; s<MAX_SPECIES; s++)
            {
                this.species[s].halo = false;
                this.species[s].steps = 0;
                this.species[s].averageForces = false;
                this.species[s].nonAverageForce = 0.01;
                this.species[s].friction = 0.1;
                                    	
                for (let f=0; f<MAX_SPECIES; f++)
                {
                    this.species[s].collisionForce 	[f] =  MIN_COLLISION_FORCE  + Math.random() * ( MAX_COLLISION_FORCE  - MIN_COLLISION_FORCE  );            
                    this.species[s].collisionRadius	[f] =  MIN_COLLISION_RADIUS + Math.random() * ( MAX_COLLISION_RADIUS - MIN_COLLISION_RADIUS );            
                    this.species[s].socialForce 	[f] = -MAX_SOCIAL_FORCE 	+ Math.random() *   MAX_SOCIAL_FORCE * 2.0;
                    this.species[s].socialRadius	[f] = this.species[s].collisionRadius[f] + MAX_SOCIAL_RADIUS * Math.random();
                    this.species[s].socialRamp		[f] = ( Math.random() > ONE_HALF );
                }	
            }

            this.randomizeSpeciesColors();	
            */

            //step test...
            /*
            this.numParticles = 7 + 80;
            this.numSpecies = 3;
            this.initMode = INIT_MODE_DEMO;		
            this.diskSize = 200.0;
        	
            this.species[0].setColor( 255,  50,   50, 1.0 ); 
            this.species[1].setColor( 255,  255,   0, 1.0 ); 
            this.species[2].setColor(  50,  100, 200, 1.0 ); 

            this.species[0].steps = 0;              
            this.species[1].steps = 0; 

            this.species[1].socialRamp		[0] = false;
            this.species[1].socialForce 	[0] = 0.1;    
            this.species[1].socialRadius	[0] = 120;     
            this.species[1].collisionForce	[0] = 1; 
            this.species[1].collisionRadius	[0] = 10;
        	
            this.species[1].socialRamp		[1] = false;
            this.species[1].socialForce 	[1] = -0.1;      
            this.species[1].socialRadius	[1] = 9.0;     
            this.species[1].collisionForce	[1] = 10.0;  
            this.species[1].collisionRadius	[1] = 9.0;  



            this.species[2].steps = 5; 
        	
            this.species[2].socialRamp		[0] = false;
            this.species[2].socialForce 	[0] = 0.1;      
            this.species[2].socialRadius	[0] = 180.0;     
            this.species[2].collisionForce	[0] = 1;  
            this.species[2].collisionRadius	[0] = 10.0;  

            this.species[2].socialRamp		[1] = false;
            this.species[2].socialForce 	[1] = -3;      
            this.species[2].socialRadius	[1] = 50.0;     
            this.species[2].collisionForce	[1] = 1;  
            this.species[2].collisionRadius	[1] = 10.0;  

            this.species[2].socialRamp		[2] = false;
            this.species[2].socialForce 	[2] = -0.4;      
            this.species[2].socialRadius	[2] = 10.0;     
            this.species[2].collisionForce	[2] = 0.9;  
            this.species[2].collisionRadius	[2] = 10.0;  
            */
        }

        //-----------------------------------------
        // Pollack
        //-----------------------------------------
        else if (e === ECO_POLLACK) {
            this.numSpecies = 12;
            this.numParticles = MAX_PARTICLES;
            this.blur = 1;

            for (let t = 0; t < this.numSpecies; t++) {
                this.species[t].setColor(100, 100, 100, 1.0);
            }

            this.species[0].setColor(70, 20, 0, 1.0); // red
            this.species[1].setColor(210, 205, 200, 1.0);
            this.species[2].setColor(255, 150, 100, 1.0); // orange
            this.species[3].setColor(200, 190, 160, 1.0);
            this.species[4].setColor(150, 140, 100, 1.0); // yellow
            this.species[5].setColor(210, 205, 200, 1.0);
            this.species[6].setColor(210, 205, 200, 1.0); // green
            this.species[7].setColor(80, 150, 150, 1.0);
            this.species[8].setColor(80, 80, 200, 1.0); // blue
            this.species[9].setColor(60, 40, 17, 1.0);
            this.species[10].setColor(210, 205, 200, 1.0); // violet
            this.species[11].setColor(20, 10, 10, 1.0);


            for (let t = 0; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].collisionForce[f] = 1.0;
                    this.species[t].collisionRadius[f] = 8.64;
                    this.species[t].socialForce[f] = -4.0 * 0.1;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }


            for (let t = 0; t < this.numSpecies; t++) {
                this.species[t].steps = 0;

                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].socialForce[f] = -4.0 * 0.2;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }

            let me = 4.0 * 0.2;
            let before = 4.0 * -0.5;
            let after = 4.0 * 0.5;

            for (let t = 0; t < this.numSpecies; t++) {
                let f0 = t - 1;
                let f1 = t;
                let f2 = t + 1;

                if (f0 < 0) { f0 = this.numSpecies - 1; }
                if (f2 > this.numSpecies - 1) { f2 = 0; }

                this.species[t].socialForce[f0] = before;
                this.species[t].socialForce[f1] = me;
                this.species[t].socialForce[f2] = after;
            }

            this.initMode = INIT_MODE_TOP;
        }
        /*
                //-----------------------------------------
                // Demo
                //-----------------------------------------
                else if ( e === ECO_DEMO   )
                {
        
        this.numParticles = 756;                            //1427:11
        this.numSpecies = 8;                            //1428:11
        this.initMode = 2;                            //1429:11
        this.diskSize = 5;                            //1430:11
        this.blur = 0.9;                            //1431:11
        this.scale = 1;                            //1432:11
        
        // species 0:                            //1436:12
        this.species[0].steps = 0;                            //1437:12
        this.species[0].setColor( 120, 147, 148, 0.9 );                            //1438:12
        // force field for species 0:                            //1442:13
        this.species[0].collisionForce[0] = 1.4881659668259348;                            //1443:13
        this.species[0].collisionRadius[0] = 7.3608461182764575;                            //1444:13
        this.species[0].socialForce[0] = 2.8888022479133424;                            //1445:13
        this.species[0].socialRadius[0] = 88.06790100981372;                            //1446:13
        
        // force field for species 1:                            //1442:13
        this.species[0].collisionForce[1] = 1.8937601222604323;                            //1443:13
        this.species[0].collisionRadius[1] = 1.7037179998886258;                            //1444:13
        this.species[0].socialForce[1] = 1.371234937007138;                            //1445:13
        this.species[0].socialRadius[1] = 42.00067383533892;                            //1446:13
        // force field for species 2:                            //1442:13
        this.species[0].collisionForce[2] = 1.6353964307767024;                            //1443:13
        this.species[0].collisionRadius[2] = 10.912750120624692;                            //1444:13
        this.species[0].socialForce[2] = 0.9306770520354792;                            //1445:13
        this.species[0].socialRadius[2] = 75.48870898513051;                            //1446:13
        // force field for species 3:                            //1442:13
        this.species[0].collisionForce[3] = 1.181337099229091;                            //1443:13
        this.species[0].collisionRadius[3] = 2.281985456210853;                            //1444:13
        this.species[0].socialForce[3] = -0.3542274311365281;                            //1445:13
        this.species[0].socialRadius[3] = 60.30844149253369;                            //1446:13
        // force field for species 4:                            //1442:13
        this.species[0].collisionForce[4] = 0.23847607971788554;                            //1443:13
        this.species[0].collisionRadius[4] = 1.4536940277443184;                            //1444:13
        this.species[0].socialForce[4] = -2.7472721270225997;                            //1445:13
        this.species[0].socialRadius[4] = 60.08179903165726;                            //1446:13
        // force field for species 5:                            //1442:13
        this.species[0].collisionForce[5] = 1.305600521461849;                            //1443:13
        this.species[0].collisionRadius[5] = 10.292570474006123;                            //1444:13
        this.species[0].socialForce[5] = 1.3726332213629977;                            //1445:13
        this.species[0].socialRadius[5] = 79.21758800471004;                            //1446:13
        // force field for species 6:                            //1442:13
        this.species[0].collisionForce[6] = 0.7226952726302573;                            //1443:13
        this.species[0].collisionRadius[6] = 10.310851544628225;                            //1444:13
        this.species[0].socialForce[6] = 1.6302786302431684;                            //1445:13
        this.species[0].socialRadius[6] = 77.8498180933793;                            //1446:13
        // force field for species 7:                            //1442:13
        this.species[0].collisionForce[7] = 1.2863128222696076;                            //1443:13
        this.species[0].collisionRadius[7] = 3.8072118752349224;                            //1444:13
        this.species[0].socialForce[7] = 0.9574509040430756;                            //1445:13
        this.species[0].socialRadius[7] = 48.098367921591766;                            //1446:13
        
        // species 1:                            //1436:12
        this.species[1].steps = 0;                            //1437:12
        this.species[1].setColor( 202, 174, 55, 0.7 );                            //1438:12
        // force field for species 0:                            //1442:13
        this.species[1].collisionForce[0] = 1.4296382145719295;                            //1443:13
        this.species[1].collisionRadius[0] = 4.398660218815467;                            //1444:13
        this.species[1].socialForce[0] = 2.095669313017039;                            //1445:13
        this.species[1].socialRadius[0] = 8.852308331922247;                            //1446:13
        // force field for species 1:                            //1442:13
        this.species[1].collisionForce[1] = 0.17490819768452015;                            //1443:13
        this.species[1].collisionRadius[1] = 10.388079677584745;                            //1444:13
        this.species[1].socialForce[1] = 1.1515891351782468;                            //1445:13
        this.species[1].socialRadius[1] = 26.645463884586903;                            //1446:13
        // force field for species 2:                            //1442:13
        this.species[1].collisionForce[2] = 1.7754118082824946;                            //1443:13
        this.species[1].collisionRadius[2] = 2.0089907650486722;                            //1444:13
        this.species[1].socialForce[2] = -0.880033951907655;                            //1445:13
        this.species[1].socialRadius[2] = 10.606896184301913;                            //1446:13
        // force field for species 3:                            //1442:13
        this.species[1].collisionForce[3] = 1.959109957158555;                            //1443:13
        this.species[1].collisionRadius[3] = 0.11464479561858104;                            //1444:13
        this.species[1].socialForce[3] = -2.314926459008107;                            //1445:13
        this.species[1].socialRadius[3] = 32.850134846501994;                            //1446:13
        // force field for species 4:                            //1442:13
        this.species[1].collisionForce[4] = 0.6684858613433983;                            //1443:13
        this.species[1].collisionRadius[4] = 4.320530777364068;                            //1444:13
        this.species[1].socialForce[4] = -1.1006449144169634;                            //1445:13
        this.species[1].socialRadius[4] = 35.54670983291372;                            //1446:13
        // force field for species 5:                            //1442:13
        this.species[1].collisionForce[5] = 0.36878508764959417;                            //1443:13
        this.species[1].collisionRadius[5] = 6.3917636666925395;                            //1444:13
        this.species[1].socialForce[5] = 0.6853927989327806;                            //1445:13
        this.species[1].socialRadius[5] = 49.19701458000206;                            //1446:13
        // force field for species 6:                            //1442:13
        this.species[1].collisionForce[6] = 0.15171496546824326;                            //1443:13
        this.species[1].collisionRadius[6] = 8.136561954052288;                            //1444:13
        this.species[1].socialForce[6] = 2.8028384961127424;                            //1445:13
        this.species[1].socialRadius[6] = 65.52419443866094;                            //1446:13
        // force field for species 7:                            //1442:13
        this.species[1].collisionForce[7] = 1.612721042041783;                            //1443:13
        this.species[1].collisionRadius[7] = 7.4630599695519315;                            //1444:13
        this.species[1].socialForce[7] = -0.21079694010987726;                            //1445:13
        this.species[1].socialRadius[7] = 75.71212567176117;                            //1446:13
        // species 2:                            //1436:12
        this.species[2].steps = 0;                            //1437:12
        this.species[2].setColor( 182, 252, 143, 0.6 );                            //1438:12
        // force field for species 0:                            //1442:13
        this.species[2].collisionForce[0] = 1.7664201160281463;                            //1443:13
        this.species[2].collisionRadius[0] = 11.360616280585553;                            //1444:13
        this.species[2].socialForce[0] = 2.4998828641336557;                            //1445:13
        this.species[2].socialRadius[0] = 28.940543007901955;                            //1446:13
        // force field for species 1:                            //1442:13
        this.species[2].collisionForce[1] = 0.34867563653439504;                            //1443:13
        this.species[2].collisionRadius[1] = 1.160532044781971;                            //1444:13
        this.species[2].socialForce[1] = 0.7484458023282174;                            //1445:13
        this.species[2].socialRadius[1] = 57.47448986651822;                            //1446:13
        // force field for species 2:                            //1442:13
        this.species[2].collisionForce[2] = 0.897760004655052;                            //1443:13
        this.species[2].collisionRadius[2] = 9.87959346897663;                            //1444:13
        this.species[2].socialForce[2] = 2.945697192252677;                            //1445:13
        this.species[2].socialRadius[2] = 20.961139541574667;                            //1446:13
        // force field for species 3:                            //1442:13
        this.species[2].collisionForce[3] = 1.7903408888090895;                            //1443:13
        this.species[2].collisionRadius[3] = 7.204010407429102;                            //1444:13
        this.species[2].socialForce[3] = 1.4392165122578957;                            //1445:13
        this.species[2].socialRadius[3] = 20.216098285585467;                            //1446:13
        // force field for species 4:                            //1442:13
        this.species[2].collisionForce[4] = 0.6724865282560353;                            //1443:13
        this.species[2].collisionRadius[4] = 0.9155105354102067;                            //1444:13
        this.species[2].socialForce[4] = -0.7774919138431491;                            //1445:13
        this.species[2].socialRadius[4] = 32.327768551000794;                            //1446:13
        // force field for species 5:                            //1442:13
        this.species[2].collisionForce[5] = 0.659656993565782;                            //1443:13
        this.species[2].collisionRadius[5] = 9.157807319643418;                            //1444:13
        this.species[2].socialForce[5] = -1.9663348981170259;                            //1445:13
        this.species[2].socialRadius[5] = 33.1370910038956;                            //1446:13
        // force field for species 6:                            //1442:13
        this.species[2].collisionForce[6] = 0.9849604641967488;                            //1443:13
        this.species[2].collisionRadius[6] = 8.691970277373596;                            //1444:13
        this.species[2].socialForce[6] = -2.6954236532915603;                            //1445:13
        this.species[2].socialRadius[6] = 40.89131381384023;                            //1446:13
        // force field for species 7:                            //1442:13
        this.species[2].collisionForce[7] = 0.03978924021842545;                            //1443:13
        this.species[2].collisionRadius[7] = 1.8853643760872092;                            //1444:13
        this.species[2].socialForce[7] = 2.592464737137422;                            //1445:13
        this.species[2].socialRadius[7] = 56.36576013853242;                            //1446:13
        // species 3:                            //1436:12
        this.species[3].steps = 0;                            //1437:12
        this.species[3].setColor( 65, 82, 118, 0.9155731482779885 );                            //1438:12
        // force field for species 0:                            //1442:13
        this.species[3].collisionForce[0] = 1.6974448863448919;                            //1443:13
        this.species[3].collisionRadius[0] = 7.358526963572995;                            //1444:13
        this.species[3].socialForce[0] = 3.6478279504462803;                            //1445:13
        this.species[3].socialRadius[0] = 19.03609190142811;                            //1446:13
        // force field for species 1:                            //1442:13
        this.species[3].collisionForce[1] = 0.022674075613572153;                            //1443:13
        this.species[3].collisionRadius[1] = 9.446606220166446;                            //1444:13
        this.species[3].socialForce[1] = -2.758067592621961;                            //1445:13
        this.species[3].socialRadius[1] = 11.227645151090183;                            //1446:13
        // force field for species 2:                            //1442:13
        this.species[3].collisionForce[2] = 0.8829855950509229;                            //1443:13
        this.species[3].collisionRadius[2] = 4.700044033514278;                            //1444:13
        this.species[3].socialForce[2] = -2.4763108613649756;                            //1445:13
        this.species[3].socialRadius[2] = 77.12028538959926;                            //1446:13
        // force field for species 3:                            //1442:13
        this.species[3].collisionForce[3] = 0.3194217370116841;                            //1443:13
        this.species[3].collisionRadius[3] = 7.46267474430458;                            //1444:13
        this.species[3].socialForce[3] = 1.4273451050601986;                            //1445:13
        this.species[3].socialRadius[3] = 86.82877089532687;                            //1446:13
        // force field for species 4:                            //1442:13
        this.species[3].collisionForce[4] = 0.2878993531710152;                            //1443:13
        this.species[3].collisionRadius[4] = 3.352446830373997;                            //1444:13
        this.species[3].socialForce[4] = 3.1598644067460464;                            //1445:13
        this.species[3].socialRadius[4] = 37.20533318428388;                            //1446:13
        // force field for species 5:                            //1442:13
        this.species[3].collisionForce[5] = 1.6426932639440945;                            //1443:13
        this.species[3].collisionRadius[5] = 8.484076507026678;                            //1444:13
        this.species[3].socialForce[5] = 2.626366979406246;                            //1445:13
        this.species[3].socialRadius[5] = 51.258594104060236;                            //1446:13
        // force field for species 6:                            //1442:13
        this.species[3].collisionForce[6] = 1.37879135066806;                            //1443:13
        this.species[3].collisionRadius[6] = 3.8270052866779856;                            //1444:13
        this.species[3].socialForce[6] = 0.8737992429703425;                            //1445:13
        this.species[3].socialRadius[6] = 32.18440684398675;                            //1446:13
        // force field for species 7:                            //1442:13
        this.species[3].collisionForce[7] = 0.8344029502466341;                            //1443:13
        this.species[3].collisionRadius[7] = 6.602905407275236;                            //1444:13
        this.species[3].socialForce[7] = -3.247931122287609;                            //1445:13
        this.species[3].socialRadius[7] = 56.18429497518558;                            //1446:13
        // species 4:                            //1436:12
        this.species[4].steps = 4;                            //1437:12
        this.species[4].setColor( 215, 151, 237, 0.6 );                            //1438:12
        // force field for species 0:                            //1442:13
        this.species[4].collisionForce[0] = 1.9841331671342042;                            //1443:13
        this.species[4].collisionRadius[0] = 10.825951720681832;                            //1444:13
        this.species[4].socialForce[0] = 2.9841376930592993;                            //1445:13
        this.species[4].socialRadius[0] = 67.49258915984517;                            //1446:13
        // force field for species 1:                            //1442:13
        this.species[4].collisionForce[1] = 1.0438206801836525;                            //1443:13
        this.species[4].collisionRadius[1] = 3.5982379936651787;                            //1444:13
        this.species[4].socialForce[1] = 3.638193507424348;                            //1445:13
        this.species[4].socialRadius[1] = 50.72205529827052;                            //1446:13
        // force field for species 2:                            //1442:13
        this.species[4].collisionForce[2] = 0.2732132408857557;                            //1443:13
        this.species[4].collisionRadius[2] = 5.075218606354632;                            //1444:13
        this.species[4].socialForce[2] = -2.6831885160884017;                            //1445:13
        this.species[4].socialRadius[2] = 15.547293541964653;                            //1446:13
        // force field for species 3:                            //1442:13
        this.species[4].collisionForce[3] = 0.3626379517752854;                            //1443:13
        this.species[4].collisionRadius[3] = 2.920801126854164;                            //1444:13
        this.species[4].socialForce[3] = 0.12039947871736523;                            //1445:13
        this.species[4].socialRadius[3] = 62.75829783967156;                            //1446:13
        // force field for species 4:                            //1442:13
        this.species[4].collisionForce[4] = 0.35831976812499233;                            //1443:13
        this.species[4].collisionRadius[4] = 2.781305364165567;                            //1444:13
        this.species[4].socialForce[4] = -1.6414156070086383;                            //1445:13
        this.species[4].socialRadius[4] = 72.57228805054302;                            //1446:13
        // force field for species 5:                            //1442:13
        this.species[4].collisionForce[5] = 0.5613384108297896;                            //1443:13
        this.species[4].collisionRadius[5] = 0.2557389764821343;                            //1444:13
        this.species[4].socialForce[5] = 2.4322727706031246;                            //1445:13
        this.species[4].socialRadius[5] = 22.907324328696856;                            //1446:13
        // force field for species 6:                            //1442:13
        this.species[4].collisionForce[6] = 1.153111446635339;                            //1443:13
        this.species[4].collisionRadius[6] = 5.254572392402395;                            //1444:13
        this.species[4].socialForce[6] = -0.3302931215789915;                            //1445:13
        this.species[4].socialRadius[6] = 19.69951126694538;                            //1446:13
        // force field for species 7:                            //1442:13
        this.species[4].collisionForce[7] = 0.6217214196913763;                            //1443:13
        this.species[4].collisionRadius[7] = 2.5885547420542783;                            //1444:13
        this.species[4].socialForce[7] = -0.8523049254884425;                            //1445:13
        this.species[4].socialRadius[7] = 20.916213526757303;                            //1446:13
        // species 5:                            //1436:12
        this.species[5].steps = 0;                            //1437:12
        this.species[5].setColor( 149, 224, 208, 0.3 );                            //1438:12
        // force field for species 0:                            //1442:13
        this.species[5].collisionForce[0] = 1.8431772577115915;                            //1443:13
        this.species[5].collisionRadius[0] = 11.55929426738059;                            //1444:13
        this.species[5].socialForce[0] = -0.24249840625128316;                            //1445:13
        this.species[5].socialRadius[0] = 91.49377814156274;                            //1446:13
        // force field for species 1:                            //1442:13
        this.species[5].collisionForce[1] = 0.2603647800048521;                            //1443:13
        this.species[5].collisionRadius[1] = 9.304179466921145;                            //1444:13
        this.species[5].socialForce[1] = -0.5357545737492933;                            //1445:13
        this.species[5].socialRadius[1] = 66.27734932376538;                            //1446:13
        // force field for species 2:                            //1442:13
        this.species[5].collisionForce[2] = 0.6650051090370124;                            //1443:13
        this.species[5].collisionRadius[2] = 8.95334258532283;                            //1444:13
        this.species[5].socialForce[2] = 1.8423316026848804;                            //1445:13
        this.species[5].socialRadius[2] = 87.1759570424815;                            //1446:13
        // force field for species 3:                            //1442:13
        this.species[5].collisionForce[3] = 0.7994594697851494;                            //1443:13
        this.species[5].collisionRadius[3] = 11.088791269375154;                            //1444:13
        this.species[5].socialForce[3] = -2.5644277446912938;                            //1445:13
        this.species[5].socialRadius[3] = 56.88120921230259;                            //1446:13
        // force field for species 4:                            //1442:13
        this.species[5].collisionForce[4] = 1.8121634969843885;                            //1443:13
        this.species[5].collisionRadius[4] = 3.958708214662829;                            //1444:13
        this.species[5].socialForce[4] = -1.7889854130195735;                            //1445:13
        this.species[5].socialRadius[4] = 76.49744498789961;                            //1446:13
        // force field for species 5:                            //1442:13
        this.species[5].collisionForce[5] = 1.0937336222935121;                            //1443:13
        this.species[5].collisionRadius[5] = 8.954961314179046;                            //1444:13
        this.species[5].socialForce[5] = 1.7054205336977128;                            //1445:13
        this.species[5].socialRadius[5] = 69.5268652212563;                            //1446:13
        // force field for species 6:                            //1442:13
        this.species[5].collisionForce[6] = 0.7810037342230354;                            //1443:13
        this.species[5].collisionRadius[6] = 1.5689373703376046;                            //1444:13
        this.species[5].socialForce[6] = -0.18022987670590673;                            //1445:13
        this.species[5].socialRadius[6] = 52.626828583431966;                            //1446:13
        // force field for species 7:                            //1442:13
        this.species[5].collisionForce[7] = 0.3737322258763027;                            //1443:13
        this.species[5].collisionRadius[7] = 8.740750876948903;                            //1444:13
        this.species[5].socialForce[7] = 3.8900123969913363;                            //1445:13
        this.species[5].socialRadius[7] = 31.43878259760163;                            //1446:13
        // species 6:                            //1436:12
        this.species[6].steps = 3;                            //1437:12
        this.species[6].setColor( 112, 199, 195, 0.7 );                            //1438:12
        // force field for species 0:                            //1442:13
        this.species[6].collisionForce[0] = 0.42250777697852926;                            //1443:13
        this.species[6].collisionRadius[0] = 5.443214950556166;                            //1444:13
        this.species[6].socialForce[0] = 2.6832781367642333;                            //1445:13
        this.species[6].socialRadius[0] = 5.503557218877432;                            //1446:13
        // force field for species 1:                            //1442:13
        this.species[6].collisionForce[1] = 1.360460618856458;                            //1443:13
        this.species[6].collisionRadius[1] = 3.011480824651409;                            //1444:13
        this.species[6].socialForce[1] = -3.332398967892257;                            //1445:13
        this.species[6].socialRadius[1] = 79.65168085029993;                            //1446:13
        // force field for species 2:                            //1442:13
        this.species[6].collisionForce[2] = 0.7359845698250647;                            //1443:13
        this.species[6].collisionRadius[2] = 6.416946082486528;                            //1444:13
        this.species[6].socialForce[2] = -2.3817095928880017;                            //1445:13
        this.species[6].socialRadius[2] = 40.88298524661871;                            //1446:13
        // force field for species 3:                            //1442:13
        this.species[6].collisionForce[3] = 1.3662460021279932;                            //1443:13
        this.species[6].collisionRadius[3] = 11.168198623338373;                            //1444:13
        this.species[6].socialForce[3] = 3.815197804570678;                            //1445:13
        this.species[6].socialRadius[3] = 12.07666069778574;                            //1446:13
        // force field for species 4:                            //1442:13
        this.species[6].collisionForce[4] = 0.2356363344300738;                            //1443:13
        this.species[6].collisionRadius[4] = 11.340835031789366;                            //1444:13
        this.species[6].socialForce[4] = 0.19449956003682622;                            //1445:13
        this.species[6].socialRadius[4] = 37.991189977628125;                            //1446:13
        // force field for species 5:                            //1442:13
        this.species[6].collisionForce[5] = 0.9820749215458493;                            //1443:13
        this.species[6].collisionRadius[5] = 1.192340920802745;                            //1444:13
        this.species[6].socialForce[5] = 3.154279931780356;                            //1445:13
        this.species[6].socialRadius[5] = 7.2472678023830985;                            //1446:13
        // force field for species 6:                            //1442:13
        this.species[6].collisionForce[6] = 0.8931650936868019;                            //1443:13
        this.species[6].collisionRadius[6] = 8.819004907495946;                            //1444:13
        this.species[6].socialForce[6] = 3.807388998304468;                            //1445:13
        this.species[6].socialRadius[6] = 54.94649316320363;                            //1446:13
        // force field for species 7:                            //1442:13
        this.species[6].collisionForce[7] = 1.806364000994846;                            //1443:13
        this.species[6].collisionRadius[7] = 4.495844446308265;                            //1444:13
        this.species[6].socialForce[7] = -2.2117657881907684;                            //1445:13
        this.species[6].socialRadius[7] = 9.150497436966074;                            //1446:13
        // species 7:                            //1436:12
        this.species[7].steps = 5;                            //1437:12
        this.species[7].setColor( 195, 230, 149, 0.4 );                            //1438:12
        // force field for species 0:                            //1442:13
        this.species[7].collisionForce[0] = 0.006359587717990944;                            //1443:13
        this.species[7].collisionRadius[0] = 3.987779071114797;                            //1444:13
        this.species[7].socialForce[0] = -2.252814801508503;                            //1445:13
        this.species[7].socialRadius[0] = 81.77403093000136;                            //1446:13
        // force field for species 1:                            //1442:13
        this.species[7].collisionForce[1] = 0.2729901782623245;                            //1443:13
        this.species[7].collisionRadius[1] = 5.1473470117838875;                            //1444:13
        this.species[7].socialForce[1] = -1.7884224893328904;                            //1445:13
        this.species[7].socialRadius[1] = 10.653833227848132;                            //1446:13
        // force field for species 2:                            //1442:13
        this.species[7].collisionForce[2] = 1.8682928651473973;                            //1443:13
        this.species[7].collisionRadius[2] = 3.56425006220434;                            //1444:13
        this.species[7].socialForce[2] = -2.943128478317697;                            //1445:13
        this.species[7].socialRadius[2] = 7.031919924697181;                            //1446:13
        // force field for species 3:                            //1442:13
        this.species[7].collisionForce[3] = 1.485895810009017;                            //1443:13
        this.species[7].collisionRadius[3] = 2.521747428524897;                            //1444:13
        this.species[7].socialForce[3] = 2.2747513497350322;                            //1445:13
        this.species[7].socialRadius[3] = 39.62655907442043;                            //1446:13
        // force field for species 4:                            //1442:13
        this.species[7].collisionForce[4] = 0.021641221071298566;                            //1443:13
        this.species[7].collisionRadius[4] = 3.813159537129584;                            //1444:13
        this.species[7].socialForce[4] = -3.742255892322455;                            //1445:13
        this.species[7].socialRadius[4] = 44.58884377222475;                            //1446:13
        // force field for species 5:                            //1442:13
        this.species[7].collisionForce[5] = 0.20605739337456763;                            //1443:13
        this.species[7].collisionRadius[5] = 4.926263292595135;                            //1444:13
        this.species[7].socialForce[5] = 1.3886826340874237;                            //1445:13
        this.species[7].socialRadius[5] = 11.869654069239653;                            //1446:13
        // force field for species 6:                            //1442:13
        this.species[7].collisionForce[6] = 0.22686292698489718;                            //1443:13
        this.species[7].collisionRadius[6] = 10.050888723650448;                            //1444:13
        this.species[7].socialForce[6] = 2.4038862306133986;                            //1445:13
        this.species[7].socialRadius[6] = 62.441470044250494;                            //1446:13
        // force field for species 7:                            //1442:13
        this.species[7].collisionForce[7] = 0.28269011008044076;                            //1443:13
        this.species[7].collisionRadius[7] = 5.951699903507587;                            //1444:13
        this.species[7].socialForce[7] = -0.34160019030913436;                            //1445:13
        this.species[7].socialRadius[7] = 7.546012140687461;                            //1446:13
                }
                */
        //-----------------------------------------
        // Simplify
        //-----------------------------------------
        else if (e === ECO_SIMPLIFY) {
            this.numParticles = MAX_PARTICLES;
            this.numSpecies = 3;
            this.initMode = INIT_MODE_FULL;
            this.diskSize = 400;
            this.blur = 0.8;
            this.scale = 1;

            for (let s = 0; s < MAX_SPECIES; s++) {
                //this.species[s].setColor( 150, 150, 150, 0.2 );
                this.species[s].steps = 0;
                this.species[s].halo = 0;

                for (let f = 0; f < MAX_SPECIES; f++) {
                    this.species[s].collisionForce[f] = 0.0;
                    this.species[s].collisionRadius[f] = 200.0;
                    this.species[s].socialForce[f] = 0.001;
                    this.species[s].socialRadius[f] = 500;
                }
            }

            this.randomizeSpeciesColors();

            this.species[0].setColor(150, 70, 50, 0.8);
            this.species[1].setColor(150, 200, 80, 0.8);
            this.species[2].setColor(100, 60, 200, 0.8);


            let selfCF = 0.2;
            let selfCR = 20;
            let selfSF = 0.5;
            let selfSR = 200.0;

            let otherCF = 0.5;
            let otherCR = 80.0;
            let otherSF = 0.3;
            let otherSR = 300;


            for (let s = 0; s < MAX_SPECIES; s++) {
                for (let f = 0; f < MAX_SPECIES; f++) {
                    if (s === f) {
                        this.species[s].collisionForce[f] = selfCF;
                        this.species[s].collisionRadius[f] = selfCR;
                        this.species[s].socialForce[f] = selfSF;
                        this.species[s].socialRadius[f] = selfSR;
                    }
                    else {
                        this.species[s].collisionForce[f] = otherCF;
                        this.species[s].collisionRadius[f] = otherCR;
                        this.species[s].socialForce[f] = otherSF;
                        this.species[s].socialRadius[f] = otherSR;
                    }
                }
            }

            /*
            this.species[0].collisionForce	[0] = selfCF;
            this.species[0].collisionRadius	[0] = selfCR;
            this.species[0].socialForce		[0] = selfSF;
            this.species[0].socialRadius	[0] = selfSR; 

            this.species[1].collisionForce	[1] = selfCF;
            this.species[1].collisionRadius	[1] = selfCR;
            this.species[1].socialForce		[1] = selfSF;
            this.species[1].socialRadius	[1] = selfSR; 
        	
            this.species[2].collisionForce	[2] = selfCF;
            this.species[2].collisionRadius	[2] = selfCR;
            this.species[2].socialForce		[2] = selfSF;
            this.species[2].socialRadius	[2] = selfSR; 
            */

            /*
            ///glue buddies		
            this.species[3].steps = 4; 
            this.species[3].halo = 1; 
            this.species[3].setColor( 100, 50, 50, 0.8 );

            this.species[3].collisionForce	[0] = 1.0;
            this.species[3].collisionRadius	[0] = 20.0;
            this.species[3].socialForce		[0] = 1.0;
            this.species[3].socialRadius	[0] = 100.0; 
        	
            this.species[3].collisionForce	[3] = 1.0;
            this.species[3].collisionRadius	[3] = 20.0;
            this.species[3].socialForce		[3] = 1.0;
            this.species[3].socialRadius	[3] = 50.0; 
        	
            this.species[3].collisionForce	[4] = 2.0;
            this.species[3].collisionRadius	[4] = 100.0;
            this.species[3].socialForce		[4] = -2.0;
            this.species[3].socialRadius	[4] = 50.0; 
        	
            this.species[3].collisionForce	[5] = 2.0;
            this.species[3].collisionRadius	[5] = 100.0;
            this.species[3].socialForce		[5] = -2.0;
            this.species[3].socialRadius	[5] = 50.0; 
        	
            this.species[4].steps = 4; 
            this.species[4].halo = 1; 
            this.species[4].setColor( 50, 100, 50, 0.8 );

            this.species[4].collisionForce	[1] = 1.0;
            this.species[4].collisionRadius	[1] = 20.0;
            this.species[4].socialForce		[1] = 1.0;
            this.species[4].socialRadius	[1] = 100.0; 

            this.species[4].collisionForce	[3] = 2.0;
            this.species[4].collisionRadius	[3] = 100.0;
            this.species[4].socialForce		[3] = -2.0;
            this.species[4].socialRadius	[3] = 50.0; 
        	
            this.species[4].collisionForce	[4] = 1.0;
            this.species[4].collisionRadius	[4] = 20.0;
            this.species[4].socialForce		[4] = 1.0;
            this.species[4].socialRadius	[4] = 50.0; 
        	
            this.species[4].collisionForce	[5] = 1.0;
            this.species[4].collisionRadius	[5] = 20.0;
            this.species[4].socialForce		[5] = 1.0;
            this.species[4].socialRadius	[5] = 50.0; 
        	
            this.species[5].steps = 4; 
            this.species[5].halo = 1; 
            this.species[5].setColor( 50, 50, 100, 0.8 );

            this.species[5].collisionForce	[2] = 1.0;
            this.species[5].collisionRadius	[2] = 20.0;
            this.species[5].socialForce		[2] = 1.0;
            this.species[5].socialRadius	[2] = 100.0; 

            this.species[5].collisionForce	[5] = 1.0;
            this.species[5].collisionRadius	[5] = 20.0;
            this.species[5].socialForce		[5] = 1.0;
            this.species[5].socialRadius	[5] = 50.0; 
            */
        }
        //-----------------------------------------
        // Purple
        //-----------------------------------------
        else if (e === ECO_PURPLE) {
            for (let t = 0; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].collisionForce[f] = 1.0;
                    this.species[t].collisionRadius[f] = 8.64;
                    this.species[t].socialForce[f] = -4.0 * 0.1;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }

            this.numParticles = MAX_PARTICLES; //1516:11
            this.numSpecies = 2;//3; //1517:11
            this.initMode = 0; //1518:11
            this.diskSize = 40; //1519:11
            this.blur = 0.9; //1520:11
            this.scale = 1; //1521:11
            // species 0: //1525:12
            this.species[0].steps = 0; //1526:12
            this.species[0].halo = 0; //1526:12
            this.species[0].setColor(232, 231, 62, 0.5);
            // force field for species 0: //1531:13
            this.species[0].collisionForce[0] = 0.2456388529151845; //1532:13
            this.species[0].collisionRadius[0] = 3.1298788652029006; //1533:13
            this.species[0].socialForce[0] = 2.7742121784826965; //1534:13
            this.species[0].socialRadius[0] = 61.84255798045096; //1535:13
            // force field for species 1: //1531:13
            this.species[0].collisionForce[1] = 1.8847939251882317; //1532:13
            this.species[0].collisionRadius[1] = 11.466280325834706; //1533:13
            this.species[0].socialForce[1] = -0.5593978530532642; //1534:13
            this.species[0].socialRadius[1] = 53.29011192416681; //1535:13
            // force field for species 2: //1531:13
            this.species[0].collisionForce[2] = 1.9295824017538348; //1532:13
            this.species[0].collisionRadius[2] = 7.986320421870451; //1533:13
            this.species[0].socialForce[2] = -3.5920587025357733; //1534:13
            this.species[0].socialRadius[2] = 13.279057433892575; //1535:13
            // species 1: //1525:12
            this.species[1].steps = 2; //1526:12
            this.species[1].halo = 1; //1526:12
            this.species[1].setColor(160, 59, 229, 0.6);
            // force field for species 0: //1531:13
            this.species[1].collisionForce[0] = 1.360127701275812; //1532:13
            this.species[1].collisionRadius[0] = 6.283256392503164; //1533:13
            this.species[1].socialForce[0] = 3.2967553169706694; //1534:13
            this.species[1].socialRadius[0] = 77.38057989345845; //1535:13
            // force field for species 1: //1531:13
            this.species[1].collisionForce[1] = 1.8229897992337158; //1532:13
            this.species[1].collisionRadius[1] = 5.847848852306933; //1533:13
            this.species[1].socialForce[1] = -3.748120264414312; //1534:13
            this.species[1].socialRadius[1] = 6.188722840850666; //1535:13
            // force field for species 2: //1531:13
            this.species[1].collisionForce[2] = 0.2657997103546288; //1532:13
            this.species[1].collisionRadius[2] = 6.983852462091473; //1533:13
            this.species[1].socialForce[2] = 2.4238901119658696; //1534:13
            this.species[1].socialRadius[2] = 9.4555183239787; //1535:13
            // species 2: //1525:12
            this.species[2].steps = 0; //1526:12
            this.species[2].setColor(108, 72, 123, 0.46789403380982353);
            // force field for species 0: //1531:13
            this.species[2].collisionForce[0] = 0.8671317655797385; //1532:13
            this.species[2].collisionRadius[0] = 9.827975910812176; //1533:13
            this.species[2].socialForce[0] = 2.5476532966702674; //1534:13
            this.species[2].socialRadius[0] = 31.57268698742847; //1535:13
            // force field for species 1: //1531:13
            this.species[2].collisionForce[1] = 0.6291900967525064; //1532:13
            this.species[2].collisionRadius[1] = 5.633431348788299; //1533:13
            this.species[2].socialForce[1] = -0.8663175004510815; //1534:13
            this.species[2].socialRadius[1] = 25.557512609612946; //1535:13
            // force field for species 2: //1531:13
            this.species[2].collisionForce[2] = 0.5245617503202009; //1532:13
            this.species[2].collisionRadius[2] = 0.7668184882594402; //1533:13
            this.species[2].socialForce[2] = 2.576513601050621; //1534:13
            this.species[2].socialRadius[2] = 51.38641653089981; //1535:13
        }
        //-----------------------------------------
        // Gems
        //-----------------------------------------
        else if (e === ECO_GEMS) {
            this.numSpecies = 12;
            this.numParticles = MAX_PARTICLES;

            for (let t = 0; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].collisionForce[f] = 1.0;
                    this.species[t].collisionRadius[f] = 8.64;
                    this.species[t].socialForce[f] = -4.0 * 0.1;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }



            for (let t = 0; t < this.numSpecies; t++) {
                this.species[t].halo = false;//true;

                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].socialForce[f] = -2.0;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }

            for (let s = 0; s < this.numSpecies; s++) {
                this.species[s].setColor(70, 70, 70, 1.0);
            }

            this.species[0].setColor(70, 70, 170, 1.0);
            this.species[1].setColor(100, 70, 210, 1.0);
            this.species[2].setColor(100, 60, 250, 1.0);
            this.species[3].setColor(150, 160, 230, 1.0);
            this.species[4].setColor(100, 50, 30, 1.0);
            this.species[5].setColor(100, 230, 200, 1.0);
            this.species[5].setColor(100, 0, 0, 1.0);
            this.species[6].setColor(100, 40, 30, 1.0);
            this.species[6].setColor(130, 70, 30, 1.0);
            this.species[7].setColor(130, 120, 120, 1.0);

            //orange
            this.species[1].socialForce[1] = -3.290671030059457;
            this.species[1].socialRadius[1] = 42.49002040922642;
            this.species[1].socialForce[4] = -1.2598434370011091;
            this.species[1].socialRadius[4] = 63.842149429023266;
            this.species[1].socialForce[5] = 2.578464737161994;
            this.species[1].socialRadius[5] = 63.114551432430744;

            //blue
            this.species[4].socialForce[1] = -1.1081697009503841;
            this.species[4].socialRadius[1] = 33.84286079183221;
            this.species[4].socialForce[4] = 0.526039507240057;
            this.species[4].socialRadius[4] = 18.11127431318164;
            this.species[4].socialForce[5] = 3.9443997144699097;
            this.species[4].socialRadius[5] = 48.21247752383351;

            //purple
            this.species[5].socialForce[1] = 2.3572729844599962;
            this.species[5].socialRadius[1] = 76.98223288729787;
            this.species[5].socialForce[4] = -2.956161877140403;
            this.species[5].socialRadius[4] = 66.31004854664207;
            this.species[5].socialForce[5] = 2.6210244055837393;
            this.species[5].socialRadius[5] = 59.6334382481873;

            //red
            this.species[0].socialForce[0] = -3.290671030059457;
            this.species[0].socialRadius[0] = 42.49002040922642;
            this.species[0].socialForce[3] = -1.2598434370011091;
            this.species[0].socialRadius[3] = 63.842149429023266;
            this.species[0].socialForce[2] = 2.578464737161994;
            this.species[0].socialRadius[2] = 63.114551432430744;

            //green
            this.species[3].socialForce[0] = -1.1081697009503841;
            this.species[3].socialRadius[0] = 33.84286079183221;
            this.species[3].socialForce[3] = 0.526039507240057;
            this.species[3].socialRadius[3] = 18.11127431318164;
            this.species[3].socialForce[2] = 3.9443997144699097;
            this.species[3].socialRadius[2] = 48.21247752383351;

            //yellow
            this.species[2].socialForce[0] = 2.3572729844599962;
            this.species[2].socialRadius[0] = 76.98223288729787;
            this.species[2].socialForce[3] = -2.956161877140403;
            this.species[2].socialRadius[3] = 66.31004854664207;
            this.species[2].socialForce[2] = 2.6210244055837393;
            this.species[2].socialRadius[2] = 59.6334382481873;

            this.initMode = INIT_MODE_BOTTOM;
        }
        //-----------------------------------------
        // Planets
        //-----------------------------------------
        else if (e === ECO_PLANETS) {
            this.numParticles = MAX_PARTICLES;
            this.numSpecies = 12;


            for (let t = 0; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].collisionForce[f] = 1.0;
                    this.species[t].collisionRadius[f] = 8.64;
                    this.species[t].socialForce[f] = -4.0 * 0.1;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }


            for (let t = 0; t < this.numSpecies; t++) {
                for (let f = 0; f < this.numSpecies; f++) {
                    this.species[t].socialForce[f] = -1.0;
                    this.species[t].socialRadius[f] = 81.0 * 0.5;
                }
            }

            this.species[0].setColor(200, 130, 130, 1.0);
            this.species[1].setColor(200, 250, 130, 1.0);
            this.species[2].setColor(200, 200, 130, 1.0);
            this.species[3].setColor(130, 190, 130, 1.0);
            this.species[4].setColor(170, 170, 210, 1.0);
            this.species[5].setColor(130, 140, 170, 1.0);
            this.species[6].setColor(110, 130, 130, 1.0);
            this.species[7].setColor(110, 180, 130, 1.0);
            this.species[8].setColor(120, 120, 150, 1.0);
            this.species[9].setColor(130, 100, 130, 1.0);
            this.species[10].setColor(130, 130, 160, 1.0);
            this.species[11].setColor(100, 130, 130, 1.0);

            let f = 1.0;
            let r = 50.0;

            let i = 0;
            let j = 0;

            i = 0; j = 6; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 0; j = 7; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 0; j = 1; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 1; j = 6; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 1; j = 7; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 6; j = 7; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);

            i = 2; j = 8; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 2; j = 9; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 2; j = 3; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 3; j = 8; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 3; j = 9; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 8; j = 9; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);

            i = 4; j = 10; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 4; j = 11; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 4; j = 5; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 5; j = 10; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 5; j = 11; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);
            i = 10; j = 11; this.setPlanetValues(i, j, f, r); this.setPlanetValues(j, i, f, r);

            this.diskSize = 130.0;
            this.initMode = INIT_MODE_DISK;
        }
        //-----------------------------------------
        // Acrobats
        //-----------------------------------------
        else if (e === ECO_ACROBATS) {
            this.species[0].setColor(255, 130, 130, 1.0);
            this.species[1].setColor(200, 150, 30, 1.0);
            this.species[2].setColor(200, 200, 30, 1.0);
            this.species[3].setColor(30, 100, 30, 1.0);
            this.species[4].setColor(70, 70, 210, 1.0);
            this.species[5].setColor(100, 80, 150, 1.0);
            this.species[6].setColor(110, 30, 30, 1.0);
            this.species[7].setColor(110, 80, 30, 1.0);
            this.species[8].setColor(120, 120, 50, 1.0);
            this.species[9].setColor(30, 100, 30, 1.0);
            this.species[10].setColor(130, 130, 160, 1.0);
            this.species[11].setColor(100, 30, 130, 1.0);



            this.initMode = INIT_MODE_FULL;
            this.numParticles = MAX_PARTICLES;
            this.numSpecies = 12;

            this.species[0].socialForce[0] = -1.5508803074180229;
            this.species[0].socialRadius[0] = 67.39870606440391;
            this.species[0].socialForce[1] = 3.531817763582824;
            this.species[0].socialRadius[1] = 27.965232121066215;
            this.species[0].socialForce[2] = -2.9919035578897333;
            this.species[0].socialRadius[2] = 10.438678512701594;
            this.species[0].socialForce[3] = -3.8794564810173178;
            this.species[0].socialRadius[3] = 22.65486638779329;
            this.species[0].socialForce[4] = 2.5954984826704823;
            this.species[0].socialRadius[4] = 60.22401393986497;
            this.species[0].socialForce[5] = 1.3760776294881119;
            this.species[0].socialRadius[5] = 4.845826513992259;
            this.species[0].socialForce[6] = -2.9816940192692893;
            this.species[0].socialRadius[6] = 29.370149467449814;
            this.species[0].socialForce[7] = -1.45395165216312;
            this.species[0].socialRadius[7] = 48.338890718007626;
            this.species[0].socialForce[8] = 2.757049039564828;
            this.species[0].socialRadius[8] = 42.58464017605024;
            this.species[0].socialForce[9] = 3.4908970835132127;
            this.species[0].socialRadius[9] = 64.36448967277636;
            this.species[0].socialForce[10] = -0.24931194857345496;
            this.species[0].socialRadius[10] = 58.32672888381189;
            this.species[0].socialForce[11] = 1.2186156126592262;
            this.species[0].socialRadius[11] = 71.01087918959422;
            this.species[0].steps = 0;
            this.species[1].socialForce[0] = 3.674318534735148;
            this.species[1].socialRadius[0] = 24.841108716472515;
            this.species[1].socialForce[1] = 3.1508842519689413;
            this.species[1].socialRadius[1] = 72.60388969661699;
            this.species[1].socialForce[2] = -3.6529130461313883;
            this.species[1].socialRadius[2] = 39.06133978399006;
            this.species[1].socialForce[3] = 2.4141718235322926;
            this.species[1].socialRadius[3] = 11.004824340092515;
            this.species[1].socialForce[4] = 1.6574672176974676;
            this.species[1].socialRadius[4] = 56.446196037025175;
            this.species[1].socialForce[5] = -1.586790781249329;
            this.species[1].socialRadius[5] = 7.6602382534441436;
            this.species[1].socialForce[6] = -0.7930895186724403;
            this.species[1].socialRadius[6] = 25.662906868391964;
            this.species[1].socialForce[7] = -0.8069300396381909;
            this.species[1].socialRadius[7] = 68.09663113073869;
            this.species[1].socialForce[8] = -2.1849782173169885;
            this.species[1].socialRadius[8] = 70.23956881737872;
            this.species[1].socialForce[9] = 2.4217882932185617;
            this.species[1].socialRadius[9] = 45.09886136790743;
            this.species[1].socialForce[10] = -2.9541964866025108;
            this.species[1].socialRadius[10] = 57.70036651488808;
            this.species[1].socialForce[11] = 0.22365393347203444;
            this.species[1].socialRadius[11] = 72.36404160742227;
            this.species[1].steps = 2;
            this.species[2].socialForce[0] = 3.7041673121665433;
            this.species[2].socialRadius[0] = 4.1210748468940475;
            this.species[2].socialForce[1] = -0.6541684914961721;
            this.species[2].socialRadius[1] = 33.73145094814303;
            this.species[2].socialForce[2] = 2.3631965877408323;
            this.species[2].socialRadius[2] = 27.16253170320861;
            this.species[2].socialForce[3] = 0.8114009328501393;
            this.species[2].socialRadius[3] = 46.81021502836751;
            this.species[2].socialForce[4] = 2.202893016939555;
            this.species[2].socialRadius[4] = 35.03742299450543;
            this.species[2].socialForce[5] = 2.517458155421073;
            this.species[2].socialRadius[5] = 72.12750006981254;
            this.species[2].socialForce[6] = -2.6137628373526134;
            this.species[2].socialRadius[6] = 29.183710600826977;
            this.species[2].socialForce[7] = -1.944036326503463;
            this.species[2].socialRadius[7] = 66.2336536871824;
            this.species[2].socialForce[8] = 3.105170500843009;
            this.species[2].socialRadius[8] = 16.541664627550116;
            this.species[2].socialForce[9] = -2.8487102738052315;
            this.species[2].socialRadius[9] = 31.874293994272833;
            this.species[2].socialForce[10] = 2.405701204108299;
            this.species[2].socialRadius[10] = 20.896340478471696;
            this.species[2].socialForce[11] = -1.9872104514725901;
            this.species[2].socialRadius[11] = 64.25949861656403;
            this.species[2].steps = 0;
            this.species[3].socialForce[0] = -3.5327047147422377;
            this.species[3].socialRadius[0] = 42.094533363233246;
            this.species[3].socialForce[1] = 3.304651900052786;
            this.species[3].socialRadius[1] = 53.55639630115912;
            this.species[3].socialForce[2] = -3.346447197985178;
            this.species[3].socialRadius[2] = 26.711798211170233;
            this.species[3].socialForce[3] = -2.8623431373372714;
            this.species[3].socialRadius[3] = 36.29856591118049;
            this.species[3].socialForce[4] = 3.928523458227076;
            this.species[3].socialRadius[4] = 53.27632019436461;
            this.species[3].socialForce[5] = -0.7730238956740898;
            this.species[3].socialRadius[5] = 9.333032782563164;
            this.species[3].socialForce[6] = -1.164899553504128;
            this.species[3].socialRadius[6] = 35.507560950604955;
            this.species[3].socialForce[7] = -1.8784294278718292;
            this.species[3].socialRadius[7] = 70.905918293596;
            this.species[3].socialForce[8] = 3.6023347511440473;
            this.species[3].socialRadius[8] = 14.81897400836538;
            this.species[3].socialForce[9] = -0.6333877804625683;
            this.species[3].socialRadius[9] = 34.51019072277912;
            this.species[3].socialForce[10] = 0.2785734759295586;
            this.species[3].socialRadius[10] = 37.89021056685358;
            this.species[3].socialForce[11] = -1.6555789611601721;
            this.species[3].socialRadius[11] = 18.84003380755539;
            this.species[3].steps = 2;
            this.species[4].socialForce[0] = 1.0405184539575565;
            this.species[4].socialRadius[0] = 7.514743589426741;
            this.species[4].socialForce[1] = -0.8997020899746566;
            this.species[4].socialRadius[1] = 67.36716137475668;
            this.species[4].socialForce[2] = -2.125896285091631;
            this.species[4].socialRadius[2] = 72.25963217988279;
            this.species[4].socialForce[3] = -3.800964090831471;
            this.species[4].socialRadius[3] = 47.25661248981523;
            this.species[4].socialForce[4] = 1.3362149602899311;
            this.species[4].socialRadius[4] = 16.54609429617129;
            this.species[4].socialForce[5] = 1.6680261396408635;
            this.species[4].socialRadius[5] = 20.48025116570071;
            this.species[4].socialForce[6] = 0.6948823503622208;
            this.species[4].socialRadius[6] = 29.180110761602176;
            this.species[4].socialForce[7] = 3.372637853952618;
            this.species[4].socialRadius[7] = 45.19078174988352;
            this.species[4].socialForce[8] = 3.98273333161635;
            this.species[4].socialRadius[8] = 64.64273400759589;
            this.species[4].socialForce[9] = -3.3986720846285916;
            this.species[4].socialRadius[9] = 58.06525337175576;
            this.species[4].socialForce[10] = -3.5180538981305727;
            this.species[4].socialRadius[10] = 51.72580625497462;
            this.species[4].socialForce[11] = -1.8565031390695736;
            this.species[4].socialRadius[11] = 9.365291857960674;
            this.species[4].steps = 2;
            this.species[5].socialForce[0] = 3.370108079507993;
            this.species[5].socialRadius[0] = 44.912137531201644;
            this.species[5].socialForce[1] = -2.4078603815661754;
            this.species[5].socialRadius[1] = 20.293511572542975;
            this.species[5].socialForce[2] = -1.8085324729311711;
            this.species[5].socialRadius[2] = 68.45202092362179;
            this.species[5].socialForce[3] = -3.919889662494427;
            this.species[5].socialRadius[3] = 59.604866184104864;
            this.species[5].socialForce[4] = -0.6521550514590828;
            this.species[5].socialRadius[4] = 23.004632444554883;
            this.species[5].socialForce[5] = 0.558211134611474;
            this.species[5].socialRadius[5] = 30.585164086962212;
            this.species[5].socialForce[6] = 0.4522945985521982;
            this.species[5].socialRadius[6] = 7.8240715455126155;
            this.species[5].socialForce[7] = 0.30758949535140623;
            this.species[5].socialRadius[7] = 23.939788618504192;
            this.species[5].socialForce[8] = 3.9003099059111026;
            this.species[5].socialRadius[8] = 44.12351099158426;
            this.species[5].socialForce[9] = -1.9421843566768082;
            this.species[5].socialRadius[9] = 63.40639303336535;
            this.species[5].socialForce[10] = 2.590489586783807;
            this.species[5].socialRadius[10] = 44.32429779199575;
            this.species[5].socialForce[11] = 0.9932887058502438;
            this.species[5].socialRadius[11] = 48.07948026003949;
            this.species[5].steps = 1;
            this.species[6].socialForce[0] = 0.3684209115696735;
            this.species[6].socialRadius[0] = 17.41238347779523;
            this.species[6].socialForce[1] = 2.7088195480476713;
            this.species[6].socialRadius[1] = 48.905336475075195;
            this.species[6].socialForce[2] = 1.6813934932196197;
            this.species[6].socialRadius[2] = 13.0610505089443;
            this.species[6].socialForce[3] = 3.857236380649404;
            this.species[6].socialRadius[3] = 40.359431502298634;
            this.species[6].socialForce[4] = 2.3404834194199644;
            this.species[6].socialRadius[4] = 25.580028201461758;
            this.species[6].socialForce[5] = 3.788844517384625;
            this.species[6].socialRadius[5] = 46.45202579585591;
            this.species[6].socialForce[6] = -1.4701665965546447;
            this.species[6].socialRadius[6] = 17.005344910462608;
            this.species[6].socialForce[7] = 2.8645400983645306;
            this.species[6].socialRadius[7] = 56.729154954344;
            this.species[6].socialForce[8] = 1.0612676357485196;
            this.species[6].socialRadius[8] = 49.80487543100134;
            this.species[6].socialForce[9] = -1.9674120306545184;
            this.species[6].socialRadius[9] = 49.784878954783984;
            this.species[6].socialForce[10] = 2.8801054895983604;
            this.species[6].socialRadius[10] = 53.70760376167216;
            this.species[6].socialForce[11] = -2.0296815386249403;
            this.species[6].socialRadius[11] = 20.288541608387785;
            this.species[6].steps = 1;
            this.species[7].socialForce[0] = -0.03743633291406567;
            this.species[7].socialRadius[0] = 32.610462682760726;
            this.species[7].socialForce[1] = -2.684337870518025;
            this.species[7].socialRadius[1] = 61.27478736835891;
            this.species[7].socialForce[2] = -3.8789933763592437;
            this.species[7].socialRadius[2] = 73.31784617206436;
            this.species[7].socialForce[3] = -0.5631298467739345;
            this.species[7].socialRadius[3] = 69.72303170520844;
            this.species[7].socialForce[4] = 1.7570630565668282;
            this.species[7].socialRadius[4] = 50.61289760433746;
            this.species[7].socialForce[5] = -2.1798355463549033;
            this.species[7].socialRadius[5] = 71.7637373785018;
            this.species[7].socialForce[6] = -1.6049877040754996;
            this.species[7].socialRadius[6] = 60.92533407295335;
            this.species[7].socialForce[7] = -1.591301107429965;
            this.species[7].socialRadius[7] = 69.97152912324606;
            this.species[7].socialForce[8] = -3.3533983301685613;
            this.species[7].socialRadius[8] = 7.13500676672375;
            this.species[7].socialForce[9] = 1.1230119813981432;
            this.species[7].socialRadius[9] = 44.18983340617562;
            this.species[7].socialForce[10] = -2.307468169143;
            this.species[7].socialRadius[10] = 60.2171290647965;
            this.species[7].socialForce[11] = -1.8395770058122984;
            this.species[7].socialRadius[11] = 22.550701510101792;
            this.species[7].steps = 0;
            this.species[8].socialForce[0] = -3.8267391225226657;
            this.species[8].socialRadius[0] = 45.68745514010258;
            this.species[8].socialForce[1] = -1.9969967237378974;
            this.species[8].socialRadius[1] = 5.024318159021252;
            this.species[8].socialForce[2] = -2.934161563601082;
            this.species[8].socialRadius[2] = 63.658697114466975;
            this.species[8].socialForce[3] = -3.740679556129015;
            this.species[8].socialRadius[3] = 57.49108357664291;
            this.species[8].socialForce[4] = 2.70948489236069;
            this.species[8].socialRadius[4] = 47.48467172819946;
            this.species[8].socialForce[5] = -2.9200393141712517;
            this.species[8].socialRadius[5] = 13.577739265531857;
            this.species[8].socialForce[6] = 3.3389972867523845;
            this.species[8].socialRadius[6] = 46.53275200437179;
            this.species[8].socialForce[7] = 3.342232906318536;
            this.species[8].socialRadius[7] = 57.39709950789376;
            this.species[8].socialForce[8] = 0.1205772317923941;
            this.species[8].socialRadius[8] = 11.221351777181964;
            this.species[8].socialForce[9] = 2.840686537655019;
            this.species[8].socialRadius[9] = 24.225052493176218;
            this.species[8].socialForce[10] = -3.498083705272098;
            this.species[8].socialRadius[10] = 57.409010924976776;
            this.species[8].socialForce[11] = -2.8135876021806574;
            this.species[8].socialRadius[11] = 43.8306549291934;
            this.species[8].steps = 1;
            this.species[9].socialForce[0] = -3.520628450586944;
            this.species[9].socialRadius[0] = 47.264275009170674;
            this.species[9].socialForce[1] = 3.7631309894501914;
            this.species[9].socialRadius[1] = 19.266064018762016;
            this.species[9].socialForce[2] = -1.6837623397845327;
            this.species[9].socialRadius[2] = 72.8702840373934;
            this.species[9].socialForce[3] = 0.15685482622406077;
            this.species[9].socialRadius[3] = 65.09861099562602;
            this.species[9].socialForce[4] = -0.44688520334295845;
            this.species[9].socialRadius[4] = 21.35613456008749;
            this.species[9].socialForce[5] = -1.3940014924390631;
            this.species[9].socialRadius[5] = 30.87162369561083;
            this.species[9].socialForce[6] = -1.360858680554509;
            this.species[9].socialRadius[6] = 34.46351338985762;
            this.species[9].socialForce[7] = 1.266369454552068;
            this.species[9].socialRadius[7] = 39.32344408998522;
            this.species[9].socialForce[8] = 1.3339683465339949;
            this.species[9].socialRadius[8] = 48.85371257026933;
            this.species[9].socialForce[9] = 0.3952462155889229;
            this.species[9].socialRadius[9] = 45.000388103151145;
            this.species[9].socialForce[10] = 2.454244871367198;
            this.species[9].socialRadius[10] = 54.771837154193655;
            this.species[9].socialForce[11] = -1.963820282997851;
            this.species[9].socialRadius[11] = 8.32651611832242;
            this.species[9].steps = 0;
            this.species[10].socialForce[0] = -1.2924109492432923;
            this.species[10].socialRadius[0] = 22.22205099169403;
            this.species[10].socialForce[1] = -3.390344947932869;
            this.species[10].socialRadius[1] = 5.741241174695658;
            this.species[10].socialForce[2] = 3.469309773901921;
            this.species[10].socialRadius[2] = 27.599270598699402;
            this.species[10].socialForce[3] = -2.289655999656228;
            this.species[10].socialRadius[3] = 34.16258785602287;
            this.species[10].socialForce[4] = -3.9314782112426148;
            this.species[10].socialRadius[4] = 36.40419966259936;
            this.species[10].socialForce[5] = 2.9872041582373825;
            this.species[10].socialRadius[5] = 14.095713411923002;
            this.species[10].socialForce[6] = -1.722548529825243;
            this.species[10].socialRadius[6] = 67.41573004208195;
            this.species[10].socialForce[7] = 0.25393759157847917;
            this.species[10].socialRadius[7] = 10.801089153825833;
            this.species[10].socialForce[8] = -3.843656072293644;
            this.species[10].socialRadius[8] = 4.365607139243316;
            this.species[10].socialForce[9] = 0.9684566345251966;
            this.species[10].socialRadius[9] = 10.070848941872791;
            this.species[10].socialForce[10] = 3.2677922850675305;
            this.species[10].socialRadius[10] = 25.41264692390017;
            this.species[10].socialForce[11] = 1.7862351778093828;
            this.species[10].socialRadius[11] = 51.83793074487167;
            this.species[10].steps = 3;
            this.species[11].socialForce[0] = 1.0133954345825291;
            this.species[11].socialRadius[0] = 12.196461417685393;
            this.species[11].socialForce[1] = 0.7041322369226215;
            this.species[11].socialRadius[1] = 47.53519654556223;
            this.species[11].socialForce[2] = 0.8393465902134665;
            this.species[11].socialRadius[2] = 24.832950998589283;
            this.species[11].socialForce[3] = -0.5282457853831666;
            this.species[11].socialRadius[3] = 7.80246783597418;
            this.species[11].socialForce[4] = 3.839173725054861;
            this.species[11].socialRadius[4] = 64.13406527360796;
            this.species[11].socialForce[5] = 1.059743178817783;
            this.species[11].socialRadius[5] = 14.896091762401866;
            this.species[11].socialForce[6] = 2.1497757098979644;
            this.species[11].socialRadius[6] = 58.76028779722146;
            this.species[11].socialForce[7] = 3.68522924244772;
            this.species[11].socialRadius[7] = 29.997400720396534;
            this.species[11].socialForce[8] = 0.45826601561131675;
            this.species[11].socialRadius[8] = 32.55112761551895;
            this.species[11].socialForce[9] = 1.2231339691237775;
            this.species[11].socialRadius[9] = 5.779111349260692;
            this.species[11].socialForce[10] = 3.219695583879032;
            this.species[11].socialRadius[10] = 70.0508959821433;
            this.species[11].socialForce[11] = 2.3973160498915895;
            this.species[11].socialRadius[11] = 46.74756654973118;
            this.species[11].steps = 1;
        }


        this.save("what?");


    }

    //--------------------------------------------
    this.setPlanetValues = function (i, j, f, r) {
        this.species[i].socialForce[i] = f;
        this.species[i].socialForce[j] = f;
        this.species[j].socialForce[i] = f;
        this.species[j].socialForce[j] = f;

        this.species[i].socialRadius[i] = r;
        this.species[i].socialRadius[j] = r;
        this.species[j].socialRadius[i] = r;
        this.species[j].socialRadius[j] = r;
    }

    //--------------------------------
    this.save = function (filename) {
        console.log("//______________________________________________________________");
        console.log("// saving ecosystem '" + filename + "'");
        console.log("//______________________________________________________________");

        console.log("this.numParticles = " + this.numParticles + ";");
        console.log("this.numSpecies = " + this.numSpecies + ";");
        console.log("this.initMode = " + this.initMode + ";");
        console.log("this.diskSize = " + this.diskSize + ";");
        console.log("this.blur = " + this.blur + ";");
        console.log("this.scale = " + this.scale + ";");

        for (let s = 0; s < this.numSpecies; s++) {
            console.log("// species " + s + ":");
            console.log("this.species[" + s + "].steps = " + this.species[s].steps + ";");
            console.log("this.species[" + s + "].setColor( " + this.species[s].red + ", " + this.species[s].green + ", " + this.species[s].blue + ", " + this.species[s].alpha + " );");

            for (let o = 0; o < this.numSpecies; o++) {
                console.log("// force field for species " + o + ":");
                console.log("this.species[" + s + "].collisionForce[" + o + "] = " + this.species[s].collisionForce[o] + ";");
                console.log("this.species[" + s + "].collisionRadius[" + o + "] = " + this.species[s].collisionRadius[o] + ";");
                console.log("this.species[" + s + "].socialForce[" + o + "] = " + this.species[s].socialForce[o] + ";");
                console.log("this.species[" + s + "].socialRadius[" + o + "] = " + this.species[s].socialRadius[o] + ";");
            }
        }
    }
}










"use strict";

//------------------------------	
// ecosystems
//------------------------------	
const ECO_NULL      	= -1;
const ECO_GEMS         	=  0;
const ECO_ALLIANCES    	=  1;
const ECO_RED_MENACE	=  2;
const ECO_ACROBATS     	=  3;
const ECO_MITOSIS      	=  4;
const ECO_PLANETS      	=  5;
const ECO_SHIPS        	=  6;
const ECO_FIELD 		=  7;
const ECO_BANG	 		=  8;
const ECO_SMALL_BANG	=  9;
const ECO_DEMO		 	=  10;
const ECO_POLLACK	 	=  11;
const ECO_PURPLE	 	=  12;
const ECO_SIMPLIFY	 	=  13;
const ECO_FLUID		 	=  14;
const NUM_ECOS			=  15;

//------------------------------	
// init modes
//------------------------------	
const INIT_MODE_NULL 	=  0;
const INIT_MODE_FULL 	=  1;
const INIT_MODE_DISK 	=  2;
const INIT_MODE_STRIPES	=  3;
const INIT_MODE_BOTTOM	=  4;
const INIT_MODE_TOP		=  5;
const INIT_MODE_EDGES	=  6;
const INIT_MODE_BLOBS	=  7;
const INIT_MODE_DEMO	=  8;
const NUM_INIT_MODES	=  9;

//--------------------------------------	
// limits and defaults
//--------------------------------------
const MIN_PARTICLES 			= 1;
const MAX_PARTICLES   			= 2000;
const MIN_SPECIES 				= 1;	
const MAX_SPECIES 				= 12;
const MIN_COLLISION_FORCE 		= 0.0;
const MAX_COLLISION_FORCE 		= 2.0;
const MAX_SOCIAL_FORCE    		= 5.0;
const MIN_COLLISION_RADIUS		= 0.0;
const MAX_COLLISION_RADIUS		= 20.0;
const MAX_SOCIAL_RADIUS			= 100.0;
const MAX_FORCE_STEPS 			= 6;
const MIN_ALPHA					= 0.2;
const MAX_ALPHA					= 1.0;
const DEFAULT_MOTION_BLUR 		= 0.9;
const ALLIANCE_MOTION_BLUR 		= 0.97;
const MITOSIS_MOTION_BLUR 		= 0.9;
const DEFAULT_COLLISION_RADIUS 	= 8.64;

//----------------------
function Ecosystem()
{	
	this.numParticles  	= 0;
	this.numSpecies		= 0;
	this.initMode		= 0;
	this.diskSize		= ZERO;
	this.blur			= ZERO;
	this.scale			= ZERO;
	this.species 		= new Array( MAX_SPECIES );

	//------------------------------------
	// create the array of species
	//------------------------------------
	for (let t=0; t<MAX_SPECIES; t++)
	{
		this.species[t] = new Species();
	}	

	//--------------------------------
	this.initialize = function()
	{
        this.loadDefaultEcosystem();		
	}
	
	//-------------------------------------
    this.randomizeAllSpecies = function()
    {
    	let steppingLikelihood = 0.4;
    	
    	for (let s=0; s<MAX_SPECIES; s++)
	    {
			this.species[s].halo = ( Math.random() > 0.7 );
			this.species[s].steps = 0;
			this.species[s].averageForces = ( Math.random() > 0.333 );
			this.species[s].nonAverageForce = 0.01;
			this.species[s].friction = 0.1 + Math.random() * 0.3;

			
			if ( Math.random() < steppingLikelihood )                 
			{
				this.species[s].steps += Math.floor( MAX_FORCE_STEPS * Math.random() );   
			}
                        
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
    }

	//--------------------------------------------
    this.reduceToSpeciesPairs = function()
	{			
    	for (let f=0; f<MAX_SPECIES; f++)
	    {
			for (let s=0; s<MAX_SPECIES; s++)
	        {
				this.species[s].halo 			= this.species[f].halo;
				this.species[s].steps 			= this.species[f].steps;
				this.species[s].averageForces 	= this.species[f].averageForces;
				this.species[s].nonAverageForce = this.species[f].nonAverageForce;
				this.species[s].friction 		= this.species[f].friction;
			
	        	this.species[s].collisionForce 	[f] = this.species[f].collisionForce 	[s];
	        	this.species[s].collisionRadius [f] = this.species[f].collisionRadius	[s];
	        	this.species[s].socialForce 	[f] = this.species[f].socialForce 		[s];
	        	this.species[s].socialRadius 	[f] = this.species[f].socialRadius 		[s];
				this.species[s].socialRamp		[f] = this.species[f].socialRamp		[s];
			}		
		}
    }
    
	//--------------------------------------------
    this.randomizeSpeciesColors = function()
	{			
		for (let s=0; s<MAX_SPECIES; s++)
		{
			let red   = Math.floor( 55 + Math.random() * 200.0 );
			let green = Math.floor( 55 + Math.random() * 200.0 );
			let blue  = Math.floor( 55 + Math.random() * 200.0 );
			
			let alpha = MIN_ALPHA + ( MAX_ALPHA - MIN_ALPHA ) * Math.random();
			
			this.species[s].setColor( red, green, blue, alpha );
		}
    }
    
	//--------------------------------------
    this.loadDefaultEcosystem = function()
    {
		this.blur 			= DEFAULT_MOTION_BLUR;
		this.scale 			= ONE;
		this.numParticles  	= 100;
		this.numSpecies		= 1;
		this.initMode		= INIT_MODE_FULL;
		this.diskSize		= 40.0;
    	
        for (let t=0; t<MAX_SPECIES; t++)
        {
			this.species[t].steps		= 0;
			this.species[t].halo		= false;
			this.species[t].friction 	= 0.2;
			this.species[t].red			= 255;
			this.species[t].green		= 255;
			this.species[t].blue		= 255;
			this.species[t].alpha		= 1;			
			this.species[t].setColor( this.species[t].red, this.species[t].green, this.species[t].blue, this.species[t].alpha )
			this.species[t].averageForces = true;
			this.species[t].nonAverageForce = 0.02;
			
			for (let f=0; f<MAX_SPECIES; f++)
            {	    
				this.species[t].collisionForce 	[f] = ZERO;   				
				this.species[t].collisionRadius	[f] = ZERO;
				this.species[t].socialForce 	[f] = ZERO;
				this.species[t].socialRadius	[f] = ZERO;
				this.species[t].socialRamp		[f] = false;
            }
        }
    }
    
	//-------------------------------
    this.loadEcosystem = function(e)
    {
        //--------------------------------
        // set to defaults
        //--------------------------------
		this.loadDefaultEcosystem();
        
        //-----------------------------------------
        // Big Bang
        //-----------------------------------------
        if ( e === ECO_BANG )
        {
			this.diskSize = 50.0;
	    	this.numParticles = 800 + Math.floor( Math.random() * 400 );

			this.numSpecies = 1 + Math.floor( Math.random() * MAX_SPECIES );

			let r = Math.random();
			let curvedMotionBlur = Math.sqrt(r);  
			
			curvedMotionBlur = curvedMotionBlur.toFixed(2);
			this.blur = curvedMotionBlur;


/*
//temp...
this.diskSize 		= 300.0;
this.numParticles 	= 600;
this.numSpecies 	= 4;
this.blur 			= 0.0;
*/












this.randomizeAllSpecies();
//this.reduceToSpeciesPairs();
			
this.initMode = INIT_MODE_DISK;	
//this.initMode = INIT_MODE_BOTTOM;	
		}
        //-----------------------------------------
        // Big Bang (customized for a small canvas)
        //-----------------------------------------
        if ( e === ECO_SMALL_BANG )
        {
			this.diskSize = 50.0;
	    	this.numParticles = 300 + Math.floor( Math.random() * 400 );

			this.numSpecies = 3 + Math.floor( Math.random() * 5 );

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
        else if ( e === ECO_ALLIANCES )
        {
        	this.numSpecies = 12;
    		this.numParticles = 1000;
			this.blur = ALLIANCE_MOTION_BLUR;

            for (let t=0; t<this.numSpecies; t++)
            {
				this.species[t].setColor( 100, 100, 100, 1.0 );
			}

			this.species[ 0].setColor( 255,   0,   0, 1.0 ); // red
			this.species[ 1].setColor( 255,  75,   0, 1.0 );
			this.species[ 2].setColor( 255, 150,   0, 1.0 ); // orange
			this.species[ 3].setColor( 255, 200,   0, 1.0 );
			this.species[ 4].setColor( 255, 255,   0, 1.0 ); // yellow
			this.species[ 5].setColor( 150, 255,   0, 1.0 );
			this.species[ 6].setColor(   0, 180,   0, 1.0 ); // green
			this.species[ 7].setColor(   0, 200, 200, 1.0 );
			this.species[ 8].setColor(  80,  80, 255, 1.0 ); // blue
			this.species[ 9].setColor(  60,   0, 255, 1.0 );
			this.species[10].setColor( 160,  20, 255, 1.0 ); // violet
			this.species[11].setColor( 150,   0, 150, 1.0 );
        	
        	
            for (let t=0; t<this.numSpecies; t++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
					this.species[t].collisionForce 	[f] = 1.0;   				
					this.species[t].collisionRadius	[f] = 8.64;
					this.species[t].socialForce 	[f] = -4.0 * 0.1;
					this.species[t].socialRadius	[f] = 81.0;
				}
			}
        	
            for (let t=0; t<this.numSpecies; t++)
            {
                this.species[t].steps = 0;
                
                for (let f=0; f<this.numSpecies; f++)
                {
                    this.species[t].socialForce [f] = -4.0 * 0.2;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }

            let me     = 4.0 *  0.2;
            let before = 4.0 * -0.5;
            let after  = 4.0 *  0.5;
            
            for (let t=0; t<this.numSpecies; t++)
            {
                let f0 = t-1; 
                let f1 = t; 
                let f2 = t+1; 
                
                if ( f0 < 0 ) { f0 = this.numSpecies - 1; }
                if ( f2 > this.numSpecies - 1 ) { f2 = 0; }
            
                this.species[t].socialForce [ f0 ] = before;
                this.species[t].socialForce [ f1 ] = me;
                this.species[t].socialForce [ f2 ] = after;
            }            

			this.initMode = INIT_MODE_EDGES;		
        }
        //-----------------------------------------
        // Field
        //-----------------------------------------
        else if ( e === ECO_FIELD )
        {
			this.numSpecies = 2;
	    	this.numParticles = 1000;
			this.initMode 	= INIT_MODE_DISK;		
			this.diskSize 	= 5.0;

			this.species[0].setColor( 160, 120, 255, 0.5, 1.0 ); 
			this.species[0].steps = 2;
			this.species[0].collisionForce	[0] = 0.0;   
			this.species[0].collisionRadius	[0] = 0.0;   
			this.species[0].socialForce 	[0] = -1.0;
			this.species[0].socialRadius	[0] = 20.0;
			
			this.species[0].collisionForce	[1] = 0.0;   
			this.species[0].collisionRadius	[1] = 0.0;   
			this.species[0].socialForce 	[1] = -1.0;
			this.species[0].socialRadius	[1] = 20.0;

			this.species[1].setColor( 100, 100, 200, 0.5, 1.0 ); 
			this.species[1].steps = 2;
			this.species[1].collisionForce	[0] = 0.0;   
			this.species[1].collisionRadius	[0] = 0.0;   
			this.species[1].socialForce 	[0] = -1.0;
			this.species[1].socialRadius	[0] = 20.0;
			
			this.species[1].collisionForce	[1] = 0.0;   
			this.species[1].collisionRadius	[1] = 0.0;   
			this.species[1].socialForce 	[1] = -1.0;
			this.species[1].socialRadius	[1] = 20.0;	
		}        
		//-----------------------------------------
        // Fluid
        //-----------------------------------------
        else if ( e === ECO_FLUID )
        {
			this.numSpecies = 1;
	    	this.numParticles = 1500;
			this.initMode 	= INIT_MODE_DISK;		
			this.diskSize 	= 50.0;

			this.species[0].setColor( 200, 200, 200, 0.5, 1.0 ); 
			this.species[0].steps = 0;
			this.species[0].friction = 0.1;
			this.species[0].collisionForce	[0] = 0.2;   
			this.species[0].collisionRadius	[0] = 20.0;   
			this.species[0].socialForce 	[0] = 0.01;
			this.species[0].socialRadius	[0] = 30.0;
		}
		//-----------------------------------------
        // Mitosis
        //-----------------------------------------
        else if ( e === ECO_MITOSIS )
        {
			this.numSpecies = 12;
	    	this.numParticles = 1200;
			this.blur = MITOSIS_MOTION_BLUR;

            for (let t=0; t<this.numSpecies; t++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
					this.species[t].collisionForce 	[f] = 1.0;   				
					this.species[t].collisionRadius	[f] = 8.64;
					this.species[t].socialForce 	[f] = -4.0 * 0.1;
					this.species[t].socialRadius	[f] = 81.0;
				}
			}

            for (let t=2; t<this.numSpecies; t++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
    	            this.species[t].collisionForce[f] = 0.4;   
			        this.species[t].socialForce [f] = f / this.numSpecies * 2.0 - t / this.numSpecies * 0.7;
                    this.species[t].socialRadius[f] = 81.0 * 0.5;
                }
            }

			this.species[ 0].setColor( 100, 100, 100, 0.7 ); 
			this.species[ 1].setColor( 100,  60,  50, 0.7 ); 
			this.species[ 2].setColor( 200, 180, 120, 0.7 ); 
			this.species[ 3].setColor( 200, 180, 120, 0.7 ); 
			this.species[ 4].setColor( 200,  70,  70, 0.7 ); 
			this.species[ 5].setColor( 200, 180, 120, 0.7 ); 
			this.species[ 6].setColor( 150, 150, 120, 0.7 ); 
			this.species[ 7].setColor( 140, 100, 100, 0.7 ); 
			this.species[ 8].setColor( 200, 120, 100, 0.7 ); 
			this.species[ 9].setColor( 200, 120, 100, 0.7 ); 
			this.species[10].setColor( 200, 120, 120, 0.7 ); 
			this.species[11].setColor( 200, 120, 120, 0.7 ); 
			
			this.diskSize = 40.0;
			this.initMode = INIT_MODE_DISK;		
        }
        //-----------------------------------------
        // The Red Menace
        //-----------------------------------------
        else if ( e === ECO_RED_MENACE )
        {
			this.numSpecies = 12;
	    	this.numParticles = 1000;
	    	
	    	
this.numParticles = 2000;
	    	
	    	
            for (let t=0; t<this.numSpecies; t++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
					this.species[t].collisionForce 	[f] = 1.0;   				
					this.species[t].collisionRadius	[f] = 8.64;
					this.species[t].socialForce 	[f] = -4.0 * 0.1;
					this.species[t].socialRadius	[f] = 81.0;
				}
			}
	    	

            for (let s=0; s<this.numSpecies; s++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
                    this.species[s].socialForce [f] = 4.0  * 0.1;
                    this.species[s].socialRadius[f] = 81.0 * 0.2;
                }
            }
            
            let fear = 4.0 * -1.0;
            let love = 4.0 *  1.2;

            let fearRadius = 81.0 * 0.5;
            let loveRadius = 81.0 * 0.9;

			this.species[0].setColor( 200, 0, 0, 1.0 );
			
			this.species[0].halo = true;

            //------------------------------------
            // everyone fears red except for red
            // and red loves everyone
            //------------------------------------
            for (let s=1; s<this.numSpecies; s++)
            {
				this.species[0].socialForce [s] = love;
				this.species[0].socialRadius[s] = loveRadius;  
        
                this.species[s].socialForce [0] = fear;
                this.species[s].socialRadius[0] = fearRadius * ( s / this.numSpecies);
                                
				let f = s / this.numSpecies;
				
            	let red 	= 0.4 + f * 0.4;
            	let green  	= 0.3 + f * 0.5;
            	let blue   	= 0.5 + f * 0.2;
            	
            	let r = Math.floor( red 	* 255 );
            	let g = Math.floor( green 	* 255 );
            	let b = Math.floor( blue 	* 255 );

				this.species[s].setColor( r, g, b, 1.0 ); 
            }

			this.diskSize = 80.0;
			this.initMode = INIT_MODE_DISK;
        }
        //-----------------------------------------
        // Ships
        //-----------------------------------------
        else if ( e === ECO_SHIPS )
        {
	    	this.numParticles = 1000;
			this.numSpecies = 12;

            let redForce  = -1.0;
            let redRadius = 10.0;
            
            for (let s=0; s<this.numSpecies; s++)
            {
            	let red 	= s / this.numSpecies;
            	let green  	= 0.6 - s / this.numSpecies * 0.3;
            	let blue   	= 1 - s / this.numSpecies;
            	
            	let r = Math.floor( red 	* 100 );
            	let g = Math.floor( green 	* 150 );
            	let b = Math.floor( blue 	* 255 );

				this.species[s].setColor( r, g, b, 1.0 ); 
			}

			this.species[1].setColor( 200, 200, 100, 1.0 ); 
			this.species[2].setColor( 130, 130, 100, 1.0 ); 

            this.species[0].socialForce [ 0] = redForce;      
            this.species[0].socialRadius[ 0] = redRadius;      
            this.species[0].socialForce [ 1] = redForce;       
            this.species[0].socialRadius[ 1] = redRadius; 
            this.species[0].socialForce [ 2] = redForce;       
            this.species[0].socialRadius[ 2] = redRadius;      
            this.species[0].socialForce [ 3] = redForce;      
            this.species[0].socialRadius[ 3] = redRadius;      
            this.species[0].socialForce [ 4] = redForce;        
            this.species[0].socialRadius[ 4] = redRadius;   
            this.species[0].socialForce [ 5] = redForce;       
            this.species[0].socialRadius[ 5] = redRadius;

            
            this.species[1].socialForce [ 0] = 0.0;     
            this.species[1].socialRadius[ 0] = 41.87992572411895;       
            this.species[1].socialForce [ 1] = 0.6188263148069382;      
            this.species[1].socialRadius[ 1] = 31.57806908339262;       
            this.species[1].socialForce [ 2] = -2.252236846834421;      
            this.species[1].socialRadius[ 2] = 16.67971832305193;       
            this.species[1].socialForce [ 3] = 2.9319324381649494;      
            this.species[1].socialRadius[ 3] = 75.86216926202178;       
            this.species[1].socialForce [ 4] = 3.160645740106702;       
            this.species[1].socialRadius[ 4] = 28.880391377955675;      
            this.species[1].socialForce [ 5] = 1.0297179147601128;      
            this.species[1].socialRadius[ 5] = 59.19801760092378;       
            this.species[2].socialForce [ 0] = 0.0;
            this.species[2].socialRadius[ 0] = 49.67192802205682;       
            this.species[2].socialForce [ 1] = -3.264488408342004;      
            this.species[2].socialRadius[ 1] = 8.111502636224031;       
            this.species[2].socialForce [ 2] = 3.478301437571645;       
            this.species[2].socialRadius[ 2] = 81.76046648621559;       
            this.species[2].socialForce [ 3] = -3.4177507925778627;     
            this.species[2].socialRadius[ 3] = 48.5528220012784;        
            this.species[2].socialForce [ 4] = -3.999166540801525;      
            this.species[2].socialRadius[ 4] = 16.489134017378092;      
            this.species[2].socialForce [ 5] = 0.6649601068347692;      
            this.species[2].socialRadius[ 5] = 37.668375723063946;      
            this.species[3].socialForce [ 0] = 0.0;      
            this.species[3].socialRadius[ 0] = 21.195324823260307;      
            this.species[3].socialForce [ 1] = 1.8835953641682863;      
            this.species[3].socialRadius[ 1] = 41.92278680950403;       
            this.species[3].socialForce [ 2] = 3.05437408387661;        
            this.species[3].socialRadius[ 2] = 71.93124115094543;       
            this.species[3].socialForce [ 3] = 0.30829014256596565;     
            this.species[3].socialRadius[ 3] = 29.373187363147736;      
            this.species[3].socialForce [ 4] = 2.692530371248722;       
            this.species[3].socialRadius[ 4] = 17.34831178188324;       
            this.species[3].socialForce [ 5] = -3.504735803231597;      
            this.species[3].socialRadius[ 5] = 35.28821248188615;       
            this.species[4].socialForce [ 0] = 0.0;     
            this.species[4].socialRadius[ 0] = 35.6813519410789;        
            this.species[4].socialForce [ 1] = -2.2478953283280134;     
            this.species[4].socialRadius[ 1] = 29.27869377285242;       
            this.species[4].socialForce [ 2] = 1.5714976619929075;      
            this.species[4].socialRadius[ 2] = 67.66308366879821;       
            this.species[4].socialForce [ 3] = 1.4469843301922083;      
            this.species[4].socialRadius[ 3] = 24.738862734287977;      
            this.species[4].socialForce [ 4] = -3.206526968628168;      
            this.species[4].socialRadius[ 4] = 8.246950801461935;       
            this.species[4].socialForce [ 5] = -3.382426990196109;      
            this.species[4].socialRadius[ 5] = 20.83147009462118;       
            this.species[5].socialForce [ 0] = 0.0;      
            this.species[5].socialRadius[ 0] = 58.359155502170324;      
            this.species[5].socialForce [ 1] = 0.5229634866118431;      
            this.species[5].socialRadius[ 1] = 22.19472612813115;       
            this.species[5].socialForce [ 2] = -0.3390012998133898;     
            this.species[5].socialRadius[ 2] = 59.756876077502966;      
            this.species[5].socialForce [ 3] = 0.20365052670240402;     
            this.species[5].socialRadius[ 3] = 29.851365625858307;      
            this.species[5].socialForce [ 4] = 2.2390960846096277;      
            this.species[5].socialRadius[ 4] = 67.69483275339007;       
            this.species[5].socialForce [ 5] = 1.7939001806080341;      
            this.species[5].socialRadius[ 5] = 25.740952897816896;   
                    
			this.initMode = INIT_MODE_BLOBS;		
        }
        //-----------------------------------------
        // Demo
        //-----------------------------------------
        else if ( e === ECO_DEMO    )
        {
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
        else if ( e === ECO_POLLACK    )
        {
        	this.numSpecies = 12;
    		this.numParticles = 1000;
			this.blur = 1;

            for (let t=0; t<this.numSpecies; t++)
            {
				this.species[t].setColor( 100, 100, 100, 1.0 );
			}

			this.species[ 0].setColor( 70,  20,   0, 1.0 ); // red
			this.species[ 1].setColor( 210, 205, 200, 1.0 );
			this.species[ 2].setColor( 255, 150, 100, 1.0 ); // orange
			this.species[ 3].setColor( 200, 190, 160, 1.0 );
			this.species[ 4].setColor( 150, 140, 100, 1.0 ); // yellow
			this.species[ 5].setColor( 210, 205, 200, 1.0 );
			this.species[ 6].setColor( 210, 205, 200, 1.0 ); // green
			this.species[ 7].setColor(  80, 150, 150, 1.0 );
			this.species[ 8].setColor(  80,  80, 200, 1.0 ); // blue
			this.species[ 9].setColor(  60,  40, 17, 1.0 );
			this.species[10].setColor( 210, 205, 200, 1.0 ); // violet
			this.species[11].setColor(  20,  10,  10, 1.0 );
        	
        	
            for (let t=0; t<this.numSpecies; t++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
					this.species[t].collisionForce 	[f] = 1.0;   				
					this.species[t].collisionRadius	[f] = 8.64;
					this.species[t].socialForce 	[f] = -4.0 * 0.1;
					this.species[t].socialRadius	[f] = 81.0;
				}
			}
        	
        	
            for (let t=0; t<this.numSpecies; t++)
            {
                this.species[t].steps = 0;
                
                for (let f=0; f<this.numSpecies; f++)
                {
                    this.species[t].socialForce [f] = -4.0 * 0.2;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }

            let me     = 4.0 *  0.2;
            let before = 4.0 * -0.5;
            let after  = 4.0 *  0.5;
            
            for (let t=0; t<this.numSpecies; t++)
            {
                let f0 = t-1; 
                let f1 = t; 
                let f2 = t+1; 
                
                if ( f0 < 0 ) { f0 = this.numSpecies - 1; }
                if ( f2 > this.numSpecies - 1 ) { f2 = 0; }
            
                this.species[t].socialForce [ f0 ] = before;
                this.species[t].socialForce [ f1 ] = me;
                this.species[t].socialForce [ f2 ] = after;
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
        else if ( e === ECO_SIMPLIFY )
        {
			this.numParticles	= 1000; 	
			this.numSpecies 	= 3;	
			this.initMode 		= INIT_MODE_FULL;
			this.diskSize 		= 400; 	
			this.blur 			= 0.8; 	
			this.scale 			= 1; 
			
			for (let s=0; s<MAX_SPECIES; s++)
			{
				//this.species[s].setColor( 150, 150, 150, 0.2 );
				this.species[s].steps = 0; 
				this.species[s].halo = 0; 

				for (let f=0; f<MAX_SPECIES; f++)
				{
					this.species[s].collisionForce 	[f] = 0.0;   				
					this.species[s].collisionRadius	[f] = 200.0;
					this.species[s].socialForce 	[f] = 0.001;
					this.species[s].socialRadius	[f] = 500;
				}
			}
			
			this.randomizeSpeciesColors();			
			
			this.species[0].setColor( 150,  70,  50, 0.8 );
			this.species[1].setColor( 150, 200,  80, 0.8 );
			this.species[2].setColor( 100,  60, 200, 0.8 );
				

			let selfCF	= 0.2;
			let selfCR	= 20;
			let selfSF	= 0.5;
			let selfSR	= 200.0;

			let otherCF	= 0.5;
			let otherCR	= 80.0;
			let otherSF	= 0.3;
			let otherSR	= 300;
			
			
			for (let s=0; s<MAX_SPECIES; s++)
			{
				for (let f=0; f<MAX_SPECIES; f++)
				{
					if ( s === f )
					{				
						this.species[s].collisionForce	[f] = selfCF;
						this.species[s].collisionRadius	[f] = selfCR;
						this.species[s].socialForce		[f] = selfSF;
						this.species[s].socialRadius	[f] = selfSR; 
					}
					else
					{		
						this.species[s].collisionForce	[f] = otherCF;
						this.species[s].collisionRadius	[f] = otherCR;
						this.species[s].socialForce		[f] = otherSF;
						this.species[s].socialRadius	[f] = otherSR; 
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
        else if ( e === ECO_PURPLE    )
        {
			for (let t=0; t<this.numSpecies; t++)
			{
				for (let f=0; f<this.numSpecies; f++)
				{
					this.species[t].collisionForce 	[f] = 1.0;   				
					this.species[t].collisionRadius	[f] = 8.64;
					this.species[t].socialForce 	[f] = -4.0 * 0.1;
					this.species[t].socialRadius	[f] = 81.0;
				}
			}

			this.numParticles = 500; //1516:11
			this.numSpecies = 2;//3; //1517:11
			this.initMode = 0; //1518:11
			this.diskSize = 40; //1519:11
			this.blur = 0.9; //1520:11
			this.scale = 1; //1521:11
			// species 0: //1525:12
			this.species[0].steps = 0; //1526:12
			this.species[0].halo = 0; //1526:12
			this.species[0].setColor( 232, 231, 62, 0.5 );
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
			this.species[1].setColor( 160, 59, 229, 0.6 );
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
			this.species[2].setColor( 108, 72, 123, 0.46789403380982353 );
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
        else if ( e === ECO_GEMS    )
        {
			this.numSpecies = 12;
	    	this.numParticles = 1000;
            
            for (let t=0; t<this.numSpecies; t++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
					this.species[t].collisionForce 	[f] = 1.0;   				
					this.species[t].collisionRadius	[f] = 8.64;
					this.species[t].socialForce 	[f] = -4.0 * 0.1;
					this.species[t].socialRadius	[f] = 81.0;
				}
			}
            
            
            
            for (let t=0; t<this.numSpecies; t++)
            {
				this.species[t].halo = false;//true;
				
                for (let f=0; f<this.numSpecies; f++)
                {
                    this.species[t].socialForce [f] = -2.0;
                    this.species[t].socialRadius[f] = 81.0;
                }
            }
            
			for (let s=0; s<this.numSpecies; s++)
			{
				this.species[s].setColor(  70,  70, 70, 1.0 ); 
			}

			this.species[ 0].setColor(  70,  70, 170, 1.0 ); 
			this.species[ 1].setColor( 100,  70, 210, 1.0 ); 
			this.species[ 2].setColor( 100,  60, 250, 1.0 ); 
			this.species[ 3].setColor( 150, 160, 230, 1.0 ); 
			this.species[ 4].setColor( 100,  50,  30, 1.0 ); 
			this.species[ 5].setColor( 100, 230, 200, 1.0 ); 
			this.species[ 5].setColor( 100,   0,   0, 1.0 ); 
			this.species[ 6].setColor( 100,  40,  30, 1.0 ); 
			this.species[ 6].setColor( 130,  70,  30, 1.0 ); 
			this.species[ 7].setColor( 130, 120, 120, 1.0 ); 
            
            //orange
            this.species[1].socialForce [ 1] = -3.290671030059457;      
            this.species[1].socialRadius[ 1] = 42.49002040922642;       
            this.species[1].socialForce [ 4] = -1.2598434370011091;     
            this.species[1].socialRadius[ 4] = 63.842149429023266;      
            this.species[1].socialForce [ 5] = 2.578464737161994;       
            this.species[1].socialRadius[ 5] = 63.114551432430744;  
            
            //blue
            this.species[4].socialForce [ 1] = -1.1081697009503841;     
            this.species[4].socialRadius[ 1] = 33.84286079183221;       
            this.species[4].socialForce [ 4] = 0.526039507240057;       
            this.species[4].socialRadius[ 4] = 18.11127431318164;       
            this.species[4].socialForce [ 5] = 3.9443997144699097;      
            this.species[4].socialRadius[ 5] = 48.21247752383351;  
            
            //purple
            this.species[5].socialForce [ 1] = 2.3572729844599962;      
            this.species[5].socialRadius[ 1] = 76.98223288729787;       
            this.species[5].socialForce [ 4] = -2.956161877140403;      
            this.species[5].socialRadius[ 4] = 66.31004854664207;       
            this.species[5].socialForce [ 5] = 2.6210244055837393;      
            this.species[5].socialRadius[ 5] = 59.6334382481873;                 
                       
            //red
            this.species[0].socialForce [ 0] = -3.290671030059457;      
            this.species[0].socialRadius[ 0] = 42.49002040922642;       
            this.species[0].socialForce [ 3] = -1.2598434370011091;     
            this.species[0].socialRadius[ 3] = 63.842149429023266;      
            this.species[0].socialForce [ 2] = 2.578464737161994;       
            this.species[0].socialRadius[ 2] = 63.114551432430744;  
            
            //green
            this.species[3].socialForce [ 0] = -1.1081697009503841;     
            this.species[3].socialRadius[ 0] = 33.84286079183221;       
            this.species[3].socialForce [ 3] = 0.526039507240057;       
            this.species[3].socialRadius[ 3] = 18.11127431318164;       
            this.species[3].socialForce [ 2] = 3.9443997144699097;      
            this.species[3].socialRadius[ 2] = 48.21247752383351;  
            
            //yellow
            this.species[2].socialForce [ 0] = 2.3572729844599962;      
            this.species[2].socialRadius[ 0] = 76.98223288729787;       
            this.species[2].socialForce [ 3] = -2.956161877140403;      
            this.species[2].socialRadius[ 3] = 66.31004854664207;       
            this.species[2].socialForce [ 2] = 2.6210244055837393;      
            this.species[2].socialRadius[ 2] = 59.6334382481873;                       
                
			this.initMode = INIT_MODE_BOTTOM;		
        }
        //-----------------------------------------
        // Planets
        //-----------------------------------------
        else if ( e === ECO_PLANETS )
        {
	    	this.numParticles = 1000;
			this.numSpecies = 12;
			
			
            for (let t=0; t<this.numSpecies; t++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
					this.species[t].collisionForce 	[f] = 1.0;   				
					this.species[t].collisionRadius	[f] = 8.64;
					this.species[t].socialForce 	[f] = -4.0 * 0.1;
					this.species[t].socialRadius	[f] = 81.0;
				}
			}
			

            for (let t=0; t<this.numSpecies; t++)
            {
                for (let f=0; f<this.numSpecies; f++)
                {
                    this.species[t].socialForce [f] = -1.0;
                    this.species[t].socialRadius[f] = 81.0 * 0.5;
                }
            }
            
        	this.species[ 0].setColor( 200, 130, 130, 1.0 );
        	this.species[ 1].setColor( 200, 250, 130, 1.0 );
			this.species[ 2].setColor( 200, 200, 130, 1.0 );
			this.species[ 3].setColor( 130, 190, 130, 1.0 );
			this.species[ 4].setColor( 170, 170, 210, 1.0 );
			this.species[ 5].setColor( 130, 140, 170, 1.0 );
			this.species[ 6].setColor( 110, 130, 130, 1.0 );
			this.species[ 7].setColor( 110, 180, 130, 1.0 );
			this.species[ 8].setColor( 120, 120, 150, 1.0 );
			this.species[ 9].setColor( 130, 100, 130, 1.0 );
			this.species[10].setColor( 130, 130, 160, 1.0 );
			this.species[11].setColor( 100, 130, 130, 1.0 );
            
            let f = 1.0;
            let r = 50.0;
            
            let i = 0; 
            let j = 0;
            
            i =  0; j =  6;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  0; j =  7;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  0; j =  1;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  1; j =  6;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  1; j =  7;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r ); 
            i =  6; j =  7;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );

            i =  2; j =  8;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  2; j =  9;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  2; j =  3;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  3; j =  8;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  3; j =  9;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  8; j =  9;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );

            i =  4; j = 10;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  4; j = 11;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  4; j =  5;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  5; j = 10;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i =  5; j = 11;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );
            i = 10; j = 11;   this.setPlanetValues( i, j, f, r ); this.setPlanetValues( j, i, f, r );

			this.diskSize = 130.0;
			this.initMode = INIT_MODE_DISK;		
        }         
        //-----------------------------------------
        // Acrobats
        //-----------------------------------------
        else if ( e === ECO_ACROBATS )
        {
        	this.species[ 0].setColor( 255, 130, 130, 1.0 );
        	this.species[ 1].setColor( 200, 150,  30, 1.0 );
			this.species[ 2].setColor( 200, 200,  30, 1.0 );
			this.species[ 3].setColor(  30, 100,  30, 1.0 );
			this.species[ 4].setColor(  70,  70, 210, 1.0 );
			this.species[ 5].setColor( 100,  80, 150, 1.0 );
			this.species[ 6].setColor( 110,  30,  30, 1.0 );
			this.species[ 7].setColor( 110,  80,  30, 1.0 );
			this.species[ 8].setColor( 120, 120,  50, 1.0 );
			this.species[ 9].setColor(  30, 100,  30, 1.0 );
			this.species[10].setColor( 130, 130, 160, 1.0 );
			this.species[11].setColor( 100,  30, 130, 1.0 );
			
			
			
			this.initMode 		= INIT_MODE_FULL;		
	    	this.numParticles 	= 1000;
			this.numSpecies 	= 12;

            this.species[0].socialForce [ 0] = -1.5508803074180229;
            this.species[0].socialRadius[ 0] = 67.39870606440391;
            this.species[0].socialForce [ 1] = 3.531817763582824;
            this.species[0].socialRadius[ 1] = 27.965232121066215;
            this.species[0].socialForce [ 2] = -2.9919035578897333;
            this.species[0].socialRadius[ 2] = 10.438678512701594;
            this.species[0].socialForce [ 3] = -3.8794564810173178;
            this.species[0].socialRadius[ 3] = 22.65486638779329;
            this.species[0].socialForce [ 4] = 2.5954984826704823;
            this.species[0].socialRadius[ 4] = 60.22401393986497;
            this.species[0].socialForce [ 5] = 1.3760776294881119;
            this.species[0].socialRadius[ 5] = 4.845826513992259;
            this.species[0].socialForce [ 6] = -2.9816940192692893;
            this.species[0].socialRadius[ 6] = 29.370149467449814;
            this.species[0].socialForce [ 7] = -1.45395165216312;
            this.species[0].socialRadius[ 7] = 48.338890718007626;
            this.species[0].socialForce [ 8] = 2.757049039564828;
            this.species[0].socialRadius[ 8] = 42.58464017605024;
            this.species[0].socialForce [ 9] = 3.4908970835132127;
            this.species[0].socialRadius[ 9] = 64.36448967277636;
            this.species[0].socialForce [ 10] = -0.24931194857345496;
            this.species[0].socialRadius[ 10] = 58.32672888381189;
            this.species[0].socialForce [ 11] = 1.2186156126592262;
            this.species[0].socialRadius[ 11] = 71.01087918959422;
            this.species[0].steps = 0;
            this.species[1].socialForce [ 0] = 3.674318534735148;
            this.species[1].socialRadius[ 0] = 24.841108716472515;
            this.species[1].socialForce [ 1] = 3.1508842519689413;
            this.species[1].socialRadius[ 1] = 72.60388969661699;
            this.species[1].socialForce [ 2] = -3.6529130461313883;
            this.species[1].socialRadius[ 2] = 39.06133978399006;
            this.species[1].socialForce [ 3] = 2.4141718235322926;
            this.species[1].socialRadius[ 3] = 11.004824340092515;
            this.species[1].socialForce [ 4] = 1.6574672176974676;
            this.species[1].socialRadius[ 4] = 56.446196037025175;
            this.species[1].socialForce [ 5] = -1.586790781249329;
            this.species[1].socialRadius[ 5] = 7.6602382534441436;
            this.species[1].socialForce [ 6] = -0.7930895186724403;
            this.species[1].socialRadius[ 6] = 25.662906868391964;
            this.species[1].socialForce [ 7] = -0.8069300396381909;
            this.species[1].socialRadius[ 7] = 68.09663113073869;
            this.species[1].socialForce [ 8] = -2.1849782173169885;
            this.species[1].socialRadius[ 8] = 70.23956881737872;
            this.species[1].socialForce [ 9] = 2.4217882932185617;
            this.species[1].socialRadius[ 9] = 45.09886136790743;
            this.species[1].socialForce [ 10] = -2.9541964866025108;
            this.species[1].socialRadius[ 10] = 57.70036651488808;
            this.species[1].socialForce [ 11] = 0.22365393347203444;
            this.species[1].socialRadius[ 11] = 72.36404160742227;
            this.species[1].steps = 2;
            this.species[2].socialForce [ 0] = 3.7041673121665433;
            this.species[2].socialRadius[ 0] = 4.1210748468940475;
            this.species[2].socialForce [ 1] = -0.6541684914961721;
            this.species[2].socialRadius[ 1] = 33.73145094814303;
            this.species[2].socialForce [ 2] = 2.3631965877408323;
            this.species[2].socialRadius[ 2] = 27.16253170320861;
            this.species[2].socialForce [ 3] = 0.8114009328501393;
            this.species[2].socialRadius[ 3] = 46.81021502836751;
            this.species[2].socialForce [ 4] = 2.202893016939555;
            this.species[2].socialRadius[ 4] = 35.03742299450543;
            this.species[2].socialForce [ 5] = 2.517458155421073;
            this.species[2].socialRadius[ 5] = 72.12750006981254;
            this.species[2].socialForce [ 6] = -2.6137628373526134;
            this.species[2].socialRadius[ 6] = 29.183710600826977;
            this.species[2].socialForce [ 7] = -1.944036326503463;
            this.species[2].socialRadius[ 7] = 66.2336536871824;
            this.species[2].socialForce [ 8] = 3.105170500843009;
            this.species[2].socialRadius[ 8] = 16.541664627550116;
            this.species[2].socialForce [ 9] = -2.8487102738052315;
            this.species[2].socialRadius[ 9] = 31.874293994272833;
            this.species[2].socialForce [ 10] = 2.405701204108299;
            this.species[2].socialRadius[ 10] = 20.896340478471696;
            this.species[2].socialForce [ 11] = -1.9872104514725901;
            this.species[2].socialRadius[ 11] = 64.25949861656403;
            this.species[2].steps = 0;
            this.species[3].socialForce [ 0] = -3.5327047147422377;
            this.species[3].socialRadius[ 0] = 42.094533363233246;
            this.species[3].socialForce [ 1] = 3.304651900052786;
            this.species[3].socialRadius[ 1] = 53.55639630115912;
            this.species[3].socialForce [ 2] = -3.346447197985178;
            this.species[3].socialRadius[ 2] = 26.711798211170233;
            this.species[3].socialForce [ 3] = -2.8623431373372714;
            this.species[3].socialRadius[ 3] = 36.29856591118049;
            this.species[3].socialForce [ 4] = 3.928523458227076;
            this.species[3].socialRadius[ 4] = 53.27632019436461;
            this.species[3].socialForce [ 5] = -0.7730238956740898;
            this.species[3].socialRadius[ 5] = 9.333032782563164;
            this.species[3].socialForce [ 6] = -1.164899553504128;
            this.species[3].socialRadius[ 6] = 35.507560950604955;
            this.species[3].socialForce [ 7] = -1.8784294278718292;
            this.species[3].socialRadius[ 7] = 70.905918293596;
            this.species[3].socialForce [ 8] = 3.6023347511440473;
            this.species[3].socialRadius[ 8] = 14.81897400836538;
            this.species[3].socialForce [ 9] = -0.6333877804625683;
            this.species[3].socialRadius[ 9] = 34.51019072277912;
            this.species[3].socialForce [ 10] = 0.2785734759295586;
            this.species[3].socialRadius[ 10] = 37.89021056685358;
            this.species[3].socialForce [ 11] = -1.6555789611601721;
            this.species[3].socialRadius[ 11] = 18.84003380755539;
            this.species[3].steps = 2;
            this.species[4].socialForce [ 0] = 1.0405184539575565;
            this.species[4].socialRadius[ 0] = 7.514743589426741;
            this.species[4].socialForce [ 1] = -0.8997020899746566;
            this.species[4].socialRadius[ 1] = 67.36716137475668;
            this.species[4].socialForce [ 2] = -2.125896285091631;
            this.species[4].socialRadius[ 2] = 72.25963217988279;
            this.species[4].socialForce [ 3] = -3.800964090831471;
            this.species[4].socialRadius[ 3] = 47.25661248981523;
            this.species[4].socialForce [ 4] = 1.3362149602899311;
            this.species[4].socialRadius[ 4] = 16.54609429617129;
            this.species[4].socialForce [ 5] = 1.6680261396408635;
            this.species[4].socialRadius[ 5] = 20.48025116570071;
            this.species[4].socialForce [ 6] = 0.6948823503622208;
            this.species[4].socialRadius[ 6] = 29.180110761602176;
            this.species[4].socialForce [ 7] = 3.372637853952618;
            this.species[4].socialRadius[ 7] = 45.19078174988352;
            this.species[4].socialForce [ 8] = 3.98273333161635;
            this.species[4].socialRadius[ 8] = 64.64273400759589;
            this.species[4].socialForce [ 9] = -3.3986720846285916;
            this.species[4].socialRadius[ 9] = 58.06525337175576;
            this.species[4].socialForce [ 10] = -3.5180538981305727;
            this.species[4].socialRadius[ 10] = 51.72580625497462;
            this.species[4].socialForce [ 11] = -1.8565031390695736;
            this.species[4].socialRadius[ 11] = 9.365291857960674;
            this.species[4].steps = 2;
            this.species[5].socialForce [ 0] = 3.370108079507993;
            this.species[5].socialRadius[ 0] = 44.912137531201644;
            this.species[5].socialForce [ 1] = -2.4078603815661754;
            this.species[5].socialRadius[ 1] = 20.293511572542975;
            this.species[5].socialForce [ 2] = -1.8085324729311711;
            this.species[5].socialRadius[ 2] = 68.45202092362179;
            this.species[5].socialForce [ 3] = -3.919889662494427;
            this.species[5].socialRadius[ 3] = 59.604866184104864;
            this.species[5].socialForce [ 4] = -0.6521550514590828;
            this.species[5].socialRadius[ 4] = 23.004632444554883;
            this.species[5].socialForce [ 5] = 0.558211134611474;
            this.species[5].socialRadius[ 5] = 30.585164086962212;
            this.species[5].socialForce [ 6] = 0.4522945985521982;
            this.species[5].socialRadius[ 6] = 7.8240715455126155;
            this.species[5].socialForce [ 7] = 0.30758949535140623;
            this.species[5].socialRadius[ 7] = 23.939788618504192;
            this.species[5].socialForce [ 8] = 3.9003099059111026;
            this.species[5].socialRadius[ 8] = 44.12351099158426;
            this.species[5].socialForce [ 9] = -1.9421843566768082;
            this.species[5].socialRadius[ 9] = 63.40639303336535;
            this.species[5].socialForce [ 10] = 2.590489586783807;
            this.species[5].socialRadius[ 10] = 44.32429779199575;
            this.species[5].socialForce [ 11] = 0.9932887058502438;
            this.species[5].socialRadius[ 11] = 48.07948026003949;
            this.species[5].steps = 1;
            this.species[6].socialForce [ 0] = 0.3684209115696735;
            this.species[6].socialRadius[ 0] = 17.41238347779523;
            this.species[6].socialForce [ 1] = 2.7088195480476713;
            this.species[6].socialRadius[ 1] = 48.905336475075195;
            this.species[6].socialForce [ 2] = 1.6813934932196197;
            this.species[6].socialRadius[ 2] = 13.0610505089443;
            this.species[6].socialForce [ 3] = 3.857236380649404;
            this.species[6].socialRadius[ 3] = 40.359431502298634;
            this.species[6].socialForce [ 4] = 2.3404834194199644;
            this.species[6].socialRadius[ 4] = 25.580028201461758;
            this.species[6].socialForce [ 5] = 3.788844517384625;
            this.species[6].socialRadius[ 5] = 46.45202579585591;
            this.species[6].socialForce [ 6] = -1.4701665965546447;
            this.species[6].socialRadius[ 6] = 17.005344910462608;
            this.species[6].socialForce [ 7] = 2.8645400983645306;
            this.species[6].socialRadius[ 7] = 56.729154954344;
            this.species[6].socialForce [ 8] = 1.0612676357485196;
            this.species[6].socialRadius[ 8] = 49.80487543100134;
            this.species[6].socialForce [ 9] = -1.9674120306545184;
            this.species[6].socialRadius[ 9] = 49.784878954783984;
            this.species[6].socialForce [ 10] = 2.8801054895983604;
            this.species[6].socialRadius[ 10] = 53.70760376167216;
            this.species[6].socialForce [ 11] = -2.0296815386249403;
            this.species[6].socialRadius[ 11] = 20.288541608387785;
            this.species[6].steps = 1;
            this.species[7].socialForce [ 0] = -0.03743633291406567;
            this.species[7].socialRadius[ 0] = 32.610462682760726;
            this.species[7].socialForce [ 1] = -2.684337870518025;
            this.species[7].socialRadius[ 1] = 61.27478736835891;
            this.species[7].socialForce [ 2] = -3.8789933763592437;
            this.species[7].socialRadius[ 2] = 73.31784617206436;
            this.species[7].socialForce [ 3] = -0.5631298467739345;
            this.species[7].socialRadius[ 3] = 69.72303170520844;
            this.species[7].socialForce [ 4] = 1.7570630565668282;
            this.species[7].socialRadius[ 4] = 50.61289760433746;
            this.species[7].socialForce [ 5] = -2.1798355463549033;
            this.species[7].socialRadius[ 5] = 71.7637373785018;
            this.species[7].socialForce [ 6] = -1.6049877040754996;
            this.species[7].socialRadius[ 6] = 60.92533407295335;
            this.species[7].socialForce [ 7] = -1.591301107429965;
            this.species[7].socialRadius[ 7] = 69.97152912324606;
            this.species[7].socialForce [ 8] = -3.3533983301685613;
            this.species[7].socialRadius[ 8] = 7.13500676672375;
            this.species[7].socialForce [ 9] = 1.1230119813981432;
            this.species[7].socialRadius[ 9] = 44.18983340617562;
            this.species[7].socialForce [ 10] = -2.307468169143;
            this.species[7].socialRadius[ 10] = 60.2171290647965;
            this.species[7].socialForce [ 11] = -1.8395770058122984;
            this.species[7].socialRadius[ 11] = 22.550701510101792;
            this.species[7].steps = 0;
            this.species[8].socialForce [ 0] = -3.8267391225226657;
            this.species[8].socialRadius[ 0] = 45.68745514010258;
            this.species[8].socialForce [ 1] = -1.9969967237378974;
            this.species[8].socialRadius[ 1] = 5.024318159021252;
            this.species[8].socialForce [ 2] = -2.934161563601082;
            this.species[8].socialRadius[ 2] = 63.658697114466975;
            this.species[8].socialForce [ 3] = -3.740679556129015;
            this.species[8].socialRadius[ 3] = 57.49108357664291;
            this.species[8].socialForce [ 4] = 2.70948489236069;
            this.species[8].socialRadius[ 4] = 47.48467172819946;
            this.species[8].socialForce [ 5] = -2.9200393141712517;
            this.species[8].socialRadius[ 5] = 13.577739265531857;
            this.species[8].socialForce [ 6] = 3.3389972867523845;
            this.species[8].socialRadius[ 6] = 46.53275200437179;
            this.species[8].socialForce [ 7] = 3.342232906318536;
            this.species[8].socialRadius[ 7] = 57.39709950789376;
            this.species[8].socialForce [ 8] = 0.1205772317923941;
            this.species[8].socialRadius[ 8] = 11.221351777181964;
            this.species[8].socialForce [ 9] = 2.840686537655019;
            this.species[8].socialRadius[ 9] = 24.225052493176218;
            this.species[8].socialForce [ 10] = -3.498083705272098;
            this.species[8].socialRadius[ 10] = 57.409010924976776;
            this.species[8].socialForce [ 11] = -2.8135876021806574;
            this.species[8].socialRadius[ 11] = 43.8306549291934;
            this.species[8].steps = 1;
            this.species[9].socialForce [ 0] = -3.520628450586944;
            this.species[9].socialRadius[ 0] = 47.264275009170674;
            this.species[9].socialForce [ 1] = 3.7631309894501914;
            this.species[9].socialRadius[ 1] = 19.266064018762016;
            this.species[9].socialForce [ 2] = -1.6837623397845327;
            this.species[9].socialRadius[ 2] = 72.8702840373934;
            this.species[9].socialForce [ 3] = 0.15685482622406077;
            this.species[9].socialRadius[ 3] = 65.09861099562602;
            this.species[9].socialForce [ 4] = -0.44688520334295845;
            this.species[9].socialRadius[ 4] = 21.35613456008749;
            this.species[9].socialForce [ 5] = -1.3940014924390631;
            this.species[9].socialRadius[ 5] = 30.87162369561083;
            this.species[9].socialForce [ 6] = -1.360858680554509;
            this.species[9].socialRadius[ 6] = 34.46351338985762;
            this.species[9].socialForce [ 7] = 1.266369454552068;
            this.species[9].socialRadius[ 7] = 39.32344408998522;
            this.species[9].socialForce [ 8] = 1.3339683465339949;
            this.species[9].socialRadius[ 8] = 48.85371257026933;
            this.species[9].socialForce [ 9] = 0.3952462155889229;
            this.species[9].socialRadius[ 9] = 45.000388103151145;
            this.species[9].socialForce [ 10] = 2.454244871367198;
            this.species[9].socialRadius[ 10] = 54.771837154193655;
            this.species[9].socialForce [ 11] = -1.963820282997851;
            this.species[9].socialRadius[ 11] = 8.32651611832242;
            this.species[9].steps = 0;
            this.species[10].socialForce [ 0] = -1.2924109492432923;
            this.species[10].socialRadius[ 0] = 22.22205099169403;
            this.species[10].socialForce [ 1] = -3.390344947932869;
            this.species[10].socialRadius[ 1] = 5.741241174695658;
            this.species[10].socialForce [ 2] = 3.469309773901921;
            this.species[10].socialRadius[ 2] = 27.599270598699402;
            this.species[10].socialForce [ 3] = -2.289655999656228;
            this.species[10].socialRadius[ 3] = 34.16258785602287;
            this.species[10].socialForce [ 4] = -3.9314782112426148;
            this.species[10].socialRadius[ 4] = 36.40419966259936;
            this.species[10].socialForce [ 5] = 2.9872041582373825;
            this.species[10].socialRadius[ 5] = 14.095713411923002;
            this.species[10].socialForce [ 6] = -1.722548529825243;
            this.species[10].socialRadius[ 6] = 67.41573004208195;
            this.species[10].socialForce [ 7] = 0.25393759157847917;
            this.species[10].socialRadius[ 7] = 10.801089153825833;
            this.species[10].socialForce [ 8] = -3.843656072293644;
            this.species[10].socialRadius[ 8] = 4.365607139243316;
            this.species[10].socialForce [ 9] = 0.9684566345251966;
            this.species[10].socialRadius[ 9] = 10.070848941872791;
            this.species[10].socialForce [ 10] = 3.2677922850675305;
            this.species[10].socialRadius[ 10] = 25.41264692390017;
            this.species[10].socialForce [ 11] = 1.7862351778093828;
            this.species[10].socialRadius[ 11] = 51.83793074487167;
            this.species[10].steps = 3;
            this.species[11].socialForce [ 0] = 1.0133954345825291;
            this.species[11].socialRadius[ 0] = 12.196461417685393;
            this.species[11].socialForce [ 1] = 0.7041322369226215;
            this.species[11].socialRadius[ 1] = 47.53519654556223;
            this.species[11].socialForce [ 2] = 0.8393465902134665;
            this.species[11].socialRadius[ 2] = 24.832950998589283;
            this.species[11].socialForce [ 3] = -0.5282457853831666;
            this.species[11].socialRadius[ 3] = 7.80246783597418;
            this.species[11].socialForce [ 4] = 3.839173725054861;
            this.species[11].socialRadius[ 4] = 64.13406527360796;
            this.species[11].socialForce [ 5] = 1.059743178817783;
            this.species[11].socialRadius[ 5] = 14.896091762401866;
            this.species[11].socialForce [ 6] = 2.1497757098979644;
            this.species[11].socialRadius[ 6] = 58.76028779722146;
            this.species[11].socialForce [ 7] = 3.68522924244772;
            this.species[11].socialRadius[ 7] = 29.997400720396534;
            this.species[11].socialForce [ 8] = 0.45826601561131675;
            this.species[11].socialRadius[ 8] = 32.55112761551895;
            this.species[11].socialForce [ 9] = 1.2231339691237775;
            this.species[11].socialRadius[ 9] = 5.779111349260692;
            this.species[11].socialForce [ 10] = 3.219695583879032;
            this.species[11].socialRadius[ 10] = 70.0508959821433;
            this.species[11].socialForce [ 11] = 2.3973160498915895;
            this.species[11].socialRadius[ 11] = 46.74756654973118;
            this.species[11].steps = 1;
		}		
	}

	//--------------------------------------------
    this.setPlanetValues = function( i, j, f, r )
    {
        this.species[i].socialForce [i] = f;
        this.species[i].socialForce [j] = f;
        this.species[j].socialForce [i] = f;
        this.species[j].socialForce [j] = f;

        this.species[i].socialRadius[i] = r;
        this.species[i].socialRadius[j] = r;
        this.species[j].socialRadius[i] = r;
        this.species[j].socialRadius[j] = r;
    }
    
	//--------------------------------
	this.save = function( filename )
	{
		console.log( "//______________________________________________________________" );
		console.log( "// saving ecosystem '" + filename + "'" );
		console.log( "//______________________________________________________________" );
		
		console.log( "this.numParticles = " + this.numParticles + ";" );
		console.log( "this.numSpecies = " 	+ this.numSpecies 	+ ";" );
		console.log( "this.initMode = " 	+ this.initMode 	+ ";" );
		console.log( "this.diskSize = " 	+ this.diskSize 	+ ";" );
		console.log( "this.blur = " 		+ this.blur		 	+ ";" );
		console.log( "this.scale = " 		+ this.scale	 	+ ";" );
		
		for (let s=0; s<this.numSpecies; s++)
		{
			console.log( "// species " + s + ":" );
			console.log( "this.species[" + s + "].steps = "  + this.species[s].steps + ";" );
			console.log( "this.species[" + s + "].setColor( " + this.species[s].red + ", " + this.species[s].green + ", " + this.species[s].blue + ", " + this.species[s].alpha + " );" );
			
			for (let o=0; o<this.numSpecies; o++)
			{
				console.log( "// force field for species " + o + ":" );
				console.log( "this.species[" + s + "].collisionForce[" + o + "] = " 	+ this.species[s].collisionForce 	[o] + ";" );
				console.log( "this.species[" + s + "].collisionRadius[" + o + "] = " 	+ this.species[s].collisionRadius	[o] + ";" );
				console.log( "this.species[" + s + "].socialForce[" + o + "] = " 		+ this.species[s].socialForce 		[o] + ";" );
				console.log( "this.species[" + s + "].socialRadius[" + o + "] = " 		+ this.species[s].socialRadius		[o] + ";" );
			}
		}
	}
}










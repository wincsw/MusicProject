var canvasID = document.getElementById( 'canvas' );
var canvas = canvasID.getContext( '2d' );

"use strict";

//-----------------
function Particles()
{
    const ZERO     			= 0.0;
    const ONE_HALF 			= 0.5;
    const ONE	   			= 1.0;
	const PARTICLE_RADIUS   = 3;
	const SPRING_LENGTH	   	= 200.0;
	const SPRING_FORCE   	= 0.0006;
    const WORLD_WIDTH       = 800.0;
    const WORLD_HEIGHT      = 600.0;
	const NUM_PARTICLES    	= 100;
	const SPRING_START_TIME	= 100;
    const DRAG				= 0.01;
    const INITIAL_HEAT		= 3.0;
    const PARTICLE_COLOR 	= "rgba( 200, 190, 180, 1.0 )";    
    const SPRING_COLOR 		= "rgba( 255, 255, 255, 0.6 )";    
	const MILLISECONDS_PER_UPDATE = 1;

    //-------------------------
    // particle 'class'
    //-------------------------
	function Particle()
	{
		this.position = new Vector2D();
		this.velocity = new Vector2D();
	}

    //-----------------------------------------------------------
    // local variables
    //-----------------------------------------------------------
	let _particles = new Array( NUM_PARTICLES );
	let _showingSpringDemo = false;
	let _clock = 0;

    for (let p=0; p<NUM_PARTICLES; p++)
    {
        _particles[p] = new Particle(); 
    }		
	    
	//------------------------------------------------------------
	// start up the timer
	//------------------------------------------------------------
	this.timer = setTimeout( "particles.update()", MILLISECONDS_PER_UPDATE );		

	//--------------------------
	this.initialize = function()
    {	  
    	_clock = 0;
    
		//----------------------------------
		// randomize the particles
		//----------------------------------
	    for (let p=0; p<NUM_PARTICLES; p++)
		{
    		_particles[p].position.x = PARTICLE_RADIUS + ( WORLD_WIDTH  - PARTICLE_RADIUS * 2 ) * Math.random();
    		_particles[p].position.y = PARTICLE_RADIUS + ( WORLD_HEIGHT - PARTICLE_RADIUS * 2 ) * Math.random();
            _particles[p].velocity.x = -INITIAL_HEAT * ONE_HALF + Math.random() * INITIAL_HEAT;
            _particles[p].velocity.y = -INITIAL_HEAT * ONE_HALF + Math.random() * INITIAL_HEAT;    		            
		}		
		
		
				let midX = WORLD_WIDTH  * 0.5;
				let midY = WORLD_HEIGHT * 0.5;
				let s 	 = WORLD_HEIGHT * 0.3;
				let j 	 = WORLD_HEIGHT * 0.3;
				
	    		_particles[0].position.x = midX - s;
	    		_particles[0].position.y = midY;
	    		
	    		_particles[1].position.x = midX + s;
	    		_particles[1].position.y = midY;


	    		_particles[0].position.x += -j * 0.5 + j * Math.random();
	    		_particles[0].position.y += -j * 0.5 + j * Math.random();
	    		
	    		_particles[1].position.x += -j * 0.5 + j * Math.random();
	    		_particles[1].position.y += -j * 0.5 + j * Math.random();		
		
		
    }
    

	//--------------------------------
	this.setSpringDemo = function(s)
    {
    	_showingSpringDemo = s;	
    	
    	//console.log( _showingSpringDemo );      	
    }

	//-----------------------
	this.update = function()
	{	     
		if ( _showingSpringDemo )
		{
			_clock ++;
			
			if ( _clock === SPRING_START_TIME )
			{
				/*
				let midX = WORLD_WIDTH  * 0.5;
				let midY = WORLD_HEIGHT * 0.5;
				let s 	 = WORLD_HEIGHT * 0.3;
				let j 	 = WORLD_HEIGHT * 0.3;
				
	    		_particles[0].position.x = midX - s;
	    		_particles[0].position.y = midY;
	    		
	    		_particles[1].position.x = midX + s;
	    		_particles[1].position.y = midY;


	    		_particles[0].position.x += -j * 0.5 + j * Math.random();
	    		_particles[0].position.y += -j * 0.5 + j * Math.random();
	    		
	    		_particles[1].position.x += -j * 0.5 + j * Math.random();
	    		_particles[1].position.y += -j * 0.5 + j * Math.random();
	    		*/
			}
			else if ( _clock > SPRING_START_TIME )
			{
				let dx = _particles[1].position.x - _particles[0].position.x;
				let dy = _particles[1].position.y - _particles[0].position.y;

				let distance = Math.sqrt( dx*dx + dy*dy );
				
				if ( distance > 0.0 )
				{
					let force = ( distance - SPRING_LENGTH ) * SPRING_FORCE;
				
					_particles[0].velocity.x += dx/distance * force;
					_particles[0].velocity.y += dy/distance * force;

					_particles[1].velocity.x -= dx/distance * force;
					_particles[1].velocity.y -= dy/distance * force;
				}
			}
		}

		//---------------------------------------
		// update particle physics
		//---------------------------------------
	    for (let p=0; p<NUM_PARTICLES; p++)
		{
			//----------------------------------
			// continual drag
			//----------------------------------
			_particles[p].velocity.scale( ONE - DRAG );

			//-------------------------------------------------------------------------
			// world boundary collisions
			//-------------------------------------------------------------------------
			let penetration = _particles[p].position.x - ( WORLD_WIDTH - PARTICLE_RADIUS )
			if ( penetration > ZERO )
			{
				_particles[p].velocity.x -= penetration;
			}
	
			penetration = PARTICLE_RADIUS - _particles[p].position.x;
			if ( penetration > ZERO )
			{
				_particles[p].velocity.x += penetration;
			}

			penetration = _particles[p].position.y - ( WORLD_HEIGHT - PARTICLE_RADIUS )
			if ( penetration > ZERO )
			{
				_particles[p].velocity.y -= penetration;
			}
	
			penetration = PARTICLE_RADIUS - _particles[p].position.y;
			if ( penetration > ZERO )
			{
				_particles[p].velocity.y += penetration;
			}

			//---------------------------------------------------------
			// add velocity to position
			//---------------------------------------------------------
			_particles[p].position.add( _particles[p].velocity );   
        }

		//---------------------------
		// render everything...
		//---------------------------
		this.render();

		//---------------------------
		// trigger next update...
		//---------------------------
		this.timer = setTimeout( "particles.update()", MILLISECONDS_PER_UPDATE );
	} 

	//------------------------
	this.render = function()
	{
		//-------------------------------------------
		// clear the screen
		//-------------------------------------------
        canvas.fillStyle = "rgb( 0, 0, 0 )";
        canvas.fillRect( 0, 0, WORLD_WIDTH + 1, WORLD_HEIGHT + 1 );	        

		canvas.lineWidth = 1;
        canvas.strokeStyle = "rgb( 180, 190, 200 )";
        canvas.strokeRect( 1, 1, WORLD_WIDTH, WORLD_HEIGHT );	        
            
		//-------------------------------------------
		// render the particles
		//-------------------------------------------	
        for (let p=0; p<NUM_PARTICLES; p++)
		{   
			canvas.fillStyle = PARTICLE_COLOR;
			canvas.beginPath();
			canvas.arc( _particles[p].position.x, _particles[p].position.y, PARTICLE_RADIUS, ZERO, Math.PI * 2, false );
			canvas.fill();
			canvas.closePath();	
		}
		
		if ( _showingSpringDemo )
		{
			if ( _clock > SPRING_START_TIME )
			{
				canvas.lineWidth = 2;
				canvas.strokeStyle = SPRING_COLOR;
				canvas.beginPath();
				canvas.moveTo( _particles[0].position.x, _particles[0].position.y );
				canvas.lineTo( _particles[1].position.x, _particles[1].position.y );
				canvas.stroke();
			}
		}
 	}
}


//--------------------------------
document.onmousedown = function(e) 
{
	particles.initialize();
}


// Touch events
document.ontouchstart = function(e) 
{
    // Prevent default behavior (e.g., scrolling)
    e.preventDefault();
    
    // Get touch coordinates
    const touch = e.touches[0]; // Get the first touch point
    //const x = touch.pageX - canvasRectangle.left;
    //const y = touch.pageY - canvasID.offsetTop;
    
    particles.mouseDown( touch.pageX -canvasRectangle.left, touch.pageY-canvasID.offsetTop );
};
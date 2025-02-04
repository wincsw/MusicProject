
"use strict";

const PARTICLE_RADIUS =  2.7;

//----------------------
function Particle()
{	
	const DEFAULT_FRICTION = 0.2;

	this.position 	= new Vector2D();
	this.velocity 	= new Vector2D();
	this.forces 	= new Array( MAX_FORCE_STEPS );
	
	let viewPositionX 	= viewportWidth;
	let viewPositionY 	= viewportHeight;
	
	let _red		= ZERO;
	let _green		= ZERO;
	let _blue		= ZERO;
	let _alpha		= ZERO;
	let _color 		= "rgb( 128, 128, 128 )"; 
	let _friction 	= DEFAULT_FRICTION;
	
	let _halo		= false;
	let _haloAlpha  = ZERO;
	let _haloRadius = ZERO;
	
_halo = false;	
_haloAlpha  = 0.1;
_haloRadius = PARTICLE_RADIUS * 3.0;
	
	
	
	for (let f=0; f<MAX_FORCE_STEPS; f++)
	{
		this.forces[f] = new Vector2D();
	}
	
	//------------------------
	this.update = function()
	{	
		//---------------------------------------
		// friction
		//---------------------------------------
		this.velocity.scale( ONE - _friction );
					
		//---------------------------------------
		// update position by velocity
		//---------------------------------------
		this.position.add( this.velocity );		

		//---------------------------------------
		// wall collisions
		//---------------------------------------
		this.updateWallCollisions();
	}
	
	//-------------------------------------
	this.updateWallCollisions = function()
	{
		let r = PARTICLE_RADIUS + 2;
	
		if ( this.position.x < r ) 
		{ 
			this.position.x = r; if ( this.velocity.x < ZERO ) { this.velocity.x *= -ONE; }    
		}
		else if ( this.position.x > viewportWidth - r ) 
		{ 
			this.position.x = viewportWidth - r; if ( this.velocity.x > ZERO ) { this.velocity.x *= -ONE; }    
		}      
		if ( this.position.y < r ) 
		{ 
			this.position.y = r; if ( this.velocity.y < ZERO ) { this.velocity.y *= -ONE; }    
		}
		else if ( this.position.y > viewportHeight - r ) 
		{ 
			this.position.y = viewportHeight - r; if ( this.velocity.y > ZERO ) { this.velocity.y *= -ONE; }    
		}
	}	
	
	//----------------------------------------------------------------------------
	// setters
	//----------------------------------------------------------------------------
	this.setPosition 	= function( x, y	) {	this.position.setXY( x, y ); }
	this.setColor 	 	= function( c		) { _color 		= c; }			
	this.setFriction 	= function( f		) {	_friction 	= f; }
	this.setHalo	 	= function( h		) { _halo 		= h; }
	
	//------------------------------------------
	this.setColorRGBA = function( r, g, b, a ) 
	{	
		_red	= r; 
		_green	= g; 
		_blue	= b; 
		_alpha	= a; 
		
		_color = "rgba( " + _red + ", " + _green + ", " + _blue + ", " + _alpha + " )"
	}

	//---------------------------------
	this.addForce = function( x, y )
	{		
		this.velocity.addXY( x, y );
	}
			
	//------------------------------
	this.render = function( view )
	{		
		/*
		let x = viewportWidth  - view.position.x - this.position.x;
		let y = viewportHeight - view.position.y - this.position.y;
		let s = view.scale * PARTICLE_RADIUS; 
		*/
		
		//console.log ( view.scale );
		
		let xMid = viewportWidth  * ONE_HALF; 
		let yMid = viewportHeight * ONE_HALF; 
		
		let xDelta = this.position.x - xMid
		let yDelta = this.position.y - yMid; 

		let x = xMid + xDelta * view.scale;
		let y = yMid + yDelta * view.scale;
		let s = PARTICLE_RADIUS  * view.scale; 
		
		/*
		let x = viewportWidth  * 0.5 + this.position.x - viewportWidth  * view.scale;
		let y = viewportHeight * 0.5 + this.position.y - viewportHeight * view.scale;
		let s = PARTICLE_RADIUS * view.scale; 
		*/
		
		canvas.fillStyle = _color;
		canvas.beginPath();
		canvas.arc( x, y, s, 0, Math.PI*2, false );
		canvas.fill();
		canvas.closePath();	

		if ( _halo )
		{
//canvas.fillStyle = "rgba( 255, 255, 255, 0.05 )"; 
canvas.fillStyle = "rgba( " + _red + ", " + _green + ", " + _blue + ", " + _haloAlpha + ")";
			
			canvas.beginPath();
			canvas.arc( x, y, _haloRadius, 0, Math.PI*2, false );
			canvas.fill();
			canvas.closePath();	
		}	
	}
}


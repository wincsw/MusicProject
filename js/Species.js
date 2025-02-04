"use strict";

//-------------------
function Species()
{	
	this.steps  			= 0;
	this.halo				= false;
	this.averageForces		= false;
	this.nonAverageForce	= ZERO;
	this.friction			= ZERO;
	this.red				= ZERO;
	this.green				= ZERO;
	this.blue				= ZERO;
	this.alpha				= ZERO;
	this.color 				= "rgba( 0.0, 0.0, 0.0, 0.0 )";
	this.collisionForce 	= new Array( MAX_SPECIES );  // inner force
	this.collisionRadius	= new Array( MAX_SPECIES );  // inner radius
	this.socialForce  		= new Array( MAX_SPECIES );  // outer force
	this.socialRadius 		= new Array( MAX_SPECIES );  // outer radius
	this.socialRamp			= new Array( MAX_SPECIES );  // bool: whether or not the force field ramps down.
	this.delay		 		= new Array( MAX_SPECIES );  // (steps)
	
	//---------------------------------------
	this.setColor = function( r, g, b, a )
	{
		this.red 	= r;
		this.green 	= g;
		this.blue 	= b;
		this.alpha 	= a;
		
		this.color 	= "rgba( " + r + ", " + g + ", " + b + ", " + a + " )";
	}
}
"use strict";
	
const NUM_SENSORS		= 200;//100;
const SENSOR_RADIUS 	= 20;
const SENSOR_INERTIA	= 0.93;
const SENSOR_ATTRACTION	= 0.01;//0.05;
	
//----------------------
function Sensor()
{
	this.startPosition 	= new Vector2D();
	this.position 		= new Vector2D();
	this.velocity 		= new Vector2D();	
	
	//------------------------------
	this.initialize = function()
	{
		this.startPosition.setXY( Math.random() * canvasID.width, Math.random() * canvasID.height );
		this.position.copyFrom( this.startPosition );
		this.velocity.clear();		
	}
	
	//------------------------------
	this.update = function()
	{
		this.velocity.scale( SENSOR_INERTIA );
		this.position.add( this.velocity );
	}
	
	//---------------------------------
	this.addForce = function( x, y )
	{
		this.velocity.addXY( x, y );
	}
	
	//------------------------------
	this.render = function()
	{
		canvas.strokeStyle = "rgba( 255, 255, 255, 0.2 )";
		canvas.lineWidth = 1;
		canvas.beginPath();
		canvas.moveTo( this.startPosition.x, this.startPosition.y );
		canvas.lineTo( this.position.x, this.position.y );
		canvas.stroke();	
	
		canvas.fillStyle = "rgb( 100, 100, 100 )";
		canvas.beginPath();
		canvas.arc(  this.startPosition.x,  this.startPosition.y, 1.5, 0, Math.PI*2, false );
		canvas.fill();
		canvas.closePath();	

		canvas.fillStyle = "rgb( 255, 255, 255 )";
		canvas.beginPath();
		canvas.arc(  this.position.x,  this.position.y, 1.5, 0, Math.PI*2, false );
		canvas.fill();
		canvas.closePath();	

		/*
		canvas.strokeStyle = "rgba( 255, 255, 255, 0.2 )";
		canvas.beginPath();
		canvas.arc(  this.position.x,  this.position.y, SENSOR_RADIUS, 0, Math.PI*2, false );
		canvas.stroke();
		canvas.closePath();	
		*/
	}
}
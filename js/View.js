"use strict";

//---------------
function View()
{	
	this.position = new Vector2D();
	this.scale = ZERO;
		
	//------------------------
	this.initialize = function()
	{
		this.position.clear();
		this.scale = ONE;
	}
	
	//------------------------
	this.update = function()
	{
		//_clock ++;
		//this.scale = 1.0 + ( 3 - 3 * Math.sin( _clock * 0.01 ) );
	}
}
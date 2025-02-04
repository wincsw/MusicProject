
"use strict";

//------------------
function ForceEditor()
{	
	let _width	= ZERO;
	let _height	= ZERO;
	let _left 	= ZERO;
	let _top 	= ZERO;
	let _mouseX	= ZERO;
	let _mouseY	= ZERO;
	//let _editCanvasID = null;
	//let _editCanvas   = null;


	//---------------------------
	this.initialize = function()
	{	
        //console.log( "initialize force editor!" );	
        
		//_editCanvasID = document.getElementById( 'editCanvas' );
		//_editCanvas = _editCanvasID.getContext( '2d' );
	}

	//---------------------------------------------------
	this.update = function( mouseX, mouseY, mouseDown )
	{	
		/*
		let rect = _editCanvasID.getBoundingClientRect();
		
		_left = rect.left + window.scrollX;
		_top  = rect.top  + window.scrollY;

		_mouseX = mouseX - _left;
		_mouseY = mouseY - _top;
		
		//console.log( "rect = " + _left + ", " + _top );	
		//console.log( "mouse = " + _mouseX + ", " + _mouseY );	
		
	
		if ( mouseDown )
		{
		}	
		*/
    } 
    
	//------------------------
	this.render = function()
	{	
		/*
		//let editCanvas   = editCanvasID.getContext( '2d' );

		_width  = _editCanvasID.width;
		_height = _editCanvasID.height;

		_editCanvas.fillStyle = "rgb( 200, 193, 180 )";
		_editCanvas.fillRect( 0, 0, _width, _height );

		_editCanvas.lineWidth = 2; 
		_editCanvas.lineWidth = 1.0; 
		_editCanvas.strokeStyle = "rgb( 0, 0, 100 )";
		_editCanvas.beginPath();
		_editCanvas.moveTo( 2,  2 );
		//_editCanvas.lineTo( xx, yy );
		_editCanvas.stroke();
		_editCanvas.closePath();
		
		_editCanvas.fillStyle = "rgb( 0, 100, 100 )";
		_editCanvas.beginPath();
		_editCanvas.arc( _mouseX, _mouseY, 2, 0, Math.PI*2, false );
		_editCanvas.fill();	
		
		//---------------------------------
		// frame
		//---------------------------------
		_editCanvas.lineWidth = 2; 
		_editCanvas.strokeStyle = "rgb( 100,  90,  80 )";
		_editCanvas.strokeRect( 2, 2, _width - 2, _height - 2 );  
		*/      
    }
}				
				
				
		
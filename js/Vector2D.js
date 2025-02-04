"use strict";

function Vector2D()
{	
	this.x = 0.0;
	this.y = 0.0;


	//----------------------------------
	this.setXY = function( x_, y_ )
	{	
		this.x = x_;
		this.y = y_;
	}


	//--------------------------
	this.copyFrom = function(v)
	{	
		this.x = v.x;
		this.y = v.y;
	}


	//--------------------------------------
	this.addXY  = function( x_, y_ )
	{
		this.x += x_;
		this.y += y_;	
	}
	
	
	//-----------------------
	this.set = function( p_ )
	{
		this.x = p_.x;
		this.y = p_.y;
	}
	
	/*
	//---------------------------------
	this.setToSum = function( v1, v2 )
	{
		x = v1.getX() + v2.getX();
		y = v1.getY() + v2.getY();
	} 
	*/

	//----------------------------------------
	this.setToDifference = function( v1, v2 )
	{
		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;		
	} 


	/*
	//-------------------------------------
	this.setToAverage = function( v1, v2 )
	{
		x = ( v1.getX() + v2.getX() ) * 0.5;
		y = ( v1.getY() + v2.getY() ) * 0.5;	
	}
	*/


	//-------------------------------------------------------------------------------------------
	this.normalize = function()
	{
		let m = Math.sqrt( this.x * this.x + this.y * this.y );
		
		if ( m > 0 )
		{
			this.x /= m;
			this.y /= m;
		}
		else
		{
			this.x = 1.0;
			this.y = 0.0;
		}
	} 


	
	//------------------------
	this.add = function( v )
	{
		this.x += v.x;
		this.y += v.y;
		
	} 

	
	//---------------------------- 
	this.subtract = function( v )
	{
		this.x -= v.x;
		this.y -= v.y;	
	}
	
	//-----------------------------------
	this.getMagnitude = function()
	{
		return Math.sqrt( this.x * this.x + this.y * this.y );
	}

	//-----------------------------------
	this.getMagnitudeSquared = function()
	{
		return this.x * this.x + this.y * this.y;
	}

	//-----------------------
	this.clear = function()
	{
		this.x = 0.0;
		this.y = 0.0;
	}
	
	//-------------------------
	this.scale = function( s )
	{
		this.x *= s;
		this.y *= s;
	}
	
	
	//----------------------------------------------
	this.addScaled = function( vectorToAdd, scale ) 
	{ 
		this.x += vectorToAdd.x * scale; 
		this.y += vectorToAdd.y * scale; 
	}
	
	//----------------------------------------------------------
	this.subtractScaled = function( vectorToSubtract, scale ) 
	{ 
		this.x -= vectorToSubtract.x * scale; 
		this.y -= vectorToSubtract.y * scale; 
	}


	//--------------------------
	this.dotWith = function( v )
	{
		return this.x * v.x + this.y * v.y;		
	} 
	
	

	//-----------------------------------------------------------
	this.setToRandomLocationInDisk = function( position, radius )
	{
		let radian = PI2 * Math.random();
		let magnitude = radius * Math.sqrt( Math.random() );

        this.x = position.x + Math.sin( radian ) * magnitude;
        this.y = position.y + Math.cos( radian ) * magnitude;
	}
	
	//-----------------------------------------------
    this.getDistanceSquaredTo = function( position )
    {
        let xx = this.x - position.x;
        let yy = this.y - position.y;
        return xx * xx + yy * yy;
    }


	//-----------------------------------------
    this.getDistanceTo = function( position )
    {
        let xx = this.x - position.x;
        let yy = this.y - position.y;
        return Math.sqrt( xx * xx + yy * yy );
    }


	//------------------------------------
    this.setToPerpendicular = function()
    {
        let px =  this.y;
        let py = -this.x;
        
        this.x = px;
        this.y = py;        
    }


    /*
	//-------------------------------------------------------------------
    this.getClosestPointOnLineSegment = function( segmentEnd1, segmentEnd2 )
    {        
        let position = new Vector2D();
        position.setXY( x, y );
        
        let vectorFromEnd1ToPosition = new Vector2D();        
        vectorFromEnd1ToPosition.set( position );
        vectorFromEnd1ToPosition.subtract( segmentEnd1 );

        let segmentVector = new Vector2D();        
        segmentVector.set( segmentEnd2 );
        segmentVector.subtract( segmentEnd1 );
        
        let dot = vectorFromEnd1ToPosition.dotWith( segmentVector );
        if ( dot < 0.0 )
        {
            return segmentEnd1;
        }
        
        let squared = segmentVector.dotWith( segmentVector );
        if ( dot > squared )
        {
            return segmentEnd2;
        }
        
        let extent = dot / squared;

        let positionOnSegment = new Vector2D();
        positionOnSegment.set( segmentEnd1 );
        positionOnSegment.addScaled( segmentVector, extent );
        
        let vectorFromPositionToPositionOnSegment = new Vector2D();
        
        vectorFromPositionToPositionOnSegment.set( positionOnSegment );
        vectorFromPositionToPositionOnSegment.subtract( position );

        return positionOnSegment;
    }
	*/

	
	
/*
	//-------------------------------------------------------------------
    this.getDistanceToLineSegment = function( segmentEnd1, segmentEnd2 )
    {        
        //console.log( "position = " + x + ", " + y );

        //console.log( "segmentEnd1 = " + segmentEnd1.getX() + ", " +  segmentEnd1.getY() );
        //console.log( "segmentEnd2 = " + segmentEnd2.getX() + ", " +  segmentEnd2.getY() );
    
        let position = new Vector2D();
        position.setXY( x, y );
        
        let vectorFromEnd1ToPosition = new Vector2D();        
        vectorFromEnd1ToPosition.set( position );
        vectorFromEnd1ToPosition.subtract( segmentEnd1 );

        let segmentVector = new Vector2D();        
        segmentVector.set( segmentEnd2 );
        segmentVector.subtract( segmentEnd1 );

        //console.log( "segmentVector = " + segmentVector.getX() + ", " +  segmentVector.getY() );
        
        let dot = vectorFromEnd1ToPosition.dotWith( segmentVector );
        //console.log( "dot = " + dot );
        if ( dot < 0.0 )
        {
            //console.log( "dot is < 0" );
            let distance = vectorFromEnd1ToPosition.getMagnitude();
            return distance;
        }
        
        let squared = segmentVector.dotWith( segmentVector );
        //console.log( "segmentVector squared = " + squared ); 
        if ( dot > squared )
        {
            //console.log( "dot is > segmentVector squared" );
            let vectorFromEnd2ToPosition = new Vector2D();        
            vectorFromEnd2ToPosition.set( position );
            vectorFromEnd2ToPosition.subtract( segmentEnd2 );
            let distance = vectorFromEnd2ToPosition.getMagnitude();
            return distance;
        }
        
        //console.log( "dot is > 0.0 and < segmentVector squared " ); 
        
        let extent = dot / squared;

        //console.log( "extent = " + extent ); 

        let positionOnSegment = new Vector2D();
        positionOnSegment.set( segmentEnd1 );
        positionOnSegment.addScaled( segmentVector, extent );
        
        let vectorFromPositionToPositionOnSegment = new Vector2D();
        
        vectorFromPositionToPositionOnSegment.set( positionOnSegment );
        vectorFromPositionToPositionOnSegment.subtract( position );
        
        let distance = vectorFromPositionToPositionOnSegment.getMagnitude();
        return distance;
    }
*/

} //---------------------------------------------------------------------------------
 //---------------  END of class constructor ---------------------------------------
//---------------------------------------------------------------------------------





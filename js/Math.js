	
const INVISIBLE     = false;
const VISIBLE       = true;
const NULL_INDEX    = -1;
const BYTE_SIZE	    = 256;
const ZERO     	    = 0.0;
const ONE_HALF 	    = 0.5;
const ONE		 	= 1.0;
const ONE_THIRD     = ONE / 3.0;
const PI2 		    = Math.PI * 2.0;
const PI_OVER_180   = Math.PI / 180.0;
const MILLISECONDS_PER_SECOND = 1000;


let _clock      = 0;
let _maxClock   = 100;    

    
//---------------------------------------
function isADivisor( number, divisor )
{
    if ( divisor % number === 0 )
    {
        return true;
    }

    return false;
}

//------------------------------------
function getLargestDivisor( number )
{
    let squareRoot = Math.sqrt( number );
    
    for ( let divisor=2; divisor<=squareRoot; divisor++)
    {
        if ( isADivisor( number, divisor ) )
        {
            return number / divisor; 
        }
    }
    
    return 1;
}


// trying this with negative arguments!
//--------------------------
function isPrime( number )
{	
    if ( number < 0 )
    {
        number = -number;
    }
    
    if ( number < 2 )
    {
        return false;
    }
    else
    {
        let squareRoot = Math.sqrt( number );

        for ( let divisor=2; divisor<=squareRoot; divisor++)
        {
            if ( number % divisor === 0 )
            {
                return false;
            }
        }
    }

    return true;
}



    
/*
//--------------------------
function isPrime( number )
{	
    if ( number < 2 )
    {
        return false;
    }
    else
    {
        let squareRoot = Math.sqrt( number );

        for ( let divisor=2; divisor<=squareRoot; divisor++)
        {
            if ( number % divisor === 0 )
            {
                return false;
            }
        }
    }

    return true;
}
*/




//---------------------------------
function getNumDivisors( number )
{
    numDivisors = 0;

    let squareRoot = Math.sqrt( number );

    for ( let divisor=1; divisor<=squareRoot; divisor++)
    {
        if ( number % divisor === 0 )
        {
            numDivisors ++;
        }
    }

    return numDivisors;        
}






//--------------------------------------------------
function isASymmetricalPrime( number, primeTest )
{        
    //-----------------------------------------------------------------------
    // 1. Is 'primeTest' a prime number? 
    // 2. if yes, then...is its 'mirror-number' also a prime? 
    // 3. If yes, then return true.
    // 
    // 'mirror-number' is the number on the opposite side of 
    // 'number', having the same distance to 'number' as 'primeTest'
    //-----------------------------------------------------------------------

    _clock ++;        

    //number      = 16;
    //primeTest   = 4;

    let mirrorNumber = number + ( number - primeTest );
    
    if ( _clock < _maxClock )
    {
        console.log( "   " );
        console.log( "---------------------------------------------------------" );
        console.log( "Is " + primeTest + " a symmetrical prime of " + number + "?" );
    }
     
    if ( isPrime( primeTest ) )
    {
        if ( _clock < _maxClock )
        {
            console.log( "Well, " + primeTest + " is a prime." );
            console.log( "What is its mirror?" );
            console.log( "Its mirror is " + mirrorNumber + "." );
            console.log( "Is it also a prime?" );
        }

        if ( isPrime( mirrorNumber ) )
        {
            if ( _clock < _maxClock )
            {
                console.log( "Yes, it is a prime. We have a symmetrical prime!" );
                console.log( "   " );
            }

            return true;
        }
    }

    if ( _clock < _maxClock )
    {
        console.log( "No." );
        console.log( "   " );
    }
    
    return false;
}

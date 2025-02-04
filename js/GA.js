
//------------------
function GA()
{	
    "use strict";
    
    const DEFAULT_MUTATION_RATE  = 0.05;
    const DEFAULT_CROSSOVER_RATE = 0.1;
        
    function Individual()
    {
        this.fitness = ZERO;
        this.genes = new Array();
    }
    
    let _individuals    = new Array();
    let _maxGenes       = 0;
    let _numIndividuals = 0;
    let _mutationRate   = ZERO;
    let _crossoverRate  = ZERO;

	//-------------------------------------------------------
	this.initialize = function( numIndividuals, maxGenes )
	{
	    _numIndividuals = numIndividuals;
		_maxGenes = maxGenes;
	    
		console.log( "GA initialized with " + _numIndividuals + " individuals and " + _maxGenes + " genes." );
	    
    	_mutationRate  = DEFAULT_MUTATION_RATE;
    	_crossoverRate = DEFAULT_CROSSOVER_RATE;

        for (let p=0; p<_numIndividuals; p++)
	    {
	        _individuals[p] = new Individual();
        }

        this.randomizePopulationGenes();
	}
    	    
	//-----------------------------------------
	this.randomizePopulationGenes = function()
	{
        for (let p=0; p<_numIndividuals; p++)
	    {
	        this.randomizeGenes(p);      
	    }
	}

    //--------------------------------
    this.randomizeGenes = function(i)
    {
        for (let g=0; g<_maxGenes; g++)
        {
            _individuals[i].genes[g] = Math.random();
        }	        
    }
	
    //----------------------------------
    this.setMutationRate = function(m)
    {
        _mutationRate = m;
    }
	
    //----------------------------------
    this.setCrossoverRate = function(c)
    {
        _crossoverRate = c;
    }
	
    //--------------------------------------------
    this.setFitnessOfPopulation = function( f )
    {
	    //console.log( "setFitnessOfPopulation to " + f );    

        for (let i=0; i<_numIndividuals; i++)
	    {
	        this.setFitnessOfIndividual( i, f );
	    }
    }
    	
    //----------------------------------------------
    this.setFitnessOfIndividual = function( i, f )
    {
		//console.log( "setFitnessOfIndividual " + i + " to " + f );    
        _individuals[i].fitness = f;
    }
	
	// not working yet (roulette wheel scheme)
	
	/*
    //----------------------------------------------
    this.getRelativelyFitIndividual = function()
    {
	    console.log( "----------------------------------------" );    
	    console.log( "----------------------------------------" );    
	    console.log( "getRelativelyFitIndividual" );    
    
    	let result = 0;

		let sumFitness = ZERO;

        for (let i=0; i<_numIndividuals; i++)
	    {
	    	sumFitness += _individuals[i].fitness;
		}		
		
	    console.log( "sumFitness = " + sumFitness );    
		let randy = Math.random() * sumFitness;
	    console.log( "randy = " + randy );    
		
		let accumulatedFitness = ZERO;
		let testing = true;
		let i = 0;		
		
	    console.log( "accumulating fitness up to randy:" );    
        while ( testing )
	    {
	    	accumulatedFitness += _individuals[i].fitness;
	    	console.log( "accumulatedFitness " + accumulatedFitness );    
	    	
	    	if ( accumulatedFitness > randy )
	    	{
		    	console.log( "surpassed randy!" );    
	    		result = i;
	    		console.log( "chose " + result );    
				testing = false;
	    	}

	    	i ++;
	    	
	    	if ( i >= _numIndividuals )
	    	{
	    		console.log( "i = " + i + "; error in GA" );    
	    		testing = false;
	    	}
		}	    
			
    	return result;
    }
    */
    
    //---------------------------------------------------------------------
    this.getRelativelyFitIndividualByTourament = function( numCompetitors )
    {
        let highestFound = Math.floor( Math.random() * _numIndividuals ); 

        //console.log( "numSearches = " + numSearches );    

        for (let s=0; s<numCompetitors-1; s++)
	    {
            let test = Math.floor( Math.random() * _numIndividuals ); 
            
            //console.log( s );    
            
            if ( _individuals[ test ].fitness > _individuals[ highestFound ].fitness )
            {
    	        highestFound = test;
            }
        }

        //console.log( "highestFound = " + highestFound );    


        return highestFound;
    }

    //----------------------------------------------------
    this.randomizePopulationFitness = function( scale )
    {
        for (let i=0; i<_numIndividuals; i++)
	    {
	        _individuals[i].fitness = Math.random() * scale;
	    }
    }
    
    //----------------------------------------------
    this.decayAllFitnessValues = function( amount )
    {
        if ( amount > ONE ) { amount = ONE; }
        
        for (let i=0; i<_numIndividuals; i++)
	    {
	        _individuals[i].fitness *= ( ONE - amount );
	    }
    }
    
    //----------------------------------------------
    this.addToAllFitnessValues = function( amount )
    {
        for (let i=0; i<_numIndividuals; i++)
	    {
	    	//console.log( "before: " + _individuals[i].fitness );
	        _individuals[i].fitness += amount;
	    	//console.log( "after: " + _individuals[i].fitness );
	    }
    }

    //-------------------------------------------
    this.getLowestFitIndividual = function()
    {
        let lowestFitness = 1000; 
        let lowestIndividual = 0; 
        let randomStart = Math.floor( Math.random() * _numIndividuals );

        for (let i=0; i<_numIndividuals; i++)
	    {
	    	let r = ( i + randomStart ) % _numIndividuals;
	    	
			//if ( r < 0 					) { alert( "r < 0!" 			); }	    	
			//if ( r >= _numIndividuals 	) { alert( ">= _numIndividuals" ); }	    	
	    	
	        if ( _individuals[r].fitness < lowestFitness )
	        {
	            lowestFitness = _individuals[r].fitness;
	            lowestIndividual = r;
	        }
        }

        return lowestIndividual;
    }

    //------------------------------------
    this.getRandomIndividual = function()
    {
        return Math.floor( Math.random() * _numIndividuals ); 
    }

    //-----------------------------------------
    this.getFitnessOfIndividual = function(i)
    {
        return _individuals[i].fitness;
    }

    //------------------------------------
    this.getNumIndividuals = function()
    {
        return _numIndividuals;
    }

    //------------------------------------
    this.getGenes = function(i)
    {
        return _individuals[i].genes;
    }

    //--------------------------------------------
    this.loadPresetGenes = function( i, preset )
    {
		console.log( "GA: loadPreset " + preset + " for individual " + i );    

		if ( preset === 0 )
		{
		}
		else if ( preset === 1 )
		{
	    }
	}
	
	//---------------------------
	this.printGenes = function(i)
	{
		/*
		console.log( "//-------------------------------" );
		console.log( "// genes of creature " + i + ":" );
		console.log( "//-------------------------------" );
		*/
		
        for (let g=0; g<_maxGenes; g++)
        {
			console.log( "_individuals[" + i + "].genes[" + g + "] = " + _individuals[i].genes[g] );
		}
	}
		

    //--------------------------------------------------------------
    this.setAsChildOfParents = function( child, parent0, parent1 )
    {
        //console.log( "setAsChildOfParents: " + parent0 + ", " + parent1 );    
    
        let parent = parent0;
        
        for (let g=0; g<_maxGenes; g++)
        {
			//-------------------------------------------
			// crossover
			//-------------------------------------------
            if ( Math.random() < _crossoverRate )
            {
                if ( parent === parent0 ) 
                	 { parent = parent1; }
                else { parent = parent0; }
            }

			//-------------------------------------------
			// copy gene from parent
			//-------------------------------------------
            _individuals[ child ].genes[g] = _individuals[ parent ].genes[g];

            //-------------------------------------------
            // mutation
            //-------------------------------------------
            if ( Math.random() < _mutationRate )
            {
            	//---------------------------------------
            	// favor small mutations...
            	//---------------------------------------
                let m = Math.random() * Math.random();                
                if ( Math.random() > ONE_HALF )
                {
                	m = -m;
                }
                
                _individuals[ child ].genes[g] += m;
                
                	 if ( _individuals[ child ].genes[g] > ONE  ) { _individuals[ child ].genes[g] -= ONE; }
                else if ( _individuals[ child ].genes[g] < ZERO ) { _individuals[ child ].genes[g] += ONE; }
                
                // 	   if ( _individuals[ child ].genes[g] > ONE  ) { alert( "_individuals[ child ].genes[g] > ONE"  ); }
                //else if ( _individuals[ child ].genes[g] < ZERO ) { alert( "_individuals[ child ].genes[g] < ZERO" ); }                
            }       
        }	        
    }

    //--------------------------------------
    this.setGene = function( i, g, value )
    {
        _individuals[i].genes[g] = value;
    }
    
    //-------------------------------
    this.getGene = function( i, g )
    {
        return _individuals[i].genes[g];
    }
    
    //---------------------------------------
    this.getHighestFitIndividual = function()
    {
        let highstFitness = -1000; 
        let result = 0; 
		
        for (let i=0; i<_numIndividuals; i++)
	    {
	        if ( _individuals[i].fitness > highstFitness )
	        {
	            highstFitness = _individuals[i].fitness;
	            result = i;
	        }
        }


    	/*
        let randomStart = Math.floor( Math.random() * _numIndividuals );

        for (let i=0; i<_numIndividuals; i++)
	    {
	    	let r = ( i + randomStart ) % _numIndividuals;
	        if ( _individuals[r].fitness > highstFitness )
	        {
	            highstFitness = _individuals[r].fitness;
	            highestIndividual = r;
	        }
        }
        */
        
		//console.log( "highest fit individual = " + result );

        return result;
    }
    
    
    //-----------------------------------
    this.getHighestFitness = function()
    {
        let highstFitness = -1000; 
		
        for (let i=0; i<_numIndividuals; i++)
	    {
	        if ( _individuals[i].fitness > highstFitness )
	        {
	            highstFitness = _individuals[i].fitness;
	        }
        }

        return highstFitness;
    }
    
    //---------------------------------------------------------
    this.renderFitnessBars = function( left, top, width, height )
    {    	
    	let geneHeight = 6;
    	let geneWidth  = width / _numIndividuals;

		canvas.lineWidth = 2;
		//canvas.strokeStyle = 'rgba( 0, 0, 0, 0.3 )';
		canvas.strokeStyle = 'rgba( 255, 255, 255, 0.3 )';
		canvas.fillStyle   = 'rgba( 100, 120, 130, 0.9 )';
		canvas.beginPath();
		canvas.strokeRect( left, top, width, height );
		canvas.fillRect( left, top, width, height );
		
		canvas.moveTo( left,		 top + height );
		canvas.lineTo( left + width, top + height );

		canvas.closePath();
		canvas.stroke();	 
		
		canvas.lineWidth = 1;
        for (let i=0; i<_numIndividuals; i++)
	    {
			//------------------------------------------------------------------
			// show fitness heights
			//------------------------------------------------------------------
	    	let s = ( 1 / _numIndividuals ) * width + ( i / ( _numIndividuals + 1 ) ) * width;
	    	let f = _individuals[i].fitness * height;

			//console.log( _individuals[i].fitness );
			
			let y = top + height;

			canvas.strokeStyle = 'rgba( 160, 160, 255, 0.6 )';
			canvas.beginPath();
			canvas.moveTo( left + s, y );
			canvas.lineTo( left + s, y - f );
			canvas.closePath();
			canvas.stroke();	 
		}		
    }
    
    //---------------------------------------------------------
    this.renderGenePlot = function( left, top, width, height )
    {    	
    	let geneHeight = height / _maxGenes;
    	let geneWidth  = width  / _numIndividuals;
		
        for (let i=0; i<_numIndividuals; i++)
	    {
			let geneViewLeft = left + ( i / _numIndividuals ) * width;
			let geneViewTop = top;

			for (let g=0; g<_maxGenes; g++)
			{
				let c = Math.floor( _individuals[i].genes[g] * 255 );
				canvas.fillStyle = "rgb( " + c + ", " + c + ", " + c + " )";
				canvas.fillRect( geneViewLeft, geneViewTop + g * geneHeight, geneWidth, geneHeight );	
			}	        
		}		
    }
} 
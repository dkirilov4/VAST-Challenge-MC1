"use strict";

var App = App || {};

var TreeMap = function()
{
    var self = this;

    //
    /* Global Scope Variables: */
    //

	var vehicleData = [];


    //
    /* Tree Map */
    //
    self.createTreeMap = function ()
    {
		
    }

    function calculateSimilarity(carA, carB){
    	var distance = 0.0;
    	
    	//check how similiar time spent at the park is
    	// scale: (1 second ... 350 days)
    	// domain: [0 ... 1]

    	var timeSpentScale = d3.scaleLinear()
    							.domain([0, 30240000000])
    							.range([0,1]);
    							
    	if(carA.TimeSpent > carB.TimeSpent){
    		var timeSpent = carA.TimeSpent - carB.TimeSpent;
    	}
    	else {
    		var timeSpent = carB.TimeSpent - carA.TimeSpent;
    	}

    	distance += timeSpentScale(timeSpent);

    	//check how similiar day(s) spent at the park is
    	// scale: (0  ... 6) 0 = same day of the week ; 6 = 6 days apart
    	// domain: [0 ... 1]

    	//check how similiar entrance time is
    	// scale: (0 ... 12 hours) 0 = same hour, 12 = 12 hours apart
    	// domain: [0 ... 1]

    	//check how similiar exit time is
    	// scale: (0 ... 12 hours) 0 = same hour, 12 = 12 hours apart
    	// domain: [0 ... 1]

    	//check how similiar vehicle type is
    	// scale: 0 or 1
    	// domain: 0 or 1

    	//check how similiar paths are
    	// scale: (0  ... 1) TO DO: later with levenshtein 
    	// domain: [0 ... 1]

    	
    	return distance;
    }
    //
    /* Publicly Available Functions: */
    //
    var publiclyAvailable = 
    {
        createTreeMap: function(vData)
        {
            vehicleData = vData;

            self.createTreeMap();
        },
    };

    return publiclyAvailable;
}
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
			var i = 0;
    self.createTreeMap = function ()
    {

		var nodeData = clusterfck.hcluster(vehicleData, calculateSimilarity, clusterfck.COMPLETE_LINKAGE)

		console.log(nodeData)
    }

    function calculateSimilarity(carA, carB)
	{
		if (i % 10000 == 0)
		{
			console.log("10000")
		}

		//console.log(carA)
		//console.log(carB)
    	var distance = 0.0;
    	//check how similiar time spent at the park is
    	// scale: (1 second ... 350 days)
    	// domain: [0 ... 1]
    	var timeSpentScale = d3.scaleLinear()
    							.domain([0, 30240000000])
    							.range([0, 1]);
    							
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
		var dayEnterScale = d3.scaleLinear()
								.domain([0, 6])
								.range([0, 1])
		
		//var dayEntered = Math.abs(carA.Locations[0].Timestamp.getDay() - carB.Locations[0].Timestamp.getDay());
		var carADay = new Date(carA.Locations[0].Timestamp);
		var carBDay = new Date(carB.Locations[0].Timestamp);

		var dayEntered = Math.abs(carADay.getDay() - carBDay.getDay())
		distance += dayEnterScale(dayEntered);

    	//check how similiar entrance time is
    	// scale: (0 ... 12 hours) 0 = same hour, 12 = 12 hours apart
    	// domain: [0 ... 1]
		var entranceHourScale = d3.scaleLinear()
									.domain([0, 12])
									.range([0, 1])

		if (dayEntered == 0)
		{
			var formatHour = d3.timeFormat("%I");

			// TODO: If condition for cars that haven't left / are park preserve vehicles
			var carAHour = formatHour(new Date(carA.Locations[0].Timestamp))
			var carBHour = formatHour(new Date(carB.Locations[0].Timestamp))

			var hourEntered = Math.abs(carAHour - carBHour);

			distance += entranceHourScale(hourEntered);
		}

    	//check how similiar exit time is
    	// scale: (0 ... 12 hours) 0 = same hour, 12 = 12 hours apart
    	// domain: [0 ... 1]
		var exitHourScale = d3.scaleLinear()
								.domain([0, 12])
								.range([0, 1])

		if (dayEntered == 0)
		{
			var formatHour = d3.timeFormat("%I");

			// TODO: If condition for cars that haven't left / are park preserve vehicles
			var carAHour = formatHour(new Date(carA.Locations[carA.Locations.length - 1].Timestamp))
			var carBHour = formatHour(new Date(carB.Locations[carB.Locations.length - 1].Timestamp))

			var hourExited = Math.abs(carAHour - carBHour);

			distance += entranceHourScale(hourExited);
		}

    	//check how similiar vehicle type is
    	// scale: 0 or 1
    	// domain: 0 or 1
		if (carA.CarType != carB.CarType)
			distance += 1;

    	//check how similiar paths are
    	// scale: (0  ... 1) TO DO: later with levenshtein 
    	// domain: [0 ... 1]

		//console.log(distance)
		i++;
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
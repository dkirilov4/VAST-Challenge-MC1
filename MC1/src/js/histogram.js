"use strict";

var App = App || {};

var Histogram = function()
{
    var self = this;

    //
    /* Global Scope Variables: */
    //

	var vehicleData = [];


    //
    /* Histogram */
    //
    self.populateBins = function()
    {
        console.log(vehicleData);

        var lessThanHour = []; // 0 - 3600
        var lessThanDay  = []; // 0 - 86400
        var lessThanWeek = []; // 0 - 604800
        var lessThanMonth = []; // 0 - 2628000
        var lessThanHalfYear = []; // 0 - 15770000
        var lessThanYear = []; // 31540000

        for (var carID in vehicleData)
        {
            if (vehicleData[carID].TimeSpent < 3600)
                lessThanHour.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 86400)
                lessThanDay.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 604800)
                lessThanWeek.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 2628000)
                lessThanMonth.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 15770000)
                lessThanHalfYear.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 31540000)
                lessThanYear.push(vehicleData[carID])
        }

        console.log("< Hour:");
        console.log(lessThanHour)
        console.log("< Day:");
        console.log(lessThanDay)
        console.log("< Week:");
        console.log(lessThanWeek)
        console.log("< Month:");
        console.log(lessThanMonth)
        console.log("< 1/2 Year:");
        console.log(lessThanHalfYear)
        console.log("< Year:");
        console.log(lessThanYear)
    }

    self.createHistogram = function ()
    {
        console.log("HERE")
    }

    //
    /* Publicly Available Functions: */
    //
    var publiclyAvailable = 
    {
        createHistogram: function(vData)
        {
            vehicleData = vData;

            self.populateBins();
            self.createHistogram();
        },
    };

    return publiclyAvailable;
}
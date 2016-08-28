/* global $, alert */
'use strict';

$(function() {

	if (window.DeviceMotionEvent) {
		window.addEventListener('devicemotion', deviceMotionHandler, false);
	} else {
		alert('not support DeviceMotionEvent event');
	}

    // 摇一摇
    var last_update = 0;
    var current_x = 0,
        current_y = 0,
        current_z = 0,
        last_x = 0,
        last_y = 0,
        last_z = 0;
    var limitedSpead = 1000;

	// 每时每刻都在进行
	function deviceMotionHandler(eventData) {
        
        /********************/
        $('.accelerationIncludingGravityX').text(eventData.accelerationIncludingGravity.x);
        $('.accelerationIncludingGravityY').text(eventData.accelerationIncludingGravity.y);
        $('.accelerationIncludingGravityZ').text(eventData.accelerationIncludingGravity.z);

        $('.accelerationX').text(eventData.acceleration.x);
        $('.accelerationY').text(eventData.acceleration.y);
        $('.accelerationZ').text(eventData.acceleration.z);

        $('.rotationRateAlpha').text(eventData.rotationRate.alpha);
        $('.rotationRateBeta').text(eventData.rotationRate.beta);
        $('.rotationRateGamma').text(eventData.rotationRate.gamma);

        $('.interval').text(eventData.interval);
        /********************/

	    var acceleration = eventData.accelerationIncludingGravity;
        var currentTime = new Date().getTime();

        if ((currentTime - last_update) > 300) {
            var diffTime = currentTime - last_update;
            last_update = currentTime;
            
            current_x = acceleration.x;
            current_y = acceleration.y;
            current_z = acceleration.z;

            var absX = Math.abs(current_x - last_x) / diffTime * 10000;
            var absY = Math.abs(current_y - last_y) / diffTime * 10000;
            var absZ = Math.abs(current_z - last_z) / diffTime * 10000;
            // console.log('absX', absX);
            // console.log('absY', absY);
            // console.log('absZ', absZ);

            if (absX > limitedSpead || absY > limitedSpead || absZ > limitedSpead ) {
                alert('摇到了');
        		console.log('摇到了');
            }

            last_x = current_x;
            last_y = current_y;
            last_z = current_z;
        }
	}
})

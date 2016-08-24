


/* global $, alert */
'use strict';

$(function() {

	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', deviceOrientationHandler, false);
	} else {
		alert('not support DeviceOrientationEvent event');
	}

	// 每时每刻都在进行
	function deviceOrientationHandler(eventData) {

	    var absolute = eventData.absolute;
	    $('.absolute').text(absolute);

	    var alpha = eventData.alpha;
	    $('.alpha').text(alpha);

	    var gamma = eventData.gamma;
	    $('.gamma').text(gamma);

	    var beta = eventData.beta;
	    $('.beta').text(beta);

	    var webkitCompassHeading = eventData.webkitCompassHeading;
	    $('.webkitCompassHeading').text(webkitCompassHeading);

	    var webkitCompassAccuracy = eventData.webkitCompassAccuracy;
	    $('.webkitCompassAccuracy').text(webkitCompassAccuracy);
	}
})

/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"combp/bpcreate/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});

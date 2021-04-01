/*global QUnit*/

sap.ui.define([
	"ns/BusinessParameter/controller/Sippliers.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Sippliers Controller");

	QUnit.test("I should test the Sippliers controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

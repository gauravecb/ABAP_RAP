sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("MDMZCUSTOMER.controller.customerNameAddress", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDMZCUSTOMER.view.customerNameAddress
		 */
		onInit: function() {
			var oInput1 = new sap.m.Text('input1');
			oInput1.setText("Some Text ");
			oInput1.setTooltip("This is a tooltip ");
			var oLayout = this.getView().byId("CustomerLocalAddress"); 
			oLayout.addContent(oInput1);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf MDMZCUSTOMER.view.customerNameAddress
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf MDMZCUSTOMER.view.customerNameAddress
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf MDMZCUSTOMER.view.customerNameAddress
		 */
		//	onExit: function() {
		//
		//	}

	});

});
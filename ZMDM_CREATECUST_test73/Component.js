sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"MDMZCUSTOMER/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("MDMZCUSTOMER.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();

			// set the device model
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			//Set Model
				var data = {
					StatusData:
					{
						"DeletionBlock":false
					}};
			var oModel = new sap.ui.model.json.JSONModel(data); 
			sap.ui.getCore().setModel(oModel,"StatusDataTabModel");
		}
	});
});
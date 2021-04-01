sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"../util/TableDownloader",
], function (Controller, UIComponent, mobileLibrary, TableDownloader) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("ui.newell.PrecisionMaterial.controller.BaseController", {

		_oTableDownloader: null,

		onInit: function () {
			this._oTableDownloader = new TableDownloader(this);
		},

		getDownloader: function () {
			return this._oTableDownloader;
		},

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		registerMessageManager: function () {
			// Register the view with the message manager
			sap.ui
				.getCore()
				.getMessageManager()
				.registerObject(this.getView(), true);
			var oMessagesModel = sap.ui
				.getCore()
				.getMessageManager()
				.getMessageModel();
			this._oBinding = new sap.ui.model.Binding(
				oMessagesModel,
				"/",
				oMessagesModel.getContext("/")
			);
			this.getView().setModel(oMessagesModel, "message");

		}
	});

});
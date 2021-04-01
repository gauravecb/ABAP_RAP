sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"./model/models",
		"./controller/ErrorHandler",
	],
	function (UIComponent, Device, models, ErrorHandler) {
		"use strict";

		return UIComponent.extend("ui.newell.PrecisionMaterial.Component", {
			metadata: {
				manifest: "json",
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this function, the device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init: function () {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);

				// initialize the error handler with the component
				this._oErrorHandler = new ErrorHandler(this);

				// set the device model
				this.setModel(models.createDeviceModel(), "device");

				// Attach Busy Indicator for Requests
				this.attachBusyIndicator(this.getModel());

				// create the views based on the url/hash
				var oQueryData = {};
				var oQueryParam = $.sap.getUriParameters();
				oQueryData.ViewName =
					oQueryParam.get("ViewName") === null ? "Home" : oQueryParam.get("ViewName");
				oQueryData.UserId =
					oQueryParam.get("UserID") === null ? "" : oQueryParam.get("UserID");
				oQueryData.AppName =
					oQueryParam.get("AppName") === null ? "PRICEREQ" : oQueryParam.get("AppName");
				oQueryData.UserType =
					oQueryParam.get("UserType") === null ? "SREP" : oQueryParam.get("UserType");
				var sUserType = oQueryData.UserType;
				oQueryData.UserRegion =
					oQueryParam.get("UserRegion") === null ? "LATAM" : oQueryParam.get("UserRegion");
				oQueryData.UserLang =
					oQueryParam.get("UserLang") === null ? "EN" : oQueryParam.get("UserLang");
				oQueryData.Document =
					oQueryParam.get("DocumentNumber") === null ? "0000000000" : oQueryParam.get("DocumentNumber");
				oQueryData.WorkItemNo =
					oQueryParam.get("WorkItemNo") === null ? "0000000000" : oQueryParam.get("WorkItemNo");
				oQueryData.UiMode =
					oQueryParam.get("UiMode") === null ? "EDIT" : oQueryParam.get("UiMode");
				oQueryData.fromEmail =
					oQueryParam.get("fromEmail") === null ? "No" : oQueryParam.get("fromEmail");

				oQueryData.debug = oQueryParam.get("Debug") === "ON" ? true : false;
				this.setModel(models.setQueryData(oQueryData), "querydata");

				if (oQueryData.debug) {
					window.console.info("Application Started in Debug Mode");
					window.console.debug("Url Parameters:", oQueryData);
				}

				var sViewName = oQueryData.ViewName;
				if (sViewName) {
					switch (sViewName.toUpperCase()) {
					case "CREATE":
						this.getRouter().initialize();
						this.getRouter().navTo("createconf", true);
						break;

					case "SEARCH":
						this.getRouter().initialize();

					case "WORKLIST":
						this.getRouter().initialize();

					case "DETAILS":

						break;

					default:
						this.getRouter().initialize();
					}
				}
			},

			handleDialogOpen: function () {
				this.getRouter().initialize();
				this.getRouter().navTo("create", true);
				this.oConfirmationDialog.close();
			},

			handleDialogOpenCancel: function () {
				this.oConfirmationDialog.close();
			},

			/**
			 * The component is destroyed by UI5 automatically.
			 * In this method, the ErrorHandler is destroyed.
			 * @public
			 * @override
			 */
			destroy: function () {
				this._oErrorHandler.destroy();
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
			 */
			getContentDensityClass: function () {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					// eslint-disable-next-line sap-no-proprietary-browser-api
					if (
						document.body.classList.contains("sapUiSizeCozy") ||
						document.body.classList.contains("sapUiSizeCompact")
					) {
						this._sContentDensityClass = "";
					} else if (!Device.support.touch) {
						// apply "compact" mode if touch is not supported
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			},

			attachBusyIndicator: function (oModel) {
				// Set the Busy Indicator on Start and completion of OData Calls.
				// var oModel = this.getModel("soa");
				var busyIndicator = sap.ui.core.BusyIndicator;
				oModel.attachRequestSent(function () {
					busyIndicator.show(0);
				});
				oModel.attachRequestCompleted(function () {
					busyIndicator.hide();
				});
			},
		});
	}
);
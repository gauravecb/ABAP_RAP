/* =============================================================================================================================================*/
/* Defines the Delegate Class for General Screen of Item    																					*/
/* =============================================================================================================================================*/
/* Application : Precision Material														 														*/
/* The Purpose of this Delegate class is to handle all the events releated to the General Detail Section of the Create/Edit Item Screen         */
/* ---------------------------------------------------------------------------------------------------------------------------------------------*/
/* Version:			001																	 														*/
/* Date:			January 20, 2020														 													*/
/* Author:			Arun Krishnamoorthy(xx20379)												 										        */
/* ---------------------------------------------------------------------------------------------------------------------------------------------*/
(function () {

	"use strict";

	sap.ui.define([
		"sap/ui/base/ManagedObject",
		"ui/newell/PrecisionMaterial/util/BaseDelegate"
	], function (ManagedObject, BaseDelegate) {

		/**
		 * @name ui.newell.PrecisionMaterial.delegate.RequestDetailDelegate
		 * @class This class is used for handling data loss dialog in document search
		 */

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.DemandDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.Demand",

			handleChangeProductClass: function (oEvent) {
				var sKey = "DPPCValue";
				var sDescription = "DPPCDescription";
				this.getModel("addItemView").setProperty("/busy", true);
				var oBindingContext = this.getFragment().getBindingContext();
				var sBindingPath = oBindingContext.getPath();
				var oSource = oEvent.getSource();
				var sValue = oEvent.getParameter("newValue");
				var sValidated = oEvent.getParameter("validated");
				if (sValidated) {
					return;
				}

				var oBindingData = oBindingContext.getObject();
				var oKey = {
					DPPCValue: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/DPProductClassSet", oKey, sKey, sDescription);
			},

			handleChangePlanningBusiness: function (oEvent) {
				var sKey = "PBValue";
				var sDescription = "PBDescription";
				this.getModel("addItemView").setProperty("/busy", true);
				var oBindingContext = this.getFragment().getBindingContext();
				var sBindingPath = oBindingContext.getPath();
				var oSource = oEvent.getSource();
				var sValue = oEvent.getParameter("newValue");
				var sValidated = oEvent.getParameter("validated");
				if (sValidated) {
					return;
				}

				var oBindingData = oBindingContext.getObject();
				var oKey = {
					PBValue: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/PlanningBusinessSet", oKey, sKey, sDescription);
			}

		});
	});
})();
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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.PlantDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.Plant",

			validateValueState: function () {
				var bInvalidData = false;
				var oControl = this.byId("idCountryOfOrigin");
				var sValueState = oControl.getValueState();
				if (sValueState === "Error") {
					bInvalidData = true;
				}
				return bInvalidData;
			},

			handleChangeMaterialFreightGroup: function (oEvent) {
				var sKey = "MaterialFreightGroupsId";
				var sDescription = "MaterialFreightGroupsDesc";
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
					MaterialFreightGroupsId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialFreightGroupsSet", oKey, sKey, sDescription);
			},

			handleChangeCountryOfOrigin: function (oEvent) {
				var sKey = "CountryOrgId";
				var sDescription = "CountryOrgDesc";
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
					CountryOrgId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/CountryOfOrginSet", oKey, sKey, sDescription);
			},

			handleChangeGoldenTax: function (oEvent) {
				var sKey = "GoldenTaxId";
				var sDescription = "GoldenTaxDesc";
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
					GoldenTaxId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/GoldenTaxSet", oKey, sKey, sDescription);
			},

			handleChangeStorageConditions: function (oEvent) {
				var sKey = "StorageConditionsId";
				var sDescription = "StorageConditionsDesc";
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
					StorageConditionsId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/StorageConditionsSet", oKey, sKey, sDescription);
			}

		});
	});
})();
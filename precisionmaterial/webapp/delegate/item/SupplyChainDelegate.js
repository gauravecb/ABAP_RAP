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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.SupplyChainDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.SupplyChain",

			handleCommodityCodeChange: function (oEvent) {
				var sKey = "CommodityCodeId";
				var sDescription = "CommodityCodeDesc";
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
					RequestId: oBindingData.RequestId,
					CommodityCodeId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/CommodityCodeSet", oKey, sKey, sDescription);
			},

			handleChangePurchasingGroup: function (oEvent) {
				var sKey = "PurGroupId";
				var sDescription = "PurGroupDesc";
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
					PurGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/PurGroupSet", oKey, sKey, sDescription);
			},

			handleChangeABCIndicator: function (oEvent) {
				var sKey = "ABCIndicatorId";
				var sDescription = "ABCIndicatorDesc";
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
					ABCIndicatorId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/ABCIndicatorSet", oKey, sKey, sDescription);
			},

			handleChangeMRPController: function (oEvent) {
				var sKey = "MRPControllerId";
				var sDescription = "MRPControllerDesc";
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
					RequestId: oBindingData.RequestId,
					MRPControllerId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MRPControllerSet", oKey, sKey, sDescription);
			},

			handleChangeSafetyTimeIndicator: function (oEvent) {
				var sKey = "SafetyTimeIndicatorId";
				var sDescription = "SafetyTimeIndicatorDesc";
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
					SafetyTimeIndicatorId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/SafetyTimeIndicatorSet", oKey, sKey, sDescription);
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

			handleChangeSafteyStockMethod: function (oEvent) {
				var sKey = "SafetyStkMthdId";
				var sDescription = "SafetyStkMthdDesc";
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
					SafetyStkMthdId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/SafetyStkMthdSet", oKey, sKey, sDescription);
			},

			handleChangePlanPolicy: function (oEvent) {
				var sKey = "PlanPolicyId";
				var sDescription = "PlanPolicyDesc";
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
					PlanPolicyId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/PlanPolicySet", oKey, sKey, sDescription);
			}

		});
	});
})();
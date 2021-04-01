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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.PPPDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.PPP",

			handleStorageStockLocation: function (oEvent) {
				var sKey = "StorageLocationId";
				var sDescription = "StorageLocationDesc";
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
					StorageLocationId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/StorageLocationSet", oKey, sKey, sDescription);
			},

			handleChangeLoadingGroup: function (oEvent) {
				var sKey = "LoadingGroupsId";
				var sDescription = "LoadingGroupsDesc";
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
					LoadingGroupsId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/LoadingGroupsSet", oKey, sKey, sDescription);
			},

			handleChangeMaterialStatus: function (oEvent) {
				var sKey = "MaterialStatusId";
				var sDescription = "MaterialStatusDesc";
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
					MaterialStatusId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialStatusSet", oKey, sKey, sDescription);
			},

			handleChangeLotSize: function (oEvent) {
				var sKey = "LotSizeId";
				var sDescription = "LotSizeDesc";
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
					LotSizeId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/LotSizesSet", oKey, sKey, sDescription);
			},

			handleChangeStockDetermination: function (oEvent) {
				var sKey = "StockDeterminationGroupId";
				var sDescription = "StockDeterminationGroupDesc";
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
					StockDeterminationGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/StockDeterminationGroupSet", oKey, sKey, sDescription);
			},

			handleChangeStrategyGroup: function (oEvent) {
				var sKey = "StrategyGroupId";
				var sDescription = "StrategyGroupDesc";
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
					StrategyGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/StrategyGroupSet", oKey, sKey, sDescription);
			},

			handleChangeAvailability: function (oEvent) {
				var sKey = "AvailabilityCheckId";
				var sDescription = "AvailabilityCheckDesc";
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
					AvailabilityCheckId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/AvailabilityCheckSet", oKey, sKey, sDescription);
			}
		});
	});
})();
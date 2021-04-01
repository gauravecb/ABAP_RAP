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
		"ui/newell/PrecisionMaterial/util/BaseDelegate",
		"./CharacteristicF4Delegate",
	], function (ManagedObject, BaseDelegate, CharacteristicF4Delegate) {

		/**
		 * @name ui.newell.PrecisionMaterial.delegate.RequestDetailDelegate
		 * @class This class is used for handling data loss dialog in document search
		 */

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.CharacteristicDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.Characteristics",
			_sRequestId: null,
			_sProduct: null,

			onInit: function () {
				var oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel, "characteristicsui");
			},

			bindCharacteristicFragment: function (sRequestId, sProduct) {
				this._sRequestId = sRequestId;
				this._sProduct = sProduct;

				var oModel = this.getView().getModel();
				var aFilters = [];
				var oFilter = new sap.ui.model.Filter("RequestId", "EQ", sRequestId);
				aFilters.push(oFilter);
				var oFilter = new sap.ui.model.Filter("ProductId", "EQ", sProduct);
				aFilters.push(oFilter);
				var oController = this;
				var oCharacteristicModel = this.getView().getModel("characteristicsui");
				oModel.read("/ITMCharacteristicsSet", {
					filters: aFilters,
					success: function (oData, oResponse) {
						var aResults = oData && oData.results;
						if (aResults.length > 0) {
							oCharacteristicModel.setData({
								ui: aResults
							});
						}
					},
					error: function (oResponse) {

					}
				});
			},

			createFormRow: function (sId, oContext) {
				var oFragment = sap.ui.xmlfragment(sId, "ui.newell.PrecisionMaterial.fragments.CharacteristicElement", this);
				oFragment.setBindingContext(oContext, "characteristicsui");
				return oFragment;
			},

			handleCharacteristicElementChange: function (oEvent) {
				var aFilters = [];
				var oContext = oEvent.getSource().getBindingContext("characteristicsui");
				var sPath = oContext.getPath();
				var oData = oContext.getObject();

				var sValue = oEvent.getParameter("newValue");
				if (sValue !== "") {
					var oFilter = new sap.ui.model.Filter("RequestId", "EQ", oData.RequestId);
					aFilters.push(oFilter);
					var oFilter = new sap.ui.model.Filter("ProductId", "EQ", oData.ProductId);
					aFilters.push(oFilter);
					var oFilter = new sap.ui.model.Filter("CharacteristicsName", "EQ", oData.CharacteristicsName);
					aFilters.push(oFilter);
					var oFilter = new sap.ui.model.Filter("CharacteristicsDesc", "EQ", sValue);
					aFilters.push(oFilter);
					var oCharacteristicModel = this.getView().getModel("characteristicsui");
					var oModel = this.getView().getModel();
					oModel.read("/CharacteristicsSet", {
						filters: aFilters,
						success: function (oData, oResponse) {
							var aData = oData && oData.results;
							if (aData.length > 0) {
								var oItemData = aData[0];
								var sUpdatePath = sPath + "/CharacteristicsId";
								oCharacteristicModel.setProperty(sUpdatePath, oItemData.CharacteristicsId);
								var sUpdatePath = sPath + "/CharacteristicsDesc";
								oCharacteristicModel.setProperty(sUpdatePath, oItemData.CharacteristicsDesc);
							} else {
								sap.m.MessageBox.error("The value does not exist");
							}
						}
					});
				}
			},

			handleDisplayCharacteristicValueHelp: function (oEvent) {
				var oContext = oEvent.getSource().getBindingContext("characteristicsui");
				var sPath = oContext.getPath();
				var oData = oContext.getObject();

				if (!this._oCharacteristicF4Delegate) {
					this._oCharacteristicF4Delegate = new CharacteristicF4Delegate({
						view: this.getView()
					});
					this.getView().addDependent(this._oCharacteristicF4Delegate.getFragment());
				}
				// Add the Filters before opening the dialog 
				var oTable = this._oCharacteristicF4Delegate.getFragment();
				var oBinding = oTable.getBinding("items");
				var aFilters = [];
				var oFilter = new sap.ui.model.Filter("RequestId", "EQ", oData.RequestId);
				aFilters.push(oFilter);
				var oFilter = new sap.ui.model.Filter("ProductId", "EQ", oData.ProductId);
				aFilters.push(oFilter);
				var oFilter = new sap.ui.model.Filter("CharacteristicsName", "EQ", oData.CharacteristicsName);
				aFilters.push(oFilter);
				oBinding.filter(aFilters);
				var oCharacteristicModel = this.getView().getModel("characteristicsui");
				this._oCharacteristicF4Delegate.openValueHelp(function (oEvent) {
					var oSelectedItem = oEvent.getParameter("selectedItem");
					if (oSelectedItem) {
						var oItemData = oSelectedItem.getBindingContext().getObject();
						var sUpdatePath = sPath + "/CharacteristicsId";
						oCharacteristicModel.setProperty(sUpdatePath, oItemData.CharacteristicsId);
						var sUpdatePath = sPath + "/CharacteristicsDesc";
						oCharacteristicModel.setProperty(sUpdatePath, oItemData.CharacteristicsDesc);
					}
				});
			}

		});
	});
})();
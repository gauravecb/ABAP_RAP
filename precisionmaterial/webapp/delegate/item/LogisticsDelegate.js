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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.LogisticsDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.Logistical",
			_sRequestId: null,
			_sProduct: null,

			createNewLogisticsItemContext: function (sRequestId, sProduct, sItemNo) {
				var oModel = this.getView().getModel();
				var oData = {
					RequestId: sRequestId,
					ProductId: sProduct,
					LevelId: ""
				}
				var oContext = oModel.createEntry("/ITMLogisticalDetailSet", {
					properties: oData,
				});
				return oContext;
			},

			handleChangeLevelId: function (oEvent) {
				var sKey = "LevelId";
				var sDescription = "LevelDesc";
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
					LevelId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/LevelSet", oKey, sKey, sDescription);
			},

			setProductData: function (sRequestId, sProductId) {
				this._sRequestId = sRequestId;
				this._sProduct = sProductId;
			},

			getLogisticsTable: function () {
				if (!this._oLogisticsTable) {
					this._oLogisticsTable = this.byId("idLogisticalTable");
				}
				return this._oLogisticsTable;
			},

			handleAddLogisticsItem: function (oEvent) {
				// Create new instance and bind it to the fragment.
				var oContext = this.createNewLogisticsItemContext(this._sRequestId, this._sProduct);
				var oTable = this.getLogisticsTable();
				var oBindingInfo = oTable.getBindingInfo("items");
				var oTemplate = oBindingInfo.template;
				var oItemNew = oTemplate.clone();
				oItemNew.setBindingContext(oContext);
				oTable.addItem(oItemNew);
			},

			handleDeleteLogisticsItem: function (oEvent) {

				var oTable = this.getLogisticsTable();
				var oItem = oTable.getSelectedItem();
				if (!oItem) {
					sap.m.MessageBox.error("Select atleast one item to proceed");
					return;
				}
				var sPath = oItem.getBindingContext().getPath();
				var oData = oItem.getBindingContext().getObject();
				var oModel = oTable.getModel();
				var sKeyPath = oModel.createKey("/ITMLogisticalDetailSet", {
					RequestId: oData.RequestId,
					ProductId: oData.ProductId,
					LevelId: oData.LevelId
				});

				if (sKeyPath === sPath) {
					var sDelete = "Delete";
					var oModel = this.getView().getModel();
					var oController = this;
					sap.m.MessageBox.warning(
						"Are you sure you want to delete this language? This removes the language permanently. Are you sure you want to continue?", {
							actions: [sDelete, sap.m.MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact",
							onClose: function (sAction) {
								if (sAction === sDelete) {
									oModel.remove(sPath, {
										success: function (oResponse) {
											sap.m.MessageBox.success("The Logistics item is deleted successfully");
											oController.refreshTable();
										},
										error: function (oResponse) {
											sap.m.MessageBox.error("The Logistics item deletion failed.")
										}
									});
								}
							}
						});
				} else {
					// This is a temporary item, delete only from table
					oTable.removeItem(oItem);
				}
			}

		});
	});
})();
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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.AltLanguageDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.AltLanguage",
			_sRequestId: null,
			_sProduct: null,

			handleLanguageChange: function (oEvent) {
				var sKey = "LanguageId";
				// var sDescription = "DPPCDescription";
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
					LanguageId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/LanguageSet", oKey, sKey, sDescription);
			},

			refreshTable: function () {
				var oTable = this.byId("idAltLanguagesTable");
				var oBinding = oTable.getBinding("items");
				oBinding.refresh();
				// var sPath = this.createNewAltLanguageElement(this._sRequestId, this._sProduct);
				// this.getLanguageModifier().bindElement(sPath);
			},

			bindTable: function (sRequestId, sProduct) {

				this._sRequestId = sRequestId;
				this._sProduct = sProduct;

				var oTable = this.byId("idAltLanguagesTable");
				var oBinding = oTable.getBinding("items");
				if (oBinding) {
					var oTemplate = oTable.getBindingInfo("items").template;
					var aFilters = [];
					var oFilter = new sap.ui.model.Filter("RequestId", "EQ", sRequestId);
					aFilters.push(oFilter);
					var oFilter = new sap.ui.model.Filter("ProductId", "EQ", sProduct);
					aFilters.push(oFilter);
					oTable.bindAggregation("items", {
						path: '/ITMAltLangSet',
						filters: aFilters,
						templateShareable: true,
						template: oTemplate
					});
					return true;
				}
				// var sPath = this.createNewAltLanguageElement(this._sRequestId, this._sProduct);
				// this.getLanguageModifier().bindElement(sPath);
			},

			getLanguageModifier: function () {
				if (!this._oLanguageModifierDialog) {
					// 	this._oLanguageModifierDialog = sap.ui.xmlfragment("idLanguageModifier", this._sModifyFragment, this);
					// 	this.getView().addDependent(this._oLanguageModifierDialog);
					this._oLanguageModifierDialog = this.byId("idAltLanguagesTable");
				}
				return this._oLanguageModifierDialog;
			},

			createNewAltLanguageElement: function (sRequestId, sProduct, sLanguageId) {
				var oModel = this.getView().getModel();
				if (sLanguageId !== "null") {
					var sPath = oModel.createKey("/ITMAltLangSet", {
						RequestId: sRequestId,
						ProductId: sProduct,
						LanguageId: '',
					});
				} else {
					var oData = {
						RequestId: sRequestId,
						ProductId: '',
						LanguageId: ''
					}
					var oContext = oModel.createEntry("/ITMAltLangSet", {
						properties: oData,
					});
					var sPath = oContext.getPath();
				}
				return sPath;
			},

			createNewAltLanguageContext: function (sRequestId, sProduct, sLanguageId) {
				var oModel = this.getView().getModel();
				var oData = {
					RequestId: sRequestId,
					ProductId: sProduct,
					LanguageId: ''
				}
				var oContext = oModel.createEntry("/ITMAltLangSet", {
					properties: oData,
				});
				return oContext;
			},

			handleAddAltLanguage: function (oEvent) {
				// Create new instance and bind it to the fragment.
				var oContext = this.createNewAltLanguageContext(this._sRequestId, this._sProduct);
				var oTable = this.getLanguageModifier();
				var oBindingInfo = oTable.getBindingInfo("items");
				var oTemplate = oBindingInfo.template;
				var oItemNew = oTemplate.clone();
				oItemNew.setBindingContext(oContext);
				oTable.addItem(oItemNew);
			},

			handleEditAltLanguage: function (oEvent) {

			},

			handleDeleteAltLanguage: function (oEvent) {
				var oTable = this.byId("idAltLanguagesTable");
				var oItem = oTable.getSelectedItem();
				if (!oItem) {
					sap.m.MessageBox.error("Select atleast one item to proceed");
					return;
				}
				var sPath = oItem.getBindingContext().getPath();
				var oData = oItem.getBindingContext().getObject();
				var oModel = oTable.getModel();
				var sKeyPath = oModel.createKey("/ITMAltLangSet", {
					RequestId: oData.RequestId,
					ProductId: oData.ProductId,
					LanguageId: oData.LanguageId
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
											sap.m.MessageBox.success("The Language is deleted successfully");
											oController.refreshTable();
										},
										error: function (oResponse) {
											sap.m.MessageBox.error("The Language deletion failed.")
										}
									});
								}
							}
						});
				} else {
					// This is a temporary item, delete only from table
					oTable.removeItem(oItem);
				}
			},

			handleValueHelpLanguageId: function (oEvent) {

			},

			handleChangeLanguage: function () {

			},

			handleSaveAltLanguage: function (oEvent) {
				var oContext = this.getLanguageModifier().getBindingContext();
				var oData = oContext.getObject();
				if (oData) {
					var oModel = this.getView().getModel();
					oModel.submitChanges();
				}
			},

			handleDiscardAltLanguage: function (oEvent) {
				this.getLanguageModifier().close();
			}

		});
	});
})();
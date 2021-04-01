sap.ui.define(
	["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox",
		"ui/newell/PrecisionMaterial/delegate/DatalossDelegate",
		"ui/newell/PrecisionMaterial/util/ModelHelper",
		"ui/newell/PrecisionMaterial/util/DelegateHelper"
	],
	function (BaseController, JSONModel, MessageBox, DatalossDelegate, ModelHelper, DelegateHelper) {
		"use strict";

		return BaseController.extend(
			"ui.newell.PrecisionMaterial.controller.AddItem", {
				onInit: function () {
					var oViewModel,
						fnSetAppNotBusy,
						iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

					oViewModel = new JSONModel({
						busy: true,
						delay: 0,
						previousTab: "",
						currentTab: "",
						selectedTab: "",
						resetTab: false,
						dataLossText: "",
						RequestId: "",
						Product: ""
					});
					this.setModel(oViewModel, "addItemView");

					var oController = this;
					oViewModel.attachPropertyChange(function (oEvent) {
						oController.handleAddItemViewPropertyChange(oEvent);
					});

					fnSetAppNotBusy = function () {
						oViewModel.setProperty("/busy", false);
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					};

					// disable busy indication when the metadata is loaded and in case of errors
					this.getOwnerComponent()
						.getModel()
						.metadataLoaded()
						.then(fnSetAppNotBusy);
					this.getOwnerComponent()
						.getModel()
						.attachMetadataFailed(fnSetAppNotBusy);

					// apply content density mode to root view
					this.getView().addStyleClass(
						this.getOwnerComponent().getContentDensityClass()
					);

					// Initialize the Model Helper 
					if (!this._oModelHelper) {
						this._oModelHelper = new ModelHelper({
							view: this.getView()
						});
					}

					// Initialize the Delegate Helper
					if (!this._oDelegateHelper) {
						this._oDelegateHelper = new DelegateHelper({
							view: this.getView()
						});
					}

					// Initialize the Pages
					this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					this._oRouter.getRoute("additem").attachMatched(this._handleRoutePatternMatched, this);

					// Initialize Data Loss Delegate
					if (!this._oDataLossDialog) {
						this._oDataLossDialog = new DatalossDelegate({
							view: this.getView()
						});
						this.getView().addDependent(this._oDataLossDialog.getFragment());
					}
				},

				handleAddItemViewPropertyChange: function (oEvent) {
					// Implement the Model Property Change if required
				},

				tabSelectionChange: function (sKey) {

					var oAddItemViewModel = this.getView().getModel("addItemView");
					var sRequestId = oAddItemViewModel.getProperty("/RequestId");
					var sProduct = oAddItemViewModel.getProperty("/Product");
					var sKey = oAddItemViewModel.getProperty("/selectedTab");

					switch (sKey) {
					case "requestdetail":
						var sPath = this.createNewItemElement(sRequestId, sProduct);
						var oGeneralDelegate = this._oDelegateHelper.getGeneralItemDelegate();
						oGeneralDelegate.getFragment().bindElement(sPath);
						break;
					case "altlanguage":
						var oAltLangDelegate = this._oDelegateHelper.getAltLangDelegate();
						oAltLangDelegate.bindTable(sRequestId, sProduct)
						oAltLangDelegate.refreshTable();
						break;
					case "characteristics":
						var oCharacteristicDelegate = this._oDelegateHelper.getCharacteristicDelegate();
						oCharacteristicDelegate.bindCharacteristicFragment(sRequestId, sProduct);
						break;
					case "plant":
						var sPath = this._oModelHelper.getProductEntityPath("/ITMPlantSet", sRequestId, sProduct);
						var oPlantDelegate = this._oDelegateHelper.getPlantDelegate();
						oPlantDelegate.getFragment().bindElement(sPath);
						break;
					case "salesorg":
						var sPath = this._oModelHelper.getProductEntityPath("/ITMSalesOrgSet", sRequestId, sProduct);
						var oSalesOrgDelegate = this._oDelegateHelper.getSalesOrgDelegate();
						oSalesOrgDelegate.getFragment().bindElement(sPath);
						break;
					case "logistics":
						var oLogisticsDelegate = this._oDelegateHelper.getLogisticsDelegate();
						oLogisticsDelegate.setProductData(sRequestId, sProduct);
						var sPath = this._oModelHelper.getProductEntityPath("/ITMLogisticalSet", sRequestId, sProduct);
						oLogisticsDelegate.getFragment().bindElement(sPath);
						break;
					case "supplychain":
						var sPath = this._oModelHelper.getProductEntityPath("/ITMSupplyChainSet", sRequestId, sProduct);
						var oSupplyChainDelegate = this._oDelegateHelper.getSupplyChainDelegate();
						oSupplyChainDelegate.getFragment().bindElement(sPath);
						break;
					case "demand":
						var sPath = this._oModelHelper.getProductEntityPath("/ITMDemandSet", sRequestId, sProduct);
						var oDemandDelegate = this._oDelegateHelper.getDemandDelegate();
						oDemandDelegate.getFragment().bindElement(sPath);
						break;
					case "purchasing":
						var sPath = this._oModelHelper.getProductEntityPath("/ITMPurchasingSet", sRequestId, sProduct);
						var oPurchasingDelegate = this._oDelegateHelper.getPurchasingDelegate();
						oPurchasingDelegate.getFragment().bindElement(sPath);
						break;
					case "ppp":
						var sPath = this._oModelHelper.getProductEntityPath("/ITMPPPSet", sRequestId, sProduct);
						var oPPPDelegate = this._oDelegateHelper.getPPPDelegate();
						oPPPDelegate.getFragment().bindElement(sPath);
						break;
					case "pdm":
						var sPath = this._oModelHelper.getProductEntityPath("/ITMPDMSet", sRequestId, sProduct);
						var oPDMDelegate = this._oDelegateHelper.getPDMDelegate();
						oPDMDelegate.getFragment().bindElement(sPath);
						break;
					}
				},

				_handleRoutePatternMatched: function (oEvent) {
					try {
						var oModel = this.getView().getModel();
						oModel.setDefaultBindingMode("TwoWay");
						var oArguments = oEvent.getParameter("arguments");
						var sRequestId = oArguments.RequestId;
						var sProduct = oArguments.Product;

						var oAddItemViewModel = this.getView().getModel("addItemView");
						oAddItemViewModel.setProperty("/RequestId", sRequestId);
						oAddItemViewModel.setProperty("/Product", sProduct);

						var sPath = oModel.createKey("/RequestHeaderSet", {
							RequestId: sRequestId,
							RequestType: 'Add'
						});
						var oContext = new sap.ui.model.Context(oModel, sPath);
						this.getView().byId("idHeaderContent").bindElement(sPath, "header");

						// Construct dirty flag model.
						this.initializeDirtyFlag();
						this.getView().setBusy(false);

						// Always land on First Tab. 
						var oAddItemViewModel = this.getView().getModel("addItemView");
						oAddItemViewModel.setProperty("/selectedTab", "requestdetail");
						var oTabBar = this.getView().byId("idCreateHeaderTabs");
						oTabBar.fireSelect();

					} catch (err) {
						console.log(err);
						this.getView().setBusy(false);
					}
				},

				onAfterRendering: function () {
					this.getView().setBusy(false);
				},

				createNewItemElement: function (sRequestId, sProduct) {
					var oModel = this.getView().getModel();
					if (sProduct !== "null") {
						var sPath = oModel.createKey("/ITMGeneralSet", {
							RequestId: sRequestId,
							ProductId: sProduct,

						});
					} else {
						var sCreatePath = oModel.createKey("/ITMGeneralSet", {
							RequestId: sRequestId,
							ProductId: ''
						});
						var oData = {
							RequestId: sRequestId,
							ProductId: ''
						}
						var oContext = oModel.createEntry("/ITMGeneralSet", {
							properties: oData,
						});
						var sPath = oContext.getPath();
					}
					return sPath;
				},

				addFragmentToBlock: function (sFragmentId, sId, sFragmentName) {
					var oSection = this.getView().byId(sId);
					var sFragmentName =
						"ui.newell.PrecisionMaterial.fragments." + sFragmentName;
					var oFragment = sap.ui.xmlfragment(sFragmentId, sFragmentName, this);
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				},

				handleNavBackToCreate: function (oEvent) {
					var oContext = this.getView().byId("idHeaderContent").getBindingContext();
					var oRequestData = oContext.getObject();
					this.getRouter().navTo("create", {
						RequestId: oRequestData.RequestId,
						RequestType: oRequestData.RequestType
					});
				},

				handleItemCancel: function () {
					var oController = this;
					MessageBox.confirm("Are you sure you want to Cancel?", {
						actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							if (sAction === "YES") {

							}
						},
					});
				},

				handleItemSave: function () {

					var oController = this;
					var oModel = this.getView().getModel();
					var oAddItemViewModel = this.getView().getModel("addItemView");
					var sKey = oAddItemViewModel.getProperty("/selectedTab");

					if (sKey !== "altlanguage" && sKey !== "characteristics" && sKey !== "logistics") {
						var oMessageModel = this.getView().getModel("message");
						oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
							var bSuccess = oEvent.getParameter("success");
							if (!bSuccess) {
								sap.m.MessageToast.show("Request Failed, Check the Log");
							} else {
								sap.m.MessageToast.show("Item Updated Successfully");
							}
						});
						oModel.submitChanges();
						oController.resetDirtyFlag();

					} else {

						switch (sKey) {
						case "altlanguage":
							this.updateAltLanguage();
							break;
						case "characteristics":
							this.updateCharacteristic();
							break;
						case "logistics":
							this.updateLogistics();
							break;
						}

					}
				},

				updateAltLanguage: function () {
					var oAddItemViewModel = this.getView().getModel("addItemView");
					var sRequestId = oAddItemViewModel.getProperty("/RequestId");
					var sProduct = oAddItemViewModel.getProperty("/Product");
					var oTable = this._oDelegateHelper.getAltLangDelegate().getLanguageModifier();
					var aItems = oTable.getItems();
					if (aItems.length === "0") {
						sap.m.MessageBox.information("No items to be Updated");
						return;
					} else {

						var aLangData = [];
						$.each(aItems, function (index, oItem) {
							var oData = oItem.getBindingContext().getObject();
							aLangData.push(oData);
						});

						var oPayload = {
							RequestId: sRequestId,
							ProductId: sProduct,
							langd: aLangData
						}

						var oModel = this.getView().getModel();
						oModel.create("/HDRReqDetailsSet", oPayload, {
							success: function (oData, oResponse) {
								oTable.getBinding("items").refresh();
								sap.m.MessageBox.success("Language Updated Successfully");
							},
							error: function (oData, oResponse) {
								sap.m.MessageBox.error("Language update failed");
							}
						});

					}
				},

				updateLogistics: function () {

					var oAddItemViewModel = this.getView().getModel("addItemView");
					var sRequestId = oAddItemViewModel.getProperty("/RequestId");
					var sProduct = oAddItemViewModel.getProperty("/Product");
					var oTable = this._oDelegateHelper.getLogisticsDelegate().getLogisticsTable();
					var aItems = oTable.getItems();

					var oLogisticsContext = this._oDelegateHelper.getLogisticsDelegate().getFragment().getBindingContext();
					var oData = oLogisticsContext.getObject();

					var aLogistics = [];
					$.each(aItems, function (index, oItem) {
						var oData = oItem.getBindingContext().getObject();
						aLogistics.push(oData);
					});

					oData.logisd = aLogistics;

					var oModel = this.getView().getModel();
					oModel.create("/ITMLogisticalSet", oData, {
						success: function (oData, oResponse) {
							oTable.getBinding("items").refresh();
							sap.m.MessageBox.success("Logistics data Updated Successfully");
						},
						error: function (oData, oResponse) {
							sap.m.MessageBox.error("Logistics data update failed");
						}
					});
				},

				updateCharacteristic: function () {
					var oAddItemViewModel = this.getView().getModel("addItemView");
					var sRequestId = oAddItemViewModel.getProperty("/RequestId");
					var sProduct = oAddItemViewModel.getProperty("/Product");
					var oCharacteristicModel = this.getView().getModel("characteristicsui");
					var oData = oCharacteristicModel.getData();
					var aCharacteristics = oData.ui;
					var oPayload = {
						RequestId: sRequestId,
						ProductId: sProduct,
						chrtsd: aCharacteristics
					}
					var oModel = this.getView().getModel();
					oModel.create("/HDRReqDetailsSet", oPayload, {
						success: function (oData, oResponse) {
							sap.m.MessageBox.success("Characteristic Updated Successfully");
						},
						error: function (oData, oResponse) {
							sap.m.MessageBox.error("Characteristic update failed");
						}
					});
				},

				validateNavigation: function () {
					var oAddItemViewModel = this.getView().getModel("addItemView");
					var sKey = oAddItemViewModel.getProperty("/previousTab");
					var bInvalidData = false;
					switch (sKey) {
					case "requestdetail":
						break;
					case "altlanguage":
						break;
					case "characteristics":
						break;
					case "plant":
						bInvalidData = this._oDelegateHelper.getPlantDelegate().validateValueState();
						break;
					case "salesorg":
						break;
					case "logistics":
						break;
					case "supplychain":
						break;
					case "demand":
						break;
					case "purchasing":
						break;
					}
					return bInvalidData;
				},

				handleAddItemTabSelect: function (oEvent) {
					var oTabBar = oEvent.getSource();
					var oAddItemViewModel = this.getView().getModel("addItemView");
					var bReset = oAddItemViewModel.getProperty("/resetTab");
					var sCurrentKey = oAddItemViewModel.getProperty("/currentTab");
					var sKey = oAddItemViewModel.getProperty("/selectedTab");
					if (sKey === sCurrentKey) {
						return;
					}
					if (!sCurrentKey) {
						// This is the initial navigation. 
						// Previous tab will always be the first tab. 
						oAddItemViewModel.setProperty("/previousTab", "requestdetail");
					} else {
						oAddItemViewModel.setProperty("/previousTab", sCurrentKey);
					}
					// Before navigating to new tab, check the dirty flag. 
					oAddItemViewModel.setProperty("/currentTab", sKey);

					// Validate Data
					if (!bReset) {
						var bInvalidData = this.validateNavigation();
						if (bInvalidData) {
							// Prevent Navigation
							var sPreviousTab = oAddItemViewModel.getProperty("/previousTab");
							oAddItemViewModel.setProperty("/resetTab", true);
							oAddItemViewModel.setProperty("/selectedTab", sPreviousTab);
							oTabBar.fireSelect({
								key: sPreviousTab
							});
							sap.m.MessageBox.error("Please fix the errors to proceed with navigation");
							return;
						}
					} else {
						oAddItemViewModel.setProperty("/resetTab", false);
					}

					if (!bReset) {
						var bDirty = this.getDirtyFlag();
						if (bDirty) {
							var oController = this;
							var sPreviousTab = oAddItemViewModel.getProperty("/previousTab");
							var sTabTitle = "";
							switch (sPreviousTab) {
							case "requestdetail":
								sTabTitle = "General";
								break;
							case "altlanguage":
								sTabTitle = "ALT Language";
								break;
							case "characteristics":
								sTabTitle = "Characteristics";
								break;
							case "plant":
								sTabTitle = "Plant";
								break;
							case "salesorg":
								sTabTitle = "Sales Org";
								break;
							case "logistics":
								sTabTitle = "Logistics";
								break;
							case "supplychain":
								sTabTitle = "Supply Chain";
								break;
							case "demand":
								sTabTitle = "Demand";
								break;
							case "purchasing":
								sTabTitle = "Purchasing";
								break;
							}

							var sMessage = "There are unsaved changes from the tab " + sTabTitle + ". Do you want to Save them?";
							this._oDataLossDialog.getFragment().setModel(oAddItemViewModel);
							oAddItemViewModel.setProperty("/dataLossText", sMessage);
							this._oDataLossDialog.openDataLossDialog(sMessage, function (sAction) {
								switch (sAction) {
								case "SAVE":
									oController.updateChanges();
									oController.resetDirtyFlag();
									oController.tabSelectionChange(sKey);
									break;
								case "DISCARD":
									oController.discardChanges();
									oController.resetDirtyFlag();
									oController.tabSelectionChange(sKey);
									break;
								case "CANCEL":
									oAddItemViewModel.setProperty("/resetTab", true);
									oAddItemViewModel.setProperty("/selectedTab", sPreviousTab);
									oTabBar.fireSelect({
										key: sPreviousTab
									});
								}
							});

						} else {
							this.tabSelectionChange(sKey);
						}
					} else {
						oAddItemViewModel.setProperty("/resetTab", false);
					}
				},

				updateChanges: function () {
					var oController = this;
					var oModel = this.getView().getModel();
					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
						var bSuccess = oEvent.getParameter("success");
						if (!bSuccess) {
							sap.m.MessageBox.error("Request Failed, Check the Log");
						} else {
							var oContext = oController._oGeneralItemDelegate.getFragment().getBindingContext();
							var oData = oContext.getObject();
							var oAddItemViewModel = oController.getView().getModel("addItemView");
							oAddItemViewModel.setProperty("/Product", oData.ProductId);
							sap.m.MessageToast.show("Item updated successfully");
						}
					});
					oModel.submitChanges();
				},

				discardChanges: function () {
					var oModel = this.getView().getModel();
					oModel.resetChanges();
				},

				initializeDirtyFlag: function () {
					var oDirtyFlagModel = new sap.ui.model.json.JSONModel();
					oDirtyFlagModel.setData({
						change: false
					});
					this.getView().setModel(oDirtyFlagModel, "dirtyflag");
					var oModel = this.getView().getModel();
					oModel.attachPropertyChange(function (oEvent) {
						oDirtyFlagModel.setData({
							change: true
						});
					});
				},

				resetDirtyFlag: function () {
					var oDirtyFlagModel = this.getView().getModel("dirtyflag");
					oDirtyFlagModel.setData({
						change: false
					});
				},

				getDirtyFlag: function () {
					var oDirtyModel = this.getView().getModel("dirtyflag");
					var oDirtyFlag = oDirtyModel.getData();
					return oDirtyFlag.change;
				}

			}
		);
	}
);
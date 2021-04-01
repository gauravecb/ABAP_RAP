sap.ui.define(
	["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "../util/TableDownloader",
		"ui/newell/PrecisionMaterial/delegate/RequestDetailDelegate",
		"ui/newell/PrecisionMaterial/delegate/DatalossDelegate",
	],
	function (BaseController, JSONModel, MessageBox, TableDownloader, RequestDetailDelegate, DatalossDelegate) {
		"use strict";

		return BaseController.extend(
			"ui.newell.PrecisionMaterial.controller.Create", {
				onInit: function () {
					var oViewModel,
						fnSetAppNotBusy,
						iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
					this.getView().setBusyIndicatorDelay(0);
					oViewModel = new JSONModel({
						busy: true,
						delay: 0,
						previousTab: "",
						currentTab: "",
						selectedTab: "",
						resetTab: false,
						dataLossText: "",
						RequestId: "",
					});
					this.setModel(oViewModel, "createView");

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

					// Initialize the Pages
					this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					// 	this._oRouter.attachRoutePatternMatched(
					// 		this._handleRoutePatternMatched,
					// 		this
					// 	);
					this._oRouter.getRoute("create").attachMatched(this._handleRoutePatternMatched, this);

					if (!this._oRequestDetailDelegate) {
						this._oRequestDetailDelegate = new RequestDetailDelegate({
							view: this.getView()
						});
						var oFragment = this._oRequestDetailDelegate.getFragment();
						var oSection = this.getView().byId("idRequestDetailsSection");
						this.getView().addDependent(oFragment);
						oSection.addContent(oFragment);
					}

					this.addFragmentToBlock(
						"idProductDetails",
						"idProductDetailsSection",
						"ProductDetails"
					);
					this.addFragmentToBlock(
						"idRelatedRequest",
						"idRelatedRequestSection",
						"RelatedRequest"
					);
					this.addFragmentToBlock(
						"idAttachments",
						"idAttachmentSection",
						"Attachments"
					);
					this.addFragmentToBlock(
						"idSkuCodes",
						"idSKUCodesSection",
						"SkuCodes"
					);
					this.addFragmentToBlock("idComments", "idCommentsSecton", "Comments");
					this.addFragmentToBlock(
						"idApproval",
						"idApprovalsSection",
						"Approvals"
					);
					this.addFragmentToBlock("idHistory", "idHistorySection", "History");
					this.addFragmentToBlock(
						"idWorkflow",
						"idWorkflowRoutingSection",
						"Workflow"
					);

					this._oTableDownloader = new TableDownloader(this.getOwnerComponent());

					// Initialize Data Loss Delegate
					if (!this._oDataLossDialog) {
						this._oDataLossDialog = new DatalossDelegate({
							view: this.getView()
						});
						this.getView().addDependent(this._oDataLossDialog.getFragment());
					}

					// Register the Message Manager
					this.registerMessageManager();
				},

				subscribeToMessages: function () {
					var oPopover = this.getView().byId("idMessagePopoverView");
					var oController = this;
					// 	this._oBinding.detachChange();
					this._oBinding.attachChange(function (oEvent) {
						var aMessages = oEvent.getSource().getModel().getData();
						for (var i = 0; i < aMessages.length; i++) {
							if (aMessages[i].type === "Error" && !aMessages[i].technical) {
								oPopover.firePress();
							}
						}
					});
				},

				addFragmentToBlock: function (sFragmentId, sId, sFragmentName) {
					var oSection = this.getView().byId(sId);
					var sFragmentName =
						"ui.newell.PrecisionMaterial.fragments." + sFragmentName;
					var oFragment = sap.ui.xmlfragment(sFragmentId, sFragmentName, this);
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				},

				_handleRoutePatternMatched: function (oEvent) {

					try {
						this.getView().setBusy(true);
						var oModel = this.getView().getModel();
						oModel.setDefaultBindingMode("TwoWay");
						var oArguments = oEvent.getParameter("arguments");
						var sRequestId = oArguments.RequestId;
						var sRequestType = oArguments.RequestType;
						var sPath = oModel.createKey("/RequestHeaderSet", {
							RequestId: sRequestId,
							RequestType: sRequestType
						});
						this.getView().bindElement(sPath);

						var oQueryModel = this.getView().getModel("querydata");
						var oQueryData = oQueryModel.getData();
						var oBackButton = this.getView().byId("idBackButton");
						if (oQueryData.ViewName === "SEARCH") {
							oBackButton.setText("Back to Search");
						} else {
							oBackButton.setText("Back to Worklist");
						}

						// Set the Selected Key to first tab.
						var oTabbar = this.getView().byId("idCreateHeaderTabs");

						// Construct dirty flag model.
						this.initializeDirtyFlag();

						// Subscribe to Messages in the View
						this.subscribeToMessages();

						this.getView().setBusy(false);
					} catch (err) {
						console.log(err);
						this.getView().setBusy(false);
					}
				},

				handleTokenChange: function (oEvent) {
					var oSource = oEvent.getSource();
					var sText = oSource.getValue();
					oSource.setValue("");
					var aSplitText = sText && sText.split(",");
					$.each(aSplitText, function (index, sValue) {
						var oToken = new sap.m.Token({
							key: sValue,
							text: sValue
						});
						oSource.addToken(oToken);
					});
				},

				onAfterRendering: function () {
					this.getView().setBusy(false);
				},

				bindAttachments: function (sRequestId) {
					var oFileUploader = sap.ui.core.Fragment.byId("idAttachments", "idUpload");
					var oTemplate = oFileUploader.getBindingInfo("items").template;
					var aFilters = [];
					var oFilter = new sap.ui.model.Filter("RequestId", "EQ", sRequestId);
					aFilters.push(oFilter);
					oFileUploader.bindAggregation("items", {
						path: '/HDRAttachmentsSet',
						filters: aFilters,
						templateShareable: true,
						template: oTemplate
					});
				},

				bindProductDetails: function (sRequestId) {
					var oTable = sap.ui.core.Fragment.byId("idProductDetails", "idProductDetailsTable");
					var oTemplate = oTable.getBindingInfo("items").template;
					var aFilters = [];
					var oFilter = new sap.ui.model.Filter("RequestId", "EQ", sRequestId);
					aFilters.push(oFilter);
					oTable.bindAggregation("items", {
						path: '/HDRReqDetailsSet',
						filters: aFilters,
						templateShareable: true,
						template: oTemplate
					});
				},
			

				bindSkuTable: function (sRequestId) {
					var oSkuTable = sap.ui.core.Fragment.byId("idSkuCodes", "idSkuCodesTable");
					var oTemplate = oSkuTable.getBindingInfo("items").template;
					var aFilters = [];
					var oFilter = new sap.ui.model.Filter("RequestId", "EQ", sRequestId);
					aFilters.push(oFilter);
					oSkuTable.bindAggregation("items", {
						path: '/HDRSKUCodesSet',
						filters: aFilters,
						templateShareable: true,
						template: oTemplate
					});
				},

				bindRelatedRequestTable: function (sRequestId) {
					var oTable = sap.ui.core.Fragment.byId("idRelatedRequest", "idRelatedRequestsTable");
					var oTemplate = oTable.getBindingInfo("items").template;
					var aFilters = [];
					var oFilter = new sap.ui.model.Filter("RequestId", "EQ", sRequestId);
					aFilters.push(oFilter);
					oTable.bindAggregation("items", {
						path: '/HDRRelatedRequestsSet',
						filters: aFilters,
						templateShareable: true,
						template: oTemplate
					});
				},

				handleNavBacToWorklist: function (oEvent) {
					this.getRouter().navTo("worklist");
				},

				handleAddItem: function (oEvent) {
					var oContext = this.getView().getBindingContext();
					var oRequestData = oContext.getObject();
					this.getRouter().navTo("additem", {
						RequestId: oRequestData.RequestId,
						Product: "null"
					});
				},

				handleEdittem: function (oEvent) {
					var oProductData = oEvent.getSource().getBindingContext().getObject();
					var oContext = this.getView().getBindingContext();
					var oRequestData = oContext.getObject();
					this.getRouter().navTo("additem", {
						RequestId: oRequestData.RequestId,
						Product: oProductData.ProductId
					});
				},

				handleSave: function () {
					var oController = this;
					var oModel = this.getView().getModel();
					oModel.submitChanges();
					// 	MessageBox.confirm("Are you sure you want to Save?", {
					// 		actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
					// 		onClose: function (sAction) {
					// 			if (sAction === "YES") {
					// 				oModel.submitChanges();
					// 			}
					// 		},
					// 	});
				},

				handleCreateTabSelect: function (oEvent) {

					debugger;
					var oTabBar = oEvent.getSource();
					var oViewModel = this.getView().getModel("createView");
					var bReset = oViewModel.getProperty("/resetTab");
					var sCurrentKey = oViewModel.getProperty("/currentTab");
					var sKey = oViewModel.getProperty("/selectedTab");
					if (sKey === sCurrentKey) {
						return;
					}
					if (!sCurrentKey) {
						oViewModel.setProperty("/previousTab", "requestdetail");
					} else {
						oViewModel.setProperty("/previousTab", sCurrentKey);
					}
					oViewModel.setProperty("/currentTab", sKey);

					// Validate Data
					if (!bReset) {
						var bInvalidData = this.validateNavigation();
						if (bInvalidData) {
							// Prevent Navigation
							var sPreviousTab = oViewModel.getProperty("/previousTab");
							oViewModel.setProperty("/resetTab", true);
							oViewModel.setProperty("/selectedTab", sPreviousTab);
							oTabBar.fireSelect({
								key: sPreviousTab
							});
							sap.m.MessageBox.error("Please fix the errors to proceed with navigation");
							return;
						}
					} else {
						// 		oViewModel.setProperty("/resetTab", false);
						oViewModel.setProperty("/resetTab", false);
					}

					// Before navigating to new tab, check the dirty flag. 
					if (!bReset) {
						var bDirty = this.getDirtyFlag();
						if (bDirty) {
							var oController = this;

							var oController = this;
							var sPreviousTab = oViewModel.getProperty("/previousTab");
							var sTabTitle = "";
							switch (sPreviousTab) {

							case "requestdetail":
								sTabTitle = "Request Detail";
								break;
							case "productdetail":
								sTabTitle = "Product Detail";
								break;
							case "relatedrequest":
								sTabTitle = "Related Request";
								break;
							case "attachments":
								sTabTitle = "Attachments";
								break;

							case "skucodes":
								sTabTitle = "SKU Codes";
								break;
							case "comments":
								sTabTitle = "Comments";
								break;
							case "approvals":
								sTabTitle = "Approvals";
								break;
							case "history":
								sTabTitle = "History";
								break;
							case "workflow":
								sTabTitle = "Workflow";
								break;
							}

							var sMessage = "There are unsaved changes from the tab " + sTabTitle + ". Do you want to Save them?";
							// 			this._oDataLossDialog.setModel(oViewModel);
							this._oDataLossDialog.getFragment().setModel(oViewModel);
							oViewModel.setProperty("/dataLossText", sMessage);
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
									oViewModel.setProperty("/resetTab", true);
									oViewModel.setProperty("/selectedTab", sPreviousTab);
									oTabBar.fireSelect({
										key: sPreviousTab
									});
								}
							});
						} else {
							this.tabSelectionChange(sKey);
						}
					} else {
						oViewModel.setProperty("/resetTab", false);
						this.tabSelectionChange(sKey);
					}
				},

				tabSelectionChange: function (sKey) {
					var oViewModel = this.getView().getModel("createView");
					var oHeaderContext = this.getView().getBindingContext();
					var oHeaderData = oHeaderContext && oHeaderContext.getObject();
					var sRequestId = oHeaderData && oHeaderData.RequestId;
					var sKey = oViewModel.getProperty("/selectedTab");
					switch (sKey) {
					case "requestdetail":
						// Bind Attachments 
						break;
					case "productdetail":
						this.bindProductDetails(sRequestId);
						break;
					case "relatedrequest":
						this.bindRelatedRequestTable(sRequestId);
						break;
					case "attachments":
						this.bindAttachments(sRequestId);
						break;
					case "skucodes":
						this.bindSkuTable(sRequestId);
						break;
					case "comments":
						this.bindCommentsTable(sRequestId);
						break;
					case "approvals":
						break;
					case "history":
						break;
					case "workflow":
						break;
					}
				},

				validateNavigation: function () {
					var bInvalidData = false;
					return bInvalidData;
				},

				updateChanges: function () {
					var oModel = this.getView().getModel();
					oModel.submitChanges();
				},

				discardChanges: function () {
					var oModel = this.getView().getModel();
					oModel.resetChanges();
				},

				handleReserve: function () {
					this.workflowAction("RESERVE", "Reserve");
					// 	var oController = this;
					// 	MessageBox.confirm("Are you sure you want to Reserve?", {
					// 		actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
					// 		onClose: function (sAction) {
					// 			if (sAction === "YES") {}
					// 		},
					// 	});
				},

				handleDelete: function () {
					this.workflowAction("DELETE", "Delete");
					// 	var oController = this;
					// 	MessageBox.confirm("Are you sure you want to Delete?", {
					// 		actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
					// 		onClose: function (sAction) {
					// 			if (sAction === "YES") {}
					// 		},
					// 	});
				},

				handleCancel: function () {
					this.workflowAction("CANCEL", "Cancel");
					// 	var oController = this;
					// 	MessageBox.confirm("Are you sure you want to Delete?", {
					// 		actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
					// 		onClose: function (sAction) {
					// 			if (sAction === "YES") {}
					// 		},
					// 	});
				},

				handleDeleteItem: function () {
					var oController = this;
					MessageBox.confirm("Are you sure you want to Delete?", {
						actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							if (sAction === "YES") {}
						},
					});
				},

				handleCopyItem: function () {
					var oController = this;
					MessageBox.confirm("Are you sure you want to Copy this Item?", {
						actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							if (sAction === "YES") {}
						},
					});
				},

				onBeforeUploadStarts: function (oEvent) {
					// 	var sId = "idUpload";
					// 	var sAttachId = "idAttachments";
					var oFileUploader = oEvent.getSource();
					oFileUploader.setBusy(true);

					this._oFileUploader = oFileUploader;
					var oContext = this.getView().getBindingContext();
					var oRequestData = oContext.getObject();
					var sFileName = oEvent.getParameter("fileName");
					var sAttachmentType = "xlsx";
					var sSlug = oRequestData.RequestId + "|" + sFileName + "|" + "C11" + "|" + sAttachmentType;
					oFileUploader.removeAllHeaderParameters();
					var oModel = this.getView().getModel();
					oModel.refreshSecurityToken();
					var sToken = oModel.getSecurityToken();
					var oHeaderParameter = new sap.m.UploadCollectionParameter({
						name: "x-csrf-token",
						value: sToken
					});
					oEvent.getParameters().addHeaderParameter(oHeaderParameter);
					// 	oFileUploader.insertHeaderParameter(oHeaderParameter);
					var oHeaderParameter = new sap.m.UploadCollectionParameter({
						name: "slug",
						value: sSlug
					});
					oEvent.getParameters().addHeaderParameter(oHeaderParameter);
					// 	oFileUploader.insertHeaderParameter(oHeaderParameter);
					// 	oFileUploader.setSendXHR(true);
				},

				onUploadComplete: function (oEvent) {
					var sStatus = oEvent.getParameter("status");
					this._oFileUploader.getBinding("items").refresh();
					this._oFileUploader.setBusy(false);
				},

				handleAddSkuCodes: function (oEvent) {

					var oContext = this.getView().getBindingContext();
					var oRequestData = oContext.getObject();
					var oModel = this.getView().getModel();
					var oSkuTable = sap.ui.core.Fragment.byId("idSkuCodes", "idSkuCodesTable");
					var oMultiInput = sap.ui.core.Fragment.byId("idSkuCodes", "idSkuCodeInput");
					var aTokens = oMultiInput.getTokens();

					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
						oMultiInput.removeAllTokens();
						oSkuTable.getBinding("items").refresh();
					});

					$.each(aTokens, function (index, oToken) {
						var sSkuCode = oToken.getKey();
						var oData = {};
						oData.RequestId = oRequestData.RequestId;
						oData.SKUCode = sSkuCode;

						var oContext = oModel.createEntry("/HDRSKUCodesSet", {
							properties: oData
						});
						oModel.submitChanges();
					});

				},

				handleAddRelatedRequests: function (oEvent) {
					var oContext = this.getView().getBindingContext();
					var oRequestData = oContext.getObject();
					var oModel = this.getView().getModel();
					var oSkuTable = sap.ui.core.Fragment.byId("idRelatedRequest", "idRelatedRequestsTable");
					var oMultiInput = sap.ui.core.Fragment.byId("idRelatedRequest", "idRelatedRequestInput");
					var aTokens = oMultiInput.getTokens();

					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
						oMultiInput.removeAllTokens();
						oSkuTable.getBinding("items").refresh();
					});

					$.each(aTokens, function (index, oToken) {
						var sRelRequestId = oToken.getKey();
						var oData = {};
						oData.RequestId = oRequestData.RequestId;
						oData.RelRequestId = sRelRequestId;

						var oContext = oModel.createEntry("/HDRRelatedRequestsSet", {
							properties: oData
						});
					});
					oModel.submitChanges();
				},

				handleSaveComments: function () {
					var oContext = this.getView().getBindingContext();
					var oRequestData = oContext.getObject();
					var oMultiInput = sap.ui.core.Fragment.byId("idComments", "idComments");
					var sValue = oMultiInput.getValue();
					var oModel = this.getView().getModel();
					var oData = {};
					oData.RequestId = oRequestData.RequestId;
					oData.Date = new Date();
					oData.Comment = sValue;
					var oContext = oModel.createEntry("/HDRCommentsSet", {
						properties: oData
					});
					oModel.submitChanges();
				},

				handleDownloadAttachment: function (oEvent) {
					var oSource = oEvent.getSource();
					var oContext = oSource.getBindingContext();
					var oItemData = oContext.getObject();
					var oHeaderData = this.getView().getBindingContext().getObject();
					var oData = {
						RequestId: oHeaderData.RequestId,
						FileName: oItemData.FileName
					};
					var oModel = this.getView().getModel();
					var sPath = oModel.createKey("/HDRAttachmentsSet", oData);

					var sOpenUrl = "/sap/opu/odata/SAP/ZCL_MATERIAL_MASTER_SRV" + sPath + "/$value";
					window.open(sOpenUrl, "_blank");
				},

				handleAttachmentDelete: function (oEvent) {
					var oSource = oEvent.getSource();
					var sPath = oSource.getBindingContext().getPath();
					sPath = sPath + "/$value";
					var oData = oSource.getBindingContext().getObject();
					var sFileName = oData.FileName;
					var sMessage = "Are you sure you want to delete this Attachment " + sFileName + "?";
					var oModel = this.getView().getModel();
					var oController = this;
					var oFileUploader = sap.ui.core.Fragment.byId("idAttachments", "idUpload");
					sap.m.MessageBox.confirm(sMessage, {
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							if (sAction === 'YES') {
								oModel.remove(sPath, {
									success: function (oData, oResponse) {
										oFileUploader.getBinding("items").refresh();
										sap.m.MessageBox.success("File " + sFileName + " Deleted successfully");
									},
									error: function (oResponse) {
										sap.m.MessageBox.error("Error in file delete");
									}
								});
							}
						}
					});
				},

				handleSubmit: function (oEvent) {
					this.workflowAction("SUBMIT", "Submit");
				},

				workflowAction: function (sAction, sActionText) {
					var oHeaderContext = this.getView().getBindingContext();
					var oHeaderData = oHeaderContext.getObject();
					var sMessage = "Are you sure you want to " + sActionText + " the document " + oHeaderData.RequestId + "?";
					var oModel = this.getView().getModel();
					var oController = this;

					sap.m.MessageBox.confirm(sMessage, {
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CLOSE],
						onClose: function (sActionCode) {
							if (sActionCode === 'YES') {
								var oPayload = {
									RequestId: oHeaderData.RequestId,
									UserAction: sAction
								}
								oModel.create("/WorkFlowSet", oPayload, {
									success: function (oData, oResponse) {
										debugger;
										var sMessage = "";
										switch (sActionText) {
										case "Submit":
											sMessage = "The Document " + oHeaderData.RequestId + " is submitted successfully";
											break;
										case "Reserve":
											sMessage = "The Document " + oHeaderData.RequestId + " is reserved successfully";
											break;
										case "Cancel":
											sMessage = "The Document " + oHeaderData.RequestId + " is cancelled successfully";
											break;
										case "Delete":
											sMessage = "The Document " + oHeaderData.RequestId + " is deleted successfully";
											break;
										}
										sap.m.MessageBox.success(sMessage);
									},
									error: function (oResponse) {
										sap.m.MessageBox.error("The Workflow Action is failed.");
									}
								});
							}
						}
					});
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
				},

				handleSKUDelete: function (oEvent) {
					var sMessage = "Are you sure you want to Delete the SKU Code?"
					var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();
					var oModel = this.getView().getModel();
					var oSkuTable = sap.ui.core.Fragment.byId("idSkuCodes", "idSkuCodesTable");
					sap.m.MessageBox.confirm(sMessage, {
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CLOSE],
						onClose: function (sActionCode) {
							if (sActionCode === "YES") {
								oModel.remove(sPath, {
									success: function (oResponse) {
										oSkuTable.getBinding("items").refresh();
										sap.m.MessageBox.success("SKU Code deleted successfully");
									},
									error: function (oResponse) {
										sap.m.MessageBox.error("SKU Code deletion failed");
									}
								})
							}
						}
					});
				},

				handleRelatedRequestDelete: function (oEvent) {
					debugger;
					var sMessage = "Are you sure you want to Delete the Related Request?"
					var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();
					var oModel = this.getView().getModel();
					var oRelatedRequestTable = sap.ui.core.Fragment.byId("idRelatedRequest", "idRelatedRequestsTable");
					sap.m.MessageBox.confirm(sMessage, {
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CLOSE],
						onClose: function (sActionCode) {
							if (sActionCode === "YES") {
								oModel.remove(sPath, {
									success: function (oResponse) {
										oRelatedRequestTable.getBinding("items").refresh();
										sap.m.MessageBox.success("Related request deleted successfully");
									},
									error: function (oResponse) {
										sap.m.MessageBox.error("Related request deletion failed");
									}
								})
							}
						}
					});
				},

				handleDownloadProductDetails: function (oEvent) {
					var oTable = oEvent.getSource().getParent().getParent();
					this._oTableDownloader.exportFile(oTable, "Product Details.xlsx");
				},

				handleSKUCodes: function (oEvent) {
					var oTable = oEvent.getSource().getParent().getParent();
					this._oTableDownloader.exportFile(oTable, "SKU Codes.xlsx");
				},

				onMessagePopoverPress: function (oEvent) {
					this._getMessagePopover().toggle(oEvent.getSource());
				},

				/**
				 * Get the instance of the message popover dialog
				 * @memberOf
				 * @returns oMessagePopover {sap.m.MessagePopover}
				 */
				_getMessagePopover: function () {
					if (!this._oMessagePopover) {
						this._oMessagePopover = sap.ui.xmlfragment(
							this.getView().getId(),
							"ui.newell.PrecisionMaterial.fragments.MessagePopover",
							this
						);
						this.getView().addDependent(this._oMessagePopover);
					}
					return this._oMessagePopover;
				},

			}
		);
	});
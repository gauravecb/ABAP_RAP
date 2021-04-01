sap.ui.define(
	[
		"./BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/ValidateException",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
	],
	function (
		BaseController,
		JSONModel,
		ValidateException,
		MessageBox,
		MessageToast
	) {
		"use strict";

		return BaseController.extend(
			"ui.newell.PrecisionMaterial.controller.CreateConf", {
				onInit: function () {
					var that = this;
					var oViewModel,
						fnSetAppNotBusy,
						iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

					oViewModel = new JSONModel({
						enableCreate: true,
						busy: true,
						delay: 0,
					});
					this.setModel(oViewModel, "createConfView");

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

					this.getOwnerComponent()
						.getRouter()
						.getRoute("createconf")
						.attachPatternMatched(this.onRouteMatched, this);

					// Register the view with the message manager
					sap.ui
						.getCore()
						.getMessageManager()
						.registerObject(this.getView(), true);
					var oMessagesModel = sap.ui
						.getCore()
						.getMessageManager()
						.getMessageModel();
					this._oBinding = new sap.ui.model.Binding(
						oMessagesModel,
						"/",
						oMessagesModel.getContext("/")
					);
					this.getView().setModel(oMessagesModel, "message");
					this._oBinding.attachChange(function (oEvent) {
						var aMessages = oEvent.getSource().getModel().getData();
						for (var i = 0; i < aMessages.length; i++) {
							if (aMessages[i].type === "Error" && !aMessages[i].technical) {
								// that._oViewModel.setProperty("/enableCreate", false);
							}
						}
					});
				},

				onRouteMatched: function () {
					this.createNewElement();
				},

				createNewElement: function () {
					var oModel = this.getView().getModel();
					var oData = {
						"RequestType": "Add"
					}
					var oContext = oModel.createEntry("/RequestHeaderSet", {
						properties: oData,
					});
					var sPath = oContext.getPath();
					this.getView().bindElement(sPath);
				},

				handleContinue: function () {
					var oController = this;
					var oSmartForm = this.getView().byId("idCreateConf");

					if (this._validateSaveEnablement()) {
						return;
					}

					sap.m.MessageBox.confirm(
						"Are you sure you want to Create the Request?", {
							actions: [
								sap.m.MessageBox.Action.YES,
								sap.m.MessageBox.Action.CLOSE,
							],
							onClose: function (sAction) {
								if (sAction === "YES") {
									// console.log(oSmartForm);
									oController.createRequestDocument();
									// oController.getView().getModel().submitChanges();
									// oController.getRouter().navTo("create", true);
								}
							},
						}
					);
				},

				createRequestDocument: function () {

					try {
						this.getView().setBusy(true);
						var that = this;
						var oModel = this.getView().getModel();
						var oMessageModel = this.getView().getModel("message");
						// attach to the request completed event of the batch
						oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
							var bSuccess = oEvent.getParameter("success");
							if (!bSuccess) {
								sap.m.MessageBox.error("Request Failed, Check the Log");
							} else {
								var aMessageData = oMessageModel.getData();
								if (aMessageData.length > 0) {
									sap.m.MessageBox.error("Request Failed, Check the Log");
								} else {
									var oContext = that.getView().getBindingContext();
									var oRequestData = oContext.getObject();
									// RequestId,RequestType
									that.getRouter().navTo("create", {
										RequestId: oRequestData.RequestId,
										RequestType: oRequestData.RequestType
									});
								}
							}
						});
						oModel.submitChanges();
						this.getView().setBusy(false);
					} catch (err) {
						console.log(err);
						this.getView().setBusy(false);
					}
				},

				handleReset: function () {
					var that = this;
					MessageBox.confirm("Are you sure you want to reset the Data?", {
						actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							if (sAction === "YES") {
								that.createNewElement();
							}
						},
					});
				},

				/**
				 * Form Input: Business Region ID
				 * @param {sap.ui.base.Event} oEvent
				 */
				handleBusinessRegionIdChange: function (oEvent) {
					/** Method Defaults: */
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					/** */

					var oSource = oEvent.getSource();
					var sValue = oEvent.getParameter("newValue");
					var sValidated = oEvent.getParameter("validated");
					if (sValidated) {
						return;
					}

					var sPath = "/BusinessRegionSet('" + sValue + "')";
					var oData = oModel.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + "/BusinessRegionId";
						oModel.setProperty(sUpdatePath, oData.BusinessRegionId);
						var sUpdatePath = sBindingPath + "/BusinessRegionDec";
						oModel.setProperty(sUpdatePath, oData.BusinessRegionDec);
					}

					// attach to the request completed event of the batch
					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
						console.log(sPath);
						if (that._checkBusinessRegion(sPath)) {
							oSource.setValueState("None");
							that._fnBatchSuccess();
						} else {
							oSource.setValueState("Error");
							that._fnBatchError();
						}
					});
				},

				_checkBusinessRegion: function (sPath) {
					// Defaults for a Method
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();

					var oData = oModel.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + "/BusinessRegionId";
						oModel.setProperty(sUpdatePath, oData.BusinessRegionId);
						var sUpdatePath = sBindingPath + "/BusinessRegionDec";
						oModel.setProperty(sUpdatePath, oData.BusinessRegionDesc);
						return true;
					} else {
						return false;
					}
				},

				/**
				 * Form Input: Business Unit
				 * @param {*} oEvent
				 */
				handleBusinessUnitChange: function (oEvent) {
					/** Method Defaults: */
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					/** */

					var oSource = oEvent.getSource();
					var sValue = oEvent.getParameter("newValue");
					var sValidated = oEvent.getParameter("validated");
					if (sValidated) {
						oSource.setValueState("None");
						return;
					}

					var oBindingData = oBindingContext.getObject();
					var sPath =
						"/BusinessUnitSet(BusinessRegionId='" +
						oBindingData.BusinessRegionId +
						"',BusiUnitId='" +
						sValue +
						"')";
					var oData = oModel.getProperty(sPath);
					if (oData) {

						var sUpdatePath = sBindingPath + "/BusiUnitId";
						oModel.setProperty(sUpdatePath, oData.BusiUnitId);
						var sUpdatePath = sBindingPath + "/BusiUnitDesc";
						oModel.setProperty(sUpdatePath, oData.BusiUnitDesc);
					}

					// attach to the request completed event of the batch
					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {

						console.log(sPath);
						if (that._checkBusinessUnit(sPath)) {
							oSource.setValueState("None");
							that._fnBatchSuccess();
						} else {
							oSource.setValueState("Error");
							that._fnBatchError();
						}
					});
				},

				_checkBusinessUnit: function (sPath) {

					// Defaults for a Method
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();

					var oData = oModel.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + "/BusiUnitId";
						oModel.setProperty(sUpdatePath, oData.BusiUnitId);
						var sUpdatePath = sBindingPath + "/BusiUnitDesc";
						oModel.setProperty(sUpdatePath, oData.BusiUnitDesc);
						return true;
					} else {
						return false;
					}
				},

				handleSpecificationChange: function (oEvent) {
					/** Method Defaults: */
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					/** */

					var oSource = oEvent.getSource();
					var sValue = oEvent.getParameter("newValue");
					var sValidated = oEvent.getParameter("validated");
					if (sValidated) {
						oSource.setValueState("None");
						return;
					}

					var oBindingData = oBindingContext.getObject();
					var sPath =
						"/SpecificationSet(SpecificationId='" +
						oBindingData.SpecificationId +
						"')";
					var oData = oModel.getProperty(sPath);
					if (oData) {

						var sUpdatePath = sBindingPath + "/SpecificationId";
						oModel.setProperty(sUpdatePath, oData.SpecificationId);
						var sUpdatePath = sBindingPath + "/SpecificationDesc";
						oModel.setProperty(sUpdatePath, oData.SpecificationDesc);
					}

					// attach to the request completed event of the batch
					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {

						console.log(sPath);
						if (that._checkSpecification(sPath)) {
							oSource.setValueState("None");
							that._fnBatchSuccess();
						} else {
							oSource.setValueState("Error");
							that._fnBatchError();
						}
					});
				},

				_checkSpecification: function (sPath) {
					// Defaults for a Method
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					var oData = oModel.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + "/SpecificationId";
						oModel.setProperty(sUpdatePath, oData.SpecificationId);
						var sUpdatePath = sBindingPath + "/SpecificationDesc";
						oModel.setProperty(sUpdatePath, oData.SpecificationDesc);
						return true;
					} else {
						return false;
					}
				},

				handlePlantChange: function (oEvent) {
					/** Method Defaults: */
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					/** */

					var oSource = oEvent.getSource();
					var sValue = oEvent.getParameter("newValue");
					var sValidated = oEvent.getParameter("validated");
					if (sValidated) {
						oSource.setValueState("None");
						return;
					}

					var oBindingData = oBindingContext.getObject();
					var sPath =
						"/PlantSet(PlantId='" +
						oBindingData.PlantId +
						"')";
					var oData = oModel.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + "/PlantId";
						oModel.setProperty(sUpdatePath, oData.PlantId);
						var sUpdatePath = sBindingPath + "/PlantDesc";
						oModel.setProperty(sUpdatePath, oData.PlantDesc);
					}

					// attach to the request completed event of the batch
					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {

						console.log(sPath);
						if (that._checkPlant(sPath)) {
							oSource.setValueState("None");
							that._fnBatchSuccess();
						} else {
							oSource.setValueState("Error");
							that._fnBatchError();
						}
					});
				},

				_checkPlant: function (sPath) {
					// Defaults for a Method
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					var oData = oModel.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + "/PlantId";
						oModel.setProperty(sUpdatePath, oData.PlantId);
						var sUpdatePath = sBindingPath + "/PlantDesc";
						oModel.setProperty(sUpdatePath, oData.PlantDesc);
						return true;
					} else {
						return false;
					}
				},

				handleMaterialTypeChange: function (oEvent) {
					/** Method Defaults: */
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					/** */

					var oSource = oEvent.getSource();
					var sValue = oEvent.getParameter("newValue");
					var sValidated = oEvent.getParameter("validated");
					if (sValidated) {
						oSource.setValueState("None");
						return;
					}

					var oBindingData = oBindingContext.getObject();
					var sPath =
						"/MaterialTypeSet(MaterialTypeId='" +
						oBindingData.MaterialTypeId +
						"')";
					var oData = oModel.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + "/MaterialTypeId";
						oModel.setProperty(sUpdatePath, oData.MaterialTypeId);
						var sUpdatePath = sBindingPath + "/MaterialTypeDesc";
						oModel.setProperty(sUpdatePath, oData.MaterialTypeDesc);
					}

					// attach to the request completed event of the batch
					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
						console.log(sPath);
						if (that._checkRequestState(sPath, "MaterialTypeId", "MaterialTypeDesc")) {
							oSource.setValueState("None");
							that._fnBatchSuccess();
						} else {
							oSource.setValueState("Error");
							that._fnBatchError();
						}
					});
				},

				handleProcurementChange: function (oEvent) {
					/** Method Defaults: */
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					/** */

					var oSource = oEvent.getSource();
					var sValue = oEvent.getParameter("newValue");
					var sValidated = oEvent.getParameter("validated");
					if (sValidated) {
						oSource.setValueState("None");
						return;
					}

					var oBindingData = oContext.getObject();
					var sPath =
						"/ProcurementTypeSet(ProTypeId='" +
						oBindingData.ProTypeId +
						"')";
					var oData = oBindingContext.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + "/ProTypeId";
						oModel.setProperty(sUpdatePath, oData.ProTypeId);
						var sUpdatePath = sBindingPath + "/ProTypeDesc";
						oModel.setProperty(sUpdatePath, oData.ProTypeDesc);
					}

					// attach to the request completed event of the batch
					oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
						console.log(sPath);
						if (that._checkRequestState(sPath, "ProTypeId", "ProTypeDesc")) {
							oSource.setValueState("None");
							that._fnBatchSuccess();
						} else {
							oSource.setValueState("Error");
							that._fnBatchError();
						}
					});
				},

				_checkRequestState: function (sPath, sKey, sDescription) {
					// Defaults for a Method
					var that = this;
					var oModel = this.getView().getModel();
					this.getModel("createConfView").setProperty("/busy", true);
					var oBindingContext = this.getView().getBindingContext();
					var sBindingPath = oBindingContext.getPath();
					var oData = oModel.getProperty(sPath);
					if (oData) {
						var sUpdatePath = sBindingPath + sKey;
						oModel.setProperty(sUpdatePath, oData[sKey]);
						var sUpdatePath = sBindingPath + sDescription;
						oModel.setProperty(sUpdatePath, oData[sDescription]);
						return true;
					} else {
						return false;
					}
				},

				/** Mandatory Validation */
				_getFieldGroupControls: function () {

					var aSmartControls = [];
					var aControls = this.getView().getControlsByFieldGroupId(
						"mandatoryCreate"
					);
					$.each(aControls, function (index, oControl) {
						var sClassName = oControl.getMetadata()._sClassName;
						if (sClassName === "sap.ui.comp.smartfield.SmartField") {
							aSmartControls.push(oControl);
						}
					});
					return aSmartControls;
				},

				/**
				 * Checks if the save button can be enabled
				 * @private
				 */
				_validateSaveEnablement: function () {
					var bInvalid = false;
					var aInputControls = this._getFieldGroupControls();
					$.each(aInputControls, function (index, oControl) {
						var bRequired = oControl.getRequired();
						if (bRequired) {
							var sValue = oControl.getValue();
							if (sValue && sValue !== "") {
								oControl.setValueState("None");
							} else {
								bInvalid = true;
								oControl.setValueState("Error");
							}
						}
					});
					return bInvalid;
				},

				onMessagePopoverPress: function (oEvent) {
					//this._getMessagePopover().openBy(oEvent.getSource());
					this._getMessagePopover().toggle(oEvent.getSource());
				},

				/**
				 * Get the instance of the message popover dialog
				 * @memberOf
				 * @returns oMessagePopover {sap.m.MessagePopover}
				 */
				_getMessagePopover: function () {
					// create popover lazily (singleton)
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

				_checkIfBatchRequestSucceeded: function (oEvent) {

					var oParams = oEvent.getParameters();
					var aRequests = oEvent.getParameters().requests;
					var oRequest;
					if (oParams.success) {
						if (aRequests) {
							for (var i = 0; i < aRequests.length; i++) {
								oRequest = oEvent.getParameters().requests[i];
								if (!oRequest.success) {
									return false;
								}
							}
						}
						return true;
					} else {
						return false;
					}
				},

				_fnBatchSuccess: function () {
					this.getModel("createConfView").setProperty("/busy", false);
				},

				_fnBatchError: function () {
					this.getModel("createConfView").setProperty("/busy", false);
				},
			}
		);
	}
);
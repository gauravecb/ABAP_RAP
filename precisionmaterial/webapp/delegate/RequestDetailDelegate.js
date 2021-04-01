/* =============================================================================================================================================*/
/* Defines the Delegate Class for Request Detail																								*/
/* =============================================================================================================================================*/
/* Application : Precision Material														 														*/
/* The Purpose of this Delegate class is to handle all the events releated to the Request Detail Section of the Create/Edit Screen              */
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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.RequestDetailDelegate", {
			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.CreateRequestDetail",

			/**
			 * Form Input: Business Region ID
			 * @param {sap.ui.base.Event} oEvent
			 */
			handleBusinessRegionIdChange: function (oEvent) {
				/** Method Defaults: */
				var that = this;
				var oModel = this.getFragment().getModel();
				this.getModel("createView").setProperty("/busy", true);
				var oBindingContext = this.getFragment().getBindingContext();
				var sBindingPath = oBindingContext.getPath();
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
				this.getModel("createView").setProperty("/busy", true);
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

			_fnBatchSuccess: function () {
				this.getFragment().getModel("createView").setProperty("/busy", false);
			},

			_fnBatchError: function () {
				this.getFragment().getModel("createView").setProperty("/busy", false);
			},

			_checkRequestState: function (sPath, sKey, sDescription) {
				// Defaults for a Method
				var that = this;
				var oModel = this.getView().getModel();
				this.getModel("createView").setProperty("/busy", true);
				var oBindingContext = this.getView().getBindingContext();
				var sBindingPath = oBindingContext.getPath();
				var oData = oModel.getProperty(sPath);
				if (oData) {
					var sUpdatePath = sBindingPath + "/" + sKey;
					oModel.setProperty(sUpdatePath, oData[sKey]);
					var sUpdatePath = sBindingPath + "/" + sDescription;
					oModel.setProperty(sUpdatePath, oData[sDescription]);
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
				this.getModel("createView").setProperty("/busy", true);
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
				var sPath = oModel.createKey("/BusinessUnitSet", {
					BusinessRegionId: oBindingData.BusinessRegionId,
					BusiUnitId: sValue
				});
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
				this.getModel("createView").setProperty("/busy", true);
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
				this.getModel("createView").setProperty("/busy", true);
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
				// var sPath =
				// 	"/SpecificationSet(SpecificationId='" +
				// 	oBindingData.SpecificationId +
				// 	"')";

				var sPath = oModel.createKey("/SpecificationSet", {
					BusinessRegionId: oBindingData.BusinessRegionId,
					BusiUnitId: oBindingData.BusiUnitId,
					SpecificationId: sValue
				});
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
					if (that._checkRequestState(sPath, "SpecificationId", "SpecificationDesc")) {
						// 	if (that._checkSpecification(sPath)) {
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
				this.getModel("createView").setProperty("/busy", true);
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
				this.getModel("createView").setProperty("/busy", true);
				var oBindingContext = this.getView().getBindingContext();
				var sBindingPath = oBindingContext.getPath();
				var oData = oBindingContext.getObject();
				/** */

				var oSource = oEvent.getSource();
				var sValue = oEvent.getParameter("newValue");
				var sValidated = oEvent.getParameter("validated");
				if (sValidated) {
					oSource.setValueState("None");
					return;
				}

				var oBindingData = oBindingContext.getObject();
				var sPath = oModel.createKey("/PlantSet", {
					BusinessRegionId: oData.BusinessRegionId,
					BusiUnitId: oData.BusiUnitId,
					SpecificationId: oData.SpecificationId,
					PlantId: sValue
				});

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
					if (that._checkRequestState(sPath, "PlantId", "PlantDesc")) {
						// 	if (that._checkPlant(sPath)) {
						oSource.setValueState("None");
						that._fnBatchSuccess();
					} else {
						oSource.setValueState("Error");
						that._fnBatchError();
					}
				});
			},

			handleMaterialTypeChange: function (oEvent) {
				/** Method Defaults: */
				var that = this;
				var oModel = this.getView().getModel();
				this.getModel("createView").setProperty("/busy", true);
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
				var sPath = oModel.createKey("/MaterialTypeSet", {
					MaterialTypeId: sValue
				});
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
				this.getModel("createView").setProperty("/busy", true);
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
				var sPath = oModel.createKey("/ProcurementTypeSet", {
					ProTypeId: sValue
				});
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
			}

		});
	});
})();
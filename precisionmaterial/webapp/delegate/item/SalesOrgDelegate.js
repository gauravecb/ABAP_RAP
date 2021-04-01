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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.SalesOrgDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.SalesOrgV2",

			handleSalesOrgChange: function (oEvent) {
				var sKey = "SalesOrgId";
				var sDescription = "SalesOrgDesc";
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
					SalesOrgId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/SalesOrgSet", oKey, sKey, sDescription);
			},

			handleDeliveryPlantChange: function (oEvent) {
				var sKey = "DeliveryPlantId";
				var sDescription = "DeliveryPlantDesc";
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
					DeliveryPlantId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/DeliveryPlantSet", oKey, sKey, sDescription);
			},

			handleChangeRoundingProfile: function (oEvent) {
				var sKey = "RoundProfileId";
				var sDescription = "RoundProfileDesc";
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
					RoundProfileId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/RoundingProfileSet", oKey, sKey, sDescription);
			},

			handleChangeItemCategory: function (oEvent) {
				var sKey = "ItemCategoryGroupsId";
				var sDescription = "ItemCategoryGroupsDesc";
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
					ItemCategoryGroupsId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/ItemCategoryGroupsSet", oKey, sKey, sDescription);
			},

			handleChangeMaterialGroup: function (oEvent) {
				var sKey = "MaterialGroupId";
				var sDescription = "MaterialGroupDesc";
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
					MaterialGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialGroup1Set", oKey, sKey, sDescription);
			},

			handleChangeMaterialGroup1: function (oEvent) {
				var sKey = "MaterialGroup1Id";
				var sDescription = "MaterialGroup1Desc";
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
					MaterialGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialGroup1Set", oKey, sKey, sDescription);
			},

			handleChangeMaterialGroup2: function (oEvent) {
				var sKey = "MaterialGroup2Id";
				var sDescription = "MaterialGroup2Desc";
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
					MaterialGroup2Id: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialGroup2Set", oKey, sKey, sDescription);
			},

			handleChangeMaterialGroup3: function (oEvent) {
				var sKey = "MaterialGroup3Id";
				var sDescription = "MaterialGroup3Desc";
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
					MaterialGroup3Id: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialGroup3Set", oKey, sKey, sDescription);
			},

// 			_validateValueHelps: function (oSource, sBindingPath, sValue, sEntityName, oKey, sKey, sDescription) {
// 				var that = this;
// 				var oModel = this.getFragment().getModel();
// 				var sPath = oModel.createKey(sEntityName, oKey);
// 				var oData = oModel.getProperty(sPath);

// 				if (oData) {
// 					var sUpdatePath = sBindingPath + "/" + sKey;
// 					oModel.setProperty(sUpdatePath, oData[sKey]);
// 					if (sDescription !== "") {
// 						var sUpdatePath = sBindingPath + "/" + sDescription;
// 						oModel.setProperty(sUpdatePath, oData[sDescription]);
// 					}
// 					return;
// 				}

// 				if (sValue === "") {
// 					// Check if the control has mandatory
// 					var sUpdatePath = sBindingPath + "/" + sKey;
// 					oModel.setProperty(sUpdatePath, "");
// 					if (sDescription !== "") {
// 						var sUpdatePath = sBindingPath + "/" + sDescription;
// 						oModel.setProperty(sUpdatePath, "");
// 					}
// 					var bMandatory = oEvent.getSource().getMandatory();
// 					if (bMandatory) {
// 						oSource.setValueState("Error");
// 						return;
// 					} else {
// 						oSource.setValueState("None");
// 					}
// 				}

// 				// attach to the request completed event of the batch
// 				oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
// 					console.log(sPath);
// 					if (that._checkRequestState(sPath, sKey, sDescription)) {
// 						// 	if (that._checkSpecification(sPath)) {
// 						oSource.setValueState("None");
// 						that._fnBatchSuccess();
// 					} else {
// 						oSource.setValueState("Error");
// 						that._fnBatchError();
// 					}
// 				});
// 			},

// 			_checkRequestState: function (sPath, sKey, sDescription) {
// 				// Defaults for a Method
// 				var that = this;
// 				var oModel = this.getView().getModel();
// 				this.getModel("addItemView").setProperty("/busy", true);
// 				var oBindingContext = this.getFragment().getBindingContext();
// 				var sBindingPath = oBindingContext.getPath();
// 				var oData = oModel.getProperty(sPath);
// 				if (oData) {
// 					var sUpdatePath = sBindingPath + "/" + sKey;
// 					oModel.setProperty(sUpdatePath, oData[sKey]);
// 					if (sDescription !== "") {
// 						var sUpdatePath = sBindingPath + "/" + sDescription;
// 						oModel.setProperty(sUpdatePath, oData[sDescription]);
// 					}
// 					return true;
// 				} else {
// 					return false;
// 				}
// 			},

// 			_fnBatchSuccess: function () {
// 				this.getModel("addItemView").setProperty("/busy", false);
// 			},

// 			_fnBatchError: function () {
// 				this.getModel("addItemView").setProperty("/busy", false);
// 			}

		});
	});
})();
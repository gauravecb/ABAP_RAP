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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.GeneralItemDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.General",

			handleProductHierarchyChange: function (oEvent) {
				var sKey = "ProHierachyId";
				var sDescription = "ProHierarchyDesc";
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
					RequestId: "1000000014",
					ProHierachyId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/ProductHierarchySet", oKey, sKey, sDescription);
			},

			handleSAPMaterialChange: function (oEvent) {
				var sKey = "MaterialNumberId";
				var sDescription = "MaterialNumberDesc";
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
					MaterialNumberId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialNumberSet", oKey, sKey, sDescription);
			},

			handleChangeUOM: function (oEvent) {
				var sKey = "UoMId";
				var sDescription = "UoMDescription";
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
					UoMId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/BaseUoMSet", oKey, sKey, sDescription);
			},

			handleChangeDivision: function (oEvent) {
				var sKey = "DivisionId";
				var sDescription = "DivisionDesc";
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
					DivisionId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/DivisionSet", oKey, sKey, sDescription);
			},

			handleChangeMaterialGroup: function (oEvent) {
				var sKey = "MatGrpUNSPSC";
				var sDescription = "";
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
					MatGrpUNSPSC: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialGroupSet", oKey, sKey, sDescription);
			},

			handleChangeProfitCenter: function (oEvent) {
				var sKey = "ProfitCenterId";
				var sDescription = "ProfitCenterDesc";
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
					ProfitCenterId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/ProfitCenterSet", oKey, sKey, sDescription);
			},

			handleChangeProjectRef: function (oEvent) {
				var sKey = "NPDValue";
				var sDescription = "NPDDescription";
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
					NPDValue: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/NPDProjectRefSet", oKey, sKey, sDescription);
			},

			handleChangeBrand: function (oEvent) {
				var sKey = "BrandKeyId";
				var sDescription = "BrandKeyDesc";
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
					BrandKeyId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/BrandKeySet", oKey, sKey, sDescription);
			},

			handleChangeSubBrand: function (oEvent) {
				var sKey = "SubBrandId";
				var sDescription = "SubBrandDesc";
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
					SubBrandId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/SubBrandkeySet", oKey, sKey, sDescription);
			},

			handleChangeDangerousGoods: function (oEvent) {
				var sKey = "DangerousGoodsId";
				var sDescription = "DangerousGoodsDesc";
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
					DangerousGoodsId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/DangerousGoodsSet", oKey, sKey, sDescription);
			},

			handleChangeUNCode: function (oEvent) {
				var sKey = "UNCodeId";
				var sDescription = "UNCodeDesc";
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
					UNCodeId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/UNCodeSet", oKey, sKey, sDescription);
			},

			handleChangePackagingGroup: function (oEvent) {
				var sKey = "PackingGroupId";
				var sDescription = "PackingGroupDesc";
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
					PackingGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/PackingGroupSet", oKey, sKey, sDescription);
			},

			handleChangeFlashPointTempId: function (oEvent) {
				var sKey = "FlashPointTempId";
				var sDescription = "FlashPointTempDesc";
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
					FlashPointTempId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/FlashPointTempSet", oKey, sKey, sDescription);
			},

			handleChangeMerchGroup: function (oEvent) {
				var sKey = "MerchCategoryId";
				var sDescription = "MerchCategoryDesc";
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
					MerchCategoryId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MerchCategorySet", oKey, sKey, sDescription);
			},

			handleChangeNestingGroup: function (oEvent) {
				var sKey = "NestingGroupId";
				var sDescription = "";
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
					NestingGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/NestingGroupSet", oKey, sKey, sDescription);
			},

			handleGoldenTax: function (oEvent) {
				var sKey = "GoldenTaxId";
				var sDescription = "GoldenTaxDesc";
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
					GoldenTaxId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/GoldenTaxSet", oKey, sKey, sDescription);
			},

			handleChangeControlCode: function (oEvent) {
				var sKey = "ControlCodeId";
				var sDescription = "ControlCodeDesc";
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
					ControlCodeId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/ControlCodeSet", oKey, sKey, sDescription);
			},

			handleChangeTaxes: function (oEvent) {
				var sKey = "TaxesMaterialsId";
				var sDescription = "TaxesMaterialsDesc";
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
					TaxesMaterialsId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/TaxesMaterialsSet", oKey, sKey, sDescription);
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
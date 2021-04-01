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

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.PDM",

			handleChangePackagingMaterial: function (oEvent) {
				var sKey = "PackagingMaterialsId";
				var sDescription = "PackagingMaterialsDesc";
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
					PackagingMaterialsId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/PackagingMaterialsSet", oKey, sKey, sDescription);
			},

			handleChangeSalesOrgStatus: function (oEvent) {
				var sKey = "SalesOrgStatusId";
				var sDescription = "SalesOrgStatusDesc";
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
					SalesOrgStatusId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/SalesOrgStatusSet", oKey, sKey, sDescription);
			},

			handleChangeMaterialStatistics: function (oEvent) {
				var sKey = "MaterialStatisticsGroupId";
				var sDescription = "MaterialStatisticsGroupDesc";
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
					MaterialStatisticsGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MaterialStatisticsGroupSet", oKey, sKey, sDescription);
			},

			handleChangeVolumneRebate: function (oEvent) {
				var sKey = "VolumeRebateGroupId";
				var sDescription = "VolumeRebateGroupDesc";
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
					VolumeRebateGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/VolumeRebateGroupSet", oKey, sKey, sDescription);
			},

			handleChangeAccountAssignment: function (oEvent) {
				var sKey = "AccountAssignmentGroupId";
				var sDescription = "AccountAssignmentGroupDesc";
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
					AccountAssignmentGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/AccountAssignmentGroupSet", oKey, sKey, sDescription);
			},

			handleChangeTransportationGroup: function (oEvent) {
				var sKey = "TransportationGroupId";
				var sDescription = "TransportationGroupDesc";
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
					TransportationGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/TransportationGroupSet", oKey, sKey, sDescription);
			},

			handleChangeMRPGroupId: function (oEvent) {
				var sKey = "MRPGroupId";
				var sDescription = "MRPGroupDesc";
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
					MRPGroupId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MRPGroupSet", oKey, sKey, sDescription);
			},

			handleChangeMRPType: function (oEvent) {
				var sKey = "MRPTypeId";
				var sDescription = "MRPTypeDesc";
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
					MRPTypeId: sValue
				};
				this._validateValueHelps(oSource, sBindingPath, sValue, "/MRPTypeSet", oKey, sKey, sDescription);
			}
		});
	});
})();
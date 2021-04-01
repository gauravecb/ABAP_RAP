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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.DataLossDelegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.Dataloss",

			openDataLossDialog: function (sMessage, fnCallBackFunction) {
				
				this.fnCallBackFunction = fnCallBackFunction;
				this.getFragment().open();
			},

			handleSaveAndContinue: function () {
				this.getFragment().close();
				this.fnCallBackFunction("SAVE");
			},

			handleDiscardAndContinue: function () {
				this.getFragment().close();
				this.fnCallBackFunction("DISCARD");
			},

			handleCancel: function () {
				this.getFragment().close();
				this.fnCallBackFunction("CANCEL");
			}

		});
	});
})();
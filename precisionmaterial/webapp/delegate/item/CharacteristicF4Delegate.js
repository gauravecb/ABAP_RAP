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

		return BaseDelegate.extend("ui.newell.PrecisionMaterial.delegate.item.CharacteristicF4Delegate", {

			_sFragmentName: "ui.newell.PrecisionMaterial.fragments.CharacteristicF4",

			openValueHelp: function (fnCallBackFunction) {
				this.fnCallBackFunction = fnCallBackFunction;
				this.getFragment().open();
			},

			_handleCharacteristicValueHelpSearch: function (oEvent) {
				var sValue = oEvent.getParameter("value");
				var oBinding = oEvent.getParameter("itemsBinding");
				var aFilters = oBinding.aFilters;
				var aOriginalFilters = aFilters;
				$.each(aFilters, function (index, oFilter) {
					if (oFilter.sPath === "CharacteristicsDesc") {
						aOriginalFilters.splice(index, 1);
					}
				});
				var oFilter = new sap.ui.model.Filter("CharacteristicsDesc", "EQ", sValue);
				aOriginalFilters.push(oFilter);
				oBinding.filter(aOriginalFilters);
			},

			_handleCharacteristicValueHelpClose: function (oEvent) {
				this.fnCallBackFunction(oEvent);
			}

		});
	});
})();
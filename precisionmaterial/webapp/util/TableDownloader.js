sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet"
], function (UI5Object, MessageBox, Spreadsheet) {
	"use strict";

	return UI5Object.extend("ui.newell.PrecisionMaterial.util.TableDownloader", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias ui.newell.PrecisionMaterial.controller.ErrorHandler
		 */
		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();
			this._oTable = {};

			var oMetadata = this._oModel.getServiceMetadata();
			var aEntitys = oMetadata.dataServices.schema[0].entityType;
			var oController = this;
			this._mEntityMap = {};
			$.each(aEntitys, function (index, oEntity) {
				if (!oController._mEntityMap[oEntity.name]) {
					oController._mEntityMap[oEntity.name] = oEntity.property;
				}
			});
		},

		createColumnConfig: function () {

			var aCols = [];
			var aColumns = this._oTable.getColumns();
			var oBinding = this._oTable.getBinding("items");
			var sPath = oBinding.getPath();
			var sEntityName = sPath.split("/").reverse()[0];
			sEntityName = sEntityName.slice(0, -3);
			var aEntityData = this._mEntityMap[sEntityName];
			var mEntityMap = {};
			$.each(aEntityData, function (index, oEntity) {
				if (!mEntityMap[oEntity.name]) {
					mEntityMap[oEntity.name] = oEntity;
				}
			});

			$.each(aColumns, function (index, oColumn) {
				var bVisible = oColumn.getVisible();
				if (!bVisible) {
					return true;
				}
				var oHeader = oColumn.getAggregation("header");
				var aCustomData = oHeader.getCustomData();
				$.each(aCustomData, function (index, oCustomData) {
					var sLabel = oHeader.getText();
					var sProperty = oCustomData.getKey();
					var oEntityInfo = mEntityMap[sProperty];
					var sType = "string";
					aCols.push({
						label: sLabel,
						property: sProperty,
						type: sType
					});
				});
			});

			return aCols;
		},

		exportFile: function (oTable, sFileName) {

			this._oTable = oTable;
			var sFileName = sFileName;
			var aCols, oRowBinding, oSettings, oSheet, oTable;
			oRowBinding = oTable.getBinding("items");
			aCols = this.createColumnConfig();
			var oModel = oRowBinding.getModel();
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: {
					type: 'odata',
					dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
					serviceUrl: oModel.sServiceUrl,
					headers: oModel.getHeaders ? oModel.getHeaders() : null,
					count: oRowBinding.getLength ? oRowBinding.getLength() : null,
					useBatch: true // Default for ODataModel V2
				},
				fileName: sFileName
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});
		}

	});
});
(function () {
	"use strict";
	sap.ui.define([
		"sap/ui/base/EventProvider",
		"ui/newell/PrecisionMaterial/delegate/item/GeneralItemDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/SalesOrgDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/DemandDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/AltLanguageDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/PlantDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/CharacteristicDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/PurchasingDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/LogisticsDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/SupplyChainDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/PPPDelegate",
		"ui/newell/PrecisionMaterial/delegate/item/PDMDelegate"
	], function (EventProvider, GeneralItemDelegate, SalesOrgDelegate, DemandDelegate, AltLanguageDelegate,
		PlantDelegate, CharacteristicDelegate, PurchasingDelegate, LogisticsDelegate, SupplyChainDelegate, PPPDelegate, PDMDelegate) {

		/**
		 * Constructor for a new BaseDelegate.
		 * 
		 * @param {object} mParameters a map with parameters
		 * @param {string} [mParameters.fragmentName] the name of the fragment. If not provided, the prototype of the subclass has to have a
		 *        <code>_sFragmentName</code> property.
		 * @class Base class for fragment delegates. Delegates serve as controllers for fragments. They provide common lifecycle hooks such as onInit,
		 *        onBeforeRendering, onAfterRendering and onExit. Inheriting from the EventProvider, they can also fire events that the owning
		 *        controller can listen to
		 * @name ui.newell.PrecisionMaterial.util.BaseDelegate
		 * @extends sap.ui.base.EventProvider
		 */
		return EventProvider.extend("ui.newell.PrecisionMaterial.util.DelegateHelper", {

			_oView: null,

			constructor: function (mParameters) {
				EventProvider.prototype.constructor.apply(this, arguments);
				if (mParameters.view) {
					this._oView = mParameters.view;
				}
			},

			/**
			 * Destroys the objects and releases all object references
			 */
			destroy: function () {
				// Invoke lifefycle hook
				this.onExit();
				EventProvider.prototype.destroy.apply(this, arguments);
			},

			getView: function () {
				return this._oView;
			},

			getGeneralItemDelegate: function () {
				if (!this._oGeneralItemDelegate) {
					this._oGeneralItemDelegate = new GeneralItemDelegate({
						view: this.getView()
					});
					var oFragment = this._oGeneralItemDelegate.getFragment();
					var oSection = this.getView().byId("idGeneralSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oGeneralItemDelegate;
			},

			getSalesOrgDelegate: function () {
				if (!this._oSalesOrgDelegate) {
					this._oSalesOrgDelegate = new SalesOrgDelegate({
						view: this.getView()
					});
					var oFragment = this._oSalesOrgDelegate.getFragment();
					var oSection = this.getView().byId("idSalesOrgSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oSalesOrgDelegate;
			},

			getDemandDelegate: function () {
				if (!this._oDemandDelegate) {
					this._oDemandDelegate = new DemandDelegate({
						view: this.getView()
					});
					var oFragment = this._oDemandDelegate.getFragment();
					var oSection = this.getView().byId("idDemandSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oDemandDelegate;
			},

			getSupplyChainDelegate: function () {
				if (!this._oSupplyChainDelegate) {
					this._oSupplyChainDelegate = new SupplyChainDelegate({
						view: this.getView()
					});
					var oFragment = this._oSupplyChainDelegate.getFragment();
					var oSection = this.getView().byId("idSupplyChainSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oSupplyChainDelegate;
			},

			getPurchasingDelegate: function () {
				if (!this._oPurchasingDelegate) {
					this._oPurchasingDelegate = new PurchasingDelegate({
						view: this.getView()
					});
					var oFragment = this._oPurchasingDelegate.getFragment();
					var oSection = this.getView().byId("idPurchasingSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oPurchasingDelegate;
			},

			getPPPDelegate: function () {
				if (!this._oPPPDelegate) {
					this._oPPPDelegate = new PPPDelegate({
						view: this.getView()
					});
					var oFragment = this._oPPPDelegate.getFragment();
					var oSection = this.getView().byId("idPPPSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oPPPDelegate;
			},

			getPDMDelegate: function () {
				if (!this._oPDMDelegate) {
					this._oPDMDelegate = new PDMDelegate({
						view: this.getView()
					});
					var oFragment = this._oPDMDelegate.getFragment();
					var oSection = this.getView().byId("idPDMSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oPDMDelegate;
			},

			getPlantDelegate: function () {
				if (!this._oPlantDelegate) {
					this._oPlantDelegate = new PlantDelegate({
						view: this.getView()
					});
					var oFragment = this._oPlantDelegate.getFragment();
					var oSection = this.getView().byId("idPlantSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oPlantDelegate;
			},

			getAltLangDelegate: function () {
				if (!this._oAltLangDelegate) {
					this._oAltLangDelegate = new AltLanguageDelegate({
						view: this.getView()
					});
					var oFragment = this._oAltLangDelegate.getFragment();
					var oSection = this.getView().byId("idAltLanguageSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oAltLangDelegate;
			},

			getCharacteristicDelegate: function () {
				if (!this._oCharacteristicDelegate) {
					this._oCharacteristicDelegate = new CharacteristicDelegate({
						view: this.getView()
					});
					var oFragment = this._oCharacteristicDelegate.getFragment();
					var oSection = this.getView().byId("idCharacteristicsSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oCharacteristicDelegate;
			},

			getLogisticsDelegate: function () {
				if (!this._oLogisticsDelegate) {
					this._oLogisticsDelegate = new LogisticsDelegate({
						view: this.getView()
					});
					var oFragment = this._oLogisticsDelegate.getFragment();
					var oSection = this.getView().byId("idLogisticalSection");
					this.getView().addDependent(oFragment);
					oSection.addContent(oFragment);
				}
				return this._oLogisticsDelegate;
			}

		});
	});
}());
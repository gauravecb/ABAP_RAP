(function () {
	"use strict";
	sap.ui.define([
		"sap/ui/base/EventProvider"
	], function (EventProvider) {

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
		return EventProvider.extend("ui.newell.PrecisionMaterial.util.BaseDelegate", {

			_oFragment: null,
			_sFragmentId: null,
			_sFragmentName: null,
			_oView: null,

			constructor: function (mParameters) {
				EventProvider.prototype.constructor.apply(this, arguments);

				if ((!mParameters || !mParameters.fragmentName) && !this._sFragmentName) {
					throw new Error("Fragment name has to be provided");
				} else if (!this._sFragmentName) {
					this._sFragmentName = mParameters.fragmentName;
				}
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

				// Destroy objects
				if (this._oFragment) {
					// Detach other lifecycle hooks
					this._oFragment.removeEventDelegate(this, this);
					this._oFragment.destroy();
				}

				// Reset properties
				this._oFragment = null;

				EventProvider.prototype.destroy.apply(this, arguments);
			},

			/**
			 * Hook method invoked once when the fragment is created
			 */
			onInit: function () {},

			/**
			 * Hook method invoked before the fragment is rendered
			 */
			onBeforeRendering: function () {},

			/**
			 * Hook method invoked after the fragment is rendered
			 */
			onAfterRendering: function () {},

			/**
			 * Hook method invoked once when the delegate is destroyed
			 */
			onExit: function () {},

			/**
			 * Creates the fragment from the fragment name provided to the delegate and assigns a generated id
			 * 
			 * @private
			 * @returns {sap.ui.core.Element|sap.ui.core.Element[]} the root element of the fragment or an array of elements
			 */
			_createFragment: function () {
				$.sap.assert(this._sFragmentName, "Trying to instantiate fragment but fragmentName is not provided.");
				this._sFragmentId = $.sap.uid();
				this._oFragment = sap.ui.xmlfragment(this._sFragmentId, this._sFragmentName, this);

				// Invoke lifecycle hook
				this.onInit();

				// Register other looks like onBeforeRendering, etc.
				this._oFragment.addEventDelegate(this, this);

				return this._oFragment;
			},

			/**
			 * Internal utility function for accessing an element inside the fragment by its ID
			 * 
			 * @param {string} sId the id of the element inside the fragment
			 * @returns {sap.ui.core.Element} the element matching the id
			 */
			byId: function (sId) {
				return sap.ui.core.Fragment.byId(this._sFragmentId, sId);
			},

			/**
			 * Internal utility function for creating an ID for an element inside the fragment
			 * 
			 * @param {string} sId the id of the element inside the fragment
			 * @returns {string} the id
			 */
			createId: function (sId) {
				return sap.ui.core.Fragment.createId(this._sFragmentId, sId);
			},

			/**
			 * Returns the fragment
			 * 
			 * @returns {sap.ui.core.Element} the root element of the fragment
			 */
			getFragment: function () {
				if (!this._oFragment) {
					this._createFragment();
				}
				return this._oFragment;
			},

			/**
			 * Checks whether the fragment has already been created
			 * 
			 * @returns {boolean} true of fragment has been created, false otherwise
			 */
			isFragmentCreated: function () {
				return !!this._oFragment;
			},

			getModel: function (sName) {
				if (sName) {
					return this._oFragment.getModel(sName);
				} else {
					return this._oFragment.getModel()
				}
			},

			getView: function () {
				return this._oView;
			},

			_validateValueHelps: function (oSource, sBindingPath, sValue, sEntityName, oKey, sKey, sDescription) {
				var that = this;
				var oModel = this.getFragment().getModel();
				var sPath = oModel.createKey(sEntityName, oKey);
				var oData = oModel.getProperty(sPath);

				if (oData) {
					var sUpdatePath = sBindingPath + "/" + sKey;
					oModel.setProperty(sUpdatePath, oData[sKey]);
					if (sDescription !== "") {
						var sUpdatePath = sBindingPath + "/" + sDescription;
						oModel.setProperty(sUpdatePath, oData[sDescription]);
					}
					return;
				}

				if (sValue === "") {
					// Check if the control has mandatory
					var sUpdatePath = sBindingPath + "/" + sKey;
					oModel.setProperty(sUpdatePath, "");
					if (sDescription !== "") {
						var sUpdatePath = sBindingPath + "/" + sDescription;
						oModel.setProperty(sUpdatePath, "");
					}
					var bMandatory = oEvent.getSource().getMandatory();
					if (bMandatory) {
						oSource.setValueState("Error");
						return;
					} else {
						oSource.setValueState("None");
					}
				}

				// attach to the request completed event of the batch
				oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
					console.log(sPath);
					if (that._checkRequestState(sPath, sKey, sDescription)) {
						// 	if (that._checkSpecification(sPath)) {
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
				this.getModel("addItemView").setProperty("/busy", true);
				var oBindingContext = this.getFragment().getBindingContext();
				var sBindingPath = oBindingContext.getPath();
				var oData = oModel.getProperty(sPath);
				if (oData) {
					var sUpdatePath = sBindingPath + "/" + sKey;
					oModel.setProperty(sUpdatePath, oData[sKey]);
					if (sDescription !== "") {
						var sUpdatePath = sBindingPath + "/" + sDescription;
						oModel.setProperty(sUpdatePath, oData[sDescription]);
					}
					return true;
				} else {
					return false;
				}
			},

			_fnBatchSuccess: function () {
				this.getModel("addItemView").setProperty("/busy", false);
			},

			_fnBatchError: function () {
				this.getModel("addItemView").setProperty("/busy", false);
			}

		});
	});
}());
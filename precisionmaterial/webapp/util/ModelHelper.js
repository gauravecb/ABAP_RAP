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
		return EventProvider.extend("ui.newell.PrecisionMaterial.util.ModelHelper", {

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

			getProductEntityPath: function (sEntityName, sRequestId, sProduct) {
				var oModel = this.getView().getModel();
				var sPath = oModel.createKey(sEntityName, {
					RequestId: sRequestId,
					ProductId: sProduct
				});
				return sPath;
			}

		});
	});
}());
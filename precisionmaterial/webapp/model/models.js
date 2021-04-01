sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (
  JSONModel,
  Device
) {
  "use strict";

  return {
    createDeviceModel: function () {
      var oModel = new JSONModel(Device);
      oModel.setDefaultBindingMode("OneWay");
      return oModel;
    },

    setQueryData: function (oQueryData) {
      var oModel = new JSONModel(oQueryData);
      oModel.setDefaultBindingMode("OneWay");
      return oModel;
    },
  };
});

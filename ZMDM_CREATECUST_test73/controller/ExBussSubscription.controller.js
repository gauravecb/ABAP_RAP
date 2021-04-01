sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"MDMZCUSTOMER/model/Formatter"
], function(Controller, MessageBox, Formatter) {
	"use strict";
	return Controller.extend("MDMZCUSTOMER.controller.ExBussSubscription", {
		onInit: function() {
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.attachRoutePatternMatched(this._handleRouteMatched, this);
		},
		_handleRouteMatched: function(oEvent) {
			if (oEvent.getParameter("name") === "ExBussSubscription") {
				var modelSearch = sap.ui.getCore().getModel("searchTableModelSet");
				if (modelSearch === undefined) {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("searchCustomer", true);
					return;
				}
				if (oEvent.getParameters().arguments !== undefined && oEvent.getParameters().arguments.contextPath === "Next") {
					var openEditModel = new sap.ui.model.json.JSONModel({
						EditOrOpen: modelSearch.getData().EditOrOpen
					});
					this.getView().setModel(openEditModel, "OpenEditModelSet");

					this.onPressOpenButton();
				}
			}
		},
		onPressMoreDetails: function(oEvent) {
			var that = this;
			//dialog
			if (!that._oValueHelpDialogpNewDetailsFrag) {
				that._oValueHelpDialogpNewDetailsFrag = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.SubscriptionCompList", that);
				that.getView().addDependent(that._oValueHelpDialogpNewDetailsFrag);
			}
			var selctObj = oEvent.getSource().getBindingContext("ExtBusPartnerModelSet").getObject();
			var oA = {
				LocalID: selctObj.LocalID !== undefined ? selctObj.LocalID : "",
				System: selctObj.System !== undefined ? selctObj.System : "",
				"ArrayExtIdent": selctObj.ArrayExtIdent
			};
			var oLSModel = new sap.ui.model.json.JSONModel(oA);
			this.getView().setModel(oLSModel, "searchExtSubTableModelSet");
			sap.ui.getCore().setModel(oLSModel, "searchExtSubTableModelSet");
			that.onExtBusSubTable();
		},
		onPressChangeCustomer: function() {
			var model = this.getView().getModel("ExtSubTableModelSet").getData();
			if (model.System.toString().trim() !== "") {
				sap.ui.getCore().getModel("searchExtSubTableModelSet").getData().ArrayExtIdent = this.perticulrRowSelectedDataSAPMDM;
				sap.ui.getCore().getModel("searchExtSubTableModelSet").refresh();
				this._oValueHelpDialogpNewDetailsFrag.close();
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("changeCustomer", true);
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("selectCompCodeandSelesAreaCombinationExBus"));
			}
		},
		onPressExtenstion: function() {
			var model = this.getView().getModel("ExtSubTableModelSet").getData();
			if (model.System.toString().trim() !== "") {
				sap.ui.getCore().getModel("searchExtSubTableModelSet").getData().ArrayExtIdent = this.perticulrRowSelectedDataSAPMDM;
				sap.ui.getCore().getModel("searchExtSubTableModelSet").refresh();
				this._oValueHelpDialogpNewDetailsFrag.close();
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Extension", true);
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("selectCompCodeandSelesAreaCombinationExBus"));
			}
		},
		onPressClose: function() {
			this._oValueHelpDialogpNewDetailsFrag.close();
		},

		onPressBackFromSubcriptionExBus: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("searchCustomer", true);
		},
		onCloseSubRequest: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("searchCustomer", true);
		},
		onPressNewSubScription: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("NewSubscription", true);
		},
		onPressOpenDialogButton: function() {
			var model = this.getView().getModel("ExtSubTableModelSet").getData();
			if (model.System.toString().trim() !== "") {
				this._oValueHelpDialogpNewDetailsFrag.close();
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Display", true);
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("selectCompCodeandSelesAreaCombinationExBus"));
			}
		},
		onPressOpenButton: function(oEvent) {
			var that = this;
			var oSelValue1 = sap.ui.getCore().getModel("searchTableModelSet").getData();
			//	var oGoldenRecId = oSelValue1.results;
			var goldernRowId = oSelValue1.GoldenRowIdObj;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/PostSmartSearch/ExistingBusinessPartner_MDM/" + goldernRowId);
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var oOpenArray = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							//	var oSearch = JSON.parse(oData.results[0].Response);
							var oSearch = {
								"BUSINESSPARTNER.SmartSearch.Pager": {
									item: {
										BUSINESSPARTNER: JSON.parse(oData.results[0].Response)["BUSINESSPARTNER.Root"]
									}
								}
							};
							if (oSearch["BUSINESSPARTNER.SmartSearch.Pager"].item === undefined) {
								oSearch["BUSINESSPARTNER.SmartSearch.Pager"].item = [];
							}
							var oResults = oSearch["BUSINESSPARTNER.SmartSearch.Pager"].item;
							if (oResults.length === undefined) {
								oResults = Array(oResults);
							}
							oOpenArray = oResults;
						}
						var oResArray = [];
						var oResCustomerArry = [];
						if (oOpenArray[0] === undefined) {
							oOpenArray[0] = [];
						}
						if (oOpenArray[0].BUSINESSPARTNER === undefined) {
							oOpenArray[0].BUSINESSPARTNER = [];
						}
						if (oOpenArray[0].BUSINESSPARTNER.CUSINTIDENTIFIER === undefined) {
							oOpenArray[0].BUSINESSPARTNER.CUSINTIDENTIFIER = [];
						}
						if (oOpenArray[0].BUSINESSPARTNER.CUSTOMER === undefined) {
							oOpenArray[0].BUSINESSPARTNER.CUSTOMER = [];
						}
						var ExtIdentArray = [];
						if (oOpenArray[0].BUSINESSPARTNER.EXTERNALIDENTIFIER === undefined) {
							oOpenArray[0].BUSINESSPARTNER.EXTERNALIDENTIFIER = [];
						}
						if (oOpenArray[0].BUSINESSPARTNER.CUSTOMER.item !== undefined) {
							var oResCustomer = oOpenArray[0].BUSINESSPARTNER.CUSTOMER.item;
						}

						if (oOpenArray[0].BUSINESSPARTNER.CUSINTIDENTIFIER.item !== undefined) {
							var oRes = oOpenArray[0].BUSINESSPARTNER.CUSINTIDENTIFIER.item;
							var itemData;
							if (oRes.length === undefined) {
								oRes = Array(oRes);
							}
							for (var i = 0; i < oRes.length; i++) {
								itemData = {
									"Role": oRes[i].applnRoleRowid !== undefined ? oRes[i].applnRoleRowid.roleDescription : "",
									"DeletionFlag": oRes[i].delInd !== undefined ? oRes[i].delInd : "N",
									"System": oRes[i].itoLogicalCompRowid !== undefined ? oRes[i].itoLogicalCompRowid.logicalCompId : "",
									"LocalID": oRes[i].altIdentifier !== undefined ? oRes[i].altIdentifier : "",
									"ArrayExtIdent": oRes[i]
								};

								oResArray.push(itemData);
							}
						}

						if (oOpenArray[0].BUSINESSPARTNER.EXTERNALIDENTIFIER.item !== undefined) {
							var oExtIdentResluts = oOpenArray[0].BUSINESSPARTNER.EXTERNALIDENTIFIER.item;
						}
						oResCustomerArry = oResCustomer;
						ExtIdentArray = oExtIdentResluts;
						var oSModel = new sap.ui.model.json.JSONModel({
							"results": oOpenArray[0],
							"ExtSubItems": oResArray,
							"ExtSubDomain": oResCustomerArry,
							"ExtIdent": ExtIdentArray
						});
						//	oSModel.setSizeLimit(oOpenArray.length);
						that.getView().setModel(oSModel, "ExtBusPartnerModelSet");
						sap.ui.getCore().setModel(oSModel, "ExtBusPartnerModelSet");
						sap.ui.getCore().getModel("searchTableModelSet").refresh();
						that.addNewAddressRow();
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},
		//add new address
		addNewAddressRow: function() {
			var NameAndAddress = [];
			var oReslutsData = this.getView().getModel("ExtBusPartnerModelSet").getData();
			var oResults = oReslutsData["results"].BUSINESSPARTNER.CONTACTMECHANISAM.item;
			var oAccType = oReslutsData["results"].BUSINESSPARTNER.CUSTOMER.item;
			if (oResults.length === undefined) {
				oResults = Array(oResults);
			}
			for (var i = 0; i < oResults.length; i++) {
				var itemdata = {
					"CONTACTrowid": oResults[i].rowidObject !== undefined ? oResults[i].rowidObject : "",
					"Country": oResults[i].cntryRowid !== undefined ? oResults[i].cntryRowid.englishShortName : "",
					"CountryCode": oResults[i].cntryRowid !== undefined ? oResults[i].cntryRowid.code : "",
					"MatchRuleGroup": oResults[i].cntryRowid !== undefined ? oResults[i].cntryRowid.matchRuleGroup : "",
					"SipPop": oResults[i].cntryRowid !== undefined ? oResults[i].cntryRowid.sipPop : "",
					"Address_Version": oResults[i].addressVersion !== undefined ? oResults[i].addressVersion.addressVersionDesc : "",
					"Address_VersionCode": oResults[i].addressVersion !== undefined ? oResults[i].addressVersion.addressVersionCode : "",
					"PreferredAddressVersion": oResults[i].preferredAddressVersion !== undefined && oResults[i].preferredAddressVersion === "Y" ?
						true : false,
					"Name_1": oResults[i].namePart1 !== undefined ? oResults[i].namePart1 : "",
					"Name_2": oResults[i].namePart2 !== undefined ? oResults[i].namePart2 : "",
					"Name_3": oResults[i].namePart3 !== undefined ? oResults[i].namePart3 : "",
					"Name_4": oResults[i].namePart4 !== undefined ? oResults[i].namePart4 : "",
					"Street_1": oResults[i].streetPart1 !== undefined ? oResults[i].streetPart1 : "",
					"Street_2": oResults[i].streetPart2 !== undefined ? oResults[i].streetPart2 : "",
					"Street_3": oResults[i].streetPart3 !== undefined ? oResults[i].streetPart3 : "",
					"Street_4": oResults[i].streetPart4 !== undefined ? oResults[i].streetPart4 : "",
					"Street_5": oResults[i].streetPart5 !== undefined ? oResults[i].streetPart5 : "",
					"House_No": oResults[i].houseNumber !== undefined ? oResults[i].houseNumber : "",
					"House_No_Supplement": oResults[i].houseNumberAddition !== undefined ? oResults[i].houseNumberAddition : "",
					"Building": oResults[i].buildingCode !== undefined ? oResults[i].buildingCode : "",
					"Floor": oResults[i].floor !== undefined ? oResults[i].floor : "",
					"Room": oResults[i].room !== undefined ? oResults[i].room : "",
					"Postal_Code": oResults[i].postalCode !== undefined ? oResults[i].postalCode : "",
					"District": oResults[i].district !== undefined ? oResults[i].district : "",
					"City": oResults[i].city !== undefined ? oResults[i].city : "",
					"Region": oResults[i].cntrySubdivRowid !== undefined ? oResults[i].cntrySubdivRowid.cntrySubdivCode : "",
					"RegionDesc": oResults[i].cntrySubdivRowid !== undefined ? oResults[i].cntrySubdivRowid.cntrySubdivName : "",
					"Free_Trade_Region": oResults[i].freeTradeRegionRowid !== undefined ? oResults[i].freeTradeRegionRowid.freeTradeRegion : "",
					"PO_Box": oResults[i].boxNumber !== undefined ? oResults[i].boxNumber : "",
					"PO_Box_Code": oResults[i].poBoxPostalCode !== undefined ? oResults[i].poBoxPostalCode : "",
					"PO_Box_City": oResults[i].poBoxCity !== undefined ? oResults[i].poBoxCity : "",
					"AccountType": oAccType !== undefined ? oAccType.cusTypeRowid.cusType : "",
					"CompanyPostalCode": oResults[i].companyPostalCode !== undefined ? oResults[i].companyPostalCode : "",
					"ByPassAddressValidation": oResults[i].bypassAdValidation !== undefined && oResults[i].bypassAdValidation === "Y" ? true : false,
					"StreetValidation": oResults[i].streetValidatedAd5 !== undefined ? oResults[i].streetValidatedAd5 : "",
					"PoBoxValidation": oResults[i].poBoxValidatedAd5 !== undefined ? oResults[i].poBoxValidatedAd5 : ""

				};
				NameAndAddress.push(itemdata);
			}
			for (var i = 0; i < NameAndAddress.length; i++) {
				NameAndAddress[i].AddCountNo = (i + 1) + " of " + (NameAndAddress.length);
				if (i === 0) {
					NameAndAddress[i].VisibleBasedOnNext = true;
				} else {
					NameAndAddress[i].VisibleBasedOnNext = false;
				}
			}
			var oODataJSONModelSystem = new sap.ui.model.json.JSONModel({
				"NameAndAddress": NameAndAddress
			});
			this.getView().setModel(oODataJSONModelSystem, "searchNameAndAdressModelSet");
			sap.ui.getCore().setModel(oODataJSONModelSystem, "searchNameAndAdressModelSet");
		},
		//previous
		priviosNameAndAddress: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("searchNameAndAdressModelSet").getData().NameAndAddress;
			if (parseInt(selectedRow) > 0) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) - 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("previosNameAndAddressDetailsNotavailable"));
			}
			this.getView().getModel("searchNameAndAdressModelSet").refresh();
			oBusyDialog.close();
		},
		//next
		nextNameAndAddress: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("searchNameAndAdressModelSet").getData().NameAndAddress;
			if (dataModel.length > parseInt(selectedRow) + 1) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) + 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("nextNameAndAddressDetailsNotavailable"));
			}
			this.getView().getModel("searchNameAndAdressModelSet").refresh();
			oBusyDialog.close();
		},
		//	General Error Message Box
		errMsg: function(errorMsg) {
			sap.m.MessageBox.show(
				errorMsg, {
					styleClass: 'sapUiSizeCompact',
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function(oAction) {}
				}
			);
		},
		onPressSubCompListTable: function(oEvent) {
			var oSelData = oEvent.getSource().getSelectedItem().getBindingContext("subHyperLinkModelSet").getObject();
			var itemData = {
				Customernumber: oSelData.Customernumber,
				Companycode: oSelData.Companycode,
				Distrchannel: oSelData.Distrchannel,
				Division: oSelData.Division,
				Salesorg: oSelData.Salesorg,
				System: oSelData.System
			};
			var oLSModel = new sap.ui.model.json.JSONModel(itemData);
			this.getView().setModel(oLSModel, "ExtSubTableModelSet");
			sap.ui.getCore().setModel(oLSModel, "ExtSubTableModelSet");

			this.perticulrRowSelectedDataSAPMDM = {};
			//for selected
			var selctObj = sap.ui.getCore().getModel("searchExtSubTableModelSet").getData();
			var dataOutPut = JSON.parse(JSON.stringify(selctObj.ArrayExtIdent));

			//for CompanyCode
			if (selctObj.ArrayExtIdent !== undefined && selctObj.ArrayExtIdent.CUSCOMPANYCODE !== undefined && selctObj.ArrayExtIdent.CUSCOMPANYCODE
				.item !== undefined) {
				var compsingle = selctObj.ArrayExtIdent.CUSCOMPANYCODE.item;
				if (compsingle.length === undefined) {
					compsingle = Array(compsingle);
				}
				var matchCount = 0;
				var indexComp = 0;
				for (var i = 0; i < compsingle.length; i++) {
					if (compsingle[i].companyCodeRowid !== undefined && compsingle[i].companyCodeRowid.companyCode !== undefined && oSelData.Companycode
						.toString().trim() === compsingle[i].companyCodeRowid.companyCode.toString().trim()) {
						matchCount++;
						indexComp = i;
					}
				}
				if (matchCount > 0) {
					dataOutPut.CUSCOMPANYCODE.item = compsingle[indexComp];
				} else {
					delete dataOutPut.CUSCOMPANYCODE;
				}
			}

			//for Sales Org
			if (selctObj.ArrayExtIdent !== undefined && selctObj.ArrayExtIdent.CUSSALESAREA !== undefined && selctObj.ArrayExtIdent.CUSSALESAREA
				.item !== undefined) {
				var compsingleSales = selctObj.ArrayExtIdent.CUSSALESAREA.item;
				if (compsingleSales.length === undefined) {
					compsingleSales = Array(compsingleSales);
				}
				var matchCountSls = 0;
				var indexCompSls = 0;
				for (var i = 0; i < compsingleSales.length; i++) {
					if (compsingleSales[i].salesOrganizationRowid !== undefined && compsingleSales[i].salesOrganizationRowid.salesOrgaization !==
						undefined && compsingleSales[i].divisionRowid !== undefined && compsingleSales[i].divisionRowid.division !== undefined &&
						compsingleSales[i].distributionChannelRowid !== undefined && compsingleSales[i].distributionChannelRowid.distributionChannel !==
						undefined) {

						if (oSelData.Salesorg.toString().trim() === compsingleSales[i].salesOrganizationRowid.salesOrgaization.toString().trim() &&
							oSelData.Division.toString().trim() === compsingleSales[i].divisionRowid.division.toString().trim() && oSelData.Distrchannel.toString()
							.trim() === compsingleSales[i].distributionChannelRowid.distributionChannel.toString().trim()) {
							matchCountSls++;
							indexCompSls = i;
						}
					}
				}
				if (matchCountSls > 0) {
					dataOutPut.CUSSALESAREA.item = compsingleSales[indexCompSls];
				} else {
					delete dataOutPut.CUSSALESAREA;
				}
			}
			this.perticulrRowSelectedDataSAPMDM = dataOutPut;

		},
		onExtBusSubTable: function() {
			var that = this;
			var oExtSubModel1 = this.getView().getModel("searchExtSubTableModelSet");
			var oExtSubModel = oExtSubModel1.getData();
			var LocalID = oExtSubModel.LocalID;
			var System = oExtSubModel.System;
			//	var System = oExtSubModel.results[0].System.split("_")[0];
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			//	https://jibpd.hsec.emeadc001.philips.com:50101/RESTAdapter/SAP_SearchCustomer/ZSD_MDM_SEARCH_CUSTOMER_API_SRV/SearchcustomerSet?System_Name=MP1&filter=Customernumber eq '320591' and System  eq 'MP1'
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/SAP_SearchCustomer/ZSD_MDM_SEARCH_CUSTOMER_API_SRV/SearchcustomerSet?System_Name=" + System +
				"&filter=Customernumber eq '" + LocalID + "' and System  eq '" + System + "'");
			/*var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/SAP_SearchCustomer/ZSD_MDM_SEARCH_CUSTOMER_API_SRV/SearchcustomerSet?System_Name=MP1&filter=Customernumber eq '320591' and System  eq 'MP1'"
			);*/
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var oExtDialogArray = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else if (JSON.parse(oData.results[0].Response).d === undefined && JSON.parse(oData.results[0].Response).MESSAGE !==
							undefined) {
							var oSearch12 = JSON.parse(oData.results[0].Response);
							that.errMsg(oSearch12.MESSAGE);
						} else {
							var oSearch = JSON.parse(oData.results[0].Response);
							if (oSearch.d.results === undefined) {
								oSearch.d.results = [];
							}
							var oResults = oSearch.d.results;
							if (oResults.length === undefined) {
								oResults = Array(oResults);
							}
							oExtDialogArray = oResults;
							that._oValueHelpDialogpNewDetailsFrag.open();
						}
						var oSModel = new sap.ui.model.json.JSONModel({
							"results": oExtDialogArray
						});
						oSModel.setSizeLimit(oExtDialogArray.length);
						that.getView().setModel(oSModel, "subHyperLinkModelSet");
						//sap.ui.getCore().setModel("subHyperLinkModelSet");

						//make empty
						var itemData = {
							Customernumber: "",
							Companycode: "",
							Distrchannel: "",
							Division: "",
							Salesorg: "",
							System: ""
						};
						var oLSModel = new sap.ui.model.json.JSONModel(itemData);
						that.getView().setModel(oLSModel, "ExtSubTableModelSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		}

	});

});
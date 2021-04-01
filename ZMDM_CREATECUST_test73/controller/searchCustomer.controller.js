sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller) {
	"use strict";
	return Controller.extend("MDMZCUSTOMER.controller.searchCustomer", {
		//on initialization
		onInit: function() {
			//resubmit scenario
			// 	if(this.getOwnerComponent().getComponentData().startupParameters.TASK !== undefined){
			// this.onCreateButtonPress();
			// return;
			// }
			// if (this.getOwnerComponent().getComponentData().startupParameters.TaskDefinitionName !== undefined) {
			// 	this.sessionExpireOneTime = true;
			// 	this.setSessionExpire();
			// 	switch (this.getOwnerComponent().getComponentData().startupParameters.TaskDefinitionName[0]) {
			// 		case "Customer Market Approver Change":
			// 			this.fetchChangeCustomerDetails();
			// 			break;
			// 		case "Customer Credit and Collection Approver Change":
			// 			this.fetchChangeCustomerDetails();
			// 			break;
			// 		case "Customer Tax Approver Change":
			// 			this.fetchChangeCustomerDetails();
			// 			break;
			// 		case "Global Data Specialist":
			// 			this.fetchChangeCustomerDetails();
			// 			break;
			// 		case "Requester Change":
			// 			this.fetchChangeCustomerDetails();
			// 			break;
			// 		case "Customer Executor Change":
			// 			this.fetchChangeCustomerDetails();
			// 			break;
			// 		case "Customer Market Approver Create":
			// 			this.fetchCreateCustomerDetails();
			// 			break;
			// 		case "Customer Credit and Collection Approver Create":
			// 			this.fetchCreateCustomerDetails();
			// 			break;
			// 		case "Customer Tax Approver Create":
			// 			this.fetchCreateCustomerDetails();
			// 			break;
			// 		case "Requester Create":
			// 			this.fetchCreateCustomerDetails();
			// 			break;
			// 		case "Customer Executor Create":
			// 			this.fetchCreateCustomerDetails();
			// 			break;
			// 	}
			// 	return;
			// }
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			this.onSearchandAdvancedSerachModel();
			this.i18nModel = this.getView().getModel("i18n");
			this.sessionExpireOneTime = true;
			this.IntiateOrSerchCustomerInd = "";
			var oSelValue = this.getView().getModel("searchAndAdvancedSearchModelSet").getData().Search;
			// if (this.getMyComponent().getComponentData().startupParameters.SearchCustomer !== undefined) {
			// 	//var oStartupParameters = this.getMyComponent().getComponentData().startupParameters.SearchCustomer[0];
			// 	this.getView().byId("ID_PAGE_SEARCH").setTitle("Search Business Partner");
			// 	oSelValue.openButtonEnable = false;
			// 	oSelValue.changeButtonEnable = false;
			// 	oSelValue.CreateButtonEnable = false;
			// 	oSelValue.OpenBtnVisible = true;
			// 	oSelValue.ChangeBtnVisible = false;
			// 	oSelValue.CreateBtnVisible = false;
			// 	this.IntiateOrSerchCustomerInd = "SEARCH";
			// } else {
				this.getView().byId("ID_PAGE_SEARCH").setTitle("Create Business Partner");
				oSelValue.openButtonEnable = false;
				oSelValue.changeButtonEnable = false;
				oSelValue.CreateButtonEnable = false;
				oSelValue.OpenBtnVisible = false;
				oSelValue.ChangeBtnVisible = true;
				oSelValue.CreateBtnVisible = true;
				this.IntiateOrSerchCustomerInd = "INITIAT";
			// }
			this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
		},
		getMyComponent: function() {
			"use strict";
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
		},
		sessionExpiredCall: function() {
			var that = this;
			var opened = "N";
			// var IDLE_TIMEOUT = 1680; //seconds
			var IDLE_TIMEOUT = 3480; //seconds
			var _idleSecondsTimer = null;
			var _idleSecondsCounter = 0;

			document.onclick = function() {
				if (opened === "N") {
					_idleSecondsCounter = 0;
				}
			};

			/*	document.onmousemove = function() {
					_idleSecondsCounter = 0;
				};*/

			document.onkeypress = function() {
				if (opened === "N") {
					_idleSecondsCounter = 0;
				}
			};

			_idleSecondsTimer = window.setInterval(CheckIdleTime, 1000);

			function CheckIdleTime() {
				_idleSecondsCounter++;
				//console.log("Session Idle Time :" + _idleSecondsCounter);
				var oPanel = document.getElementById("SecondsUntilExpire");
				if (oPanel) {
					oPanel.innerHTML = (IDLE_TIMEOUT - _idleSecondsCounter) + "";
				}
				if (_idleSecondsCounter >= IDLE_TIMEOUT) {
					if (_idleSecondsCounter >= (IDLE_TIMEOUT + 120)) {
						opened = "N";
						window.clearInterval(_idleSecondsTimer);
						that.backToLogoutScreen();
						return;
					}
					if (opened === "N") {
						opened = "Y";
						// var msgExp = that.i18nModel.getProperty("sessionExpiredWantToextend");
						var msgExp = that.getOwnerComponent().getModel("i18n").getProperty("sessionExpiredWantToextend");
						sap.m.MessageBox.confirm(msgExp, {
							title: "Confirm", // default
							styleClass: "sapUiSizeCompact", // default
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function(action) {
								if (action === "YES") {
									opened = "N";
									window.clearInterval(_idleSecondsTimer);
									that.sessionExpiredCall();
								} else {
									opened = "N";
									window.clearInterval(_idleSecondsTimer);
									that.backToLogoutScreen();
								}
							}
						});
					}
				}
			}
		},

		backToLogoutScreen: function() {
			var that = this;
			/*	var msgExp = that.i18nModel.getProperty("sessitionExpired");
				sap.m.MessageBox.information(msgExp, {
					title: "Information", // default
					styleClass: "sapUiSizeCompact", // default
					onClose: function() {*/
			document.location.href = "/sap/public/bc/icf/logoff";
			/*	}
			});*/
		},

		//create customer
		onCreateButtonPress: function() {
			sap.ui.core.BusyIndicator.show(0);
			var searchModel = new sap.ui.model.json.JSONModel({});
			sap.ui.getCore().setModel(searchModel, "SearchMainModelSet");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("createCustomer", true);
			sap.ui.core.BusyIndicator.hide();
			sap.ui.getCore().getModel("StatusDataTabModel").setProperty("/StatusData/DeletionBlock", false);
		},

		//change customer
		changeCustomer: function() {

		},

		//home page
		onCancelRequest: function() {
			window.location.href = '#Shell-home';
		},

		/*//handle value help
		handleValueHelp_partners: function() {
			this._oValueHelpDialogp.open();
			this.getView().byId("btnCreate").setEnabled(true);
		},

		//handle close partner
		handleValueHelpClose_partners: function() {
			this._oValueHelpDialogp.close();
		},*/
		//on after Rendering
		onAfterRendering: function() {
			this.i18nModel = this.getView().getModel("i18n");
			if (this.sessionExpireOneTime) {
				if (sap.ui.getCore().getModel("SessitonExpireIndSet") === undefined) {
					var sessionMod = new sap.ui.model.json.JSONModel({
						ind: "YES"
					});
					sap.ui.getCore().setModel(sessionMod, "SessitonExpireIndSet");
					this.sessionExpireOneTime = false;
					this.sessionExpiredCall();
				}
			}
		},
		onClickOpenRecod: function() {
			sap.ui.getCore().getModel("searchTableModelSet").getData().EditOrOpen = "OPEN";
			sap.ui.getCore().getModel("searchTableModelSet").refresh();

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ExBussSubscription", {
				contextPath: "Next"
			}, true);
		},
		onClickEditRecod: function() {
			sap.ui.getCore().getModel("searchTableModelSet").getData().EditOrOpen = "EDIT";
			sap.ui.getCore().getModel("searchTableModelSet").refresh();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ExBussSubscription", {
				contextPath: "Next"
			}, true);
		},
		onPressAdvancedSearchButton: function() {
			if (!this._oValueHelpDialogAS) {
				this._oValueHelpDialogAS = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.advancedSearch", this);
				this.getView().addDependent(this._oValueHelpDialogAS);
			}
			this._oValueHelpDialogAS.open();

			if (!this.firstTimeReadF4advSearch) {
				this.firstTimeReadF4advSearch = new Date();
				this.readCountryData();
				this.SystemDataModel();
			}
		},
		onTableSort: function(oEvent) {
			oEvent.getSource().getBinding("rows").sort(new sap.ui.model.Sorter("SearchBusinessPartner/bsnsPrtnrId", true),
				new sap.ui.model.Sorter("SearchBusinessPartner/Address/item/name", true),
				new sap.ui.model.Sorter("SearchBusinessPartner/Address/item/street", true),
				new sap.ui.model.Sorter("SearchBusinessPartner/Address/item/city", true),
				new sap.ui.model.Sorter("SearchBusinessPartner/Address/item/postalCode", true),
				new sap.ui.model.Sorter("SearchBusinessPartner/Address/item/cntrySubdivRowid/cntrySubdivCode", true),
				new sap.ui.model.Sorter("SearchBusinessPartner/Address/item/cntryRowid/englishShortName", true),
				new sap.ui.model.Sorter("SearchBusinessPartner/vatNumber", true),
				new sap.ui.model.Sorter("SearchBusinessPartner/taxNumber1", true)
			);
		},
		onSearchandAdvancedSerachModel: function() {
			var data = {
				Search: {
					openButtonEnable: false,
					changeButtonEnable: false,
					CreateButtonEnable: false,
					OpenBtnVisible: false,
					ChangeBtnVisible: false,
					CreateBtnVisible: false,
					SearchFieldValue: ""
				},
				AdvancedSearch: {
					GoldenRecordID: "",
					AccountName: "",
					Steet: "",
					City: "",
					PostalCode: "",
					Region: "",
					Country: "",
					RegionDesc: "",
					CountryDesc: "",
					VATNumber: "",
					TaxNumber1: "",
					POBox: "",
					POBoxPostalCode: "",
					LocalID: "",
					System: "",
					openButtonEnable: false
				}
			};
			var oSModel = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(oSModel, "searchAndAdvancedSearchModelSet");
			sap.ui.getCore().setModel(oSModel, "searchAndAdvancedSearchModelSet");
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
		searchtablemodel: function(Response) {
			var AccData = [];

			for (var i = 0; i < Response.length; i++) {

				if (Response[i].SearchBusinessPartner.Address.item.length !== undefined) {
					for (var k = 0; k < Response[i].SearchBusinessPartner.Address.item.length; k++) {

						var itemdata = {
							"GoldenRecordID": Response[i].SearchBusinessPartner !== undefined ? Response[i].SearchBusinessPartner.bsnsPrtnrId : "",
							"GoldenRowIdObj": Response[i].SearchBusinessPartner !== undefined ? Response[i].SearchBusinessPartner.rowidObject : "",
							"AccountName": Response[i].SearchBusinessPartner.Address.item[k].name !== undefined ? Response[i].SearchBusinessPartner.Address
								.item[k]
								.name : "",
							"Street": Response[i].SearchBusinessPartner.Address.item[k].street !== undefined ? Response[i].SearchBusinessPartner.Address.item[
								k].street : "",
							"City": Response[i].SearchBusinessPartner.Address.item[k].city !== undefined ? Response[i].SearchBusinessPartner.Address.item[
									k]
								.city : "",
							"PostalCode": Response[i].SearchBusinessPartner.Address.item[k].postalCode !== undefined ? Response[i].SearchBusinessPartner.Address
								.item[k].postalCode : "",
							"Region": Response[i].SearchBusinessPartner.Address.item[k].cntrySubdivRowid !== undefined ? Response[i].SearchBusinessPartner
								.Address
								.item[k].cntrySubdivRowid.cntrySubdivCode : "",
							"RegionDesc": Response[i].SearchBusinessPartner.Address.item[k].cntrySubdivRowid !== undefined ? Response[i].SearchBusinessPartner
								.Address
								.item[k].cntrySubdivRowid.cntrySubdivName : "",
							"Country": Response[i].SearchBusinessPartner.Address.item[k].cntryRowid !== undefined ? Response[i].SearchBusinessPartner.Address
								.item[k]
								.cntryRowid.englishShortName : "",
							"VATNumber": Response[i].SearchBusinessPartner.vatNumber !== undefined ? Response[i].SearchBusinessPartner.vatNumber : "",
							"TaxNumber": Response[i].SearchBusinessPartner.taxNumber1 !== undefined ? Response[i].SearchBusinessPartner.taxNumber1 : ""
						};

						AccData.push(itemdata);
					}
				} else {
					itemdata = {
						"GoldenRecordID": Response[i].SearchBusinessPartner !== undefined ? Response[i].SearchBusinessPartner.bsnsPrtnrId : "",
						"GoldenRowIdObj": Response[i].SearchBusinessPartner !== undefined ? Response[i].SearchBusinessPartner.rowidObject : "",
						"AccountName": Response[i].SearchBusinessPartner.Address.item.name !== undefined ? Response[i].SearchBusinessPartner.Address.item
							.name : "",
						"Street": Response[i].SearchBusinessPartner.Address.item.street !== undefined ? Response[i].SearchBusinessPartner.Address.item.street : "",
						"City": Response[i].SearchBusinessPartner.Address.item.city !== undefined ? Response[i].SearchBusinessPartner.Address.item.city : "",
						"PostalCode": Response[i].SearchBusinessPartner.Address.item.postalCode !== undefined ? Response[i].SearchBusinessPartner.Address
							.item.postalCode : "",
						"Region": Response[i].SearchBusinessPartner.Address.item.cntrySubdivRowid !== undefined ? Response[i].SearchBusinessPartner.Address
							.item.cntrySubdivRowid.cntrySubdivCode : "",
						"RegionDesc": Response[i].SearchBusinessPartner.Address.item.cntrySubdivRowid !== undefined ? Response[i].SearchBusinessPartner
							.Address
							.item.cntrySubdivRowid.cntrySubdivName : "",
						"Country": Response[i].SearchBusinessPartner.Address.item.cntryRowid !== undefined ? Response[i].SearchBusinessPartner.Address.item
							.cntryRowid.englishShortName : "",
						"VATNumber": Response[i].SearchBusinessPartner.vatNumber !== undefined ? Response[i].SearchBusinessPartner.vatNumber : "",
						"TaxNumber": Response[i].SearchBusinessPartner.taxNumber1 !== undefined ? Response[i].SearchBusinessPartner.taxNumber1 : ""
					};

					AccData.push(itemdata);
				}
			}
			var oSModel = new sap.ui.model.json.JSONModel({
				"results": AccData
			});
			oSModel.setSizeLimit(AccData.length);
			this.getView().setModel(oSModel, "searchModelSet");
			sap.ui.getCore().setModel(oSModel, "searchModelSet");
			var oSResults = new sap.ui.model.json.JSONModel({
				"results": Response
			});
			oSResults.setSizeLimit(Response.length);
			this.getView().setModel(oSResults, "searchResultsSet");
		},
		onPressLiveSearchField: function(oEvent) {
			var that = this;
			var oSelValueSearch = this.getView().getModel("searchAndAdvancedSearchModelSet").getData().Search;
			oSelValueSearch.openButtonEnable = false;
			oSelValueSearch.changeButtonEnable = false;
			oSelValueSearch.CreateButtonEnable = true;
			this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
			var sQuery = oEvent.getSource().getValue();
			var oSelValue = this.getView().getModel("searchAndAdvancedSearchModelSet").getData().AdvancedSearch;
			oSelValue.AccountName = "";
			oSelValue.City = "";
			oSelValue.CountryDesc = "";
			oSelValue.GoldenRecordID = "";
			oSelValue.LocalID = "";
			oSelValue.POBox = "";
			oSelValue.POBoxPostalCode = "";
			oSelValue.PostalCode = "";
			oSelValue.RegionDesc = "";
			oSelValue.Steet = "";
			oSelValue.System = "";
			oSelValue.TaxNumber1 = "";
			oSelValue.VATNumber = "";
			this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
			var oODataJSONModel = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oODataJSONModel, "RegionBasedCountryComboSet");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var searchPayload = {
				"SmartSearch": {
					"BasicSearch": {
						"flag": "true",
						"q": sQuery !== undefined ? sQuery : ""
					},
					"AdvancedSearch": {
						"flag": "false",
						"fq": ""
					}
				}
			};
			var SearchData = {
				"URL": "/RESTAdapter/SmartSearch/Basic/Advanced",
				"Request": JSON.stringify(searchPayload)
			};
			this.oModel.create("/BusinessPartnerSet", SearchData, {
				success: function(response) {
					oBusyDialog.close();
					var oSearch = JSON.parse(response.Response);
					var oSearchArray = [];
					if (response.Response.includes("<h1>Error</h1>")) {
						var message = response.Response.split("<pre>")[1].split("</pre>")[0];
						that.errMsg(message);
					} else {
						if (oSearch["SearchBusinessPartner.SmartSearch.Pager"].item === undefined) {
							oSearch["SearchBusinessPartner.SmartSearch.Pager"].item = [];
						}
						var oSResults = oSearch["SearchBusinessPartner.SmartSearch.Pager"].item;
						if (oSResults.length === undefined) {
							oSResults = Array(oSResults);
						}
						if (oSResults.length >= 100) {
							sap.m.MessageBox.information(that.getView().getModel("i18n").getProperty("100RecordsFound"));
						}
						oSearchArray = oSResults;
						sap.ui.getCore().setModel(oSearchArray, "bPartnerRowIdObject");
					}
					that.searchtablemodel(oSearchArray);
				},
				error: function(oError) {
					oBusyDialog.close();
				}
			});
		},
		onPressAdvancedSearchSearchButton: function(oEvent) {
			var oSelValueSearch = this.getView().getModel("searchAndAdvancedSearchModelSet").getData().Search;
			oSelValueSearch.openButtonEnable = false;
			oSelValueSearch.changeButtonEnable = false;
			oSelValueSearch.CreateButtonEnable = true;
			this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
			var oSearchFieldValue = this.getView().getModel("searchAndAdvancedSearchModelSet").getData().Search;
			oSearchFieldValue.SearchFieldValue = "";
			this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
			var oSelValue = this.getView().getModel("searchAndAdvancedSearchModelSet").getData().AdvancedSearch;
			var GoldenRecordID = oSelValue.GoldenRecordID;
			var AccountName = oSelValue.AccountName;
			var Steet = oSelValue.Steet;
			var City = oSelValue.City;
			var PostalCode = oSelValue.PostalCode;
			//	var Region = oSelValue.Region;
			//	var Country = oSelValue.Country;
			var Country = oSelValue.CountryDesc;
			var Region = oSelValue.RegionDesc;
			var VATNumber = oSelValue.VATNumber;
			var TaxNumber1 = oSelValue.TaxNumber1;
			var POBox = oSelValue.POBox;
			var POBoxPostalCode = oSelValue.POBoxPostalCode;
			var LocalID = oSelValue.LocalID;
			var System = oSelValue.System;
			var oSArray = [];
			if (GoldenRecordID !== "") {
				oSArray.push("bsnsPrtnrId='" + GoldenRecordID + "'");
			}
			if (AccountName !== "") {
				oSArray.push("Address.name='" + AccountName + "'");
			}
			if (Steet !== "") {
				oSArray.push("Address.street='" + Steet + "'");
			}
			if (City !== "") {
				oSArray.push("Address.city = '" + City + "'");
			}
			if (PostalCode !== "") {
				oSArray.push("Address.postalCode='" + PostalCode + "'");
			}
			if (Region !== "") {
				oSArray.push("Address.cntrySubdivRowid.cntrySubdivName='" + Region + "'");
			}
			if (Country !== "") {
				oSArray.push("Address.cntryRowid.englishShortName='" + Country + "'");
			}
			if (VATNumber !== "") {
				oSArray.push("vatNumber='" + VATNumber + "'");
			}
			if (TaxNumber1 !== "") {
				oSArray.push("taxNumber1='" + TaxNumber1 + "'");
			}
			if (POBox !== "") {
				oSArray.push("Address.boxNumber='" + POBox + "'");
			}
			if (POBoxPostalCode !== "") {
				oSArray.push("Address.poBoxPostalCode='" + POBoxPostalCode + "'");
			}
			if (LocalID !== "") {
				oSArray.push("CusIntIdentifier.altIdentifier='" + LocalID + "'");
			}
			if (System !== "") {
				oSArray.push("CusIntIdentifier.itoLogicalCompRowid.logicalCompId='" + System + "'");
			}
			if (oSArray.length === 0) {
				var oSModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				this.getView().setModel(oSModel, "searchModelSet");
				var oSResults = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oSResults, "searchResultsSet");
				this._oValueHelpDialogAS.close();
				return;
			}

			var oUrl = oSArray.join(" AND ");
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var searchPayload = {
				"SmartSearch": {
					"BasicSearch": {
						"flag": "false",
						"q": ""
					},
					"AdvancedSearch": {
						"flag": "true",
						"fq": oUrl !== undefined ? oUrl : ""
					}
				}
			};
			var AdvancedSearchData = {
				"URL": "/RESTAdapter/SmartSearch/Basic/Advanced",
				"Request": JSON.stringify(searchPayload)
			};
			this.oModel.create("/BusinessPartnerSet", AdvancedSearchData, {
				success: function(response) {
					oBusyDialog.close();
					that._oValueHelpDialogAS.close();
					var oSearch = JSON.parse(response.Response);
					var oSearchArray = [];
					if (response.Response.includes("<h1>Error</h1>")) {
						var message = response.Response.split("<pre>")[1].split("</pre>")[0];
						that.errMsg(message);
					} else {
						if (oSearch["SearchBusinessPartner.SmartSearch.Pager"].item === undefined) {
							oSearch["SearchBusinessPartner.SmartSearch.Pager"].item = [];
						}
						var oSResults = oSearch["SearchBusinessPartner.SmartSearch.Pager"].item;
						if (oSResults.length === undefined) {
							oSResults = Array(oSResults);
						}
						if (oSResults.length >= 100) {
							sap.m.MessageBox.information(that.getView().getModel("i18n").getProperty("100RecordsFound"));
						}
						oSearchArray = oSResults;
						sap.ui.getCore().setModel(oSearchArray, "bPartnerRowIdObject");
					}
					that.searchtablemodel(oSearchArray);
				},

				error: function(oError) {
					oBusyDialog.close();
				}
			});
			this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
		},
		onPressSearchDataTableRow: function(oEvent) {
			var ind = oEvent.getSource().getSelectedIndex();
			if (ind >= 0) {
				var oA = [];
				var obj = oEvent.getParameters().rowContext.getObject();
				var oD = obj.GoldenRecordID;
				oA.push(oD);
				var oSTModel = new sap.ui.model.json.JSONModel({
					"results": oD,
					"GoldenRowIdObj": obj.GoldenRowIdObj.toString(),
					"EditOrOpen": ""
				});
				oSTModel.setSizeLimit(oA.length);
				this.getView().setModel(oSTModel, "searchTableModelSet");
				sap.ui.getCore().setModel(oSTModel, "searchTableModelSet");
				this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
				var oSelValue = this.getView().getModel("searchAndAdvancedSearchModelSet").getData().Search;
				if (oA.length > 0 && this.IntiateOrSerchCustomerInd !== "SEARCH") {
					oSelValue.openButtonEnable = false;
					oSelValue.changeButtonEnable = true;
					oSelValue.CreateButtonEnable = true;
				} else if (oA.length > 0 && this.IntiateOrSerchCustomerInd === "SEARCH") {
					oSelValue.openButtonEnable = true;
					oSelValue.changeButtonEnable = false;
					oSelValue.CreateButtonEnable = false;
				}
				this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
			} else {
				var oSelValue1 = this.getView().getModel("searchAndAdvancedSearchModelSet").getData().Search;
				oSelValue1.openButtonEnable = false;
				oSelValue1.changeButtonEnable = false;
				oSelValue1.CreateButtonEnable = true;
				this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
			}
		},
		onPressAdvancedSearchCloseButton: function() {
			this._oValueHelpDialogAS.close();
		},

		navChangeCustomerView: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("changeCustomer", true);
		},

		fetchCreateCustomerDetails: function() {
			var that = this;
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");

			this.taskInstanceId = this.getOwnerComponent().getComponentData().startupParameters.TASK[0];
			var data =
				"/bpmodata/taskdata.svc/" + this.taskInstanceId + "/SAPBPMInputData('" + this.taskInstanceId +
				"')?$format=json&prefixReservedNames=true&$expand=startTypeINPUT/start/DO_DT_Fiori_Customer_Create/UploadDocuments/UploadedFiles,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/UploadDocuments/DocumentUpload/Attachment,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/ContactDetails/ContactPersons,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/ContactDetails/CompanyContactDetail/Telebox_Number,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/ContactDetails/CompanyContactDetail/URL_Segment,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/ContactDetails/CompanyContactDetail/Telephone_Segment,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/ContactDetails/CompanyContactDetail/Email_Segment,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/ContactDetails/CompanyContactDetail/Fax_Segment,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Monday/Afternoon,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Monday/Morning,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Thursday/Afternoon,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Thursday/Morning,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Friday/Afternoon,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Friday/Morning,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Sunday/Afternoon,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Sunday/Morning,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Wednesday/Afternoon,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Wednesday/Morning,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Tuesday/Afternoon,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Tuesday/Morning,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Saturday/Afternoon,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/UnloadingPoints/GoodsReceivingHours_24Hrs_Notion/Saturday/Morning,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/BankData/BankDetails,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/CustomerData/GeneralData,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/AccountingData/PaymentData,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/AccountingData/Correspondence,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/AccountingData/AccountManagement,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/SalesData/PartnerFunctions,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/SalesData/AdditionalFields,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/SalesData/Shipping,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/SalesData/BillingDocument/TaxClassifications,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/SalesData/SalesOrder,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/BusinessPartnerData/CustomerBusinessArea,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/BusinessPartnerData/CustomerClassification,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/BusinessPartnerData/External_Identifier/ExternalIdentifier,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/BusinessPartnerData/TaxData/VAT,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/BusinessPartnerData/Name_Address,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/TextNotes/Text,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/TextNotes/TextClassification,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/WorkFlow_Approver_Details,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/StatusData/DeletionFlag,startTypeINPUT/start/DO_DT_Fiori_Customer_Create/StatusData/BlockData,startTypeINPUT/start/ProcessInstanceAttributes/ProcessInitiator";

			var Filter = new sap.ui.model.Filter('URL', 'EQ', data);
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.setUseBatch(true);
			this.oModel.read("/BusinessPartnerSet", {
				method: "GET",
				filters: [Filter],
				success: function(oData) {
					oBusyDialog.close();
					that.bindCreateCustomerModel(oData);
				},
				error: function() {
					oBusyDialog.close();
				}
			});

		},

		bindCreateCustomerModel: function(oData) {
			var customerDetailsModel = new sap.ui.model.json.JSONModel({
				"results": oData.results[0].Response
			});
			sap.ui.getCore().setModel(customerDetailsModel, "customerDetailsModelSet");
			this.InputData = JSON.parse(oData.results[0].Response);
			if (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.WorkFlow_Approver_Details.results[0].Extension_Indicator ===
				"true") {
				var oLSModel = new sap.ui.model.json.JSONModel({});
				sap.ui.getCore().setModel(oLSModel, "ExtSubTableModelSet");
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Extension", true);
			} else {
				var searchModel = new sap.ui.model.json.JSONModel({});
				sap.ui.getCore().setModel(searchModel, "SearchMainModelSet");
				oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("createCustomer", true);
			}
		},

		bindChangeCustomerModel: function(oData) {
			var customerDetailsModel = new sap.ui.model.json.JSONModel({
				"results": oData.results[0].Response
			});
			sap.ui.getCore().setModel(customerDetailsModel, "customerDetailsModelSet");
			this.InputData = JSON.parse(oData.results[0].Response);
			if (this.InputData.d.startTypeINPUT.start.DOCustomerChange.WorkFlowDetails.NewSubscriptionIndicator === "true") {
				var oSTModel = new sap.ui.model.json.JSONModel({});
				sap.ui.getCore().setModel(oSTModel, "searchTableModelSet");
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("NewSubscription", true);
			} else {
				var oLSModel = new sap.ui.model.json.JSONModel({});
				sap.ui.getCore().setModel(oLSModel, "ExtSubTableModelSet");
				oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("changeCustomer", true);
			}
		},

		fetchChangeCustomerDetails: function() {

			var that = this;
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			// this.resubmitScenario = true;
			this.taskInstanceId = this.getOwnerComponent().getComponentData().startupParameters.TASK[0];

			var data =
				"/bpmodata/taskdata.svc/" + this.taskInstanceId + "/SAPBPMInputData('" + this.taskInstanceId +
				"')?$format=json&prefixReservedNames=true&$expand=startTypeINPUT/start/DOCustomerChange/CustomerOld/UnloadingPoints/Calendar/Monday,startTypeINPUT/start/DOCustomerChange/CustomerOld/UnloadingPoints/Calendar/Thursday,startTypeINPUT/start/DOCustomerChange/CustomerOld/UnloadingPoints/Calendar/Friday,startTypeINPUT/start/DOCustomerChange/CustomerOld/UnloadingPoints/Calendar/Sunday,startTypeINPUT/start/DOCustomerChange/CustomerOld/UnloadingPoints/Calendar/Wednesday,startTypeINPUT/start/DOCustomerChange/CustomerOld/UnloadingPoints/Calendar/Tuesday,startTypeINPUT/start/DOCustomerChange/CustomerOld/UnloadingPoints/Calendar/Saturday,startTypeINPUT/start/DOCustomerChange/CustomerOld/BankData/BankDetails,startTypeINPUT/start/DOCustomerChange/CustomerOld/GeneralData,startTypeINPUT/start/DOCustomerChange/ContactOld/ContactPersons,startTypeINPUT/start/DOCustomerChange/ContactOld/CompanyContactDetail/URL_Segment,startTypeINPUT/start/DOCustomerChange/ContactOld/CompanyContactDetail/Telephone_Segment,startTypeINPUT/start/DOCustomerChange/ContactOld/CompanyContactDetail/Email_Segment,startTypeINPUT/start/DOCustomerChange/ContactOld/CompanyContactDetail/Fax_Segment,startTypeINPUT/start/DOCustomerChange/WorkFlowDetails,startTypeINPUT/start/DOCustomerChange/UploadDocumentsNew/UploadedFiles,startTypeINPUT/start/DOCustomerChange/UploadDocumentsNew/DocumentUpload/Attachment,startTypeINPUT/start/DOCustomerChange/ContactNew/ContactPersons,startTypeINPUT/start/DOCustomerChange/ContactNew/CompanyContactDetail/URL_Segment,startTypeINPUT/start/DOCustomerChange/ContactNew/CompanyContactDetail/Telephone_Segment,startTypeINPUT/start/DOCustomerChange/ContactNew/CompanyContactDetail/Email_Segment,startTypeINPUT/start/DOCustomerChange/ContactNew/CompanyContactDetail/Fax_Segment,startTypeINPUT/start/DOCustomerChange/TextNotesOld/Text,startTypeINPUT/start/DOCustomerChange/TextNotesOld/TextClassification,startTypeINPUT/start/DOCustomerChange/SalesDataNew/PartnerFunctions,startTypeINPUT/start/DOCustomerChange/SalesDataNew/AdditionalFields,startTypeINPUT/start/DOCustomerChange/SalesDataNew/Shipping,startTypeINPUT/start/DOCustomerChange/SalesDataNew/BillingDocument/TaxClassifications,startTypeINPUT/start/DOCustomerChange/SalesDataNew/SalesOrder,startTypeINPUT/start/DOCustomerChange/CustomerNew/UnloadingPoints/Calendar/Monday,startTypeINPUT/start/DOCustomerChange/CustomerNew/UnloadingPoints/Calendar/Thursday,startTypeINPUT/start/DOCustomerChange/CustomerNew/UnloadingPoints/Calendar/Friday,startTypeINPUT/start/DOCustomerChange/CustomerNew/UnloadingPoints/Calendar/Sunday,startTypeINPUT/start/DOCustomerChange/CustomerNew/UnloadingPoints/Calendar/Wednesday,startTypeINPUT/start/DOCustomerChange/CustomerNew/UnloadingPoints/Calendar/Tuesday,startTypeINPUT/start/DOCustomerChange/CustomerNew/UnloadingPoints/Calendar/Saturday,startTypeINPUT/start/DOCustomerChange/CustomerNew/BankData/BankDetails,startTypeINPUT/start/DOCustomerChange/CustomerNew/GeneralData,startTypeINPUT/start/DOCustomerChange/AccountingNew/PaymentData,startTypeINPUT/start/DOCustomerChange/AccountingNew/Correspondence,startTypeINPUT/start/DOCustomerChange/AccountingNew/AccountManagement,startTypeINPUT/start/DOCustomerChange/StatusDataNew/DeletionFlag,startTypeINPUT/start/DOCustomerChange/StatusDataNew/BlockData,startTypeINPUT/start/DOCustomerChange/SalesDataOld/PartnerFunctions,startTypeINPUT/start/DOCustomerChange/SalesDataOld/AdditionalFields,startTypeINPUT/start/DOCustomerChange/SalesDataOld/Shipping,startTypeINPUT/start/DOCustomerChange/SalesDataOld/BillingDocument/TaxClassifications,startTypeINPUT/start/DOCustomerChange/SalesDataOld/SalesOrder,startTypeINPUT/start/DOCustomerChange/AccountingOld/PaymentData,startTypeINPUT/start/DOCustomerChange/AccountingOld/Correspondence,startTypeINPUT/start/DOCustomerChange/AccountingOld/AccountManagement,startTypeINPUT/start/DOCustomerChange/BPNew/CustomerBusinessArea,startTypeINPUT/start/DOCustomerChange/BPNew/CustomerClassification,startTypeINPUT/start/DOCustomerChange/BPNew/External_Identifier/ExternalIdentifier,startTypeINPUT/start/DOCustomerChange/BPNew/TaxData/VAT,startTypeINPUT/start/DOCustomerChange/BPNew/Name_Address,startTypeINPUT/start/DOCustomerChange/TextNotesNew/Text,startTypeINPUT/start/DOCustomerChange/TextNotesNew/TextClassification,startTypeINPUT/start/DOCustomerChange/BPOld/CustomerBusinessArea,startTypeINPUT/start/DOCustomerChange/BPOld/CustomerClassification,startTypeINPUT/start/DOCustomerChange/BPOld/External_Identifier/ExternalIdentifier,startTypeINPUT/start/DOCustomerChange/BPOld/TaxData/VAT,startTypeINPUT/start/DOCustomerChange/BPOld/Name_Address,startTypeINPUT/start/DOCustomerChange/StatusDataOld/DeletionFlag,startTypeINPUT/start/DOCustomerChange/StatusDataOld/BlockData,startTypeINPUT/start/DOCustomerChange/UploadDocumentsOld/UploadedFiles,startTypeINPUT/start/DOCustomerChange/UploadDocumentsOld/DocumentUpload/Attachment,startTypeINPUT/start/ProcessInstanceAttributes/ProcessInitiator";

			var Filter = new sap.ui.model.Filter('URL', 'EQ', data);
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.setUseBatch(true);
			this.oModel.read("/BusinessPartnerSet", {
				method: "GET",
				filters: [Filter],
				success: function(oData) {
					oBusyDialog.close();
					that.bindChangeCustomerModel(oData);
				},
				error: function() {
					oBusyDialog.close();
				}
			});

		},
		//read Country data
		readCountryData: function(url) {
			var that = this;
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ', "/RESTAdapter/REST_MDM/MDMRefTable/REFCNTRY?order=englishShortName");
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var dataResultArr = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
							dataResultArr = [];
						} else {
							var dataAfterParse = JSON.parse(oData.results[0].Response);
							if (dataAfterParse["BaseObject.Pager"].item === undefined) {
								dataAfterParse["BaseObject.Pager"].item = [];
							}
							dataResultArr = dataAfterParse["BaseObject.Pager"].item;
						}
						var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": dataResultArr
						});
						oODataJSONModel.setSizeLimit(dataResultArr.length);
						that.getView().setModel(oODataJSONModel, "CountryComboSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
		},
		//read system Data
		SystemDataModel: function() {
			var that = this;
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ', "/RESTAdapter/REST_MDM/MDMRefTable/ITOLOGICALCOMP?order=logicalCompId");
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var dataResultArr = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
							dataResultArr = [];
						} else {
							var dataAfterParse = JSON.parse(oData.results[0].Response);
							if (dataAfterParse["BaseObject.Pager"].item === undefined) {
								dataAfterParse["BaseObject.Pager"].item = [];
							}
							dataResultArr = dataAfterParse["BaseObject.Pager"].item;
						}
						var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": dataResultArr
						});
						oODataJSONModel.setSizeLimit(dataResultArr.length);
						that.getView().setModel(oODataJSONModel, "AdvSearchSystemModelSet");

					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
		},
		//change event for Region
		liveChnageNameAddressRegion: function(oEvent) {
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//change event for System	
		liveChangeSystem: function(oEvent) {
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//company code change event
		onSelectCountryAddressAndName: function(oEvent) {
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				var oODataJSONModel = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModel, "RegionBasedCountryComboSet");
			} else {
				var CountryKey = oEvent.getSource().getProperty("selectedKey");
				this.readRegionNameAddress(CountryKey);
			}
			this.getView().getModel("searchAndAdvancedSearchModelSet").getData().AdvancedSearch.RegionDesc = "";
			this.getView().getModel("searchAndAdvancedSearchModelSet").refresh();
		},
		//read Region
		readRegionNameAddress: function(countryCode) {
			var that = this;
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ', "/RESTAdapter/REST_MDM/MDMRefTable/REFCNTRYSUBDIV?filter=cntryCode='" +
				countryCode + "'" + "&order=cntrySubdivName");
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var dataResultArr = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
							dataResultArr = [];
						} else {
							var dataAfterParse = JSON.parse(oData.results[0].Response);
							if (dataAfterParse["BaseObject.Pager"].item === undefined) {
								dataAfterParse["BaseObject.Pager"].item = [];
							}
							dataResultArr = dataAfterParse["BaseObject.Pager"].item;
						}
						var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": dataResultArr
						});
						oODataJSONModel.setSizeLimit(dataResultArr.length);
						that.getView().setModel(oODataJSONModel, "RegionBasedCountryComboSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
		},

		setSessionExpire: function() {
			this.i18nModel = this.getView().getModel("i18n");
			if (this.sessionExpireOneTime) {
				if (sap.ui.getCore().getModel("SessitonExpireIndSet") === undefined) {
					var sessionMod = new sap.ui.model.json.JSONModel({
						ind: "YES"
					});
					sap.ui.getCore().setModel(sessionMod, "SessitonExpireIndSet");
					this.sessionExpireOneTime = false;
					this.sessionExpiredCall();
				}
			}
		}

	});
});
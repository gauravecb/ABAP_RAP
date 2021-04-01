sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"MDMZCUSTOMER/model/Formatter"
], function(Controller, Formatter) {
	"use strict";
	return Controller.extend("MDMZCUSTOMER.controller.Display", {
		onInit: function() {
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.attachRoutePatternMatched(this._handleRouteMatched, this);
			this.ExternalIdentifierInitialModel();

		},
		_handleRouteMatched: function(oEvent) {
			if (oEvent.getParameter("name") === "Display") {
				var modelSearch = sap.ui.getCore().getModel("ExtSubTableModelSet");
				if (modelSearch === undefined) {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("ExBussSubscription", {
						contextPath: "Back"
					}, true);
					return;
				}
				this.onPressExSubOpenButton();
			}
		},
		onPressExBusToDisplay: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ExBussSubscription", {
				contextPath: "Back"
			}, true);
		},
		onCancelRequest: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ExBussSubscription", {
				contextPath: "Back"
			}, true);
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

		GoldenRecID: function() {
			var oSelValue1 = sap.ui.getCore().getModel("searchTableModelSet").getData();
			var oGoldenRecId = oSelValue1.results;
			var oSModel = new sap.ui.model.json.JSONModel({
				"GoldenRecID": oGoldenRecId !== undefined ? oGoldenRecId : ""
			});
			this.getView().setModel(oSModel, "GoldenRecIDModelSet");
		},
		ExternalIdentifierInitialModel: function() {
			var data = {
				ExternalIdentifer: {
					"ExternalIdenitir": [],
					"TotalExternalIdent": "0",
					"ExternalIdentifier_Type": "",
					"ExternalIdentifier_Value": "",
					"ChamberOf_Commerce": "",
					"DUNS": "",
					"Type": ""
				}
			};
			var modelMain1 = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(modelMain1, "ExtIdentModelSet");
		},

		Systemfield: function() {
			var oSelValue1 = sap.ui.getCore().getModel("searchExtSubTableModelSet").getData();
			var system = oSelValue1.System;
			var localid = oSelValue1.LocalID;
			if (oSelValue1.ArrayExtIdent !== undefined) {
				if (oSelValue1.ArrayExtIdent.applnRoleRowid !== undefined) {
					var AccountGroupKey = oSelValue1.ArrayExtIdent.applnRoleRowid.roleId;
					var AccountGroupDesc = oSelValue1.ArrayExtIdent.applnRoleRowid.roleDescription;
				}
			}
			var oSysModel = new sap.ui.model.json.JSONModel({
				"System": system !== undefined ? system : "",
				"ApplicatioID": localid !== undefined ? localid : "",
				"AccountGroupKey": AccountGroupKey !== undefined ? AccountGroupKey : "",
				"AccountGroupDesc": AccountGroupDesc !== undefined ? AccountGroupDesc : ""
			});
			this.getView().setModel(oSysModel, "SystemModelSet");
		},
		ExtIdentifier: function() {

			var data = this.getView().getModel("ExtIdentModelSet").getData();
			if (sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().ExtIdent === undefined) {
				return;
			}
			var oBusPartExtIdent = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().ExtIdent;
			if (oBusPartExtIdent.length === undefined) {
				oBusPartExtIdent = Array(oBusPartExtIdent);
			}
			data.ExternalIdentifer.ExternalIdenitir = [];
			for (var e = 0; e < oBusPartExtIdent.length; e++) {
				var type = oBusPartExtIdent[e].identifierTypeRowid !== undefined ? oBusPartExtIdent[e].identifierTypeRowid.type : "";
				if (type === "DUNS") {
					data.ExternalIdentifer.DUNS = oBusPartExtIdent[e].altIdentifier !== undefined ? oBusPartExtIdent[e].altIdentifier.toString().trim() :
						"";
				} else if (type === "Chamber of Commerce") {
					data.ExternalIdentifer.ChamberOf_Commerce = oBusPartExtIdent[e].altIdentifier !== undefined ? oBusPartExtIdent[e].altIdentifier.toString()
						.trim() :
						"";
				} else {
					data.ExternalIdentifer.ExternalIdenitir.push({
						ExtIdntValue: oBusPartExtIdent[e].altIdentifier !== undefined ? oBusPartExtIdent[e].altIdentifier.toString().trim() : "",
						ExterIdtTypeDesc: type,
						ExterIdtType: oBusPartExtIdent[e].identifierTypeRowid !== undefined ? oBusPartExtIdent[e].identifierTypeRowid.rowidObject : ""
					});

				}
			}
			data.ExternalIdentifer.TotalExternalIdent = data.ExternalIdentifer.ExternalIdenitir.length;
			var modelMain1 = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(modelMain1, "ExtIdentModelSet");
		},

		/*	ExtIdentifier: function() {
				var duns = "";
				var ChamberOfComm = "";
				var DunsAndChamberOfComm = {
					"Duns": "",
					"ChamberofComm": ""
				};
				var ExtArray = [];
				var oExtIdentifier = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().ExtIdent;
				if(oExtIdentifier === undefined){
					return;
				}
				if (oExtIdentifier.length === undefined) {
					if (oExtIdentifier.identifierTypeRowid.type === "DUNS") {
						duns = oExtIdentifier.altIdentifier;
					} else if (oExtIdentifier.identifierTypeRowid.type === "CHAMBER OF COMMERCE") {
						ChamberOfComm = oExtIdentifier.altIdentifier;
					} else {
						var Ext = {
							"ExtIdentType":oExtIdentifier.identifierTypeRowid.responsibleInstitute,
							"rowidObject": oExtIdentifier.identifierTypeRowid.rowidObject,
							"Type": oExtIdentifier.identifierTypeRowid.type,
							"altIdentifier": oExtIdentifier.altIdentifier
						};
						ExtArray.push(Ext);
					}
					DunsAndChamberOfComm = {
						"Duns": duns,
						"ChamberofComm": ChamberOfComm
					};
				} else {
					for (var i = 0; i < oExtIdentifier.length; i++) {
						if (oExtIdentifier[i].identifierTypeRowid.type === "DUNS") {
							duns = oExtIdentifier[i].altIdentifier;
						} else if (oExtIdentifier[i].identifierTypeRowid.type === "CHAMBER OF COMMERCE") {
							ChamberOfComm = oExtIdentifier[i].altIdentifier;
						} else {
							var Ext = {
								"ExtIdentType":oExtIdentifier[i].identifierTypeRowid.responsibleInstitute,
								"rowidObject": oExtIdentifier[i].identifierTypeRowid.rowidObject,
								"Type": oExtIdentifier[i].identifierTypeRowid.type,
								"altIdentifier": oExtIdentifier[i].altIdentifier
							};
							ExtArray.push(Ext);
						}
					}
					DunsAndChamberOfComm = {
						"Duns": duns,
						"ChamberofComm": ChamberOfComm
					};
				}

				var oEIModel = new sap.ui.model.json.JSONModel({
					"ExtIdentItems": ExtArray,
					"ExtDunsChamber": DunsAndChamberOfComm
				});
				this.getView().setModel(oEIModel, "ExtIdentModelSet");
			},*/

		/*CustClassification: function() {
			var oCustClassfication = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().ExtSubDomain;
              var oBusPartner = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().results;
            var oOrgnisationLevel = oBusPartner.BUSINESSPARTNER.orgLvlRowid.literalValue;
            var oAccountLegalStatus = oBusPartner.BUSINESSPARTNER.legalClassRowid.classification; 
              
			var oCCModel = new sap.ui.model.json.JSONModel({
				"CustClassification": oCustClassfication !== undefined ? oCustClassfication :"",
				"OrgnisationLevel": oOrgnisationLevel !== undefined ? oOrgnisationLevel :"",
				"AccountLegalStatus": oAccountLegalStatus !== undefined ? oAccountLegalStatus :""
			});
			this.getView().setModel(oCCModel, "CustClassficationModelSet");

		},*/
		CustClassification: function() {
			var oCustClassfication = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().ExtSubDomain;
			var oBusPartner = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().results;
			if (oBusPartner.BUSINESSPARTNER !== undefined) {
				if (oBusPartner.BUSINESSPARTNER.orgLvlRowid !== undefined) {
					if (oBusPartner.BUSINESSPARTNER.orgLvlRowid.literalValue !== undefined) {
						var oOrgnisationLevel = oBusPartner.BUSINESSPARTNER.orgLvlRowid.literalValue;
					}
				}
			}
			if (oBusPartner.BUSINESSPARTNER !== undefined) {
				if (oBusPartner.BUSINESSPARTNER.legalClassRowid !== undefined) {
					if (oBusPartner.BUSINESSPARTNER.legalClassRowid.classification !== undefined) {
						var oAccountLegalStatus = oBusPartner.BUSINESSPARTNER.legalClassRowid.classification;
					}
				}
			}
			var oCCModel = new sap.ui.model.json.JSONModel({
				"CustClassification": oCustClassfication !== undefined ? oCustClassfication : "",
				"OrgnisationLevel": oOrgnisationLevel !== undefined ? oOrgnisationLevel : "",
				"AccountLegalStatus": oAccountLegalStatus !== undefined ? oAccountLegalStatus : ""
			});
			this.getView().setModel(oCCModel, "CustClassficationModelSet");
		},
		onPressExtIdentFrag: function() {
			if (!this._oValueHelpDialogExtIdenfier) {
				this._oValueHelpDialogExtIdenfier = sap.ui.xmlfragment("MDMZCUSTOMER.fragments2.externalIdentifierDialog", this);
				this.getView().addDependent(this._oValueHelpDialogExtIdenfier);
			}
			this._oValueHelpDialogExtIdenfier.open();
		},
		onPressExtIdentifierTypeValueFragOk: function() {
			this._oValueHelpDialogExtIdenfier.close();
		},
		onPressAddVatCountryVatNumberDisplay: function() {
			if (!this._oValueHelpDialogVatDetails) {
				this._oValueHelpDialogVatDetails = sap.ui.xmlfragment("MDMZCUSTOMER.fragments2.vatCountryVatNumber", this);
				this.getView().addDependent(this._oValueHelpDialogVatDetails);
			}
			this._oValueHelpDialogVatDetails.open();

		},
		onPressVatDataOkDisplay: function() {
			this._oValueHelpDialogVatDetails.close();
		},
		displayTaxClassificationDialog: function() {
			if (!this._oValueHelpDialogTaxClassification) {
				this._oValueHelpDialogTaxClassification = sap.ui.xmlfragment("MDMZCUSTOMER.fragments2.taxClassificationDialog", this);
				this.getView().addDependent(this._oValueHelpDialogTaxClassification);
			}
			this._oValueHelpDialogTaxClassification.open();
		},
		onPressTaxClassificationOkFrag: function() {
			this._oValueHelpDialogTaxClassification.close();

		},
		onPressExSubOpenButton: function() {
			var that = this;
			var oExtSub = sap.ui.getCore().getModel("ExtSubTableModelSet");
			var oExtSubModel = oExtSub.getData();
			var Kunnr = oExtSubModel.Customernumber;
			var Bukrs = oExtSubModel.Companycode;
			var Vtweg = oExtSubModel.Distrchannel;
			var Spart = oExtSubModel.Division;
			var Vkorg = oExtSubModel.Salesorg;
			var System = oExtSubModel.System;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();

			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/SAP_DisplayCustomer/ZSD_MDM_DISPLAY_CUSTOMER_API_SRV/TCustomerSet?System_Name=" + System + "&filter=Kunnr eq '" +
				Kunnr + "' and Bukrs eq '" + Bukrs + "' and Vkorg eq '" + Vkorg + "' and Vtweg eq '" + Vtweg + "' and Spart eq '" + Spart +
				"'&expand=N_BankDetails,N_ContactPerson,N_NameAddr,N_PartnerFnct,N_UnloadingPoint,N_VatData,N_TaxClassif,N_TextNotes,N_Classif,N_CompContactDet/N_AddFax,N_CompContactDet/N_AddMail,N_CompContactDet/N_AddTelep,N_CompContactDet/N_AddURL"
			);
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var oModellData = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().results.BUSINESSPARTNER;
						if (oModellData === undefined) {
							oModellData = {};
						}
						var oResultsArray = [];
						var oNameAddressArray = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var oSearch = JSON.parse(oData.results[0].Response);
							if (oSearch.d.results === undefined) {
								oSearch.d.results = [];
							}
							var oResults = oSearch.d.results;
							if (oResults.length === undefined) {
								oResults = Array(oResults);
							}
							oResultsArray = oResults;

							//TaxData
							var TaxDataArray = [];
							var oTaxData = oSearch.d.results;
							if (oTaxData.length === undefined) {
								oTaxData = Array(oTaxData);
							}
							for (var i = 0; i < oTaxData.length; i++) {
								var itemData = {
									Tax_1Value: oModellData.taxNumber1 !== undefined ? oModellData.taxNumber1.toString() : "",
									Tax_2Value: oModellData.taxNumber2 !== undefined ? oModellData.taxNumber2.toString() : "",
									Tax_3Value: oModellData.taxNumber3 !== undefined ? oModellData.taxNumber3.toString() : "",
									Tax_4Value: oModellData.taxNumber4 !== undefined ? oModellData.taxNumber4.toString() : "",
									Tax_5Value: oModellData.taxNumber5 !== undefined ? oModellData.taxNumber5.toString() : "",
									VatCountry: oTaxData[i].VatCountry,
									VatNumber: oModellData.vatNumber !== undefined ? oModellData.vatNumber.toString() : "",
									TaxJurisdictionCode: oTaxData[i].TaxJurisdictionCode,
									TaxationType: oModellData.taxTypeRowid !== undefined && oModellData.taxTypeRowid.code !==
										undefined ? oModellData.taxTypeRowid.code : "",
									TaxationTypeDesc: oModellData.taxTypeRowid !== undefined && oModellData.taxTypeRowid.description !==
										undefined ? oModellData.taxTypeRowid.description : "",
									TaxNumberType: oModellData.taxNumberTypeRowid !== undefined && oModellData.taxNumberTypeRowid.code !==
										undefined ? oModellData.taxNumberTypeRowid.code : "",
									TaxNumberTypeDesc: oModellData.taxNumberTypeRowid !== undefined && oModellData.taxNumberTypeRowid.description !==
										undefined ? oModellData.taxNumberTypeRowid.description : "",
									CFOPCategory: oTaxData[i].CfopCategory,
									CfopCategoryDesc: oTaxData[i].CfopCategoryDesc,
									ICMSLaw: oTaxData[i].IcmsLaw,
									IcmsLawDesc: oTaxData[i].IcmsLawDesc,
									IPILaw: oTaxData[i].IpiLaw,
									IpiLawDesc: oTaxData[i].IpiLawDesc,
									NaturalPerson: oTaxData[i].NaturalPerson ? true : false,
									SalesPurTax: oTaxData[i].SalesTax ? true : false,
									EqualizationTax: oTaxData[i].EquilizationTax ? true : false,
									ICMSExempt: oTaxData[i].IcmsExempt ? true : false,
									IPIExempt: oTaxData[i].IpiExempt ? true : false
								};

								TaxDataArray.push(itemData);

							}

							//NameAddress
							var oNameAddressResults = oSearch.d.results[0].N_NameAddr.results;
							if (oNameAddressResults === undefined) {
								oNameAddressResults = [];
							}
							if (oNameAddressResults.length === undefined) {
								oNameAddressResults = Array(oNameAddressResults);
							}
							oNameAddressArray = oNameAddressResults;
							//VAT Data
							var VatDataArray = [];
							var oVatDataResults = oSearch.d.results[0].N_VatData.results;
							if (oVatDataResults === undefined) {
								oVatDataResults = [];
							}
							if (oVatDataResults.length === undefined) {
								oVatDataResults = Array(oVatDataResults);
							}
							VatDataArray = oVatDataResults;
							//Bank Details	
							var BankArray = [];
							var oBankResults = oSearch.d.results[0].N_BankDetails.results;
							if (oBankResults === undefined) {
								oBankResults = [];
							}
							if (oBankResults.length === undefined) {
								oBankResults = Array(oBankResults);
							}
							BankArray = oBankResults;
							if (BankArray.length === 0) {
								BankArray = [{}];
							}

							//Classification	
							var ClassifArray = [];
							var oClassifResults = oSearch.d.results[0].N_Classif.results;
							if (oClassifResults === undefined) {
								oClassifResults = [];
							}
							if (oClassifResults.length === undefined) {
								oClassifResults = Array(oClassifResults);
							}
							ClassifArray = oClassifResults;
							if (ClassifArray.length === 0) {
								ClassifArray = [{}];
							}
							//N_CompContactDet
							var CompContactDetArray = [];
							var oCompContactDetResults = oSearch.d.results[0].N_CompContactDet.results;
							if (oCompContactDetResults === undefined) {
								oCompContactDetResults = [];
							}
							if (oCompContactDetResults.length === undefined) {
								oCompContactDetResults = Array(oCompContactDetResults);
							}
							CompContactDetArray = oCompContactDetResults;
							//N_ContactPerson	
							var ContactPersonArray = [];
							var oContactPersonResults = oSearch.d.results[0].N_ContactPerson.results;
							if (oContactPersonResults === undefined) {
								oContactPersonResults = [];
							}
							if (oContactPersonResults.length === undefined) {
								oContactPersonResults = Array(oContactPersonResults);
							}
							ContactPersonArray = oContactPersonResults;
							if (ContactPersonArray.length === 0) {
								ContactPersonArray = [{}];
							}
							//Partner Functions
							var PartnerFnctArray = [];
							var oPartnerFnctResults = oSearch.d.results[0].N_PartnerFnct.results;
							if (oPartnerFnctResults === undefined) {
								oPartnerFnctResults = [];
							}
							if (oPartnerFnctResults.length === undefined) {
								oPartnerFnctResults = Array(oPartnerFnctResults);
							}
							PartnerFnctArray = oPartnerFnctResults;
							//Tax Classification	
							var TaxClassificationArray = [];
							var oTaxClassificationResults = oSearch.d.results[0].N_TaxClassif.results;
							if (oTaxClassificationResults === undefined) {
								oTaxClassificationResults = [];
							}
							if (oTaxClassificationResults.length === undefined) {
								oTaxClassificationResults = Array(oTaxClassificationResults);
							}
							TaxClassificationArray = oTaxClassificationResults;
							//Text Notes	
							var TextNotesArray = [];
							var oTextNotesResults = oSearch.d.results[0].N_TextNotes.results;
							if (oTextNotesResults === undefined) {
								oTextNotesResults = [];
							}
							if (oTextNotesResults.length === undefined) {
								oTextNotesResults = Array(oTextNotesResults);
							}
							TextNotesArray = oTextNotesResults;
							if (TextNotesArray.length === 0) {
								TextNotesArray = [{
									MultiLine: false
								}];
							}
							//N_UnloadingPoint	
							var UnloadingPointArray = [];
							var oUnloadingPointResults = oSearch.d.results[0].N_UnloadingPoint.results;
							if (oUnloadingPointResults === undefined) {
								oUnloadingPointResults = [];
							}
							if (oUnloadingPointResults.length === undefined) {
								oUnloadingPointResults = Array(oUnloadingPointResults);
							}
							UnloadingPointArray = oUnloadingPointResults;
							if (UnloadingPointArray.length === 0) {
								UnloadingPointArray = [{}];
							}
							//Additional Fax
							var AddFaxArray = [];

							var AddFax = oSearch.d.results[0].N_CompContactDet.results[0].N_AddFax.results;

							if (AddFax === undefined) {
								AddFax = [];
							}
							if (AddFax.length === undefined) {
								AddFax = Array(AddFax);
							}
							AddFaxArray = AddFax;
							var FaxDefault;
							for (var i = 0; i < AddFax.length; i++) {
								if (AddFax[i].DefaultFax) {
									FaxDefault = AddFax[i];
									break;
								}
							}

							//Additional Mails
							var AddMailArray = [];
							var AddMail = oSearch.d.results[0].N_CompContactDet.results[0].N_AddMail.results;
							if (AddMail === undefined) {
								AddMail = [];
							}
							if (AddMail.length === undefined) {
								AddMail = Array(AddMail);
							}
							AddMailArray = AddMail;
							var MailDefault;
							for (var i = 0; i < AddMail.length; i++) {
								if (AddMail[i].DefaultMail) {
									MailDefault = AddMail[i];
									break;
								}
							}

							//Additional Telephones
							var AddTelepArray = [];
							var AddTelep = oSearch.d.results[0].N_CompContactDet.results[0].N_AddTelep.results;
							if (AddTelep === undefined) {
								AddTelep = [];
							}
							if (AddTelep.length === undefined) {
								AddTelep = Array(AddTelep);
							}
							AddTelepArray = AddTelep;
							var TeleDefault;
							for (var i = 0; i < AddTelep.length; i++) {
								if (AddTelep[i].DefaultTele) {
									TeleDefault = AddTelep[i];
									break;
								}
							}
							//Additional URLs	

							var AddURLArray = [];
							var AddURL = oSearch.d.results[0].N_CompContactDet.results[0].N_AddURL.results;
							if (AddURL === undefined) {
								AddURL = [];
							}
							if (AddURL.length === undefined) {
								AddURL = Array(AddURL);
							}
							AddURLArray = AddURL;
							var urlDefault;
							for (var i = 0; i < AddURL.length; i++) {
								if (AddURL[i].DefaultUrl) {
									urlDefault = AddURL[i];
									break;
								}
							}
						}

						//adding language and alternative bus
						oResultsArray[0].AltBusinessName = oModellData.altBsnsName !== undefined ? oModellData.altBsnsName.toString() : "";
						oResultsArray[0].CommLang = (oModellData.languageRowid !== undefined && oModellData.languageRowid.code !== undefined) ?
							oModellData.languageRowid.code : "";
						oResultsArray[0].CommLangDesc = (oModellData.languageRowid !== undefined && oModellData.languageRowid.name !== undefined) ?
							oModellData.languageRowid.name : "";
							oResultsArray[0].LastDunned= Formatter.readLastDunnedDate(oResultsArray[0].LastDunned);
						var oSModel = new sap.ui.model.json.JSONModel({
							"results": oResultsArray[0],
							"N_NameAddr": oNameAddressArray,
							"N_VatData": VatDataArray,
							"N_BankDetails": BankArray,
							"N_Classif": ClassifArray,
							"N_CompContactDet": CompContactDetArray[0],
							"N_ContactPerson": ContactPersonArray,
							"N_PartnerFnct": PartnerFnctArray,
							"N_TaxClassif": TaxClassificationArray,
							"N_TextNotes": TextNotesArray,
							"N_UnloadingPoint": UnloadingPointArray,
							"N_AddFax": AddFaxArray,
							"N_AddMail": AddMailArray,
							"N_AddTelep": AddTelepArray,
							"N_AddURL": AddURLArray,
							"TaxData": TaxDataArray[0],

							"N_AddFaxDefault": FaxDefault,
							"N_AddMailDefault": MailDefault,
							"N_AddTelepDefault": TeleDefault,
							"N_AddURLDefault": urlDefault,
							"TotalAdditionalFaxs": AddFaxArray.length,
							"TotalAdditionalMails": AddMailArray.length,
							"TotalAdditionalTelephones": AddTelepArray.length,
							"TotalAdditionalURLs": AddURLArray.length,
							"TotalAdditionalVat": VatDataArray.length,
							"TotalTaxClassications": TaxClassificationArray.length
						});
						//oSModel.setSizeLimit(oResultsArray.length);
						that.getView().setModel(oSModel, "SearchDisplayModelSet");
						that.GoldenRecID();
						that.Systemfield();
						that.ExtIdentifier();
						that.CustClassification();
						that.addDisplayNewAddressRow();
						that.addRowBankDetails();
						that.addRowUnloadingPoints();
						that.addRowContactDetails();

						that.readDefaultPartnerFuncRedDisplay();
						that.createOtherPartnerFunctionModelSetDisplay();
						that.createSoldtoPartnerFunctionModelSetDisplayRead();
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		//add new address
		addDisplayNewAddressRow: function() {
			var NameAndAddress = [];
			var oReslutsData = sap.ui.getCore().getModel("searchNameAndAdressModelSet").getData();
			var oResults = oReslutsData.NameAndAddress;
			if (oResults.length === undefined) {
				oResults = Array(oResults);
			}
			for (var i = 0; i < oResults.length; i++) {
				var itemData = {
					"Country": oResults[i].Country !== undefined ? oResults[i].Country : "",
					"AddressVersion": oResults[i].Address_Version !== undefined ? oResults[i].Address_Version : "",
					"PreferredAddressVersion": oResults[i].PreferredAddressVersion !== undefined ? oResults[i].PreferredAddressVersion : "N",
					"Name1": oResults[i].Name_1 !== undefined ? oResults[i].Name_1 : "",
					"Name2": oResults[i].Name_2 !== undefined ? oResults[i].Name_2 : "",
					"Name3": oResults[i].Name_3 !== undefined ? oResults[i].Name_3 : "",
					"Name4": oResults[i].Name_4 !== undefined ? oResults[i].Name_4 : "",
					"Street1": oResults[i].Street_1 !== undefined ? oResults[i].Street_1 : "",
					"Street2": oResults[i].Street_2 !== undefined ? oResults[i].Street_2 : "",
					"Street3": oResults[i].Street_3 !== undefined ? oResults[i].Street_3 : "",
					"Street4": oResults[i].Street_4 !== undefined ? oResults[i].Street_4 : "",
					"Street5": oResults[i].Street_5 !== undefined ? oResults[i].Street_5 : "",
					"HouseNo": oResults[i].House_No !== undefined ? oResults[i].House_No : "",
					"HouseNoSupplement": oResults[i].House_No_Supplement !== undefined ? oResults[i].House_No_Supplement : "",
					"Building": oResults[i].Building !== undefined ? oResults[i].Building : "",
					"Floor": oResults[i].Floor !== undefined ? oResults[i].Floor : "",
					"Room": oResults[i].Room !== undefined ? oResults[i].Room : "",
					"PostalCode": oResults[i].Postal_Code !== undefined ? oResults[i].Postal_Code : "",
					"District": oResults[i].District !== undefined ? oResults[i].District : "",
					"City": oResults[i].City !== undefined ? oResults[i].City : "",
					"Region": oResults[i].RegionDesc !== undefined ? oResults[i].RegionDesc : "",
					"FreeTradeRegion": oResults[i].Free_Trade_Region !== undefined ? oResults[i].Free_Trade_Region : "",
					"POBoxNumber": oResults[i].PO_Box !== undefined ? oResults[i].PO_Box : "",
					"POBoxPostalCode": oResults[i].PO_Box_Code !== undefined ? oResults[i].PO_Box_Code : "",
					"POBoxCity": oResults[i].PO_Box_City !== undefined ? oResults[i].PO_Box_City : "",
					"CompanyPostalCode": oResults[i].CompanyPostalCode !== undefined ? oResults[i].CompanyPostalCode : "",
					"ByPassAddressValidation": oResults[i].ByPassAddressValidation !== undefined ? oResults[i].ByPassAddressValidation : "",
					"StreetValidation": oResults[i].StreetValidation !== undefined ? oResults[i].StreetValidation : "",
					"PoBoxValidation": oResults[i].PoBoxValidation !== undefined ? oResults[i].PoBoxValidation : ""
				};
				NameAndAddress.push(itemData);
			}

			for (var i = 0; i < NameAndAddress.length; i++) {
				NameAndAddress[i].AddCountNo = (i + 1) + " of " + (NameAndAddress.length);
				if (i === 0) {
					NameAndAddress[i].VisibleBasedOnNext = true;
				} else {
					NameAndAddress[i].VisibleBasedOnNext = false;
				}
			}
			var oNAModel = new sap.ui.model.json.JSONModel({
				"NameAndAddress": NameAndAddress
			});
			this.getView().setModel(oNAModel, "SearchDisplayNameAdressModelSet");

			this.readTaxRelatedData(oResults[0].CountryCode, oResults[0].Country);

			this.additionalVatsTaxData();
		},
		//previous NameAddress
		previosDispalyNameAndAddress: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("SearchDisplayNameAdressModelSet").getData().NameAndAddress;
			if (parseInt(selectedRow) > 0) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) - 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("previosNameAndAddressDetailsNotavailable"));
			}
			this.getView().getModel("SearchDisplayNameAdressModelSet").refresh();
			oBusyDialog.close();
		},
		//next NameAddress
		nextDisplayNameAndAddress: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("SearchDisplayNameAdressModelSet").getData().NameAndAddress;
			if (dataModel.length > parseInt(selectedRow) + 1) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) + 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("nextNameAndAddressDetailsNotavailable"));
			}
			this.getView().getModel("SearchDisplayNameAdressModelSet").refresh();
			oBusyDialog.close();
		},
		//add Row for BankDetails
		addRowBankDetails: function() {
			var BankDetails = [];
			var oReslutsData = this.getView().getModel("SearchDisplayModelSet").getData();
			var oResults = oReslutsData.N_BankDetails;
			if (oResults === undefined) {
				return;
			}
			if (oResults.length === undefined) {
				oResults = Array(oResults);
			}
			for (var i = 0; i < oResults.length; i++) {
				var itemData = {
					"IBAN": oResults[i].Iban !== undefined ? oResults[i].Iban : "",
					"Country": oResults[i].Country !== undefined ? oResults[i].Country : "",
					"Countryname": oResults[i].Countryname !== undefined ? oResults[i].Countryname : "",
					"BankKey": oResults[i].BankKey !== undefined ? oResults[i].BankKey : "",
					"BankControlKey": oResults[i].BankControlKey !== undefined ? oResults[i].BankControlKey : "",
					"BankAccount": oResults[i].BankAccount !== undefined ? oResults[i].BankAccount : "",
					"BankAccountHolder": oResults[i].AccountHolder !== undefined ? oResults[i].AccountHolder : "",
					"BankType": oResults[i].BankType !== undefined ? oResults[i].BankType : "",
					"ReferenceDetails": oResults[i].ReferenceDetails !== undefined ? oResults[i].ReferenceDetails : "",
					"CollectionAuth": oResults[i].CollectionAuth !== undefined ? oResults[i].CollectionAuth : ""
				};
				BankDetails.push(itemData);
			}
			for (var i = 0; i < BankDetails.length; i++) {
				BankDetails[i].AddCountNo = (i + 1) + " of " + (BankDetails.length);
				if (i === 0) {
					BankDetails[i].VisibleBasedOnNext = true;
				} else {
					BankDetails[i].VisibleBasedOnNext = false;
				}
			}
			var oBModel = new sap.ui.model.json.JSONModel({
				"BankDetails": BankDetails
			});
			this.getView().setModel(oBModel, "BankDetailsModelSet");
		},
		//previous BankDetails
		previosDipalyBankDetails: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("BankDetailsModelSet").getData().BankDetails;
			if (parseInt(selectedRow) > 0) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) - 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("priviosBankDetailsNotavailable"));
			}
			this.getView().getModel("BankDetailsModelSet").refresh();
			oBusyDialog.close();
		},
		//next BankDetails
		nextDisplayBankDetails: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("BankDetailsModelSet").getData().BankDetails;
			if (dataModel.length > parseInt(selectedRow) + 1) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) + 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("nextBankDetailsNotavailable"));
			}
			this.getView().getModel("BankDetailsModelSet").refresh();
			oBusyDialog.close();
		},
		//add Row for UnloadingPoints
		addRowUnloadingPoints: function() {
			var UnloadingPoints = [];
			var oReslutsData = this.getView().getModel("SearchDisplayModelSet").getData();
			var oResults = oReslutsData.N_UnloadingPoint;
			if (oResults === undefined) {
				return;
			}
			if (oResults.length === undefined) {
				oResults = Array(oResults);
			}
			for (var i = 0; i < oResults.length; i++) {
				var itemData = {
					UnloadPoint: oResults[i].UnloadPointDescr !== undefined ? oResults[i].UnloadPointDescr : "",
					GoodsReceivingHours: oResults[i].GoodsRecvngHours !== undefined ? oResults[i].GoodsRecvngHours : "",
					GoodsrecText: oResults[i].GoodsrecText !== undefined ? oResults[i].GoodsrecText : "",
					Default: oResults[i].Defab !== undefined ? oResults[i].Defab : "",
					CalendarKey: oResults[i].CalendarKey !== undefined ? oResults[i].CalendarKey : "",
					Factorycaltext: oResults[i].Factorycaltext !== undefined ? oResults[i].Factorycaltext : "",
					DayTable: [{

						Morningopen: oResults[i].Moab1 !== undefined ? oResults[i].Moab1 : "",
						Morningclose: oResults[i].Mobi1 !== undefined ? oResults[i].Mobi1 : "",
						Afternoonopen: oResults[i].Moab2 !== undefined ? oResults[i].Moab2 : "",
						Afternoonclose: oResults[i].Mobi2 !== undefined ? oResults[i].Mobi2 : "",
						Weekday: "Monday"
					}, {
						Morningopen: oResults[i].Diab1 !== undefined ? oResults[i].Diab1 : "",
						Morningclose: oResults[i].Dibi1 !== undefined ? oResults[i].Dibi1 : "",
						Afternoonopen: oResults[i].Diab2 !== undefined ? oResults[i].Diab2 : "",
						Afternoonclose: oResults[i].Dibi2 !== undefined ? oResults[i].Dibi2 : "",
						Weekday: "Tuesday"
					}, {
						Morningopen: oResults[i].Miab1 !== undefined ? oResults[i].Miab1 : "",
						Morningclose: oResults[i].Mibi1 !== undefined ? oResults[i].Mibi1 : "",
						Afternoonopen: oResults[i].Miab2 !== undefined ? oResults[i].Miab2 : "",
						Afternoonclose: oResults[i].Mibi2 !== undefined ? oResults[i].Mibi2 : "",
						Weekday: "Wednesday"
					}, {
						Morningopen: oResults[i].Doab1 !== undefined ? oResults[i].Doab1 : "",
						Morningclose: oResults[i].Dobi1 !== undefined ? oResults[i].Dobi1 : "",
						Afternoonopen: oResults[i].Doab2 !== undefined ? oResults[i].Doab2 : "",
						Afternoonclose: oResults[i].Dobi2 !== undefined ? oResults[i].Dobi2 : "",
						Weekday: "Thursday"

					}, {
						Morningopen: oResults[i].Frab1 !== undefined ? oResults[i].Frab1 : "",
						Morningclose: oResults[i].Frbi1 !== undefined ? oResults[i].Frbi1 : "",
						Afternoonopen: oResults[i].Frab2 !== undefined ? oResults[i].Frab2 : "",
						Afternoonclose: oResults[i].Frbi2 !== undefined ? oResults[i].Frbi2 : "",
						Weekday: "Friday"

					}, {
						Morningopen: oResults[i].Saab1 !== undefined ? oResults[i].Saab1 : "",
						Morningclose: oResults[i].Sabi1 !== undefined ? oResults[i].Sabi1 : "",
						Afternoonopen: oResults[i].Saab2 !== undefined ? oResults[i].Saab2 : "",
						Afternoonclose: oResults[i].Sabi2 !== undefined ? oResults[i].Sabi2 : "",
						Weekday: "Saturday"

					}, {
						Morningopen: oResults[i].Soab1 !== undefined ? oResults[i].Soab1 : "",
						Morningclose: oResults[i].Sobi1 !== undefined ? oResults[i].Sobi1 : "",
						Afternoonopen: oResults[i].Soab2 !== undefined ? oResults[i].Soab2 : "",
						Afternoonclose: oResults[i].Sobi2 !== undefined ? oResults[i].Sobi2 : "",
						Weekday: "Sunday"

					}]

				};
				UnloadingPoints.push(itemData);
			}
			for (var i = 0; i < UnloadingPoints.length; i++) {
				UnloadingPoints[i].AddCountNo = (i + 1) + " of " + (UnloadingPoints.length);
				if (i === 0) {
					UnloadingPoints[i].VisibleBasedOnNext = true;
				} else {
					UnloadingPoints[i].VisibleBasedOnNext = false;
				}
			}
			var oUModel = new sap.ui.model.json.JSONModel({
				"UnloadingPoints": UnloadingPoints
			});
			this.getView().setModel(oUModel, "UnloadingModelSet");

		},
		//previous UnloadingPints
		previosDipalyUnloadingPoints: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("UnloadingModelSet").getData().UnloadingPoints;
			if (parseInt(selectedRow) > 0) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) - 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("priviosUnloadingPointsNotavailable"));
			}
			this.getView().getModel("UnloadingModelSet").refresh();
			oBusyDialog.close();
		},
		//next UnloadingPoints
		nextDisplayUnloadingPoints: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("UnloadingModelSet").getData().UnloadingPoints;
			if (dataModel.length > parseInt(selectedRow) + 1) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) + 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("nextUnoadingPointssNotavailable"));
			}
			this.getView().getModel("UnloadingModelSet").refresh();
			oBusyDialog.close();
		},
		//add Row for ContactDetails
		addRowContactDetails: function() {
			var ContactPersons = [];
			var oReslutsData = this.getView().getModel("SearchDisplayModelSet").getData();
			var oResults = oReslutsData.N_ContactPerson;
			if (oResults === undefined) {
				return;
			}
			if (oResults.length === undefined) {
				oResults = Array(oResults);
			}
			for (var i = 0; i < oResults.length; i++) {
				var itemData = {
					"LastName": oResults[i].LastName !== undefined ? oResults[i].LastName : "",
					"Function": oResults[i].Pafkt !== undefined ? oResults[i].Pafkt : "",
					"FunctionDescription": oResults[i].ContactpersonFuncDesc !== undefined ? oResults[i].ContactpersonFuncDesc : "",
					"Telephone": oResults[i].Telephone !== undefined ? oResults[i].Telephone : "",
					"Fax": oResults[i].Fax !== undefined ? oResults[i].Fax : "",
					"MobilePhone": oResults[i].Mobile !== undefined ? oResults[i].Mobile : "",
					"Email": oResults[i].EMail !== undefined ? oResults[i].EMail : "",
					"Method": oResults[i].Method !== undefined ? oResults[i].MethodDesc : "",
					"FirstName": oResults[i].FirstName !== undefined ? oResults[i].FirstName : "",
					"Department": oResults[i].Abtnr !== undefined ? oResults[i].Abtnr : "",
					"DepartmentDescription": oResults[i].ContactpersonDeptDesc !== undefined ? oResults[i].ContactpersonDeptDesc : "",
					"TelephoneExtension": oResults[i].TelephoneExt !== undefined ? oResults[i].TelephoneExt : "",
					"FaxExtension": oResults[i].FaxExt !== undefined ? oResults[i].FaxExt : "",
					"Notes": oResults[i].Notes !== undefined ? oResults[i].Notes : "",
					"Language": oResults[i].Parla !== undefined ? oResults[i].Parla : "",
					"LanguageDesc":oResults[i].ParlaDesc !== undefined ? oResults[i].ParlaDesc : ""
				};
				ContactPersons.push(itemData);
			}
			for (var j = 0; j < ContactPersons.length; j++) {
				ContactPersons[j].AddCountNo = (j + 1) + " of " + (ContactPersons.length);
				if (j === 0) {
					ContactPersons[j].VisibleBasedOnNext = true;
				} else {
					ContactPersons[j].VisibleBasedOnNext = false;
				}
			}
			var oCDModel = new sap.ui.model.json.JSONModel({
				"ContactPersons": ContactPersons
			});
			this.getView().setModel(oCDModel, "ContactPersonDisplayModelSet");
		},
		//previous ContactDetails
		previosDipalyContactDetails: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("ContactPersonDisplayModelSet").getData().ContactPersons;
			if (parseInt(selectedRow) > 0) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) - 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("priviosContactDetailsNotavailable"));
			}
			this.getView().getModel("ContactPersonDisplayModelSet").refresh();
			oBusyDialog.close();
		},
		//next ContactDetails
		nextDisplayContactDetails: function(oEvent) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("ContactPersonDisplayModelSet").getData().ContactPersons;
			if (dataModel.length > parseInt(selectedRow) + 1) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) + 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("nextContactDetailsNotavailable"));
			}
			this.getView().getModel("ContactPersonDisplayModelSet").refresh();
			oBusyDialog.close();
		},

		onPressAddPopupTextNotes: function(oEvent) {
			this.rowSelForTextNoteCmt = oEvent.getSource().sId.split("-").pop();
			if (!this.TAD) {
				this.TAD = sap.ui.xmlfragment("MDMZCUSTOMER.fragments2.TextNotesValuePopup", this);
				this.getView().addDependent(this.TAD);
			}
			var oI = oEvent.getSource().getBindingContext("SearchDisplayModelSet").getObject("FirstLine");
			var oTArea = this.getView().getModel("SearchDisplayModelSet");
			oTArea.setProperty("/TextAreaPopup", oI);
			this.TAD.open();
		},
		onPressCancelValuePopup: function() {
			this.TAD.close();
		},
		onPressAddTelephoneFrag: function() {
			if (!this._oValueHelpDialogAddTelephone) {
				this._oValueHelpDialogAddTelephone = sap.ui.xmlfragment("MDMZCUSTOMER.fragments2.telephoneDialog", this);
				this.getView().addDependent(this._oValueHelpDialogAddTelephone);
			}
			this._oValueHelpDialogAddTelephone.open();
		},
		onPressTelephoneValueFragOk: function() {
			this._oValueHelpDialogAddTelephone.close();
		},
		onPressAddFaxFrag: function() {
			if (!this._oValueHelpDialogAddFax) {
				this._oValueHelpDialogAddFax = sap.ui.xmlfragment("MDMZCUSTOMER.fragments2.faxDialog", this);
				this.getView().addDependent(this._oValueHelpDialogAddFax);
			}
			this._oValueHelpDialogAddFax.open();
		},
		onPressFaxValueFragOk: function() {
			this._oValueHelpDialogAddFax.close();
		},
		onPressAddEmailFrag: function() {
			if (!this._oValueHelpDialogAddEmail) {
				this._oValueHelpDialogAddEmail = sap.ui.xmlfragment("MDMZCUSTOMER.fragments2.emailDialog", this);
				this.getView().addDependent(this._oValueHelpDialogAddEmail);
			}
			this._oValueHelpDialogAddEmail.open();
		},
		onPressEmailValueFragOk: function() {
			this._oValueHelpDialogAddEmail.close();
		},
		onPressAddURLFrag: function() {
			if (!this._oValueHelpDialogAddURL) {
				this._oValueHelpDialogAddURL = sap.ui.xmlfragment("MDMZCUSTOMER.fragments2.urlDialog", this);
				this.getView().addDependent(this._oValueHelpDialogAddURL);
			}
			this._oValueHelpDialogAddURL.open();
		},
		onPressURLValueFragOk: function() {
			this._oValueHelpDialogAddURL.close();
		},
		//Read Tax Related Data
		readTaxRelatedData: function(codeCnt, country) {
			var that = this;
			var dataModel = this.getView().getModel("SearchDisplayModelSet").getData().TaxData;
			var taxData = {
				"TAX_DATA": {
					"Tax_1": "",
					"Tax_2": "",
					"Tax_3": "",
					"Tax_4": "",
					"Tax_5": "",
					"VAT_Country": country,
					"VAT_Number": ""
				}

			};
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_BRM/Tax_Label_Data",
				"Request": JSON.stringify(taxData)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(response) {
					oBusyDialog.close();
					var dataOutPut = JSON.parse(response.Response);
					dataModel.Text1 = dataOutPut.MT_Tax_Data.TAX_DATA.Tax_1;
					dataModel.Text2 = dataOutPut.MT_Tax_Data.TAX_DATA.Tax_2;
					dataModel.Text3 = dataOutPut.MT_Tax_Data.TAX_DATA.Tax_3;
					dataModel.Text4 = dataOutPut.MT_Tax_Data.TAX_DATA.Tax_4;
					dataModel.Text5 = dataOutPut.MT_Tax_Data.TAX_DATA.Tax_5;
					//dataModel.VatCountKey = codeCnt;
					//dataModel.VatNum = dataOutPut.MT_Tax_Data.TAX_DATA.VAT_Number;
					that.getView().getModel("SearchDisplayModelSet").refresh();
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});
		},
		additionalVatsTaxData: function() {
			var data = {

				TaxData: {
					AdditionalVats: [],
					VatNum: "",
					VatCountKey: "",
					VatCountry: "",
					TotalAdditionalVat: ""
				}
			};
			var oReslutsData = sap.ui.getCore().getModel("searchNameAndAdressModelSet").getData();
			var oResults = oReslutsData.NameAndAddress;
			if (oResults.length === undefined) {
				oResults = Array(oResults);
			}
			var oVatDataResults = this.getView().getModel("SearchDisplayModelSet").getData().N_VatData;
			for (var v = 0; v < oVatDataResults.length; v++) {
				var countKey = oVatDataResults[v].Land1 ? oVatDataResults[v].Land1.toString().trim() : "";
				var Countryname = oVatDataResults[v].Countryname ? oVatDataResults[v].Countryname.toString().trim() : "";
				if (oResults[0] !== undefined && oResults[0].CountryCode === countKey) {
						var oModellData = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().results.BUSINESSPARTNER;
						if (oModellData === undefined) {
							oModellData = {};
						}
					data.TaxData.VatNum = oModellData.vatNumber !== undefined ? oModellData.vatNumber.toString() : "";
					data.TaxData.VatCountry = Countryname;
				} else {
					data.TaxData.AdditionalVats.push({
						"VatNum": oVatDataResults[v].Stceg ? oVatDataResults[v].Stceg.toString().trim() : "",
						"VatCountKey": countKey,
						"VatCountDesc": oVatDataResults[v].Countryname ? oVatDataResults[v].Countryname.toString().trim() : ""
					});
				}
			}
			data.TaxData.TotalAdditionalVat = data.TaxData.AdditionalVats.length;
			var oVatModel = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(oVatModel, "VatDataModelSet");
		},

		//Display Default PartnerFunction
		readDefaultPartnerFuncRedDisplay: function() {
			var partData = this.getView().getModel("SearchDisplayModelSet").getData().N_PartnerFnct;
			var otherPart = [];
			for (var i = 0; i < partData.length; i++) {
				//if (partData[i].PartnerfunctionValue === "D") {
					otherPart.push({
						PartnerFunction: partData[i].PartnerFunction,
						PartnerName: partData[i].PartnerFuncDesc,
						Number: partData[i].Kunn2 !== "" ? partData[i].Kunn2:partData[i].Kunnr,
						Name: partData[i].Vtxtm,
						PartnerDescriptionText: partData[i].PartnerDescription                         ,
						PartnerDescription: partData[i].PartnerDescription,
						Default: partData[i].Defpa
					});
			//	}
			}

			var data = {
				d: {
					results: otherPart
				}
			};
			var oODataJSONModel = new sap.ui.model.json.JSONModel({
				"results": data
			});
			this.getView().setModel(oODataJSONModel, "DefaultGeneratedPartnerFnSet");
		},

		//read from display
		createOtherPartnerFunctionModelSetDisplay: function() {
			var accountGroup = this.getView().getModel("SearchDisplayModelSet").getData().results.Ktokd;
			var partnerFunction = {
				OtherPartnerFunctions: [{
					PartnerFunction: "",
					PartnerDescription: "",
					Number: "",
					Name: "",
					PartnerDescriptionText: "",
					Default: true
				}],
				DisplayOtherPartnerFunctions: false
			};

			var partData = this.getView().getModel("SearchDisplayModelSet").getData().N_PartnerFnct;
			var otherPart = [];
			for (var i = 0; i < partData.length; i++) {
				if (partData[i].PartnerfunctionValue === "NOCOND" && accountGroup === "0001") {
					otherPart.push({
						PartnerFunction: partData[i].PartnerFunction,
						PartnerDescription: partData[i].PartnerFuncDesc,
						Number: partData[i].Kunnr,
						Name: partData[i].Vtxtm,
						PartnerDescriptionText: partData[i].PartnerDescription,
						Default: partData[i].Defpa
					});
				}
			}
			partnerFunction.OtherPartnerFunctions = otherPart;

			var modelCustomerData = new sap.ui.model.json.JSONModel(partnerFunction);
			this.getView().setModel(modelCustomerData, "OtherPartnerFunctionSet");
			if (accountGroup === "0001") {
				this.getView().getModel("OtherPartnerFunctionSet").getData().DisplayOtherPartnerFunctions = true;
				this.getView().getModel("OtherPartnerFunctionSet").refresh();
			}
		},

		//display only
		createSoldtoPartnerFunctionModelSetDisplayRead: function() {
				var accountGroup = this.getView().getModel("SearchDisplayModelSet").getData().results.Ktokd;
			var SoldtoPartnerFunction = {
				SoldtoPartnerFunctions: [{
					PartnerFunction: "",
					PartnerDescription: "",
					Number: "",
					Name: "",
					PartnerDescriptionText: "",
					Default: true
				}],
				DisplaySoldtoPartnerFunction: false
			};

			var partData = this.getView().getModel("SearchDisplayModelSet").getData().N_PartnerFnct;
			var otherPart = [];
			for (var i = 0; i < partData.length; i++) {
				if (partData[i].PartnerfunctionValue === "NOCOND" && accountGroup !== "0001") {
					otherPart.push({
						PartnerFunction: partData[i].PartnerFunction,
						PartnerDescription: partData[i].PartnerFuncDesc,
						Number: partData[i].Kunnr,
						Name: partData[i].Vtxtm,
						PartnerDescriptionText: partData[i].PartnerDescription,
						Default: partData[i].Defpa
					});
				}
			}
			SoldtoPartnerFunction.SoldtoPartnerFunctions = otherPart;

			var modelCustomerData = new sap.ui.model.json.JSONModel(SoldtoPartnerFunction);
			this.getView().setModel(modelCustomerData, "SoldtoPartnerFunctionSet");
			if (accountGroup !== "0001") {
				this.getView().getModel("SoldtoPartnerFunctionSet").getData().DisplaySoldtoPartnerFunction = true;
				this.getView().getModel("SoldtoPartnerFunctionSet").refresh();
			}
		}

	});

});
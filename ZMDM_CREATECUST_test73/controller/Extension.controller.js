sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"MDMZCUSTOMER/model/Formatter",
	"sap/ui/core/util/File"
], function(Controller, MessageBox, Formatter) {
	"use strict";

	return Controller.extend("MDMZCUSTOMER.controller.Extension", {
		onInit: function() {
			this.thatCreate = this;
			//Resubmit & Review scenario
			this.resubmitScenario = false;
			this.reviewScenario = false;
			this.approve = false;
			this.reject = false;
			this.deleteRequest = false;
			this.TaskInboxVariable = this.getOwnerComponent().getComponentData().startupParameters.TASK;
			if (this.TaskInboxVariable !== undefined) {
				this.fetchstartupParameters();
				this.checktaskStatus();
			}
			//login user Id
			var UserCode1 = "Test_MDM";
			if (window.sap.ushell.Container !== undefined) {
				UserCode1 = window.sap.ushell.Container.getUser().getId();
			}
			var modelMainUsr = new sap.ui.model.json.JSONModel({
				UserCode1: UserCode1
			});
			sap.ui.getCore().setModel(modelMainUsr, "UserInfoSet");

			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.attachRoutePatternMatched(this._handleRouteMatched, this);
			this.readCompanyCode();

			this.readCountryData();
			this.readAddressVersion();
			//this.onAccountType();
			this.onIndustryClssification1();

			this.onBanner();
			this.onBusinActivityType();
			this.onOrganizationLevel();
			this.onAccountLegalStatus();
			this.onExternalIdentType();
			this.onCommunicationLanguageGendata();
			this.taxTypeMDMCall();
			this.taxNumberTypeMDMCall();
		},
		onPressExtensionBack: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ExBussSubscription", {
				contextPath: "Back"
			}, true);
		},
		//handle route
		_handleRouteMatched: function(oEvent) {
			if (oEvent.getParameter("name") === "Extension") {
				this.TaskInboxVariable = this.getOwnerComponent().getComponentData().startupParameters.TASK;
				//this.TaskInboxVariable = undefined;
				// if (this.TaskInboxVariable === undefined) {
				var modelSearch = sap.ui.getCore().getModel("ExtSubTableModelSet");
				if (modelSearch === undefined) {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("searchCustomer", true);
					return;
				}
				// }
				this.firstTimeReadAllMethodsForChangeButton();

				//	this.readInitialDisplayOnly();
				//Resubmit & Review scenario
				if (this.TaskInboxVariable === undefined) {
					this.readDataAllTabs();
				}
				//	this.readSalesArea();
				//each time read sales area
				/*	this.oneTimeHeaderRead();
					this.readSalesArea();*/
				//set first Tab selected
				this.byId("ObjectPageLayout").setSelectedSection(this.byId("goalsSection").sId);
				//this.readDataHandleEachTimeAndAccountGrpChange();
				//Resubmit & Review scenario
				if (this.TaskInboxVariable !== undefined) {
					sap.ushell.Container.getRenderer("fiori2").hideHeaderItem("backBtn", false);
					this.displayCustomerRequestDetails();
				} else {
					this.hideReviewbtns();
				}
			}
		},

		onPressValidationExtension: function(oEvent) {
			if (this.getView().getModel("HeaderModelSet") === undefined) {
				return;
			}
			var oValModel = this.getView().getModel("HeaderModelSet").getData();
			var ApplicationID = oValModel.AppId;
			var CompanyCode = oValModel.CompnyCodeKey;
			var SalesOrg = oValModel.SalesOrgKey;
			var DistChannel = oValModel.DistribChnnlKey;
			var Division = oValModel.DivisionKey;
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var oVArray = [];
			if (ApplicationID !== "") {
				oVArray.push("Kunnr eq'" + ApplicationID + "'");
			}
			if (CompanyCode !== "") {
				oVArray.push("Bukrs eq'" + CompanyCode + "'");
			}
			if (SalesOrg !== "") {
				oVArray.push("Vkorg eq'" + SalesOrg + "'");
			}
			if (DistChannel !== "") {
				oVArray.push("Vtweg eq'" + DistChannel + "'");
			}
			if (Division !== "") {
				oVArray.push("Spart eq '" + Division + "'");
			}
			var oUrl = oVArray.join(" and ");

			var Filter1 = new sap.ui.model.Filter("URL", "EQ",
				"/RESTAdapter/Validate_CustomerExtend_SAP/ZSD_MDM_VALIDATE_CUST_EXT_SRV/InputSet?filter=" + oUrl + "");
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var dataAfterParse = JSON.parse(oData.results[0].Response);
						if (dataAfterParse.error !== undefined) {
							var oMessageValidateCustomerExtension = dataAfterParse.error.message.value;
							sap.m.MessageBox.error(oMessageValidateCustomerExtension);
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},
		firstTimeReadAllMethodsForChangeButton: function() {
			this.readTextNotesIndAllButtonbasedOnOneF4ToNextF4 = undefined;
			this.readContactPersonForChangeBtn = undefined;
			this.readAccountDataForChangeBtn = undefined;
			this.readSalesDataForChangeBtn = undefined;
			this.readStatusDataForChangeBtn = undefined;
			this.createFileUploadSection();
		},

		readDataHandleEachTimeAndAccountGrpChange: function() {
			this.readHdrAndCustBusAreaCreateEmpty();
			this.makeEptyDrowpdownDependt();
			//setting empty model for customer Data Tab
			//text Note Model Empty Bind
			this.textNoteTabInitialModelCreate();
			this.createContactDetailsTab();
			this.createFileUploadSection();
			this.createAccountyEmptyModel();
			this.createStatusDetailstab();
			this.createSalesDataTab();
		},

		oneTimeHeaderRead: function(oData) {
			var oSelValue1 = sap.ui.getCore().getModel("searchExtSubTableModelSet").getData();
			var oSelValue1Gold = sap.ui.getCore().getModel("searchTableModelSet").getData();
			// var modl = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().results.BUSINESSPARTNER;
			var oGoldenRecId = oSelValue1Gold.results;
			var system = oSelValue1.System;
			var localid = oSelValue1.LocalID;
			//header data
			var hdr = {

				CompnyCodeKey: "",
				SalesOrgKey: "",
				DistribChnnlKey: "",
				DivisionKey: "",
				System: system ? system : "",
				AccountGrpKey: oData.Ktokd ? oData.Ktokd : "",
				/*AccountGrpDesc: (modl.CUSINTIDENTIFIER !== undefined && modl.CUSINTIDENTIFIER.item !== undefined && modl.CUSINTIDENTIFIER.item.applnRoleRowid !==
						undefined && modl.CUSINTIDENTIFIER.item.applnRoleRowid.roleDescription !== undefined) ? modl.CUSINTIDENTIFIER.item.applnRoleRowid
					.roleDescription : "",*/
				AppId: localid ? localid : "",
				GoldenRecordId: oGoldenRecId ? oGoldenRecId : "",

				CompnyCodeKeyEnable: true,
				SalesOrgKeyEnable: true,
				DistribChnnlKeyEnable: true,
				DivisionKeyEnable: true,
				SystemEnable: false,
				AccountGrpKeyEnable: false,
				AppIdEnableEnable: false,

				CompnyCodeKeyValState: "None",
				SalesOrgKeyValState: "None",
				DistribChnnlKeyValState: "None",
				DivisionKeyValState: "None",
				SystemValState: "None",
				AccountGrpKeyValState: "None",
				AppIdValState: "None"
			};
			var modelMain = new sap.ui.model.json.JSONModel(hdr);
			this.getView().setModel(modelMain, "HeaderModelSet");

			var panelM = new sap.ui.model.json.JSONModel({
				BusPartDataNameAddPanel: true,
				BusPartDataTaxDataPanel: false,
				BusPartDataCustClassPanel: false,
				BusPartDataExtIdntPanel: false,
				CustDataGeneralDataPanel: false,
				CustDataBankDetailsPanel: false,
				CustDataUnloadingPointsPanel: false
			});
			this.getView().setModel(panelM, "PanelModelSet");

			//selected tab
			var tabsel = new sap.ui.model.json.JSONModel({
				SelecteIconTab: "goalsSection"
			});
			this.getView().setModel(tabsel, "TabSelectionModel");

			this.getView().byId("ID_NOTE_HDR_TXT").setText(this.i18nModel.getProperty("pleaseSelectCompnyCodeSalsArea"));
		},

		readHdrAndCustBusAreaCreateEmpty: function(Data) {
			//for duplicate check
			var modelMainDup = new sap.ui.model.json.JSONModel({
				DuplicateBtnEnable: true,
				NeedToValidateDuplicateCheck: false
			});
			this.getView().setModel(modelMainDup, "DuplicateCheckSet");

			//for SAP DATA
			var oResultsTax = Data;
			var oResultsCC = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().ExtSubDomain;
			if (oResultsCC === undefined) {
				oResultsCC = {};
			}
			var oBusPartner = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().results;
			if (oBusPartner === undefined) {
				oBusPartner = {};
			}
			var oBusPartExtIdent = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().ExtIdent;
			if (oBusPartExtIdent === undefined) {
				oBusPartExtIdent = [];
			}
			if (oBusPartExtIdent.length === undefined) {
				oBusPartExtIdent = Array(oBusPartExtIdent);
			}
			//	var oOrgnisationLevel = oBusPartner.BUSINESSPARTNER.orgLvlRowid.literalValue;
			//	var oAccountLegalStatus = oBusPartner.BUSINESSPARTNER.legalClassRowid.classification;
			var data = {
				NameAndAddress: [],
				TaxData: {
					"AdditionalVats": [],
					"TotalAdditionalVat": "0",
					"Text1": " ",
					"Text2": " ",
					"Text3": " ",
					"Text4": " ",
					"Text5": " ",
					"Text1Value": oBusPartner.BUSINESSPARTNER.taxNumber1 !== undefined ? oBusPartner.BUSINESSPARTNER.taxNumber1.toString() : "",
					"Text2Value": oBusPartner.BUSINESSPARTNER.taxNumber2 !== undefined ? oBusPartner.BUSINESSPARTNER.taxNumber2.toString() : "",
					"Text3Value": oBusPartner.BUSINESSPARTNER.taxNumber3 !== undefined ? oBusPartner.BUSINESSPARTNER.taxNumber3.toString() : "",
					"Text4Value": oBusPartner.BUSINESSPARTNER.taxNumber4 !== undefined ? oBusPartner.BUSINESSPARTNER.taxNumber4.toString() : "",
					"Text5Value": oBusPartner.BUSINESSPARTNER.taxNumber5 !== undefined ? oBusPartner.BUSINESSPARTNER.taxNumber5.toString() : "",
					"VatNum": oBusPartner.BUSINESSPARTNER.vatNumber !== undefined ? oBusPartner.BUSINESSPARTNER.vatNumber.toString() : "",
					"VatCountKey": "",
					"TaxJurisdiction_Code": oResultsTax.TaxJurisdictionCode ? oResultsTax.TaxJurisdictionCode.toString().trim() : "",
					"Taxation_Type": oBusPartner.BUSINESSPARTNER.taxTypeRowid !== undefined && oBusPartner.BUSINESSPARTNER.taxTypeRowid.code !==
						undefined ? oBusPartner.BUSINESSPARTNER.taxTypeRowid.code.toString() : "",
					"TaxNumber_Type": oBusPartner.BUSINESSPARTNER.taxNumberTypeRowid !== undefined && oBusPartner.BUSINESSPARTNER.taxNumberTypeRowid
						.code !== undefined ? oBusPartner.BUSINESSPARTNER.taxNumberTypeRowid.code.toString() : "",
					"CFOP_Category": oResultsTax.CfopCategory ? oResultsTax.CfopCategory.toString().trim() : "",
					"ICMS_Law": oResultsTax.IcmsLaw ? oResultsTax.IcmsLaw.toString().trim() : "",
					"IPI_Law": oResultsTax.IpiLaw ? oResultsTax.IpiLaw.toString().trim() : "",
					"Natural_Person": oResultsTax.NaturalPerson ? true : false,
					"salesPurchase_Tax": oResultsTax.SalesTax ? true : false,
					"Equalization_Tax": oResultsTax.EquilizationTax ? true : false,
					"ICMS_Exempt": oResultsTax.IcmsExempt ? true : false,
					"IPI_Exempt": oResultsTax.IpiExempt ? true : false,

					"TaxJurisdictionCodeMessgae": "",
					"TaxJurisdictionCodeState": "None",

					"TaxationTypeMessage": "",
					"TaxationTypeState": "None",

					"TaxNumberTypeMessage": "",
					"TaxNumberTypeState": "None",

					"CFOPCategoryMessage": "",
					"CFOPCategoryState": "None",

					"ICMSLawMessage": "",
					"ICMSLawState": "None",

					"IPILawMessage": "",
					"IPILawState": "None",
					"VatKeyStateFrag": "None",
					"VatCountKeyFrag": "",
					"VatCountDescFrag": "",
					"VatNumStateFrag": "None",
					"VatNumFrag": "",

					"UiAddressValidated": true,

					"Tax1State": "None",
					"Tax1Message": " ",
					"Tax2State": "None",
					"Tax2Message": " ",
					"Tax3State": "None",
					"Tax3Message": " ",
					"Tax4State": "None",
					"Tax4Message": " ",
					"Tax5State": "None",
					"Tax5Message": " ",
					"VatCountryViewState": "None",
					"VatCountryViewMessage": " ",
					"VatNumViewState": "None",
					"VatNumViewMessage": " ",

					"NaturalPerState": "None",
					"NaturalPerMessage": " ",
					"salesPurchase_TaxState": "None",
					"salesPurchase_TaxMessage": " ",
					"Equalization_TaxState": "None",
					"Equalization_TaxMessage": " ",
					"ICMS_ExemptState": "None",
					"ICMS_ExemptMessage": " ",
					"IPI_ExemptState": "None",
					"IPI_ExemptMessage": " "

				},
				CustomerClassification: {
					"Account_Type": oResultsCC.cusTypeRowid !== undefined ? oResultsCC.cusTypeRowid.cusType.toString().trim() : "",
					"IndustryClassification_1": oResultsCC.indstryClsfnL1Rowid !== undefined ? oResultsCC.indstryClsfnL1Rowid.rowidObject : "",
					"IndustryClassification_2": oResultsCC.indstryClsfnL2Rowid !== undefined ? oResultsCC.indstryClsfnL2Rowid.rowidObject : "",
					"Banner": oResultsCC.cusBannerRowid !== undefined ? oResultsCC.cusBannerRowid.rowidObject : "",
					"IndirectCustomer_Type": oResultsCC.indirectCusType !== undefined ? oResultsCC.indirectCusType.indirectCusType : "",
					"BusinessActivity_Type": oResultsCC.cusBsnsActvtyRowid !== undefined ? oResultsCC.cusBsnsActvtyRowid.rowidObject : "",
					"Organization_Level": oBusPartner.BUSINESSPARTNER.orgLvlRowid !== undefined ? oBusPartner.BUSINESSPARTNER.orgLvlRowid.rowidObject : "",
					"AccountLegal_Status": oBusPartner.BUSINESSPARTNER.legalClassRowid !== undefined ? oBusPartner.BUSINESSPARTNER.legalClassRowid.rowidObject : "",
					"CommercialDeal_To": oResultsCC.dealTo !== undefined && oResultsCC.dealTo === "Y" ? true : false,
					"ServiceDeal_To": oResultsCC.serviceDealTo !== undefined && oResultsCC.serviceDealTo === "Y" ? true : false,
					"Store": oResultsCC.store !== undefined && oResultsCC.store === "Y" ? true : false,

					"AccountTypeMessage": "",
					"AccountTypeState": "None",

					"IndustryClassification1Message": "",
					"IndustryClassification1State": "None",

					"IndustryClassification2Message": "",
					"IndustryClassification2State": "None",

					"BannerMessage": "",
					"BannerState": "None",

					"IndirectCustomerTypeMessage": "",
					"IndirectCustomerTypeState": "None",

					"BusinessActivityTypeMessage": "",
					"BusinessActivityTypeState": "None",

					"OrganizationLevelMessage": "",
					"OrganizationLevelState": "None",

					"AccountLegalStatusMessage": "",
					"AccountLegalStatusState": "None",
					"CommercialDeal_ToState": "None",
					"CommercialDeal_ToMessage": " ",
					"ServiceDeal_ToState": "None",
					"ServiceDeal_ToMessage": " ",
					"StoreState": "None",
					"StoreMessage": " ",

					"UiAddressValidated": true

				},
				ExternalIdentifer: {
					"ExternalIdenitir": [

					],
					"TotalExternalIdent": "0",
					"ExternalIdentifier_Type": "",
					"ExternalIdentifier_Value": "",
					"ChamberOf_Commerce": "",
					"DUNS": "",
					"Type": "",
					"DUNSRowId": "",
					"ChamberOf_CommerceRowId": "",

					"ExternalTypeStateView": "None",
					"ExternalTypeMessageView": "",

					"ExtValueMessageView": "",
					"ExtValueStateView": "None",

					"ChamberofCommerceMessage": "",
					"ChamberofCommerceState": "None",

					"DUNSMessage": "",
					"DUNSState": "None",

					"ExtIdntValue": "",
					"ExterIdtType": "",
					"ExterIdtTypeDesc": "",
					"ExternalTypeState": "None",
					"ExternalTypeValueState": "None",
					"UiAddressValidated": true
				}
			};

			//read customer classfication 2
			if (data.CustomerClassification.IndustryClassification_1 != "") {
				this.readfirstTimeIndClass2(data.CustomerClassification.IndustryClassification_1);
			}

			//for External Identifier
			data.ExternalIdentifer.ExternalIdenitir = [];
			for (var e = 0; e < oBusPartExtIdent.length; e++) {
				var type = oBusPartExtIdent[e].identifierTypeRowid !== undefined ? oBusPartExtIdent[e].identifierTypeRowid.type : "";
				if (type === "DUNS") {
					data.ExternalIdentifer.DUNS = oBusPartExtIdent[e].altIdentifier !== undefined ? oBusPartExtIdent[e].altIdentifier.toString().trim() :
						"";
					data.ExternalIdentifer.DUNSRowId = oBusPartExtIdent[e].rowidObject !== undefined ? oBusPartExtIdent[e].rowidObject :
						"";
				} else if (type === "Chamber of Commerce") {
					data.ExternalIdentifer.ChamberOf_Commerce = oBusPartExtIdent[e].altIdentifier !== undefined ? oBusPartExtIdent[e].altIdentifier.toString()
						.trim() :
						"";
					data.ExternalIdentifer.ChamberOf_CommerceRowId = oBusPartExtIdent[e].rowidObject !== undefined ? oBusPartExtIdent[e].rowidObject :
						"";
				} else {
					data.ExternalIdentifer.ExternalIdenitir.push({
						ExtIdntValue: oBusPartExtIdent[e].altIdentifier !== undefined ? oBusPartExtIdent[e].altIdentifier.toString().trim() : "",
						ExterIdtTypeDesc: type,
						ExterIdtType: oBusPartExtIdent[e].identifierTypeRowid !== undefined ? oBusPartExtIdent[e].identifierTypeRowid.rowidObject : "",
						ExterIdtRowId: oBusPartExtIdent[e].rowidObject !== undefined ? oBusPartExtIdent[e].rowidObject : ""
					});

				}
			}
			data.ExternalIdentifer.TotalExternalIdent = data.ExternalIdentifer.ExternalIdenitir.length;

			var oReslutsData = sap.ui.getCore().getModel("searchNameAndAdressModelSet").getData();
			var oResults = oReslutsData.NameAndAddress;

			if (oResults.length === undefined) {
				oResults = Array(oResults);
			}

			for (var i = 0; i < oResults.length; i++) {
				data.NameAndAddress.push({
					"AddCountNo": (i + 1) + " of " + oResults.length,
					"CONTACTrowid": oResults[i].CONTACTrowid ? oResults[i].CONTACTrowid : "",
					"Country": oResults[i].CountryCode ? oResults[i].CountryCode.toString().trim() : "",
					"Address_Version": oResults[i].Address_VersionCode ? oResults[i].Address_VersionCode.toString().trim() : "",
					"Preferred_Local_Language": oResults[i].PreferredAddressVersion,
					"Name": "",
					"Name_1": oResults[i].Name_1 ? oResults[i].Name_1.toString().trim() : "",
					"Name_2": oResults[i].Name_2 ? oResults[i].Name_2.toString().trim() : "",
					"Name_3": oResults[i].Name_3 ? oResults[i].Name_3.toString().trim() : "",
					"Name_4": oResults[i].Name_4 ? oResults[i].Name_4.toString().trim() : "",
					"Street": "",
					"Street_1": oResults[i].Street_1 ? oResults[i].Street_1.toString().trim() : "",
					"Street_2": oResults[i].Street_2 ? oResults[i].Street_2.toString().trim() : "",
					"Street_3": oResults[i].Street_3 ? oResults[i].Street_3.toString().trim() : "",
					"Street_4": oResults[i].Street_4 ? oResults[i].Street_4.toString().trim() : "",
					"Street_5": oResults[i].Street_5 ? oResults[i].Street_5.toString().trim() : "",
					"House_No": oResults[i].House_No ? oResults[i].House_No.toString().trim() : "",
					"House_No_Supplement": oResults[i].House_No_Supplement ? oResults[i].House_No_Supplement.toString().trim() : "",
					"Building": oResults[i].Building ? oResults[i].Building.toString().trim() : "",
					"Floor": oResults[i].Floor ? oResults[i].Floor.toString().trim() : "",
					"Room": oResults[i].Room ? oResults[i].Room.toString().trim() : "",
					"Postal_Code": oResults[i].Postal_Code ? oResults[i].Postal_Code.toString().trim() : "",
					"District": oResults[i].District ? oResults[i].District.toString().trim() : "",
					"City": oResults[i].City ? oResults[i].City.toString().trim() : "",
					"Region": oResults[i].Region ? oResults[i].Region.toString().trim() : "",
					"Free_Trade_Region": oResults[i].FreeTradeRegion ? oResults[i].FreeTradeRegion.toString().trim() : "",
					"PO_Box": oResults[i].PO_Box ? oResults[i].PO_Box.toString().trim() : "",
					"PO_Box_Code": oResults[i].PO_Box_Code ? oResults[i].PO_Box_Code.toString().trim() : "",
					"PO_Box_City": oResults[i].PO_Box_City ? oResults[i].PO_Box_City.toString().trim() : "",
					"Bypass_Validation": oResults[i].ByPassAddressValidation ? oResults[i].ByPassAddressValidation : false,
					"Street_Validation": oResults[i].StreetValidation ? oResults[i].StreetValidation.toString().trim() : "",
					"POBox_Validation": oResults[i].PoBoxValidation ? oResults[i].PoBoxValidation.toString().trim() : "",

					"CountryState": "None",
					"CountryMessage": " ",
					"AddrVrsState": "None",
					"AddrVrsMessage": " ",
					"PrefLangState": "None",
					"PrefLangMessage": " ",
					"Name1State": "None",
					"Name1Message": " ",
					"Name2State": "None",
					"Name2Message": " ",
					"Name3State": "None",
					"Name3Message": " ",
					"Name4State": "None",
					"Name4Message": " ",

					"Street1State": "None",
					"Street1Message": " ",
					"Street2State": "None",
					"Street2Message": " ",
					"Street3State": "None",
					"Street3Message": " ",
					"Street4State": "None",
					"Street4Message": " ",
					"Street5State": "None",
					"Street5Message": " ",
					"HouseState": "None",
					"HouseMessage": " ",
					"HouseSupState": "None",
					"HouseSupMessage": " ",

					"BuildState": "None",
					"BuildMessage": " ",

					"FloorState": "None",
					"FloorMessage": " ",

					"RoomState": "None",
					"RoomMessage": " ",

					"PostCodeState": "None",
					"PostCodeMessage": " ",

					"DistrictState": "None",
					"DistrictMessage": " ",

					"CityState": "None",
					"CityMessage": " ",

					"RegionState": "None",
					"RegionMessage": " ",

					"FreeTradeRegionState": "None",
					"FreeTradeRegionMessage": " ",

					"POBoxNumState": "None",
					"POBoxNumMessage": " ",

					"POBoxPostCodState": "None",
					"POBoxPostCodMessage": " ",

					"POBoxCityState": "None",
					"POBoxCityMessage": " ",
					"PreferedAddrsVerEnabled": oResults[i].Address_VersionCode === "I" ? false : true,
					"CountryEnabled": i === 0 ? true : false,
					"PostalCodeEnabled": i === 0 ? true : false,
					"RegionEnabled": i === 0 ? true : false,
					"FreeTradeRegionEnabled": i === 0 ? true : false,
					"POBoxNumEnabled": i === 0 ? true : false,
					"PoBoxPostCodeEnabled": i === 0 ? true : false,
					"CompPostalCodeEnabled": i === 0 ? true : false,
					"UiAddressValidated": true,

					"CompPostalCode": oResults[i].CompanyPostalCode ? oResults[i].CompanyPostalCode.toString().trim() : "",
					"CompPostalCodeState": "None",
					"CompPostalCodeMessage": "",
					"ByPassAddrsState": "None",
					"ByPassAddrsMessage": " ",
					"streetValState": "None",
					"StreetValMessage": " ",
					"PoBoxValState": "None",
					"POBoxValMessage": " ",
					"SIP_POP": oResults[i].SipPop ? oResults[i].SipPop.toString().trim() : "",
					"MatchRuleGroup": oResults[i].MatchRuleGroup ? oResults[i].MatchRuleGroup.toString().trim() : ""
				});
			}

			//vat extra
			var oVatDataResults = Data.N_VatData.results;
			for (var v = 0; v < oVatDataResults.length; v++) {
				var countKey = oVatDataResults[v].Land1 ? oVatDataResults[v].Land1.toString().trim() : "";

				if (oResults[0] !== undefined && oResults[0].CountryCode === countKey) {
					//	data.TaxData.VatNum = oVatDataResults[v].Stceg ? oVatDataResults[v].Stceg.toString().trim() : "";
					data.TaxData.VatCountKey = countKey;
				} else {
					data.TaxData.AdditionalVats.push({
						"VatNum": oVatDataResults[v].Stceg ? oVatDataResults[v].Stceg.toString().trim() : "",
						"VatCountKey": countKey,
						"VatCountDesc": oVatDataResults[v].Countryname ? oVatDataResults[v].Countryname.toString().trim() : ""
					});
				}
			}
			data.TaxData.TotalAdditionalVat = data.TaxData.AdditionalVats.length;

			var modelMain1 = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(modelMain1, "CreateModelSet");

			if (data.NameAndAddress.length > 0) {
				this.readRegionNameAddress(data.NameAndAddress[0].Country);
				this.readFreeTradeRegionNameAddress(data.NameAndAddress[0].Country);
				this.readCustomerDataTabData(data.NameAndAddress[0].Country);
				this.readTaxRelatedData(data.NameAndAddress[0].Country, oResults[0].Country ? oResults[0].Country.toString().trim() : "", false);
			}

			var statusDataTabModel = sap.ui.getCore().getModel("StatusDataTabModel");
			statusDataTabModel.getData().StatusData.DeletionBlock = false;
			this.getView().setModel(statusDataTabModel, "StatusDataTabModel");

		},

		//add new address
		addNewAddressRow: function() {
			var dataModel = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			if (dataModel.length >= 3) {
				sap.m.MessageToast.show("Maximum 3 address allowed");
				return;
			}

			//for check validated
			var errCount = 0;
			for (var i = 0; i < dataModel.length; i++) {
				if (dataModel[i].UiAddressValidated === false) {
					errCount++;
				}
			}
			if (errCount > 0) {
				this.byId("ObjectPageLayout").setSelectedSection(this.byId("goalsSection").sId);
				sap.m.MessageToast.show("Not validated all Name & Address");
				return;
			}

			//add one more row
			dataModel.push({
				"AddCountNo": "",
				"Country": dataModel[0].Country,
				"Address_Version": "",
				"Preferred_Local_Language": false,
				"Name": "",
				"Name_1": "",
				"Name_2": "",
				"Name_3": "",
				"Name_4": "",
				"Street": "",
				"Street_1": "",
				"Street_2": "",
				"Street_3": "",
				"Street_4": "",
				"Street_5": "",
				"House_No": "",
				"House_No_Supplement": "",
				"Building": "",
				"Floor": "",
				"Room": "",
				"Postal_Code": dataModel[0].Postal_Code,
				"District": "",
				"City": "",
				"Region": dataModel[0].Region,
				"Free_Trade_Region": dataModel[0].Free_Trade_Region,
				"PO_Box": dataModel[0].PO_Box,
				"PO_Box_Code": dataModel[0].PO_Box_Code,
				"PO_Box_City": "",
				"Bypass_Validation": false,
				"Street_Validation": "",
				"POBox_Validation": "",

				"CountryState": "None",
				"CountryMessage": "",
				"AddrVrsState": "None",
				"AddrVrsMessage": "",
				"PrefLangState": "None",
				"PrefLangMessage": "",
				"Name1State": "None",
				"Name1Message": "",
				"Name2State": "None",
				"Name2Message": "",
				"Name3State": "None",
				"Name3Message": "",
				"Name4State": "None",
				"Name4Message": "",

				"Street1State": "None",
				"Street1Message": "",
				"Street2State": "None",
				"Street2Message": "",
				"Street3State": "None",
				"Street3Message": "",
				"Street4State": "None",
				"Street4Message": "",
				"Street5State": "None",
				"Street5Message": "",
				"HouseState": "None",
				"HouseMessage": "",
				"HouseSupState": "None",
				"HouseSupMessage": "",

				"BuildState": "None",
				"BuildMessage": "",

				"FloorState": "None",
				"FloorMessage": "",

				"RoomState": "None",
				"RoomMessage": "",

				"PostCodeState": "None",
				"PostCodeMessage": "",

				"DistrictState": "None",
				"DistrictMessage": "",

				"CityState": "None",
				"CityMessage": "",

				"RegionState": "None",
				"RegionMessage": "",

				"FreeTradeRegionState": "None",
				"FreeTradeRegionMessage": "",

				"POBoxNumState": "None",
				"POBoxNumMessage": "",

				"POBoxPostCodState": "None",
				"POBoxPostCodMessage": "",

				"POBoxCityState": "None",
				"POBoxCityMessage": "",

				"PreferedAddrsVerEnabled": false,
				"CountryEnabled": false,
				"PostalCodeEnabled": false,
				"RegionEnabled": false,
				"FreeTradeRegionEnabled": false,
				"POBoxNumEnabled": false,
				"PoBoxPostCodeEnabled": false,
				"CompPostalCodeEnabled": false,
				"UiAddressValidated": false,

				"CompPostalCode": dataModel[0].CompPostalCode,
				"CompPostalCodeState": "None",
				"CompPostalCodeMessage": "",
				"ByPassAddrsState": "None",
				"ByPassAddrsMessage": " ",
				"streetValState": "None",
				"StreetValMessage": " ",
				"PoBoxValState": "None",
				"POBoxValMessage": " ",
				"SIP_POP": dataModel[0].SIP_POP,
				"MatchRuleGroup": dataModel[0].MatchRuleGroup
			});
			for (var i = 0; i < dataModel.length; i++) {
				dataModel[i].AddCountNo = (i + 1) + " of " + dataModel.length;
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//remove  address
		deleteAddressRow: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			if (dataModel.length === 1) {
				sap.m.MessageToast.show("One address is mandatory");
				return;
			}
			dataModel.splice(selectedRow, 1);
			for (var i = 0; i < dataModel.length; i++) {
				dataModel[i].AddCountNo = (i + 1) + " of " + dataModel.length;

				if (i === 0) {
					dataModel[i].CountryEnabled = true;
					dataModel[i].PostalCodeEnabled = true;
					dataModel[i].RegionEnabled = true;
					dataModel[i].FreeTradeRegionEnabled = true;
					dataModel[i].POBoxNumEnabled = true;
					dataModel[i].PoBoxPostCodeEnabled = true;
					dataModel[i].CompPostalCodeEnabled = true;
					if (dataModel[i].Address_Version !== "I") {
						dataModel[i].Preferred_Local_Language = true;
					}
				}
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//back to search
		onPressChnageToSearch: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ExBussSubscription", {
				contextPath: "Back"
			}, true);
		},

		//read company code
		readCompanyCode: function() {
			var that = this;
			if (this.reviewScenario === false) {
				var Filter = new sap.ui.model.Filter("URL", "EQ", "/RESTAdapter/UserAuthorization_MDM/MDMRefTable/COMPANYCODE?UserCode1=" + sap.ui
					.getCore()
					.getModel("UserInfoSet").getData().UserCode1);
			} else {
				return;
				// Filter = new sap.ui.model.Filter("URL", "EQ", "/RESTAdapter/REST_MDM/MDMRefTable/COMPANYCODE?order=companyCode");
			}
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
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
							if (that.reviewScenario === false) {
								var dataAfterParse = JSON.parse(oData.results[0].Response);
							} else {
								dataAfterParse = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							}
							if (dataAfterParse.item === undefined) {
								dataAfterParse.item = [];
							} else if (dataAfterParse.item.length === undefined) {
								dataAfterParse.item = Array(dataAfterParse.item);
							}
							dataResultArr = dataAfterParse.item;
						}

						//for start Status
						var unique = {};
						var Uniqstatus = [];
						//var obj={};
						for (var i in dataResultArr) {
							if (typeof(unique[dataResultArr[i].companyCode]) === "undefined") {
								Uniqstatus.push(dataResultArr[i]);
							}
							unique[dataResultArr[i].companyCode] = 0;
						}

						var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": Uniqstatus
						});
						oODataJSONModel.setSizeLimit(Uniqstatus.length);
						that.getView().setModel(oODataJSONModel, "CompanyCodeCombSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		// system header
		readSystemBusArea: function() {
			var that = this;
			var modelHdr = this.getView().getModel("HeaderModelSet").getData();
			var compCode = modelHdr.CompnyCodeKey.toString().trim();
			compCode = compCode ? "&CompCode=" + compCode : "";
			var salesOrg = modelHdr.SalesOrgKey.toString().trim();
			salesOrg = salesOrg ? "&SalesOrg=" + salesOrg : "";
			if (this.reviewScenario === false) {
				var Filter = new sap.ui.model.Filter("URL", "EQ", "/RESTAdapter/UserAuthorization_MDM/MDMRefTable/ITOLOGICALCOMP?UserCode1=" + sap
					.ui.getCore().getModel("UserInfoSet").getData().UserCode1 + "" + compCode + "" + salesOrg);
			} else {
				return;
				// Filter = new sap.ui.model.Filter("URL", "EQ", "/RESTAdapter/REST_MDM/MDMRefTable/ITOLOGICALCOMP?order=logicalCompId");
			}
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
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
							if (that.reviewScenario === false) {
								var dataAfterParse = JSON.parse(oData.results[0].Response);
							} else {
								dataAfterParse = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							}
							if (dataAfterParse.item === undefined) {
								dataAfterParse.item = [];
							} else if (dataAfterParse.item.length === undefined) {
								dataAfterParse.item = Array(dataAfterParse.item);
							}
							dataResultArr = dataAfterParse.item;
						}
						var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": dataResultArr
						});
						oODataJSONModel.setSizeLimit(dataResultArr.length);
						that.getView().setModel(oODataJSONModel, "SystemCombSet");
						if (dataResultArr.length > 0) {
							if (that.reviewScenario === false) {
								modelHdr.System = dataResultArr[0].logicalCompId;
							}
							that.autoPopulateSystem();
						}
						that.getView().getModel("HeaderModelSet").refresh();
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		//read Account Group
		readAccountGroup: function(system) {
			var that = this;
			system = system.toString().trim() === "" ? "" : "&System_Name=" + system.toString().trim();
			if (this.reviewScenario === false) {
				var Filter1 = new sap.ui.model.Filter("URL", "EQ", "/RESTAdapter/UserAuthorization_MDM/MDMRefTable/BPAAPPLNROLE?UserCode1=" + sap.ui
					.getCore().getModel("UserInfoSet").getData().UserCode1 + "" + system);
			} else {
				return;
				// Filter1 = new sap.ui.model.Filter("URL", "EQ", "/RESTAdapter/REST_MDM/MDMRefTable/BPAAPPLNROLE?order=roleId");
			}
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var dataResultArr = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
							dataResultArr = [];
						} else {
							if (that.reviewScenario === false) {
								var dataAfterParse = JSON.parse(oData.results[0].Response);
							} else {
								dataAfterParse = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							}
							if (dataAfterParse.item === undefined) {
								dataAfterParse.item = [];
							} else if (dataAfterParse.item.length === undefined) {
								dataAfterParse.item = Array(dataAfterParse.item);
							}
							dataResultArr = dataAfterParse.item;
						}
						var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": dataResultArr
						});
						oODataJSONModel.setSizeLimit(dataResultArr.length);
						that.getView().setModel(oODataJSONModel, "AccountGroupComboSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		//on change company code
		onSelectCompanyCode: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var modelHdr = this.getView().getModel("HeaderModelSet").getData();
			var hideModl = this.getView().getModel("AccountingDataModelSet");
			if (oEvent.getSource().getSelectedItem() !== null) {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("CompanyCodeCombSet").getObject();
				//	this.onAccountingData(selObj.companyCode, true, selObj.logicalCompId);
				//	this.onAccountingDataPaymentTerms();
				this.onAccountingData(selObj.companyCode, true, modelHdr.System);
				this.onAccountingDataPaymentMethod(selObj.companyCode, modelHdr.System);
				hideModl.getData().PaymentTerms.terms_of_payment = "";
				hideModl.getData().PaymentTerms.PaymentTermMessage = "";
				hideModl.getData().PaymentTerms.CreditMemoPayTermMessage = "";
				hideModl.getData().PaymentTerms.BeChangesPayTermMessage = "";
				modelHdr.SalesOrgKey = "";
				modelHdr.DistribChnnlKey = "";
				modelHdr.DivisionKey = "";
				/*	modelHdr.System = "";
					modelHdr.AccountGrpKey = "";*/
				hideModl.getData().AccountingDataTab.AccountingDataTabVisible = true;
				this.onPressValidationExtension(oEvent);
			} else {
				this.onAccountingDataWithOutCompanyCode("");
				//this.onAccountingDataPaymentTerms("");
				hideModl.getData().PaymentTerms.terms_of_payment = "";
				hideModl.getData().PaymentTerms.PaymentTermMessage = "";
				hideModl.getData().PaymentTerms.CreditMemoPayTermMessage = "";
				hideModl.getData().PaymentTerms.BeChangesPayTermMessage = "";
				modelHdr.SalesOrgKey = "";
				modelHdr.DistribChnnlKey = "";
				modelHdr.DivisionKey = "";
				/*	modelHdr.System = "";
					modelHdr.AccountGrpKey = "";*/
				oEvent.getSource().setValue("");
				hideModl.getData().AccountingDataTab.AccountingDataTabVisible = false;
			}
			hideModl.refresh();
			var oODataJSONModel = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oODataJSONModel, "SalesAreaComboSet");

			var oODataJSONModel1 = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oODataJSONModel1, "DivisionComboSet");

			var oODataJSONModel11 = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oODataJSONModel11, "DistbChanlComboSet");

			/*	var oODataJSONModelAcc = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModelAcc, "AccountGroupComboSet");

				var oODataJSONModelSystem = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModelSystem, "SystemCombSet");*/

			this.getView().getModel("HeaderModelSet").refresh();

			this.showMessageBasedOnHeaderSelection();
			if (this.getView().getModel("SalesDataSet") !== undefined) {
				this.getView().getModel("SalesDataSet").setData();
			}
			if (this.getView().getModel("SalesDataComboSet") !== undefined) {
				this.getView().getModel("SalesDataComboSet").setData();
			}
			if (this.getView().getModel("TaxClassificationComboSet") !== undefined) {
				this.getView().getModel("TaxClassificationComboSet").setData();
			}

			/*	//read System
				if (modelHdr.CompnyCodeKey !== "") {
					//read System
					this.readSystemBusArea();
				} else {
					this.readSalesArea();
				}*/
			/*	if (modelHdr.CompnyCodeKey !== "") {

					this.readSalesArea();
				}*/
			this.readSalesArea();
			this.readTaxClassification();
		},

		//read sales order
		readSalesArea: function() {
			var that = this;
			if (this.getView().getModel("HeaderModelSet") === undefined) {
				return;
			}
			var hdr = this.getView().getModel("HeaderModelSet").getData();
			this.getView().getModel("HeaderModelSet").refresh();
			var compCode = hdr.CompnyCodeKey.toString().trim();
			compCode = compCode ? "&CompCode='" + compCode + "'" : "";

			var system = hdr.System.toString().trim();
			system = system ? "&System_Name='" + system + "'" : "";
			if (this.reviewScenario === false) {
				var Filter = new sap.ui.model.Filter('URL', 'EQ', "/RESTAdapter/UserAuthorization_MDM/MDMRefTable/SALESORGANIZATION?UserCode1='" +
					sap.ui.getCore()
					.getModel("UserInfoSet").getData().UserCode1 + "'" + "" + compCode + "" + system);
			} else {
				return;
				// Filter = new sap.ui.model.Filter('URL', 'EQ', "/RESTAdapter/REST_MDM/MDMRefTable/SALESORGANIZATION?order=salesOrgaization");
			}
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
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
							if (that.reviewScenario === false) {
								var dataAfterParse = JSON.parse(oData.results[0].Response);
							} else {
								dataAfterParse = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							}
							if (dataAfterParse.item === undefined) {
								dataAfterParse.item = [];
							} else if (dataAfterParse.item.length === undefined) {
								dataAfterParse.item = Array(dataAfterParse.item);
							}
							dataResultArr = dataAfterParse.item;
						}
						if (dataResultArr.length === undefined) {
							var data = [];
							data.push(dataResultArr);
							dataResultArr = data;
						}

						//for start Status
						var unique = {};
						var Uniqstatus = [];
						//var obj={};
						for (var i in dataResultArr) {
							if (typeof(unique[dataResultArr[i].salesOrgaization]) === "undefined") {
								Uniqstatus.push(dataResultArr[i]);
							}
							unique[dataResultArr[i].salesOrgaization] = 0;
						}

						var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": Uniqstatus
						});
						oODataJSONModel.setSizeLimit(Uniqstatus.length);
						that.getView().setModel(oODataJSONModel, "SalesAreaComboSet");

						//Resubmit & Review scenario
						if (that.resubmitScenario === false && that.reviewScenario === false) {
							//on change sales area make empty
							var oODataJSONModel1 = new sap.ui.model.json.JSONModel({
								"results": []
							});
							oODataJSONModel1.setSizeLimit(1);
							that.getView().setModel(oODataJSONModel1, "DistbChanlComboSet");

							var oODataJSONModel2 = new sap.ui.model.json.JSONModel({
								"results": []
							});
							oODataJSONModel2.setSizeLimit(1);
							that.getView().setModel(oODataJSONModel2, "DivisionComboSet");
						} else {
							that.readDistributionChannelAndDivision();
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
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
						//Resubmit & Review scenario
						that.bindTaxRelatedData();
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
		},

		//read 
		readAddressVersion: function(url) {
			var that = this;
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ', "/RESTAdapter/REST_MDM/MDMRefTable/ADDRESSVERSION?order=addressVersionDesc");
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
						that.getView().setModel(oODataJSONModel, "AddressVersionComboSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
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

		//read Free Trade Region Region
		readFreeTradeRegionNameAddress: function(countryCode) {
			var that = this;
			this.oModel = this.getOwnerComponent().getModel("BusinessPartner");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ', "/RESTAdapter/REST_MDM/MDMRefTable/REFFREETRADEREGION?filter=cntryCode='" +
				countryCode + "'" + "&order=freeTradeRegion");
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
						that.getView().setModel(oODataJSONModel, "FreeTadeRegionBasedCountryComboSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
		},

		//validate name and address
		ValidateAddreessName: function(button) {
			var that = this;
			var nameAddressValidateModel = this.fillNameAddressModel(button);
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_MDM/CleanseNameAddress",
				"Request": JSON.stringify(nameAddressValidateModel)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(response) {
					try {
						that.validationSetAllNameAddressField(JSON.parse(response.Response).root);
					} catch (error) {
						sap.m.MessageBox.show(
							"Error while calling BPM Service", {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								onClose: function(oAction) {
									// / * do something * /
								}
							});
					}
					oBusyDialog.close();
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});
		},

		//validation set state
		validationSetAllNameAddressField: function(Data) {
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[this.SelectedRowNameAndAddrs];
			if (Data.Validation_Error === "X") {
				//for country
				if (Data.Country != "") {
					dataModelNameAndAddress.CountryState = "Error";
					dataModelNameAndAddress.CountryMessage = Data.Country;
				} else {
					dataModelNameAndAddress.CountryState = "None";
					dataModelNameAndAddress.CountryMessage = "";
				}

				//Address Version
				if (Data.Address_Version != "") {
					dataModelNameAndAddress.AddrVrsState = "Error";
					dataModelNameAndAddress.AddrVrsMessage = Data.Address_Version;
				} else {
					dataModelNameAndAddress.AddrVrsState = "None";
					dataModelNameAndAddress.AddrVrsMessage = "";
				}

				//Address Name_1
				if (Data.Name_1 != "") {
					dataModelNameAndAddress.Name1State = "Error";
					dataModelNameAndAddress.Name1Message = Data.Name_1;
				} else {
					dataModelNameAndAddress.Name1State = "None";
					dataModelNameAndAddress.Name1Message = "";
				}

				//Address Name_2
				if (Data.Name_2 != "") {
					dataModelNameAndAddress.Name2State = "Error";
					dataModelNameAndAddress.Name2Message = Data.Name_2;
				} else {
					dataModelNameAndAddress.Name2State = "None";
					dataModelNameAndAddress.Name2Message = "";
				}

				//Address Name_3
				if (Data.Name_3 != "") {
					dataModelNameAndAddress.Name3State = "Error";
					dataModelNameAndAddress.Name3Message = Data.Name_3;
				} else {
					dataModelNameAndAddress.Name3State = "None";
					dataModelNameAndAddress.Name3Message = "";
				}

				//Address Name_4
				if (Data.Name_4 != "") {
					dataModelNameAndAddress.Name4State = "Error";
					dataModelNameAndAddress.Name4Message = Data.Name_4;
				} else {
					dataModelNameAndAddress.Name4State = "None";
					dataModelNameAndAddress.Name4Message = "";
				}

				//Address  street 1
				if (Data.Street_1 != "") {
					dataModelNameAndAddress.Street1State = "Error";
					dataModelNameAndAddress.Street1Message = Data.Street_1;
				} else {
					dataModelNameAndAddress.Street1State = "None";
					dataModelNameAndAddress.Street1Message = "";
				}

				//Address  street 2
				if (Data.Street_2 != "") {
					dataModelNameAndAddress.Street2State = "Error";
					dataModelNameAndAddress.Street2Message = Data.Street_2;
				} else {
					dataModelNameAndAddress.Street2State = "None";
					dataModelNameAndAddress.Street2Message = "";
				}

				//Address  street 3
				if (Data.Street_3 != "") {
					dataModelNameAndAddress.Street3State = "Error";
					dataModelNameAndAddress.Street3Message = Data.Street_3;
				} else {
					dataModelNameAndAddress.Street3State = "None";
					dataModelNameAndAddress.Street3Message = "";
				}

				//Address  street 4
				if (Data.Street_4 != "") {
					dataModelNameAndAddress.Street4State = "Error";
					dataModelNameAndAddress.Street4Message = Data.Street_4;
				} else {
					dataModelNameAndAddress.Street4State = "None";
					dataModelNameAndAddress.Street4Message = "";
				}

				//Address  street 5
				if (Data.Street_5 != "") {
					dataModelNameAndAddress.Street5State = "Error";
					dataModelNameAndAddress.Street5Message = Data.Street_5;
				} else {
					dataModelNameAndAddress.Street5State = "None";
					dataModelNameAndAddress.Street5Message = "";
				}

				//Address  House
				if (Data.House_No != "") {
					dataModelNameAndAddress.HouseState = "Error";
					dataModelNameAndAddress.HouseMessage = Data.House_No;
				} else {
					dataModelNameAndAddress.HouseState = "None";
					dataModelNameAndAddress.HouseMessage = "";
				}

				//Address  House Suppliment
				if (Data.House_No_Supplement != "") {
					dataModelNameAndAddress.HouseSupState = "Error";
					dataModelNameAndAddress.HouseSupMessage = Data.House_No_Supplement;
				} else {
					dataModelNameAndAddress.HouseSupState = "None";
					dataModelNameAndAddress.HouseSupMessage = "";
				}

				//Address  Building
				if (Data.Building != "") {
					dataModelNameAndAddress.BuildState = "Error";
					dataModelNameAndAddress.BuildMessage = Data.Building;
				} else {
					dataModelNameAndAddress.BuildState = "None";
					dataModelNameAndAddress.BuildMessage = "";
				}

				//Address  Floor
				if (Data.Floor != "") {
					dataModelNameAndAddress.FloorState = "Error";
					dataModelNameAndAddress.FloorMessage = Data.Floor;
				} else {
					dataModelNameAndAddress.FloorState = "None";
					dataModelNameAndAddress.FloorMessage = "";
				}

				//Address  Room
				if (Data.Room != "") {
					dataModelNameAndAddress.RoomState = "Error";
					dataModelNameAndAddress.RoomMessage = Data.Room;
				} else {
					dataModelNameAndAddress.RoomState = "None";
					dataModelNameAndAddress.RoomMessage = "";
				}

				//Address  Postal_Code
				if (Data.Postal_Code != "") {
					dataModelNameAndAddress.PostCodeState = "Error";
					dataModelNameAndAddress.PostCodeMessage = Data.Postal_Code;
				} else {
					dataModelNameAndAddress.PostCodeState = "None";
					dataModelNameAndAddress.PostCodeMessage = "";
				}

				//Address  District
				if (Data.District != "") {
					dataModelNameAndAddress.DistrictState = "Error";
					dataModelNameAndAddress.DistrictMessage = Data.District;
				} else {
					dataModelNameAndAddress.DistrictState = "None";
					dataModelNameAndAddress.DistrictMessage = "";
				}

				//Address  
				if (Data.City != "") {
					dataModelNameAndAddress.CityState = "Error";
					dataModelNameAndAddress.CityMessage = Data.City;
				} else {
					dataModelNameAndAddress.CityState = "None";
					dataModelNameAndAddress.CityMessage = "";
				}

				//Address  Region
				if (Data.Region != "") {
					dataModelNameAndAddress.RegionState = "Error";
					dataModelNameAndAddress.RegionMessage = Data.Region;
				} else {
					dataModelNameAndAddress.RegionState = "None";
					dataModelNameAndAddress.RegionMessage = "";
				}

				//Free Trade Region

				//Address  PO BOX Number
				if (Data.PO_Box != "") {
					dataModelNameAndAddress.POBoxNumState = "Error";
					dataModelNameAndAddress.POBoxNumMessage = Data.PO_Box;
				} else {
					dataModelNameAndAddress.POBoxNumState = "None";
					dataModelNameAndAddress.POBoxNumMessage = "";
				}

				//Address  PO BOX Code
				if (Data.PO_Box_Code != "") {
					dataModelNameAndAddress.POBoxPostCodState = "Error";
					dataModelNameAndAddress.POBoxPostCodMessage = Data.PO_Box_Code;
				} else {
					dataModelNameAndAddress.POBoxPostCodState = "None";
					dataModelNameAndAddress.POBoxPostCodMessage = "";
				}

				//Address  PO BOX City
				if (Data.PO_Box_City != "") {
					dataModelNameAndAddress.POBoxCityState = "Error";
					dataModelNameAndAddress.POBoxCityMessage = Data.PO_Box_City;
				} else {
					dataModelNameAndAddress.POBoxCityState = "None";
					dataModelNameAndAddress.POBoxCityMessage = "";
				}

				//	sap.m.MessageToast.show("Fill All mandatory fields");
			} else {
				dataModelNameAndAddress.Country = Data.Country;
				//dataModelNameAndAddress.Address_Version = Data.Address_Version;
				//	dataModelNameAndAddress.Preferred_Local_Language= Data.;
				dataModelNameAndAddress.Name = Data.Name;
				dataModelNameAndAddress.Name_1 = Data.Name_1;
				dataModelNameAndAddress.Name_2 = Data.Name_2;
				dataModelNameAndAddress.Name_3 = Data.Name_3;
				dataModelNameAndAddress.Name_4 = Data.Name_4;
				dataModelNameAndAddress.Street = Data.Street;
				dataModelNameAndAddress.Street_1 = Data.Street_1;
				dataModelNameAndAddress.Street_2 = Data.Street_2;
				dataModelNameAndAddress.Street_3 = Data.Street_3;
				dataModelNameAndAddress.Street_4 = Data.Street_4;
				dataModelNameAndAddress.Street_5 = Data.Street_5;
				dataModelNameAndAddress.House_No = Data.House_No;
				dataModelNameAndAddress.House_No_Supplement = Data.House_No_Supplement;
				dataModelNameAndAddress.Building = Data.Building;
				dataModelNameAndAddress.Floor = Data.Floor;
				dataModelNameAndAddress.Room = Data.Room;
				dataModelNameAndAddress.Postal_Code = Data.Postal_Code;
				dataModelNameAndAddress.District = Data.District;
				dataModelNameAndAddress.City = Data.City;
				dataModelNameAndAddress.Region = Data.Region;
				//	dataModelNameAndAddress.Free_Trade_Region= Data.;
				dataModelNameAndAddress.PO_Box = Data.PO_Box;
				dataModelNameAndAddress.PO_Box_Code = Data.PO_Box_Code;
				dataModelNameAndAddress.PO_Box_City = Data.PO_Box_City;
				//	dataModelNameAndAddress.Bypass_Validation= Data.;
				dataModelNameAndAddress.Street_Validation = Data.Street_Validation;
				dataModelNameAndAddress.POBox_Validation = Data.POBox_Validation;

				dataModelNameAndAddress.CountryState = "None";
				dataModelNameAndAddress.CountryMessage = "";
				dataModelNameAndAddress.AddrVrsState = "None";
				dataModelNameAndAddress.AddrVrsMessage = "";
				dataModelNameAndAddress.PrefLangState = "None";
				dataModelNameAndAddress.PrefLangMessage = "";
				dataModelNameAndAddress.Name1State = "None";
				dataModelNameAndAddress.Name1Message = "";
				dataModelNameAndAddress.Name2State = "None";
				dataModelNameAndAddress.Name2Message = "";
				dataModelNameAndAddress.Name3State = "None";
				dataModelNameAndAddress.Name3Message = "";
				dataModelNameAndAddress.Name4State = "None";
				dataModelNameAndAddress.Name4Message = "";

				dataModelNameAndAddress.Street1State = "None";
				dataModelNameAndAddress.Street1Message = "";
				dataModelNameAndAddress.Street2State = "None";
				dataModelNameAndAddress.Street2Message = "";
				dataModelNameAndAddress.Street3State = "None";
				dataModelNameAndAddress.Street3Message = "";
				dataModelNameAndAddress.Street4State = "None";
				dataModelNameAndAddress.Street4Message = "";
				dataModelNameAndAddress.Street5State = "None";
				dataModelNameAndAddress.Street5Message = "";
				dataModelNameAndAddress.HouseState = "None";
				dataModelNameAndAddress.HouseMessage = "";
				dataModelNameAndAddress.HouseSupState = "None";
				dataModelNameAndAddress.HouseSupMessage = "";

				dataModelNameAndAddress.BuildState = "None";
				dataModelNameAndAddress.BuildMessage = "";

				dataModelNameAndAddress.FloorState = "None";
				dataModelNameAndAddress.FloorMessage = "";

				dataModelNameAndAddress.RoomState = "None";
				dataModelNameAndAddress.RoomMessage = "";

				dataModelNameAndAddress.PostCodeState = "None";
				dataModelNameAndAddress.PostCodeMessage = "";

				dataModelNameAndAddress.DistrictState = "None";
				dataModelNameAndAddress.DistrictMessage = "";

				dataModelNameAndAddress.CityState = "None";
				dataModelNameAndAddress.CityMessage = "";

				dataModelNameAndAddress.RegionState = "None";
				dataModelNameAndAddress.RegionMessage = "";

				dataModelNameAndAddress.FreeTradeRegionState = "None";
				dataModelNameAndAddress.FreeTradeRegionMessage = "";

				dataModelNameAndAddress.POBoxNumState = "None";
				dataModelNameAndAddress.POBoxNumMessage = "";

				dataModelNameAndAddress.POBoxPostCodState = "None";
				dataModelNameAndAddress.POBoxPostCodMessage = "";

				dataModelNameAndAddress.POBoxCityState = "None";
				dataModelNameAndAddress.POBoxCityMessage = "";

				//validation check is validated
				dataModelNameAndAddress.UiAddressValidated = true;

				sap.m.MessageToast.show("Validated");

				//for duplicate check validate on Change Value
				this.getView().getModel("DuplicateCheckSet").getData().DuplicateBtnEnable = true;
				this.getView().getModel("DuplicateCheckSet").getData().NeedToValidateDuplicateCheck = true;
				this.getView().getModel("DuplicateCheckSet").refresh();

				//for panel expand
				this.getView().getModel("PanelModelSet").getData().BusPartDataTaxDataPanel = true;
				this.getView().getModel("PanelModelSet").getData().BusPartDataCustClassPanel = true;
				this.getView().getModel("PanelModelSet").getData().BusPartDataExtIdntPanel = true;
				this.getView().getModel("PanelModelSet").refresh();

				//read justification
				this.readjustificationTaxData();
			}

			this.getView().getModel("CreateModelSet").refresh();
		},

		//validate name & Address Value
		fillNameAddressModel: function(oEvent) {
			//	validateNameAddressCount = buttonId.substring(buttonId.length - 1);
			//	var arrIndex = validateNameAddressCount - 1;
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			this.SelectedRowNameAndAddrs = selectedRow;
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];

			var bindingPath = "/BusinessPartner/NameAddress/" + selectedRow + "/" + "Country";

			var dataSend = {
				"root": {
					"Country": dataModelNameAndAddress.Country,
					"Address_Version": dataModelNameAndAddress.Address_Version,
					"Preferred_Local_Language": dataModelNameAndAddress.Preferred_Local_Language,
					"Name": dataModelNameAndAddress.Name,
					"Name_1": dataModelNameAndAddress.Name_1,
					"Name_2": dataModelNameAndAddress.Name_2,
					"Name_3": dataModelNameAndAddress.Name_3,
					"Name_4": dataModelNameAndAddress.Name_4,
					"Street": dataModelNameAndAddress.Street,
					"Street_1": dataModelNameAndAddress.Street_1,
					"Street_2": dataModelNameAndAddress.Street_2,
					"Street_3": dataModelNameAndAddress.Street_3,
					"Street_4": dataModelNameAndAddress.Street_4,
					"Street_5": dataModelNameAndAddress.Street_5,
					"House_No": dataModelNameAndAddress.House_No,
					"House_No_Supplement": dataModelNameAndAddress.House_No_Supplement,
					"Building": dataModelNameAndAddress.Building,
					"Floor": dataModelNameAndAddress.Floor,
					"Room": dataModelNameAndAddress.Room,
					"Postal_Code": dataModelNameAndAddress.Postal_Code,
					"District": dataModelNameAndAddress.District,
					"City": dataModelNameAndAddress.City,
					"Region": dataModelNameAndAddress.Region,
					"Free_Trade_Region": dataModelNameAndAddress.Free_Trade_Region,
					"PO_Box": dataModelNameAndAddress.PO_Box,
					"PO_Box_Code": dataModelNameAndAddress.PO_Box_Code,
					"PO_Box_City": dataModelNameAndAddress.PO_Box_City,
					"CompPostalCode": dataModelNameAndAddress.CompPostalCode,
					"Bypass_Validation": dataModelNameAndAddress.Bypass_Validation,
					"Street_Validation": dataModelNameAndAddress.Street_Validation,
					"POBox_Validation": dataModelNameAndAddress.POBox_Validation
				}
			};

			return dataSend;
		},

		//on select country change
		onSelectCountryAddressAndName: function(oEvent) {
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			var selectedObj = oEvent.getSource().getSelectedItem().getBindingContext("CountryComboSet").getObject();
			dataModelNameAndAddress.Address_Version = selectedObj.defaultAddressVersion;
			dataModelNameAndAddress.CountryState = "None";
			dataModelNameAndAddress.AddrVrsState = "None";
			//checkbox state remaning
			dataModelNameAndAddress.UiAddressValidated = false;
			if (selectedObj.defaultAddressVersion === "I") {
				dataModelNameAndAddress.PreferedAddrsVerEnabled = false;
				dataModelNameAndAddress.Preferred_Local_Language = false;
			} else if (selectedObj.defaultAddressVersion !== "I" && selectedRow === "0") {
				dataModelNameAndAddress.PreferedAddrsVerEnabled = true;
				dataModelNameAndAddress.Preferred_Local_Language = true;
			} else {
				dataModelNameAndAddress.PreferedAddrsVerEnabled = true;
				dataModelNameAndAddress.Preferred_Local_Language = false;
			}

			//for first address change copy same in below address
			var ModelNameAndAddressAll = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
				ModelNameAndAddressAll[i].Country = selectedObj.code;
				ModelNameAndAddressAll[i].Free_Trade_Region = "";
				ModelNameAndAddressAll[i].Region = "";
				ModelNameAndAddressAll[i].UiAddressValidated = false;
			}
			//based on country change call the Region and free Trade Region
			this.readRegionNameAddress(selectedObj.code);
			this.readFreeTradeRegionNameAddress(selectedObj.code);
			this.readCustomerDataTabData(selectedObj.code);
			this.readTaxRelatedData(selectedObj.code, selectedObj.englishShortName, true);
			this.getView().getModel("CreateModelSet").refresh();

			//Logic for Accounting Data Payment Method venkat
			//var oADModel = this.getView().getModel("AccountingDataModelSet").getData().PaymentData;
			if (oEvent.getSource().getSelectedItem() !== null) {
				//this.onAccountingDataPaymentMethod(selectedObj.code);
				//oADModel.PaymentMethods = "";

				//for duplicate check
				dataModelNameAndAddress.SIP_POP = selectedObj.sipPop;
				dataModelNameAndAddress.MatchRuleGroup = selectedObj.matchRuleGroup;

			} else {
				//this.onAccountingDataPaymentMethod("");
				//	oADModel.PaymentMethods = "";

				//for duplicate check
				dataModelNameAndAddress.SIP_POP = "";
				dataModelNameAndAddress.MatchRuleGroup = "";
			}
			this.getView().getModel("AccountingDataModelSet").refresh();
			this.getView().getModel("CreateModelSet").refresh();
		},

		//on select Address Version change
		onSelectAddressVersionAddressAndName: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			var selectedObj = oEvent.getSource().getSelectedItem().getBindingContext("AddressVersionComboSet").getObject();
			dataModelNameAndAddress.Address_Version = selectedObj.addressVersionCode;
			dataModelNameAndAddress.AddrVrsState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			if (selectedObj.addressVersionCode === "I") {
				dataModelNameAndAddress.PreferedAddrsVerEnabled = false;
				dataModelNameAndAddress.Preferred_Local_Language = false;
			} else if (selectedObj.addressVersionCode !== "I" && selectedRow === "0") {
				dataModelNameAndAddress.PreferedAddrsVerEnabled = true;
				//dataModelNameAndAddress.Preferred_Local_Language = true;
			} else {
				dataModelNameAndAddress.PreferedAddrsVerEnabled = true;
				dataModelNameAndAddress.Preferred_Local_Language = false;
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//prefered address change
		onChangePreferedAddressChange: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.UiAddressValidated = false;

			//check any one address is selected
			var count = 0;
			var ModelNameAndAddressAll = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
				if (ModelNameAndAddressAll[i].Preferred_Local_Language == true) {
					count++;
				}
			}
			if (count > 1) {
				sap.m.MessageToast.show("Only one Preferred Address Version selectable");
				dataModelNameAndAddress.Preferred_Local_Language = false;
			} else {
				dataModelNameAndAddress.UiAddressValidated = false;
			}

			this.getView().getModel("CreateModelSet").refresh();
		},

		//name1  
		liveChnageName1Address: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Name1State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},
		//name2  
		liveChnageName2Address: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Name2State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//name3
		liveChnageName3Address: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Name3State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//name4
		liveChnageName4Address: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Name4State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Street 1 name & Address
		liveChnageNameAddressStreet1: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Street1State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Street 2 name & Address
		liveChnageNameAddressStreet2: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Street2State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Street 3 name & Address
		liveChnageNameAddressStreet3: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Street3State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Street 4 name & Address
		liveChnageNameAddressStreet4: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Street4State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Street 5 name & Address
		liveChnageNameAddressStreet5: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.Street5State = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//House name & Address
		liveChnageNameAddressHouse: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.HouseState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//House Suppliment name & Address
		liveChnageNameAddressHouseSuppliment: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.HouseSupState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Building name & Address
		liveChnageNameAddressBuilding: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.BuildState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Floor name & Address
		liveChnageNameAddressFloor: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.FloorState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Room name & Address
		liveChnageNameAddressRoom: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.RoomState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Postal Code name & Address
		liveChnageNameAddressPostalCode: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.PostCodeState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;

			//for first address change copy same in below address
			var ModelNameAndAddressAll = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
				ModelNameAndAddressAll[i].Postal_Code = oEvent.getParameters().value;
				ModelNameAndAddressAll[i].UiAddressValidated = false;
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//District name & Address
		liveChnageNameAddressPostalDistrict: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.DistrictState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//State name & Address
		liveChnageNameAddressState: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.CityState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Region name & Address
		liveChnageNameAddressRegion: function(oEvent) {

			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.RegionState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;

			var ModelNameAndAddressAll = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
					ModelNameAndAddressAll[i].Region = "";
					ModelNameAndAddressAll[i].UiAddressValidated = false;
				}
			} else {
				//for first address change copy same in below address
				var selectedObj = oEvent.getSource().getSelectedItem().getBindingContext("RegionBasedCountryComboSet").getObject();
				for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
					ModelNameAndAddressAll[i].Region = selectedObj.cntrySubdivCode;
					ModelNameAndAddressAll[i].UiAddressValidated = false;
				}
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//Free Trade Region name & Address
		liveChnageNameAddressFreeTradeRegion: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.FreeTradeRegionState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;

			var ModelNameAndAddressAll = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				//for first address change copy same in below address
				for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
					ModelNameAndAddressAll[i].Free_Trade_Region = "";
					ModelNameAndAddressAll[i].UiAddressValidated = false;
				}
			} else {
				var selectedObj = oEvent.getSource().getSelectedItem().getBindingContext("FreeTadeRegionBasedCountryComboSet").getObject();
				for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
					ModelNameAndAddressAll[i].Free_Trade_Region = selectedObj.intFreeTradeRegionId;
					ModelNameAndAddressAll[i].UiAddressValidated = false;
				}
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//PO Box Number name & Address
		liveChnageNameAddressPOBoxNumber: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.POBoxNumState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;

			//for first address change copy same in below address
			var ModelNameAndAddressAll = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
				ModelNameAndAddressAll[i].PO_Box = oEvent.getParameters().value;
				ModelNameAndAddressAll[i].UiAddressValidated = false;
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//PO BOX Postal Code name & Address
		liveChnageNameAddressPOBoxPostalCode: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.POBoxPostCodState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			//for first address change copy same in below address
			var ModelNameAndAddressAll = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
				ModelNameAndAddressAll[i].PO_Box_Code = oEvent.getParameters().value;
				ModelNameAndAddressAll[i].UiAddressValidated = false;
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//PO Box City name & Address
		liveChnageNameAddressPOBoxCity: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.POBoxCityState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		liveChangeCompPostalCode: function(oEvent) {

			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.CompPostalCodeState = "None";
			dataModelNameAndAddress.UiAddressValidated = false;

			//for first address change copy same in below address
			var ModelNameAndAddressAll = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			for (var i = 0; i < ModelNameAndAddressAll.length; i++) {
				ModelNameAndAddressAll[i].CompPostalCode = oEvent.getParameters().value;
				ModelNameAndAddressAll[i].UiAddressValidated = false;
			}
			this.getView().getModel("CreateModelSet").refresh();

		},
		//by pass address validation 
		liveChnageNameAddressByPassValidation: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		liveChnageStreetValidation: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		liveChnagePOBoxValStateValidation: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];
			dataModelNameAndAddress.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
		},

		//on chnage icon Tab bar
		onChnageIconTabBar: function(oEvent) {
			//for check header data is entered
			var hdrModelData = this.getView().getModel("HeaderModelSet").getData();
			if (hdrModelData.SalesOrgKey
				.toString().trim() !== "" && (hdrModelData.DistribChnnlKey.toString().trim() === "" || hdrModelData.DivisionKey.toString().trim() ===
					"")) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("selectTheAllSelesAreaIncomplete"));
				this.byId("ObjectPageLayout").setSelectedSection(this.byId("goalsSection").sId);
				return;
			} else if (hdrModelData.AccountGrpKey.toString().trim() === "" || (hdrModelData.CompnyCodeKey.toString().trim() === "" && (
					hdrModelData.SalesOrgKey
					.toString().trim() === "" || hdrModelData.DistribChnnlKey.toString().trim() === "" || hdrModelData.DivisionKey.toString().trim() ===
					""))) {
				this.byId("ObjectPageLayout").setSelectedSection(this.byId("goalsSection").sId);
				sap.m.MessageToast.show(this.i18nModel.getProperty("pleaseSelectTheCompanyCodeAndOrSalesAreaAndTheAccountGroup"));
				return;
			}

			//check validated name & Address
			var errCount = 0;
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			for (var i = 0; i < dataModelNameAndAddress.length; i++) {
				if (dataModelNameAndAddress[i].UiAddressValidated === false) {
					errCount++;
				}
			}
			if (errCount > 0) {
				this.byId("ObjectPageLayout").setSelectedSection(this.byId("goalsSection").sId);
				sap.m.MessageToast.show("Not validated all Name & Address");
				return;
			}

			//for classifiction validation
			var dataModelCustClassification = this.getView().getModel("CreateModelSet").getData().CustomerClassification;
			if (dataModelCustClassification.UiAddressValidated === false) {
				this.byId("ObjectPageLayout").setSelectedSection(this.byId("goalsSection").sId);
				sap.m.MessageToast.show(this.i18nModel.getProperty("firstValidateCustomerClassificationSection"));
				return;
			}

			//for external Identifier
			var extrIdty = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
			if (extrIdty.UiAddressValidated === false) {
				if (this.externalIdentifierValidation() === "E") {
					this.byId("ObjectPageLayout").setSelectedSection(this.byId("goalsSection").sId);
					sap.m.MessageToast.show(this.i18nModel.getProperty("firstValidateEternalIdentifir"));
					return;
				}
			}

			//for tax Data
			var taxDat = this.getView().getModel("CreateModelSet").getData().TaxData;
			if (taxDat.UiAddressValidated === false) {
				this.getView().getModel("DuplicateCheckSet").getData().NeedToValidateDuplicateCheck = true;
				this.getView().getModel("DuplicateCheckSet").refresh();
				taxDat.UiAddressValidated = true;
				this.getView().getModel("CreateModelSet").refresh();
			}

			//for duplicate check validated
			// if (this.getView().getModel("DuplicateCheckSet").getData().NeedToValidateDuplicateCheck) {
			// 	//	sap.m.MessageToast.show("Need to check duplicated customer is there or not by clicking Duplicate Check button");
			// 	//Resubmit & Review scenario
			// 	if (this.reviewScenario === false) {
			// 		this.duplicateCheckButonPress();
			// 	}
			// }

			//for header enable disable
			//icon Tab Change Save
			var tabChangeMdl = this.getView().getModel("TabSelectionModel");
			tabChangeMdl.getData().SelecteIconTab = this.byId("ObjectPageLayout").getSelectedSection().split("--").pop();
			tabChangeMdl.refresh();
			var hdrModel = this.getView().getModel("HeaderModelSet").getData();
			if (tabChangeMdl.getData().SelecteIconTab === "goalsSection") {
				hdrModel.CompnyCodeKeyEnable = true;
				hdrModel.SalesOrgKeyEnable = true;
				hdrModel.DistribChnnlKeyEnable = true;
				hdrModel.DivisionKeyEnable = true;
				hdrModel.SystemEnable = false;
				hdrModel.AccountGrpKeyEnable = false;
				hdrModel.AppIdEnableEnable = false;
				this.getView().getModel("HeaderModelSet").refresh();
			} else {
				hdrModel.CompnyCodeKeyEnable = false;
				hdrModel.SalesOrgKeyEnable = false;
				hdrModel.DistribChnnlKeyEnable = false;
				hdrModel.DivisionKeyEnable = false;
				hdrModel.SystemEnable = false;
				hdrModel.AccountGrpKeyEnable = false;
				hdrModel.AppIdEnableEnable = false;
				this.getView().getModel("HeaderModelSet").refresh();
			}

			//Resubmit & Review scenario
			if (this.reviewScenario === true || this.taskStatus === "READY") {
				if (tabChangeMdl.getData().SelecteIconTab === "ID_OP_UPLOD_DOC") {
					tabChangeMdl.getData().SelecteIconTab = "";
					tabChangeMdl.refresh();
				}
			}
		},

		bindTextNoteF4ValuesBasedOnFirstF4TextNotes: function() {
			var that = this;
			var TextNoteTabData = this.getView().getModel("TextNotesModelSet").getData().TextNotes.TextNotes2;
			that.getView().getModel("textNotesLevelSet").refresh();
			var f4Data = that.getView().getModel("textNotesLevelSet").getData().results;
			for (var i = 0; i < TextNoteTabData.length; i++) {
				var oGT = [];
				for (var j = 0; j < f4Data.length; j++) {
					if (TextNoteTabData[i].Level.toString() !== "" && TextNoteTabData[i].Level.toString() === f4Data[j].Level_Text.toString()) {
						oGT = f4Data[j].NavTextType.results;
						if (oGT.length === undefined) {
							oGT = Array(oGT);
						}
					}
				}
				TextNoteTabData[i].TextTypeArray = JSON.parse(JSON.stringify(oGT));
			}
			this.getView().getModel("TextNotesModelSet").refresh();

		},

		bindTextNoteF4ValuesBasedOnFirstF4Classific: function() {
			var that = this;
			var TextNoteTabData = this.getView().getModel("TextNotesModelSet").getData().Classification.Classification2;
			that.getView().getModel("classificationTypeSet").refresh();
			var f4Data = that.getView().getModel("classificationTypeSet").getData().results;
			for (var i = 0; i < TextNoteTabData.length; i++) {
				var classic = [];
				var ValueArr = [];
				for (var j = 0; j < f4Data.length; j++) {
					if (TextNoteTabData[i].ClassificationType.toString() !== "" && TextNoteTabData[i].ClassificationType.toString() === f4Data[j].content
						.properties.ClassificationType.toString()) {
						classic = f4Data[j].link[1].inline.feed.entry;
						if (classic.length === undefined) {
							classic = Array(classic);
						}
						ValueArr = f4Data[j].link[2].inline.feed.entry;
						if (ValueArr.length === undefined) {
							ValueArr = Array(ValueArr);
						}
					}
				}
				TextNoteTabData[i].ClassiFicationArray = JSON.parse(JSON.stringify(classic));
				TextNoteTabData[i].ValueArray = JSON.parse(JSON.stringify(ValueArr));
			}
			this.getView().getModel("TextNotesModelSet").refresh();
		},

		//on after Rendering
		onAfterRendering: function() {
			this.i18nModel = this.getView().getModel("i18n");
		},

		//Read Tax Related Data
		readTaxRelatedData: function(codeCnt, country, readCountry) {
			var that = this;
			var dataModel = this.getView().getModel("CreateModelSet").getData().TaxData;
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
					if (readCountry) {
						dataModel.VatCountKey = codeCnt;
						dataModel.VatNum = dataOutPut.MT_Tax_Data.TAX_DATA.VAT_Number;
					}
					that.getView().getModel("CreateModelSet").refresh();
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});
		},

		//on change sales org 
		onChangeSalesOrgSelected: function(oEvent) {
			this.onPressValidationExtension(oEvent);
			//this.SalesDataTabVisibleModel();
			var that = this;
			oEvent.getSource().setValueState("None");
			var modelHdr = this.getView().getModel("HeaderModelSet").getData();
			if (oEvent.getSource().getSelectedItem() !== null) {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("SalesAreaComboSet").getObject();
				var data = selObj.DISTRIBUTIONCHANNEL.item;
				if (data.length === undefined) {
					var data12 = [];
					data12.push(data);
					data = data12;
				}
				var oODataJSONModel = new sap.ui.model.json.JSONModel({
					"results": data
				});
				oODataJSONModel.setSizeLimit(data.length);
				that.getView().setModel(oODataJSONModel, "DistbChanlComboSet");

				modelHdr.DistribChnnlKey = "";
				modelHdr.DivisionKey = "";
				this.getView().getModel("HeaderModelSet").refresh();

				/*	if (modelHdr.CompnyCodeKey === "") {
						modelHdr.System = "";
						modelHdr.AccountGrpKey = "";
						this.getView().getModel("HeaderModelSet").refresh();
						//empty account group and Sytem
						var oODataJSONModelAcc = new sap.ui.model.json.JSONModel({
							"results": []
						});
						this.getView().setModel(oODataJSONModelAcc, "AccountGroupComboSet");

						var oODataJSONModelSystem = new sap.ui.model.json.JSONModel({
							"results": []
						});
						this.getView().setModel(oODataJSONModelSystem, "SystemCombSet");

						//read System
						this.readSystemBusArea();
					}*/
			} else {
				modelHdr.DistribChnnlKey = "";
				modelHdr.DivisionKey = "";
				var oODataJSONModel11 = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModel11, "DivisionComboSet");

				var oODataJSONModel112 = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModel112, "DistbChanlComboSet");
				oEvent.getSource().setValue("");

				/*if (modelHdr.CompnyCodeKey === "") {
					modelHdr.System = "";
					modelHdr.AccountGrpKey = "";
					this.getView().getModel("HeaderModelSet").refresh();
					//empty account group and Sytem
					var oODataJSONModelAcc1 = new sap.ui.model.json.JSONModel({
						"results": []
					});
					this.getView().setModel(oODataJSONModelAcc1, "AccountGroupComboSet");

					var oODataJSONModelSystem1 = new sap.ui.model.json.JSONModel({
						"results": []
					});
					this.getView().setModel(oODataJSONModelSystem1, "SystemCombSet");
				}*/
			}
			this.getView().getModel("HeaderModelSet").refresh();

			//toast
			//toast message
			this.showMessageBasedOnHeaderSelection();
			if (this.getView().getModel("SalesDataSet") !== undefined) {
				this.getView().getModel("SalesDataSet").setData();
			}
			if (this.getView().getModel("SalesDataComboSet") !== undefined) {
				this.getView().getModel("SalesDataComboSet").setData();
			}
			if (this.getView().getModel("TaxClassificationComboSet") !== undefined) {
				this.getView().getModel("TaxClassificationComboSet").setData();
			}

			this.readTaxClassification();
		},

		showMessageBasedOnHeaderSelection: function() {
			var hdrData = this.getView().getModel("HeaderModelSet").getData();
			if (hdrData.CompnyCodeKey.toString().trim() === "" && (hdrData.SalesOrgKey.toString().trim() === "" || hdrData.DistribChnnlKey.toString()
					.trim() === "" || hdrData.DivisionKey.toString().trim() === "") && hdrData.AccountGrpKey.toString().trim() !== "") {
				sap.m.MessageToast.show(this.i18nModel.getProperty("pleaseSelectCompnyCodeSalsArea"));
				this.getView().byId("ID_NOTE_HDR_TXT").setText(this.i18nModel.getProperty("pleaseSelectCompnyCodeSalsArea"));
			} else if ((hdrData.CompnyCodeKey.toString().trim() !== "" || (hdrData.SalesOrgKey.toString().trim() !== "" && hdrData.DistribChnnlKey
					.toString().trim() !== "" &&
					hdrData.DivisionKey.toString().trim() !== "")) && hdrData.AccountGrpKey.toString().trim() === "") {
				this.getView().byId("ID_NOTE_HDR_TXT").setText(this.i18nModel.getProperty("pleaseSelectSalsArea"));
				sap.m.MessageToast.show(this.i18nModel.getProperty("pleaseSelectSalsArea"));
			} else if (hdrData.CompnyCodeKey.toString().trim() === "" && (hdrData.SalesOrgKey.toString().trim() === "" || hdrData.DistribChnnlKey
					.toString()
					.trim() === "" || hdrData.DivisionKey.toString().trim() === "") && hdrData.AccountGrpKey.toString()
				.trim() === "") {
				this.getView().byId("ID_NOTE_HDR_TXT").setText(this.i18nModel.getProperty(
					"pleaseSelectTheCompanyCodeAndOrSalesAreaAndTheAccountGroup"));
				sap.m.MessageToast.show(this.i18nModel.getProperty("pleaseSelectTheCompanyCodeAndOrSalesAreaAndTheAccountGroup"));
			} else {
				this.getView().byId("ID_NOTE_HDR_TXT").setText("");
			}
		},

		//read Status data
		readStatusData: function(system) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/REST_SAP/ZSD_FETCH_COMPANYCODE_DETAILS_SRV/InputHelpSet?System_Name=" + system +
				"&expand=NAVORDERBLOCK,NAVDELIVERYBLOCK,NAVBILLINGBLOCK"
			);
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var orderBlock = [];
						var deliveryBlock = [];
						var billingBlock = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {

							var dataOut = JSON.parse(oData.results[0].Response).d.results[0];
							orderBlock = dataOut.NAVORDERBLOCK.results;
							deliveryBlock = dataOut.NAVDELIVERYBLOCK.results;
							billingBlock = dataOut.NAVBILLINGBLOCK.results;

							//Resubmit & Review scenario
							that.bindStatusData();
						}
						var oODataJSONModelorderBlock = new sap.ui.model.json.JSONModel({
							"results": orderBlock
						});
						oODataJSONModelorderBlock.setSizeLimit(orderBlock.length);
						that.getView().setModel(oODataJSONModelorderBlock, "OrderBlockSDComboSet");

						var oODataJSONModdeliveryBlock = new sap.ui.model.json.JSONModel({
							"results": deliveryBlock
						});
						oODataJSONModdeliveryBlock.setSizeLimit(deliveryBlock.length);
						that.getView().setModel(oODataJSONModdeliveryBlock, "DeliveryBlockSDComboSet");

						var oODatabillingBlock = new sap.ui.model.json.JSONModel({
							"results": billingBlock
						});
						oODatabillingBlock.setSizeLimit(billingBlock.length);
						that.getView().setModel(oODatabillingBlock, "BillingBlockSDComboSet");

					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
		},

		/////////////////////////////////////////////////////////////////////////Venkat code for tax Data Custemer classification////////

		//Customer Classification Validation Button Logic
		onPressCustClassificationValidation: function(button) {
			var that = this;
			var dataModelNameCustClassification = this.getView().getModel("CreateModelSet").getData().CustomerClassification;

			var dataSend = {
				"root": {
					"Account_Type": dataModelNameCustClassification.Account_Type.toString().trim(),
					"Philips_Industry_Classification_1": dataModelNameCustClassification.IndustryClassification_1, //.toString().trim(),
					"Philips_Industry_Classification_2": dataModelNameCustClassification.IndustryClassification_2, //.toString().trim(),
					"Indirect_Customer_Type": dataModelNameCustClassification.IndirectCustomer_Type, //.toString().trim(),
					"Organization_Level": dataModelNameCustClassification.Organization_Level, //.toString().trim(),
					"Account_Legal_Status": dataModelNameCustClassification.AccountLegal_Status, //.toString().trim(),
					"Commercial_Deal_to": dataModelNameCustClassification.CommercialDeal_To,
					"Service_Deal_to": dataModelNameCustClassification.ServiceDeal_To,
					"Store": dataModelNameCustClassification.Store,
					"Validation_Error": ""
				}
			};
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_MDM/CleanseCustomerClassification",
				"Request": JSON.stringify(dataSend)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(response) {
					if (response.Response.includes("<h1>Error</h1>")) {
						var message = response.Response.split("<pre>")[1].split("</pre>")[0];
						that.errMsg(message);
					} else {
						that.validationSetAllCustClassification(JSON.parse(response.Response).root);
					}
					oBusyDialog.close();
				},
				error: function(oError) {
					oBusyDialog.close();
				}
			});

		},

		// Customer Classification validation set state

		validationSetAllCustClassification: function(Data) {
			var dataModelCustClassification = this.getView().getModel("CreateModelSet").getData().CustomerClassification;
			if (Data.Validation_Error === "X") {
				//for Account_Type
				if (Data.Account_Type !== "" && Data.Account_Type !== undefined) {
					dataModelCustClassification.AccountTypeState = "Error";
					dataModelCustClassification.AccountTypeMessage = Data.Account_Type;
				} else {
					dataModelCustClassification.AccountTypeState = "None";
					dataModelCustClassification.AccountTypeMessage = "";
				}

				//IndustryClassification_1
				if (Data.Philips_Industry_Classification_1 !== "" && Data.Philips_Industry_Classification_1 !== undefined) {
					dataModelCustClassification.IndustryClassification1State = "Error";
					dataModelCustClassification.IndustryClassification1Message = Data.Philips_Industry_Classification_1;
				} else {
					dataModelCustClassification.IndustryClassification1State = "None";
					dataModelCustClassification.IndustryClassification1Message = "";
				}

				//IndustryClassification_2
				if (Data.Philips_Industry_Classification_2 !== "" && Data.Philips_Industry_Classification_2 !== undefined) {
					dataModelCustClassification.IndustryClassification2State = "Error";
					dataModelCustClassification.IndustryClassification2Message = Data.Philips_Industry_Classification_2;
				} else {
					dataModelCustClassification.IndustryClassification2State = "None";
					dataModelCustClassification.IndustryClassification2Message = "";
				}

				//Banner
				/*if (Data.Banner != "") {
					dataModelCustClassification.BannerState = "Error";
					dataModelCustClassification.BannerMessage = Data.Banner;
				} else {
					dataModelCustClassification.BannerState = "None";
					dataModelCustClassification.BannerMessage = "";
				}*/

				//IndirectCustomer_Type
				if (Data.Indirect_Customer_Type !== "" && Data.Indirect_Customer_Type !== undefined) {
					dataModelCustClassification.IndirectCustomerTypeState = "Error";
					dataModelCustClassification.IndirectCustomerTypeMessage = Data.Indirect_Customer_Type;
				} else {
					dataModelCustClassification.IndirectCustomerTypeState = "None";
					dataModelCustClassification.IndirectCustomerTypeMessage = "";
				}

				//BusinessActivity_Type
				if (Data.BusinessActivity_Type !== "" && Data.BusinessActivity_Type !== undefined) {
					dataModelCustClassification.BusinessActivityTypeState = "Error";
					dataModelCustClassification.BusinessActivityTypeMessage = Data.BusinessActivity_Type;
				} else {
					dataModelCustClassification.BusinessActivityTypeState = "None";
					dataModelCustClassification.BusinessActivityTypeMessage = "";
				}

				//Organization_Level
				if (Data.Organization_Level !== "" && Data.Organization_Level !== undefined) {
					dataModelCustClassification.OrganizationLevelState = "Error";
					dataModelCustClassification.OrganizationLevelMessage = Data.Organization_Level;
				} else {
					dataModelCustClassification.OrganizationLevelState = "None";
					dataModelCustClassification.OrganizationLevelMessage = "";
				}

				//AccountLegal_Status
				if (Data.Account_Legal_Status !== "" && Data.Account_Legal_Status !== undefined) {
					dataModelCustClassification.AccountLegalStatusState = "Error";
					dataModelCustClassification.AccountLegalStatusMessage = Data.Account_Legal_Status;
				} else {
					dataModelCustClassification.AccountLegalStatusState = "None";
					dataModelCustClassification.AccountLegalStatusMessage = "";
				}
				//	sap.m.MessageToast.show("Fill All mandatory fields");
			} else {
				dataModelCustClassification.Account_Type = Data.Account_Type.toString().trim();
				dataModelCustClassification.IndustryClassification_1 = Data.Philips_Industry_Classification_1; //.toString().trim();
				dataModelCustClassification.IndustryClassification_2 = Data.Philips_Industry_Classification_2; //.toString().trim();
				//	dataModelCustClassification.Banner = Data.Banner;
				dataModelCustClassification.IndirectCustomer_Type = Data.Indirect_Customer_Type; //.toString().trim();
				//	dataModelCustClassification.Organization_Level = Data.Organization_Level;
				//		dataModelCustClassification.AccountLegal_Status = Data.Account_Legal_Status;
				dataModelCustClassification.CommercialDeal_To = Data.Commercial_Deal_to;
				dataModelCustClassification.ServiceDeal_To = Data.Service_Deal_to;
				dataModelCustClassification.Store = Data.Store;

				dataModelCustClassification.AccountTypeState = "None";
				dataModelCustClassification.AccountTypeMessage = "";

				dataModelCustClassification.IndustryClassification1State = "None";
				dataModelCustClassification.IndustryClassification1Message = "";

				dataModelCustClassification.IndustryClassification2State = "None";
				dataModelCustClassification.IndustryClassification2Message = "";

				dataModelCustClassification.BannerState = "None";
				dataModelCustClassification.BannerMessage = "";

				dataModelCustClassification.IndirectCustomerTypeState = "None";
				dataModelCustClassification.IndirectCustomerTypeMessage = "";

				dataModelCustClassification.BusinessActivityTypeState = "None";
				dataModelCustClassification.BusinessActivityTypeMessage = "";

				dataModelCustClassification.OrganizationLevelState = "None";
				dataModelCustClassification.OrganizationLevelMessage = "";

				dataModelCustClassification.AccountLegalStatusState = "None";
				dataModelCustClassification.AccountLegalStatusMessage = "";

				sap.m.MessageToast.show("Validated");
				dataModelCustClassification.UiAddressValidated = true;
				this.getView().getModel("DuplicateCheckSet").getData().NeedToValidateDuplicateCheck = true;
				this.getView().getModel("DuplicateCheckSet").refresh();
				this.getView().getModel("CreateModelSet").refresh();
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		//External Identifier Validation
		externalIdentifierValidation: function() {
			var that = this;
			var err = 0;
			var dataModelNameExternalIdentifier = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
			//UI Validation
			//for type
			if (dataModelNameExternalIdentifier.ExternalIdentifier_Type !== "" && dataModelNameExternalIdentifier.ExternalIdentifier_Type !==
				undefined) {
				dataModelNameExternalIdentifier.ExternalTypeStateView = "None";

				//for value
				if (dataModelNameExternalIdentifier.ExternalIdentifier_Value !== "" && dataModelNameExternalIdentifier.ExternalIdentifier_Value !==
					undefined) {
					dataModelNameExternalIdentifier.ExtValueStateView = "None";
				} else {
					dataModelNameExternalIdentifier.ExtValueStateView = "Error";
					err++;
				}
			}

			if (dataModelNameExternalIdentifier.ExternalIdentifier_Value !== "" && dataModelNameExternalIdentifier.ExternalIdentifier_Value !==
				undefined) {
				dataModelNameExternalIdentifier.ExtValueStateView = "None";
				if (dataModelNameExternalIdentifier.ExternalIdentifier_Type !== "" && dataModelNameExternalIdentifier.ExternalIdentifier_Type !==
					undefined) {
					dataModelNameExternalIdentifier.ExternalTypeStateView = "None";
				} else {
					err++;
					dataModelNameExternalIdentifier.ExternalTypeStateView = "Error";
				}
			}
			this.getView().getModel("DuplicateCheckSet").getData().NeedToValidateDuplicateCheck = true;
			this.getView().getModel("DuplicateCheckSet").refresh();
			if (err > 0) {
				this.getView().getModel("CreateModelSet").refresh();
				return "E";
			} else {
				dataModelNameExternalIdentifier.UiAddressValidated = true;
				this.getView().getModel("CreateModelSet").refresh();
				return "S";
			}

		},

		//...................Tax data....................
		taxInputData: function() {
			var that = this;
			this.getView().getModel("HeaderModelSet").refresh();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ',
				'/RESTAdapter/REST_SAP/ZSD_FETCH_COMPANYCODE_DETAILS_SRV/TaxInputSet?System_Name=' + system +
				'&expand=NAVTAXJURIDICTION,NAVTAXCOUNTRY,NAVTAXTYPE,NAVTAXNUMTYPE,NAVCFOPCAT,NAVICMSLAW,NAVIPILAW'
			);
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();

						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var oR = JSON.parse(oData.results[0].Response);
							var dataOut = oR.d.results[0];

							//Taxtion  Type
							/*	var oODataJSONModel = new sap.ui.model.json.JSONModel({
									"NAVTAXTYPE": dataOut.NAVTAXTYPE.results
								});
								oODataJSONModel.setSizeLimit(dataOut.NAVTAXTYPE.results.length);
								that.getView().setModel(oODataJSONModel, "taxationSet");*/

							//Tax Jurisdiction
							var oODataJSONModel1 = new sap.ui.model.json.JSONModel({
								"NAVTAXJURIDICTION": dataOut.NAVTAXJURIDICTION.results
							});
							oODataJSONModel1.setSizeLimit(dataOut.NAVTAXJURIDICTION.results.length);
							that.getView().setModel(oODataJSONModel1, "TaxJuridictionSet");

							//vatContryVatNumber
							var oODataJSONMode0 = new sap.ui.model.json.JSONModel({
								"NAVTAXCOUNTRY": dataOut.NAVTAXCOUNTRY.results
							});
							oODataJSONMode0.setSizeLimit(dataOut.NAVTAXCOUNTRY.results.length);
							that.getView().setModel(oODataJSONMode0, "vatDataSet");

							//tax Number Type
							/*	var oODataJSONModel2 = new sap.ui.model.json.JSONModel({
									"NAVTAXNUMTYPE": dataOut.NAVTAXNUMTYPE.results
								});
								oODataJSONModel2.setSizeLimit(dataOut.NAVTAXNUMTYPE.results.length);
								that.getView().setModel(oODataJSONModel2, "taxNumSet");*/

							//CFOP Categor
							var oODataJSONModel3 = new sap.ui.model.json.JSONModel({
								"NAVCFOPCAT": dataOut.NAVCFOPCAT.results
							});
							oODataJSONModel3.setSizeLimit(dataOut.NAVCFOPCAT.results.length);
							that.getView().setModel(oODataJSONModel3, "cfopSet");

							// ICMS Law
							var oODataJSONModel4 = new sap.ui.model.json.JSONModel({
								"NAVICMSLAW": dataOut.NAVICMSLAW.results
							});
							oODataJSONModel4.setSizeLimit(dataOut.NAVICMSLAW.results.length);
							that.getView().setModel(oODataJSONModel4, "icmsLawSet");

							//IPI-Law
							var oODataJSONModel5 = new sap.ui.model.json.JSONModel({
								"NAVIPILAW": dataOut.NAVIPILAW.results
							});
							oODataJSONModel5.setSizeLimit(dataOut.NAVIPILAW.results.length);
							that.getView().setModel(oODataJSONModel5, "ipiLawSet");
							//Resubmit & Review scenario
							that.bindTaxData();
						}
					},

					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},
		//.......................Customer Classification....................
		//Account Type	
		onAccountType: function() {

			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/CUSTYPE');

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {

						var oAccountClassficationModel = new sap.ui.model.json.JSONModel();
						oAccountClassficationModel.setData({
							AccountClassification: JSON.parse(oData.results[0].Response)

						});
						that.getView().setModel(oAccountClassficationModel, "accountClassificationSet");

					},
					error: function(oError) {
						console.log("Error!");

					}
				});
		},
		//Industry Clssification1
		onIndustryClssification1: function() {
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/CUSINDSTRYCLASFL1?order=lbl');

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {

							var dataOut = [];
							var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							if (res !== undefined) {
								if (res.item !== undefined) {
									if (res.item.length === undefined) {
										dataOut = Array(res.item);
									} else {
										dataOut = res.item;
									}
								}
							}
							var oICModel = new sap.ui.model.json.JSONModel();
							oICModel.setData({
								IndustryClassification: dataOut
							});
							oICModel.setSizeLimit(dataOut.length);
							that.getView().setModel(oICModel, "industryClassificationSet");
						}

					},
					error: function(oError) {}
				});
		},
		//Industry Clssification2
		onClassification1Change: function(oEvent) {
			var that = this;
			that.customerClassificationValidationBusPart(oEvent);
			var oModelClass = this.getView().getModel("CreateModelSet").getData();
			oModelClass.CustomerClassification.IndustryClassification_2 = "";
			if (oEvent.getSource().getSelectedItem() !== null) {
				var oClf1 = oEvent.getSource().getSelectedKey().split(" ")[0];
				//var oN = 19;
				var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/CUSINDSTRYCLASFL2?filter=cusClsfL1Rowid=' +
					oClf1 + "&order=lbl");
				var oBusyDialog = new sap.m.BusyDialog();
				oBusyDialog.open();
				this.oModel.read(
					"/BusinessPartnerSet", {
						method: "GET",
						filters: [Filter1],
						success: function(oData, oResponse) {
							oBusyDialog.close();
							if (oData.results[0].Response.includes("<h1>Error</h1>")) {
								var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
								that.errMsg(message);
							} else {

								var dataOut = [];
								var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
								if (res !== undefined) {
									if (res.item !== undefined) {
										if (res.item.length === undefined) {
											dataOut = Array(res.item);
										} else {
											dataOut = res.item;
										}
									}
								}
								var oICModel2 = new sap.ui.model.json.JSONModel();
								oICModel2.setData({
									IndustryClassification2: dataOut
								});
								oICModel2.setSizeLimit(dataOut.length);
								that.getView().setModel(oICModel2, "industryClassificationSet2");
							}
						},
						error: function(oError) {
							oBusyDialog.close();
						}
					});
			} else {
				var oCCList = this.getView().getModel("industryClassificationSet2").getData().IndustryClassification2["BaseObject.Pager"].item;
				oCCList.splice(0);
				this.getView().getModel("industryClassificationSet2").refresh();
				oEvent.getSource().setValue("");
				oModelClass.CustomerClassification.IndustryClassification_1 = "";
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		readfirstTimeIndClass2: function(oClf1) {
			//var oN = 19;data.ExternalIdentifer.TotalExternalIdent =d
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/CUSINDSTRYCLASFL2?filter=cusClsfL1Rowid=' +
				oClf1 + "&order=lbl");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataOut = [];
							var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							if (res !== undefined) {
								if (res.item !== undefined) {
									if (res.item.length === undefined) {
										dataOut = Array(res.item);
									} else {
										dataOut = res.item;
									}
								}
							}

							var oICModel2 = new sap.ui.model.json.JSONModel();
							oICModel2.setData({
								IndustryClassification2: dataOut
							});
							oICModel2.setSizeLimit(dataOut.length);
							that.getView().setModel(oICModel2, "industryClassificationSet2");
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		//Banner
		onBanner: function() {
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/CUSBANNER?order=code');

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataOut = [];
							var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							if (res !== undefined) {
								if (res.item !== undefined) {
									if (res.item.length === undefined) {
										dataOut = Array(res.item);
									} else {
										dataOut = res.item;
									}
								}
							}

							var oBannerModel = new sap.ui.model.json.JSONModel();
							oBannerModel.setData({
								Banner: dataOut

							});
							oBannerModel.setSizeLimit(dataOut.length);
							that.getView().setModel(oBannerModel, "bannerSet");
						}

					},
					error: function(oError) {
						console.log("Error!");

					}
				});

		},
		//Busin. Activity Type
		onBusinActivityType: function() {
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/CUSBSNSACTVTYTYPE?order=literalAcronym');

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataOut = [];
							var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							if (res !== undefined) {
								if (res.item !== undefined) {
									if (res.item.length === undefined) {
										dataOut = Array(res.item);
									} else {
										dataOut = res.item;
									}
								}
							}

							var oBusinessActivityModel = new sap.ui.model.json.JSONModel();
							oBusinessActivityModel.setData({
								BusinessActivity: dataOut
							});
							oBusinessActivityModel.setSizeLimit(dataOut.length);
							that.getView().setModel(oBusinessActivityModel, "businessActivitySet");
						}

					},
					error: function(oError) {

					}
				});
		},
		//	Organization Level
		onOrganizationLevel: function() {
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/BPAORGLVLET?order=literalValue');

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataOut = [];
							var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							if (res !== undefined) {
								if (res.item !== undefined) {
									if (res.item.length === undefined) {
										dataOut = Array(res.item);
									} else {
										dataOut = res.item;
									}
								}
							}

							var oOrganizationLevelModel = new sap.ui.model.json.JSONModel();
							oOrganizationLevelModel.setData({
								OrganizationLevel: dataOut

							});
							oOrganizationLevelModel.setSizeLimit(dataOut.length);
							that.getView().setModel(oOrganizationLevelModel, "organizationLevelSet");
						}

					},
					error: function(oError) {
						console.log("Error!");

					}
				});
		},

		//Account Legal Status
		onAccountLegalStatus: function() {

			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/BPALEGALCLASS?order=classification');

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataOut = [];
							var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							if (res !== undefined) {
								if (res.item !== undefined) {
									if (res.item.length === undefined) {
										dataOut = Array(res.item);
									} else {
										dataOut = res.item;
									}
								}
							}
							var oAccountLegalStatusModel = new sap.ui.model.json.JSONModel();
							oAccountLegalStatusModel.setData({
								AccountLegalStatus: dataOut
							});
							oAccountLegalStatusModel.setSizeLimit(dataOut.length);
							that.getView().setModel(oAccountLegalStatusModel, "accountLegalStatusSet");
						}
					},
					error: function(oError) {

					}
				});
		},

		//...........External Identifier..........

		//External Ident. Type
		onExternalIdentType: function() {
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/BPAIDENTIFIERTYPE?order=type');

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var oExt = JSON.parse(oData.results[0].Response)["BaseObject.Pager"].item;
							//using in  payload of submit
							that.DunsUniqRowId = "";
							that.ChemOfCommsRowId = "";
							for (var c = 0; c < oExt.length; c++) {
								if (oExt[c].type === "DUNS" || oExt[c].type === "Chamber of Commerce") {
									if (oExt[c].type === "DUNS") {
										that.DunsUniqRowId = oExt[c].rowidObject;
									} else if (oExt[c].type === "Chamber of Commerce") {
										that.ChemOfCommsRowId = oExt[c].rowidObject;
									}

									oExt.splice(c, 1);
									c = -1;
								} else {
									//oExt[c].type = "";
								}

							}

							var oExtIdentModel = new sap.ui.model.json.JSONModel();
							oExtIdentModel.setData({
								ExtIdentifier: oExt

							});
							oExtIdentModel.setSizeLimit(oExt.length);
							that.getView().setModel(oExtIdentModel, "externalIdentifierSet");
							//resubmit senario
							that.bindExternalIdentifier();
						}

					},
					error: function(oError) {
						console.log("Error!");

					}
				});
		},

		/////////////////////////////////////////////////////////////////////////end Venkat code/////////////////////////////////////

		duplicateCheckButonPress: function() {
			//first check name and Address Validated
			var errCount = 0;
			this.sendDuplicatecomment = false;
			this.keepDuplicateRecordTemp = [];
			this.readHowManyTimeCountDupCheck = 0;
			this.readHowManyTimeCountDupCheckSameGrid = 0;
			var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			var dataModelTaxData = this.getView().getModel("CreateModelSet").getData().TaxData;
			var dataModelExternalIdent = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
			for (var i = 0; i < dataModelNameAndAddress.length; i++) {
				if (dataModelNameAndAddress[i].UiAddressValidated === false) {
					errCount++;
				}
			}
			if (errCount > 0) {
				sap.m.MessageToast.show("Not validated all Name & Address");
				return;
			}
			/////

			var that = this;
			//dialog
			if (!that._oValueHelpDialogpDupCheck) {
				that._oValueHelpDialogpDupCheck = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.DuplicateCheck", that);
				that.getView().addDependent(that._oValueHelpDialogpDupCheck);

			}

			for (var i = 0; i < dataModelNameAndAddress.length; i++) {
				var duplicateCheck = {};
				duplicateCheck = {
					"Records": {
						"Name": dataModelNameAndAddress[i].Name.toString().trim(),
						"Street": dataModelNameAndAddress[i].Street.toString().trim(),
						"Address_Version": dataModelNameAndAddress[i].Address_Version.toString().trim(),
						"SIP_POP": dataModelNameAndAddress[i].SIP_POP.toString().trim(),
						"MATCH_RULE_GROUP": dataModelNameAndAddress[i].MatchRuleGroup.toString().trim(),
						"Account_Type": "Y",
						"EXT_TYPE_MATCH": "DUNS-" + dataModelExternalIdent.DUNS.toString().trim(),
						"Tax_1": dataModelTaxData.Text1Value.toString().trim(),
						"Tax_2": dataModelTaxData.VatNum.toString().trim(),
						"House_Number": dataModelNameAndAddress[i].House_No.toString().trim(),
						"City": dataModelNameAndAddress[i].City.toString().trim(),
						"Country": dataModelNameAndAddress[i].Country.toString().trim(),
						"Region": dataModelNameAndAddress[i].Region.toString().trim(),
						"District": dataModelNameAndAddress[i].District.toString().trim(),
						"Po_Box": dataModelNameAndAddress[i].PO_Box.toString().trim(),
						"Building": dataModelNameAndAddress[i].Building.toString().trim(),
						"Floor": dataModelNameAndAddress[i].Floor.toString().trim(),
						"Po_Box_Postal_Code": dataModelNameAndAddress[i].PO_Box_Code.toString().trim(),
						"Po_Box_City": dataModelNameAndAddress[i].PO_Box_City.toString().trim(),
						"Postal_Code": dataModelNameAndAddress[i].Postal_Code.toString().trim(),
						"Room": dataModelNameAndAddress[i].Room.toString().trim(),
						"Building_code": ""
							//"Building_code": dataModelNameAndAddress[i].Building.toString().trim() //soumyadip told not required
					}
				};

				that.repitNeedToCallDuplicateCheck(duplicateCheck, dataModelNameAndAddress.length);
			}

		},

		repitNeedToCallDuplicateCheck: function(duplicateCheck, lengNameAddress) {

			var that = this;
			that.goldenIdForDupceckRead = "";
			that.goldenIdForDupceckReadRowObj = "";
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_MDM/DuplicateCheck",
				"Request": JSON.stringify(duplicateCheck)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(response) {
					oBusyDialog.close();
					that.readHowManyTimeCountDupCheckSameGrid++;
					if (response.Response.includes("<h1>Error</h1>")) {
						var message = response.Response.split("<pre>")[1].split("</pre>")[0];
						that.errMsg(message);
						that.byId("ObjectPageLayout").setSelectedSection(this.byId("goalsSection").sId);
					} else {
						var dataOutPut = JSON.parse(response.Response);
						that.getView().getModel("DuplicateCheckSet").getData().NeedToValidateDuplicateCheck = false;
						that.getView().getModel("DuplicateCheckSet").refresh();

						//for duplicate check done no need to open once again
						var taxDat = that.getView().getModel("CreateModelSet").getData().TaxData;
						var ExtIdent = that.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
						taxDat.UiAddressValidated = true;
						ExtIdent.UiAddressValidated = true;
						that.getView().getModel("CreateModelSet").refresh();

						var dataArray = [];
						if (dataOutPut.searchMatchReturn.record !== undefined && dataOutPut.searchMatchReturn.record.length === undefined &&
							dataOutPut
							.searchMatchReturn.record.field.length > 0) {
							dataOutPut.searchMatchReturn.record = Array(dataOutPut.searchMatchReturn.record);
						}
						if (dataOutPut.searchMatchReturn.record !== undefined && dataOutPut.searchMatchReturn.record.length > 0) {
							var hdrArray = dataOutPut.searchMatchReturn.record;
							for (var i = 0; i < hdrArray.length; i++) {
								var obj = {};
								for (var j = 0; j < hdrArray[i].field.length; j++) {
									obj[hdrArray[i].field[j].name] = hdrArray[i].field[j].stringValue;
								}
								dataArray.push(obj);
							}
						} else if (dataOutPut.searchMatchReturn.message !== undefined) {
							that.readHowManyTimeCountDupCheck++;
							if (that.readHowManyTimeCountDupCheck === lengNameAddress) {
								sap.m.MessageToast.show(dataOutPut.searchMatchReturn.message);
							}
							return;
						}

						var tempArr = [];
						var countdup = 0;
						for (var r = 0; r < dataArray.length; r++) {
							countdup = 0;
							for (var h = 0; h < that.keepDuplicateRecordTemp.length; h++) {
								if (that.keepDuplicateRecordTemp[h].ROWID_OBJECT.toString().trim() === dataArray[r].ROWID_OBJECT.toString().trim()) {
									countdup++;
								}
							}
							if (countdup === 0) {
								tempArr.push(dataArray[r]);
							}
						}

						for (var k = 0; k < tempArr.length; k++) {
							that.keepDuplicateRecordTemp.push(tempArr[k]);
						}

						//delete current duplicate Value according to Grid
						that.afterdupSingleRecordRemove = [];
						var goldenId = that.getView().getModel("HeaderModelSet").getData().GoldenRecordId;
						if (goldenId !== undefined && goldenId !== "") {
							for (var rhb = 0; rhb < that.keepDuplicateRecordTemp.length; rhb++) {
								if (goldenId.toString().trim() === that.keepDuplicateRecordTemp[rhb].BSNS_PRTNR_ID.toString().trim()) {
									//delete that.keepDuplicateRecordTemp[rhb];
								} else {
									that.afterdupSingleRecordRemove.push(that.keepDuplicateRecordTemp[rhb]);
								}
							}
							if (that.afterdupSingleRecordRemove.length === 0 && that.readHowManyTimeCountDupCheckSameGrid === lengNameAddress) {
								var msg = that.i18nModel.getProperty("duplicateCheckMsgForNotFoundSameGrid");
								sap.m.MessageToast.show(msg);
								return;
							} else if (that.afterdupSingleRecordRemove.length === 0) {
								return;
							}
						} else {
							for (var rhb = 0; rhb < that.keepDuplicateRecordTemp.length; rhb++) {
								that.afterdupSingleRecordRemove.push(that.keepDuplicateRecordTemp[rhb]);
							}
						}

						if (that.afterdupSingleRecordRemove.length > 0) {
							that.sendDuplicatecomment = true;
						} else {
							that.sendDuplicatecomment = false;
						}

						var modelMain = new sap.ui.model.json.JSONModel({
							"results": that.afterdupSingleRecordRemove
						});

						that._oValueHelpDialogpDupCheck.setModel(modelMain, "DuplCheckTableDataSet");
						that._oValueHelpDialogpDupCheck.open();
					}

				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});
		},

		onSelctChangedupCust: function(oEvent) {
			var selctObj = oEvent.getParameters().listItem.getBindingContext("DuplCheckTableDataSet").getObject();
			this.goldenIdForDupceckRead = selctObj.BSNS_PRTNR_ID.toString();
			this.goldenIdForDupceckReadRowObj = selctObj.ROWID_OBJECT.toString();
			var oSTModel = new sap.ui.model.json.JSONModel({
				"results": this.goldenIdForDupceckRead,
				"GoldenRowIdObj": this.goldenIdForDupceckReadRowObj,
				"EditOrOpen": "EDIT"
			});
			sap.ui.getCore().setModel(oSTModel, "searchTableModelSet");
		},
		HandleChangeCustomerDuplicate: function() {
			var that = this;
			if (this.goldenIdForDupceckRead !== "") {
				var msg = this.getView().getModel("i18n").getProperty("EnteredDataLossDupCheckmsg");
				sap.m.MessageBox.confirm(msg, {
					title: "Confirm", // default
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					styleClass: "sapUiSizeCompact", // default
					onClose: function(val) {
						if (val === "YES") {
							that._oValueHelpDialogpDupCheck.close();
							var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter.navTo("ExBussSubscription", {
								contextPath: "Next"
							}, true);
						}
					}
				});
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("selectOneCombinationTochangeDuplicateValue"));
				return;
			}
		},
		HandleNewustomerDuplicate: function() {
			var that = this;
			if (!that._oValueHelpDialogpDupCheckComment) {
				that._oValueHelpDialogpDupCheckComment = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.DuplicateCheckComent", that);
				that.getView().addDependent(that._oValueHelpDialogpDupCheckComment);

			}
			var commetModel = new sap.ui.model.json.JSONModel({
				"Comment": "",
				"CommentMsgState": "None"
			});
			that._oValueHelpDialogpDupCheckComment.setModel(commetModel, "CommentModelSet");
			that._oValueHelpDialogpDupCheckComment.open();

		},
		liveChangeDuplicateCheckComment: function(Oevent) {
			Oevent.getSource().setValueState("None");
		},
		HandleOkCustomerDuplicate: function() {
			var cmtModel = this._oValueHelpDialogpDupCheckComment.getModel("CommentModelSet").getData();
			if (cmtModel.Comment === undefined || cmtModel.Comment.trim() === "") {
				cmtModel.CommentMsgState = "Error";
				this._oValueHelpDialogpDupCheckComment.getModel("CommentModelSet").refresh();
			} else {
				this._oValueHelpDialogpDupCheck.close();
				this._oValueHelpDialogpDupCheckComment.close();
			}
		},
		HandleCancelDuplicate: function() {
			this._oValueHelpDialogpDupCheckComment.close();
		},

		onCancelRequest: function() {
			var that = this;
			sap.m.MessageBox.confirm("Are you sure you want to cancel the request?", {
				title: "Confirm", // default
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				styleClass: "sapUiSizeCompact", // default
				onClose: function(val) {
					if (val === "YES") {
						/*	var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("searchCustomer", true);*/
						window.location.href = '#Shell-home';
					}
				}

			});

		},

		//live change Tax1Value
		liveChangeTax1Value: function(oEvent) {
			var data = this.getView().getModel("CreateModelSet").getData().NameAndAddress;
			var val = oEvent.getParameters().value;
			//Israel, Norway or Switzerland;
			/*if (data[0].Country === "IL" || data[0].Country === "NO" || data[0].Country === "CH") {
				this.getView().getModel("CreateModelSet").getData().TaxData.VatContNum[0].VatNum = val;
			}*/
			this.taxDataValidationBusPartner(oEvent);
			this.getView().getModel("CreateModelSet").refresh();
		},

		//live change TaxValue2
		liveChangeTax2Value: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//live change TaxValue3
		liveChangeTax3Value: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//live change TaxValue4
		liveChangeTax4Value: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//live change TaxValue5
		liveChangeTax5Value: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//vat Country
		onChangeCountryTaxDatBusPart: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},
		//vat Country Fragment
		onChangeCountryTaxDatBusPartFrag: function(oEvent) {
			if (oEvent.getSource().getSelectedItem() !== null) {
				var dat = oEvent.getSource().getSelectedItem().getBindingContext("vatDataSet").getObject();
				if (dat.Land1 !== "") {
					var TaxData = this.getView().getModel("CreateModelSet").getData().TaxData;
					TaxData.VatCountDescFrag = dat.Landx;
					this.getView().getModel("CreateModelSet").refresh();
				}
			} else {
				oEvent.getSource().setValue("");
			}
			this.taxDataValidationBusPartner(oEvent);
		},

		//vat number
		onChangeVatNumTaxDataBusPart: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//vat number Frament
		onChangeVatNumTaxDataBusPartFrag: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//add button Fragment
		addClassificationCustTypeAdd: function(oEvent) {
			var newArray = [];
			var tableArray = [];
			var TaxData = this.getView().getModel("CreateModelSet").getData().TaxData;
			tableArray = TaxData.AdditionalVats;
			var itemData = {
				"VatCountKey": TaxData.VatCountKeyFrag,
				"VatNum": TaxData.VatNumFrag
			};
			newArray.push(itemData);
			var oVCountry = "";
			var oVNumber = "";
			for (var c = 0; c < tableArray.length; c++) {
				oVCountry = tableArray[c].VatCountKey;
				oVNumber = tableArray[c].VatNum;
				if (newArray[0].VatCountKey === oVCountry && newArray[0].VatNum === oVNumber) {
					sap.m.MessageToast.show(this.i18nModel.getProperty("DuplicateEntriesNotAllowed"));
					return;
				}
			}

			if (TaxData.VatCountKey === TaxData.VatCountKeyFrag) {
				TaxData.VatKeyStateFrag = "Error";
				sap.m.MessageToast.show(this.i18nModel.getProperty("thisCountryNotAllowToSelectAllReadyPresentInView"));
				TaxData.VatCountKeyFrag = "";
				TaxData.VatNumFrag = "";
				this.getView().getModel("CreateModelSet").refresh();
				return;
			}

			//TaxData.UiAddressValidated = false;

			if (TaxData.VatCountKeyFrag !== "" && TaxData.VatCountKeyFrag !== undefined && TaxData.VatNumFrag !== "" && TaxData.VatNumFrag !==
				undefined) {
				//selected value dont allow select view country key
				if (TaxData.VatCountKey !== "" && TaxData.VatCountKey !== undefined && TaxData.VatCountKey === TaxData.VatCountKeyFrag) {
					TaxData.VatKeyStateFrag = "Error";
					sap.m.MessageToast.show(this.i18nModel.getProperty("thisCountryNotAllowToSelectAllReadyPresentInView"));
					TaxData.VatCountKey = "";
					/*TaxData.VatCountKeyFrag = "";
					TaxData.VatNumFrag = "";*/
					this.getView().getModel("CreateModelSet").refresh();
					return;
				}

				if (TaxData.AdditionalVats.length < 7) {
					TaxData.AdditionalVats.push({
						VatCountKey: TaxData.VatCountKeyFrag,
						VatCountDesc: TaxData.VatCountDescFrag,
						VatNum: TaxData.VatNumFrag
					});
				} else {
					sap.m.MessageToast.show(this.i18nModel.getProperty("maximum7AdditionalVatsallowed"));
				}
				TaxData.VatKeyStateFrag = "None";
				TaxData.VatCountKeyFrag = "";
				TaxData.VatNumStateFrag = "None";
				TaxData.VatNumFrag = "";
			} else {
				if (TaxData.VatCountKeyFrag !== "" && TaxData.VatCountKeyFrag !== undefined) {
					TaxData.VatKeyStateFrag = "None";
				} else {
					TaxData.VatKeyStateFrag = "Error";
				}

				if (TaxData.VatNumFrag !== "" && TaxData.VatNumFrag !== undefined) {
					TaxData.VatNumStateFrag = "None";
				} else {
					TaxData.VatNumStateFrag = "Error";
				}
			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		onSelectTableVatCoutryNum: function(oEvent) {
			/*	var selRowObj = this.getView().getModel("CreateModelSet").getData().TaxData.AdditionalVats[oEvent.getParameters().listItem.sId.split(
					"-").pop()];
				if (oEvent.getSource().getSelectedContexts().length > 0) {
					selRowObj.Selected = true;
				} else {
					selRowObj.Selected = false;
				}
				this.getView().getModel("CreateModelSet").refresh();*/

		},
		//delete frag row
		addClassificationCustTypeDelete: function(oEvent) {
			//	this.taxDataValidationBusPartner(oEvent);
			var countDel = 0;
			var TaxData = this.getView().getModel("CreateModelSet").getData().TaxData;
			TaxData.UiAddressValidated = false;
			for (var i = 0; i < TaxData.AdditionalVats.length; i++) {
				if (TaxData.AdditionalVats[i].Selected === true) {
					TaxData.AdditionalVats[i].Delete = "X";
					countDel++;
				} else {
					TaxData.AdditionalVats[i].Selected = false;
				}
			}

			if (countDel > 0) {
				var array = [];
				var a = JSON.stringify(TaxData.AdditionalVats);
				var data = JSON.parse(a);
				for (var j = 0; j < data.length; j++) {
					if (data[j].Delete !== "X") {
						array.push(data[j]);
					}
				}
				TaxData.AdditionalVats = array;
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("selectRowTodeleteForAll"));
			}

			this.getView().getModel("CreateModelSet").refresh();
		},

		//Tax Juristication
		liveChangeTaxJurisdictionCodeTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//Taxation
		onChangeTaxationTypeTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//Tax Number Type
		onChangeTaxNumberTypeTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//CPFO
		onChangeCPFOCatTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//ICMS LOW
		onChangeICMSLowTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//IPI LOW
		onChangeIPILOwTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//natural person
		onSelectNaturalPersonTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},
		//sales Pur Tax
		onSelectSalesPurTaxTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},
		//Equalization Tax
		onSelectEqualizationTaxTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//ICMS
		onSelectICMS_ExemptTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},

		//IPI-Exempt
		onSelectIPI_EXPmptTaxData: function(oEvent) {
			this.taxDataValidationBusPartner(oEvent);
		},
		taxDataValidationBusPartner: function(oEvent) {
			var TaxData = this.getView().getModel("CreateModelSet").getData().TaxData;
			TaxData.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
			oEvent.getSource().setValueState("None");
			//	oEvent.getSource().setValueStateText("");
		},

		//customer classification validation
		customerClassificationValidationBusPart: function(oEvent) {
			var TaxData = this.getView().getModel("CreateModelSet").getData().CustomerClassification;
			TaxData.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
			oEvent.getSource().setValueState("None");
			//	oEvent.getSource().setValueStateText("");
		},

		//Account Type
		changeAccountTypeClassification: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//Industry Classifi. 2
		liveChangeCustomerClassific2Class: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		///Banner
		liveChangeBannerClassfic: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//Indirect Customer Type
		liveChnageIndirectCustomerTypeClassFic: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//Busin. Activity Type
		liveChangebusnActivityTypeClassFic: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//Organization Level
		liveChangeOrganizationLevelClassFic: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//Account Legal Status
		liveChangeAccountLegalStatusClass: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//Commercial Deal-to
		liveChangeCommercialDealTo: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
		},
		//Service Deal-to
		liveChangeServiceDealTo: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
		},
		//Store
		liveChangeStoreClass: function(oEvent) {
			this.customerClassificationValidationBusPart(oEvent);
		},

		//validation for external Identier in Bus Part Tab
		validationExternalIdentifierBusPartTab: function(oEvent) {
			var TaxData = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
			TaxData.UiAddressValidated = false;
			this.getView().getModel("CreateModelSet").refresh();
			oEvent.getSource().setValueState("None");
			//	oEvent.getSource().setValueStateText("");
		},

		//add button Fragment external Identifier
		addExternalIdentifirTypeAddFrag: function(oEvent) {
			//	this.taxDataValidationBusPartner(oEvent);
			var TaxData = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
			//TaxData.UiAddressValidated = false;
			var newArray = [];
			var tableArray = [];
			tableArray = TaxData.ExternalIdenitir;
			var itemData = {
				"ExterIdtType": TaxData.ExterIdtType,
				"ExtIdntValue": TaxData.ExtIdntValue
			};
			newArray.push(itemData);
			var oEType = "";
			var oEValue = "";
			for (var c = 0; c < tableArray.length; c++) {
				oEType = tableArray[c].ExterIdtType;
				oEValue = tableArray[c].ExtIdntValue;
				if (newArray[0].ExterIdtType === oEType && newArray[0].ExtIdntValue === oEValue) {
					sap.m.MessageToast.show(this.i18nModel.getProperty("DuplicateEntriesNotAllowed"));
					return;
				}
			}

			if (TaxData.ExterIdtType !== "" && TaxData.ExterIdtType !== undefined && TaxData.ExtIdntValue !== "" && TaxData.ExtIdntValue !==
				undefined) {
				if (TaxData.ExternalIdenitir.length < 7) {
					TaxData.ExternalIdenitir.push({
						ExterIdtType: TaxData.ExterIdtType,
						ExterIdtTypeDesc: TaxData.ExterIdtTypeDesc,
						ExtIdntValue: TaxData.ExtIdntValue
					});
				} else {
					sap.m.MessageToast.show(this.i18nModel.getProperty("maximum7AdditionalExternalIdentifiersallowed"));
				}
				TaxData.ExternalTypeState = "None";
				TaxData.ExterIdtType = "";
				TaxData.ExternalTypeValueState = "None";
				TaxData.ExtIdntValue = "";
			} else {
				if (TaxData.ExterIdtType !== "" && TaxData.ExterIdtType !== undefined) {
					TaxData.ExternalTypeState = "None";
				} else {
					TaxData.ExternalTypeState = "Error";
				}

				if (TaxData.ExtIdntValue !== "" && TaxData.ExtIdntValue !== undefined) {
					TaxData.ExternalTypeValueState = "None";
				} else {
					TaxData.ExternalTypeValueState = "Error";
				}

			}
			this.getView().getModel("CreateModelSet").refresh();
		},

		onSelectTableExternalIdentFrag: function(oEvent) {
			/*var selRowObj = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer.ExternalIdenitir[oEvent.getParameters().listItem
				.sId.split("-").pop()];
			if (oEvent.getSource().getSelectedContexts().length > 0) {
				selRowObj.Selected = true;
			} else {
				selRowObj.Selected = false;
			}
			this.getView().getModel("CreateModelSet").refresh();*/

		},
		//delete frag row
		addExternalIdentifirTypeDeleteFrag: function(oEvent) {
			//	this.taxDataValidationBusPartner(oEvent);
			var countDel = 0;
			var TaxData = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
			TaxData.UiAddressValidated = false;
			for (var i = 0; i < TaxData.ExternalIdenitir.length; i++) {
				if (TaxData.ExternalIdenitir[i].Selected === true) {
					TaxData.ExternalIdenitir[i].Delete = "X";
					countDel++;
				} else {
					TaxData.ExternalIdenitir[i].Selected = false;
				}
			}

			if (countDel > 0) {
				var array = [];
				var a = JSON.stringify(TaxData.ExternalIdenitir);
				var data = JSON.parse(a);
				for (var j = 0; j < data.length; j++) {
					if (data[j].Delete !== "X") {
						array.push(data[j]);
					}
				}
				TaxData.ExternalIdenitir = array;
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("selectRowTodeleteForAll"));
			}

			this.getView().getModel("CreateModelSet").refresh();
		},

		//Chamber Of Commerce
		liveChangeChamberOfCommerceExternIden: function(oEvent) {
			this.validationExternalIdentifierBusPartTab(oEvent);
			var dataModelNameExternalIdentifier = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
			dataModelNameExternalIdentifier.ChamberofCommerceMessage = "";
			dataModelNameExternalIdentifier.ChamberofCommerceState = "None";
			dataModelNameExternalIdentifier.DUNSMessage = "";
			dataModelNameExternalIdentifier.DUNSState = "None";
			this.getView().getModel("CreateModelSet").refresh();
		},

		//DUNS
		liveChangeDunsExternIdent: function(oEvent) {
			this.validationExternalIdentifierBusPartTab(oEvent);
			var dataModelNameExternalIdentifier = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
			dataModelNameExternalIdentifier.ChamberofCommerceMessage = "";
			dataModelNameExternalIdentifier.ChamberofCommerceState = "None";
			dataModelNameExternalIdentifier.DUNSMessage = "";
			dataModelNameExternalIdentifier.DUNSState = "None";
			this.getView().getModel("CreateModelSet").refresh();
		},
		//External Identifier Type
		liveChangeExternalIdentType: function(oEvent) {
			this.validationExternalIdentifierBusPartTab(oEvent);
		},

		//view
		liveChangeExternalIdentTypeView: function(oEvent) {
			this.validationExternalIdentifierBusPartTab(oEvent);
		},

		//External Identifier Type Frag
		liveChangeExternalIdentTypeFrag: function(oEvent) {
			this.validationExternalIdentifierBusPartTab(oEvent);
			if (oEvent.getSource().getSelectedItem() !== null) {
				var dat = oEvent.getSource().getSelectedItem().getBindingContext("externalIdentifierSet").getObject();
				if (dat.type !== "") {
					var TaxData = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
					TaxData.ExterIdtTypeDesc = dat.type;
					this.getView().getModel("CreateModelSet").refresh();
				}
			} else {
				oEvent.getSource().setValue("");
			}
		},

		//view
		liveChangeExternalIdentTypeValueView: function(oEvent) {
			this.validationExternalIdentifierBusPartTab(oEvent);
		},

		//External Identifier Value
		liveChangeExternalIdentTypeValue: function(oEvent) {
			this.validationExternalIdentifierBusPartTab(oEvent);
		},
		//External Identifier Value  frag
		liveChangeExternalIdentTypeValueFrag: function(oEvent) {
			this.validationExternalIdentifierBusPartTab(oEvent);
		},
		//read 
		readjustificationTaxData: function() {
			var that = this;
			this.getView().getModel("HeaderModelSet").refresh();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			var data = this.getView().getModel("CreateModelSet").getData().NameAndAddress[0];
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/Tax_Jurisdiction/Validation?System_Name=" + system + "&filter=Country eq'" + data.Country + "' and Region eq '" +
				data.Region +
				"' and Postalcode eq '" + data.Postal_Code + "'");
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
							return;
						} else if (JSON.parse(oData.results[0].Response).error !== undefined) {
							sap.m.MessageToast.show(JSON.parse(oData.results[0].Response).error.message.value);
						} else {
							var data1 = JSON.parse(oData.results[0].Response);
							var taxJud = "";
							var taxData = that.getView().getModel("CreateModelSet").getData().TaxData;
							taxData.TaxJurisdiction_Code = taxJud;
							that.getView().getModel("CreateModelSet").refresh();
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		//on Press vat country vat number plus button
		onPressAddVatCountryVatNumber: function() {
			if (!this._oValueHelpDialogpVatCount) {
				this._oValueHelpDialogpVatCount = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.vatCountryVatNumber", this);
				this.getView().addDependent(this._oValueHelpDialogpVatCount);

			}
			//this.getView().byId("idInSearch").focus();
			this._oValueHelpDialogpVatCount.open();
		},

		onPressVatDataCancel: function() {
			this._oValueHelpDialogpVatCount.close();
		},

		onPressVatDataOk: function() {
			var a = this.getView().getModel("CreateModelSet");
			a.getData().TaxData.TotalAdditionalVat = a.getData().TaxData.AdditionalVats.length;
			a.refresh();
			this._oValueHelpDialogpVatCount.close();
		},

		//on Press external Identifir Frag
		onPressAddExternalIdentifierFrag: function() {
			if (!this._oValueHelpDialogpExtIdentfier) {
				this._oValueHelpDialogpExtIdentfier = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.externalIdentifierDialog", this);
				this.getView().addDependent(this._oValueHelpDialogpExtIdentfier);

			}
			//this.getView().byId("idInSearch").focus();
			this._oValueHelpDialogpExtIdentfier.open();
		},

		onPressExtIdentifierTypeValueFragOk: function() {
			var a = this.getView().getModel("CreateModelSet");
			a.getData().ExternalIdentifer.TotalExternalIdent = a.getData().ExternalIdentifer.ExternalIdenitir.length;
			a.refresh();
			this._oValueHelpDialogpExtIdentfier.close();
		},

		//on Account group selected
		onAccountGroupSelected: function(oEvent) {
			oEvent.getSource().setValueState("None");
			//if (oEvent.getSource().getSelectedItem() !== null) {
			//toast message
			var hdrData = this.getView().getModel("HeaderModelSet").getData();
			this.showMessageBasedOnHeaderSelection();
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			} else {
				this.basedOnAccountGroupEnableMandatoryOptional(hdrData.AccountGrpKey);
				this.readDataHandleEachTimeAndAccountGrpChange();
				this.createOtherPartnerFunctionModelSet(hdrData.AccountGrpKey);
				this.createSoldtoPartnerFunctionModelSet(hdrData.AccountGrpKey);
				this.readDefaultPartnerFunctions(hdrData.AccountGrpKey);
				this.readPartnerFunction(hdrData.AccountGrpKey);
			}

			this.readTaxClassification();
		},

		////////////////////////////////////////////Customer Data Functionality //////////////////////////////////////
		//read Cusomer Data URL
		readCustomerDataTabData: function(country) {
			var that = this;
			this.getView().getModel("HeaderModelSet").refresh();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			// var oBusyDialog = new sap.m.BusyDialog();
			// oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/SAP_Customer_GeneralData/ZSD_MDM_CUSTOMER_DATA_API_SRV/Input_HelpSet?System_Name=" + system +
				"&filter=Country eq '" + country +
				"'&expand=NavTransportZone,NavAlternateTransport,NavGroup_Key,NavCalender_Key,NavGood_Rec_hrs,NavRegioGroup"
			);
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						// oBusyDialog.close();
						// var dataForCommunLang = [];
						var dataForGroupKey = [];
						var dataForCalenderKey = [];
						var dataForGoodsRec = [];
						var dataForTransportaZoneSet = [];
						var dataForAltTransportaZoneSet = [];
						var regStructGrp = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataAfterParse = JSON.parse(oData.results[0].Response);
							var oDataOut = dataAfterParse.d.results[0];
							// dataForCommunLang = oDataOut.NavCommunication_Language.results;
							dataForGroupKey = oDataOut.NavGroup_Key.results;
							dataForCalenderKey = oDataOut.NavCalender_Key.results;
							dataForGoodsRec = oDataOut.NavGood_Rec_hrs.results;
							dataForTransportaZoneSet = oDataOut.NavTransportZone.results;
							dataForAltTransportaZoneSet = oDataOut.NavAlternateTransport.results;
							regStructGrp = oDataOut.NavRegioGroup.results;
						}
						//for communication language
						/*	var oODataJSONModel = new sap.ui.model.json.JSONModel({
								"results": dataForCommunLang
							});
							oODataJSONModel.setSizeLimit(dataForCommunLang.length);
							that.getView().setModel(oODataJSONModel, "CommunicationLangCDCombSet");*/

						//for Group Key
						var oODataJSONModelGK = new sap.ui.model.json.JSONModel({
							"results": dataForGroupKey
						});
						oODataJSONModelGK.setSizeLimit(dataForGroupKey.length);
						that.getView().setModel(oODataJSONModelGK, "GroupKeyCDCombSet");

						//for Calender Key
						var oODataJSONModelCK = new sap.ui.model.json.JSONModel({
							"results": dataForCalenderKey
						});
						oODataJSONModelCK.setSizeLimit(dataForCalenderKey.length);
						that.getView().setModel(oODataJSONModelCK, "CalenderKeyCDCombSet");

						//for goods rec
						var oODataJSONModeGR = new sap.ui.model.json.JSONModel({
							"results": dataForGoodsRec
						});
						oODataJSONModeGR.setSizeLimit(dataForGoodsRec.length);
						that.getView().setModel(oODataJSONModeGR, "GoodsRecCDCombSet");

						//for Trasnsport Zone
						var oODataJSONModeTZon = new sap.ui.model.json.JSONModel({
							"results": dataForTransportaZoneSet
						});
						oODataJSONModeTZon.setSizeLimit(dataForTransportaZoneSet.length);
						that.getView().setModel(oODataJSONModeTZon, "TransportZoneCDCombSet");

						//for Alt Trasnsport Zone
						var oODataJSONModeAltTZon = new sap.ui.model.json.JSONModel({
							"results": dataForAltTransportaZoneSet
						});
						oODataJSONModeAltTZon.setSizeLimit(dataForAltTransportaZoneSet.length);
						that.getView().setModel(oODataJSONModeAltTZon, "TransporAlttZoneCDCombSet");

						var regStructGrpModel = new sap.ui.model.json.JSONModel({
							"results": regStructGrp
						});
						regStructGrpModel.setSizeLimit(regStructGrp.length);
						that.getView().setModel(regStructGrpModel, "RegionStructModelSet");
						//Resubmit & Review scenario
						that.bindCustomerData();
					},
					error: function(oError) {
						// oBusyDialog.close();
					}
				});
		},

		//create Customer Data Tab
		createCustomerDataTab: function(oData) {
			var modlBus = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().results.BUSINESSPARTNER;
			if (modlBus === undefined) {
				modlBus = {};
			}
			var CommLangBPM = (modlBus.languageRowid !== undefined && modlBus.languageRowid.code !== undefined) ? modlBus.languageRowid.code :
				"";
			var altBusName = modlBus.altBsnsName !== undefined ? modlBus.altBsnsName.toString() : "";
			var dataCust = {
				GenData: {
					AltBusiName: altBusName,
					SearchTearm1: oData.SrchTerm1 ? oData.SrchTerm1.toString().trim() : "",
					SearchTearm2: oData.SrchTerm2 ? oData.SrchTerm2.toString().trim() : "",
					CommuLang: CommLangBPM,
					AuthoGrp: oData.AuthorizationGroup ? oData.AuthorizationGroup.toString().trim() : "",
					VendNum: oData.Vendor ? oData.Vendor.toString().trim() : "",
					TranspoZone: oData.TransportationZone ? oData.TransportationZone.toString().trim() : "",
					AltTranspoZone: oData.AltTransportationZone ? oData.AltTransportationZone.toString().trim() : "",
					RegStructGrp: oData.RegStrGrp ? oData.RegStrGrp.toString().trim() : "",
					GroupKey: oData.GroupKey ? oData.GroupKey.toString().trim() : "",
					TradingPartner: oData.TradingPartner ? oData.TradingPartner.toString().trim() : "",
					MainlyCivilianUsg: oData.CivilianUsage ? oData.CivilianUsage : false,
					MainlyMailitaryUsg: oData.MilitaryUsage ? oData.MilitaryUsage : false,
					UiCustGenDataValidated: true,
					LocationNo1: oData.LocationNo1 ? oData.LocationNo1.toString().trim() : "",
					LocationNo2: oData.LocationNo2 ? oData.LocationNo2.toString().trim() : "",
					CheckDegit: oData.CheckDigit ? oData.CheckDigit.toString().trim() : "",

					AltBusiNameMsg: "None",
					SearchTearm1Msg: "None",
					SearchTearm2Msg: "None",
					CommuLangMsg: "None",
					AuthoGrpMsg: "None",
					VendNumMsg: "None",
					TranspoZoneMsg: "None",
					AltTranspoZoneMsg: "None",
					RegStructGrpMsg: "None",
					GroupKeyMsg: "None",
					TradingPartnerMsg: "None",
					MainlyCivilianUsgMsg: "None",
					MainlyMailitaryUsgMsg: "None",
					LocationNo1Msg: "None",
					LocationNo2Msg: "None",
					CheckDegitMsg: "None"

				},
				UnloadingPoint: {
					UnloadPointArr: []
				},
				BankDetails: {
					AlternPayer: oData.AlternativePayer ? oData.AlternativePayer.toString().trim() : "",
					IndivEnteris: oData.IndividualEntries ? oData.IndividualEntries : false,
					AllowedPayer: oData.AllowedPayer ? oData.AllowedPayer.toString().trim() : "",

					AlternPayerValState: "None",
					IndivEnterisValState: "None",
					AllowedPayerValState: "None",

					BankIBan: []
				}
			};

			var bankDet = oData.N_BankDetails.results;
			for (var r = 0; r < bankDet.length; r++) {
				dataCust.BankDetails.BankIBan.push({
					IBan: bankDet[r].Iban ? bankDet[r].Iban.toString().trim() : "",
					Country: bankDet[r].Country ? bankDet[r].Country.toString().trim() : "",
					BankKey: bankDet[r].BankKey ? bankDet[r].BankKey.toString().trim() : "",
					BankControlKey: bankDet[r].BankControlKey ? bankDet[r].BankControlKey.toString().trim() : "",
					BankAccount: bankDet[r].BankAccount ? bankDet[r].BankAccount.toString().trim() : "",
					BankAccHolder: bankDet[r].AccountHolder ? bankDet[r].AccountHolder.toString().trim() : "",
					BankType: bankDet[r].BankType ? bankDet[r].BankType.toString().trim() : "",
					RefDetails: bankDet[r].ReferenceDetails ? bankDet[r].ReferenceDetails.toString().trim() : "",
					IBanEnabled: false,
					BankDetailsEnabled: true,
					CollectionAuth: bankDet[r].CollectionAuth ? bankDet[r].CollectionAuth : false,
					TotalCount: (r + 1) + " of " + (bankDet.length),
					VisibleBasedOnNext: r === 0 ? true : false,

					IBanValState: "None",
					CountryValState: "None",
					BankKeyValState: "None",
					BankControlKeyValState: "None",
					BankAccountValState: "None",
					BankAccHolderValState: "None",
					BankTypeValState: "None",
					RefDetailsValState: "None",
					CollectionAuthValState: "None"
				});
			}
			//unloading points
			var unlPints = oData.N_UnloadingPoint.results;
			for (var i = 0; i < unlPints.length; i++) {
				var visb = false;
				if (i === 0) {
					visb = true;
				}
				dataCust.UnloadingPoint.UnloadPointArr.push({
					UnloadPoint: unlPints[i].UnloadPointDescr ? unlPints[i].UnloadPointDescr.toString().trim() : "",
					GoodsRecHrs: unlPints[i].GoodsRecvngHours ? unlPints[i].GoodsRecvngHours.toString().trim() : "",
					Default: unlPints[i].Defab ? unlPints[i].Defab : false,
					CalenderKey: unlPints[i].CalendarKey ? unlPints[i].CalendarKey.toString().trim() : "",
					UiCustUnlodPointValidated: true,

					UnloadPointState: "None",
					UnloadPointMessage: " ",
					GoodsRecHrsState: "None",
					GoodsRecHrsMessage: " ",
					DefaultState: "None",
					DefaultMessage: " ",
					CalenderKeyState: "None",
					CalenderKeyMessage: " ",
					TotalCount: (i + 1) + " of " + unlPints.length,
					VisibleBasedOnNext: visb,
					DayTable: []
				});

				var unField = true;
				if (unlPints[i].UnloadPointDescr !== undefined && unlPints[i].UnloadPointDescr.toString().trim() !== "" && unlPints[i].CalendarKey !==
					undefined && unlPints[i].CalendarKey.toString().trim() !== "") {
					unField = false;
				}

				dataCust.UnloadingPoint.UnloadPointArr[i].DayTable = [{
					Morningopen: Formatter.readBackendTime(unlPints[i].Moab1),
					Morningclose: Formatter.readBackendTime(unlPints[i].Mobi1),
					Afternoonopen: Formatter.readBackendTime(unlPints[i].Moab2),
					Afternoonclose: Formatter.readBackendTime(unlPints[i].Mobi2),
					Weekday: "Monday",
					MornOpnEnable: unField,
					MornCloseEnable: unField,
					AfterOpnEnable: unField,
					AfterCloseEnable: unField,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: Formatter.readBackendTime(unlPints[i].Diab1),
					Morningclose: Formatter.readBackendTime(unlPints[i].Dibi1),
					Afternoonopen: Formatter.readBackendTime(unlPints[i].Diab2),
					Afternoonclose: Formatter.readBackendTime(unlPints[i].Dibi2),
					Weekday: "Tuesday",
					MornOpnEnable: unField,
					MornCloseEnable: unField,
					AfterOpnEnable: unField,
					AfterCloseEnable: unField,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: Formatter.readBackendTime(unlPints[i].Miab1),
					Morningclose: Formatter.readBackendTime(unlPints[i].Mibi1),
					Afternoonopen: Formatter.readBackendTime(unlPints[i].Miab2),
					Afternoonclose: Formatter.readBackendTime(unlPints[i].Mibi2),
					Weekday: "Wednesday",
					MornOpnEnable: unField,
					MornCloseEnable: unField,
					AfterOpnEnable: unField,
					AfterCloseEnable: unField,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: Formatter.readBackendTime(unlPints[i].Doab1),
					Morningclose: Formatter.readBackendTime(unlPints[i].Dobi1),
					Afternoonopen: Formatter.readBackendTime(unlPints[i].Doab2),
					Afternoonclose: Formatter.readBackendTime(unlPints[i].Dobi2),
					Weekday: "Thursday",
					MornOpnEnable: unField,
					MornCloseEnable: unField,
					AfterOpnEnable: unField,
					AfterCloseEnable: unField,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: Formatter.readBackendTime(unlPints[i].Frab1),
					Morningclose: Formatter.readBackendTime(unlPints[i].Frbi1),
					Afternoonopen: Formatter.readBackendTime(unlPints[i].Frab2),
					Afternoonclose: Formatter.readBackendTime(unlPints[i].Frbi2),
					Weekday: "Friday",
					MornOpnEnable: unField,
					MornCloseEnable: unField,
					AfterOpnEnable: unField,
					AfterCloseEnable: unField,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: Formatter.readBackendTime(unlPints[i].Saab1),
					Morningclose: Formatter.readBackendTime(unlPints[i].Sabi1),
					Afternoonopen: Formatter.readBackendTime(unlPints[i].Saab2),
					Afternoonclose: Formatter.readBackendTime(unlPints[i].Sabi2),
					Weekday: "Saturday",
					MornOpnEnable: unField,
					MornCloseEnable: unField,
					AfterOpnEnable: unField,
					AfterCloseEnable: unField,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: Formatter.readBackendTime(unlPints[i].Soab1),
					Morningclose: Formatter.readBackendTime(unlPints[i].Sobi1),
					Afternoonopen: Formatter.readBackendTime(unlPints[i].Soab2),
					Afternoonclose: Formatter.readBackendTime(unlPints[i].Sobi2),
					Weekday: "Sunday",
					MornOpnEnable: unField,
					MornCloseEnable: unField,
					AfterOpnEnable: unField,
					AfterCloseEnable: unField,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}];

			}

			var modelCustomerData = new sap.ui.model.json.JSONModel(dataCust);
			this.getView().setModel(modelCustomerData, "CustomerDataSet");

			//add bank And Unloading points
			if (dataCust.UnloadingPoint.UnloadPointArr.length < 1) {
				this.addNewUnloadingPointsCustomerDetails();
			}

			if (dataCust.BankDetails.BankIBan.length < 1) {
				this.addNewBankDetailsForCustomerDetails();
			}
		},

		//send for review
		onPressSendForReview: function(oEvent) {
			//Header Details
			var errCount = 0;
			var hedrData = this.getView().getModel("HeaderModelSet").getData();
			var reqMand = this.getView().getModel("RequiredOptionalSet").getData();
			if (reqMand.CompanyCodeCond === "REQUIRED" && hedrData.CompnyCodeKey.toString().trim() === "") {
				hedrData.CompnyCodeKeyValState = "Error";
				errCount++;
			} else {
				hedrData.CompnyCodeKeyValState = "None";
			}

			if (reqMand.SalesOrgCond === "REQUIRED" && hedrData.SalesOrgKey.toString().trim() === "") {
				hedrData.SalesOrgKeyValState = "Error";
				errCount++;
			} else {
				hedrData.SalesOrgKeyValState = "None";
			}

			if (reqMand.DistriChanlCond === "REQUIRED" && hedrData.DistribChnnlKey.toString().trim() === "") {
				hedrData.DistribChnnlKeyValState = "Error";
				errCount++;
			} else {
				hedrData.DistribChnnlKeyValState = "None";
			}

			if (reqMand.DivisionCond === "REQUIRED" && hedrData.DivisionKey.toString().trim() === "") {
				hedrData.DivisionKeyValState = "Error";
				errCount++;
			} else {
				hedrData.DivisionKeyValState = "None";
			}

			if (reqMand.SystemCond === "REQUIRED" && hedrData.System.toString().trim() === "") {
				hedrData.SystemValState = "Error";
				errCount++;
			} else {
				hedrData.SystemValState = "None";
			}

			if (reqMand.AccountGrpCond === "REQUIRED" && hedrData.AccountGrpKey.toString().trim() === "") {
				hedrData.AccountGrpKeyValState = "Error";
				errCount++;
			} else {
				hedrData.AccountGrpKeyValState = "None";
			}

			if (reqMand.ApplicIdCond === "REQUIRED" && hedrData.AppId.toString().trim() === "") {
				hedrData.AppIdValState = "Error";
				errCount++;
			} else {
				hedrData.AppIdValState = "None";
			}
			this.getView().getModel("HeaderModelSet").refresh();

			////Name address Section
			var BusPartTabData = this.getView().getModel("CreateModelSet").getData();
			var nameAddData = BusPartTabData.NameAndAddress;
			var countNameAndAddress = 0;
			for (var s = 0; s < nameAddData.length; s++) {

				if (reqMand.CountryNameCond === "REQUIRED" && nameAddData[s].Country.toString().trim() === "") {
					nameAddData[s].CountryState = "Error";
					nameAddData[s].CountryMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].CountryState = "None";
					nameAddData[s].CountryMessage = " ";
				}

				if (reqMand.AddrsVernCond === "REQUIRED" && nameAddData[s].Address_Version.toString().trim() === "") {
					nameAddData[s].AddrVrsState = "Error";
					nameAddData[s].AddrVrsMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].AddrVrsState = "None";
					nameAddData[s].AddrVrsMessage = " ";
				}

				if (reqMand.PrefAddVerCond === "REQUIRED" && nameAddData[s].Preferred_Local_Language === false) {
					nameAddData[s].PrefLangState = "Error";
					nameAddData[s].PrefLangMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].PrefLangState = "None";
					nameAddData[s].PrefLangMessage = " ";
				}

				if (reqMand.Name1Cond === "REQUIRED" && nameAddData[s].Name_1.toString().trim() === "") {
					nameAddData[s].Name1State = "Error";
					nameAddData[s].Name1Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Name1State = "None";
					nameAddData[s].Name1Message = " ";
				}

				if (reqMand.Name2Cond === "REQUIRED" && nameAddData[s].Name_2.toString().trim() === "") {
					nameAddData[s].Name2State = "Error";
					nameAddData[s].Name2Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Name2State = "None";
					nameAddData[s].Name2Message = " ";
				}

				if (reqMand.Name3Cond === "REQUIRED" && nameAddData[s].Name_3.toString().trim() === "") {
					nameAddData[s].Name3State = "Error";
					nameAddData[s].Name3Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Name3State = "None";
					nameAddData[s].Name3Message = " ";
				}

				if (reqMand.Name4Cond === "REQUIRED" && nameAddData[s].Name_4.toString().trim() === "") {
					nameAddData[s].Name4State = "Error";
					nameAddData[s].Name4Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Name4State = "None";
					nameAddData[s].Name4Message = " ";
				}

				if (reqMand.Street1Cond === "REQUIRED" && nameAddData[s].Street_1.toString().trim() === "") {
					nameAddData[s].Street1State = "Error";
					nameAddData[s].Street1Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Street1State = "None";
					nameAddData[s].Street1Message = " ";
				}

				if (reqMand.Street2Cond === "REQUIRED" && nameAddData[s].Street_2.toString().trim() === "") {
					nameAddData[s].Street2State = "Error";
					nameAddData[s].Street2Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Street2State = "None";
					nameAddData[s].Street2Message = " ";
				}

				if (reqMand.Street3Cond === "REQUIRED" && nameAddData[s].Street_3.toString().trim() === "") {
					nameAddData[s].Street3State = "Error";
					nameAddData[s].Street3Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Street3State = "None";
					nameAddData[s].Street3Message = " ";
				}

				if (reqMand.Street4Cond === "REQUIRED" && nameAddData[s].Street_4.toString().trim() === "") {
					nameAddData[s].Street4State = "Error";
					nameAddData[s].Street4Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Street4State = "None";
					nameAddData[s].Street4Message = " ";
				}

				if (reqMand.Street5Cond === "REQUIRED" && nameAddData[s].Street_5.toString().trim() === "") {
					nameAddData[s].Street5State = "Error";
					nameAddData[s].Street5Message = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].Street5State = "None";
					nameAddData[s].Street5Message = " ";
				}

				if (reqMand.HouseCond === "REQUIRED" && nameAddData[s].House_No.toString().trim() === "") {
					nameAddData[s].HouseState = "Error";
					nameAddData[s].HouseMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].HouseState = "None";
					nameAddData[s].HouseMessage = " ";
				}

				if (reqMand.HouseSuplmntCond === "REQUIRED" && nameAddData[s].House_No_Supplement.toString().trim() === "") {
					nameAddData[s].HouseSupState = "Error";
					nameAddData[s].HouseSupMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].HouseSupState = "None";
					nameAddData[s].HouseSupMessage = " ";
				}

				if (reqMand.BuildingCond === "REQUIRED" && nameAddData[s].Building.toString().trim() === "") {
					nameAddData[s].BuildState = "Error";
					nameAddData[s].BuildMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].BuildState = "None";
					nameAddData[s].BuildMessage = " ";
				}

				if (reqMand.FloorCond === "REQUIRED" && nameAddData[s].Floor.toString().trim() === "") {
					nameAddData[s].FloorState = "Error";
					nameAddData[s].FloorMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].FloorState = "None";
					nameAddData[s].FloorMessage = " ";
				}

				if (reqMand.RoomCond === "REQUIRED" && nameAddData[s].Room.toString().trim() === "") {
					nameAddData[s].RoomState = "Error";
					nameAddData[s].RoomMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].RoomState = "None";
					nameAddData[s].RoomMessage = " ";
				}

				if (reqMand.PostalCodeCond === "REQUIRED" && nameAddData[s].Postal_Code.toString().trim() === "") {
					nameAddData[s].PostCodeState = "Error";
					nameAddData[s].PostCodeMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].PostCodeState = "None";
					nameAddData[s].PostCodeMessage = " ";
				}

				if (reqMand.DistrictCond === "REQUIRED" && nameAddData[s].District.toString().trim() === "") {
					nameAddData[s].DistrictState = "Error";
					nameAddData[s].DistrictMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].DistrictState = "None";
					nameAddData[s].DistrictMessage = " ";
				}

				if (reqMand.CityCond === "REQUIRED" && nameAddData[s].City.toString().trim() === "") {
					nameAddData[s].CityState = "Error";
					nameAddData[s].CityMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].CityState = "None";
					nameAddData[s].CityMessage = " ";
				}

				if (reqMand.RegionCond === "REQUIRED" && nameAddData[s].Region.toString().trim() === "") {
					nameAddData[s].RegionState = "Error";
					nameAddData[s].RegionMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].RegionState = "None";
					nameAddData[s].RegionMessage = " ";
				}

				if (reqMand.FreeTraderegCond === "REQUIRED" && nameAddData[s].Free_Trade_Region.toString().trim() === "") {
					nameAddData[s].FreeTradeRegionState = "Error";
					nameAddData[s].FreeTradeRegionMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].FreeTradeRegionState = "None";
					nameAddData[s].FreeTradeRegionMessage = " ";
				}

				if (reqMand.POBOXNumCond === "REQUIRED" && nameAddData[s].PO_Box.toString().trim() === "") {
					nameAddData[s].POBoxNumState = "Error";
					nameAddData[s].POBoxNumMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].POBoxNumState = "None";
					nameAddData[s].POBoxNumMessage = " ";
				}

				if (reqMand.PoBoxPostCodeCond === "REQUIRED" && nameAddData[s].PO_Box_Code.toString().trim() === "") {
					nameAddData[s].POBoxPostCodState = "Error";
					nameAddData[s].POBoxPostCodMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].POBoxPostCodState = "None";
					nameAddData[s].POBoxPostCodMessage = " ";
				}

				if (reqMand.CompPostCodeCond === "REQUIRED" && nameAddData[s].CompPostalCode.toString().trim() === "") {
					nameAddData[s].CompPostalCodeState = "Error";
					nameAddData[s].CompPostalCodeMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].CompPostalCodeState = "None";
					nameAddData[s].CompPostalCodeMessage = " ";
				}

				if (reqMand.PoBoxCityCond === "REQUIRED" && nameAddData[s].PO_Box_City.toString().trim() === "") {
					nameAddData[s].POBoxCityState = "Error";
					nameAddData[s].POBoxCityMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].POBoxCityState = "None";
					nameAddData[s].POBoxCityMessage = " ";
				}

				if (reqMand.ByPassAddrValCond === "REQUIRED" && nameAddData[s].Bypass_Validation === false) {
					nameAddData[s].ByPassAddrsState = "Error";
					nameAddData[s].ByPassAddrsMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].ByPassAddrsState = "None";
					nameAddData[s].ByPassAddrsMessage = " ";
				}

				if (reqMand.streetValCond === "REQUIRED" && nameAddData[s].Street_Validation.toString().trim() === "") {
					nameAddData[s].streetValState = "Error";
					nameAddData[s].StreetValMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].streetValState = "None";
					nameAddData[s].StreetValMessage = " ";
				}

				if (reqMand.PoBoxValCond === "REQUIRED" && nameAddData[s].POBox_Validation.toString().trim() === "") {
					nameAddData[s].PoBoxValState = "Error";
					nameAddData[s].POBoxValMessage = " ";
					errCount++;
					countNameAndAddress++;
				} else {
					nameAddData[s].PoBoxValState = "None";
					nameAddData[s].POBoxValMessage = " ";
				}

			}

			///For Tax Data Tab
			var taxData = BusPartTabData.TaxData;
			var countTaxData = 0;
			if (reqMand.TaxVal1cond === "REQUIRED" && taxData.Text1Value.toString().trim() === "") {
				taxData.Tax1State = "Error";
				taxData.Tax1Message = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.Tax1State = "None";
				taxData.Tax1Message = " ";
			}

			if (reqMand.TaxVal2cond === "REQUIRED" && taxData.Text2Value.toString().trim() === "") {
				taxData.Tax2State = "Error";
				taxData.Tax2Message = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.Tax2State = "None";
				taxData.Tax2Message = " ";
			}

			if (reqMand.TaxVal3cond === "REQUIRED" && taxData.Text3Value.toString().trim() === "") {
				taxData.Tax3State = "Error";
				taxData.Tax3Message = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.Tax3State = "None";
				taxData.Tax3Message = " ";
			}

			if (reqMand.TaxVal4cond === "REQUIRED" && taxData.Text4Value.toString().trim() === "") {
				taxData.Tax4State = "Error";
				taxData.Tax4Message = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.Tax4State = "None";
				taxData.Tax4Message = " ";
			}

			if (reqMand.TaxVal5cond === "REQUIRED" && taxData.Text5Value.toString().trim() === "") {
				taxData.Tax5State = "Error";
				taxData.Tax5Message = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.Tax5State = "None";
				taxData.Tax5Message = " ";
			}

			if (reqMand.VatCountryCond === "REQUIRED" && taxData.VatCountKey.toString().trim() === "") {
				taxData.VatCountryViewState = "Error";
				taxData.VatCountryViewMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.VatCountryViewState = "None";
				taxData.VatCountryViewMessage = " ";
			}

			if (reqMand.VatNumCond === "REQUIRED" && taxData.VatNum.toString().trim() === "") {
				taxData.VatNumViewState = "Error";
				taxData.VatNumViewMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.VatNumViewState = "None";
				taxData.VatNumViewMessage = " ";
			}

			if (reqMand.TaxJurisCodeCond === "REQUIRED" && taxData.TaxJurisdiction_Code.toString().trim() === "") {
				taxData.TaxJurisdictionCodeState = "Error";
				taxData.TaxJurisdictionCodeMessgae = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.TaxJurisdictionCodeState = "None";
				taxData.TaxJurisdictionCodeMessgae = " ";
			}

			if (reqMand.TaxationTypeCond === "REQUIRED" && taxData.Taxation_Type.toString().trim() === "") {
				taxData.TaxationTypeState = "Error";
				taxData.TaxationTypeMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.TaxationTypeState = "None";
				taxData.TaxationTypeMessage = " ";
			}

			if (reqMand.TaxNumberTypeCond === "REQUIRED" && taxData.TaxNumber_Type.toString().trim() === "") {
				taxData.TaxNumberTypeState = "Error";
				taxData.TaxNumberTypeMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.TaxNumberTypeState = "None";
				taxData.TaxNumberTypeMessage = " ";
			}

			if (reqMand.CFOPCatCond === "REQUIRED" && taxData.CFOP_Category.toString().trim() === "") {
				taxData.CFOPCategoryState = "Error";
				taxData.CFOPCategoryMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.CFOPCategoryState = "None";
				taxData.CFOPCategoryMessage = " ";
			}

			if (reqMand.ICMSLawCond === "REQUIRED" && taxData.ICMS_Law.toString().trim() === "") {
				taxData.ICMSLawState = "Error";
				taxData.ICMSLawMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.ICMSLawState = "None";
				taxData.ICMSLawMessage = " ";
			}

			if (reqMand.IPILawCond === "REQUIRED" && taxData.IPI_Law.toString().trim() === "") {
				taxData.IPILawState = "Error";
				taxData.IPILawMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.IPILawState = "None";
				taxData.IPILawMessage = " ";
			}

			if (reqMand.NaturlPerCond === "REQUIRED" && taxData.Natural_Person === false) {
				taxData.NaturalPerState = "Error";
				taxData.NaturalPerMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.NaturalPerState = "None";
				taxData.NaturalPerMessage = " ";
			}

			if (reqMand.SalesPurTxCond === "REQUIRED" && taxData.salesPurchase_Tax === false) {
				taxData.salesPurchase_TaxState = "Error";
				taxData.salesPurchase_TaxMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.salesPurchase_TaxState = "None";
				taxData.salesPurchase_TaxMessage = " ";
			}

			if (reqMand.EqualizTaxCond === "REQUIRED" && taxData.Equalization_Tax === false) {
				taxData.Equalization_TaxState = "Error";
				taxData.Equalization_TaxMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.Equalization_TaxState = "None";
				taxData.Equalization_TaxMessage = " ";
			}

			if (reqMand.ICMSExempCond === "REQUIRED" && taxData.ICMS_Exempt === false) {
				taxData.ICMS_ExemptState = "Error";
				taxData.ICMS_ExemptMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.ICMS_ExemptState = "None";
				taxData.ICMS_ExemptMessage = " ";
			}

			if (reqMand.ICMSExempCond === "REQUIRED" && taxData.IPI_Exempt === false) {
				taxData.IPI_ExemptState = "Error";
				taxData.IPI_ExemptMessage = " ";
				errCount++;
				countTaxData++;
			} else {
				taxData.IPI_ExemptState = "None";
				taxData.IPI_ExemptMessage = " ";
			}

			/*	payload.BusinessPartnerData.TaxData.VAT = [{
					"Country": taxData.VatCountKey.toString().trim(),
					"Number": taxData.VatNum.toString().trim()
				}];
				//for additional VAT
				for (var sun = 0; sun < taxData.AdditionalVats.length; sun++) {
					payload.BusinessPartnerData.TaxData.VAT.push({
						"Country": taxData.AdditionalVats[sun].VatCountKey.toString().trim(),
						"Number": taxData.AdditionalVats[sun].VatNum.toString().trim()
					});
				}*/

			/// Customer Classification
			var custClassic = BusPartTabData.CustomerClassification;
			var countCustClass = 0;
			if (reqMand.AccouTypeCond === "REQUIRED" && custClassic.Account_Type.toString().trim() === "") {
				custClassic.AccountTypeState = "Error";
				custClassic.AccountTypeMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.AccountTypeState = "None";
				custClassic.AccountTypeMessage = " ";
			}

			if (reqMand.IndClass1Cond === "REQUIRED" && custClassic.IndustryClassification_1.toString().trim() === "") {
				custClassic.IndustryClassification1State = "Error";
				custClassic.IndustryClassification1Message = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.IndustryClassification1State = "None";
				custClassic.IndustryClassification1Message = " ";
			}

			if (reqMand.IndClass2Cond === "REQUIRED" && custClassic.IndustryClassification_2.toString().trim() === "") {
				custClassic.IndustryClassification2State = "Error";
				custClassic.IndustryClassification2Message = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.IndustryClassification2State = "None";
				custClassic.IndustryClassification2Message = " ";
			}

			if (reqMand.BannerCond === "REQUIRED" && custClassic.Banner.toString().trim() === "") {
				custClassic.BannerState = "Error";
				custClassic.BannerMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.BannerState = "None";
				custClassic.BannerMessage = " ";
			}

			if (reqMand.IndCustTypeCond === "REQUIRED" && custClassic.IndirectCustomer_Type.toString().trim() === "") {
				custClassic.IndirectCustomerTypeState = "Error";
				custClassic.IndirectCustomerTypeMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.IndirectCustomerTypeState = "None";
				custClassic.IndirectCustomerTypeMessage = " ";
			}

			if (reqMand.BusActTypeCond === "REQUIRED" && custClassic.BusinessActivity_Type.toString().trim() === "") {
				custClassic.BusinessActivityTypeState = "Error";
				custClassic.BusinessActivityTypeMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.BusinessActivityTypeState = "None";
				custClassic.BusinessActivityTypeMessage = " ";
			}

			if (reqMand.OrganizationLvlCond === "REQUIRED" && custClassic.Organization_Level.toString().trim() === "") {
				custClassic.OrganizationLevelState = "Error";
				custClassic.OrganizationLevelMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.OrganizationLevelState = "None";
				custClassic.OrganizationLevelMessage = " ";
			}

			if (reqMand.AccLeglstusCond === "REQUIRED" && custClassic.AccountLegal_Status.toString().trim() === "") {
				custClassic.AccountLegalStatusState = "Error";
				custClassic.AccountLegalStatusMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.AccountLegalStatusState = "None";
				custClassic.AccountLegalStatusMessage = " ";
			}

			if (reqMand.CommerDelToCond === "REQUIRED" && custClassic.CommercialDeal_To === false) {
				custClassic.CommercialDeal_ToState = "Error";
				custClassic.CommercialDeal_ToMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.CommercialDeal_ToState = "None";
				custClassic.CommercialDeal_ToMessage = " ";
			}

			if (reqMand.ServDelToCond === "REQUIRED" && custClassic.ServiceDeal_To === false) {
				custClassic.ServiceDeal_ToState = "Error";
				custClassic.ServiceDeal_ToMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.ServiceDeal_ToState = "None";
				custClassic.ServiceDeal_ToMessage = " ";
			}

			if (reqMand.StoreCond === "REQUIRED" && custClassic.Store === false) {
				custClassic.StoreState = "Error";
				custClassic.StoreMessage = " ";
				errCount++;
				countCustClass++;
			} else {
				custClassic.StoreState = "None";
				custClassic.StoreMessage = " ";
			}

			//External Identifir
			//	External identifier Business Tab
			var externalIdent = BusPartTabData.ExternalIdentifer;
			var countExterIdent = 0;
			if (reqMand.DunsCond === "REQUIRED" && externalIdent.DUNS.toString().trim() === "") {
				externalIdent.DUNSState = "Error";
				externalIdent.DUNSMessage = " ";
				errCount++;
				countExterIdent++;
			} else {
				externalIdent.DUNSState = "None";
				externalIdent.DUNSMessage = " ";
			}

			if (reqMand.ChamberOfCommCond === "REQUIRED" && externalIdent.ChamberOf_Commerce.toString().trim() === "") {
				externalIdent.ChamberofCommerceState = "Error";
				externalIdent.ChamberofCommerceMessage = " ";
				errCount++;
				countExterIdent++;
			} else {
				externalIdent.ChamberofCommerceState = "None";
				externalIdent.ChamberofCommerceMessage = " ";
			}

			var extType = BusPartTabData.ExternalIdentifer.ExternalIdenitir;
			var extTypeHdr = BusPartTabData.ExternalIdentifer;
			if (extType.length === 0 && (reqMand.ExternlTypeCond === "REQUIRED" || reqMand.ExternlValueCond === "REQUIRED")) {
				extTypeHdr.ExternalTypeValueState = "Error";
				extTypeHdr.ExternalTypeState = "Error";
				errCount++;
				countExterIdent++;
			} else {
				extTypeHdr.ExternalTypeValueState = "None";
				extTypeHdr.ExternalTypeState = "None";
			}
			/*	for (var v = 0; v < extType.length; v++) {
						"identifierTypeRowid": extType[v].ExterIdtType.toString().trim(),
						"ExternalIdentifierValue": extType[v].ExtIdntValue.toString().trim(),
				}*/
			this.getView().getModel("CreateModelSet").refresh();

			//customer Genral data
			var customerDataTab = this.getView().getModel("CustomerDataSet").getData();
			var custGenDataHdr = customerDataTab.GenData;
			var errGenData = 0;
			if (reqMand.AlterBusNameCond === "REQUIRED" && custGenDataHdr.AltBusiName.toString().trim() === "") {
				custGenDataHdr.AltBusiNameMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.AltBusiNameMsg = "None";
			}

			if (reqMand.SearchTerm1Cond === "REQUIRED" && custGenDataHdr.SearchTearm1.toString().trim() === "") {
				custGenDataHdr.SearchTearm1Msg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.SearchTearm1Msg = "None";
			}

			if (reqMand.SearchTerm2Cond === "REQUIRED" && custGenDataHdr.SearchTearm2.toString().trim() === "") {
				custGenDataHdr.SearchTearm2Msg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.SearchTearm2Msg = "None";
			}

			if (reqMand.CommLangCond === "REQUIRED" && custGenDataHdr.CommuLang.toString().trim() === "") {
				custGenDataHdr.CommuLangMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.CommuLangMsg = "None";
			}

			if (reqMand.AuthGrpCond === "REQUIRED" && custGenDataHdr.AuthoGrp.toString().trim() === "") {
				custGenDataHdr.AuthoGrpMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.AuthoGrpMsg = "None";
			}

			if (reqMand.VendorNumCond === "REQUIRED" && custGenDataHdr.VendNum.toString().trim() === "") {
				custGenDataHdr.VendNumMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.VendNumMsg = "None";
			}

			if (reqMand.TransZoneCond === "REQUIRED" && custGenDataHdr.TranspoZone.toString().trim() === "") {
				custGenDataHdr.TranspoZoneMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.TranspoZoneMsg = "None";
			}

			if (reqMand.AltTranspZoneCond === "REQUIRED" && custGenDataHdr.AltTranspoZone.toString().trim() === "") {
				custGenDataHdr.AltTranspoZoneMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.AltTranspoZoneMsg = "None";
			}

			if (reqMand.RegStructGrpCond === "REQUIRED" && custGenDataHdr.RegStructGrp.toString().trim() === "") {
				custGenDataHdr.RegStructGrpMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.RegStructGrpMsg = "None";
			}

			if (reqMand.GroupKeyCond === "REQUIRED" && custGenDataHdr.GroupKey.toString().trim() === "") {
				custGenDataHdr.GroupKeyMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.GroupKeyMsg = "None";
			}

			if (reqMand.TradinParCond === "REQUIRED" && custGenDataHdr.TradingPartner.toString().trim() === "") {
				custGenDataHdr.TradingPartnerMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.TradingPartnerMsg = "None";
			}

			if (reqMand.MainlyCivilUsgCond === "REQUIRED" && custGenDataHdr.MainlyCivilianUsg === false) {
				custGenDataHdr.MainlyCivilianUsgMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.MainlyCivilianUsgMsg = "None";
			}

			if (reqMand.MainlyMilitUsgCond === "REQUIRED" && custGenDataHdr.MainlyMailitaryUsg === false) {
				custGenDataHdr.MainlyMailitaryUsgMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.MainlyMailitaryUsgMsg = "None";
			}

			if (reqMand.LocationNo1Cond === "REQUIRED" && custGenDataHdr.LocationNo1.toString().trim() === "") {
				custGenDataHdr.LocationNo1Msg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.LocationNo1Msg = "None";
			}

			if (reqMand.LocationNo2Cond === "REQUIRED" && custGenDataHdr.LocationNo2.toString().trim() === "") {
				custGenDataHdr.LocationNo2Msg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.LocationNo2Msg = "None";
			}

			if (reqMand.CheckDigitCond === "REQUIRED" && custGenDataHdr.CheckDegit.toString().trim() === "") {
				custGenDataHdr.CheckDegitMsg = "Error";
				errCount++;
				errGenData++;
			} else {
				custGenDataHdr.CheckDegitMsg = "None";
			}
			this.getView().getModel("CustomerDataSet").refresh();

			// Iban Detail
			var bankItems = customerDataTab.BankDetails.BankIBan;
			var countBankDet = 0;
			for (var r = 0; r < bankItems.length; r++) {
				if (reqMand.IBANCond === "REQUIRED" && bankItems[r].IBan.toString().trim() === "") {
					bankItems[r].IBanValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].IBanValState = "None";
				}

				if (reqMand.CountryCond === "REQUIRED" && bankItems[r].Country.toString().trim() === "") {
					bankItems[r].CountryValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].CountryValState = "None";
				}

				if (reqMand.BankKeyCond === "REQUIRED" && bankItems[r].BankKey.toString().trim() === "") {
					bankItems[r].BankKeyValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].BankKeyValState = "None";
				}

				if (reqMand.BankContKeyCond === "REQUIRED" && bankItems[r].BankControlKey.toString().trim() === "") {
					bankItems[r].BankControlKeyValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].BankControlKeyValState = "None";
				}

				if (reqMand.BankAccCond === "REQUIRED" && bankItems[r].BankAccount.toString().trim() === "") {
					bankItems[r].BankAccountValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].BankAccountValState = "None";
				}

				if (reqMand.BankAccHolderCond === "REQUIRED" && bankItems[r].BankAccHolder.toString().trim() === "") {
					bankItems[r].BankAccHolderValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].BankAccHolderValState = "None";
				}

				if (reqMand.BankTypeCond === "REQUIRED" && bankItems[r].BankType.toString().trim() === "") {
					bankItems[r].BankTypeValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].BankTypeValState = "None";
				}

				if (reqMand.RefDetCond === "REQUIRED" && bankItems[r].RefDetails.toString().trim() === "") {
					bankItems[r].RefDetailsValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].RefDetailsValState = "None";
				}

				if (reqMand.CollAuthCond === "REQUIRED" && bankItems[r].CollectionAuth === false) {
					bankItems[r].CollectionAuthValState = "Error";
					errCount++;
					countBankDet++;
				} else {
					bankItems[r].CollectionAuthValState = "None";
				}
			}

			var bankHdr = customerDataTab.BankDetails;
			if (reqMand.AlterPayerCond === "REQUIRED" && bankHdr.AlternPayer.toString().trim() === "") {
				bankHdr.AlternPayerValState = "Error";
				errCount++;
				countBankDet++;
			} else {
				bankHdr.AlternPayerValState = "None";
			}

			if (reqMand.IndEntCond === "REQUIRED" && bankHdr.IndivEnteris === false) {
				bankHdr.IndivEnterisValState = "Error";
				errCount++;
				countBankDet++;
			} else {
				bankHdr.IndivEnterisValState = "None";
			}

			if (reqMand.AllowPayrCond === "REQUIRED" && bankHdr.AllowedPayer.toString().trim() === "") {
				bankHdr.AllowedPayerValState = "Error";
				errCount++;
				countBankDet++;
			} else {
				bankHdr.AllowedPayerValState = "None";
			}

			///////////////////////////unloading points

			var unlodPointTab = customerDataTab.UnloadingPoint.UnloadPointArr;
			var countUnlodPoint = 0;
			for (var i = 0; i < unlodPointTab.length; i++) {
				//check unload point & calender key is there
				/*	if (unlodPointTab[i].UnloadPoint.trim() !== undefined && unlodPointTab[i].UnloadPoint.trim() !== "" && unlodPointTab[i].CalenderKey !==
						undefined && unlodPointTab[i].CalenderKey !== "") {*/

				if (reqMand.UnlodPointCond === "REQUIRED" && unlodPointTab[i].UnloadPoint.toString().trim() === "") {
					unlodPointTab[i].UnloadPointState = "Error";
					unlodPointTab[i].UnloadPointMessage = " ";
					errCount++;
					countUnlodPoint++;
				} else {
					unlodPointTab[i].UnloadPointState = "None";
					unlodPointTab[i].UnloadPointMessage = " ";
				}

				if (reqMand.GoodsRecHrsCond === "REQUIRED" && unlodPointTab[i].GoodsRecHrs.toString().trim() === "") {
					unlodPointTab[i].GoodsRecHrsState = "Error";
					unlodPointTab[i].GoodsRecHrsMessage = " ";
					errCount++;
					countUnlodPoint++;
				} else {
					unlodPointTab[i].GoodsRecHrsState = "None";
					unlodPointTab[i].GoodsRecHrsMessage = " ";
				}

				if (reqMand.DefaultCond === "REQUIRED" && unlodPointTab[i].Default === false) {
					unlodPointTab[i].DefaultState = "Error";
					unlodPointTab[i].DefaultMessage = " ";
					errCount++;
					countUnlodPoint++;
				} else {
					unlodPointTab[i].DefaultState = "None";
					unlodPointTab[i].DefaultMessage = " ";
				}

				if (reqMand.CalenderKeyCond === "REQUIRED" && unlodPointTab[i].CalenderKey.toString().trim() === "") {
					unlodPointTab[i].CalenderKeyState = "Error";
					unlodPointTab[i].CalenderKeyMessage = " ";
					errCount++;
					countUnlodPoint++;
				} else {
					unlodPointTab[i].CalenderKeyState = "None";
					unlodPointTab[i].CalenderKeyMessage = " ";
				}

				for (var j = 0; j < 7; j++) {
					if (unlodPointTab[i].DayTable[j].Weekday === "Monday") {
						if (reqMand.MondayMornOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningopen === null) {
							unlodPointTab[i].DayTable[j].MorningOpenState = "Error";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningOpenState = "None";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
						}

						if (reqMand.MondayMornCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningclose === null) {
							unlodPointTab[i].DayTable[j].MorningCloseState = "Error";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningCloseState = "None";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
						}

						if (reqMand.MondayAfterOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonopen === null) {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "None";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
						}

						if (reqMand.MondayAfterCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonclose === null) {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "None";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
						}

					} else if (unlodPointTab[i].DayTable[j].Weekday === "Tuesday") {
						if (reqMand.TuesdayMornOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningopen === null) {
							unlodPointTab[i].DayTable[j].MorningOpenState = "Error";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningOpenState = "None";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
						}

						if (reqMand.TuesdayMornCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningclose === null) {
							unlodPointTab[i].DayTable[j].MorningCloseState = "Error";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningCloseState = "None";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
						}

						if (reqMand.TuesdayAfterOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonopen === null) {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "None";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
						}

						if (reqMand.TuesdayAfterCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonclose === null) {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "None";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
						}

					} else if (unlodPointTab[i].DayTable[j].Weekday === "Wednesday") {
						if (reqMand.WednesdayMornOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningopen === null) {
							unlodPointTab[i].DayTable[j].MorningOpenState = "Error";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningOpenState = "None";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
						}

						if (reqMand.WednesdayMornCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningclose === null) {
							unlodPointTab[i].DayTable[j].MorningCloseState = "Error";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningCloseState = "None";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
						}

						if (reqMand.WednesdayAfterOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonopen === null) {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "None";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
						}

						if (reqMand.WednesdayAfterCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonclose === null) {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "None";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
						}
					} else if (unlodPointTab[i].DayTable[j].Weekday === "Thursday") {
						if (reqMand.ThursdayMornOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningopen === null) {
							unlodPointTab[i].DayTable[j].MorningOpenState = "Error";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningOpenState = "None";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
						}

						if (reqMand.ThursdayMornCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningclose === null) {
							unlodPointTab[i].DayTable[j].MorningCloseState = "Error";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningCloseState = "None";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
						}

						if (reqMand.ThursdayAfterOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonopen === null) {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "None";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
						}

						if (reqMand.ThursdayAfterCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonclose === null) {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "None";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
						}
					} else if (unlodPointTab[i].DayTable[j].Weekday === "Friday") {
						if (reqMand.FridayMornOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningopen === null) {
							unlodPointTab[i].DayTable[j].MorningOpenState = "Error";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningOpenState = "None";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
						}

						if (reqMand.FridayMornCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningclose === null) {
							unlodPointTab[i].DayTable[j].MorningCloseState = "Error";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningCloseState = "None";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
						}

						if (reqMand.FridayAfterOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonopen === null) {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "None";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
						}

						if (reqMand.FridayAfterCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonclose === null) {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "None";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
						}
					} else if (unlodPointTab[i].DayTable[j].Weekday === "Saturday") {
						if (reqMand.SaturdayMornOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningopen === null) {
							unlodPointTab[i].DayTable[j].MorningOpenState = "Error";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningOpenState = "None";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
						}

						if (reqMand.SaturdayMornCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningclose === null) {
							unlodPointTab[i].DayTable[j].MorningCloseState = "Error";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningCloseState = "None";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
						}

						if (reqMand.SaturdayAfterOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonopen === null) {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "None";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
						}

						if (reqMand.SaturdayAfterCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonclose === null) {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "None";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
						}
					} else if (unlodPointTab[i].DayTable[j].Weekday === "Sunday") {
						if (reqMand.SundayMornOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningopen === null) {
							unlodPointTab[i].DayTable[j].MorningOpenState = "Error";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningOpenState = "None";
							unlodPointTab[i].DayTable[j].MorningOpenMessage = " ";
						}

						if (reqMand.SundayMornCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Morningclose === null) {
							unlodPointTab[i].DayTable[j].MorningCloseState = "Error";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].MorningCloseState = "None";
							unlodPointTab[i].DayTable[j].MorningClosenMessage = " ";
						}

						if (reqMand.SundayAfterOpenCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonopen === null) {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonOpenState = "None";
							unlodPointTab[i].DayTable[j].AfternoonOpenMessage = " ";
						}

						if (reqMand.SundayAfterCloseCond === "REQUIRED" && unlodPointTab[i].DayTable[j].Afternoonclose === null) {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "Error";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
							errCount++;
							countUnlodPoint++;
						} else {
							unlodPointTab[i].DayTable[j].AfternoonCloseState = "None";
							unlodPointTab[i].DayTable[j].AfternoonCloseMessage = " ";
						}
					}
				}
			}

			///////////////////////////
			this.getView().getModel("CustomerDataSet").refresh();

			//Accounting Data
			var countAccountMng = 0;
			var countPaymentData = 0;
			var countAccCorresp = 0;
			if (hedrData.CompnyCodeKey.toString().trim() !== "") {
				var dataAccount = this.getView().getModel("AccountingDataModelSet").getData();
				var accMgm = dataAccount.AccountManagement;
				if (reqMand.ReconAccCond === "REQUIRED" && accMgm.ReconAccount.toString().trim() === "") {
					accMgm.ReconAccountState = "Error";
					accMgm.ReconAccountMessage = " ";
					errCount++;
					countAccountMng++;
				} else {
					accMgm.ReconAccountState = "None";
					accMgm.ReconAccountMessage = " ";
				}

				if (reqMand.HeadOfficeCond === "REQUIRED" && accMgm.HeadOffice.toString().trim() === "") {
					accMgm.HeadOfficeState = "Error";
					accMgm.HeadOfficeMessage = " ";
					errCount++;
					countAccountMng++;
				} else {
					accMgm.HeadOfficeState = "None";
					accMgm.HeadOfficeMessage = " ";
				}

				if (reqMand.SorkKeyCond === "REQUIRED" && accMgm.SortKey.toString().trim() === "") {
					accMgm.SortKeyState = "Error";
					accMgm.SortKeyMessage = " ";
					errCount++;
					countAccountMng++;
				} else {
					accMgm.SortKeyState = "None";
					accMgm.SortKeyMessage = " ";
				}

				if (reqMand.PreAccNoCond === "REQUIRED" && accMgm.PrevAcctNo.toString().trim() === "") {
					accMgm.PrevAcctNoState = "Error";
					accMgm.PrevAcctNoMessage = " ";
					errCount++;
					countAccountMng++;
				} else {
					accMgm.PrevAcctNoState = "None";
					accMgm.PrevAcctNoMessage = " ";
				}

				if (reqMand.BuyingGrpCond === "REQUIRED" && accMgm.BuyingGroup.toString().trim() === "") {
					accMgm.BuyingGroupState = "Error";
					accMgm.BuyingGroupMessage = " ";
					errCount++;
					countAccountMng++;
				} else {
					accMgm.BuyingGroupState = "None";
					accMgm.BuyingGroupMessage = " ";
				}

				/////////////////////Payment Data //////////////////
				var payData = dataAccount.PaymentData;
				var payTerms = dataAccount.PaymentTerms;

				if (reqMand.TermsOfPayCond === "REQUIRED" && payTerms.terms_of_payment.toString().trim() === "") {
					payTerms.terms_of_paymentState = "Error";
					payTerms.terms_of_paymentMessage = " ";
					errCount++;
					countPaymentData++;
				} else {
					payTerms.terms_of_paymentState = "None";
					payTerms.terms_of_paymentMessage = " ";
				}

				if (reqMand.CredMemoPaytrmCond === "REQUIRED" && payData.Creditmemopaytterm.toString().trim() === "") {
					payData.CreditmemopayttermState = "Error";
					payData.CreditmemopayttermMessage = " ";
					errCount++;
					countPaymentData++;
				} else {
					payData.CreditmemopayttermState = "None";
					payData.CreditmemopayttermMessage = " ";
				}

				if (reqMand.BeChangePayTermCond === "REQUIRED" && payData.Bechangespaytterm.toString().trim() === "") {
					payData.BechangespayttermState = "Error";
					payData.BechangespayttermMessage = " ";
					errCount++;
					countPaymentData++;
				} else {
					payData.BechangespayttermState = "None";
					payData.BechangespayttermMessage = " ";
				}

				if (reqMand.TolerncGrpCond === "REQUIRED" && payData.ToleranceGroup.toString().trim() === "") {
					payData.ToleranceGroupState = "Error";
					payData.ToleranceGroupMessage = " ";
					errCount++;
					countPaymentData++;
				} else {
					payData.ToleranceGroupState = "None";
					payData.ToleranceGroupMessage = " ";
				}

				if (reqMand.PaymntMethCond === "REQUIRED" && payData.PaymentMethods.toString().trim() === "") {
					payData.PaymentMethodsState = "Error";
					payData.PaymentMethodsMessage = " ";
					errCount++;
					countPaymentData++;
				} else {
					payData.PaymentMethodsState = "None";
					payData.PaymentMethodsMessage = " ";
				}

				if (reqMand.HouseBankCond === "REQUIRED" && payData.HouseBank.toString().trim() === "") {
					payData.HouseBankState = "Error";
					payData.HouseBankMessage = " ";
					errCount++;
					countPaymentData++;
				} else {
					payData.HouseBankState = "None";
					payData.HouseBankMessage = " ";
				}

				if (reqMand.SelectnRuleCond === "REQUIRED" && payData.SelectionRule.toString().trim() === "") {
					payData.SelectionRuleState = "Error";
					payData.SelectionRuleMessage = " ";
					errCount++;
					countPaymentData++;
				} else {
					payData.SelectionRuleState = "None";
					payData.SelectionRuleMessage = " ";
				}

				if (reqMand.PayHisRecod === "REQUIRED" && payData.PaymentHistoryRecord === false) {
					payData.PaymentHisRecoState = "Error";
					payData.PaymentHisRecodMessage = " ";
					errCount++;
					countPaymentData++;
				} else {
					payData.PaymentHisRecoState = "None";
					payData.PaymentHisRecodMessage = " ";
				}

				//////////correspondnce////
				var corresp = dataAccount.Correspondence;
				if (reqMand.DunnProcCond === "REQUIRED" && corresp.DunnProcedure.toString().trim() === "") {
					corresp.DunnProcedureState = "Error";
					corresp.DunnProcedureMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.DunnProcedureState = "None";
					corresp.DunnProcedureMessage = " ";
				}

				if (reqMand.DunLevelCond === "REQUIRED" && corresp.DunningLevel.toString().trim() === "") {
					corresp.DunningLevelState = "Error";
					corresp.DunningLevelMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.DunningLevelState = "None";
					corresp.DunningLevelMessage = " ";
				}

				if (reqMand.CustomUsrCond === "REQUIRED" && corresp.CustomerUser.toString().trim() === "") {
					corresp.CustomerUserState = "Error";
					corresp.CustomerUserMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.CustomerUserState = "None";
					corresp.CustomerUserMessage = " ";
				}

				if (reqMand.LastDunnCond === "REQUIRED" && corresp.LastDunned.toString().trim() === null) {
					corresp.LastDunnedState = "Error";
					corresp.LastDunnedMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.LastDunnedState = "None";
					corresp.LastDunnedMessage = " ";
				}

				if (reqMand.DunnAreaCond === "REQUIRED" && corresp.DunningArea.toString().trim() === "") {
					corresp.DunningAreaState = "Error";
					corresp.DunningAreaMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.DunningAreaState = "None";
					corresp.DunningAreaMessage = " ";
				}

				if (reqMand.ClerkIntrnCond === "REQUIRED" && corresp.ClerksInternet.toString().trim() === "") {
					corresp.ClerksInternetState = "Error";
					corresp.ClerksInternetMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.ClerksInternetState = "None";
					corresp.ClerksInternetMessage = " ";
				}

				if (reqMand.DunningClerkCond === "REQUIRED" && corresp.DunningClerk.toString().trim() === "") {
					corresp.DunningClerkState = "Error";
					corresp.DunningClerkMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.DunningClerkState = "None";
					corresp.DunningClerkMessage = " ";
				}

				if (reqMand.ClerkAbbrvCond === "REQUIRED" && corresp.ClerkAbbrev.toString().trim() === "") {
					corresp.ClerkAbbrevState = "Error";
					corresp.ClerkAbbrevMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.ClerkAbbrevState = "None";
					corresp.ClerkAbbrevMessage = " ";
				}

				if (reqMand.AccStmntCond === "REQUIRED" && corresp.AccountStatement.toString().trim() === "") {
					corresp.AccountStatementState = "Error";
					corresp.AccountStatementMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.AccountStatementState = "None";
					corresp.AccountStatementMessage = " ";
				}

				if (reqMand.DunnigBlockCond === "REQUIRED" && corresp.DunningBlock.toString().trim() === "") {
					corresp.DunningBlockState = "Error";
					corresp.DunningBlockMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.DunningBlockState = "None";
					corresp.DunningBlockMessage = " ";
				}

				if (reqMand.AccAtCustCond === "REQUIRED" && corresp.AcctAtCust.toString().trim() === "") {
					corresp.AcctAtCustState = "Error";
					corresp.AcctAtCustMessage = " ";
					errCount++;
					countAccCorresp++;
				} else {
					corresp.AcctAtCustState = "None";
					corresp.AcctAtCustMessage = " ";
				}
				this.getView().getModel("AccountingDataModelSet").refresh();

			}

			/////status Data
			var statusDataBlock = this.getView().getModel("StatusDetailsSet").getData().BlockData;
			var countstatusBlock = 0;
			if (reqMand.PostingBlockCond === "REQUIRED" && statusDataBlock.PostingBlock === false) {
				statusDataBlock.PostingBlockSate = "Error";
				statusDataBlock.PostingBlockMessage = " ";
				errCount++;
				countstatusBlock++;
			} else {
				statusDataBlock.PostingBlockSate = "None";
				statusDataBlock.PostingBlockMessage = " ";
			}

			if (reqMand.OrderBlockCond === "REQUIRED" && statusDataBlock.OrderBlock.toString().trim() === "") {
				statusDataBlock.OrderBlockState = "Error";
				statusDataBlock.OrderBlockMessage = " ";
				errCount++;
				countstatusBlock++;
			} else {
				statusDataBlock.OrderBlockState = "None";
				statusDataBlock.OrderBlockMessage = " ";
			}

			if (reqMand.DeliveryBlockCond === "REQUIRED" && statusDataBlock.DeliveryBlock.toString().trim() === "") {
				statusDataBlock.DeliveryBlockState = "Error";
				statusDataBlock.DeliveryBlockMessage = " ";
				errCount++;
				countstatusBlock++;
			} else {
				statusDataBlock.DeliveryBlockState = "None";
				statusDataBlock.DeliveryBlockMessage = " ";
			}

			if (reqMand.BillngBlockCond === "REQUIRED" && statusDataBlock.BillingBlock.toString().trim() === "") {
				statusDataBlock.BillingBlockState = "Error";
				statusDataBlock.BillingBlockMessage = " ";
				errCount++;
				countstatusBlock++;
			} else {
				statusDataBlock.BillingBlockState = "None";
				statusDataBlock.BillingBlockMessage = " ";
			}

			if (reqMand.BlockSalesSupportCond === "REQUIRED" && statusDataBlock.BlockSalesReport === false) {
				statusDataBlock.BlockSalesReportState = "Error";
				statusDataBlock.BlockSalesReportMessage = " ";
				errCount++;
				countstatusBlock++;
			} else {
				statusDataBlock.BlockSalesReportState = "None";
				statusDataBlock.BlockSalesReportMessage = " ";
			}
			this.getView().getModel("StatusDetailsSet").refresh();

			//sales Data
			var countSDSalsOrd = 0;
			var countSOshipp = 0;
			var countSDBillDoc = 0;
			var countAddFields = 0;
			if (hedrData.SalesOrgKey !== "" && hedrData.DistribChnnlKey !==
				"" && hedrData.DivisionKey !== "" && hedrData.SalesOrgKey !== undefined && hedrData.DistribChnnlKey !==
				undefined && hedrData.DivisionKey !== undefined) {
				var salesData = this.getView().getModel("SalesDataSet").getData();
				var salesOrdData = salesData.SalesOrder;
				if (reqMand.SalesDistrictSLDCond === "REQUIRED" && salesOrdData.SalesDistrict.toString().trim() === "") {
					salesOrdData.SalesDistrictState = "Error";
					salesOrdData.SalesDistrictMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.SalesDistrictState = "None";
					salesOrdData.SalesDistrictMessage = " ";
				}
				if (reqMand.SalesOfficeSLDCond === "REQUIRED" && salesOrdData.SalesOffice.toString().trim() === "") {
					salesOrdData.SalesOfficeState = "Error";
					salesOrdData.SalesOfficeMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.SalesOfficeState = "None";
					salesOrdData.SalesOfficeMessage = " ";
				}
				if (reqMand.SalesGroupSLDCond === "REQUIRED" && salesOrdData.SalesGroup.toString().trim() === "") {
					salesOrdData.SalesGroupState = "Error";
					salesOrdData.SalesGroupMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.SalesGroupState = "None";
					salesOrdData.SalesGroupMessage = " ";
				}
				if (reqMand.CustomerGroupSLDCond === "REQUIRED" && salesOrdData.CustomerGroup.toString().trim() === "") {
					salesOrdData.CustomerGroupState = "Error";
					salesOrdData.CustomerGroupMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.CustomerGroupState = "None";
					salesOrdData.CustomerGroupMessage = " ";
				}
				if (reqMand.CurrencySLDCond === "REQUIRED" && salesOrdData.Currency.toString().trim() === "") {
					salesOrdData.CurrencyState = "Error";
					salesOrdData.CurrencyMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.CurrencyState = "None";
					salesOrdData.CurrencyMessage = " ";
				}
				if (reqMand.AcctAtCustSLDCond === "REQUIRED" && salesOrdData.AcctAtCust.toString().trim() === "") {
					salesOrdData.AcctAtCustState = "Error";
					salesOrdData.AcctAtCustMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.AcctAtCustState = "None";
					salesOrdData.AcctAtCustMessage = " ";
				}
				if (reqMand.ExchangeRateTypeSLDCond === "REQUIRED" && salesOrdData.ExchangeRateType.toString().trim() === "") {
					salesOrdData.ExchangeRateTypeState = "Error";
					salesOrdData.ExchangeRateTypeMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.ExchangeRateTypeState = "None";
					salesOrdData.ExchangeRateTypeMessage = " ";
				}
				if (reqMand.PriceGroupSLDCond === "REQUIRED" && salesOrdData.PriceGroup.toString().trim() === "") {
					salesOrdData.PriceGroupState = "Error";
					salesOrdData.PriceGroupMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.PriceGroupState = "None";
					salesOrdData.PriceGroupMessage = " ";
				}
				if (reqMand.CustPricProcSLDCond === "REQUIRED" && salesOrdData.CustPricProc.toString().trim() === "") {
					salesOrdData.CustPricProcState = "Error";
					salesOrdData.CustPricProcMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.CustPricProcState = "None";
					salesOrdData.CustPricProcMessage = " ";
				}
				if (reqMand.PriceListSLDCond === "REQUIRED" && salesOrdData.PriceList.toString().trim() === "") {
					salesOrdData.PriceListState = "Error";
					salesOrdData.PriceListMessage = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.PriceListState = "None";
					salesOrdData.PriceListMessage = " ";
				}
				if (reqMand.CustStatGrpSLDCond === "REQUIRED" && salesOrdData.CustStatGrp.toString().trim() === "") {
					salesOrdData.CustStatGrpState = "Error";
					salesOrdData.CustStatGrpMessag = " ";
					errCount++;
					countSDSalsOrd++;
				} else {
					salesOrdData.CustStatGrpState = "None";
					salesOrdData.CustStatGrpMessag = " ";
				}

				//shipping sales Data
				var salesShipp = salesData.Shipping;
				if (reqMand.DeliveryPrioritySLDCond === "REQUIRED" && salesShipp.DeliveryPriority.toString().trim() === "") {
					salesShipp.DeliveryPriorityState = "Error";
					salesShipp.DeliveryPriorityMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.DeliveryPriorityState = "None";
					salesShipp.DeliveryPriorityMessage = " ";
				}
				if (reqMand.ShippingConditionsSLDCond === "REQUIRED" && salesShipp.ShippingConditions.toString().trim() === "") {
					salesShipp.ShippingConditionsState = "Error";
					salesShipp.ShippingConditionsMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.ShippingConditionsState = "None";
					salesShipp.ShippingConditionsMessage = " ";
				}
				if (reqMand.DeliveryPlantSLDCond === "REQUIRED" && salesShipp.DeliveryPlant.toString().trim() === "") {
					salesShipp.DeliveryPlantState = "Error";
					salesShipp.DeliveryPlantMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.DeliveryPlantState = "None";
					salesShipp.DeliveryPlantMessage = " ";
				}
				if (reqMand.OrderCombinationSLDCond === "REQUIRED" && salesShipp.OrderCombination === false) {
					salesShipp.OrderCombinationState = "Error";
					salesShipp.OrderCombinationMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.OrderCombinationState = "None";
					salesShipp.OrderCombinationMessage = " ";
				}
				if (reqMand.RelevantforProdSLDCond === "REQUIRED" && salesShipp.RelevantforProd === false) {
					salesShipp.RelevantforProdState = "Error";
					salesShipp.RelevantforProdMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.RelevantforProdState = "None";
					salesShipp.RelevantforProdMessage = " ";
				}
				if (reqMand.ProductionTimeFrameSLDCond === "REQUIRED" && salesShipp.ProductionTimeFrame.toString().trim() === "") {
					salesShipp.ProductionTimeFrameState = "Error";
					salesShipp.ProductionTimeFrameMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.ProductionTimeFrameState = "None";
					salesShipp.ProductionTimeFrameMessage = " ";
				}
				if (reqMand.CompleteDeliveryRequiredSLDCond === "REQUIRED" && salesShipp.CompleteDeliveryRequired === false) {
					salesShipp.CompleteDeliveryRequiredState = "Error";
					salesShipp.CompleteDeliveryRequiredMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.CompleteDeliveryRequiredState = "None";
					salesShipp.CompleteDeliveryRequiredMessage = " ";
				}
				if (reqMand.PartialDeliveryPerItemSLDCond === "REQUIRED" && salesShipp.PartialDeliveryPerItem.toString() === "") {
					salesShipp.PartialDeliveryPerItemState = "Error";
					salesShipp.PartialDeliveryPerItemMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.PartialDeliveryPerItemState = "None";
					salesShipp.PartialDeliveryPerItemMessage = " ";
				}
				if (reqMand.MaxPartialDeliveriesSLDCond === "REQUIRED" && salesShipp.MaxPartialDeliveries.toString().trim() === "") {
					salesShipp.MaxPartialDeliveriesState = "Error";
					salesShipp.MaxPartialDeliveriesMessage = " ";
					errCount++;
					countSOshipp++;
				} else {
					salesShipp.MaxPartialDeliveriesState = "None";
					salesShipp.MaxPartialDeliveriesMessage = " ";
				}

				//billing Document Sales Data
				var salesBilliDoc = salesData.BillingDocument;
				if (reqMand.RebateSLDCond === "REQUIRED" && salesBilliDoc.Rebate === false) {
					salesBilliDoc.RebateState = "Error";
					salesBilliDoc.RebateMessage = " ";
					errCount++;
					countSDBillDoc++;
				} else {
					salesBilliDoc.RebateState = "None";
					salesBilliDoc.RebateMessage = " ";
				}

				if (reqMand.PriCeDeterminCond === "REQUIRED" && salesBilliDoc.PriceDetermination === false) {
					salesBilliDoc.PriceDeterminationState = "Error";
					salesBilliDoc.PriceDeterminationMessage = " ";
					errCount++;
					countSDBillDoc++;
				} else {
					salesBilliDoc.PriceDeterminationState = "None";
					salesBilliDoc.PriceDeterminationMessage = " ";
				}
				if (reqMand.InvoiceDatesSLDCond === "REQUIRED" && salesBilliDoc.InvoiceDates.toString().trim() === "") {
					salesBilliDoc.InvoiceDatesState = "Error";
					salesBilliDoc.InvoiceDatesMessage = " ";
					errCount++;
					countSDBillDoc++;
				} else {
					salesBilliDoc.InvoiceDatesState = "None";
					salesBilliDoc.InvoiceDatesMessage = " ";
				}
				if (reqMand.InvoiceListDatesSLDCond === "REQUIRED" && salesBilliDoc.InvoiceListDates.toString().trim() === "") {
					salesBilliDoc.InvoiceListDatesState = "Error";
					salesBilliDoc.InvoiceListDatesMessage = " ";
					errCount++;
					countSDBillDoc++;
				} else {
					salesBilliDoc.InvoiceListDatesState = "None";
					salesBilliDoc.InvoiceListDatesMessage = " ";
				}
				if (reqMand.Incoterms1SLDCond === "REQUIRED" && salesBilliDoc.Incoterms1.toString().trim() === "") {
					salesBilliDoc.Incoterms1State = "Error";
					salesBilliDoc.Incoterms1Message = " ";
					errCount++;
					countSDBillDoc++;
				} else {
					salesBilliDoc.Incoterms1State = "None";
					salesBilliDoc.Incoterms1Message = " ";
				}

				if (reqMand.Incoterms2SLDCond === "REQUIRED" && salesBilliDoc.Incoterms2.toString().trim() === "") {
					salesBilliDoc.Incoterms2State = "Error";
					salesBilliDoc.Incoterms2Message = " ";
					errCount++;
					countSDBillDoc++;
				} else {
					salesBilliDoc.Incoterms2State = "None";
					salesBilliDoc.Incoterms2Message = " ";
				}
				if (reqMand.TermsofPaymentSLDCond === "REQUIRED" && salesBilliDoc.TermsofPayment.toString().trim() === "") {
					salesBilliDoc.TermsofPaymentState = "Error";
					salesBilliDoc.TermsofPaymentMessage = " ";
					errCount++;
					countSDBillDoc++;
				} else {
					salesBilliDoc.TermsofPaymentState = "None";
					salesBilliDoc.TermsofPaymentMessage = " ";
				}
				if (reqMand.AccountAssignmentGroupSLDCond === "REQUIRED" && salesBilliDoc.AccountAssignmentGroup.toString().trim() === "") {
					salesBilliDoc.AccountAssignmentGroupState = "Error";
					salesBilliDoc.AccountAssignmentGroupMessage = " ";
					errCount++;
					countSDBillDoc++;
				} else {
					salesBilliDoc.AccountAssignmentGroupState = "None";
					salesBilliDoc.AccountAssignmentGroupMessage = " ";
				}

				//additional fields sales data
				var salesAdFields = salesData.AdditionalFields;
				if (reqMand.CustomerGroup1SLDCond === "REQUIRED" && salesAdFields.CustomerGroup1.toString().trim() === "") {
					salesAdFields.CustomerGroup1State = "Error";
					salesAdFields.CustomerGroup1Message = " ";
					errCount++;
					countAddFields++;
				} else {
					salesAdFields.CustomerGroup1State = "None";
					salesAdFields.CustomerGroup1Message = " ";
				}
				if (reqMand.CustomerGroup2SLDCond === "REQUIRED" && salesAdFields.CustomerGroup2.toString().trim() === "") {
					salesAdFields.CustomerGroup2State = "Error";
					salesAdFields.CustomerGroup2Message = " ";
					errCount++;
					countAddFields++;
				} else {
					salesAdFields.CustomerGroup2State = "None";
					salesAdFields.CustomerGroup2Message = " ";
				}
				if (reqMand.CustomerGroup3SLDCond === "REQUIRED" && salesAdFields.CustomerGroup3.toString().trim() === "") {
					salesAdFields.CustomerGroup3State = "Error";
					salesAdFields.CustomerGroup3Message = " ";
					errCount++;
					countAddFields++;
				} else {
					salesAdFields.CustomerGroup3State = "None";
					salesAdFields.CustomerGroup3Message = " ";
				}
				if (reqMand.CustomerGroup4SLDCond === "REQUIRED" && salesAdFields.CustomerGroup4.toString().trim() === "") {
					salesAdFields.CustomerGroup4State = "Error";
					salesAdFields.CustomerGroup4Message = " ";
					errCount++;
					countAddFields++;
				} else {
					salesAdFields.CustomerGroup4State = "None";
					salesAdFields.CustomerGroup4Message = " ";
				}
				if (reqMand.CustomerGroup5SLDCond === "REQUIRED" && salesAdFields.CustomerGroup5.toString().trim() === "") {
					salesAdFields.CustomerGroup5State = "Error";
					salesAdFields.CustomerGroup5Message = " ";
					errCount++;
					countAddFields++;
				} else {
					salesAdFields.CustomerGroup5State = "None";
					salesAdFields.CustomerGroup5Message = " ";
				}
				if (reqMand.CustomerGroup6SLDCond === "REQUIRED" && salesAdFields.CustomerGroup6.toString().trim() === "") {
					salesAdFields.CustomerGroup6State = "Error";
					salesAdFields.CustomerGroup6Message = " ";
					errCount++;
					countAddFields++;
				} else {
					salesAdFields.CustomerGroup6State = "None";
					salesAdFields.CustomerGroup6Message = " ";
				}

				this.getView().getModel("SalesDataSet").refresh();
			}

			var countPartFun = 0;
			if (hedrData.AccountGroup !== "" && hedrData.AccountGroup !== undefined) {
				var defPartFun = this.getView().getModel("DefaultGeneratedPartnerFnSet").getData().results.d.results;
				for (var z = 0; z < defPartFun.length; z++) {
					if (reqMand.PartFunDGCond === "REQUIRED" && defPartFun[z].PartnerFunction.toString().trim() === "") {
						defPartFun[z].PartFunState = "Error";
						defPartFun[z].PartFunMessage = " ";
						errCount++;
						countPartFun++;
					} else {
						defPartFun[z].PartFunState = "None";
						defPartFun[z].PartFunMessage = " ";
					}

					if (reqMand.NumDGCond === "REQUIRED" && defPartFun[z].Number.toString().trim() === "") {
						defPartFun[z].NumState = "Error";
						defPartFun[z].NumMessage = " ";
						errCount++;
						countPartFun++;
					} else {
						defPartFun[z].NumState = "None";
						defPartFun[z].NumMessage = " ";
					}

					if (reqMand.NameDGCond === "REQUIRED" && defPartFun[z].Name.toString().trim() === "") {
						defPartFun[z].NameState = "Error";
						defPartFun[z].NameMessage = " ";
						errCount++;
						countPartFun++;
					} else {
						defPartFun[z].NameState = "None";
						defPartFun[z].NameMessage = " ";
					}

					if (reqMand.PartDescDGCond === "REQUIRED" && defPartFun[z].PartnerDescription.toString().trim() === "") {
						defPartFun[z].PartDescState = "Error";
						defPartFun[z].PartDescMessage = " ";
						errCount++;
						countPartFun++;
					} else {
						defPartFun[z].PartDescState = "None";
						defPartFun[z].PartDescMessage = " ";
					}

					if (reqMand.DefaultDGCond === "REQUIRED" && defPartFun[z].Default === false) {
						defPartFun[z].DefaultState = "Error";
						defPartFun[z].DefaultMessage = " ";
						errCount++;
						countPartFun++;
					} else {
						defPartFun[z].DefaultState = "None";
						defPartFun[z].DefaultMessage = " ";
					}
				}
				this.getView().getModel("DefaultGeneratedPartnerFnSet").refresh();

				var otherPar = this.getView().getModel("OtherPartnerFunctionSet").getData().OtherPartnerFunctions;
				var otherPartVisible = this.getView().getModel("OtherPartnerFunctionSet").getData().DisplayOtherPartnerFunctions;

				if (otherPartVisible === true) {
					for (var z = 0; z < otherPar.length; z++) {

						if (reqMand.PartFunOPCond === "REQUIRED" && otherPar[z].PartnerFunction.toString().trim() === "") {
							otherPar[z].PartFunState = "Error";
							otherPar[z].PartFunMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							otherPar[z].PartFunState = "None";
							otherPar[z].PartFunMessage = " ";
						}

						if (reqMand.NumOPCond === "REQUIRED" && otherPar[z].Number.toString().trim() === "") {
							otherPar[z].NumState = "Error";
							otherPar[z].NumMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							otherPar[z].NumState = "None";
							otherPar[z].NumMessage = " ";
						}

						if (reqMand.NameOPCond === "REQUIRED" && otherPar[z].Name.toString().trim() === "") {
							otherPar[z].NameState = "Error";
							otherPar[z].NameMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							otherPar[z].NameState = "None";
							otherPar[z].NameMessage = " ";
						}

						if (reqMand.PartDescOPCond === "REQUIRED" && otherPar[z].PartnerDescriptionText.toString().trim() === "") {
							otherPar[z].PartDescState = "Error";
							otherPar[z].PartDescMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							otherPar[z].PartDescState = "None";
							otherPar[z].PartDescMessage = " ";
						}

						if (reqMand.DefaultOPCond === "REQUIRED" && otherPar[z].Default === false) {
							otherPar[z].DefaultState = "Error";
							otherPar[z].DefaultMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							otherPar[z].DefaultState = "None";
							otherPar[z].DefaultMessage = " ";
						}
					}
				}
				this.getView().getModel("OtherPartnerFunctionSet").refresh();

				var toBeLink = this.getView().getModel("SoldtoPartnerFunctionSet").getData().SoldtoPartnerFunctions;
				var toBeLinkVisible = this.getView().getModel("SoldtoPartnerFunctionSet").getData().DisplaySoldtoPartnerFunction;
				if (toBeLinkVisible === true) {
					for (var z = 0; z < toBeLink.length; z++) {

						if (reqMand.PartFunSOPCond === "REQUIRED" && toBeLink[z].PartnerFunction.toString().trim() === "") {
							toBeLink[z].PartFunState = "Error";
							toBeLink[z].PartFunMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							toBeLink[z].PartFunState = "None";
							toBeLink[z].PartFunMessage = " ";
						}

						if (reqMand.NumSOPCond === "REQUIRED" && toBeLink[z].Number.toString().trim() === "") {
							toBeLink[z].NumState = "Error";
							toBeLink[z].NumMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							toBeLink[z].NumState = "None";
							toBeLink[z].NumMessage = " ";
						}

						if (reqMand.NameSOPCond === "REQUIRED" && toBeLink[z].Name.toString().trim() === "") {
							toBeLink[z].NameState = "Error";
							toBeLink[z].NameMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							toBeLink[z].NameState = "None";
							toBeLink[z].NameMessage = " ";
						}

						if (reqMand.PartDescOPCond === "REQUIRED" && toBeLink[z].PartnerDescriptionText.toString().trim() === "") {
							toBeLink[z].PartDescState = "Error";
							toBeLink[z].PartDescMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							toBeLink[z].PartDescState = "None";
							toBeLink[z].PartDescMessage = " ";
						}

						if (reqMand.DefaultSOPCond === "REQUIRED" && toBeLink[z].Default === false) {
							toBeLink[z].DefaultState = "Error";
							toBeLink[z].DefaultMessage = " ";
							errCount++;
							countPartFun++;
						} else {
							toBeLink[z].DefaultState = "None";
							toBeLink[z].DefaultMessage = " ";
						}
					}
				}
				this.getView().getModel("SoldtoPartnerFunctionSet").refresh();
			}

			var countTaxClass = 0;
			if (hedrData.SalesOrgKey !== "" && hedrData.DistribChnnlKey !== "" && hedrData.SalesOrgKey !== undefined && hedrData.DistribChnnlKey !==
				undefined) {
				var taxClass = this.getView().getModel("TaxClassificationComboSet").getData().results.d.results;
				for (var lb = 0; lb < taxClass.length; lb++) {
					if (reqMand.TaxClassiSLDCond === "REQUIRED" && taxClass[lb].Taxclassification.toString().trim() === "") {
						taxClass[lb].TaxClassficationState = "Error";
						taxClass[lb].TaxClassficationMessage = " ";
						errCount++;
						countTaxClass++;
					} else {
						taxClass[lb].TaxClassficationState = "None";
						taxClass[lb].TaxClassficationMessage = " ";
					}
				}
				this.getView().getModel("TaxClassificationComboSet").refresh();
			}

			//Text Note
			//Note Text
			var dataTextNote = this.getView().getModel("TextNotesModelSet").getData();
			var TextNote = dataTextNote.TextNotes.TextNotes2;
			var countTextNote = 0;
			for (var m = 0; m < TextNote.length; m++) {
				if (reqMand.LevelTNCond === "REQUIRED" && TextNote[m].Level.toString().trim() === "") {
					TextNote[m].LevelState = "Error";
					TextNote[m].LevelMessage = " ";
					errCount++;
					countTextNote++;
				} else {
					TextNote[m].LevelState = "None";
					TextNote[m].LevelMessage = " ";
				}

				if (reqMand.LanguageTNCond === "REQUIRED" && TextNote[m].Language.toString().trim() === "") {
					TextNote[m].LanguageState = "Error";
					TextNote[m].LanguageMessage = " ";
					errCount++;
					countTextNote++;
				} else {
					TextNote[m].LanguageState = "None";
					TextNote[m].LanguageMessage = " ";
				}
				if (reqMand.TextTypeTNCond === "REQUIRED" && TextNote[m].TextType.toString().trim() === "") {
					TextNote[m].TextTypeState = "Error";
					TextNote[m].TextTypeMessage = " ";
					errCount++;
					countTextNote++;
				} else {
					TextNote[m].TextTypeState = "None";
					TextNote[m].TextTypeMessage = " ";
				}
				if (reqMand.FreeTextTNCond === "REQUIRED" && TextNote[m].FreeText.toString().trim() === "") {
					TextNote[m].FreeTextState = "Error";
					TextNote[m].FreeTextMessage = " ";
					errCount++;
					countTextNote++;
				} else {
					TextNote[m].FreeTextState = "None";
					TextNote[m].FreeTextMessage = " ";
				}

			}

			//Classification 
			var classTextNote = dataTextNote.Classification.Classification2;
			var countClassic = 0;
			//payload.TextNotes.TextClassification = [];
			for (var l = 0; l < classTextNote.length; l++) {
				if (reqMand.ClassificationTypeTNCond === "REQUIRED" && classTextNote[l].ClassificationType.toString().trim() === "") {
					classTextNote[l].ClassificationTypeState = "Error";
					classTextNote[l].ClassificationTypeMessage = " ";
					errCount++;
					countClassic++;
				} else {
					classTextNote[l].ClassificationTypeState = "None";
					classTextNote[l].ClassificationTypeMessage = " ";
				}

				if (reqMand.ClassificationTNCond === "REQUIRED" && classTextNote[l].Classification.toString().trim() === "") {
					classTextNote[l].ClassificationState = "Error";
					classTextNote[l].ClassificationMessage = " ";
					errCount++;
					countClassic++;
				} else {
					classTextNote[l].ClassificationState = "None";
					classTextNote[l].ClassificationMessage = " ";
				}
				if (reqMand.ValueTNCond === "REQUIRED" && classTextNote[l].Value.toString().trim() === "") {
					classTextNote[l].ValueState = "Error";
					classTextNote[l].ValueMessage = " ";
					errCount++;
					countClassic++;
				} else {
					classTextNote[l].ValueState = "None";
					classTextNote[l].ValueMessage = " ";
				}

			}
			this.getView().getModel("TextNotesModelSet").refresh();

			//Contact Details
			//contact details
			var contactDetTab = this.getView().getModel("ContactDetailsSet").getData();
			var conDetTeliphone = contactDetTab.ContactDetails.Telephone.TelephoneList;
			var countCompConDet = 0;
			for (var a = 0; a < conDetTeliphone.length; a++) {
				if (reqMand.TelephoneCond === "REQUIRED" && conDetTeliphone[a].Telephone.toString().trim() === "") {
					conDetTeliphone[a].TelephoneViewState = "Error";
					conDetTeliphone[a].TelephoneViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetTeliphone[a].TelephoneViewState = "None";
					conDetTeliphone[a].TelephoneViewMessage = " ";
				}

				if (reqMand.TeleExtCond === "REQUIRED" && conDetTeliphone[a].Extension.toString().trim() === "") {
					conDetTeliphone[a].ExtenViewState = "Error";
					conDetTeliphone[a].ExtenViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetTeliphone[a].ExtenViewState = "None";
					conDetTeliphone[a].ExtenViewMessage = " ";
				}

				if (reqMand.TeleCommentCond === "REQUIRED" && conDetTeliphone[a].Comments.toString().trim() === "") {
					conDetTeliphone[a].CommentViewState = "Error";
					conDetTeliphone[a].CommentViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetTeliphone[a].CommentViewState = "None";
					conDetTeliphone[a].CommentViewMessage = " ";
				}
			}

			//contact tab Fax
			var conDetFax = contactDetTab.ContactDetails.Fax.FaxList;
			for (var a = 0; a < conDetFax.length; a++) {

				if (reqMand.FaxCond === "REQUIRED" && conDetFax[a].Fax.toString().trim() === "") {
					conDetFax[a].FaxViewState = "Error";
					conDetFax[a].FaxViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetFax[a].FaxViewState = "None";
					conDetFax[a].FaxViewMessage = " ";
				}

				if (reqMand.FaxExtCond === "REQUIRED" && conDetFax[a].Extension.toString().trim() === "") {
					conDetFax[a].ExtenViewState = "Error";
					conDetFax[a].ExtenViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetFax[a].ExtenViewState = "None";
					conDetFax[a].ExtenViewMessage = " ";
				}

				if (reqMand.FaxCommentCond === "REQUIRED" && conDetFax[a].Comments.toString().trim() === "") {
					conDetFax[a].CommentViewState = "Error";
					conDetFax[a].CommentViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetFax[a].CommentViewState = "None";
					conDetFax[a].CommentViewMessage = " ";
				}
			}

			//contact tab Email
			var conDetEmail = contactDetTab.ContactDetails.Email.EmailList;
			for (var b = 0; b < conDetEmail.length; b++) {

				if (reqMand.EmailCond === "REQUIRED" && conDetEmail[b].Email.toString().trim() === "") {
					conDetEmail[b].EmailValueState = "Error";
					conDetEmail[b].EmailValueStateText = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetEmail[b].EmailValueState = "None";
					conDetEmail[b].EmailValueStateText = " ";
				}

				if (reqMand.EmailCommentCond === "REQUIRED" && conDetEmail[b].Comments.toString().trim() === "") {
					conDetEmail[b].CommentViewState = "Error";
					conDetEmail[b].CommentViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetEmail[b].CommentViewState = "None";
					conDetEmail[b].CommentViewMessage = " ";
				}
			}

			//contact tab URL
			var conDetUrl = contactDetTab.ContactDetails.URL.URLList;
			for (var c = 0; c < conDetUrl.length; c++) {
				if (reqMand.URLCond === "REQUIRED" && conDetUrl[c].URL.toString().trim() === "") {
					conDetUrl[c].UrlViewState = "Error";
					conDetUrl[c].UrlViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetUrl[c].UrlViewState = "None";
					conDetUrl[c].UrlViewMessage = " ";
				}

				if (reqMand.URLCommentCond === "REQUIRED" && conDetUrl[c].Comments.toString().trim() === "") {
					conDetUrl[c].CommentViewState = "Error";
					conDetUrl[c].CommentViewMessage = " ";
					errCount++;
					countCompConDet++;
				} else {
					conDetUrl[c].CommentViewState = "None";
					conDetUrl[c].CommentViewMessage = " ";
				}

			}
			//UI Not there
			var telBoxNo = contactDetTab.ContactDetails.Telebox;

			if (reqMand.TeleboxNumCond === "REQUIRED" && telBoxNo.TeleboxNO.toString().trim() === "") {
				telBoxNo.TeleboxState = "Error";
				telBoxNo.TeleboxMesage = " ";
				errCount++;
				countCompConDet++;
			} else {
				telBoxNo.TeleboxState = "None";
				telBoxNo.TeleboxMesage = " ";
			}
			//payload.ContactDetails.CompanyContactDetail.Telebox_Number = contactDetTab.ContactDetails.

			//contact persn Contact Det Tab
			var contPerson = contactDetTab.ContactDetails.ContactPerson.ContactPersonList;
			var countContPer = 0;
			for (var d = 0; d < contPerson.length; d++) {
				if (reqMand.LangCPCond === "REQUIRED" && contPerson[d].Language.toString().trim() === "") {
					contPerson[d].LanguageState = "Error";
					contPerson[d].LanguageMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].LanguageState = "None";
					contPerson[d].LanguageMessage = " ";
				}

				if (reqMand.LastNameCPCond === "REQUIRED" && contPerson[d].LastName.toString().trim() === "") {
					contPerson[d].LastNameState = "Error";
					contPerson[d].LastNameMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].LastNameState = "None";
					contPerson[d].LastNameMessage = " ";
				}

				if (reqMand.FirstNameCPCond === "REQUIRED" && contPerson[d].FirstName.toString().trim() === "") {
					contPerson[d].FirstNameState = "Error";
					contPerson[d].FirstNameMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].FirstNameState = "None";
					contPerson[d].FirstNameMessage = " ";
				}

				if (reqMand.FunctionCPCond === "REQUIRED" && contPerson[d].Function.toString().trim() === "") {
					contPerson[d].FunctionState = "Error";
					contPerson[d].FunctionMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].FunctionState = "None";
					contPerson[d].FunctionMessage = " ";
				}

				if (reqMand.DepartmentCPCond === "REQUIRED" && contPerson[d].Department.toString().trim() === "") {
					contPerson[d].DepartmentState = "Error";
					contPerson[d].DepartmentMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].DepartmentState = "None";
					contPerson[d].DepartmentMessage = " ";
				}

				if (reqMand.TelephoneCPCond === "REQUIRED" && contPerson[d].Telephone.toString().trim() === "") {
					contPerson[d].TelephoneState = "Error";
					contPerson[d].TelephoneMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].TelephoneState = "None";
					contPerson[d].TelephoneMessage = " ";
				}

				if (reqMand.TelebExtCPCond === "REQUIRED" && contPerson[d].TelephoneExtension.toString().trim() === "") {
					contPerson[d].TelepExtensionState = "Error";
					contPerson[d].TelepExtensionMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].TelepExtensionState = "None";
					contPerson[d].TelepExtensionMessage = " ";
				}

				if (reqMand.FaxCPCond === "REQUIRED" && contPerson[d].Fax.toString().trim() === "") {
					contPerson[d].FaxState = "Error";
					contPerson[d].FaxMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].FaxState = "None";
					contPerson[d].FaxMessage = " ";
				}

				if (reqMand.FaxExtenCPCond === "REQUIRED" && contPerson[d].FaxExtension.toString().trim() === "") {
					contPerson[d].FaxExtensionState = "Error";
					contPerson[d].FaxExtensionMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].FaxExtensionState = "None";
					contPerson[d].FaxExtensionMessage = " ";
				}

				if (reqMand.MobilePhoneCPCond === "REQUIRED" && contPerson[d].MobilePhone.toString().trim() === "") {
					contPerson[d].MobilePhoneState = "Error";
					contPerson[d].MobilePhoneMessage = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].MobilePhoneState = "None";
					contPerson[d].MobilePhoneMessage = " ";
				}

				if (reqMand.EmailCPCond === "REQUIRED" && contPerson[d].Email.toString().trim() === "") {
					contPerson[d].EmailValueState = "Error";
					contPerson[d].EmailValueStateText = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].EmailValueState = "None";
					contPerson[d].EmailValueStateText = " ";
				}

				if (reqMand.MethodCPCond === "REQUIRED" && contPerson[d].Method.toString().trim() === "") {
					contPerson[d].MethodState = "Error";
					contPerson[d].MethodStateText = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].MethodState = "None";
					contPerson[d].MethodStateText = " ";
				}

				if (reqMand.NotesCPCond === "REQUIRED" && contPerson[d].Notes.toString().trim() === "") {
					contPerson[d].NotesState = "Error";
					contPerson[d].MethodStateText = " ";
					errCount++;
					countContPer++;
				} else {
					contPerson[d].NotesState = "None";
					contPerson[d].NotesMessage = " ";
				}

			}
			this.getView().getModel("ContactDetailsSet").refresh();

			if (errCount > 0) {

				var arryError = [];
				if (countNameAndAddress > 0) {
					arryError.push({
						Title: "Business Partner Data => Name & Address",
						Type: "Error"
					});
				}

				if (countTaxData > 0) {
					arryError.push({
						Title: "Business Partner Data => Tax Data",
						Type: "Error"
					});
				}

				if (countCustClass > 0) {
					arryError.push({
						Title: "Business Partner Data => Customer Classification",
						Type: "Error"
					});
				}

				if (countExterIdent > 0) {
					arryError.push({
						Title: "Business Partner Data => External Identifier",
						Type: "Error"
					});
				}

				if (errGenData > 0) {
					arryError.push({
						Title: "Customer Data => General Data",
						Type: "Error"
					});
				}

				if (countBankDet > 0) {
					arryError.push({
						Title: "Customer Data => Bank Details",
						Type: "Error"
					});
				}

				if (countUnlodPoint > 0) {
					arryError.push({
						Title: "Customer Data => Unloading Points",
						Type: "Error"
					});
				}

				if (countCompConDet > 0) {
					arryError.push({
						Title: "Contact Details => Company Contact Detail",
						Type: "Error"
					});
				}
				if (countContPer > 0) {
					arryError.push({
						Title: "Contact Details => Contact Persons",
						Type: "Error"
					});
				}

				if (countAccountMng > 0) {
					arryError.push({
						Title: "Accounting Data => Account Management",
						Type: "Error"
					});
				}

				if (countPaymentData > 0) {
					arryError.push({
						Title: "Accounting Data => Payment Data",
						Type: "Error"
					});
				}

				if (countAccCorresp > 0) {
					arryError.push({
						Title: "Accounting Data => Correspondence",
						Type: "Error"
					});
				}

				if (countSDSalsOrd > 0) {
					arryError.push({
						Title: "Sales Data => Sales Order",
						Type: "Error"
					});
				}

				if (countSOshipp > 0) {
					arryError.push({
						Title: "Sales Data => Shipping",
						Type: "Error"
					});
				}

				if (countSDBillDoc > 0) {
					arryError.push({
						Title: "Sales Data => Billing Document",
						Type: "Error"
					});
				}

				if (countTaxClass > 0) {
					arryError.push({
						Title: "Sales Data => Billing Document => Tax Country & Tax Classification",
						Type: "Error"
					});
				}
				if (countPartFun > 0) {
					arryError.push({
						Title: "Sales Data => Partner Functions",
						Type: "Error"
					});
				}

				if (countAddFields > 0) {
					arryError.push({
						Title: "Sales Data => Additional Fields",
						Type: "Error"
					});
				}

				if (countTextNote > 0) {
					arryError.push({
						Title: "Text Notes => Text Notes",
						Type: "Error"
					});
				}

				if (countClassic > 0) {
					arryError.push({
						Title: "Text Notes => Classification",
						Type: "Error"
					});
				}

				arryError.push({
					Title: "Accounting Data tab is dependent on Company Code selection",
					Type: "Information"
				});

				arryError.push({
					Title: "Partner Function in Sales Data tab is dependent on Account Group selection",
					Type: "Information"
				});

				if (!this.errorMessageListFrag) {
					this.errorMessageListFrag = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.ErrorMessageList", this);
					this.getView().addDependent(this.errorMessageListFrag);
				}
				var oMainModel2 = new sap.ui.model.json.JSONModel({
					"results": arryError
				});
				this.errorMessageListFrag.setModel(oMainModel2, "ErrorModelSet");
				this.errorMessageListFrag.openBy(oEvent.getSource());

				sap.m.MessageToast.show(this.i18nModel.getProperty("fillAllMandatoryFields"));
				//return;
			} else {
				this.onPressSubmitCustomerCreate("New");
			}
		},

		onPressCancelErrorDialog: function() {
			this.errorMessageListFrag.close();
		},

		//add customer Bank 
		addNewBankDetailsForCustomerDetails: function() {
			var dataModel = this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan;
			if (dataModel.length >= 5) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("onlyFiveBankDetailsAllowed"));
				return;
			}
			var errCount = 0;
			for (var j = 0; j < dataModel.length; j++) {
				if (dataModel[j].Country.toString().trim() === "") {
					dataModel[j].CountryValState = "Error";
					errCount++;
				} else {
					dataModel[j].CountryValState = "None";
				}

				if (dataModel[j].BankKey.toString().trim() === "") {
					dataModel[j].BankKeyValState = "Error";
					errCount++;
				} else {
					dataModel[j].BankKeyValState = "None";
				}

				if (dataModel[j].BankAccount.toString().trim() === "") {
					dataModel[j].BankAccountValState = "Error";
					errCount++;
				} else {
					dataModel[j].BankAccountValState = "None";
				}
			}

			if (errCount > 0) {
				this.getView().getModel("CustomerDataSet").refresh();
				sap.m.MessageToast.show(this.i18nModel.getProperty("enterValidBankDetailsMsg"));
				return;
			}

			for (var i = 0; i < dataModel.length; i++) {
				dataModel[i].TotalCount = (i + 1) + " of " + (dataModel.length + 1);
				dataModel[i].VisibleBasedOnNext = false;
			}
			dataModel.push({
				IBan: "",
				Country: "",
				BankKey: "",
				BankControlKey: "",
				BankAccount: "",
				BankAccHolder: "",
				BankType: "",
				RefDetails: "",
				IBanEnabled: true,
				BankDetailsEnabled: true,
				CollectionAuth: false,
				TotalCount: (dataModel.length + 1) + " of " + (dataModel.length + 1),
				VisibleBasedOnNext: true,

				IBanValState: "None",
				CountryValState: "None",
				BankKeyValState: "None",
				BankControlKeyValState: "None",
				BankAccountValState: "None",
				BankAccHolderValState: "None",
				BankTypeValState: "None",
				RefDetailsValState: "None",
				CollectionAuthValState: "None"
			});
			this.getView().getModel("CustomerDataSet").refresh();
		},

		//add unloading points
		addNewUnloadingPointsCustomerDetails: function() {
			var dataModel = this.getView().getModel("CustomerDataSet").getData().UnloadingPoint.UnloadPointArr;
			if (dataModel.length >= 5) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("onlyTwoUnloadingPointsAllowed"));
				return;
			}

			////// check mandatory
			var errCount = 0;
			for (var r = 0; r < dataModel.length; r++) {
				if (dataModel[r].UnloadPoint.toString().trim() === "") {
					dataModel[r].UnloadPointState = "Error";
					errCount++;
				} else {
					dataModel[r].UnloadPointState = "None";
				}

				if (dataModel[r].CalenderKey.toString().trim() === "") {
					dataModel[r].CalenderKeyState = "Error";
					errCount++;
				} else {
					dataModel[r].CalenderKeyState = "None";
				}
			}

			if (errCount > 0) {
				sap.m.MessageToast.show(this.i18nModel.getProperty(
					"unloadingPointsAndCalenderKeyAreMandatory"));
				this.getView().getModel("CustomerDataSet").refresh();
				return;
			}

			for (var i = 0; i < dataModel.length; i++) {
				dataModel[i].TotalCount = (i + 1) + " of " + (dataModel.length + 1),
					dataModel[i].VisibleBasedOnNext = false;
			}
			dataModel.push({
				UnloadPoint: "",
				GoodsRecHrs: "",
				Default: false,
				CalenderKey: "",

				UnloadPointState: "None",
				UnloadPointMessage: " ",
				GoodsRecHrsState: "None",
				GoodsRecHrsMessage: " ",
				DefaultState: "None",
				DefaultMessage: " ",
				CalenderKeyState: "None",
				CalenderKeyMessage: " ",
				TotalCount: (dataModel.length + 1) + " of " + (dataModel.length + 1),
				VisibleBasedOnNext: true,
				DayTable: [{
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Monday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,

					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Tuesday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,

					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Wednesday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,

					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Thursday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,

					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Friday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,

					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Saturday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,

					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Sunday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,

					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}]
			});
			this.getView().getModel("CustomerDataSet").refresh();
		},
		//delete customer bank Details
		deleteBankDetailsForCustomerDetails: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan;
			if (dataModel.length > 1) {
				dataModel.splice(selectedRow, 1);
				for (var i = 0; i < dataModel.length; i++) {
					dataModel[i].TotalCount = (i + 1) + " of " + dataModel.length;
					if (i === (dataModel.length - 1)) {
						dataModel[i].VisibleBasedOnNext = true;
					} else {
						dataModel[i].VisibleBasedOnNext = false;
					}
				}
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("notAllowToDeleteLastBankDetails"));
			}
			this.getView().getModel("CustomerDataSet").refresh();
		},

		//delete unloading points
		deleteUnloadingPointsForCustomerDetails: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("CustomerDataSet").getData().UnloadingPoint.UnloadPointArr;
			if (dataModel.length > 1) {
				dataModel.splice(selectedRow, 1);
				for (var i = 0; i < dataModel.length; i++) {
					dataModel[i].TotalCount = (i + 1) + " of " + dataModel.length;
					if (i === (dataModel.length - 1)) {
						dataModel[i].VisibleBasedOnNext = true;
					} else {
						dataModel[i].VisibleBasedOnNext = false;
					}
				}
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("notAllowToDeleteLastUnloadingPoints"));
			}
			this.getView().getModel("CustomerDataSet").refresh();
		},
		//next
		nextBankDetailsCustData: function(oEvent) {
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan;
			if (dataModel.length > parseInt(selectedRow) + 1) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) + 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("nextBankDetailsNotavailable"));
			}
			this.getView().getModel("CustomerDataSet").refresh();
			oBusyDialog.close();
		},

		//next Unloading Points
		nextUnloadingPointsCustData: function(oEvent) {
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("CustomerDataSet").getData().UnloadingPoint.UnloadPointArr;
			if (dataModel.length > parseInt(selectedRow) + 1) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) + 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("nextUnoadingPointssNotavailable"));
			}
			this.getView().getModel("CustomerDataSet").refresh();
			oBusyDialog.close();
		},

		//privious
		priviosBankDetailsCustData: function(oEvent) {
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan;
			if (parseInt(selectedRow) > 0) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) - 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("priviosBankDetailsNotavailable"));
			}
			this.getView().getModel("CustomerDataSet").refresh();
			oBusyDialog.close();
		},

		//privios unloading points
		priviosUnloadingPointsCustData: function(oEvent) {
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("CustomerDataSet").getData().UnloadingPoint.UnloadPointArr;
			if (parseInt(selectedRow) > 0) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) - 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("priviosUnloadingPointsNotavailable"));
			}
			this.getView().getModel("CustomerDataSet").refresh();
			oBusyDialog.close();
		},

		//genral data customer Data
		liveChangeAltBusnessNameCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
		},

		//live change serch term 2
		liveChangeSearchTerm1CD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
		},

		//live change search Tearm 1
		liveChangeSearchTerm2CD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
		},

		//live change communication group
		liveChangeCommunicationLanguageCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//live change Autho group
		liveChangeAuthorizationGroupCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
		},

		//live change vendor num
		liveChangeVendorNumCD: function(oEvent) {
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,10})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
			this.onChangeCustomerDataGenralData(oEvent);
		},

		//change transportaion zone
		liveChangeTransportationZoneCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//change Alt transportaion zone
		liveChangeAltTransportationZoneCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//reg structure group change
		liveChangeRegStructGrpCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//group key change
		liveChangeGroupKeyCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//trading partner chnage
		liveChangeTradingPartnerCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
		},

		//civil usg
		onSelectMainlyCivilUsgCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
		},

		//on chnage mailitary Usg
		onSelectMainlyMailitaryUsgCD: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
		},

		//location 1
		liveChangeLocationNo1: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,7})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);

		},

		//location 2
		liveChangeLocationNo2: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,5})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
		},

		//digit 
		liveChangeCheckDigit: function(oEvent) {
			this.onChangeCustomerDataGenralData(oEvent);
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,1})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
		},

		//on change custer data genral details
		onChangeCustomerDataGenralData: function(oEvent) {
			var genDataCD = this.getView().getModel("CustomerDataSet").getData().GenData;
			genDataCD.UiCustGenDataValidated = false;
			this.getView().getModel("CustomerDataSet").refresh();
			oEvent.getSource().setValueState("None");
		},

		//live change unloading point
		liveChangeUnloadingPoints: function(oEvent) {
			oEvent.getSource().setValue(oEvent.getParameters().value);
			oEvent.getSource().setValueState("None");
			this.onChangeCustomerDataUnloadingPoints(oEvent);
			var rowId = oEvent.getSource().sId.split("-").pop();
			this.clearGoodsRecHrBasedOnUnloadPntAndCalenderKey(rowId);
		},

		clearGoodsRecHrBasedOnUnloadPntAndCalenderKey: function(rowId) {
			var arr = [];
			var unloadPointCD = this.getView().getModel("CustomerDataSet").getData().UnloadingPoint.UnloadPointArr[rowId];
			if (unloadPointCD.UnloadPoint !== undefined && unloadPointCD.UnloadPoint.trim() !== "" && unloadPointCD.CalenderKey !== undefined &&
				unloadPointCD.CalenderKey.trim() !== "") {
				//if unloading points is there then if
				if (unloadPointCD.GoodsRecHrs === undefined || unloadPointCD.GoodsRecHrs.trim() === "") {
					for (var i = 0; i < unloadPointCD.DayTable.length; i++) {
						unloadPointCD.DayTable[i].MornOpnEnable = true;
						unloadPointCD.DayTable[i].MornCloseEnable = true;
						unloadPointCD.DayTable[i].AfterOpnEnable = true;
						unloadPointCD.DayTable[i].AfterCloseEnable = true;
					}

				}

			} else {
				unloadPointCD.GoodsRecHrs = "";
				arr = [{
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Monday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Tuesday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"

				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Wednesday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Thursday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"

				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Friday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"

				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Saturday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Sunday",
					MornOpnEnable: false,
					MornCloseEnable: false,
					AfterOpnEnable: false,
					AfterCloseEnable: false,
					MorningOpenMessage: " ",
					MorningOpenState: "None",
					MorningClosenMessage: " ",
					MorningCloseState: "None",
					AfternoonOpenMessage: " ",
					AfternoonOpenState: "None",
					AfternoonCloseMessage: " ",
					AfternoonCloseState: "None"
				}];

				unloadPointCD.DayTable = arr;
			}
			this.getView().getModel("CustomerDataSet").refresh();
		},

		//live chnage goods reciving 
		liveChangeGoodsRecivingHrs: function(oEvent) {
			this.onChangeCustomerDataUnloadingPoints(oEvent);
			oEvent.getSource().setValueState("None");
			var rowId = oEvent.getSource().sId.split("-").pop();
			if (oEvent.getSource().getSelectedItem() !== null) {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("GoodsRecCDCombSet").getObject().Wanid;
				this.readDayTableDataBasedOnGoodsRecvHrs(selObj, rowId);
			} else {
				oEvent.getSource().setValue("");
				var arr = [{
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Monday",
					MornOpnEnable: true,
					MornCloseEnable: true,
					AfterOpnEnable: true,
					AfterCloseEnable: true
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Tuesday",
					MornOpnEnable: true,
					MornCloseEnable: true,
					AfterOpnEnable: true,
					AfterCloseEnable: true
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Wednesday",
					MornOpnEnable: true,
					MornCloseEnable: true,
					AfterOpnEnable: true,
					AfterCloseEnable: true
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Thursday",
					MornOpnEnable: true,
					MornCloseEnable: true,
					AfterOpnEnable: true,
					AfterCloseEnable: true
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Friday",
					MornOpnEnable: true,
					MornCloseEnable: true,
					AfterOpnEnable: true,
					AfterCloseEnable: true
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Saturday",
					MornOpnEnable: true,
					MornCloseEnable: true,
					AfterOpnEnable: true,
					AfterCloseEnable: true
				}, {
					Morningopen: null,
					Morningclose: null,
					Afternoonopen: null,
					Afternoonclose: null,
					Weekday: "Sunday",
					MornOpnEnable: true,
					MornCloseEnable: true,
					AfterOpnEnable: true,
					AfterCloseEnable: true
				}];
			}
			this.getView().getModel("CustomerDataSet").getData().UnloadingPoint.UnloadPointArr[rowId].DayTable = arr;
			this.getView().getModel("CustomerDataSet").refresh();
		},

		//on select default
		onSelectDefaultCD: function(oEvent) {
			oEvent.getSource().setValueState("None");
			this.onChangeCustomerDataUnloadingPoints(oEvent);
			var unlPoints = this.getView().getModel("CustomerDataSet").getData().UnloadingPoint.UnloadPointArr;
			if (oEvent.getParameters().selected) {
				var defCount = 0;
				for (var i = 0; i < unlPoints.length; i++) {
					if (unlPoints[i].Default === true) {
						defCount++;
					}
				}
				if (defCount > 1) {
					oEvent.getSource().setSelected(false);
					sap.m.MessageToast.show(this.i18nModel.getProperty("onlyOneDefaultAllowed"));
				}
			}
		},

		//on change calender key
		onChnageCalenderKeyCD: function(oEvent) {
			this.onChangeCustomerDataUnloadingPoints(oEvent);
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
			var rowId = oEvent.getSource().sId.split("-").pop();
			this.clearGoodsRecHrBasedOnUnloadPntAndCalenderKey(rowId);
		},

		//change part for customer data Unloading point
		onChangeCustomerDataUnloadingPoints: function(oEvent) {
			var unlPointsCD = this.getView().getModel("CustomerDataSet").getData().UnloadingPoint;
			unlPointsCD.UiCustUnlodPointValidated = false;
			this.getView().getModel("CustomerDataSet").refresh();
			oEvent.getSource().setValueState("None");
		},

		//Text Note
		textNoteTabInitialModelCreate: function(Data) {
			var data2 = {
				TextNotes: {
					TextNotes2: [{
						Level: "",
						Language: "",
						TextType: "",
						FreeText: "",
						enable: false,
						LevelMessage: "",
						LevelState: "None",
						LanguageMessage: "",
						LanguageState: "None",
						TextTypeMessage: "",
						TextTypeState: "None",
						FreeTextMessage: "",
						FreeTextState: "None",
						TextTypeArray: []
					}]

				},
				Classification: {
					Classification2: [{
						"ClassificationType": "",
						"Classification": "",
						"Value": "",
						"ClassificationTypeMessage": "",
						"ClassificationTypeState": "None",
						"ClassificationMessage": "",
						"ClassificationState": "None",
						"ValueMessage": "",
						"ValueState": "None",
						"ClassiFicationArray": [],
						"ValueArray": []
					}]
				}

			};
			var oMainModel2 = new sap.ui.model.json.JSONModel(data2);
			this.getView().setModel(oMainModel2, "TextNotesModelSet");
		},

		///////////////////////////////////////Text Note Venkat code start////////////////////////
		//code for Text Notes Language ComboBox

		onTextNotesLangguage: function() {
			var that = this;
			this.getView().getModel("HeaderModelSet").refresh();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ',
				'/RESTAdapter/REST_SAP/ZSD_MDM_TEXTNOTES_API_SRV/Input_HelpSet?System_Name=' + system + '&expand=NavLanguage');

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataAfterParse = JSON.parse(oData.results[0].Response);
							var dataOut = dataAfterParse.d.results[0];
							var oODataJSONModel = new sap.ui.model.json.JSONModel({
								"results": dataOut.NavLanguage.results
							});
							oODataJSONModel.setSizeLimit(dataOut.NavLanguage.results.length);
							that.getView().setModel(oODataJSONModel, "languageSet");
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});

		},
		//////////////////////Text Notes Level Combobox change Event///////////////////

		//////////////////please check this logic///////////////////////

		//code for TextNotes Level combobox Change event

		onChnageLevelTextNotes: function(oEvent) {

			var that = this;
			var oGT = [];
			var mainModel = oEvent.getSource().getBindingContext("TextNotesModelSet").getObject();
			if (oEvent.getSource().getSelectedItem() !== null) {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("textNotesLevelSet").getObject();
				oGT = selObj.NavTextType.results;
				if (oGT.length === undefined) {
					oGT.push(oGT);
				}
			} else {
				oEvent.getSource().setValue("");
			}
			/*	var oSTModel = new sap.ui.model.json.JSONModel({
					"results": oGT
				});*/
			mainModel.TextTypeArray = JSON.parse(JSON.stringify(oGT));
			/*	oSTModel.setSizeLimit(oGT.length);
				that.getView().setModel(oSTModel, "textTypeSet");*/
			mainModel.TextType = "";
			mainModel.LevelMessage = "";
			mainModel.LevelState = "None";

			mainModel.TextTypeMessage = "";
			mainModel.TextTypeState = "None";
			this.getView().getModel("TextNotesModelSet").refresh();
		},

		onChangeLanguageTextNotes: function(oEvent) {
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
			oEvent.getSource().setValueState("None");
		},

		////////////////////////logic for TextNotes classificationType combobox/////////////////////////////

		//code for TextNotes Classification Type combobox

		onTextNotesClassification: function() {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.getView().getModel("HeaderModelSet").refresh();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				'/RESTAdapter/REST_SAP/ZSD_MDM_TEXTNOTES_API_SRV/Classification_TypeSet?System_Name=' + system +
				'&expand=NavClassification,NavValue');

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
							var dataOut = dataAfterParse.d.results[0];
							if (dataOut.length === undefined) {
								dataResultArr = Array(dataOut);
							} else {
								dataResultArr = dataOut.NavClassification.results;
							}
						}
						var oCModel = new sap.ui.model.json.JSONModel({
							"results": dataResultArr
						});
						oCModel.setSizeLimit(dataResultArr.length);
						that.getView().setModel(oCModel, "classificationTypeSet");

						that.bindTextNoteF4ValuesBasedOnFirstF4Classific();
						//Resubmit & Review scenario
						that.bindTextClassification();
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});

		},

		/////////////logic for TextNotes  classificationType Change Event/////////////////////////////////////////

		//code for TextNotes classification Type Combobox Change Event 

		onChangeclassificationTypeSet: function(oEvent) {

			var that = this;
			var mainModel = oEvent.getSource().getBindingContext("TextNotesModelSet").getObject();
			if (oEvent.getSource().getSelectedItem() !== null) {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("classificationTypeSet").getObject();
				mainModel.ClassiFicationArray = selObj.NavClassification.results;
				mainModel.ValueArray = selObj.NavValue.results;
			} else {
				oEvent.getSource().setValue("");
				mainModel.ClassiFicationArray = [];
				mainModel.ValueArray = [];
			}
			mainModel.Classification = "";
			mainModel.Value = "";
			mainModel.ClassificationTypeMessage = "";
			mainModel.ClassificationTypeState = "None";
			mainModel.ClassificationMessage = "";
			mainModel.ClassificationState = "None";
			mainModel.ValueMessage = "";
			mainModel.ValueState = "None";
			this.getView().getModel("TextNotesModelSet").refresh();

		},

		/////////////////logic for + button /////////////////////////

		//code for TextNotes + Button

		onPressAddTextNotes: function() {

			this.getView().getModel("TextNotesModelSet").refresh();

			var data = this.getView().getModel("TextNotesModelSet").getData().TextNotes;
			var errCount = 0;
			for (var i = 0; i < data.TextNotes2.length; i++) {
				if (data.TextNotes2[i].Level.toString().trim() === "") {
					data.TextNotes2[i].LevelState = "Error";
					data.TextNotes2[i].LevelMessage = " ";
					errCount++;
				} else {
					data.TextNotes2[i].LevelState = "None";
					data.TextNotes2[i].LevelMessage = " ";
				}

				if (data.TextNotes2[i].TextType.toString().trim() === "") {
					data.TextNotes2[i].TextTypeState = "Error";
					data.TextNotes2[i].TextTypeMessage = " ";
					errCount++;
				} else {
					data.TextNotes2[i].TextTypeState = "None";
					data.TextNotes2[i].TextTypeMessage = " ";
				}
			}

			if (errCount > 0) {
				this.getView().getModel("TextNotesModelSet").refresh();
				sap.m.MessageToast.show(this.i18nModel.getProperty(
					"enterLevelAndTextTypeTextNote"));
				return;
			}

			data.TextNotes2.push({
				Level: "",
				Language: "",
				TextType: "",
				FreeText: "",
				enable: false,
				LevelMessage: "",
				LevelState: "None",

				LanguageMessage: "",
				LanguageState: "None",

				TextTypeMessage: "",
				TextTypeState: "None",

				FreeTextMessage: "",
				FreeTextState: "None",
				TextTypeArray: []
			});
			this.getView().getModel("TextNotesModelSet").refresh();

		},

		///////////////////////////////////locgic for TextNotes TextArea Dialog/////////////////////////

		onPressAddPopupTextNotes: function(oEvent) {
			this.rowSelForTextNoteCmt = oEvent.getSource().sId.split("-").pop();
			if (!this.TAD) {
				this.TAD = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.TextNotesValuePopup", this);
				this.getView().addDependent(this.TAD);
			}
			var oI = oEvent.getSource().getBindingContext("TextNotesModelSet").getObject("FreeText");
			var oTArea = this.getView().getModel("TextNotesModelSet");
			oTArea.setProperty("/TextAreaPopup", oI);
			this.TAD.open();

		},
		onPressOkValuePopup: function() {
			this.TAD.close();
			var data = this.getView().getModel("TextNotesModelSet").getData().TextNotes.TextNotes2[this.rowSelForTextNoteCmt];
			var oTArea = this.getView().getModel("TextNotesModelSet");
			data.FreeText = oTArea.getProperty("/TextAreaPopup");
			this.getView().getModel("TextNotesModelSet").refresh();
		},
		onPressCancelValuePopup: function() {
			this.TAD.close();
		},

		//////////////////////////////// Text Notes Free Text Input  LiveChange Event/////////////////////////////

		//code for Text Notes Free Text Input Field  LiveChange Event

		onPressTextLengthInput: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var oSelData = oEvent.getSource().getBindingContext("TextNotesModelSet").getObject();
			var oLevel = oSelData.Level;
			var oTextType = oSelData.TextType;
			if (oLevel.toString().trim() === "" || oTextType.toString().trim() === "") {
				oEvent.getSource().setValue("");
				sap.m.MessageBox.error(this.getView().getModel("i18n").getProperty("LevelTextTypefieldsaremandatory"));
				return;
			}
			oEvent.getSource().setValue(oEvent.getParameters().value);
		},

		////////////////////Text Level///////////////////////

		onTextnotesLevel: function() {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.getView().getModel("HeaderModelSet").refresh();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ',
				'/RESTAdapter/REST_SAP_JSON/ZSD_MDM_TEXTNOTES_API_SRV/LevelSet?System_Name=' + system + '&expand=NavTextType');
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var oL = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataAfterParse = JSON.parse(oData.results[0].Response);
							if (dataAfterParse.d.results === undefined) {
								dataAfterParse.d.results = [];
							}
							//var oLArray = [];
							oL = JSON.parse(oData.results[0].Response).d.results;
						}

						var oLevelModel = new sap.ui.model.json.JSONModel({
							"results": oL
						});
						oLevelModel.setSizeLimit(oL.length);
						that.getView().setModel(oLevelModel, "textNotesLevelSet");
						that.bindTextNoteF4ValuesBasedOnFirstF4TextNotes();
						//Resubmit & Review scenario
						that.bindTextNotes();

					},
					error: function(oError) {

						oBusyDialog.close();
					}
				});

		},

		///////////////////////////end Text Venkat Code ///////////////////
		onChangeIbanValueSelect: function(oEvent) {
			var val = oEvent.getParameters().value;
			oEvent.getSource().setValueState("None");
			var rowSel = oEvent.getSource().sId.split("-").pop();
			this.setValueStateNone(rowSel);
			if (val.trim() !== "") {
				this.readAccountDataBasedOnIBanAndBank(rowSel);
			} else {
				var dataModel = this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan[rowSel];
				dataModel.IBan = "";
				dataModel.Country = "";
				dataModel.BankKey = "";
				dataModel.BankControlKey = "";
				dataModel.BankAccount = "";
				dataModel.IBanEnabled = true;
				dataModel.BankDetailsEnabled = true;
				this.getView().getModel("CustomerDataSet").refresh();
			}
		},

		setValueStateNone: function(rowSel) {
			var dataModel = this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan[rowSel];
			dataModel.IBanValState = "None";
			dataModel.CountryValState = "None";
			dataModel.BankKeyValState = "None";
			dataModel.BankControlKeyValState = "None";
			dataModel.BankAccountValState = "None";
			this.getView().getModel("CustomerDataSet").refresh();
		},
		//country bank change
		onChangeCountryBankBasedOnBank: function(oEvent) {
			var rowSel = oEvent.getSource().sId.split("-").pop();
			this.setValueStateNone(rowSel);
			oEvent.getSource().setValueState("None");
			this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan[rowSel].IBan = "";
			this.getView().getModel("CustomerDataSet").refresh();
			if (oEvent.getSource().getSelectedItem() !== null) {
				this.readAccountDataBasedOnIBanAndBank(rowSel);
			} else {
				this.readAccountDataBasedOnIBanAndBank(rowSel);
				oEvent.getSource().setValue("");
			}
		},

		onChangeBankKey: function(oEvent) {
			var rowSel = oEvent.getSource().sId.split("-").pop();
			this.setValueStateNone(rowSel);
			oEvent.getSource().setValueState("None");
			this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan[rowSel].IBan = "";
			this.getView().getModel("CustomerDataSet").refresh();
			this.readAccountDataBasedOnIBanAndBank(rowSel);
		},

		onChangeBankControlKey: function(oEvent) {
			var rowSel = oEvent.getSource().sId.split("-").pop();
			this.setValueStateNone(rowSel);
			oEvent.getSource().setValueState("None");
			this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan[rowSel].IBan = "";
			this.getView().getModel("CustomerDataSet").refresh();
			this.readAccountDataBasedOnIBanAndBank(rowSel);
		},

		onChangeBankAccount: function(oEvent) {
			var rowSel = oEvent.getSource().sId.split("-").pop();
			this.setValueStateNone(rowSel);
			oEvent.getSource().setValueState("None");
			this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan[rowSel].IBan = "";
			this.getView().getModel("CustomerDataSet").refresh();
			this.readAccountDataBasedOnIBanAndBank(rowSel);
		},

		liveChangeBankAccount: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeBankType: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeReferenceDetails: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeCollectAuth: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeAlternPayer: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeIndivEnteris: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeAllowedPayer: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onPressOkBankKeySelection: function(oEvent) {
			var selObj = oEvent.getSource().getSelectedItem().getBindingContext("ModelBankDetailsMoreSet").getObject();
			var dataModel = this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan[this.rowSelForMultiKeyFrag];

			dataModel.IBan = selObj.IbanNumber;
			dataModel.Country = selObj.BankCountry;
			dataModel.BankKey = selObj.BankKey;
			dataModel.BankControlKey = selObj.BankControlKey;
			dataModel.BankAccount = selObj.BankAccount;
			this.getView().getModel("CustomerDataSet").refresh();

			this._oValueHelpDialogBankKeyMultipl.close();
		},
		onPressCancelBankKeySelection: function() {
			this._oValueHelpDialogBankKeyMultipl.close();
		},

		//read bank details based on Imp
		readAccountDataBasedOnIBanAndBank: function(rowSel) {
			this.rowSelForMultiKeyFrag = rowSel;
			var that = this;
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			var dataModel = this.getView().getModel("CustomerDataSet").getData().BankDetails.BankIBan[rowSel];
			if ((dataModel.IBan !== undefined && dataModel.IBan.trim() !== "") ||
				(dataModel.Country !== undefined && dataModel.Country.trim() !== "" && dataModel.BankKey !== undefined && dataModel.BankKey.trim() !==
					"" &&
					dataModel.BankAccount !== undefined && dataModel.BankAccount.trim() !== "")) {

				if (!that._oValueHelpDialogBankKeyMultipl) {
					that._oValueHelpDialogBankKeyMultipl = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.BankKeyMultiple", that);
					that.getView().addDependent(that._oValueHelpDialogBankKeyMultipl);
				}
				var oBusyDialog = new sap.m.BusyDialog();
				oBusyDialog.open();
				var Filter1 = "";
				if (dataModel.IBan !== undefined && dataModel.IBan.trim() !== "") {
					Filter1 = new sap.ui.model.Filter('URL', 'EQ',
						"/RESTAdapter/SAP_IBAN_2/ZSD_MDM_CUSTOMER_DATA_API_SRV/IBAN_InputSet?System_Name=" + system + "&filter=IbanNumber eq '" +
						dataModel.IBan.trim() +
						"'");
					dataModel.IBanEnabled = true;
					dataModel.BankDetailsEnabled = false;
					that.getView().getModel("CustomerDataSet").refresh();
				} else {
					Filter1 = new sap.ui.model.Filter('URL', 'EQ',
						"/RESTAdapter/SAP_IBAN_2/ZSD_MDM_CUSTOMER_DATA_API_SRV/IBAN_InputSet?System_Name=" + system + "&filter=BankCountry eq '" +
						dataModel.Country
						.trim() + "' and BankKey eq '" + dataModel.BankKey.trim() + "' and BankAccount eq '" + dataModel.BankAccount.trim() +
						"' and BankControlKey eq '" + dataModel.BankControlKey.trim() + "'");
					dataModel.IBanEnabled = false;
					dataModel.BankDetailsEnabled = true;
					that.getView().getModel("CustomerDataSet").refresh();
				}
				this.oModel.read(
					"/BusinessPartnerSet", {
						method: "GET",
						filters: [Filter1],
						success: function(oData, oResponse) {
							oBusyDialog.close();
							var arr = [];
							if (oData.results[0].Response.includes("<h1>Error</h1>")) {
								var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
								that.errMsg(message);
								return;
							}

							if (JSON.parse(oData.results[0].Response).error === undefined) {
								arr = JSON.parse(oData.results[0].Response).d.results;
								if (arr.length > 1) {
									var modelBankDetails = new sap.ui.model.json.JSONModel({
										"results": arr
									});
									that._oValueHelpDialogBankKeyMultipl.setModel(modelBankDetails, "ModelBankDetailsMoreSet");
									that._oValueHelpDialogBankKeyMultipl.open();
								} else {
									dataModel.IBan = arr[0].IbanNumber;
									dataModel.Country = arr[0].BankCountry;
									dataModel.BankKey = arr[0].BankKey;
									dataModel.BankControlKey = arr[0].BankControlKey;
									dataModel.BankAccount = arr[0].BankAccount;
									that.getView().getModel("CustomerDataSet").refresh();
								}
							} else {

								if (dataModel.IBan !== undefined && dataModel.IBan.trim() !== "") {
									dataModel.IBan = "";
									dataModel.Country = "";
									dataModel.BankKey = "";
									dataModel.BankControlKey = "";
									dataModel.BankAccount = "";
									dataModel.IBanEnabled = true;
									dataModel.BankDetailsEnabled = true;
									that.getView().getModel("CustomerDataSet").refresh();
								}
								sap.m.MessageToast.show(JSON.parse(oData.results[0].Response).error.message.value);
							}

						},
						error: function(oError) {
							oBusyDialog.close();
						}
					});

			} else {

				if ((dataModel.Country !== undefined && dataModel.Country.trim() !== "") || (dataModel.BankKey !== undefined && dataModel.BankKey.trim() !==
						"") ||
					(dataModel.BankAccount !== undefined && dataModel.BankAccount.trim() !== "")) {
					dataModel.IBanEnabled = false;
					dataModel.BankDetailsEnabled = true;
				} else if (dataModel.IBan !== undefined && dataModel.IBan.trim() !== "") {
					dataModel.IBanEnabled = true;
					dataModel.BankDetailsEnabled = false;
				} else {
					dataModel.IBanEnabled = true;
					dataModel.BankDetailsEnabled = true;
				}
				that.getView().getModel("CustomerDataSet").refresh();
				sap.m.MessageToast.show(this.i18nModel.getProperty(
					"pleaseSelectTheIBANCountryBankAccountOr"));
			}
		},

		//read Day table data 
		readDayTableDataBasedOnGoodsRecvHrs: function(Val, rowId) {
			var that = this;
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/SAP_Goods_Receiving_Hours/ZSD_MDM_CUSTOMER_DATA_API_SRV/Goods_Rec_ValuesSet?System_Name=" + system +
				"&filter=Wanid eq '" +
				Val + "'");
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var arr = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							arr = JSON.parse(oData.results[0].Response).d.results;
						}
						/*	var oODataJSONModel = new sap.ui.model.json.JSONModel({
								"results": arr
							});*/
						var tblData = that.getView().getModel("CustomerDataSet").getData().UnloadingPoint.UnloadPointArr[rowId].DayTable = arr;
						/*	var a = JSON.stringify(arr);
				var data = JSON.parse(a);*/
						//	tblData = data;
						var mrgOpn = "";
						var mrgClg = "";
						var AftOpn = "";
						var AftClg = "";
						for (var i = 0; i < tblData.length; i++) {
							tblData[i].AfterCloseEnable = false;
							tblData[i].AfterOpnEnable = false;
							tblData[i].MornCloseEnable = false;
							tblData[i].MornOpnEnable = false;
							tblData[i].MorningOpenMessage = " ";
							tblData[i].MorningOpenState = "None";
							tblData[i].MorningClosenMessage = " ";
							tblData[i].MorningCloseState = "None";
							tblData[i].AfternoonOpenMessage = " ";
							tblData[i].AfternoonOpenState = "None";
							tblData[i].AfternoonCloseMessage = " ";
							tblData[i].AfternoonCloseState = "None";
							mrgOpn = tblData[i].Morningopen;
							tblData[i].Morningopen = new Date(0, 0, 0, mrgOpn.split("PT")[1].split("H")[0], mrgOpn.split("PT")[1].split("H")[1].split(
								"M")[
								0], mrgOpn.split("PT")[1].split("H")[1].split("M")[1].split("S")[0]);

							mrgClg = tblData[i].Morningclose;
							tblData[i].Morningclose = new Date(0, 0, 0, mrgClg.split("PT")[1].split("H")[0], mrgClg.split("PT")[1].split("H")[1].split(
								"M")[0], mrgClg.split("PT")[1].split("H")[1].split("M")[1].split("S")[0]);

							AftOpn = tblData[i].Afternoonopen;
							tblData[i].Afternoonopen = new Date(0, 0, 0, AftOpn.split("PT")[1].split("H")[0], AftOpn.split("PT")[1].split("H")[1].split(
								"M")[0], AftOpn.split("PT")[1].split("H")[1].split("M")[1].split("S")[0]);

							AftClg = tblData[i].Afternoonclose;
							tblData[i].Afternoonclose = new Date(0, 0, 0, AftClg.split("PT")[1].split("H")[0], AftClg.split("PT")[1].split("H")[1].split(
								"M")[0], AftClg.split("PT")[1].split("H")[1].split("M")[1].split("S")[0]);
						}
						that.getView().getModel("CustomerDataSet").refresh();
						//	oODataJSONModel.setSizeLimit(arr.length);
						//	that.getView().setModel(oODataJSONModel, "DayHoursSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		//////////////////////////////chnadru contact details///////////////////
		createContactDetailsTab: function(oData) {

			var contactDetails = {
				ContactDetails: {
					Telebox: {
						"TeleboxNO": oData.N_CompContactDet.results[0].Telebox,
						"TeleboxState": "None",
						"TeleboxMesage": " "
					},
					Telephone: {
						"TelephoneList": [],
						"TotalTelephone": "0",
						"Telephone": "",
						"Extension": "",
						"Comments": "",
						"Default": false,
						"TelephoneFrag": "",
						"ExtensionFrag": "",
						"CommentsFrag": "",
						"TelephoneValueState": "None",
						"TelephoneExtensionValueState": "None",

						"TelephoneViewState": "None",
						"TelephoneViewMessage": " ",

						"ExtenViewState": "None",
						"ExtenViewMessage": " ",

						"CommentViewState": "None",
						"CommentViewMessage": " ",

						"TelephoneEditable": true,
						"ExtensionEditable": true,
						"CommentsEditable": true

					},
					Fax: {
						"FaxList": [],
						"TotalFax": "0",
						"Fax": "",
						"Extension": "",
						"Comments": "",
						"Default": false,
						"FaxFrag": "",
						"ExtensionFrag": "",
						"CommentsFrag": "",
						"FaxValueState": "None",
						"FaxExtensionValueState": "None",

						"FaxViewState": "None",
						"FaxViewMessage": " ",

						"ExtenViewState": "None",
						"ExtenViewMessage": " ",

						"CommentViewState": "None",
						"CommentViewMessage": " ",

						"FaxEditable": true,
						"ExtensionEditable": true,
						"CommentsEditable": true

					},
					Email: {
						"EmailList": [],
						"TotalEmail": "0",
						"Email": "",
						"Comments": "",
						"Default": false,
						"EmailFrag": "",
						"CommentsFrag": "",
						"EmailValueState": "None",
						"EmailValueStateText": "",
						"EmailFragValueState": "None",
						"EmailFragValueStateText": "",

						"EmailViewState": "None",
						"EmailViewMessage": " ",

						"CommentViewState": "None",
						"CommentViewMessage": " ",

						"EmailEditable": true,
						"CommentsEditable": true
					},
					URL: {
						"URLList": [],
						"TotalURL": "0",
						"URL": "",
						"Comments": "",
						"Default": false,
						"URLFrag": "",
						"CommentsFrag": "",
						"URLValueState": "None",

						"UrlViewState": "None",
						"UrlViewMessage": " ",

						"CommentViewState": "None",
						"CommentViewMessage": " ",

						"URLEditable": true,
						"CommentsEditable": true
					},
					ContactPerson: {
						"ContactPersonList": []

					}

				}
			};

			//for company Conatct Detai;s

			//for Teliphone
			var compContDet = oData.N_CompContactDet.results[0];
			for (var r = 0; r < compContDet.N_AddTelep.results.length; r++) {
				contactDetails.ContactDetails.Telephone.TelephoneList.push({
					"Telephone": compContDet.N_AddTelep.results[r].Telephone,
					"Extension": compContDet.N_AddTelep.results[r].TelephoneExt,
					"Comments": compContDet.N_AddTelep.results[r].TeleComments,
					"Default": compContDet.N_AddTelep.results[r].DefaultTele
				});

				contactDetails.ContactDetails.Telephone.TotalTelephone = compContDet.N_AddTelep.results.length;
				if (compContDet.N_AddTelep.results[r].DefaultTele) {
					contactDetails.ContactDetails.Telephone.Telephone = compContDet.N_AddTelep.results[r].Telephone;
					contactDetails.ContactDetails.Telephone.Extension = compContDet.N_AddTelep.results[r].TelephoneExt;
					contactDetails.ContactDetails.Telephone.Comments = compContDet.N_AddTelep.results[r].TeleComments;
					contactDetails.ContactDetails.Telephone.Default = compContDet.N_AddTelep.results[r].DefaultTele;

				}

			}

			//for Fax
			for (var r = 0; r < compContDet.N_AddFax.results.length; r++) {
				contactDetails.ContactDetails.Fax.FaxList.push({
					"Fax": compContDet.N_AddFax.results[r].Fax,
					"Extension": compContDet.N_AddFax.results[r].FaxExt,
					"Comments": compContDet.N_AddFax.results[r].FaxComments,
					"Default": compContDet.N_AddFax.results[r].DefaultFax
				});
				contactDetails.ContactDetails.Fax.TotalFax = compContDet.N_AddFax.results.length;
				if (compContDet.N_AddFax.results[r].DefaultFax) {
					contactDetails.ContactDetails.Fax.Fax = compContDet.N_AddFax.results[r].Fax;
					contactDetails.ContactDetails.Fax.Extension = compContDet.N_AddFax.results[r].FaxExt;
					contactDetails.ContactDetails.Fax.Comments = compContDet.N_AddFax.results[r].FaxComments;
					contactDetails.ContactDetails.Fax.Default = compContDet.N_AddFax.results[r].DefaultFax;

				}

			}

			/// for Email
			for (var r = 0; r < compContDet.N_AddMail.results.length; r++) {
				contactDetails.ContactDetails.Email.EmailList.push({
					"Email": compContDet.N_AddMail.results[r].Email,
					"Comments": compContDet.N_AddMail.results[r].MailComments,
					"Default": compContDet.N_AddMail.results[r].DefaultMail
				});

				contactDetails.ContactDetails.Email.TotalEmail = compContDet.N_AddMail.results.length;
				if (compContDet.N_AddMail.results[r].DefaultMail) {
					contactDetails.ContactDetails.Email.Email = compContDet.N_AddMail.results[r].Email;
					contactDetails.ContactDetails.Email.Comments = compContDet.N_AddMail.results[r].MailComments;
					contactDetails.ContactDetails.Email.Default = compContDet.N_AddMail.results[r].DefaultMail;

				}

			}

			//for URL 
			for (var r = 0; r < compContDet.N_AddURL.results.length; r++) {
				contactDetails.ContactDetails.URL.URLList.push({
					"URL": compContDet.N_AddURL.results[r].UrlHomepage,
					"Comments": compContDet.N_AddURL.results[r].UrlComments,
					"Default": compContDet.N_AddURL.results[r].DefaultUrl
				});
				contactDetails.ContactDetails.URL.TotalURL = compContDet.N_AddURL.results.length;
				if (compContDet.N_AddURL.results[r].DefaultUrl) {
					contactDetails.ContactDetails.URL.URL = compContDet.N_AddURL.results[r].UrlHomepage;
					contactDetails.ContactDetails.URL.Comments = compContDet.N_AddURL.results[r].UrlComments;
					contactDetails.ContactDetails.URL.Default = compContDet.N_AddURL.results[r].DefaultUrl;

				}

			}

			//for contact Person
			var contPer = oData.N_ContactPerson.results;
			for (var i = 0; i < contPer.length; i++) {
				contactDetails.ContactDetails.ContactPerson.ContactPersonList.push({
					"LastName": contPer[i].LastName ? contPer[i].LastName.toString().trim() : "",
					"FirstName": contPer[i].FirstName ? contPer[i].FirstName.toString().trim() : "",
					"Language": contPer[i].Parla ? contPer[i].Parla.toString().trim() : "",
					"Function": contPer[i].Pafkt ? contPer[i].Pafkt.toString().trim() : "",
					"Department": contPer[i].Abtnr ? contPer[i].Abtnr.toString().trim() : "",
					"Telephone": contPer[i].Telephone ? contPer[i].Telephone.toString().trim() : "",
					"TelephoneExtension": contPer[i].TelephoneExt ? contPer[i].TelephoneExt.toString().trim() : "",
					"Fax": contPer[i].Fax ? contPer[i].Fax.toString().trim() : "",
					"FaxExtension": contPer[i].FaxExt ? contPer[i].FaxExt.toString().trim() : "",
					"MobilePhone": contPer[i].Mobile ? contPer[i].Mobile.toString().trim() : "",
					"Email": contPer[i].EMail ? contPer[i].EMail.toString().trim() : "",
					"Notes": contPer[i].Notes ? contPer[i].Notes.toString().trim() : "",
					"Method": contPer[i].Method ? contPer[i].Method.toString().trim() : "",
					"TotalCount": (i + 1) + " of " + contPer.length,
					"VisibleBasedOnNext": i === 0 ? true : false,

					"LastNameState": "None",
					"LastNameMessage": " ",

					"FunctionState": "None",
					"FunctionMessage": " ",

					"TelephoneState": "None",
					"TelephoneMessage": " ",

					"FaxState": "None",
					"FaxMessage": " ",

					"MobilePhoneState": "None",
					"MobilePhoneMessage": " ",

					"EmailValueState": "None",
					"EmailValueStateText": "",

					"MethodState": "None",
					"MethodStateText": "",

					"FirstNameState": "None",
					"FirstNameMessage": " ",

					"DepartmentState": "None",
					"DepartmentMessage": " ",

					"TelepExtensionState": "None",
					"TelepExtensionMessage": " ",

					"FaxExtensionState": "None",
					"FaxExtensionMessage": " ",

					"NotesState": "None",
					"NotesMessage": " ",

					"LanguageState": "None",
					"LanguageMessage": " "
				});
			}

			var modelCustomerData = new sap.ui.model.json.JSONModel(contactDetails);
			this.getView().setModel(modelCustomerData, "ContactDetailsSet");

			if (contactDetails.ContactDetails.ContactPerson.ContactPersonList.length < 1) {
				this.addNewContactPersonDetails();
			}
		},

		//read Status data
		readContactPersonData: function(system) {
			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/REST_SAP/ZSD_MDM_CUSTOMER_DATA_API_SRV/ContactPersonSet?System_Name=" + system +
				"&expand=NavLanguage,NavFunction,NavDepartment,NavMethod"
			);
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var functionV = [];
						var methodV = [];
						var department = [];
						var Language = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataOut = JSON.parse(oData.results[0].Response).d.results[0];
							functionV = dataOut.NavFunction.results;
							methodV = dataOut.NavMethod.results;
							department = dataOut.NavDepartment.results;
							Language = dataOut.NavLanguage.results;

							//Resubmit & Review scenario
							that.bindContactDetails();
						}
						var modelfunctionV = new sap.ui.model.json.JSONModel({
							"results": functionV
						});
						modelfunctionV.setSizeLimit(functionV.length);
						that.getView().setModel(modelfunctionV, "FunctionContPCombSet");

						var modelmethodV = new sap.ui.model.json.JSONModel({
							"results": methodV
						});
						modelmethodV.setSizeLimit(methodV.length);
						that.getView().setModel(modelmethodV, "MethodContPCombSet");

						var modeldepartment = new sap.ui.model.json.JSONModel({
							"results": department
						});
						modeldepartment.setSizeLimit(department.length);
						that.getView().setModel(modeldepartment, "DepartmentContPCombSet");

						var modelLanguage = new sap.ui.model.json.JSONModel({
							"results": Language
						});
						modelLanguage.setSizeLimit(Language.length);
						that.getView().setModel(modelLanguage, "LanguageContPCombSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
		},
		liveChangeTelephoneValueFrag: function(oEvent) {
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,20})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
			oEvent.getSource().setValueState("None");
		},
		liveChangeTelephoneExtenValueFrag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		changeEventForTelephone: function(oEvent) {
			var TelephoneData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone;
			var newValue = "";
			var a = 0;
			var value = TelephoneData.Telephone;
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,20})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
			this.getView().getModel("ContactDetailsSet").refresh();
			this.onTelephoneChange();
		},
		onTelephoneChange: function(oEvent) {
			var TelephoneData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone;

			if (TelephoneData.Telephone === "") {
				TelephoneData.TelephoneList = [];
				TelephoneData.Extension = "";
				TelephoneData.Comments = "";
				TelephoneData.TotalTelephone = TelephoneData.TelephoneList.length;
			} else if ((TelephoneData.TelephoneList.length === 0) && (TelephoneData.Telephone !== "")) {
				TelephoneData.TelephoneList.push({
					Telephone: TelephoneData.Telephone,
					Extension: TelephoneData.Extension,
					Comments: TelephoneData.Comments,
					Default: true
				});
				TelephoneData.TotalTelephone = TelephoneData.TelephoneList.length;
			}
			for (var i = 0; i < TelephoneData.TelephoneList.length; i++) {
				if (TelephoneData.TelephoneList[i].Default === true) {
					TelephoneData.TelephoneList[i].Telephone = TelephoneData.Telephone;
					TelephoneData.TelephoneList[i].Extension = TelephoneData.Extension;
					TelephoneData.TelephoneList[i].Comments = TelephoneData.Comments;
				}
			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		onFaxChange: function() {
			var FaxData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Fax;
			// if ((FaxData.Fax === "") && (FaxData.Extension === "")) {
			if (FaxData.Fax === "") {
				FaxData.FaxList = [];
				FaxData.Extension = "";
				FaxData.Comments = "";
				FaxData.TotalFax = FaxData.FaxList.length;
			} else
			if ((FaxData.FaxList.length === 0) && (FaxData.Fax !== "")) {
				FaxData.FaxList.push({
					Fax: FaxData.Fax,
					Extension: FaxData.Extension,
					Comments: FaxData.Comments,
					Default: true
				});
				FaxData.TotalFax = FaxData.FaxList.length;
			}
			for (var i = 0; i < FaxData.FaxList.length; i++) {
				if (FaxData.FaxList[i].Default === true) {
					FaxData.FaxList[i].Fax = FaxData.Fax;
					FaxData.FaxList[i].Extension = FaxData.Extension;
					FaxData.FaxList[i].Comments = FaxData.Comments;
				}
			}
			this.getView().getModel("ContactDetailsSet").refresh();

		},

		onURLChange: function() {
			var URLData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.URL;
			if (URLData.URL === "") {
				URLData.URLList = [];
				URLData.Comments = "";
				URLData.TotalURL = URLData.URLList.length;
			} else if (URLData.URLList.length === 0) {
				URLData.URLList.push({
					URL: URLData.URL,
					Comments: URLData.Comments,
					Default: true
				});
				URLData.TotalURL = URLData.URLList.length;
			}
			for (var i = 0; i < URLData.URLList.length; i++) {
				if (URLData.URLList[i].Default === true) {
					URLData.URLList[i].URL = URLData.URL;
					URLData.URLList[i].Comments = URLData.Comments;
				}
			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		//on Press Telephone Frag
		onPressAddTelephoneFrag: function() {
			var TelephoneData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone;

			if (TelephoneData.Telephone !== "" && TelephoneData.Telephone !== undefined && TelephoneData.TotalTelephone === "0") {
				TelephoneData.TelephoneList.push({
					Telephone: TelephoneData.Telephone,
					Extension: TelephoneData.Extension,
					Comments: TelephoneData.Comments,
					Default: true
				});
			}
			this.getView().getModel("ContactDetailsSet").refresh();
			if (!this._oValueHelpDialogTelephone) {
				this._oValueHelpDialogTelephone = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.TelephoneDialog", this);
				this.getView().addDependent(this._oValueHelpDialogTelephone);

			}
			this._oValueHelpDialogTelephone.open();
		},

		onPressTelephoneValueFragOk: function() {
			// var a = this.getView().getModel("CreateModelSet");
			// a.getData().ContactDetails.Telephone.TotalTelephone = a.getData().ContactDetails.Telephone.TelephoneList.length;
			// a.refresh();

			var TelephoneList = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone.TelephoneList;
			var Telephone = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone;
			for (var i = 0; i < TelephoneList.length; i++) {
				if (TelephoneList[i].Default === true) {
					Telephone.Telephone = TelephoneList[i].Telephone;
					Telephone.Extension = TelephoneList[i].Extension;
					Telephone.Comments = TelephoneList[i].Comments;
				}
			}

			if (TelephoneList.length > 1) {
				Telephone.TelephoneEditable = false;
				Telephone.ExtensionEditable = false;
				Telephone.CommentsEditable = false;
			} else {
				Telephone.TelephoneEditable = true;
				Telephone.ExtensionEditable = true;
				Telephone.CommentsEditable = true;
			}
			Telephone.TotalTelephone = TelephoneList.length;
			this.getView().getModel("ContactDetailsSet").refresh();

			this._oValueHelpDialogTelephone.close();
		},

		addTelephoneAddFrag: function() {

			var TelephoneData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone;

			if (TelephoneData.TelephoneList.length === 5) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("MaximumEntriesReached"));
				return;
			}

			if (TelephoneData.TelephoneFrag !== "" && TelephoneData.TelephoneFrag !== undefined) {
				if (TelephoneData.TelephoneList.length === 0) {
					var DefaultTelephone = true;
				} else {
					DefaultTelephone = false;
				}
				TelephoneData.TelephoneList.push({
					Telephone: TelephoneData.TelephoneFrag,
					Extension: TelephoneData.ExtensionFrag,
					Comments: TelephoneData.CommentsFrag,
					Default: DefaultTelephone
				});
				TelephoneData.TelephoneFrag = "";
				TelephoneData.ExtensionFrag = "";
				TelephoneData.CommentsFrag = "";
				TelephoneData.TelephoneValueState = "None";
				TelephoneData.TelephoneExtensionValueState = "None";

			} else {
				if (TelephoneData.TelephoneFrag !== "" && TelephoneData.TelephoneFrag !== undefined) {
					TelephoneData.TelephoneValueState = "None";
				} else {
					TelephoneData.TelephoneValueState = "Error";
				}

				// if (TelephoneData.ExtensionFrag !== "" && TelephoneData.ExtensionFrag !== undefined) {
				// 	TelephoneData.TelephoneExtensionValueState = "None";
				// } else {
				// 	TelephoneData.TelephoneExtensionValueState = "Error";
				// }

			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		onSelectTableTelephoneFrag: function(oEvent) {
			/*	var selRowObj = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone.TelephoneList[oEvent.getParameters()
					.listItem.sId.split("-").pop()];
				if (oEvent.getSource().getSelectedContexts().length > 0) {
					selRowObj.Selected = true;
				} else {
					selRowObj.Selected = false;
				}
				this.getView().getModel("ContactDetailsSet").refresh();*/

		},

		addTelephoneDeleteFrag: function(oEvent) {
			//	this.taxDataValidationBusPartner(oEvent);
			var countDel = 0;
			var Telephone = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone;
			for (var i = 0; i < Telephone.TelephoneList.length; i++) {
				if (Telephone.TelephoneList[i].Selected === true) {
					Telephone.TelephoneList[i].Delete = "X";
					countDel++;
				} else {
					Telephone.TelephoneList[i].Selected = false;
				}
			}

			if (countDel > 0) {
				var array = [];
				var a = JSON.stringify(Telephone.TelephoneList);
				var data = JSON.parse(a);
				for (var j = 0; j < data.length; j++) {
					if ((data[j].Delete === "X") && (data[j].Default === true)) {
						data[0].Default = true;
					}
					if (data[j].Delete !== "X") {
						array.push(data[j]);
					}
				}

				Telephone.TelephoneList = array;
				if (Telephone.TelephoneList.length !== 0) {
					Telephone.TelephoneList[0].Default = true;
				} else if (Telephone.TelephoneList.length === 0) {
					Telephone.Telephone = "";
					Telephone.Extension = "";
					Telephone.Comments = "";
				}
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("selectRowTodeleteForAll"));
			}

			this.getView().getModel("ContactDetailsSet").refresh();
		},

		onPressAddFaxFrag: function() {
			var FaxData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Fax;

			if (FaxData.Fax !== "" && FaxData.Fax !== undefined && FaxData.TotalFax === "0") {
				FaxData.FaxList.push({
					Fax: FaxData.Fax,
					Extension: FaxData.Extension,
					Comments: FaxData.Comments,
					Default: true
				});
			}
			this.getView().getModel("ContactDetailsSet").refresh();
			if (!this._oValueHelpDialogFax) {
				this._oValueHelpDialogFax = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.FaxDialog", this);
				this.getView().addDependent(this._oValueHelpDialogFax);

			}
			this._oValueHelpDialogFax.open();
		},

		addFaxAddFrag: function() {

			var FaxData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Fax;

			if (FaxData.FaxList.length === 5) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("MaximumEntriesReached"));
				return;
			}

			if (FaxData.FaxFrag !== "" && FaxData.FaxFrag !== undefined) {
				if (FaxData.FaxList.length === 0) {
					var DefaultFax = true;
				} else {
					DefaultFax = false;
				}
				FaxData.FaxList.push({
					Fax: FaxData.FaxFrag,
					Extension: FaxData.ExtensionFrag,
					Comments: FaxData.CommentsFrag,
					Default: DefaultFax
				});
				FaxData.FaxFrag = "";
				FaxData.ExtensionFrag = "";
				FaxData.CommentsFrag = "";
				FaxData.FaxValueState = "None";
				FaxData.FaxExtensionValueState = "None";

			} else {
				if (FaxData.FaxFrag !== "" && FaxData.FaxFrag !== undefined) {
					FaxData.FaxValueState = "None";
				} else {
					FaxData.FaxValueState = "Error";
				}

				// if (FaxData.ExtensionFrag !== "" && FaxData.ExtensionFrag !== undefined) {
				// 	FaxData.FaxExtensionValueState = "None";
				// } else {
				// 	FaxData.FaxExtensionValueState = "Error";
				// }

			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		onSelectTableFaxFrag: function(oEvent) {
			/*var selRowObj = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Fax.FaxList[oEvent.getParameters().listItem.sId
				.split("-").pop()];
			if (oEvent.getSource().getSelectedContexts().length > 0) {
				selRowObj.Selected = true;
			} else {
				selRowObj.Selected = false;
			}
			this.getView().getModel("ContactDetailsSet").refresh();*/

		},
		addFaxDeleteFrag: function(oEvent) {
			//	this.taxDataValidationBusPartner(oEvent);
			var countDel = 0;
			var Fax = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Fax;
			for (var i = 0; i < Fax.FaxList.length; i++) {
				if (Fax.FaxList[i].Selected === true) {
					Fax.FaxList[i].Delete = "X";
					countDel++;
				} else {
					Fax.FaxList[i].Selected = false;
				}
			}

			if (countDel > 0) {
				var array = [];
				var a = JSON.stringify(Fax.FaxList);
				var data = JSON.parse(a);
				for (var j = 0; j < data.length; j++) {
					if ((data[j].Delete === "X") && (data[j].Default === true)) {
						data[0].Default = true;
					}
					if (data[j].Delete !== "X") {
						array.push(data[j]);
					}
				}

				Fax.FaxList = array;
				if (Fax.FaxList.length !== 0) {
					Fax.FaxList[0].Default = true;
				} else if (Fax.FaxList.length === 0) {
					Fax.Fax = "";
					Fax.Extension = "";
					Fax.Comments = "";
				}
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("selectRowTodeleteForAll"));
			}

			this.getView().getModel("ContactDetailsSet").refresh();
		},

		onPressFaxValueFragOk: function() {
			// var a = this.getView().getModel("CreateModelSet");
			// a.getData().ContactDetails.Fax.TotalFax = a.getData().ContactDetails.Fax.FaxList.length;
			// a.refresh();

			var FaxList = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Fax.FaxList;
			var Fax = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Fax;
			for (var i = 0; i < FaxList.length; i++) {
				if (FaxList[i].Default === true) {
					Fax.Fax = FaxList[i].Fax;
					Fax.Extension = FaxList[i].Extension;
					Fax.Comments = FaxList[i].Comments;
				}
			}
			if (FaxList.length > 1) {
				Fax.FaxEditable = false;
				Fax.ExtensionEditable = false;
				Fax.CommentsEditable = false;
			} else {
				Fax.FaxEditable = true;
				Fax.ExtensionEditable = true;
				Fax.CommentsEditable = true;
			}
			Fax.TotalFax = FaxList.length;
			this.getView().getModel("ContactDetailsSet").refresh();

			this._oValueHelpDialogFax.close();
		},

		validateEmail: function(emailValue, section) {

			var that = this;
			// var inputId = oEvent.oSource.sId;
			var email = this.fillEmailModel(emailValue);
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_MDM/CleanseEmailAddress",
				"Request": JSON.stringify(email)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(response) {
					// oBusyDialog.close();

					try {
						that.validationSetEmailField(JSON.parse(response.Response).root, section);
					} catch (error) {
						sap.m.MessageBox.show(
							"Error while calling BPM Service", {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								onClose: function(oAction) {
									// / * do something * /
								}
							});
					}
					oBusyDialog.close();
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});

		},

		validationSetEmailField: function(Data, section) {
			var EmailData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email;
			if (Data.Validation_Error === "X") {
				switch (section) {
					case "CompanyContactDetail":
						EmailData.EmailValueState = "Error";
						EmailData.EmailValueStateText = Data.EMail;
						break;
					case "Dialog":
						EmailData.EmailFragValueState = "Error";
						EmailData.EmailFragValueStateText = Data.EMail;
						break;
					case "ContactPersontDetail":
						var ContactPersonList = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.ContactPerson.ContactPersonList;
						for (var i = 0; i < ContactPersonList.length; i++) {
							if (ContactPersonList[i].VisibleBasedOnNext === true) {
								ContactPersonList[i].EmailValueState = "Error";
								ContactPersonList[i].EmailValueStateText = Data.EMail;
							}
						}
						break;
				}

				// if (Data.EMail !== "") {
				// 	EmailData.EmailValueState = "Error";
				// 	EmailData.EmailValueStateText = Data.EMail;

				// } else {
				// 	EmailData.EmailValueState = "Error";
				// }
				this.getView().getModel("ContactDetailsSet").refresh();
			} else {
				EmailData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email;
				if (section === "CompanyContactDetail") {
					if (EmailData.Email === "") {
						EmailData.EmailList = [];
						EmailData.Comments = "";
						EmailData.TotalEmail = EmailData.EmailList.length;
					} else
					if (EmailData.EmailList.length === 0) {

						EmailData.EmailList.push({
							Email: EmailData.Email,
							Comments: EmailData.Comments,
							Default: true
						});
						EmailData.TotalEmail = EmailData.EmailList.length;
					}
					for (i = 0; i < EmailData.EmailList.length; i++) {
						if (EmailData.EmailList[i].Default === true) {
							EmailData.EmailList[i].Email = EmailData.Email;
							EmailData.EmailList[i].Comments = EmailData.Comments;
						}
					}
				} else if (section === "Dialog") {
					if (EmailData.EmailList.length === 0) {
						var DefaultEmail = true;
					} else {
						DefaultEmail = false;
					}
					EmailData.EmailList.push({
						Email: EmailData.EmailFrag,
						Comments: EmailData.CommentsFrag,
						Default: DefaultEmail
							// EmailValueState: "None",
							// EmailValueStateText: ""
					});
					EmailData.EmailFrag = "";
					EmailData.CommentsFrag = "";
				}
				this.getView().getModel("ContactDetailsSet").refresh();
			}
		},

		onPressAddEmailFrag: function() {

			var EmailData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email;
			if (EmailData.EmailValueState === "Error") {
				sap.m.MessageToast.show(this.i18nModel.getProperty("enterValidEmail"));
				return;
			}
			if (EmailData.Email !== "" && EmailData.Email !== undefined && EmailData.TotalEmail === "0") {
				EmailData.EmailList.push({
					Email: EmailData.Email,
					Comments: EmailData.Comments,
					Default: true
				});
			}
			this.getView().getModel("ContactDetailsSet").refresh();
			if (!this._oValueHelpDialogEmail) {
				this._oValueHelpDialogEmail = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.EmailDialog", this);
				this.getView().addDependent(this._oValueHelpDialogEmail);

			}
			this._oValueHelpDialogEmail.open();
		},

		onEmailChange: function() {
			var EmailValue = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email.Email;
			this.validateEmail(EmailValue, "CompanyContactDetail");
		},

		onPersonalEmailChange: function(oEvent) {
			var EmailValue = oEvent.mParameters.value;
			this.validateEmail(EmailValue, "ContactPersontDetail");
		},
		addEmailAddFrag: function() {
			var EmailData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email;
			if (EmailData.EmailFrag === "" || EmailData.EmailFrag === undefined) {
				EmailData.EmailFragValueState = "Error";
				EmailData.EmailFragValueStateText = "Enter valid Email";
				this.getView().getModel("ContactDetailsSet").refresh();
				return;
			}

			if (EmailData.EmailList.length === 5) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("MaximumEntriesReached"));
				return;
			}

			var EmailValue = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email.EmailFrag;

			this.validateEmail(EmailValue, "Dialog");
		},
		onSelectTableEmailFrag: function(oEvent) {
			/*	var selRowObj = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email.EmailList[oEvent.getParameters().listItem
					.sId.split("-").pop()];
				if (oEvent.getSource().getSelectedContexts().length > 0) {
					selRowObj.Selected = true;
				} else {
					selRowObj.Selected = false;
				}
				this.getView().getModel("ContactDetailsSet").refresh();*/

		},

		addEmailDeleteFrag: function(oEvent) {
			//	this.taxDataValidationBusPartner(oEvent);
			var countDel = 0;
			var Email = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email;
			for (var i = 0; i < Email.EmailList.length; i++) {
				if (Email.EmailList[i].Selected === true) {
					Email.EmailList[i].Delete = "X";
					countDel++;
				} else {
					Email.EmailList[i].Selected = false;
				}
			}

			if (countDel > 0) {
				var array = [];
				var a = JSON.stringify(Email.EmailList);
				var data = JSON.parse(a);
				for (var j = 0; j < data.length; j++) {
					if ((data[j].Delete === "X") && (data[j].Default === true)) {
						data[0].Default = true;
					}
					if (data[j].Delete !== "X") {
						array.push(data[j]);
					}
				}

				Email.EmailList = array;
				if (Email.EmailList.length !== 0) {
					Email.EmailList[0].Default = true;
				} else if (Email.EmailList.length === 0) {
					Email.Email = "";
					Email.Comments = "";
				}
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("selectRowTodeleteForAll"));
			}

			this.getView().getModel("ContactDetailsSet").refresh();
		},

		onPressEmailValueFragOk: function() {
			var EmailList = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email.EmailList;
			var Email = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email;
			for (var i = 0; i < EmailList.length; i++) {
				if (EmailList[i].Default === true) {
					Email.Email = EmailList[i].Email;
					Email.Comments = EmailList[i].Comments;
				}
			}
			if (EmailList.length > 1) {
				Email.EmailEditable = false;
				Email.CommentsEditable = false;
			} else {
				Email.EmailEditable = true;
				Email.CommentsEditable = true;
			}
			Email.TotalEmail = EmailList.length;
			this.getView().getModel("ContactDetailsSet").refresh();

			this._oValueHelpDialogEmail.close();
		},

		onPressAddURLFrag: function() {

			var URLData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.URL;
			if (URLData.URLValueState === "Error") {
				sap.m.MessageToast.show(this.i18nModel.getProperty("enterValidURL"));
				return;
			}
			if (URLData.URL !== "" && URLData.URL !== undefined && URLData.TotalURL === "0") {
				URLData.URLList.push({
					URL: URLData.URL,
					Comments: URLData.Comments,
					Default: true
				});
			}
			this.getView().getModel("ContactDetailsSet").refresh();
			if (!this._oValueHelpDialogURL) {
				this._oValueHelpDialogURL = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.URLDialog", this);
				this.getView().addDependent(this._oValueHelpDialogURL);

			}
			this._oValueHelpDialogURL.open();
		},
		addURLAddFrag: function() {

			var URLData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.URL;
			if (URLData.URLList.length === 5) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("MaximumEntriesReached"));
				return;
			}
			if (URLData.URLFrag !== "" && URLData.URLFrag !== undefined) {
				if (URLData.URLList.length === 0) {
					var DefaultURL = true;
				} else {
					DefaultURL = false;
				}
				URLData.URLList.push({
					URL: URLData.URLFrag,
					Comments: URLData.CommentsFrag,
					Default: DefaultURL
				});
				URLData.URLFrag = "";
				URLData.CommentsFrag = "";
				URLData.URLValueState = "None";

			} else {
				if (URLData.URLFrag !== "" && URLData.URLFrag !== undefined) {
					URLData.URLValueState = "None";
				} else {
					URLData.URLValueState = "Error";
				}
			}
			this.getView().getModel("ContactDetailsSet").refresh();

		},

		onSelectTableURLFrag: function(oEvent) {
			/*	var selRowObj = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.URL.URLList[oEvent.getParameters().listItem.sId
					.split("-").pop()];
				if (oEvent.getSource().getSelectedContexts().length > 0) {
					selRowObj.Selected = true;
				} else {
					selRowObj.Selected = false;
				}
				this.getView().getModel("ContactDetailsSet").refresh();*/

		},

		addURLDeleteFrag: function(oEvent) {
			//	this.taxDataValidationBusPartner(oEvent);
			var countDel = 0;
			var URL = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.URL;

			for (var i = 0; i < URL.URLList.length; i++) {
				if (URL.URLList[i].Selected === true) {
					URL.URLList[i].Delete = "X";
					countDel++;
				} else {
					URL.URLList[i].Selected = false;
				}
			}
			if (countDel > 0) {
				var array = [];
				var a = JSON.stringify(URL.URLList);
				var data = JSON.parse(a);
				for (var j = 0; j < data.length; j++) {
					if ((data[j].Delete === "X") && (data[j].Default === true)) {
						data[0].Default = true;
					}
					if (data[j].Delete !== "X") {
						array.push(data[j]);
					}
				}

				URL.URLList = array;
				if (URL.URLList.length !== 0) {
					URL.URLList[0].Default = true;
				} else if (URL.URLList.length === 0) {
					URL.URL = "";
					URL.Comments = "";
				}
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("selectRowTodeleteForAll"));
			}

			this.getView().getModel("ContactDetailsSet").refresh();
		},

		onPressURLValueFragOk: function() {
			var URLList = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.URL.URLList;
			var URL = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.URL;
			for (var i = 0; i < URLList.length; i++) {
				if (URLList[i].Default === true) {
					URL.URL = URLList[i].URL;
					URL.Comments = URLList[i].Comments;
				}
			}
			if (URLList.length > 1) {
				URL.URLEditable = false;
				URL.ExtensionEditable = false;
				URL.CommentsEditable = false;
			} else {
				URL.URLEditable = true;
				URL.ExtensionEditable = true;
				URL.CommentsEditable = true;
			}
			URL.TotalURL = URLList.length;
			this.getView().getModel("ContactDetailsSet").refresh();

			this._oValueHelpDialogURL.close();
		},

		fillEmailModel: function(value) {
			//	validateNameAddressCount = buttonId.substring(buttonId.length - 1);
			//	var arrIndex = validateNameAddressCount - 1;
			// var selectedRow = oEvent.getParameters().id.split("-").pop();
			// this.SelectedRowNameAndAddrs = selectedRow;
			// var dataModelNameAndAddress = this.getView().getModel("CreateModelSet").getData().NameAndAddress[selectedRow];

			// var bindingPath = "/BusinessPartner/NameAddress/" + selectedRow + "/" + "Country";

			var dataSend = {
				"root": {
					"EMail": value
				}
			};
			return dataSend;
		},

		onEmailCommentChange: function() {
			var EmailData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email;
			if (EmailData.Email === "") {
				EmailData.Comments = "";
			}
			for (var i = 0; i < EmailData.EmailList.length; i++) {
				if (EmailData.EmailList[i].Default === true) {
					EmailData.EmailList[i].Comments = EmailData.Comments;
				}
			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		//add contact person 
		addNewContactPersonDetails: function() {
			var dataModel = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.ContactPerson.ContactPersonList;
			var emptCount = 0;
			for (var i = 0; i < dataModel.length; i++) {
				//for check Last Name is filled
				if (dataModel[i].LastName === undefined || dataModel[i].LastName.toString().trim() === "") {
					emptCount++;
					dataModel[i].LastNameState = "Error";
					dataModel[i].LastNameMessage = " ";
				} else {
					dataModel[i].LastNameState = "None";
					dataModel[i].LastNameMessage = " ";
				}
			}
			this.getView().getModel("ContactDetailsSet").refresh();
			if (emptCount > 0) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("LastNameIsMandatory"));
				return;
			}

			for (var i = 0; i < dataModel.length; i++) {
				if (dataModel[i].EmailValueState === "Error") {
					sap.m.MessageToast.show(this.i18nModel.getProperty("ImproperEmailAddress"));
					return;
				}
				dataModel[i].TotalCount = (i + 1) + " of " + (dataModel.length + 1);
				dataModel[i].VisibleBasedOnNext = false;
			}
			dataModel.push({
				"LastName": "",
				"FirstName": "",
				"Language": "",
				"Function": "",
				"Department": "",
				"Telephone": "",
				"TelephoneExtension": "",
				"Fax": "",
				"FaxExtension": "",
				"MobilePhone": "",
				"Email": "",
				"Notes": "",
				"Method": "",
				TotalCount: (dataModel.length + 1) + " of " + (dataModel.length + 1),
				VisibleBasedOnNext: true,

				"LastNameState": "None",
				"LastNameMessage": " ",

				"FunctionState": "None",
				"FunctionMessage": " ",

				"TelephoneState": "None",
				"TelephoneMessage": " ",

				"FaxState": "None",
				"FaxMessage": " ",

				"MobilePhoneState": "None",
				"MobilePhoneMessage": " ",

				"EmailValueState": "None",
				"EmailValueStateText": "",

				"MethodState": "None",
				"MethodStateText": "",

				"FirstNameState": "None",
				"FirstNameMessage": " ",

				"DepartmentState": "None",
				"DepartmentMessage": " ",

				"TelepExtensionState": "None",
				"TelepExtensionMessage": " ",

				"FaxExtensionState": "None",
				"FaxExtensionMessage": " ",

				"NotesState": "None",
				"NotesMessage": " ",

				"LanguageState": "None",
				"LanguageMessage": " "
			});
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		//delete customer bank Details
		deleteContactPersonDetails: function(oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.ContactPerson.ContactPersonList;
			if (dataModel.length > 1) {
				dataModel.splice(selectedRow, 1);
				for (var i = 0; i < dataModel.length; i++) {
					dataModel[i].TotalCount = (i + 1) + " of " + dataModel.length;
					if (i === (dataModel.length - 1)) {
						dataModel[i].VisibleBasedOnNext = true;
					} else {
						dataModel[i].VisibleBasedOnNext = false;
					}
				}
			} else {
				// sap.m.MessageToast.show(this.i18nModel.getProperty("notAllowToDeleteLastContactPersonDetails"));
				this.getView().getModel("ContactDetailsSet").getData().ContactDetails.ContactPerson.ContactPersonList = [{
					"LastName": "",
					"FirstName": "",
					"Language": "",
					"Function": "",
					"Department": "",
					"Telephone": "",
					"TelephoneExtension": "",
					"Fax": "",
					"FaxExtension": "",
					"MobilePhone": "",
					"Email": "",
					"Notes": "",
					"Method": "",
					"TotalCount": "1 of 1",
					"VisibleBasedOnNext": true,

					"LastNameState": "None",
					"LastNameMessage": " ",

					"FunctionState": "None",
					"FunctionMessage": " ",

					"TelephoneState": "None",
					"TelephoneMessage": " ",

					"FaxState": "None",
					"FaxMessage": " ",

					"MobilePhoneState": "None",
					"MobilePhoneMessage": " ",

					"EmailValueState": "None",
					"EmailValueStateText": "",

					"MethodState": "None",
					"MethodStateText": "",

					"FirstNameState": "None",
					"FirstNameMessage": " ",

					"DepartmentState": "None",
					"DepartmentMessage": " ",

					"TelepExtensionState": "None",
					"TelepExtensionMessage": " ",

					"FaxExtensionState": "None",
					"FaxExtensionMessage": " ",

					"NotesState": "None",
					"NotesMessage": " ",

					"LanguageState": "None",
					"LanguageMessage": " "
				}];
			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		//privious
		previosContactPersonDetails: function(oEvent) {
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.ContactPerson.ContactPersonList;
			if (parseInt(selectedRow) > 0) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) - 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("previosContactPersonDetailsNotavailable"));
			}
			this.getView().getModel("ContactDetailsSet").refresh();
			oBusyDialog.close();
		},

		//next
		nextContactPersonDetails: function(oEvent) {
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var selectedRow = oEvent.getParameters().id.split("-").pop();
			var dataModel = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.ContactPerson.ContactPersonList;
			if (dataModel.length > parseInt(selectedRow) + 1) {
				dataModel[parseInt(selectedRow)].VisibleBasedOnNext = false;
				dataModel[parseInt(selectedRow) + 1].VisibleBasedOnNext = true;
			} else {
				sap.m.MessageToast.show(this.i18nModel.getProperty("nextContactPersonDetailsNotavailable"));
			}
			this.getView().getModel("ContactDetailsSet").refresh();
			oBusyDialog.close();
		},
		onPressAddContactPerson: function() {

			var ContactPerson = this.getView().getModel("CreateModelSet").getData().ContactDetails.ContactPerson;
			//TaxData.UiAddressValidated = false;

			// if (TelephoneData.TelephoneFrag !== "" && TelephoneData.TelephoneFrag !== undefined && TelephoneData.ExtensionFrag !== "" &&
			// 	TelephoneData.ExtensionFrag !==
			// 	undefined) {
			// 	//selected value dont allow select view country key

			// }
			ContactPerson.ContactPersonList.push({
				LastName: ContactPerson.LastName

			});

			ContactPerson.LastName = "";
			// this.getView().getModel("CreateModelSet").refresh();
		},
		/////////////////////////////////////end contact details 

		chnageClassifcationMessage: function(oEvent) {
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		chnageClassifcationValue: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var obj = oEvent.getSource().getBindingContext("TextNotesModelSet").getObject();
			if (obj.Classification.toString().trim() === "") {
				obj.Value = "";
				this.getView().getModel("TextNotesModelSet").refresh();
				sap.m.MessageToast.show(this.i18nModel.getProperty("firstSlectClassictionInTextNote"));
			}
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		onChangeTextTypeTextNotes: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var modelData = this.getView().getModel("TextNotesModelSet").getData().TextNotes.TextNotes2;
			var selRow = oEvent.getSource().sId.split("-").pop();
			var err = 0;
			if (oEvent.getSource().getSelectedItem() !== null) {
				var selObj = modelData[selRow];
				for (var i = 0; i < modelData.length; i++) {
					if (i !== parseInt(selRow)) {
						if (selObj.Level === modelData[i].Level && modelData[i].Level !== undefined && modelData[i].Level.trim() !== "" &&
							selObj.TextType === modelData[i].TextType && modelData[i].TextType !== undefined && modelData[i].TextType.trim() !== "") {
							err++;
						}
					}
				}

				if (err > 0) {
					modelData[selRow].TextType = "";
					sap.m.MessageToast.show(this.i18nModel.getProperty("samecombinationNotAllowedLevelAndType"));
				}
				this.getView().getModel("TextNotesModelSet").refresh();
			} else {
				oEvent.getSource().setValue("");
			}
		},

		//	If File Type Not Match
		fileTypeMissmatch: function(oEvent) {
			var msg = this.i18nModel.getProperty("msgFileTypeAllowedOnly");
			this.errMsg(msg);
		},

		//	on upload Abort
		uploadAborted: function(oEvent) {
			var msg = this.i18nModel.getProperty("msgFileUpload");
			sap.m.MessageToast.show(msg);
		},

		//	if File Size More Than 5 MB
		fileSizeExceed: function(oEvent) {
			var msg = this.i18nModel.getProperty("msgFileSizeShouldLessThan2MB");
			sap.m.MessageToast.show(msg);
		},

		//	on file Name large
		onFilenameLengthExceed: function(oEvent) {
			var msg = this.i18nModel.getProperty("msgFileNameShouldbeUpToCharacter");
			sap.m.MessageToast.show(msg);
		},
		onUploadComplete: function(oEvent) {},

		onChangeFile: function(oEvent) {
			var that = this;
			var userName = "";
			if (sap.ushell.Container !== undefined) {
				userName = sap.ushell.Container.getService("UserInfo").getUser().getFullName();
			}
			var tableData = that.getView().getModel("FileUploadSet").getData().results;
			var fileLength = oEvent.getParameters("file").files.length;
			var filesSel = oEvent.getParameters("file").files;
			var totalLength = parseInt(tableData.length) + parseInt(fileLength);
			if (totalLength > 10) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("allowedMaximum5Attachment"));
				return;
			}
			//check file Name same or not
			var dupFileName = [];
			for (var r = 0; r < fileLength; r++) {
				for (var h = 0; h < tableData.length; h++) {
					if (filesSel[r].name === tableData[h].FileName) {
						dupFileName.push(filesSel[r].name);
					}
				}
			}

			if (dupFileName.length > 0) {
				sap.m.MessageToast.show(dupFileName.join(", ") + " " + this.i18nModel.getProperty("sameFileNameNotAllowed"));
				return;
			}

			for (var i = 0; i < oEvent.getParameters("file").files.length; i++) {
				var fileDetails = oEvent.getParameters("file").files[i];
				sap.ui.getCore().fileUploadArr = [];
				if (fileDetails) {
					var mimeDet = fileDetails.type,
						fileName = fileDetails.name;
					var fileSize = fileDetails.size;

					// Calling method....
					this.base64coonversionMethod(mimeDet, fileName, fileDetails, fileSize, userName);
				} else {
					sap.ui.getCore().fileUploadArr = [];
				}
			}
		},
		base64coonversionMethod: function(fileMime, fileName, fileDetails, fileSize, userName) {
			var that = this;
			if (!FileReader.prototype.readAsBinaryString) {
				FileReader.prototype.readAsBinaryString = function(fileData) {
					var binary = "";
					var reader = new FileReader();
					reader.onload = function(e) {
						var bytes = new Uint8Array(reader.result);
						var length = bytes.byteLength;
						for (var i = 0; i < length; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						that.base64ConversionRes = btoa(binary);
						var tableData = that.getView().getModel("FileUploadSet").getData().results;
						tableData.push({
							"Type": fileMime,
							"FileName": fileName,
							"Content": that.base64ConversionRes,
							"Size": fileSize,
							"Note": "",
							"FullName": userName,
							"TimeStamp": new Date()
						});
						that.getView().byId("idfileUploader").setValue("");
						that.getView().byId("idfileUploader").setTooltip("");
						that.getView().getModel("FileUploadSet").refresh();
					};
					reader.readAsArrayBuffer(fileData);
				};
			}
			var reader = new FileReader();
			reader.onload = function(readerEvt) {
				var binaryString = readerEvt.target.result;
				that.base64ConversionRes = btoa(binaryString);
				var tableData = that.getView().getModel("FileUploadSet").getData().results;
				tableData.push({
					"Type": fileMime,
					"FileName": fileName,
					"Content": that.base64ConversionRes,
					"Size": fileSize,
					"Note": "",
					"FullName": userName,
					"TimeStamp": new Date()

				});
				that.getView().byId("idfileUploader").setValue("");
				that.getView().byId("idfileUploader").setTooltip("");
				that.getView().getModel("FileUploadSet").refresh();
			};
			reader.readAsBinaryString(fileDetails);
		},

		createFileUploadSection: function() {
			var fileUpload = [];
			var modelUpl = new sap.ui.model.json.JSONModel({
				"results": fileUpload
			});
			this.getView().setModel(modelUpl, "FileUploadSet");
		},
		onClickOfFileRedirect: function(oEvent) {
			var data = oEvent.getSource().getBindingContext("FileUploadSet").getObject();
			//	sap.ui.core.util.File.save(blob(data.Content), "FileName",data.FileName.split(".").pop() , null,null);
			var sliceSize = 512;
			var byteCharacters = window.atob(data.Content); //method which converts base64 to binary
			var byteArrays = [];
			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);
				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}
				var byteArray = new Uint8Array(byteNumbers);
				byteArrays.push(byteArray);
			}
			var blob = new Blob(byteArrays, {
				type: data.Type
			}); //statement which creates the blob
			var blobURL = URL.createObjectURL(blob);
			//	window.open(blobURL);

			//	var encodeUrl = encodeURI(url);
			//sap.m.URLHelper.redirect(blobURL, true);
			var a = document.createElement('a');
			document.body.appendChild(a);
			a.href = blobURL;
			a.download = data.FileName;
			a.click();
		},

		onDeleteAttachment: function(oEvent) {
			var rowId = oEvent.getSource().sId.split("-").pop();
			var modelUpl = this.getView().getModel("FileUploadSet");
			modelUpl.getData().results.splice(rowId, 1);
			modelUpl.refresh();
			sap.m.MessageToast.show(this.i18nModel.getProperty("deletedAttachment"));
		},

		onPressSubmitCustomerCreate: function(req) {
			var that = this;
			//Resubmit & Review scenario
			if (this.resubmitScenario === false && this.reviewScenario === false) {
				var modl = sap.ui.getCore().getModel("searchExtSubTableModelSet").getData();
				var delInd = (modl !== undefined && modl.ArrayExtIdent !== undefined && modl.ArrayExtIdent.delInd !== undefined) ? modl.ArrayExtIdent
					.delInd : "N";
			} else {
				delInd = "";
			}
			var payload = {
				BusinessPartnerData: {},
				CustomerData: {},
				ContactDetails: {
					CompanyContactDetail: {},
					ContactPersons: []
				},
				AccountingData: {
					AccountManagement: {},
					PaymentData: {},
					Correspondence: {}
				},
				SalesData: {
					SalesOrder: {},
					Shipping: {},
					BillingDocument: {},
					PartnerFunctions: {},
					AdditionalFields: {}
				},
				StatusData: {
					DeletionFlag: {},
					BlockData: {}
				},
				TextNotes: {},
				UploadDocuments: {}
			};
			//for header company details
			payload.BusinessPartnerData.CustomerBusinessArea = {};
			var hedrData = this.getView().getModel("HeaderModelSet").getData();
			payload.BusinessPartnerData.CustomerBusinessArea.CompanyCode = hedrData.CompnyCodeKey.toString().trim();
			payload.BusinessPartnerData.CustomerBusinessArea.companyCodeRowid = "";
			payload.BusinessPartnerData.CustomerBusinessArea.SalesOrg = hedrData.SalesOrgKey.toString().trim();
			payload.BusinessPartnerData.CustomerBusinessArea.salesOrganizationRowid = "";
			payload.BusinessPartnerData.CustomerBusinessArea.DistributionChannel = hedrData.DistribChnnlKey.toString().trim();
			payload.BusinessPartnerData.CustomerBusinessArea.distributionChannelRowid = "";
			payload.BusinessPartnerData.CustomerBusinessArea.Division = hedrData.DivisionKey.toString().trim();
			payload.BusinessPartnerData.CustomerBusinessArea.divisionRowid = "";
			payload.BusinessPartnerData.CustomerBusinessArea.System = hedrData.System.toString().trim();
			payload.BusinessPartnerData.CustomerBusinessArea.itoLogicalCompRowid = "";
			payload.BusinessPartnerData.CustomerBusinessArea.AccountGroup = hedrData.AccountGrpKey.toString().trim();
			payload.BusinessPartnerData.CustomerBusinessArea.applnRoleRowid = "";
			payload.BusinessPartnerData.CustomerBusinessArea.ApplicationId = hedrData.AppId.toString().trim();
			payload.BusinessPartnerData.CustomerBusinessArea.leadingAccount = "";
			payload.BusinessPartnerData.CustomerBusinessArea.otherBcChange = "";
			payload.BusinessPartnerData.CustomerBusinessArea.delInd = "";
			payload.BusinessPartnerData.CustomerBusinessArea.Rebate = "";
			payload.BusinessPartnerData.CustomerBusinessArea.linkingPartners = "";
			payload.BusinessPartnerData.CustomerBusinessArea.removeBlock = "";
			payload.BusinessPartnerData.CustomerBusinessArea.pricing = "";
			payload.BusinessPartnerData.CustomerBusinessArea.liableForTax = "";
			payload.BusinessPartnerData.CustomerBusinessArea.setBlock = "";
			payload.BusinessPartnerData.CustomerBusinessArea.SalesOrg_delind = "";
			payload.BusinessPartnerData.CustomerBusinessArea.Custidentifier_delind = delInd;
			payload.BusinessPartnerData.CustomerBusinessArea.CompanyCode_delInd = "";

			//name address Section
			var BusPartTabData = this.getView().getModel("CreateModelSet").getData();
			var nameAddData = BusPartTabData.NameAndAddress;
			payload.BusinessPartnerData.Name_Address = [];
			for (var s = 0; s < nameAddData.length; s++) {
				payload.BusinessPartnerData.Name_Address.push({
					"CONTACTrowid": nameAddData[s].CONTACTrowid ? nameAddData[s].CONTACTrowid.toString() : "",
					"Country": nameAddData[s].Country.toString().trim(),
					"cntryRowid": "",
					"matchRuleGroup": nameAddData[s].MatchRuleGroup.toString().trim(),
					"sipPop": nameAddData[s].SIP_POP.toString().trim(),
					"AddressVersion": nameAddData[s].Address_Version.toString().trim(),
					"PreferredAddressVersion": nameAddData[s].Preferred_Local_Language,
					"Name": nameAddData[s].Name.toString().trim(),
					"Name1": nameAddData[s].Name_1.toString().trim(),
					"Name2": nameAddData[s].Name_2.toString().trim(),
					"Name3": nameAddData[s].Name_3.toString().trim(),
					"Name4": nameAddData[s].Name_4.toString().trim(),
					"Street": nameAddData[s].Street.toString().trim(),
					"Street1": nameAddData[s].Street_1.toString().trim(),
					"Street2": nameAddData[s].Street_2.toString().trim(),
					"Street3": nameAddData[s].Street_3.toString().trim(),
					"Street4": nameAddData[s].Street_4.toString().trim(),
					"Street5": nameAddData[s].Street_5.toString().trim(),
					"HouseNo": nameAddData[s].House_No.toString().trim(),
					"HouseNoSupplement": nameAddData[s].House_No_Supplement.toString().trim(),
					"Building": nameAddData[s].Building.toString().trim(),
					"Floor": nameAddData[s].Floor.toString().trim(),
					"Room": nameAddData[s].Room.toString().trim(),
					"PostalCode": nameAddData[s].Postal_Code.toString().trim(),
					"District": nameAddData[s].District.toString().trim(),
					"City": nameAddData[s].City.toString().trim(),
					"Region": nameAddData[s].Region.toString().trim(),
					"cntrySubdivRowid": "",
					"FreeTradeRegion": nameAddData[s].Free_Trade_Region.toString().trim(),
					"freeTradeRegionRowid": "",
					"POBoxNumber": nameAddData[s].PO_Box.toString().trim(),
					"POBoxPostalCode": nameAddData[s].PO_Box_Code.toString().trim(),
					"CompanyPostalCode": nameAddData[s].CompPostalCode.toString().trim(),
					"POBoxCity": nameAddData[s].PO_Box_City.toString().trim(),
					"BypassTrilliumAddressValidation": nameAddData[s].Bypass_Validation,
					"StreetValidation": nameAddData[s].Street_Validation.toString().trim(),
					"POBoxValidation": nameAddData[s].POBox_Validation.toString().trim(),
					"preferredLocalLanguage": ""
				});
			}

			//Tax data 
			var taxData = BusPartTabData.TaxData;
			payload.BusinessPartnerData.TaxData = {};
			payload.BusinessPartnerData.TaxData.Tax1 = taxData.Text1Value.toString().trim();
			payload.BusinessPartnerData.TaxData.Tax2 = taxData.Text2Value.toString().trim();
			payload.BusinessPartnerData.TaxData.Tax3 = taxData.Text3Value.toString().trim();
			payload.BusinessPartnerData.TaxData.Tax4 = taxData.Text4Value.toString().trim();
			payload.BusinessPartnerData.TaxData.Tax5 = taxData.Text5Value.toString().trim();
			payload.BusinessPartnerData.TaxData.TaxJurisdictionCode = taxData.TaxJurisdiction_Code.toString().trim();
			payload.BusinessPartnerData.TaxData.TaxationType = taxData.Taxation_Type.toString().trim();
			payload.BusinessPartnerData.TaxData.taxTypeRowid = "";
			payload.BusinessPartnerData.TaxData.TaxNumberType = taxData.TaxNumber_Type.toString().trim();
			payload.BusinessPartnerData.TaxData.taxNumberTypeRowid = "";
			payload.BusinessPartnerData.TaxData.CFOPCategory = taxData.CFOP_Category.toString().trim();
			payload.BusinessPartnerData.TaxData.ICMSLaw = taxData.ICMS_Law.toString().trim();
			payload.BusinessPartnerData.TaxData.IPILaw = taxData.IPI_Law.toString().trim();
			payload.BusinessPartnerData.TaxData.NaturalPerson = taxData.Natural_Person;
			payload.BusinessPartnerData.TaxData.Sales_PurTax = taxData.salesPurchase_Tax;
			payload.BusinessPartnerData.TaxData.EqualizationTax = taxData.Equalization_Tax;
			payload.BusinessPartnerData.TaxData.ICMSExempt = taxData.ICMS_Exempt;
			payload.BusinessPartnerData.TaxData.IPI_Exempt = taxData.IPI_Exempt;
			payload.BusinessPartnerData.TaxData.VAT = [{
				"Country": taxData.VatCountKey.toString().trim(),
				"Number": taxData.VatNum.toString().trim()
			}];
			//for additional VAT
			for (var sun = 0; sun < taxData.AdditionalVats.length; sun++) {
				payload.BusinessPartnerData.TaxData.VAT.push({
					"Country": taxData.AdditionalVats[sun].VatCountKey.toString().trim(),
					"Number": taxData.AdditionalVats[sun].VatNum.toString().trim()
				});
			}

			//Customer Classification Busniess tab
			var custClassic = BusPartTabData.CustomerClassification;
			payload.BusinessPartnerData.CustomerClassification = {};
			payload.BusinessPartnerData.CustomerClassification.AccountType = custClassic.Account_Type.toString().trim();
			payload.BusinessPartnerData.CustomerClassification.IndustryClassification1 = "";
			payload.BusinessPartnerData.CustomerClassification.indstryClsfnL1Rowid = custClassic.IndustryClassification_1.toString(); //.toString().trim();
			payload.BusinessPartnerData.CustomerClassification.IndustryClassification2 = "";
			payload.BusinessPartnerData.CustomerClassification.indstryClsfnL2Rowid = custClassic.IndustryClassification_2.toString(); //.toString().trim();
			payload.BusinessPartnerData.CustomerClassification.Banner = "";
			payload.BusinessPartnerData.CustomerClassification.cusBannerRowid = custClassic.Banner.toString(); //.toString().trim();
			payload.BusinessPartnerData.CustomerClassification.IndirectCustomerType = custClassic.IndirectCustomer_Type.toString(); //.toString().trim();
			payload.BusinessPartnerData.CustomerClassification.BusinessActivityType = "";
			payload.BusinessPartnerData.CustomerClassification.cusBsnsActvtyRowid = custClassic.BusinessActivity_Type.toString(); //.toString().trim();
			payload.BusinessPartnerData.CustomerClassification.OrganizationLevel = "";
			payload.BusinessPartnerData.CustomerClassification.orgLvlRowid = custClassic.Organization_Level.toString(); //.toString().trim();
			payload.BusinessPartnerData.CustomerClassification.AccountLegalStatus = "";
			payload.BusinessPartnerData.CustomerClassification.legalClassRowid = custClassic.AccountLegal_Status.toString(); //.toString().trim();
			payload.BusinessPartnerData.CustomerClassification.CommercialDeal_to = custClassic.CommercialDeal_To;
			payload.BusinessPartnerData.CustomerClassification.ServiceDeal_to = custClassic.ServiceDeal_To;
			payload.BusinessPartnerData.CustomerClassification.Store = custClassic.Store;

			//	External identifier Business Tab
			payload.BusinessPartnerData.External_Identifier = {};
			var externalIdent = BusPartTabData.ExternalIdentifer;
			payload.BusinessPartnerData.External_Identifier.DUNS = externalIdent.DUNS.toString().trim();
			payload.BusinessPartnerData.External_Identifier.ChamberOfCommerce = externalIdent.ChamberOf_Commerce.toString().trim();
			payload.BusinessPartnerData.External_Identifier.intExtIndicatorRowid = "";

			var extType = BusPartTabData.ExternalIdentifer.ExternalIdenitir;
			payload.BusinessPartnerData.External_Identifier.ExternalIdentifier = [];
			for (var v = 0; v < extType.length; v++) {
				payload.BusinessPartnerData.External_Identifier.ExternalIdentifier.push({
					"ExternalIdentifierType": "",
					"identifierTypeRowid": extType[v].ExterIdtType.toString(),
					"ExternalIdentifierValue": extType[v].ExtIdntValue.toString().trim(),
					"altIdentifier": extType[v].ExtIdntValue.toString().trim(),
					"extTypeMatch": "",
					"External_rowid": extType[v].ExterIdtRowId ? extType[v].ExterIdtRowId.toString() : ""
				});
			}

			//add duns & chamber value
			if (externalIdent.DUNS.toString().trim() !== "") {
				payload.BusinessPartnerData.External_Identifier.ExternalIdentifier.push({
					"ExternalIdentifierType": "",
					"identifierTypeRowid": this.DunsUniqRowId.toString(),
					"ExternalIdentifierValue": externalIdent.DUNS.toString().trim(),
					"altIdentifier": externalIdent.DUNS.toString().trim(),
					"extTypeMatch": "",
					"External_rowid": externalIdent.DUNSRowId ? externalIdent.DUNSRowId.toString() : ""
				});
			}

			if (externalIdent.ChamberOf_Commerce.toString().trim() !== "") {
				payload.BusinessPartnerData.External_Identifier.ExternalIdentifier.push({
					"ExternalIdentifierType": "",
					"identifierTypeRowid": this.ChemOfCommsRowId.toString(),
					"ExternalIdentifierValue": externalIdent.ChamberOf_Commerce.toString().trim(),
					"altIdentifier": externalIdent.ChamberOf_Commerce.toString().trim(),
					"extTypeMatch": "",
					"External_rowid": externalIdent.ChamberOf_CommerceRowId ? externalIdent.ChamberOf_CommerceRowId.toString() : ""
				});
			}

			//contact details
			payload.ContactDetails.CompanyContactDetail.Telephone_Segment = [];
			var contactDetTab = this.getView().getModel("ContactDetailsSet").getData();
			var conDetTeliphone = contactDetTab.ContactDetails.Telephone.TelephoneList;
			for (var a = 0; a < conDetTeliphone.length; a++) {
				payload.ContactDetails.CompanyContactDetail.Telephone_Segment.push({
					"Telephone": conDetTeliphone[a].Telephone.toString().trim(),
					"Extension": conDetTeliphone[a].Extension.toString().trim(),
					"Comments": conDetTeliphone[a].Comments.toString().trim(),
					"Default": conDetTeliphone[a].Default
				});
			}

			//contact tab Fax
			payload.ContactDetails.CompanyContactDetail.Fax_Segment = [];
			var conDetFax = contactDetTab.ContactDetails.Fax.FaxList;
			for (var a = 0; a < conDetFax.length; a++) {
				payload.ContactDetails.CompanyContactDetail.Fax_Segment.push({
					"Fax": conDetFax[a].Fax.toString().trim(),
					"Extension": conDetFax[a].Extension.toString().trim(),
					"Comments": conDetFax[a].Comments.toString().trim(),
					"Default": conDetFax[a].Default
				});
			}

			//contact tab Email
			payload.ContactDetails.CompanyContactDetail.Email_Segment = [];
			var conDetEmail = contactDetTab.ContactDetails.Email.EmailList;
			for (var b = 0; b < conDetEmail.length; b++) {
				payload.ContactDetails.CompanyContactDetail.Email_Segment.push({
					"Email": conDetEmail[b].Email.toString().trim(),
					"Comments": conDetEmail[b].Comments.toString().trim(),
					"Default": conDetEmail[b].Default
				});
			}

			//contact tab URL
			payload.ContactDetails.CompanyContactDetail.URL_Segment = [];
			var conDetUrl = contactDetTab.ContactDetails.URL.URLList;
			for (var c = 0; c < conDetUrl.length; c++) {
				payload.ContactDetails.CompanyContactDetail.URL_Segment.push({
					"URL": conDetUrl[c].URL.toString().trim(),
					"Comments": conDetUrl[c].Comments.toString().trim(),
					"Default": conDetUrl[c].Default
				});
			}
			//UI Not there
			var telBoxNo = contactDetTab.ContactDetails.Telebox;
			payload.ContactDetails.CompanyContactDetail.Telebox_Number = telBoxNo.TeleboxNO.toString().trim();

			//contact persn Contact Det Tab
			payload.ContactDetails.ContactPersons = [];
			var contPerson = contactDetTab.ContactDetails.ContactPerson.ContactPersonList;
			for (var d = 0; d < contPerson.length; d++) {
				if (contPerson[d].LastName.toString().trim() !== "") {
					payload.ContactDetails.ContactPersons.push({
						"Language": contPerson[d].Language.toString().trim(),
						"languageRowid": "",
						"Last_Name": contPerson[d].LastName.toString().trim(),
						"First_Name": contPerson[d].FirstName.toString().trim(),
						"Function": contPerson[d].Function.toString().trim(),
						"Department": contPerson[d].Department.toString().trim(),
						"Telephone": contPerson[d].Telephone.toString().trim(),
						"Telephone_Extension": contPerson[d].TelephoneExtension.toString().trim(),
						"Fax": contPerson[d].Fax.toString().trim(),
						"Fax_Extension": contPerson[d].FaxExtension.toString().trim(),
						"Mobile_Phone": contPerson[d].MobilePhone.toString().trim(),
						"Email": contPerson[d].Email.toString().trim(),
						"Method": contPerson[d].Method.toString().trim(),
						"Notes": contPerson[d].Notes.toString().trim()
					});
				}
			}

			//for document Upload file
			payload.UploadDocuments = [];
			var modelUpl = this.getView().getModel("FileUploadSet").getData().results;
			for (var i = 0; i < modelUpl.length; i++) {
				payload.UploadDocuments.push({
					"DocumentUpload": {
						"Attachment": modelUpl[i].Content
					},
					"UploadedFiles": {
						"FileName": modelUpl[i].FileName,
						"FileSize": modelUpl[i].Size,
						"FileType": modelUpl[i].Type,
						"Note": modelUpl[i].Note.toString().trim(),
						//	"TimeStamp": Formatter.DateConversionToBackend(modelUpl[i].TimeStamp),
						"TimeStamp": modelUpl[i].TimeStamp,
						"Name_Of_Person": modelUpl[i].FullName
					}
				});
			}

			//payload for unloading Points
			payload.CustomerData.UnloadingPoints = [];
			var customerDataTab = this.getView().getModel("CustomerDataSet").getData();
			var unlodPointTab = customerDataTab.UnloadingPoint.UnloadPointArr;
			var countDefUn = 0;
			for (var ir = 0; ir < unlodPointTab.length; ir++) {
				if (unlodPointTab[ir].Default) {
					countDefUn++;
				}
			}
			if (countDefUn === 0 && unlodPointTab.length > 0) {
				unlodPointTab[0].Default = true;
			}
			for (var i = 0; i < unlodPointTab.length; i++) {
				//check unload point & calender key is there
				if (unlodPointTab[i].UnloadPoint.toString().trim() !== "" && unlodPointTab[i].CalenderKey.toString().trim() !== "") {
					payload.CustomerData.UnloadingPoints.push({
						"UnloadPoint": unlodPointTab[i].UnloadPoint.toString().trim(),
						"GoodsReceivingHours": unlodPointTab[i].GoodsRecHrs.toString().trim(),
						"Default": unlodPointTab[i].Default,
						"CalendarKey": unlodPointTab[i].CalenderKey.toString().trim(),
						"GoodsReceivingHours_24Hrs_Notion": {}
					});

					for (var j = 0; j < 7; j++) {
						if (unlodPointTab[i].DayTable[j].Weekday === "Monday") {
							payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Monday = {
								"Morning": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningclose)
								},
								"Afternoon": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonclose)
								}
							};
						} else if (unlodPointTab[i].DayTable[j].Weekday === "Tuesday") {
							payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Tuesday = {
								"Morning": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningclose)
								},
								"Afternoon": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonclose)
								}
							};
						} else if (unlodPointTab[i].DayTable[j].Weekday === "Wednesday") {
							payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Wednesday = {
								"Morning": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningclose)
								},
								"Afternoon": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonclose)
								}
							};
						} else if (unlodPointTab[i].DayTable[j].Weekday === "Thursday") {
							payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Thursday = {
								"Morning": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningclose)
								},
								"Afternoon": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonclose)
								}
							};
						} else if (unlodPointTab[i].DayTable[j].Weekday === "Friday") {
							payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Friday = {
								"Morning": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningclose)
								},
								"Afternoon": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonclose)
								}
							};
						} else if (unlodPointTab[i].DayTable[j].Weekday === "Saturday") {
							payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Saturday = {
								"Morning": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningclose)
								},
								"Afternoon": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonclose)
								}
							};
						} else if (unlodPointTab[i].DayTable[j].Weekday === "Sunday") {
							payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Sunday = {
								"Morning": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Morningclose)
								},
								"Afternoon": {
									"Open": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonopen),
									"Close": Formatter.addTimeFormat(unlodPointTab[i].DayTable[j].Afternoonclose)
								}
							};
						}
					}
				}
			}

			//Bank / Iban Details
			payload.CustomerData.BankData = {};
			var bankHdr = customerDataTab.BankDetails;
			payload.CustomerData.BankData.AlternativePayer = bankHdr.AlternPayer.toString().trim();
			payload.CustomerData.BankData.IndividualEntries = bankHdr.IndivEnteris;
			payload.CustomerData.BankData.AllowedPayer = bankHdr.AllowedPayer.toString().trim();
			payload.CustomerData.BankData.BankDetails = [];

			//bank items
			var bankItems = customerDataTab.BankDetails.BankIBan;
			for (var r = 0; r < bankItems.length; r++) {

				if (bankItems[r].Country.toString().trim() !== "" && bankItems[r].BankKey.toString().trim() !== "" && bankItems[r].BankAccount.toString()
					.trim() !== "") {
					payload.CustomerData.BankData.BankDetails.push({
						"IBAN": bankItems[r].IBan.toString().trim(),
						"Country": bankItems[r].Country.toString().trim(),
						"BankKey": bankItems[r].BankKey.toString().trim(),
						"BankControlKey": bankItems[r].BankControlKey.toString().trim(),
						"BankAccount": bankItems[r].BankAccount.toString().trim(),
						"BankAccountHolder": bankItems[r].BankAccHolder.toString().trim(),
						"BankType": bankItems[r].BankType.toString().trim(),
						"ReferenceDetails": bankItems[r].RefDetails.toString().trim(),
						"CollectionAuth": bankItems[r].CollectionAuth
					});
				}
			}

			//customer Genral data
			var custGenDataHdr = customerDataTab.GenData;
			payload.CustomerData.GeneralData = {};
			payload.CustomerData.GeneralData.URL = "";
			payload.CustomerData.GeneralData.AlternateBusinessName = custGenDataHdr.AltBusiName.toString().trim();
			payload.CustomerData.GeneralData.SearchTerm1 = custGenDataHdr.SearchTearm1.toString().trim();
			payload.CustomerData.GeneralData.SearchTerm2 = custGenDataHdr.SearchTearm2.toString().trim();
			payload.CustomerData.GeneralData.CommunicationLanguage = custGenDataHdr.CommuLang.toString().trim();
			payload.CustomerData.GeneralData.AuthorizationGroup = custGenDataHdr.AuthoGrp.toString().trim();
			payload.CustomerData.GeneralData.VendorNumber = custGenDataHdr.VendNum.toString().trim();
			payload.CustomerData.GeneralData.TransportationZone = custGenDataHdr.TranspoZone.toString().trim();
			payload.CustomerData.GeneralData.transZoneCodeRowid = "";
			payload.CustomerData.GeneralData.AlternateTransportationZone = custGenDataHdr.AltTranspoZone.toString().trim();
			payload.CustomerData.GeneralData.Reg_Struct_Group = custGenDataHdr.RegStructGrp.toString().trim();
			payload.CustomerData.GeneralData.GroupKey = custGenDataHdr.GroupKey.toString().trim();
			payload.CustomerData.GeneralData.Trading_Partner = custGenDataHdr.TradingPartner.toString().trim();
			payload.CustomerData.GeneralData.MainlyCivilianUsage = custGenDataHdr.MainlyCivilianUsg;
			payload.CustomerData.GeneralData.MainlyMilitaryUsage = custGenDataHdr.MainlyMailitaryUsg;
			payload.CustomerData.GeneralData.bsnsPrtnrId = hedrData.GoldenRecordId ? hedrData.GoldenRecordId.toString().trim() : "";
			payload.CustomerData.GeneralData.Location_No1 = custGenDataHdr.LocationNo1.toString().trim();
			payload.CustomerData.GeneralData.Location_No2 = custGenDataHdr.LocationNo2.toString().trim();
			payload.CustomerData.GeneralData.CheckDigit = custGenDataHdr.CheckDegit.toString().trim();

			//Note Text
			var dataTextNote = this.getView().getModel("TextNotesModelSet").getData();
			var TextNote = dataTextNote.TextNotes.TextNotes2;
			payload.TextNotes.Text = [];
			for (var m = 0; m < TextNote.length; m++) {
				if (TextNote[m].Level.toString().trim() !== "" && TextNote[m].TextType.toString().trim() !== "") {
					payload.TextNotes.Text.push({
						"Level": TextNote[m].Level.toString().trim(),
						"Language": TextNote[m].Language.toString().trim(),
						"Text_Type": TextNote[m].TextType.toString().trim(),
						"Free_Text": TextNote[m].FreeText.toString().trim(),
						"Multi_Line": TextNote[m].FreeText.toString().trim().length > 40 ? true : false
					});
				}
			}

			//Classification 
			var classTextNote = dataTextNote.Classification.Classification2;
			payload.TextNotes.TextClassification = [];
			for (var l = 0; l < classTextNote.length; l++) {
				if (classTextNote[l].ClassificationType.toString().trim() !== "" && classTextNote[l].Classification.toString().trim() !== "" &&
					classTextNote[l].Value.toString().trim() !== "") {
					payload.TextNotes.TextClassification.push({
						"Classification_Type": classTextNote[l].ClassificationType, //toString().trim(),
						"Classification": classTextNote[l].Classification, //.toString().trim(),
						"Value": classTextNote[l].Value.toString().trim()
					});
				}
			}

			//Accounting Data
			payload.AccountingData.AccountManagement = {};
			payload.AccountingData.PaymentData = {};
			payload.AccountingData.Correspondence = {};
			if (payload.BusinessPartnerData.CustomerBusinessArea.CompanyCode !== "") {
				var dataAccount = this.getView().getModel("AccountingDataModelSet").getData();
				var accMgm = dataAccount.AccountManagement;
				payload.AccountingData.AccountManagement.Recon_Account = accMgm.ReconAccount.toString().trim();
				payload.AccountingData.AccountManagement.Head_Office = accMgm.HeadOffice.toString().trim();
				payload.AccountingData.AccountManagement.Sort_Key = accMgm.SortKey.toString().trim();
				payload.AccountingData.AccountManagement.Prev_Acct_No = accMgm.PrevAcctNo.toString().trim();
				payload.AccountingData.AccountManagement.Buying_Group = accMgm.BuyingGroup.toString().trim();

				var payData = dataAccount.PaymentData;
				var payTerms = dataAccount.PaymentTerms;
				payload.AccountingData.PaymentData.Terms_Of_Payment = payTerms.terms_of_payment.toString().trim();
				payload.AccountingData.PaymentData.PaymentTerms_Comments = payTerms.PaymentTermMessage.toString().trim();
				payload.AccountingData.PaymentData.Credit_Memo_Payment_Term = payData.Creditmemopaytterm.toString().trim();
				payload.AccountingData.PaymentData.CreditMemoPaymentTerms_Comments = payTerms.CreditMemoPayTermMessage.toString().trim();
				payload.AccountingData.PaymentData.B_E_Changes_Payment_Term = payData.Bechangespaytterm.toString().trim();
				payload.AccountingData.PaymentData.BEPaymentTerms_Comments = payTerms.BeChangesPayTermMessage.toString().trim();
				payload.AccountingData.PaymentData.Tolerance_Group = payData.ToleranceGroup.toString().trim();
				payload.AccountingData.PaymentData.Payment_Methods = payData.PaymentMethods.toString().trim();
				payload.AccountingData.PaymentData.House_Bank = payData.HouseBank.toString().trim();
				payload.AccountingData.PaymentData.Selection_Rule = payData.SelectionRule.toString().trim();
				payload.AccountingData.PaymentData.Payment_History_Record = payData.PaymentHistoryRecord;

				var corresp = dataAccount.Correspondence;
				payload.AccountingData.Correspondence.Dunn_Procedure = corresp.DunnProcedure.toString().trim();
				payload.AccountingData.Correspondence.Dunning_Level = corresp.DunningLevel.toString().trim();
				payload.AccountingData.Correspondence.Customer_User = corresp.CustomerUser.toString().trim();
				payload.AccountingData.Correspondence.Last_Dunned = Formatter.dateSendToSap(corresp.LastDunned); // corresp.LastDunned.toString().trim();
				payload.AccountingData.Correspondence.Dunning_Area = corresp.DunningArea.toString().trim();
				payload.AccountingData.Correspondence.Clerks_Internet = corresp.ClerksInternet.toString().trim();
				payload.AccountingData.Correspondence.Dunning_Clerk = corresp.DunningClerk.toString().trim();
				payload.AccountingData.Correspondence.Clerk_Abbrev = corresp.ClerkAbbrev.toString().trim();
				payload.AccountingData.Correspondence.Account_Statement = corresp.AccountStatement.toString().trim();
				payload.AccountingData.Correspondence.Dunning_Block = corresp.DunningBlock.toString().trim();
				payload.AccountingData.Correspondence.Acct_At_Cust = corresp.AcctAtCust.toString().trim();
			}
			//status data
			payload.StatusData.DeletionFlag = {};
			var statusData = this.getView().getModel("StatusDetailsSet").getData().DeletionFlag;
			payload.StatusData.DeletionFlag.DeletionFlagGeneric = statusData.DeletionFlagGeneric;
			payload.StatusData.DeletionFlag.DeletionFlagAccounting = statusData.DeletionFlagAccounting;
			payload.StatusData.DeletionFlag.DeletionFlagSales = statusData.DeletionFlagSales;

			payload.StatusData.BlockData = {};
			var statusDataBlock = this.getView().getModel("StatusDetailsSet").getData().BlockData;
			payload.StatusData.BlockData.PostingBlock = statusDataBlock.PostingBlock;
			payload.StatusData.BlockData.OrderBlock = statusDataBlock.OrderBlock.toString().trim();
			payload.StatusData.BlockData.DeliveryBlock = statusDataBlock.DeliveryBlock.toString().trim();
			payload.StatusData.BlockData.BillingBlock = statusDataBlock.BillingBlock.toString().trim();
			payload.StatusData.BlockData.BlockSalesSupport = statusDataBlock.BlockSalesReport;

			//Sales Data
			payload.SalesData.SalesOrder = {};
			payload.SalesData.Shipping = {};
			payload.SalesData.BillingDocument = {};
			payload.SalesData.AdditionalFields = {};

			if (payload.BusinessPartnerData.CustomerBusinessArea.SalesOrg !== "" && payload.BusinessPartnerData.CustomerBusinessArea.DistributionChannel !==
				"" && payload.BusinessPartnerData.CustomerBusinessArea.Division !== "") {
				var salesData = this.getView().getModel("SalesDataSet").getData();
				var salesOrdData = salesData.SalesOrder;
				payload.SalesData.SalesOrder.SalesDistrict = salesOrdData.SalesDistrict.toString().trim();
				payload.SalesData.SalesOrder.SalesOffice = salesOrdData.SalesOffice.toString().trim();
				payload.SalesData.SalesOrder.SalesGroup = salesOrdData.SalesGroup.toString().trim();
				payload.SalesData.SalesOrder.CustomerGroup = salesOrdData.CustomerGroup.toString().trim();
				payload.SalesData.SalesOrder.Currency = salesOrdData.Currency.toString().trim();
				payload.SalesData.SalesOrder.AcctAtCust = salesOrdData.AcctAtCust.toString().trim();
				payload.SalesData.SalesOrder.ExchRateType = salesOrdData.ExchangeRateType.toString().trim();
				payload.SalesData.SalesOrder.PriceGroup = salesOrdData.PriceGroup.toString().trim();
				payload.SalesData.SalesOrder.CustPricProc = salesOrdData.CustPricProc.toString().trim();
				payload.SalesData.SalesOrder.PriceList = salesOrdData.PriceList.toString().trim();
				payload.SalesData.SalesOrder.CustStatsGrp = salesOrdData.CustStatGrp.toString().trim();

				//shipping sales Data
				var salesShipp = salesData.Shipping;
				payload.SalesData.Shipping.DeliveryPriority = salesShipp.DeliveryPriority.toString().trim();
				payload.SalesData.Shipping.ShippingConditions = salesShipp.ShippingConditions.toString().trim();
				payload.SalesData.Shipping.DeliveringPlant = salesShipp.DeliveryPlant.toString().trim();
				payload.SalesData.Shipping.OrderCombination = salesShipp.OrderCombination;
				payload.SalesData.Shipping.RelevantForPod = salesShipp.RelevantforProd;
				payload.SalesData.Shipping.PodTimeframe = salesShipp.ProductionTimeFrame.toString().trim();
				payload.SalesData.Shipping.CompleteDeliveryRequired = salesShipp.CompleteDeliveryRequired;
				payload.SalesData.Shipping.PartialDeliveryPerItem = salesShipp.PartialDeliveryPerItem.toString(); //.trim();
				payload.SalesData.Shipping.MaxPartialDeliveries = salesShipp.MaxPartialDeliveries.toString().trim();

				//billing Document Sales Data
				var salesBilliDoc = salesData.BillingDocument;
				payload.SalesData.BillingDocument.Rebate = salesBilliDoc.Rebate;
				payload.SalesData.BillingDocument.PriceDetermination = salesBilliDoc.PriceDetermination;
				payload.SalesData.BillingDocument.InvoiceDates = salesBilliDoc.InvoiceDates;
				payload.SalesData.BillingDocument.InvoiceListDates = salesBilliDoc.InvoiceListDates;
				payload.SalesData.BillingDocument.Incoterms1 = salesBilliDoc.Incoterms1.toString().trim();
				payload.SalesData.BillingDocument.Incoterms2 = salesBilliDoc.Incoterms2.toString().trim();
				payload.SalesData.BillingDocument.TermsOfPayment = salesBilliDoc.TermsofPayment.toString().trim();
				payload.SalesData.BillingDocument.AcctAssgmtGroup = salesBilliDoc.AccountAssignmentGroup.toString().trim();
				//   payload.SalesData.BillingDocument.TaxExempt =salesBilliDoc

				//additional fields
				var salesAdFields = salesData.AdditionalFields;
				payload.SalesData.AdditionalFields.CustomerGroup1 = salesAdFields.CustomerGroup1.toString().trim();
				payload.SalesData.AdditionalFields.CustomerGroup2 = salesAdFields.CustomerGroup2.toString().trim();
				payload.SalesData.AdditionalFields.CustomerGroup3 = salesAdFields.CustomerGroup3.toString().trim();
				payload.SalesData.AdditionalFields.CustomerGroup4 = salesAdFields.CustomerGroup4.toString().trim();
				payload.SalesData.AdditionalFields.CustomerGroup5 = salesAdFields.CustomerGroup5.toString().trim();
				payload.SalesData.AdditionalFields.CustomerGroup6 = salesAdFields.CustomerGroup6.toString().trim();
			}
			//check comp code , sales org , dist channel
			payload.SalesData.BillingDocument.TaxClassifications = [];
			if (payload.BusinessPartnerData.CustomerBusinessArea.SalesOrg !== "" && payload.BusinessPartnerData.CustomerBusinessArea.DistributionChannel !==
				"" && payload.BusinessPartnerData.CustomerBusinessArea.SalesOrg !== undefined && payload.BusinessPartnerData.CustomerBusinessArea.DistributionChannel !==
				undefined
			) {
				var taxClass = this.getView().getModel("TaxClassificationComboSet").getData().results.d.results;
				for (var lb = 0; lb < taxClass.length; lb++) {
					payload.SalesData.BillingDocument.TaxClassifications.push({
						"Country": taxClass[lb].Cuntry.toString().trim(),
						"CountryName": taxClass[lb].CountryName.toString().trim(),
						"TaxCategory": taxClass[lb].Taxcategory.toString().trim(),
						"Name": taxClass[lb].Taxname.toString().trim(),
						"TaxClassification": taxClass[lb].Taxclassification.toString().trim()
					});
				}
			}

			payload.SalesData.PartnerFunctions = [];
			//check account grp
			if (payload.BusinessPartnerData.CustomerBusinessArea.AccountGroup !== "") {
				var defPartFun = that.getView().getModel("DefaultGeneratedPartnerFnSet").getData().results.d.results;
				for (var z = 0; z < defPartFun.length; z++) {
					if (defPartFun[z].PartnerFunction.toString().trim() !== "" && defPartFun[z].Number.toString().trim() !== "") {
						payload.SalesData.PartnerFunctions.push({
							"PartnerFunction": defPartFun[z].PartnerFunction.toString().trim(),
							"Number": defPartFun[z].Number.toString().trim(),
							"Name": defPartFun[z].Name.toString().trim(),
							"PartnerDescription": defPartFun[z].PartnerDescription.toString().trim(),
							"Default": defPartFun[z].Default,
							"PartnerFunctionSection": "D"
						});
					}
				}

				var otherPar = this.getView().getModel("OtherPartnerFunctionSet").getData().OtherPartnerFunctions;
				for (var z = 0; z < otherPar.length; z++) {
					if (otherPar[z].PartnerFunction.toString().trim() !== "" && otherPar[z].Number.toString().trim() !== "") {
						payload.SalesData.PartnerFunctions.push({
							"PartnerFunction": otherPar[z].PartnerFunction.toString().trim(),
							"Number": otherPar[z].Number.toString().trim(),
							"Name": otherPar[z].Name.toString().trim(),
							"PartnerDescription": otherPar[z].PartnerDescriptionText.toString().trim(),
							"Default": otherPar[z].Default,
							"PartnerFunctionSection": "O"
						});
					}
				}

				var toBeLink = this.getView().getModel("SoldtoPartnerFunctionSet").getData().SoldtoPartnerFunctions;
				for (var z = 0; z < toBeLink.length; z++) {
					if (toBeLink[z].PartnerFunction.toString().trim() !== "" && toBeLink[z].Number.toString().trim() !== "") {
						payload.SalesData.PartnerFunctions.push({
							"PartnerFunction": toBeLink[z].PartnerFunction.toString().trim(),
							"Number": toBeLink[z].Number.toString().trim(),
							"Name": toBeLink[z].Name.toString().trim(),
							"PartnerDescription": toBeLink[z].PartnerDescriptionText.toString().trim(),
							"Default": toBeLink[z].Default,
							"PartnerFunctionSection": "L"
						});
					}
				}
			}

			var UserCode1 = "";
			if (window.sap.ushell.Container !== undefined) {
				UserCode1 = window.sap.ushell.Container.getUser().getId();
			}

			if (this.resubmitScenario === true) {
				var kunnr = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.WorkFlow_Approver_Details.results[0].KUNNR;
			} else {
				kunnr = sap.ui.getCore().getModel("ExtSubTableModelSet").getData().Customernumber;
			}

			payload.WorkFlow_Approver_Details = {
				"Market_Approver_Role": "",
				"Market_Tax_Approver_Role": "",
				"MarketCredit_CollectionApprover_Role": "",
				"Reviewer_Rejection_Comments": "",
				"Routing_Condition": "",
				"Task_CancellationDuration": "",
				"RowId": "",
				"Requester_Code1": UserCode1,
				"Duplicate_Check_Comments": "",
				"Owner": "",
				"KUNNR": kunnr, //sap.ui.getCore().getModel("ExtSubTableModelSet").getData().Customernumber,
				"Error_Description": "",
				"ApproverComments": "",
				"ApproverUsername": "",
				"RejectGroup": "",
				"Rejection_Comments": "",
				"RejectionUsername": "",
				"Extension_Indicator": true,
				"NewSubscription_Ind": ""
			};
			payload.Requestor_Comments = "";

			var newDataPayload = JSON.parse(JSON.stringify(payload));
			//Resubmit & Review scenario
			if (this.resubmitScenario === false) {
				var busPart = sap.ui.getCore().getModel("ExtBusPartnerModelSet").getData().results.BUSINESSPARTNER;
				var dataPassed = sap.ui.getCore().getModel("searchExtSubTableModelSet").getData();
				newDataPayload.BusinessPartnerData.CustomerBusinessArea.BProwid = busPart.rowidObject ? busPart.rowidObject.toString() :
					"";
				newDataPayload.BusinessPartnerData.CustomerBusinessArea.CUSINTrowid = dataPassed.ArrayExtIdent ?
					dataPassed.ArrayExtIdent.rowidObject.toString() : "";

				newDataPayload.BusinessPartnerData.CustomerClassification.CUSTOMERrowid = (busPart.CUSTOMER !==
					undefined &&
					busPart.CUSTOMER.item !== undefined) ? busPart.CUSTOMER.item.rowidObject.toString() : "";
			} else {
				newDataPayload.BusinessPartnerData.CustomerBusinessArea.BProwid = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create
					.BusinessPartnerData.results[0].CustomerBusinessArea.results[0].BProwid;
				newDataPayload.BusinessPartnerData.CustomerBusinessArea.CUSINTrowid = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create
					.BusinessPartnerData.results[0].CustomerBusinessArea.results[0].CUSINTrowid;
				newDataPayload.serviceType = "R";
			}
			that.payloadOnValidateTemp = newDataPayload;
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_MDM_CustomerCreate/VALIDATE",
				"Request": JSON.stringify(newDataPayload)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(response) {
					oBusyDialog.close();
					if (response.Response.includes("<h1>Error</h1>")) {
						var message = response.Response.split("<pre>")[1].split("</pre>")[0];
						that.errMsg(message);
					} else {
						var msg = JSON.parse(response.Response);
						if (msg.objectXml !== undefined) {
							sap.m.MessageToast.show("Validated");
							that.responseValidateAPI = msg.objectXml.object;
							if (!that._oValueHelpDialogComment) {
								that._oValueHelpDialogComment = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.SubmitComment", that);
								that.getView().addDependent(that._oValueHelpDialogComment);

							}
							var commetModel = new sap.ui.model.json.JSONModel({
								"Comment": "",
								"CommentState": "None"
							});
							that._oValueHelpDialogComment.setModel(commetModel, "CommentSubmitModelSet");
							that._oValueHelpDialogComment.open();
						} else if (msg.detailsXml !== undefined) {
							that.errMsg(msg.detailsXml.ValidationErrors.error.message);
						}

					}
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});

		},

		submitFinalCancel: function() {
			this._oValueHelpDialogComment.close();
		},

		submitFinal: function(processId) {
			//Resubmit & Review scenario
			if (this.reviewScenario === true) {
				this.reviewRequest();
				return;
			} else if (this.deleteRequest === true) {
				this.cancelRequest();
				return;
			}
			var that = this;
			var payload = that.payloadOnValidateTemp;
			var selData = that.responseValidateAPI;

			if (that.sendDuplicatecomment) {
				//send duplicate comment
				payload.WorkFlow_Approver_Details.Duplicate_Check_Comments = that._oValueHelpDialogpDupCheckComment !== undefined ? that._oValueHelpDialogpDupCheckComment
					.getModel("CommentModelSet").getData()
					.Comment : "";
			} else {
				payload.WorkFlow_Approver_Details.Duplicate_Check_Comments = "";
			}

			payload.BusinessPartnerData.CustomerBusinessArea.itoLogicalCompRowid = selData.BUSINESSPARTNER.CUSINTIDENTIFIER.item.itoLogicalCompRowid
				.rowidObject.toString();
			payload.BusinessPartnerData.CustomerBusinessArea.applnRoleRowid = selData.BUSINESSPARTNER.CUSINTIDENTIFIER.item.applnRoleRowid.rowidObject
				.toString();
			payload.CustomerData.GeneralData.transZoneCodeRowid = selData.BUSINESSPARTNER.CUSINTIDENTIFIER.item.transZoneCodeRowid.rowidObject
				.toString();
			payload.BusinessPartnerData.CustomerBusinessArea.companyCodeRowid = selData.BUSINESSPARTNER.CUSINTIDENTIFIER.item.CUSCOMPANYCODE.item
				.companyCodeRowid.rowidObject.toString();
			payload.BusinessPartnerData.CustomerBusinessArea.salesOrganizationRowid = selData.BUSINESSPARTNER.CUSINTIDENTIFIER.item.CUSSALESAREA
				.item.salesOrganizationRowid.rowidObject.toString();
			payload.BusinessPartnerData.CustomerBusinessArea.distributionChannelRowid = selData.BUSINESSPARTNER.CUSINTIDENTIFIER.item.CUSSALESAREA
				.item.distributionChannelRowid.rowidObject.toString();
			payload.BusinessPartnerData.CustomerBusinessArea.divisionRowid = selData.BUSINESSPARTNER.CUSINTIDENTIFIER.item.CUSSALESAREA.item.divisionRowid
				.rowidObject.toString();
			payload.BusinessPartnerData.TaxData.taxNumberTypeRowid = selData.BUSINESSPARTNER.taxNumberTypeRowid.rowidObject.toString();
			payload.BusinessPartnerData.TaxData.taxTypeRowid = selData.BUSINESSPARTNER.taxTypeRowid.rowidObject.toString();

			payload.Request_ID = processId;
			payload.Requestor_Comments = that._oValueHelpDialogComment.getModel("CommentSubmitModelSet").getData().Comment;
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST/Customer_Create_Submit_Request",
				"Request": JSON.stringify(payload)
			};
			//Resubmit & Review scenario
			if (this.resubmitScenario === true) {
				this.resubmitRequest(payload);
			} else {
				var oBusyDialog = new sap.m.BusyDialog();
				oBusyDialog.open();
				this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
					success: function(response) {
						oBusyDialog.close();
						if (response.Response.includes("<h1>Error</h1>")) {
							var message = response.Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							that._oValueHelpDialogComment.close();
							var msgSub = that.i18nModel.getProperty("submitSuucessMsg");
							var msgSubmit2 = that.i18nModel.getProperty("msgSubmit2");
							//	var msg = JSON.parse(response.Response).Message;
							var msg3 = msgSub + " " + processId + " " + msgSubmit2;
							sap.m.MessageBox.success(msg3, {
								title: "Success", // default
								styleClass: "sapUiSizeCompact", // default
								actions: sap.m.MessageBox.Action.OK, // default
								emphasizedAction: sap.m.MessageBox.Action.OK, // default
								initialFocus: null, // default
								textDirection: sap.ui.core.TextDirection.Inherit, // default
								onClose: function(action) {
									window.location.href = '#Shell-home';
								}
							});
						}

					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
			}

		},

		processIdgenration: function() {
			//Resubmit & Review scenario
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				var processId = "";
				this.submitFinal(processId);
			} else {
				var that = this;
				var oBusyDialog = new sap.m.BusyDialog();
				oBusyDialog.open();
				var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/GetNumberRange');
				this.oModel.read(
					"/BusinessPartnerSet", {
						method: "GET",
						filters: [Filter1],
						success: function(oData, oResponse) {
							oBusyDialog.close();
							if (oData.results[0].Response.includes("<h1>Error</h1>")) {
								var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
								that.errMsg(message);
								return;
							}
							var data = JSON.parse(oData.results[0].Response);
							that.submitFinal(data.ProcessID);
						},
						error: function(oError) {
							oBusyDialog.close();

						}
					});
			}
		},

		createAccountyEmptyModel: function(oData) {
			var accData = {
				AccountManagement: {
					ReconAccount: oData.ReconciliationAccnt ? oData.ReconciliationAccnt.toString().trim() : "",
					HeadOffice: oData.HeadOffice ? oData.HeadOffice.toString().trim() : "",
					SortKey: oData.SortKey ? oData.SortKey.toString().trim() : "",
					PrevAcctNo: oData.PrevAcctNo ? oData.PrevAcctNo.toString().trim() : "",
					BuyingGroup: oData.BuyingGrp ? oData.BuyingGrp.toString().trim() : "",

					ReconAccountMessage: "",
					ReconAccountState: "None",

					HeadOfficeMessage: "",
					HeadOfficeState: "None",

					SortKeyMessage: "",
					SortKeyState: "None",

					PrevAcctNoMessage: "",
					PrevAcctNoState: "None",

					BuyingGroupMessage: "",
					BuyingGroupState: "None",
					UIAccountManagementValidator: true
				},

				PaymentData: {
					TermsofPayment: oData.TermsOfPayment ? oData.TermsOfPayment.toString().trim() : "",
					Creditmemopaytterm: oData.CreditMemoPaymntTrms ? oData.CreditMemoPaymntTrms.toString().trim() : "",
					Bechangespaytterm: oData.BillExchPaymntTerms ? oData.BillExchPaymntTerms.toString().trim() : "",
					ToleranceGroup: oData.ToleranceGroup ? oData.ToleranceGroup.toString().trim() : "",
					PaymentMethods: "",
					/*PaymentMethods: oData.PaymentMethods ? oData.PaymentMethods.toString().trim() : "",*/
					HouseBank: oData.HouseBank ? oData.HouseBank.toString().trim() : "",
					SelectionRule: oData.SelectionRule ? oData.SelectionRule.toString().trim() : "",
					PaymentHistoryRecord: oData.PaymentHistoryRecrd ? oData.PaymentHistoryRecrd : false,

					TermsofPaymentMessage: "",
					TermsofPaymentState: "None",

					CreditmemopayttermMessage: "",
					CreditmemopayttermState: "None",

					BechangespayttermMessage: "",
					BechangespayttermState: "None",

					ToleranceGroupMessage: "",
					ToleranceGroupState: "None",

					PaymentMethodsMessage: "",
					PaymentMethodsState: "None",

					HouseBankMessage: "",
					HouseBankState: "None",

					SelectionRuleMessage: "",
					SelectionRuleState: "None",
					PaymentHisRecodMessage: "",
					PaymentHisRecoState: "None",

					UIPaymentDataValidator: true
				},
				Correspondence: {
					DunnProcedure: oData.DunngProcedure ? oData.DunngProcedure.toString().trim() : "",
					LastDunned: Formatter.readLastDunnedDate(oData.LastDunned), //oData.LastDunned ? oData.LastDunned.toString().trim() : "",
					DunningClerk: oData.DunningClerk ? oData.DunningClerk.toString().trim() : "",
					DunningBlock: oData.DunningBlock ? oData.DunningBlock.toString().trim() : "",
					DunningLevel: oData.DunningLevel ? oData.DunningLevel.toString().trim() : "",
					DunningArea: oData.DunningArea ? oData.DunningArea.toString().trim() : "",
					ClerkAbbrev: oData.ClerkAbbrv ? oData.ClerkAbbrv.toString().trim() : "",
					AcctAtCust: oData.AcctAtCust ? oData.AcctAtCust.toString().trim() : "",
					CustomerUser: oData.CustUser ? oData.CustUser.toString().trim() : "",
					ClerksInternet: oData.ClerkInternet ? oData.ClerkInternet.toString().trim() : "",
					AccountStatement: oData.AccntStatemnt ? oData.AccntStatemnt.toString().trim() : "",

					DunnProcedureMessage: "",
					DunnProcedureState: "None",

					LastDunnedMessage: "",
					LastDunnedState: "None",

					DunningClerkMessage: "",
					DunningClerkState: "None",

					DunningBlockMessage: "",
					DunningBlockState: "None",

					DunningLevelMessage: "",
					DunningLevelState: "None",

					DunningAreaMessage: "",
					DunningAreaState: "None",

					ClerkAbbrevMessage: "",
					ClerkAbbrevState: "None",

					AcctAtCustMessage: "",
					AcctAtCustState: "None",

					CustomerUserMessage: "",
					CustomerUserState: "None",

					ClerksInternetMessage: "",
					ClerksInternetState: "None",

					AccountStatementMessage: "",
					AccountStatementState: "None",
					UICorrespondenceValidator: true

				},
				AccountingDataTab: {
					AccountingDataTabVisible: this.getView().getModel("HeaderModelSet").getData().CompnyCodeKey.toString().trim() !== "" ? true : false
				},
				PaymentTerms: {
					explanation: "",
					preferred_pt: "",
					terms_of_payment: oData.TermsOfPayment ? oData.TermsOfPayment.toString().trim() : "",
					PaymentTermMessage: "",
					CreditMemoPayTermMessage: "",
					BeChangesPayTermMessage: "",

					terms_of_paymentMessage: "",
					terms_of_paymentState: "None"
				}
			};
			var oAccModel = new sap.ui.model.json.JSONModel(accData);
			this.getView().setModel(oAccModel, "AccountingDataModelSet");

		},

		//Accounting Data with Company Code Logic 
		onAccountingData: function(oEvent, clearPrivData, system) {
			var that = this;
			var companyCode = oEvent;
			var oModelClass = this.getView().getModel("AccountingDataModelSet").getData();
			if (companyCode !== "" && clearPrivData) {
				oModelClass.AccountManagement.ReconAccount = "";
				oModelClass.AccountManagement.HeadOffice = "";
				oModelClass.AccountManagement.SortKey = "";
				oModelClass.AccountManagement.PrevAcctNo = "";
				oModelClass.AccountManagement.BuyingGroup = "";
				oModelClass.PaymentData.TermsofPayment = "";
				oModelClass.PaymentData.PaymentMethods = "";
				oModelClass.PaymentData.Creditmemopaytterm = "";
				oModelClass.PaymentData.Bechangespaytterm = "";
				oModelClass.PaymentData.ToleranceGroup = "";
				oModelClass.PaymentData.HouseBank = "";
				oModelClass.PaymentData.SelectionRule = "";
				oModelClass.PaymentData.PaymentHistoryRecord = false;

				oModelClass.Correspondence.DunnProcedure = "";
				oModelClass.Correspondence.LastDunned = null;
				oModelClass.Correspondence.DunningClerk = "";
				oModelClass.Correspondence.DunningBlock = "";
				oModelClass.Correspondence.DunningLevel = "";
				oModelClass.Correspondence.DunningArea = "";
				oModelClass.Correspondence.ClerkAbbrev = "";
				oModelClass.Correspondence.AcctAtCust = "";
				oModelClass.Correspondence.CustomerUser = "";
				oModelClass.Correspondence.ClerksInternet = "";
				oModelClass.Correspondence.AccountStatement = "";
				this.getView().getModel("AccountingDataModelSet").refresh();

			}
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			//var system = this.getView().getModel("HeaderModelSet").getData().System;
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/ACCOUNTING_DATA_FETCH/ZSD_MDM_Account_DATA_API_SRV/Input_HelpSet?filter=Company_Code eq '" + companyCode +
				"'&expand=NavPaymentTerm,NavAccount_Statement,NavBE_CHANGES_PAYMENT,NavClerkAbbrev,NavCredit_Memo,NavDunn_Procedure,NavDunningArea,NavDunningClerk,NavHouse_Bank,NavReconAccount,NavSelection_Rule,NavSort_Key,NavTolerance_Group,NavDunningBlock&System_Name=" +
				system
			);

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						//	var dataResultArr = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
							//	dataResultArr = [];
						} else {
							var objList = JSON.parse(oData.results[0].Response).d.results[0];

							//for AccountStatement

							var NavAccountStatement = [];

							var oResult1 = objList.NavAccount_Statement.results;

							if (oResult1.length === undefined) {
								oResult1 = Array(oResult1);
							}
							NavAccountStatement = oResult1;

							var oNSModel = new sap.ui.model.json.JSONModel({
								"results": NavAccountStatement
							});
							oNSModel.setSizeLimit(NavAccountStatement.length);
							that.getView().setModel(oNSModel, "NavAccountStatementSet");

							// for B/E changes payment term
							var NavBE_CHANGES_PAYMENT = [];

							var oResult2 = objList.NavBE_CHANGES_PAYMENT.results;
							if (oResult2.length === undefined) {
								oResult2 = Array(oResult2);
							}
							NavBE_CHANGES_PAYMENT = oResult2;

							var oBEModel = new sap.ui.model.json.JSONModel({
								"results": NavBE_CHANGES_PAYMENT
							});
							oBEModel.setSizeLimit(NavBE_CHANGES_PAYMENT.length);
							that.getView().setModel(oBEModel, "NavBECHANGESPAYMENTSet");

							// for NavClerkAbbrev 		

							var NavClerkAbbrev = [];

							var oResult3 = objList.NavClerkAbbrev.results;
							if (oResult3.length === undefined) {
								oResult3 = Array(oResult3);
							}
							NavClerkAbbrev = oResult3;

							var oCAModel = new sap.ui.model.json.JSONModel({
								"results": NavClerkAbbrev
							});
							oCAModel.setSizeLimit(NavClerkAbbrev.length);
							that.getView().setModel(oCAModel, "NavClerkAbbrevSet");

							//for NavCredit_Memo

							var NavCreditMemo = [];

							var oResult4 = objList.NavCredit_Memo.results;
							if (oResult4.length === undefined) {
								oResult4 = Array(oResult4);
							}
							NavCreditMemo = oResult4;

							var oNCAModel = new sap.ui.model.json.JSONModel({
								"results": NavCreditMemo
							});
							oNCAModel.setSizeLimit(NavCreditMemo.length);
							that.getView().setModel(oNCAModel, "NavCreditMemoSet");

							// for NavDunn_Procedure

							var NavDunnProcedure = [];

							var oResult5 = objList.NavDunn_Procedure.results;
							if (oResult5.length === undefined) {
								oResult5 = Array(oResult5);
							}
							NavDunnProcedure = oResult5;

							var oNDPModel = new sap.ui.model.json.JSONModel({
								"results": NavDunnProcedure
							});
							oNDPModel.setSizeLimit(NavDunnProcedure.length);
							that.getView().setModel(oNDPModel, "NavDunnProcedureSet");

							// for NavDunningArea

							var NavDunningArea = [];

							var oResult6 = objList.NavDunningArea.results;
							if (oResult6.length === undefined) {
								oResult6 = Array(oResult6);
							}
							NavDunningArea = oResult6;

							var oNDAModel = new sap.ui.model.json.JSONModel({
								"results": NavDunningArea
							});
							oNDAModel.setSizeLimit(NavDunningArea.length);
							that.getView().setModel(oNDAModel, "NavDunningAreaSet");

							// for NavDunningBlock

							var NavDunningBlock = [];

							var oResult7 = objList.NavDunningBlock.results;
							if (oResult7.length === undefined) {
								oResult7 = Array(oResult7);
							}
							NavDunningBlock = oResult7;

							var oNDBModel = new sap.ui.model.json.JSONModel({
								"results": NavDunningBlock
							});
							oNDBModel.setSizeLimit(NavDunningBlock.length);
							that.getView().setModel(oNDBModel, "NavDunningBlockSet");

							// for NavDunningClerk

							var NavDunningClerk = [];

							var oResult8 = objList.NavDunningClerk.results;
							if (oResult8.length === undefined) {
								oResult8 = Array(oResult8);
							}
							NavDunningClerk = oResult8;

							var oNDCModel = new sap.ui.model.json.JSONModel({
								"results": NavDunningClerk
							});
							oNDCModel.setSizeLimit(NavDunningClerk.length);
							that.getView().setModel(oNDCModel, "NavDunningClerkSet");

							//for NavHouse_Bank

							var NavHouseBank = [];

							var oResult9 = objList.NavHouse_Bank.results;
							if (oResult9.length === undefined) {
								oResult9 = Array(oResult9);
							}
							NavHouseBank = oResult9;

							var oNHBModel = new sap.ui.model.json.JSONModel({
								"results": NavHouseBank
							});
							oNHBModel.setSizeLimit(NavDunningClerk.length);
							that.getView().setModel(oNHBModel, "NavHouseBankSet");

							//for NavPaymentTerm

							/*	var NavPaymentTerm = [];

								var oResult10 = objList.NavPaymentTerm.results;
								if (oResult10.length === undefined) {
									oResult10 = Array(oResult10);
								}
								NavPaymentTerm = oResult10;
								var oNPTModel = new sap.ui.model.json.JSONModel({
									"results": NavPaymentTerm
								});
								oNPTModel.setSizeLimit(NavPaymentTerm.length);
								that.getView().setModel(oNPTModel, "NavPaymentTermSet");*/

							//for NavReconAccount	
							var NavReconAccount = [];
							var oResult12 = objList.NavReconAccount.results;

							if (oResult12.length === undefined) {

								oResult12 = Array(oResult12);

							}
							NavReconAccount = oResult12;
							var oNRAModel = new sap.ui.model.json.JSONModel({
								"results": NavReconAccount
							});
							oNRAModel.setSizeLimit(NavReconAccount.length);
							that.getView().setModel(oNRAModel, "NavReconAccountSet");
							// for 	NavSelection_Rule
							var NavSelectionRule = [];
							var oResult13 = objList.NavSelection_Rule.results;

							if (oResult13.length === undefined) {
								oResult13 = Array(oResult13);
							}
							NavSelectionRule = oResult13;
							var oNSRModel = new sap.ui.model.json.JSONModel({
								"results": NavSelectionRule
							});
							oNSRModel.setSizeLimit(NavSelectionRule.length);
							that.getView().setModel(oNSRModel, "NavSelectionRuleSet");

							//for NavSort_Key
							var NavSortKey = [];
							var oResult14 = objList.NavSort_Key.results;
							if (oResult14.length === undefined) {
								oResult14 = Array(oResult14);
							}
							NavSortKey = oResult14;
							var oNSKModel = new sap.ui.model.json.JSONModel({
								"results": NavSortKey
							});
							oNSKModel.setSizeLimit(NavSortKey.length);
							that.getView().setModel(oNSKModel, "NavSortKeySet");

							//for NavTolerance_Group
							var NavToleranceGroup = [];
							var oResult15 = objList.NavTolerance_Group.results;
							if (oResult15.length === undefined) {
								oResult15 = Array(oResult15);
							}
							NavToleranceGroup = oResult15;
							var oNTGModel = new sap.ui.model.json.JSONModel({
								"results": NavToleranceGroup
							});
							oNTGModel.setSizeLimit(NavToleranceGroup.length);
							that.getView().setModel(oNTGModel, "NavToleranceGroupSet");
							//Resubmit & Review scenario
							that.bindAccountingTabDataModel();
						}

					},

					error: function(oError) {
						oBusyDialog.close();
					}

				});

		},

		//Accounting Data Tab WithOut CompanyCode

		onAccountingDataWithOutCompanyCode: function() {
			var oModelClass = this.getView().getModel("AccountingDataModelSet").getData();
			oModelClass.AccountManagement.ReconAccount = "";
			oModelClass.AccountManagement.HeadOffice = "";
			oModelClass.AccountManagement.SortKey = "";
			oModelClass.AccountManagement.PrevAcctNo = "";
			oModelClass.AccountManagement.BuyingGroup = "";
			oModelClass.PaymentData.TermsofPayment = "";
			oModelClass.PaymentData.Creditmemopaytterm = "";
			oModelClass.PaymentData.Bechangespaytterm = "";
			oModelClass.PaymentData.ToleranceGroup = "";
			oModelClass.PaymentData.PaymentMethods = "";
			oModelClass.PaymentData.HouseBank = "";
			oModelClass.PaymentData.SelectionRule = "";
			oModelClass.PaymentData.PaymentHistoryRecord = false;

			oModelClass.Correspondence.DunnProcedure = "";
			oModelClass.Correspondence.LastDunned = null;
			oModelClass.Correspondence.DunningClerk = "";
			oModelClass.Correspondence.DunningBlock = "";
			oModelClass.Correspondence.DunningLevel = "";
			oModelClass.Correspondence.DunningArea = "";
			oModelClass.Correspondence.ClerkAbbrev = "";
			oModelClass.Correspondence.AcctAtCust = "";
			oModelClass.Correspondence.CustomerUser = "";
			oModelClass.Correspondence.ClerksInternet = "";
			oModelClass.Correspondence.AccountStatement = "";

			/*	var oCCList1 = this.getView().getModel("NavAccountStatementSet").getData().results;
				oCCList1.splice(0);
				var oCCList2 = this.getView().getModel("NavBECHANGESPAYMENTSet").getData().results;
				oCCList2.splice(0);
				var oCCList3 = this.getView().getModel("NavClerkAbbrevSet").getData().results;
				oCCList3.splice(0);
				var oCCList4 = this.getView().getModel("NavCreditMemoSet").getData().results;
				oCCList4.splice(0);
				var oCCList5 = this.getView().getModel("NavDunnProcedureSet").getData().results;
				oCCList5.splice(0);
				var oCCList6 = this.getView().getModel("NavDunningAreaSet").getData().results;
				oCCList6.splice(0);
				var oCCList7 = this.getView().getModel("NavDunningBlockSet").getData().results;
				oCCList7.splice(0);
				var oCCList8 = this.getView().getModel("NavDunningClerkSet").getData().results;
				oCCList8.splice(0);
				var oCCList9 = this.getView().getModel("NavHouseBankSet").getData().results;
				oCCList9.splice(0);
					// var oCCList10 = this.getView().getModel("NavPaymentTermSet").getData().results;
					// oCCList10.splice(0);

				var oCCList12 = this.getView().getModel("NavReconAccountSet").getData().results;
				oCCList12.splice(0);
				var oCCList13 = this.getView().getModel("NavSelectionRuleSet").getData().results;
				oCCList13.splice(0);
				var oCCList14 = this.getView().getModel("NavSortKeySet").getData().results;
				oCCList14.splice(0);
				var oCCList15 = this.getView().getModel("NavToleranceGroupSet").getData().results;
				oCCList15.splice(0);
				this.getView().getModel("AccountingDataModelSet").refresh();
				this.getView().getModel("NavAccountStatementSet").refresh();
				this.getView().getModel("NavBECHANGESPAYMENTSet").refresh();
				this.getView().getModel("NavClerkAbbrevSet").refresh();
				this.getView().getModel("NavCreditMemoSet").refresh();
				this.getView().getModel("NavDunnProcedureSet").refresh();
				this.getView().getModel("NavDunningAreaSet").refresh();
				this.getView().getModel("NavDunningBlockSet").refresh();
				this.getView().getModel("NavDunningClerkSet").refresh();
				this.getView().getModel("NavHouseBankSet").refresh();
				//this.getView().getModel("NavPaymentTermSet").refresh();
				this.getView().getModel("NavReconAccountSet").refresh();
				this.getView().getModel("NavSelectionRuleSet").refresh();
				this.getView().getModel("NavSortKeySet").refresh();
				this.getView().getModel("NavToleranceGroupSet").refresh();*/
			if (this.getView().getModel("NavAccountStatementSet") !== undefined) {
				var oCCList1 = this.getView().getModel("NavAccountStatementSet").getData().results;
				oCCList1.splice(0);
			}
			if (this.getView().getModel("NavBECHANGESPAYMENTSet") !== undefined) {
				var oCCList2 = this.getView().getModel("NavBECHANGESPAYMENTSet").getData().results;
				oCCList2.splice(0);
			}
			if (this.getView().getModel("NavClerkAbbrevSet") !== undefined) {
				var oCCList3 = this.getView().getModel("NavClerkAbbrevSet").getData().results;
				oCCList3.splice(0);
			}
			if (this.getView().getModel("NavCreditMemoSet") !== undefined) {
				var oCCList4 = this.getView().getModel("NavCreditMemoSet").getData().results;
				oCCList4.splice(0);
			}
			if (this.getView().getModel("NavDunnProcedureSet") !== undefined) {
				var oCCList5 = this.getView().getModel("NavDunnProcedureSet").getData().results;
				oCCList5.splice(0);
			}
			if (this.getView().getModel("NavDunningAreaSet") !== undefined) {
				var oCCList6 = this.getView().getModel("NavDunningAreaSet").getData().results;
				oCCList6.splice(0);
			}
			if (this.getView().getModel("NavDunningBlockSet") !== undefined) {
				var oCCList7 = this.getView().getModel("NavDunningBlockSet").getData().results;
				oCCList7.splice(0);
			}
			if (this.getView().getModel("NavDunningClerkSet") !== undefined) {
				var oCCList8 = this.getView().getModel("NavDunningClerkSet").getData().results;
				oCCList8.splice(0);
			}
			if (this.getView().getModel("NavHouseBankSet") !== undefined) {
				var oCCList9 = this.getView().getModel("NavHouseBankSet").getData().results;
				oCCList9.splice(0);
			}
			if (this.getView().getModel("NavPaymentMethodSet") !== undefined) {
				var oCCList10 = this.getView().getModel("NavPaymentMethodSet").getData().results;
				oCCList10.splice(0);
			}
			if (this.getView().getModel("NavReconAccountSet") !== undefined) {
				var oCCList12 = this.getView().getModel("NavReconAccountSet").getData().results;
				oCCList12.splice(0);
			}
			if (this.getView().getModel("NavSelectionRuleSet") !== undefined) {
				var oCCList13 = this.getView().getModel("NavSelectionRuleSet").getData().results;
				oCCList13.splice(0);
			}
			if (this.getView().getModel("NavSortKeySet") !== undefined) {
				var oCCList14 = this.getView().getModel("NavSortKeySet").getData().results;
				oCCList14.splice(0);
			}
			if (this.getView().getModel("NavToleranceGroupSet") !== undefined) {
				var oCCList15 = this.getView().getModel("NavToleranceGroupSet").getData().results;
				oCCList15.splice(0);
			}

			this.getView().getModel("AccountingDataModelSet").refresh();
			if (this.getView().getModel("NavAccountStatementSet") !== undefined) {
				this.getView().getModel("NavAccountStatementSet").refresh();
			}
			if (this.getView().getModel("NavBECHANGESPAYMENTSet") !== undefined) {
				this.getView().getModel("NavBECHANGESPAYMENTSet").refresh();
			}
			if (this.getView().getModel("NavClerkAbbrevSet") !== undefined) {
				this.getView().getModel("NavClerkAbbrevSet").refresh();
			}
			if (this.getView().getModel("NavCreditMemoSet") !== undefined) {
				this.getView().getModel("NavCreditMemoSet").refresh();
			}

			if (this.getView().getModel("NavDunnProcedureSet") !== undefined) {
				this.getView().getModel("NavDunnProcedureSet").refresh();
			}

			if (this.getView().getModel("NavDunningAreaSet") !== undefined) {
				this.getView().getModel("NavDunningAreaSet").refresh();
			}

			if (this.getView().getModel("NavDunningBlockSet") !== undefined) {
				this.getView().getModel("NavDunningBlockSet").refresh();
			}

			if (this.getView().getModel("NavDunningClerkSet") !== undefined) {
				this.getView().getModel("NavDunningClerkSet").refresh();
			}

			if (this.getView().getModel("NavHouseBankSet") !== undefined) {
				this.getView().getModel("NavHouseBankSet").refresh();
			}

			if (this.getView().getModel("NavPaymentMethodSet") !== undefined) {
				this.getView().getModel("NavPaymentMethodSet").refresh();
			}
			if (this.getView().getModel("NavReconAccountSet") !== undefined) {
				this.getView().getModel("NavReconAccountSet").refresh();
			}

			if (this.getView().getModel("NavSelectionRuleSet") !== undefined) {
				this.getView().getModel("NavSelectionRuleSet").refresh();
			}

			if (this.getView().getModel("NavSortKeySet") !== undefined) {
				this.getView().getModel("NavSortKeySet").refresh();
			}

			if (this.getView().getModel("NavToleranceGroupSet") !== undefined) {
				this.getView().getModel("NavToleranceGroupSet").refresh();
			}
			return;
		},

		onSelectDivision: function(oEvent) {
			this.onPressValidationExtension(oEvent);
			//	this.SalesDataTabVisibleModel();
			oEvent.getSource().setValueState("None");
			//toast message
			this.showMessageBasedOnHeaderSelection();
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			} else {
				this.createSalesDataTab();
				this.readSalesData();
			}
		},

		liveChangeSystem: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var modelHdr = this.getView().getModel("HeaderModelSet").getData();
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				if (modelHdr.CompnyCodeKey !== "") {
					var oODataJSONModelSalesAre = new sap.ui.model.json.JSONModel({
						"results": []
					});
					this.getView().setModel(oODataJSONModelSalesAre, "SalesAreaComboSet");

					var oODataJSONModel1 = new sap.ui.model.json.JSONModel({
						"results": []
					});
					this.getView().setModel(oODataJSONModel1, "DivisionComboSet");

					var oODataJSONModel11 = new sap.ui.model.json.JSONModel({
						"results": []
					});
					this.getView().setModel(oODataJSONModel11, "DistbChanlComboSet");

					modelHdr.SalesOrgKey = "";
					modelHdr.DistribChnnlKey = "";
					modelHdr.DivisionKey = "";
				}
				//clear Account group
				var oODataJSONModel = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModel, "AccountGroupComboSet");

				modelHdr.AccountGrpKey = "";
				this.getView().getModel("HeaderModelSet").refresh();

				this.readStatusData("");
				this.readContactPersonData("");
				this.onAccountingDataPaymentTerms("");
			} else {
				this.autoPopulateSystem();
			}

			this.showMessageBasedOnHeaderSelection();
		},

		autoPopulateSystem: function() {
			//Resubmit & Review scenario
			if (this.resubmitScenario === false && this.reviewScenario === false) {
				var modelHdr = this.getView().getModel("HeaderModelSet").getData();
				this.getView().getModel("HeaderModelSet").refresh();
				if (modelHdr.CompnyCodeKey !== "") {
					this.readSalesArea();
					modelHdr.SalesOrgKey = "";
					modelHdr.DistribChnnlKey = "";
					modelHdr.DivisionKey = "";
				}
				modelHdr.AccountGrpKey = "";
				this.getView().getModel("HeaderModelSet").refresh();
				this.readAccountGroup(modelHdr.System);
				this.readStatusData(modelHdr.System);
				this.readContactPersonData(modelHdr.System);
				this.onAccountingDataPaymentTerms(modelHdr.System);
				this.showMessageBasedOnHeaderSelection();
				/*	if (modelHdr.CompnyCodeKey !== "") {
						this.onAccountingData(modelHdr.CompnyCodeKey,true,modelHdr.System);
						this.onAccountingDataPaymentMethod(modelHdr.CompnyCodeKey,modelHdr.System);
					} else {
						this.onAccountingDataWithOutCompanyCode("");
					}*/
			}
		},

		liveChangeAppId: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onSelectDistributionChannel: function(oEvent) {
			this.onPressValidationExtension(oEvent);
			//	this.SalesDataTabVisibleModel();
			oEvent.getSource().setValueState("None");
			var that = this;

			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				var oODataJSONModel11 = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModel11, "DivisionComboSet");
			} else {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("DistbChanlComboSet").getObject();
				var data1 = selObj.DIVISION.item;
				if (data1.length === undefined) {
					var data123 = [];
					data123.push(data1);
					data1 = data123;
				}
				var oODataJSONModel1 = new sap.ui.model.json.JSONModel({
					"results": data1
				});
				oODataJSONModel1.setSizeLimit(data1.length);
				that.getView().setModel(oODataJSONModel1, "DivisionComboSet");

				this.createSalesDataTab();
				this.readSalesData();
			}

			this.readTaxClassification();
			var modelHdr = this.getView().getModel("HeaderModelSet").getData();
			modelHdr.DivisionKey = "";
			this.getView().getModel("HeaderModelSet").refresh();

			//toast message
			this.showMessageBasedOnHeaderSelection();
		},

		readSalesData: function() {
			var that = this;
			var hdrData = this.getView().getModel("HeaderModelSet").getData();
			if ((hdrData.SalesOrgKey !== undefined) && (hdrData.SalesOrgKey !== "") && (hdrData.DistribChnnlKey !== undefined) && (hdrData.DistribChnnlKey !==
					"") && (hdrData.DivisionKey !== undefined) && (hdrData.DivisionKey !== "")) {
				var salesOrg = hdrData.SalesOrgKey;
				var DistriChannel = hdrData.DistribChnnlKey;
				var Division = hdrData.DivisionKey;
			} else {
				/*	var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": ""
						});
						that.getView().setModel(oODataJSONModel, "SalesDataComboSet");*/
				var oSDModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oSDModel, "SalesDistrictSet");
				var oSOModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oSOModel, "SalesOfficeSet");
				/*	var oSGModel = new sap.ui.model.json.JSONModel({
						"results": []
					});

					that.getView().setModel(oSGModel, "SalesGroupSet");*/
				var oCGModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCGModel, "CustomerGroupSet");
				var oCModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCModel, "CurrencySet");
				var oERModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oERModel, "ExchangeRateTypeSet");
				var oPGModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oPGModel, "PriceGroupSet");
				var oCPModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCPModel, "CustPricProcSet");
				var oPLModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oPLModel, "PriceListSet");
				var oCSModel = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCSModel, "CustStatGrpSet");

				//SHIPPING
				//DeliveryPriority
				var oDPModel119 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oDPModel119, "DeliveryPrioritySDShippingSet");
				//ShippingConditions
				var oSCModel129 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oSCModel129, "ShippingConditionsSDShippingSet");
				//DeliveryPlant
				var oDPlantModel139 = new sap.ui.model.json.JSONModel({
					"results": []
				});
				that.getView().setModel(oDPlantModel139, "DeliveryPlantSDShippingSet");
				//PartialDeliveryPerItem
				var oPartialDelModel149 = new sap.ui.model.json.JSONModel({
					"results": []
				});
				that.getView().setModel(oPartialDelModel149, "PartialDeliveryPerItemSDShippingSet");
				//BILLING DOCUMENT
				//InvoiceDates
				var oIVDModel159 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oIVDModel159, "InvoiceDatesSDBillDocSet");
				//InvoiceListDates
				var oIVLModel169 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oIVLModel169, "InvoiceListDatesSDBillDocSet");
				//Incoterms1
				var oIncoterModel179 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oIncoterModel179, "IncotermsSDBillDocSet");
				//TermsofPayment
				var oTermsPayModel189 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oTermsPayModel189, "TermsofPaymentSDBillDocSet");
				//AccountAssignmentGroup
				var oAccAssGrpModel19 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oAccAssGrpModel19, "AccountAssignmentGroupSDBillDocSet");
				//ADDITIONALDATA
				//CustomerGroup1
				var oCG1Model209 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCG1Model209, "CustGrp1SDAdditionalDataSet");
				//CustomerGroup2
				var oCG2Model219 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCG2Model219, "CustGrp2SDAdditionalDataSet");
				//CustomerGroup3
				var oCG3Model229 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCG3Model229, "CustGrp3SDAdditionalDataSet");
				//CustomerGroup4
				var oCG4Model239 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCG4Model239, "CustGrp4SDAdditionalDataSet");
				//CustomerGroup5
				var oCG5Model249 = new sap.ui.model.json.JSONModel({
					"results": []
				});

				that.getView().setModel(oCG5Model249, "CustGrp5SDAdditionalDataSet");
				return;
			}
			var URL =
				"/RESTAdapter/ACCOUNTING_DATA_FETCH/ZSD_MDM_SALES_DATA_API_SRV/Input_HelpSet?System_Name=" + hdrData.System +
				"&filter=SalesOrg eq'" +
				salesOrg + "' and DistriChannel eq '" + DistriChannel + "' and Division eq '" + Division +
				"'&expand=NavSales_District,NavSales_Office,NavCustomer_Group,NavCurrency,NavCust_Price_Proc,NavCust_Stats_Grp,NavDelivery_Priority,NavShip_Condition,NavPartial_Delivery,NavInvoiceDates,NavInvoice_List_Dates,NavIncoterms,NavAcct_Assgmt_Group,NavCustomer_Group1,NavCustomer_Group2,NavCustomer_Group3,NavCustomer_Group4,NavCustomer_Group5,NavDelivering_Plant,NavPaymentTerm,NavEXCHANGERATE,NavPricelist,NavPriceGroup";
			var Filter = new sap.ui.model.Filter('URL', 'EQ', URL);
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var SalesDistrictArray = [];
						var SalesOfficeArray = [];
						// var SalesGroupArray = [];
						var CustomerGroupArray = [];
						var CurrencyArray = [];
						var ExchangeRateTypeArray = [];
						var PriceGroupArray = [];
						var CustPricProcArray = [];
						var PriceListArray = [];
						var CustStatGrpArray = [];

						//shipping
						var DeliveryPriorityArray = [];
						var ShippingConditionsArray = [];
						var DeliveryPlantArray = [];
						var PartialDeliveryPerItemArray = [];
						//BillingDocument
						var InvoiceDatesArray = [];
						var InvoiceListDatesArray = [];
						var Incoterms1Array = [];
						var TermsofPaymentArray = [];
						var AccountAssignmentGroupArray = [];
						//Additional Fields
						var CustomerGroup1Array = [];
						var CustomerGroup2Array = [];
						var CustomerGroup3Array = [];
						var CustomerGroup4Array = [];
						var CustomerGroup5Array = [];

						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							/*	oODataJSONModel = new sap.ui.model.json.JSONModel({
									"results": JSON.parse(oData.results[0].Response)
								});
								// oODataJSONModel.setSizeLimit(oODataJSONModel.getData().results.d.results[0].NavSales_Group.results.length);
								oODataJSONModel.setSizeLimit(1200);
								that.getView().setModel(oODataJSONModel, "SalesDataComboSet");*/
							var oResults = JSON.parse(oData.results[0].Response).d.results;
							//Sales District
							SalesDistrictArray = oResults[0].NavSales_District.results;
							//Sales Office	
							SalesOfficeArray = oResults[0].NavSales_Office.results;
							//SalesGroup
							// SalesGroupArray = oResults[0].NavSales_Group.results;
							//CustomerGroup	
							CustomerGroupArray = oResults[0].NavCustomer_Group.results;
							//Currency	
							CurrencyArray = oResults[0].NavCurrency.results;
							//ExchangeRateType	
							ExchangeRateTypeArray = oResults[0].NavEXCHANGERATE.results;
							//PriceGroup
							PriceGroupArray = oResults[0].NavPriceGroup.results;
							//CustPricProc
							CustPricProcArray = oResults[0].NavCust_Price_Proc.results;
							//PriceList
							PriceListArray = oResults[0].NavPricelist.results;
							//CustStatGrp		
							CustStatGrpArray = oResults[0].NavCust_Stats_Grp.results;

							//DeliveryPriority
							DeliveryPriorityArray = oResults[0].NavDelivery_Priority.results;
							//ShippingConditions
							ShippingConditionsArray = oResults[0].NavShip_Condition.results;
							//DeliveryPlant
							DeliveryPlantArray = oResults[0].NavDelivering_Plant.results;
							//PartialDeliveryPerItem
							PartialDeliveryPerItemArray = oResults[0].NavPartial_Delivery.results;
							//BILLING DOCUMENT
							//InvoiceDates
							InvoiceDatesArray = oResults[0].NavInvoiceDates.results;
							//InvoiceListDates
							InvoiceListDatesArray = oResults[0].NavInvoice_List_Dates.results;
							//Incoterms1
							Incoterms1Array = oResults[0].NavIncoterms.results;
							//TermsofPayment
							TermsofPaymentArray = oResults[0].NavPaymentTerm.results;
							//AccountAssignmentGroup
							AccountAssignmentGroupArray = oResults[0].NavAcct_Assgmt_Group.results;
							//ADDITIONALFIELDS
							//CustomerGroup1
							CustomerGroup1Array = oResults[0].NavCustomer_Group1.results;
							//CustomerGroup2
							CustomerGroup2Array = oResults[0].NavCustomer_Group2.results;
							//CustomerGroup3
							CustomerGroup3Array = oResults[0].NavCustomer_Group3.results;
							//CustomerGroup4
							CustomerGroup4Array = oResults[0].NavCustomer_Group4.results;
							//CustomerGroup5
							CustomerGroup5Array = oResults[0].NavCustomer_Group5.results;

							//Resubmit & Review scenario
							that.bindSalesData();
						}

						var oSDModel1 = new sap.ui.model.json.JSONModel({
							"results": SalesDistrictArray
						});
						oSDModel1.setSizeLimit(SalesDistrictArray.length);
						that.getView().setModel(oSDModel1, "SalesDistrictSet");

						var oSOModel2 = new sap.ui.model.json.JSONModel({
							"results": SalesOfficeArray
						});
						oSOModel2.setSizeLimit(SalesOfficeArray.length);
						that.getView().setModel(oSOModel2, "SalesOfficeSet");

						/*	var oSGModel3 = new sap.ui.model.json.JSONModel({
								"results": SalesGroupArray
							});
							oSGModel3.setSizeLimit(SalesGroupArray.length);
							that.getView().setModel(oSGModel3, "SalesGroupSet");*/
						var oCGModel4 = new sap.ui.model.json.JSONModel({
							"results": CustomerGroupArray
						});
						oCGModel4.setSizeLimit(CustomerGroupArray.length);
						that.getView().setModel(oCGModel4, "CustomerGroupSet");

						var oCModel5 = new sap.ui.model.json.JSONModel({
							"results": CurrencyArray
						});
						oCModel5.setSizeLimit(CurrencyArray.length);
						that.getView().setModel(oCModel5, "CurrencySet");
						var oERModel6 = new sap.ui.model.json.JSONModel({
							"results": ExchangeRateTypeArray
						});
						oERModel6.setSizeLimit(ExchangeRateTypeArray.length);
						that.getView().setModel(oERModel6, "ExchangeRateTypeSet");

						var oPGModel7 = new sap.ui.model.json.JSONModel({
							"results": PriceGroupArray
						});
						oPGModel7.setSizeLimit(PriceGroupArray.length);
						that.getView().setModel(oPGModel7, "PriceGroupSet");

						var oCPModel8 = new sap.ui.model.json.JSONModel({
							"results": CustPricProcArray
						});
						oCPModel8.setSizeLimit(CustPricProcArray.length);
						that.getView().setModel(oCPModel8, "CustPricProcSet");

						var oPLModel9 = new sap.ui.model.json.JSONModel({
							"results": PriceListArray
						});
						oPLModel9.setSizeLimit(PriceListArray.length);
						that.getView().setModel(oPLModel9, "PriceListSet");

						var oCSModel10 = new sap.ui.model.json.JSONModel({
							"results": CustStatGrpArray
						});
						oCSModel10.setSizeLimit(CustStatGrpArray.length);
						that.getView().setModel(oCSModel10, "CustStatGrpSet");

						//SHIPPING
						//DeliveryPriority
						var oDPModel11 = new sap.ui.model.json.JSONModel({
							"results": DeliveryPriorityArray
						});
						oDPModel11.setSizeLimit(DeliveryPriorityArray.length);
						that.getView().setModel(oDPModel11, "DeliveryPrioritySDShippingSet");
						//ShippingConditions
						var oSCModel12 = new sap.ui.model.json.JSONModel({
							"results": ShippingConditionsArray
						});
						oSCModel12.setSizeLimit(ShippingConditionsArray.length);
						that.getView().setModel(oSCModel12, "ShippingConditionsSDShippingSet");
						//DeliveryPlant
						var oDPlantModel13 = new sap.ui.model.json.JSONModel({
							"results": DeliveryPlantArray
						});
						oDPlantModel13.setSizeLimit(DeliveryPlantArray.length);
						that.getView().setModel(oDPlantModel13, "DeliveryPlantSDShippingSet");
						//PartialDeliveryPerItem
						var oPartialDelModel14 = new sap.ui.model.json.JSONModel({
							"results": PartialDeliveryPerItemArray
						});
						if (oPartialDelModel14.getData().results[0].DomvalueL === "") {
							oPartialDelModel14.getData().results[0].DomvalueL = " ";
						}
						oPartialDelModel14.setSizeLimit(PartialDeliveryPerItemArray.length);
						that.getView().setModel(oPartialDelModel14, "PartialDeliveryPerItemSDShippingSet");
						//BILLING DOCUMENT
						//InvoiceDates
						var oIVDModel15 = new sap.ui.model.json.JSONModel({
							"results": InvoiceDatesArray
						});
						oIVDModel15.setSizeLimit(InvoiceDatesArray.length);
						that.getView().setModel(oIVDModel15, "InvoiceDatesSDBillDocSet");
						//InvoiceListDates
						var oIVLModel16 = new sap.ui.model.json.JSONModel({
							"results": InvoiceListDatesArray
						});
						oIVLModel16.setSizeLimit(InvoiceListDatesArray.length);
						that.getView().setModel(oIVLModel16, "InvoiceListDatesSDBillDocSet");
						//Incoterms1
						var oIncoterModel17 = new sap.ui.model.json.JSONModel({
							"results": Incoterms1Array
						});
						oIncoterModel17.setSizeLimit(Incoterms1Array.length);
						that.getView().setModel(oIncoterModel17, "IncotermsSDBillDocSet");
						//TermsofPayment
						var oTermsPayModel18 = new sap.ui.model.json.JSONModel({
							"results": TermsofPaymentArray
						});
						oTermsPayModel18.setSizeLimit(TermsofPaymentArray.length);
						that.getView().setModel(oTermsPayModel18, "TermsofPaymentSDBillDocSet");
						//AccountAssignmentGroup
						var oAccAssGrpModel191 = new sap.ui.model.json.JSONModel({
							"results": AccountAssignmentGroupArray
						});
						oAccAssGrpModel191.setSizeLimit(AccountAssignmentGroupArray.length);
						that.getView().setModel(oAccAssGrpModel191, "AccountAssignmentGroupSDBillDocSet");
						//ADDITIONALDATA
						//CustomerGroup1
						var oCG1Model20 = new sap.ui.model.json.JSONModel({
							"results": CustomerGroup1Array
						});
						oCG1Model20.setSizeLimit(AccountAssignmentGroupArray.length);
						that.getView().setModel(oCG1Model20, "CustGrp1SDAdditionalDataSet");
						//CustomerGroup2
						var oCG2Model21 = new sap.ui.model.json.JSONModel({
							"results": CustomerGroup2Array
						});
						oCG2Model21.setSizeLimit(AccountAssignmentGroupArray.length);
						that.getView().setModel(oCG2Model21, "CustGrp2SDAdditionalDataSet");
						//CustomerGroup3
						var oCG3Model22 = new sap.ui.model.json.JSONModel({
							"results": CustomerGroup3Array
						});
						oCG3Model22.setSizeLimit(AccountAssignmentGroupArray.length);
						that.getView().setModel(oCG3Model22, "CustGrp3SDAdditionalDataSet");
						//CustomerGroup4
						var oCG4Model23 = new sap.ui.model.json.JSONModel({
							"results": CustomerGroup4Array
						});
						oCG4Model23.setSizeLimit(AccountAssignmentGroupArray.length);
						that.getView().setModel(oCG4Model23, "CustGrp4SDAdditionalDataSet");
						//CustomerGroup5
						var oCG5Model24 = new sap.ui.model.json.JSONModel({
							"results": CustomerGroup5Array
						});
						oCG5Model24.setSizeLimit(AccountAssignmentGroupArray.length);
						that.getView().setModel(oCG5Model24, "CustGrp5SDAdditionalDataSet");

					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);
		},

		readTaxClassification: function() {
			var that = this;
			var hdrData = this.getView().getModel("HeaderModelSet").getData();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			if ((hdrData.DistribChnnlKey !== undefined) && (hdrData.DistribChnnlKey !== "") && (hdrData.SalesOrgKey !== undefined) && (hdrData.SalesOrgKey !==
					"") && hdrData.AccountGrpKey !== undefined && hdrData.AccountGrpKey !== "") {
				var salesOrg = hdrData.SalesOrgKey;
				var DistriChannel = hdrData.DistribChnnlKey;
				var CompanyCode = hdrData.CompnyCodeKey;
				var accountGroup = hdrData.AccountGrpKey;
			} else {
				var oODataJSONModel = new sap.ui.model.json.JSONModel({
					"results": []
				});
				that.getView().setModel(oODataJSONModel, "TaxClassificationComboSet");
				return;
			}
			var URL =
				"/RESTAdapter/ACCOUNTING_DATA_FETCH/ZSD_MDM_SALES_DATA_API_SRV/TaxCategorySet?System_Name=" + system + "&filter=Companycode eq '" +
				CompanyCode + "' and Salesorg eq '" + salesOrg + "' and Distrchannel eq '" + DistriChannel + "' and AccntGrp eq '" + accountGroup +
				"'&expand=NavTaxClassification";

			var Filter = new sap.ui.model.Filter('URL', 'EQ', URL);
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							oODataJSONModel = new sap.ui.model.json.JSONModel({
								"results": JSON.parse(oData.results[0].Response)
							});
							for (var i = 0; i < oODataJSONModel.getData().results.d.results.length; i++) {
								oODataJSONModel.getData().results.d.results[i].Taxclassification = oODataJSONModel.getData().results.d.results[i].Taxclassif;
							}
							that.getView().setModel(oODataJSONModel, "TaxClassificationComboSet");
							//Resubmit & Review scenario
							that.bindTaxClassification();
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);

		},

		displayTaxClassificationDialog: function() {
			if (!this._oDialogTaxClassification) {
				// this._oDialogTaxClassification = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.taxClassification", this);
				this._oDialogTaxClassification = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.taxClassificationDialog", this);
				this.getView().addDependent(this._oDialogTaxClassification);
			}
			this._oDialogTaxClassification.open();

		},

		onPressTaxClassificationFragOk: function() {
			this._oDialogTaxClassification.close();
		},

		createStatusDetailstab: function(oData) {
			var statusDetails = {
				DeletionFlag: {
					/*	DeletionFlagGeneric: oData.DeletionFlagGeneric ? oData.DeletionFlagGeneric : false,
						DeletionFlagAccounting: oData.DeletionFlagAccounting ? oData.DeletionFlagAccounting : false,
						DeletionFlagSales: oData.DeletionFlagSales ? oData.DeletionFlagSales : false*/
					DeletionFlagGeneric: false,
					DeletionFlagAccounting: false,
					DeletionFlagSales: false
				},
				BlockData: {
					/*	PostingBlock: oData.PostingBlock ? oData.PostingBlock : false,
						OrderBlock: oData.OrderBlock ? oData.OrderBlock.toString().trim() : "",
						DeliveryBlock: oData.DeliveryBlock ? oData.DeliveryBlock.toString().trim() : "",
						BillingBlock: oData.BillingBlock ? oData.BillingBlock.toString().trim() : "",
						BlockSalesReport: oData.BlockSalesSupport ? oData.BlockSalesSupport : false,*/
					PostingBlock: false,
					OrderBlock: "",
					DeliveryBlock: "",
					BillingBlock: "",
					BlockSalesReport: false,

					PostingBlockSate: "None",
					PostingBlockMessage: " ",
					OrderBlockState: "None",
					OrderBlockMessage: " ",
					DeliveryBlockState: "None",
					DeliveryBlockMessage: " ",
					BillingBlockState: "None",
					BillingBlockMessage: " ",
					BlockSalesReportState: "None",
					BlockSalesReportMessage: " "
				}
			};
			var modelCustomerData = new sap.ui.model.json.JSONModel(statusDetails);
			this.getView().setModel(modelCustomerData, "StatusDetailsSet");
		},

		createSalesDataTab: function() {
			var salesData = {
				SalesDataTab: {
					SalesDataTabVisible: false
				},
				SalesOrder: {
					SalesDistrict: "",
					SalesOffice: "",
					SalesGroup: "",
					CustomerGroup: "",
					Currency: "",
					AcctAtCust: "",
					ExchangeRateType: "",
					PriceGroup: "",
					CustPricProc: "",
					PriceList: "",
					CustStatGrp: "",

					SalesDistrictState: "None",
					SalesDistrictMessage: "",
					SalesOfficeState: "None",
					SalesOfficeMessage: "",
					SalesGroupState: "None",
					SalesGroupMessage: "",
					CustomerGroupState: "None",
					CustomerGroupMessage: "",
					CurrencyState: "None",
					CurrencyMessage: "",
					AcctAtCustState: "None",
					AcctAtCustMessage: "",
					ExchangeRateTypeState: "None",
					ExchangeRateTypeMessage: "",
					PriceGroupState: "None",
					PriceGroupMessage: "",
					CustPricProcState: "None",
					CustPricProcMessage: "",
					PriceListState: "None",
					PriceListMessage: "",
					CustStatGrpState: "None",
					CustStatGrpMessag: ""

				},
				Shipping: {
					DeliveryPriority: "",
					ShippingConditions: "",
					DeliveryPlant: "",
					OrderCombination: false,
					RelevantforProd: false,
					ProductionTimeFrame: "",
					CompleteDeliveryRequired: false,
					PartialDeliveryPerItem: "",
					MaxPartialDeliveries: "",

					DeliveryPriorityState: "None",
					DeliveryPriorityMessage: "",
					ShippingConditionsState: "None",
					ShippingConditionsMessage: "",
					DeliveryPlantState: "None",
					DeliveryPlantMessage: "",
					OrderCombinationState: "None",
					OrderCombinationMessage: "",
					RelevantforProdState: "None",
					RelevantforProdMessage: "",
					ProductionTimeFrameState: "None",
					ProductionTimeFrameMessage: "",
					CompleteDeliveryRequiredState: "None",
					CompleteDeliveryRequiredMessage: "",
					PartialDeliveryPerItemState: "None",
					PartialDeliveryPerItemMessage: "",
					MaxPartialDeliveriesState: "None",
					MaxPartialDeliveriesMessage: ""

				},
				BillingDocument: {
					Rebate: false,
					PriceDetermination: false,
					InvoiceDates: "",
					InvoiceListDates: "",
					Incoterms1: "",
					Incoterms2: "",
					TermsofPayment: "",
					AccountAssignmentGroup: "",

					RebateState: "None",
					RebateMessage: "",
					PriceDeterminationState: "None",
					PriceDeterminationMessage: "",
					InvoiceDatesState: "None",
					InvoiceDatesMessage: "",
					InvoiceListDatesState: "None",
					InvoiceListDatesMessage: "",
					Incoterms1State: "None",
					Incoterms1Message: "",
					Incoterms2State: "None",
					Incoterms2Message: "",
					TermsofPaymentState: "None",
					TermsofPaymentMessage: "",
					AccountAssignmentGroupState: "None",
					AccountAssignmentGroupMessage: ""

				},
				AdditionalFields: {
					CustomerGroup1: "",
					CustomerGroup2: "",
					CustomerGroup3: "",
					CustomerGroup4: "",
					CustomerGroup5: "",
					CustomerGroup6: "",

					CustomerGroup1State: "None",
					CustomerGroup1Message: "",
					CustomerGroup2State: "None",
					CustomerGroup2Message: "",
					CustomerGroup3State: "None",
					CustomerGroup3Message: "",
					CustomerGroup4State: "None",
					CustomerGroup4Message: "",
					CustomerGroup5State: "None",
					CustomerGroup5Message: "",
					CustomerGroup6State: "None",
					CustomerGroup6Message: ""

				}
			};
			var modelCustomerData = new sap.ui.model.json.JSONModel(salesData);
			this.getView().setModel(modelCustomerData, "SalesDataSet");
		},
		readDefaultPartnerFunctions: function(accountGroup) {
			var that = this;
			// var hdrData = this.getView().getModel("HeaderModelSet").getData();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			if (accountGroup !== "") {
				var URL =
					"/RESTAdapter/Default_Partner_Function/ZSD_MDM_SALES_DATA_API_SRV/DefaultPartnerFunctionSet?System_Name=" + system +
					"&filter=AccountGroup eq '" +
					accountGroup + "'";
			} else {
				return;
			}
			var Filter = new sap.ui.model.Filter('URL', 'EQ', URL);
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							if (oData.results[0].Response.includes("error")) {
								var errorMsg = JSON.parse(oData.results[0].Response).error.message.value;
								that.errMsg(errorMsg);
								var oODataJSONModel = new sap.ui.model.json.JSONModel({
									"results": ""
								});
								that.getView().setModel(oODataJSONModel, "DefaultGeneratedPartnerFnSet");
								var hdrData = that.getView().getModel("HeaderModelSet").getData();
								hdrData.AccountGrpKey = "";
								that.getView().getModel("HeaderModelSet").refresh();
								return;
							}
							oODataJSONModel = new sap.ui.model.json.JSONModel({
								"results": JSON.parse(oData.results[0].Response)
							});
							for (var i = 0; i < oODataJSONModel.getData().results.d.results.length; i++) {
								oODataJSONModel.getData().results.d.results[i].PartnerDescription = "";
								oODataJSONModel.getData().results.d.results[i].Default = false;
								oODataJSONModel.getData().results.d.results[i].custNumberValueState = "None";
								oODataJSONModel.getData().results.d.results[i].custNumberValueStateText = "";
							}
							that.getView().setModel(oODataJSONModel, "DefaultGeneratedPartnerFnSet");
							//Resubmit & Review scenario
							that.bindDefaultPartnerFunctions();
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);

		},

		createSalesDataTabFirstReadCall: function(oData) {
			var salesData = {
				SalesDataTab: {
					SalesDataTabVisible: false
				},
				SalesOrder: {
					SalesDistrict: oData.SalesDistrict ? oData.SalesDistrict.toString().trim() : "",
					SalesOffice: oData.SalesOffice ? oData.SalesOffice.toString().trim() : "",
					SalesGroup: oData.SalesGroup ? oData.SalesGroup.toString().trim() : "",
					CustomerGroup: oData.CustomerGroup ? oData.CustomerGroup.toString().trim() : "",
					Currency: oData.Currency ? oData.Currency.toString().trim() : "",
					AcctAtCust: oData.AcctAtCust ? oData.AcctAtCust.toString().trim() : "",
					ExchangeRateType: oData.ExchRateType ? oData.ExchRateType.toString().trim() : "",
					PriceGroup: oData.PriceGrp ? oData.PriceGrp.toString().trim() : "",
					CustPricProc: oData.CustPricProc ? oData.CustPricProc.toString().trim() : "",
					PriceList: oData.PriceList ? oData.PriceList.toString().trim() : "",
					CustStatGrp: oData.CustStatsGrp ? oData.CustStatsGrp.toString().trim() : "",

					SalesDistrictState: "None",
					SalesDistrictMessage: "",
					SalesOfficeState: "None",
					SalesOfficeMessage: "",
					SalesGroupState: "None",
					SalesGroupMessage: "",
					CustomerGroupState: "None",
					CustomerGroupMessage: "",
					CurrencyState: "None",
					CurrencyMessage: "",
					AcctAtCustState: "None",
					AcctAtCustMessage: "",
					ExchangeRateTypeState: "None",
					ExchangeRateTypeMessage: "",
					PriceGroupState: "None",
					PriceGroupMessage: "",
					CustPricProcState: "None",
					CustPricProcMessage: "",
					PriceListState: "None",
					PriceListMessage: "",
					CustStatGrpState: "None",
					CustStatGrpMessag: ""

				},
				Shipping: {
					DeliveryPriority: oData.DeliveryPriority ? oData.DeliveryPriority.toString().trim() : "",
					ShippingConditions: oData.ShippingCond ? oData.ShippingCond.toString().trim() : "",
					DeliveryPlant: oData.DeliveringPlant ? oData.DeliveringPlant.toString().trim() : "",
					OrderCombination: oData.OrderCombination ? oData.OrderCombination : false,
					RelevantforProd: oData.RelevantForPod ? oData.RelevantForPod : false,
					ProductionTimeFrame: oData.PodTimeframe ? oData.PodTimeframe.toString().trim() : "",
					CompleteDeliveryRequired: oData.CompleteDelvryRequired ? oData.CompleteDelvryRequired : false,
					PartialDeliveryPerItem: oData.PartialDelvryPerItem ? oData.PartialDelvryPerItem.toString().trim() : "",
					MaxPartialDeliveries: oData.MaxPartialDelvry ? oData.MaxPartialDelvry.toString().trim() : "",

					DeliveryPriorityState: "None",
					DeliveryPriorityMessage: "",
					ShippingConditionsState: "None",
					ShippingConditionsMessage: "",
					DeliveryPlantState: "None",
					DeliveryPlantMessage: "",
					OrderCombinationState: "None",
					OrderCombinationMessage: "",
					RelevantforProdState: "None",
					RelevantforProdMessage: "",
					ProductionTimeFrameState: "None",
					ProductionTimeFrameMessage: "",
					CompleteDeliveryRequiredState: "None",
					CompleteDeliveryRequiredMessage: "",
					PartialDeliveryPerItemState: "None",
					PartialDeliveryPerItemMessage: "",
					MaxPartialDeliveriesState: "None",
					MaxPartialDeliveriesMessage: ""

				},
				BillingDocument: {
					Rebate: oData.Rebate ? oData.Rebate : false,
					PriceDetermination: oData.PriceDetermn ? oData.PriceDetermn : false,
					InvoiceDates: oData.InvoiceDates ? oData.InvoiceDates.toString().trim() : "",
					InvoiceListDates: oData.InvoiceListDates ? oData.InvoiceListDates.toString().trim() : "",
					Incoterms1: oData.Incoterms1 ? oData.Incoterms1.toString().trim() : "",
					Incoterms2: oData.Incoterms2 ? oData.Incoterms2.toString().trim() : "",
					TermsofPayment: oData.TermsOfPayment ? oData.TermsOfPayment.toString().trim() : "",
					AccountAssignmentGroup: oData.AcctAssgmtGroup ? oData.AcctAssgmtGroup.toString().trim() : "",

					RebateState: "None",
					RebateMessage: "",
					PriceDeterminationState: "None",
					PriceDeterminationMessage: "",
					InvoiceDatesState: "None",
					InvoiceDatesMessage: "",
					InvoiceListDatesState: "None",
					InvoiceListDatesMessage: "",
					Incoterms1State: "None",
					Incoterms1Message: "",
					Incoterms2State: "None",
					Incoterms2Message: "",
					TermsofPaymentState: "None",
					TermsofPaymentMessage: "",
					AccountAssignmentGroupState: "None",
					AccountAssignmentGroupMessage: ""

				},
				AdditionalFields: {
					CustomerGroup1: oData.CustomerGroup1 ? oData.CustomerGroup1.toString().trim() : "",
					CustomerGroup2: oData.CustomerGroup2 ? oData.CustomerGroup2.toString().trim() : "",
					CustomerGroup3: oData.CustomerGroup3 ? oData.CustomerGroup3.toString().trim() : "",
					CustomerGroup4: oData.CustomerGroup4 ? oData.CustomerGroup4.toString().trim() : "",
					CustomerGroup5: oData.CustomerGroup5 ? oData.CustomerGroup5.toString().trim() : "",
					CustomerGroup6: oData.CustomerGroup6 ? oData.CustomerGroup6.toString().trim() : "",

					CustomerGroup1State: "None",
					CustomerGroup1Message: "",
					CustomerGroup2State: "None",
					CustomerGroup2Message: "",
					CustomerGroup3State: "None",
					CustomerGroup3Message: "",
					CustomerGroup4State: "None",
					CustomerGroup4Message: "",
					CustomerGroup5State: "None",
					CustomerGroup5Message: "",
					CustomerGroup6State: "None",
					CustomerGroup6Message: ""

				}
			};
			var modelCustomerData = new sap.ui.model.json.JSONModel(salesData);
			this.getView().setModel(modelCustomerData, "SalesDataSet");
		},

		readPartnerFunction: function(accountGroup) {
			var that = this;
			// var hdrData = this.getView().getModel("HeaderModelSet").getData();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			if (accountGroup !== "") {
				var URL =
					"/RESTAdapter/Other_Partner_Function/ZSD_MDM_SALES_DATA_API_SRV/InputHelp_OtherPartnerFunctionSet?System_Name=" + system +
					"&filter=AccountGroup eq '" +
					accountGroup + "'&expand=NavOtherPartnerFunction";

			} else {
				return;
			}
			// var URL =
			// 	"/RESTAdapter/Other_Partner_Function/ZSD_MDM_SALES_DATA_API_SRV/InputHelp_OtherPartnerFunctionSet?System_Name=MD4&filter=AccountGroup eq '0001'&expand=NavOtherPartnerFunction";
			var Filter = new sap.ui.model.Filter('URL', 'EQ', URL);
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var oODataJSONModel = new sap.ui.model.json.JSONModel({
								"results": JSON.parse(oData.results[0].Response)
							});
							oODataJSONModel.setSizeLimit(JSON.parse(oData.results[0].Response).d.results[0].NavOtherPartnerFunction.results.length);
							that.getView().setModel(oODataJSONModel, "PartnerFunctionComboSet");
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);

		},

		createOtherPartnerFunctionModelSet: function(accountGroup) {
			var partnerFunction = {
				OtherPartnerFunctions: [{
					PartnerFunction: "",
					PartnerDescription: "",
					Number: "",
					Name: "",
					PartnerDescriptionText: "",
					Default: false,

					PartFunState: "None",
					PartFunMessage: " ",

					NumState: "None",
					NumMessage: " ",

					NameState: "None",
					NameMessage: "",

					PartDescState: "None",
					PartDescMessage: "",

					DefaultState: "None",
					DefaultMessage: ""
				}],
				DisplayOtherPartnerFunctions: false
			};
			var modelCustomerData = new sap.ui.model.json.JSONModel(partnerFunction);
			this.getView().setModel(modelCustomerData, "OtherPartnerFunctionSet");
			if (accountGroup === "0001") {
				this.getView().getModel("OtherPartnerFunctionSet").getData().DisplayOtherPartnerFunctions = true;
				this.getView().getModel("OtherPartnerFunctionSet").refresh();
				//Resubmit & Review scenario
				this.bindOtherPartnerFunctions();
			}
		},

		createSoldtoPartnerFunctionModelSet: function(accountGroup) {
			var SoldtoPartnerFunction = {
				SoldtoPartnerFunctions: [{
					PartnerFunction: "",
					PartnerDescription: "",
					Number: "",
					Name: "",
					PartnerDescriptionText: "",
					Default: false,

					PartFunState: "None",
					PartFunMessage: " ",

					NumState: "None",
					NumMessage: " ",

					NameState: "None",
					NameMessage: "",

					PartDescState: "None",
					PartDescMessage: "",

					DefaultState: "None",
					DefaultMessage: ""

				}],
				DisplaySoldtoPartnerFunction: false
			};
			var modelCustomerData = new sap.ui.model.json.JSONModel(SoldtoPartnerFunction);
			this.getView().setModel(modelCustomerData, "SoldtoPartnerFunctionSet");
			if (accountGroup !== "0001") {
				this.getView().getModel("SoldtoPartnerFunctionSet").getData().DisplaySoldtoPartnerFunction = true;
				this.getView().getModel("SoldtoPartnerFunctionSet").refresh();
				//Resubmit & Review scenario
				this.bindSoldtoPartnerFunctions();
			}
		},
		addOtherPartnerFunctions: function() {
			var modelData = this.getView().getModel("OtherPartnerFunctionSet").getData().OtherPartnerFunctions;
			var errCount = 0;
			for (var i = 0; i < modelData.length; i++) {
				if (modelData[i].PartnerFunction === undefined || modelData[i].PartnerFunction.toString().trim() === "") {
					errCount++;
					modelData[i].PartFunState = "Error";
					modelData[i].PartFunMessage = " ";
				} else {
					modelData[i].PartFunState = "None";
					modelData[i].PartFunMessage = " ";
				}

				if (modelData[i].Number === undefined || modelData[i].Number.toString().trim() === "") {
					errCount++;
					modelData[i].NumState = "Error";
					modelData[i].NumMessage = " ";
				} else {
					modelData[i].NumState = "None";
					modelData[i].NumMessage = " ";
				}
			}
			this.getView().getModel("OtherPartnerFunctionSet").refresh();
			if (errCount > 0) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("partnerFunctionAndNameMandatoryPart"));
				return;
			}

			this.getView().getModel("OtherPartnerFunctionSet").getData().OtherPartnerFunctions.push({
				PartnerFunction: "",
				PartnerDescription: "",
				Number: "",
				Name: "",
				PartnerDescriptionText: "",
				Default: false,

				PartFunState: "None",
				PartFunMessage: " ",

				NumState: "None",
				NumMessage: " ",

				NameState: "None",
				NameMessage: "",

				PartDescState: "None",
				PartDescMessage: "",

				DefaultState: "None",
				DefaultMessage: ""
			});
			this.getView().getModel("OtherPartnerFunctionSet").refresh();
		},

		addSoldtoPartnerFunction: function() {
			var modelData = this.getView().getModel("SoldtoPartnerFunctionSet").getData().SoldtoPartnerFunctions;
			var errCount = 0;
			for (var i = 0; i < modelData.length; i++) {
				if (modelData[i].PartnerFunction === undefined || modelData[i].PartnerFunction.toString().trim() === "") {
					errCount++;
					modelData[i].PartFunState = "Error";
					modelData[i].PartFunMessage = " ";
				} else {
					modelData[i].PartFunState = "None";
					modelData[i].PartFunMessage = " ";
				}

				if (modelData[i].Number === undefined || modelData[i].Number.toString().trim() === "") {
					errCount++;
					modelData[i].NumState = "Error";
					modelData[i].NumMessage = " ";
				} else {
					modelData[i].NumState = "None";
					modelData[i].NumMessage = " ";
				}
			}
			this.getView().getModel("SoldtoPartnerFunctionSet").refresh();
			if (errCount > 0) {
				sap.m.MessageToast.show(this.i18nModel.getProperty("partnerFunctionAndNameMandatoryPart"));
				return;
			}

			this.getView().getModel("SoldtoPartnerFunctionSet").getData().SoldtoPartnerFunctions.push({
				PartnerFunction: "",
				PartnerDescription: "",
				Number: "",
				Name: "",
				PartnerDescriptionText: "",
				Default: false,

				PartFunState: "None",
				PartFunMessage: " ",

				NumState: "None",
				NumMessage: " ",

				NameState: "None",
				NameMessage: "",

				PartDescState: "None",
				PartDescMessage: "",

				DefaultState: "None",
				DefaultMessage: ""
			});
			this.getView().getModel("SoldtoPartnerFunctionSet").refresh();
		},

		//Logic for Accounting Data Payment Method

		onAccountingDataPaymentMethod: function(oEvent, system) {
			var that = this;
			var compCode = oEvent;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			//var system = this.getView().getModel("HeaderModelSet").getData().System;
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/ACCOUNTING_DATA_FETCH/ZSD_MDM_Account_DATA_API_SRV/InputHelpPaymentMethodSet?filter=Bukrs eq '" + compCode +
				"'&expand=NavPayment_Method&System_Name=" + system);
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var objList = JSON.parse(oData.results[0].Response).d.results[0];
							// for NavPayment_Method
							var NavPayment_Method = [];
							var oResult11 = objList.NavPayment_Method.results;
							if (oResult11.length === undefined) {
								oResult11 = Array(oResult11);
							}
							NavPayment_Method = oResult11;
						}
						var oNPMModel = new sap.ui.model.json.JSONModel({
							"results": NavPayment_Method
						});
						oNPMModel.setSizeLimit(NavPayment_Method.length);
						that.getView().setModel(oNPMModel, "NavPaymentMethodSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});

		},
		// Account Management ReconAccount
		onLivechangeofReconAccount: function(oEvent) {
			this.onChangeAccountingDataAccountManagement(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//  Account Management SortKey
		onLivechangeofSortKey: function(oEvent) {
			this.onChangeAccountingDataAccountManagement(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		// Account Management HeadOffice
		onLiveChangeHeadOffice: function(oEvent) {

			this.onChangeAccountingDataAccountManagement(oEvent);
			var that = this;
			var oSystem = this.getView().getModel("HeaderModelSet").getData().System;
			var oHeadOffice = oEvent.getParameter("value");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/Validate_CustomerExtend_SAP/ZSD_MDM_ACCOUNT_DATA_API_SRV/Validation_HeadOffice_BuyinggrpSet?System_Name=" + oSystem +
				"&filter=Head_Office eq '" + oHeadOffice + "'");
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							if (JSON.parse(oData.results[0].Response).error !== undefined) {
								var oErrorMessage = JSON.parse(oData.results[0].Response).error.message.value;
								that.getView().getModel("AccountingDataModelSet").getData().AccountManagement.HeadOffice = "";
								sap.m.MessageBox.error(oErrorMessage);
								that.getView().getModel("AccountingDataModelSet").refresh();

							}
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},
		// Account Management PreviousAccountNumber 
		onLiveChangePreviousAccountNumber: function(oEvent) {
			this.onChangeAccountingDataAccountManagement(oEvent);
		},
		// Account Management BuyingGroup 
		onLiveChangeBuyingGroup: function(oEvent) {
			this.onChangeAccountingDataAccountManagement(oEvent);
			var that = this;
			var oSystem = this.getView().getModel("HeaderModelSet").getData().System;
			var oBuyingGroup = oEvent.getParameter("value");
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/Validate_CustomerExtend_SAP/ZSD_MDM_ACCOUNT_DATA_API_SRV/Validation_HeadOffice_BuyinggrpSet?System_Name=" + oSystem +
				"&filter=Buying_Group eq '" + oBuyingGroup + "'");
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							if (JSON.parse(oData.results[0].Response).error !== undefined) {
								var oErrorMessage = JSON.parse(oData.results[0].Response).error.message.value;
								that.getView().getModel("AccountingDataModelSet").getData().AccountManagement.BuyingGroup = "";
								sap.m.MessageBox.error(oErrorMessage);
								that.getView().getModel("AccountingDataModelSet").refresh();

							}
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});

		},

		// Account Management live change Logic
		onChangeAccountingDataAccountManagement: function(oEvent) {

			var ADPaymentData = this.getView().getModel("AccountingDataModelSet").getData().AccountManagement;
			ADPaymentData.UIAccountManagementValidator = false;
			this.getView().getModel("AccountingDataModelSet").refresh();
			oEvent.getSource().setValueState("None");
		},

		//Payment Data ToleranceGroup

		onLivechangeofToleranceGroup: function(oEvent) {
			this.onChangeAccountingDataPaymentData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//Payment Data PaymentMethods   
		onLivechangeofPaymentMethods: function(oEvent) {
			this.onChangeAccountingDataPaymentData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//Payment Data  HouseBank 
		onLivechangeofHouseBank: function(oEvent) {
			this.onChangeAccountingDataPaymentData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		// //Payment Data  SelectionRule
		onLivechangeofSelectionRule: function(oEvent) {
			this.onChangeAccountingDataPaymentData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		selectPaymentHisRecord: function(oEvent) {
			this.onChangeAccountingDataPaymentData(oEvent);
		},
		// //Payment Data  TermsofPayment
		onLivechangeofTermsofPayment: function(oEvent) {

			this.onChangeAccountingDataPaymentData(oEvent);
			var oPT = this.getView().getModel("AccountingDataModelSet").getData().PaymentTerms;
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				oPT.PaymentTermMessage = "";
			} else {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("NavPaymentTermSet").getObject();
				if (selObj.preferred_pt.toString().trim() === "") {
					var warningMessage = selObj.terms_of_payment + " - " + selObj.explanation + " " + this.getView().getModel("i18n").getProperty(
						"isnotapreferredpaymentterm");
					sap.m.MessageBox.warning(warningMessage);
					oPT.PaymentTermMessage = warningMessage;
				} else {
					oPT.PaymentTermMessage = "";
				}
			}
			this.getView().getModel("AccountingDataModelSet").refresh();
			/*var oPT = this.getView().getModel("AccountingDataModelSet").getData().PaymentTerms.terms_of_payment;
			var objPT = this.getView().getModel("NavPaymentTermSet").getData().results;
			var P1,P2,P3;
			var M1,M2,M3;
			var warningMessage;*/
			/*for (var p = 0; p < objPT.length; p++) {
				P1 = objPT[p].terms_of_payment;
				P2 = objPT[p].explanation;
				P3 = objPT[p].preferred_pt;
				if (oPT === P1 && P3 === "") {
					M1 = this.getView().getModel("i18n").getProperty("selectedvalue");
					M2 =  P1 + " - "+ P2 +" ";
					M3 = this.getView().getModel("i18n").getProperty("isnotapreferredpaymentterm");
					warningMessage =  M2 + M3;
					sap.m.MessageBox.warning(warningMessage);
					return;
				}
			}*/
		},

		//Payment Data CreditMemoPayTerm
		onLivechangeofCreditMemoPayTerm: function(oEvent) {
			this.onChangeAccountingDataPaymentData(oEvent);
			var oPT = this.getView().getModel("AccountingDataModelSet").getData().PaymentTerms;
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				oPT.CreditMemoPayTermMessage = "";
			} else {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("NavPaymentTermSet").getObject();
				if (selObj.preferred_pt.toString().trim() === "") {
					var warningMessage = selObj.terms_of_payment + " - " + selObj.explanation + " " + this.getView().getModel("i18n").getProperty(
						"isnotapreferredcreditmemopaymentterm");
					sap.m.MessageBox.warning(warningMessage);
					oPT.CreditMemoPayTermMessage = warningMessage;
				} else {
					oPT.CreditMemoPayTermMessage = "";
				}
			}
			this.getView().getModel("AccountingDataModelSet").refresh();
		},
		//Payment Data BeChangesPayTerm
		onLivechangeofBeChangesPayTerm: function(oEvent) {
			this.onChangeAccountingDataPaymentData(oEvent);
			var oPT = this.getView().getModel("AccountingDataModelSet").getData().PaymentTerms;
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				oPT.BeChangesPayTermMessage = "";
			} else {
				var selObj = oEvent.getSource().getSelectedItem().getBindingContext("NavPaymentTermSet").getObject();
				if (selObj.preferred_pt.toString().trim() === "") {
					var warningMessage = selObj.terms_of_payment + " - " + selObj.explanation + " " + this.getView().getModel("i18n").getProperty(
						"isnotapreferredbechangespaymentterm");
					sap.m.MessageBox.warning(warningMessage);
					oPT.BeChangesPayTermMessage = warningMessage;
				} else {
					oPT.BeChangesPayTermMessage = "";
				}
			}
			this.getView().getModel("AccountingDataModelSet").refresh();
		},
		//Payment Data live change logic
		onChangeAccountingDataPaymentData: function(oEvent) {

			var ADPaymentData = this.getView().getModel("AccountingDataModelSet").getData().PaymentData;
			ADPaymentData.UIPaymentDataValidator = false;
			this.getView().getModel("AccountingDataModelSet").refresh();
			oEvent.getSource().setValueState("None");
		},

		// 	Accounting Data Correspondence

		// Correspondence DunnProcedure
		onLivechangeofDunnProcedure: function(oEvent) {
			this.onChangeCorrespondenceData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				var corrs = this.getView().getModel("AccountingDataModelSet").getData().Correspondence;
				corrs.LastDunned = null;
				corrs.DunningClerk = "";
				corrs.DunningBlock = "";
				corrs.DunningLevel = "";
				corrs.DunningArea = "";
				this.getView().getModel("AccountingDataModelSet").refresh();
			}
		},

		// Correspondence LastDunned
		onLiveChangeofLastDunned: function(oEvent) {
			this.onChangeCorrespondenceData(oEvent);
			if (oEvent.getParameters().valid === false) {
				oEvent.getSource().setDateValue(null);
				sap.m.MessageToast.show(this.i18nModel.getProperty("enterCorrectDate"));
			}
		},

		// Correspondence DunningClerk
		onLivechangeofDunningClerk: function(oEvent) {
			this.onChangeCorrespondenceData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		// Correspondence	DunningBlock	
		onLivechangeofDunningBlock: function(oEvent) {

			this.onChangeCorrespondenceData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}

		},

		// Correspondence DunningLevel
		onLiveChangeofDunningLevel: function(oEvent) {
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,1})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
			this.onChangeCorrespondenceData(oEvent);
		},
		// Correspondence DunningArea
		onLivechangeofDunningArea: function(oEvent) {
			this.onChangeCorrespondenceData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}

		},
		// Correspondence ClerkAbbrev
		onLivechangeofClerkAbbrev: function(oEvent) {
			this.onChangeCorrespondenceData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		// Correspondence AcctAtCust
		onLiveChangeofAcctAtCust: function(oEvent) {

			this.onChangeCorrespondenceData(oEvent);

		},
		// Correspondence CustomerUser
		onLiveChangeofCustomerUser: function(oEvent) {
			this.onChangeCorrespondenceData(oEvent);
		},
		// Correspondence ClerksInternet
		onLiveChangeofClerksInternet: function(oEvent) {
			this.onChangeCorrespondenceData(oEvent);
			var that = this;
			var dataSend = {
				"root": {
					"EMail": oEvent.getParameters().value.trim()
				}
			};
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_MDM/CleanseEmailAddress",
				"Request": JSON.stringify(dataSend)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(response) {
					// oBusyDialog.close();
					if (response.Response.includes("<h1>Error</h1>")) {
						var message = response.Response.split("<pre>")[1].split("</pre>")[0];
						that.errMsg(message);
					} else {
						var corrs = that.getView().getModel("AccountingDataModelSet").getData().Correspondence;
						if (JSON.parse(response.Response).root.Validation_Error === "X") {
							corrs.ClerksInternet = "";
							sap.m.MessageToast.show(that.i18nModel.getProperty("reenterValidClearInternet"));
						}
						that.getView().getModel("AccountingDataModelSet").refresh();
					}
					oBusyDialog.close();
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});
		},

		// Correspondence AccountStatement
		onLivechangeofAccountStatement: function(oEvent) {
			this.onChangeCorrespondenceData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		// Accounting Data Correspondence live change
		onChangeCorrespondenceData: function(oEvent) {

			var ADPaymentData = this.getView().getModel("AccountingDataModelSet").getData().PaymentData;
			ADPaymentData.UICorrespondenceValidator = false;
			this.getView().getModel("AccountingDataModelSet").refresh();
			oEvent.getSource().setValueState("None");
		},
		// Logic for Accounting Data Payment Terms

		onAccountingDataPaymentTerms: function(system) {
			var that = this;

			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();

			var Filter = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/PAYMENT_TERMS_BRM/FETCH?System_Name=" + system
			);

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();

						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);

						} else {

							var objListPT = JSON.parse(oData.results[0].Response).return;

							var responceList = [];
							var oResultPT = objListPT.responceList;
							if (oResultPT.length === undefined) {
								oResultPT = Array(oResultPT);
							}
							responceList = oResultPT;

							var oPTModel = new sap.ui.model.json.JSONModel({
								"results": responceList
							});
							oPTModel.setSizeLimit(responceList.length);
							that.getView().setModel(oPTModel, "NavPaymentTermSet");

						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				});

		},

		onChangeCustNumDefaultPartFn: function(oEvent) {
			oEvent.getSource().setValueState("None");
			this.validateCustomerNumber(oEvent.getSource().sId.split("-").pop(), "DefaultGeneratedPartnerFnSet");
		},

		liveChangeNameDefaultGeneratedPartne: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangePartnerDescDefaultGeneratedPartne: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeDefaultSelectDefaultGeneratedPartne: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onChangeCustNumOtherPartFn: function(oEvent) {
			oEvent.getSource().setValueState("None");
			this.validateCustomerNumber(oEvent.getSource().sId.split("-").pop(), "OtherPartnerFunctionSet");
		},

		liveChangeNameOPF: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangePartDescOPF: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		selectDefaultOPF: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeNameSOP: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangePartDescSOP: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onSelectDefaultSOP: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onChangeCustNumSoldToPartFn: function(oEvent) {
			oEvent.getSource().setValueState("None");
			this.validateCustomerNumber(oEvent.getSource().sId.split("-").pop(), "SoldtoPartnerFunctionSet");
		},
		validateCustomerNumber: function(rowId, model) {
			// this.getView().getModel(model).getData().results.d.results[rowId].Name = "";
			// this.getView().getModel(model).refresh();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			switch (model) {
				case "DefaultGeneratedPartnerFnSet":
					var customerNumber = this.getView().getModel(model).getData().results.d.results[rowId].Number;
					var partnerFunction = this.getView().getModel(model).getData().results.d.results[rowId].PartnerFunction;
					var partnerFunctionType = "";
					this.getView().getModel(model).getData().results.d.results[rowId].Name = "";
					this.getView().getModel(model).refresh();
					break;
				case "OtherPartnerFunctionSet":
					customerNumber = this.getView().getModel(model).getData().OtherPartnerFunctions[rowId].Number;
					partnerFunction = this.getView().getModel(model).getData().OtherPartnerFunctions[rowId].PartnerFunction;
					partnerFunctionType = "";
					this.getView().getModel(model).getData().OtherPartnerFunctions[rowId].Name = "";
					this.getView().getModel(model).refresh();
					break;
				case "SoldtoPartnerFunctionSet":
					customerNumber = this.getView().getModel(model).getData().SoldtoPartnerFunctions[rowId].Number;
					partnerFunction = this.getView().getModel(model).getData().SoldtoPartnerFunctions[rowId].PartnerFunction;
					partnerFunctionType = "L";
					this.getView().getModel(model).getData().SoldtoPartnerFunctions[rowId].Name = "";
					this.getView().getModel(model).refresh();
					break;
			}
			var that = this;
			if (customerNumber === "INTERNAL") {
				// this.getView().getModel(model).getData().results.d.results[rowId].Name = "";
				// this.getView().getModel(model).refresh();
				return;
			}
			if ((customerNumber !== "") && (partnerFunction !== "")) {
				var URL =
					"/RESTAdapter/Default_Partner_Function/ZSD_MDM_SALES_DATA_API_SRV/ValidateNumberSet?System_Name=" + system +
					"&filter=Number eq '" + customerNumber + "' and PartnerFunction eq '" + partnerFunction + "' and PartnerFunctionType eq '" +
					partnerFunctionType + "'";
			} else {
				// this.getView().getModel(model).getData().results.d.results[rowId].Name = "";
				// this.getView().getModel(model).refresh();
				return;
			}
			var Filter = new sap.ui.model.Filter('URL', 'EQ', URL);
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							if (oData.results[0].Response.includes("error")) {
								var errorMsg = JSON.parse(oData.results[0].Response).error.message.value;
								that.errMsg(errorMsg);
								switch (model) {
									case "DefaultGeneratedPartnerFnSet":
										that.getView().getModel(model).getData().results.d.results[rowId].Number = "";
										that.getView().getModel(model).getData().results.d.results[rowId].Name = "";
										break;
									case "OtherPartnerFunctionSet":
										that.getView().getModel(model).getData().OtherPartnerFunctions[rowId].Number = "";
										that.getView().getModel(model).getData().OtherPartnerFunctions[rowId].Name = "";
										break;
									case "SoldtoPartnerFunctionSet":
										that.getView().getModel(model).getData().SoldtoPartnerFunctions[rowId].Number = "";
										that.getView().getModel(model).getData().SoldtoPartnerFunctions[rowId].Name = "";
										break;
								}
								that.getView().getModel(model).refresh();
								return;
							} else {
								var name = JSON.parse(oData.results[0].Response).d.results[0].Name;
								switch (model) {
									case "DefaultGeneratedPartnerFnSet":
										that.getView().getModel(model).getData().results.d.results[rowId].Name = name;
										break;
									case "OtherPartnerFunctionSet":
										that.getView().getModel(model).getData().OtherPartnerFunctions[rowId].Name = name;
										break;
									case "SoldtoPartnerFunctionSet":
										that.getView().getModel(model).getData().SoldtoPartnerFunctions[rowId].Name = name;
										break;
								}
								that.getView().getModel(model).refresh();
							}

						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}

				}
			);

		},

		onClickEditRecod: function() {
			this.readCallForPendingRequist();
		},

		basedOnAccountGroupEnableMandatoryOptional: function(keyAcc) {

			var that = this;
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/Layout_Behaviour/ZSD_MDM_FIELD_STATUS_API_SRV/AccntGrpSet?System_Name=" + system +
				"&filter=ImTcode eq 'CH' and ImAccgr eq '" +
				keyAcc + "'&expand=N_FieldStatus"
			);
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
							return;
						} else if (JSON.parse(oData.results[0].Response).error !== undefined) {
							sap.m.MessageToast.show(JSON.parse(oData.results[0].Response).error.message.$);
						} else {
							var data1 = JSON.parse(oData.results[0].Response);
							var data = data1.d.results[0].N_FieldStatus.results;
							var finalstruct = {};
							for (var i = 0; i < data.length; i++) {
								finalstruct[data[i].Fldnm] = data[i].StatusDescpr;
								//	finalstruct[data[i].Fldnm] = "REQUIRED";
								if (finalstruct[data[i].Fldnm] === "DISPLAY") {
									finalstruct[data[i].Fldnm] = "HIDE";
								}
							}
							that.accountGroupBindMand(finalstruct);
						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});

		},

		accountGroupBindMand: function(finalstruct) {
			var accGrp = {

				//from UI
				NameAndAddrsEdit: false,
				TaxDataEdit: false,
				CustClassficEdit: false,
				ExternIdentEdit: false,
				BankEdit: false,
				UnlodEdit: false,
				CompContDetEdit: false,
				ContPerEdit: false,
				PartFunEdit: true,
				TextNoteSectionEdit: true,
				UploadDoc: true,
				//from UI end		

				CompanyCodeCond: "OPTIONAL", //Backend
				SalesOrgCond: "OPTIONAL", //Backend
				DistriChanlCond: "OPTIONAL", //Backend
				DivisionCond: "OPTIONAL", //Backend
				SystemCond: "OPTIONAL", //Backend
				AccountGrpCond: "OPTIONAL", //Backend
				ApplicIdCond: "OPTIONAL", //Backend
				GoldenIdCond: "OPTIONAL", //Backend

				CountryNameCond: "HIDE",
				AddrsVernCond: "HIDE", //Backend
				PrefAddVerCond: "HIDE", //Backend
				Name1Cond: "HIDE",
				Name2Cond: "HIDE",
				Name3Cond: "HIDE",
				Name4Cond: "HIDE",
				Street1Cond: "HIDE",
				Street2Cond: "HIDE",
				Street3Cond: "HIDE",
				Street4Cond: "HIDE",
				Street5Cond: "HIDE",
				HouseCond: "HIDE", //Backend
				HouseSuplmntCond: "HIDE", //Backend
				BuildingCond: "HIDE",
				FloorCond: "HIDE",
				RoomCond: "HIDE",
				PostalCodeCond: "HIDE",
				DistrictCond: "HIDE",
				CityCond: "HIDE",
				RegionCond: "HIDE",
				FreeTraderegCond: "HIDE", //Backend MDM
				POBOXNumCond: "HIDE",
				PoBoxPostCodeCond: "HIDE", //Backend
				PoBoxCityCond: "HIDE",
				CompPostCodeCond: "HIDE",
				ByPassAddrValCond: "HIDE", //Backend MDM
				streetValCond: "HIDE", //Backend MDM
				PoBoxValCond: "HIDE", //Backend MDM

				TaxVal1cond: "HIDE",
				TaxVal2cond: "HIDE",
				TaxVal3cond: "HIDE",
				TaxVal4cond: "HIDE",
				TaxVal5cond: "HIDE",
				VatCountryCond: "HIDE",
				VatNumCond: "HIDE",
				TaxJurisCodeCond: "HIDE",
				TaxationTypeCond: "HIDE",
				TaxNumberTypeCond: "HIDE",
				CFOPCatCond: "HIDE",
				ICMSLawCond: "HIDE",
				IPILawCond: "HIDE",
				NaturlPerCond: "HIDE",
				SalesPurTxCond: "HIDE",
				EqualizTaxCond: "HIDE",
				ICMSExempCond: "HIDE",
				IPIExemptCond: "HIDE",

				AccouTypeCond: "HIDE", //Backend
				IndClass1Cond: "HIDE", //Backend
				IndClass2Cond: "HIDE", //Backend
				BannerCond: "HIDE", //Backend
				IndCustTypeCond: "HIDE", //Backend
				BusActTypeCond: "HIDE", //Backend
				OrganizationLvlCond: "HIDE", //Backend
				AccLeglstusCond: "HIDE", //Backend
				CommerDelToCond: "HIDE", //Backend
				ServDelToCond: "HIDE", //Backend
				StoreCond: "HIDE", //Backend
				ChamberOfCommCond: "HIDE", //Backend
				DunsCond: "HIDE", //Backend
				ExternlTypeCond: "HIDE", //Backend
				ExternlValueCond: "HIDE", //Backend

				AlterBusNameCond: "HIDE", //Backend
				SearchTerm1Cond: "HIDE", //Backend
				SearchTerm2Cond: "HIDE",
				CommLangCond: "HIDE",
				AuthGrpCond: "HIDE",
				VendorNumCond: "HIDE",
				TransZoneCond: "HIDE",
				AltTranspZoneCond: "HIDE", //Backend
				RegStructGrpCond: "HIDE",
				GroupKeyCond: "HIDE",
				TradinParCond: "HIDE",
				MainlyCivilUsgCond: "HIDE",
				MainlyMilitUsgCond: "HIDE",
				LocationNo1Cond: "HIDE",
				LocationNo2Cond: "HIDE",
				CheckDigitCond: "HIDE",

				IBANCond: "HIDE", //Backend
				CountryCond: "HIDE",
				BankKeyCond: "HIDE",
				BankContKeyCond: "HIDE",
				BankAccCond: "HIDE",
				BankAccHolderCond: "HIDE",
				BankTypeCond: "HIDE",
				RefDetCond: "HIDE",
				CollAuthCond: "HIDE",
				AlterPayerCond: "HIDE",
				IndEntCond: "HIDE",
				AllowPayrCond: "HIDE", //Backend

				UnlodPointCond: "HIDE",
				GoodsRecHrsCond: "HIDE", //backend
				DefaultCond: "HIDE",
				CalenderKeyCond: "HIDE",

				EditUnloadPoint: "HIDE", //from UI Side
				MondayMornOpenCond: "HIDE", //Backend
				MondayMornCloseCond: "HIDE", //Backend
				MondayAfterOpenCond: "HIDE", //Backend
				MondayAfterCloseCond: "HIDE", //Backend

				TuesdayMornOpenCond: "HIDE", //Backend
				TuesdayMornCloseCond: "HIDE", //Backend
				TuesdayAfterOpenCond: "HIDE", //Backend
				TuesdayAfterCloseCond: "HIDE", //Backend

				WednesdayMornOpenCond: "HIDE", //Backend
				WednesdayMornCloseCond: "HIDE", //Backend
				WednesdayAfterOpenCond: "HIDE", //Backend
				WednesdayAfterCloseCond: "HIDE", //Backend

				ThursdayMornOpenCond: "HIDE", //Backend
				ThursdayMornCloseCond: "HIDE", //Backend
				ThursdayAfterOpenCond: "HIDE", //Backend
				ThursdayAfterCloseCond: "HIDE", //Backend

				FridayMornOpenCond: "HIDE", //Backend
				FridayMornCloseCond: "HIDE", //Backend
				FridayAfterOpenCond: "HIDE", //Backend
				FridayAfterCloseCond: "HIDE", //Backend

				SaturdayMornOpenCond: "HIDE", //Backend
				SaturdayMornCloseCond: "HIDE", //Backend
				SaturdayAfterOpenCond: "HIDE", //Backend
				SaturdayAfterCloseCond: "HIDE", //Backend

				SundayMornOpenCond: "HIDE", //Backend
				SundayMornCloseCond: "HIDE", //Backend
				SundayAfterOpenCond: "HIDE", //Backend
				SundayAfterCloseCond: "HIDE", //Backend

				//Account Tab
				ReconAccCond: finalstruct.AKONT,
				HeadOfficeCond: finalstruct.KNRZE,
				SorkKeyCond: finalstruct.ZUAWA,
				PreAccNoCond: finalstruct.ALTKN,
				BuyingGrpCond: finalstruct.EKVBD,
				TermsOfPayCond: finalstruct.ZTERM,
				CredMemoPaytrmCond: finalstruct.GUZTE,
				BeChangePayTermCond: finalstruct.WAKON,
				TolerncGrpCond: finalstruct.TOGRU,
				PaymntMethCond: finalstruct.ZWELS,
				HouseBankCond: finalstruct.HBKID,
				SelectnRuleCond: finalstruct.SREGL,
				PayHisRecod: finalstruct.XZVER,
				DunnProcCond: finalstruct.MAHNA,
				LastDunnCond: finalstruct.MADAT,
				DunningClerkCond: "OPTIONAL", //Backend,
				DunnigBlockCond: finalstruct.MANSP,
				DunLevelCond: finalstruct.MAHNS,
				DunnAreaCond: "OPTIONAL", //Backend,
				ClerkAbbrvCond: finalstruct.BUSAB,
				AccAtCustCond: finalstruct.EIKTO,
				CustomUsrCond: finalstruct.ZSABE,
				ClerkIntrnCond: finalstruct.INTAD,
				AccStmntCond: finalstruct.XAUSZ,

				//Status Data
				DelFlagGenCond: "OPTIONAL", //Backend,
				DelFlagAccCond: "OPTIONAL", //Backend,
				DelFlagSalesCond: "OPTIONAL", //Backend,
				PostingBlockCond: "OPTIONAL", //Backend
				OrderBlockCond: "OPTIONAL", //Backend
				DeliveryBlockCond: "OPTIONAL", //Backend
				BillngBlockCond: "OPTIONAL", //Backend
				BlockSalesSupportCond: "OPTIONAL", //Backend

				//sales  Data
				SalesDistrictSLDCond: finalstruct.BZIRK,
				SalesOfficeSLDCond: finalstruct.VKBUR,
				SalesGroupSLDCond: finalstruct.VKGRP,
				CustomerGroupSLDCond: finalstruct.KDGRP,
				CurrencySLDCond: finalstruct.WAERS,
				AcctAtCustSLDCond: finalstruct.EIKTO,
				ExchangeRateTypeSLDCond: finalstruct.KURST,
				PriceGroupSLDCond: finalstruct.KONDA,
				CustPricProcSLDCond: finalstruct.KALKS,
				PriceListSLDCond: finalstruct.PLTYP,
				CustStatGrpSLDCond: finalstruct.VERSG,
				DeliveryPrioritySLDCond: finalstruct.LPRIO,
				ShippingConditionsSLDCond: finalstruct.VSBED,
				DeliveryPlantSLDCond: finalstruct.VWERK,
				OrderCombinationSLDCond: finalstruct.KZAZU,
				RelevantforProdSLDCond: finalstruct.PODKZ,
				ProductionTimeFrameSLDCond: finalstruct.PODTG,
				CompleteDeliveryRequiredSLDCond: finalstruct.AUTLF,
				PartialDeliveryPerItemSLDCond: finalstruct.KZTLF,
				MaxPartialDeliveriesSLDCond: finalstruct.ANTLF,
				RebateSLDCond: finalstruct.BOKRE,
				PriCeDeterminCond: finalstruct.PRFRE,
				InvoiceDatesSLDCond: finalstruct.PERFK,
				InvoiceListDatesSLDCond: finalstruct.PERRL,
				Incoterms1SLDCond: finalstruct.INCO1,
				Incoterms2SLDCond: finalstruct.INCO2,
				TermsofPaymentSLDCond: finalstruct.ZTERM_SALES,
				AccountAssignmentGroupSLDCond: finalstruct.KTGRD,
				TaxClassiSLDCond: finalstruct.TAXKD,
				CustomerGroup1SLDCond: "OPTIONAL", //Backend
				CustomerGroup2SLDCond: "OPTIONAL", //Backend
				CustomerGroup3SLDCond: "OPTIONAL", //Backend
				CustomerGroup4SLDCond: "OPTIONAL", //Backend
				CustomerGroup5SLDCond: "OPTIONAL", //Backend
				CustomerGroup6SLDCond: "OPTIONAL", //Backend
				PartFunDGCond: finalstruct.PARVW,
				NumDGCond: "OPTIONAL", //Backend
				NameDGCond: "OPTIONAL", //Backend
				PartDescDGCond: finalstruct.KNREF,
				DefaultDGCond: "OPTIONAL", //finalstruct.DEFPA,
				PartFunOPCond: finalstruct.PARVW,
				NumOPCond: "OPTIONAL", //Backend
				NameOPCond: "OPTIONAL", //Backend
				PartDescOPCond: finalstruct.KNREF,
				DefaultOPCond: "OPTIONAL", //finalstruct.DEFPA,
				PartFunSOPCond: finalstruct.PARVW,
				NumSOPCond: "OPTIONAL", //Backend
				NameSOPCond: "OPTIONAL", //Backend
				PartDescSOPCond: finalstruct.KNREF,
				DefaultSOPCond: "HIDE", //finalstruct.DEFPA,

				//Text Notes
				LevelTNCond: "OPTIONAL", //Backend
				LanguageTNCond: finalstruct.LANGU,
				TextTypeTNCond: "OPTIONAL", //Backend
				FreeTextTNCond: "OPTIONAL", //Backend
				ClassificationTypeTNCond: "OPTIONAL", //Backend
				ClassificationTNCond: "OPTIONAL", //Backend
				ValueTNCond: "OPTIONAL", //Backend

				//contact details
				TelephoneCond: "HIDE",
				FaxCond: "HIDE",
				EmailCond: "HIDE",
				URLCond: "HIDE",
				TeleboxNumCond: "HIDE", //Backend
				TeleExtCond: "HIDE", //Backend
				FaxExtCond: "HIDE", //Backend
				FaxCommentCond: "HIDE", //Backend
				FaxDefaultCond: "HIDE", //Backend
				EmailCommentCond: "HIDE", //Backend
				EmailDefaultCond: "HIDE", //Backend
				URLCommentCond: "HIDE", //Backend
				URLDefaultCond: "HIDE", //Backend,
				TeleCommentCond: "HIDE", //Backend
				DefaultTeltCond: "HIDE", //Backend
				//	FaxComment: "HIDE",

				LastNameCPCond: "HIDE", //Backend
				FunctionCPCond: "HIDE",
				TelephoneCPCond: "HIDE",
				FaxCPCond: "HIDE",
				MobilePhoneCPCond: "HIDE", //Backend
				EmailCPCond: "HIDE",
				MethodCPCond: "HIDE",
				FirstNameCPCond: "HIDE", //Backend
				DepartmentCPCond: "HIDE",
				TelebExtCPCond: "HIDE", //Backend
				FaxExtenCPCond: "HIDE", //Backend
				NotesCPCond: "HIDE",
				LangCPCond: "HIDE" //Backend

			};
			var oModelReq = new sap.ui.model.json.JSONModel(accGrp);
			this.getView().setModel(oModelReq, "RequiredOptionalSet");

			this.getView().getModel("CustomerDataSet").refresh();
		},

		onSelectPostingBlock: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		changeOrderBlockState: function(oEvent) {
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
			oEvent.getSource().setValueState("None");
		},

		changeDeliveryBlokState: function(oEvent) {
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		changeBillingBlokState: function(oEvent) {
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		onSelectBlockSalesSupport: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onChangeAfternoonCloseTime: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onChangeAfternoonOpenTime: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onChangeMorningOpenTime: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onChangeMorningCloseTime: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		makeEptyDrowpdownDependt: function() {
			var oODataJSONModel = new sap.ui.model.json.JSONModel({
				"results": []
			});
			oODataJSONModel.setSizeLimit(1);
			this.getView().setModel(oODataJSONModel, "RegionBasedCountryComboSet");

			var oODataJSONModel1 = new sap.ui.model.json.JSONModel({
				"results": []
			});
			oODataJSONModel1.setSizeLimit(1);
			this.getView().setModel(oODataJSONModel1, "FreeTadeRegionBasedCountryComboSet");

			var data = {
				IndustryClassification2: {
					"BaseObject.Pager": {
						item: []
					}
				}
			};
			var oICModel2 = new sap.ui.model.json.JSONModel();
			oICModel2.setData({
				IndustryClassification2: data
			});
			this.getView().setModel(oICModel2, "industryClassificationSet2");
		},

		//sales order sales data live change	

		onLiveChangeofSalesDistrict: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeofSalesOffice: function(oEvent) {
			if (oEvent.getSource().getSelectedItem() !== undefined && oEvent.getSource().getSelectedItem() !== null) {
				var salesOffice = oEvent.getSource().getProperty("selectedKey");
				this.getView().getModel("SalesDataSet").getData().SalesOrder.SalesGroup = "";
			} else {
				this.getView().getModel("SalesDataSet").getData().SalesOrder.SalesGroup = "";
				var oSGMModel = new sap.ui.model.json.JSONModel({
					"results": ""
				});
				this.getView().setModel(oSGMModel, "SalesGroupSet");
			}
			this.getView().getModel("SalesDataSet").refresh();

			if (salesOffice !== "" && salesOffice !== undefined && salesOffice !== null) {
				this.readSalesGroup(salesOffice);
			}
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		readSalesGroup: function(salesOffice) {
			var that = this;
			if (salesOffice !== "" && salesOffice !== undefined && salesOffice !== null) {
				var system = this.getView().getModel("HeaderModelSet").getData().System;
			} else {
				return;
			}
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ',
				"/RESTAdapter/ACCOUNTING_DATA_FETCH/ZSD_MDM_SALES_DATA_API_SRV/Input_HelpSet?System_Name=''" + system +
				"''&filter= SalesOffice eq '" + salesOffice + "'&expand=NavSales_Group"
			);

			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData) {
						oBusyDialog.close();

						var SalesGroupData = [];
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
							return;

						} else {
							var data1 = JSON.parse(oData.results[0].Response);
							SalesGroupData = data1.d.results[0].NavSales_Group.results;
						}
						var oSGMModel = new sap.ui.model.json.JSONModel({
							"results": SalesGroupData
						});
						oSGMModel.setSizeLimit(SalesGroupData.length);
						that.getView().setModel(oSGMModel, "SalesGroupSet");
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});

		},
		onLiveChangeofSalesGroup: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeofCustomerGroup: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeofCurrency: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//input
		onLiveChangeofAcctAtCustState: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
		},
		onLiveChangeofExchangeRateType: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeofPriceGroup: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeofCustPricProc: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeofPriceList: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeofCustStatGrp: function(oEvent) {
			this.onLiveChangeofSalesOrderSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		onLiveChangeofSalesOrderSalesData: function(oEvent) {
			//	var SLDSalesOrder = this.getView().getModel("SalesDataSet").getData().SalesOrder;
			//	SLDSalesOrder.UISalesOrderValidator = false;
			//	this.getView().getModel("SalesDataSet").refresh();
			oEvent.getSource().setValueState("None");
		},

		//sales shipping sales orderdata

		onLiveChangeOfDeliveryPriority: function(oEvent) {
			this.onLiveChangeOfShippingSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfShippingConditions: function(oEvent) {
			this.onLiveChangeOfShippingSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfDeliveryPlant: function(oEvent) {
			this.onLiveChangeOfShippingSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		selectOrderCobination: function(oEvent) {
			this.onLiveChangeOfShippingSalesData(oEvent);
		},

		selectReleventForProd: function(oEvent) {
			this.onLiveChangeOfShippingSalesData(oEvent);
			var SLDShipping = this.getView().getModel("SalesDataSet").getData().Shipping;
			if (oEvent.getParameters().selected === false) {
				SLDShipping.ProductionTimeFrame = "";
			}
			this.getView().getModel("SalesDataSet").refresh();
		},

		selectDeliveryPriority: function(oEvent) {
			this.onLiveChangeOfShippingSalesData(oEvent);
		},
		//input
		onLiveChangeOfProductionTimeFrame: function(oEvent) {
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,4})(?:\.\d{0,2})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
			this.onLiveChangeOfShippingSalesData(oEvent);
		},
		onLiveChangeOfPartialDeliveryPerItem: function(oEvent) {
			this.onLiveChangeOfShippingSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
				var SLDSalesOrder = this.getView().getModel("SalesDataSet").getData().Shipping;
				SLDSalesOrder.MaxPartialDeliveries = "";
				this.getView().getModel("SalesDataSet").refresh();
			}
		},
		onLiveChangeOfMaxPartialDeliveries: function(oEvent) {
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,1})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
			this.onLiveChangeOfShippingSalesData(oEvent);
		},

		onLiveChangeOfShippingSalesData: function(oEvent) {
			//	var SLDShipping = this.getView().getModel("SalesDataSet").getData().Shipping;
			//	SLDShipping.UISalesShippingValidator = false;
			//	this.getView().getModel("SalesDataSet").refresh();
			oEvent.getSource().setValueState("None");

		},

		// billing documet sales data

		onLiveChangeOfInvoiceDates: function(oEvent) {
			this.onLiveChangeOfBillingDocumentSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfInvoiceListDates: function(oEvent) {
			this.onLiveChangeOfBillingDocumentSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfIncoterms1: function(oEvent) {
			this.onLiveChangeOfBillingDocumentSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfIncoterms2: function(oEvent) {
			this.onLiveChangeOfBillingDocumentSalesData(oEvent);

		},
		onLiveChangeOfTermsofPayment: function(oEvent) {
			this.onLiveChangeOfBillingDocumentSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfAccountAssignmentGroup: function(oEvent) {
			this.onLiveChangeOfBillingDocumentSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		onselectRebat: function(oEvent) {
			this.onLiveChangeOfBillingDocumentSalesData(oEvent);
		},

		onselectPriceDetrmination: function(oEvent) {
			this.onLiveChangeOfBillingDocumentSalesData(oEvent);
		},

		onLiveChangeOfBillingDocumentSalesData: function(oEvent) {
			//	var SLDBillingDocument = this.getView().getModel("SalesDataSet").getData().BillingDocument;
			//	SLDBillingDocument.UIBillingDocumentValidator = false;
			//	this.getView().getModel("SalesDataSet").refresh();
			oEvent.getSource().setValueState("None");
		},

		//additional fields sales data
		onLiveChangeOfCustomerGroup1: function(oEvent) {
			this.onLiveChangeOfAdditionalFieldsSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfCustomerGroup2: function(oEvent) {
			this.onLiveChangeOfAdditionalFieldsSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfCustomerGroup3: function(oEvent) {
			this.onLiveChangeOfAdditionalFieldsSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfCustomerGroup4: function(oEvent) {
			this.onLiveChangeOfAdditionalFieldsSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfCustomerGroup5: function(oEvent) {
			this.onLiveChangeOfAdditionalFieldsSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfCustomerGroup6: function(oEvent) {
			this.onLiveChangeOfAdditionalFieldsSalesData(oEvent);
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		onLiveChangeOfAdditionalFieldsSalesData: function(oEvent) {
			//	var SLDAdditionalFields = this.getView().getModel("SalesDataSet").getData().AdditionalFields;
			//	SLDAdditionalFields.UIAdditionalFieldsValidator = false;
			//	this.getView().getModel("SalesDataSet").refresh();
			oEvent.getSource().setValueState("None");
		},
		onChangTaxustomerClassification: function(oEvent) {
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		//contact person contact details

		onLiveChangeOfLastName: function(oEvent) {

			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfFunction: function(oEvent) {
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}

		},
		onLiveChangeOfTelephone: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onLiveChangeOfFax: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onLiveChangeOfMobilePhone: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		onLiveChangeOfMethod: function(oEvent) {
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		onLiveChangeOfFirstName: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfDepartment: function(oEvent) {
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},
		onLiveChangeOfTelepExtension: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfFaxExtension: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfNotes: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfLanguage: function(oEvent) {
			oEvent.getSource().setValueState("None");
			if (oEvent.getSource().getSelectedItem() === null) {
				oEvent.getSource().setValue("");
			}
		},

		//company contact details

		onLiveChangeOfTelephoneView: function(oEvent) {
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,20})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
			oEvent.getSource().setValueState("None");
			this.onTelephoneChange();
		},
		onLiveChangeOfFaxView: function(oEvent) {
			var value = oEvent.getParameters().value.trim();
			oEvent.getSource().setValue(value.replace("+", ""));
			oEvent.getSource().setValueState("None");
			this.onFaxChange();
		},
		onLiveChangeOfUrlView: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfTelebox: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfExtenView: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfFaxExtenView: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfCommentView: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfUrlComments: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfTeleComments: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		onLiveChangeOfFaxCommentViewState: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeTelephoneFragTable: function(oEvent) {
			var newValue = "";
			var a = 0;
			var value = oEvent.getParameters().value.trim();
			for (var i = 0; i < value.length; i++) {
				newValue += value[i];
				if (/^([0-9]{1,20})?$/.test(newValue)) {
					a++;
				} else {
					newValue = newValue.slice(0, -1);
				}
			}
			oEvent.getSource().setValue(newValue);
			oEvent.getSource().setValueState("None");
		},
		liveChangeExtenstionFragTable: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeTeleponeCommentFragTable: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		selectDefaultTelephoneDailog: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeFaxFragTable: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeFaxFrag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeFaxValueFrag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeFaxExtenstionFragTable: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeFaxCommentFragTable: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		selectDefaultFaxDailog: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChnageEmailComentFrag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		selectEmailDefaultFrag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		liveChangeURLFRag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeURLEmailFRag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		liveChangeURLCommentFRag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		selectGrpouDeualtUrlFrag: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},

		readDataAllTabs: function() {
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
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var oSearch = JSON.parse(oData.results[0].Response);
							//read header data
							that.oneTimeHeaderRead(oSearch.d.results[0]);
							//read Business partner Data 
							that.readHdrAndCustBusAreaCreateEmpty(oSearch.d.results[0]);

							//read customer Data Tab
							that.createCustomerDataTab(oSearch.d.results[0]);

							//read contact dtails
							that.createContactDetailsTab(oSearch.d.results[0]);

							//read Sales Data
							that.createSalesDataTabFirstReadCall(oSearch.d.results[0]);

							//read Accounting Data
							that.createAccountyEmptyModel(oSearch.d.results[0]);

							//read Text Notes
							that.textNoteTabInitialModelCreate(oSearch.d.results[0]);

							//status 
							that.createStatusDetailstab(oSearch.d.results[0]);

							//first Time Read all f4
							var hdrModel = that.getView().getModel("HeaderModelSet").getData();
							that.taxInputData();
							that.readTextNotesApiFirst();
							//that.bindTextNoteF4ValuesBasedOnFirstF4TextNotes();
							//that.bindTextNoteF4ValuesBasedOnFirstF4Classific();
							that.readContactPersonData(hdrModel.System);

							//Account Group
							that.readAccountGroup(hdrModel.System);

							//
							that.basedOnAccountGroupEnableMandatoryOptional(oSearch.d.results[0].Ktokd);
							that.readSalesArea();
							that.readSalesData();
							that.readTaxClassification();
							that.createOtherPartnerFunctionModelSet(hdrModel.AccountGrpKey);
							that.createSoldtoPartnerFunctionModelSet(hdrModel.AccountGrpKey);
							that.readDefaultPartnerFunctions(hdrModel.AccountGrpKey);
							that.readPartnerFunction(hdrModel.AccountGrpKey);
							that.onAccountingDataPaymentTerms(hdrModel.System);
							/*	var nameAd = that.getView().getModel("CreateModelSet").getData().NameAndAddress;
								that.onAccountingDataPaymentMethod(nameAd[0].Country);*/

							that.readStatusData(hdrModel.System);
							/*	if (hdrModel.CompnyCodeKey.toString() !== "") {
									that.onAccountingData(hdrModel.CompnyCodeKey, false);
								} else {
									that.onAccountingDataWithOutCompanyCode("");
								}*/

						}
					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		readInitialDisplayOnly: function(finalstruct) {
			var accGrp = {
				//from UI
				NameAndAddrsEdit: false,
				TaxDataEdit: false,
				CustClassficEdit: false,
				ExternIdentEdit: false,
				BankEdit: false,
				UnlodEdit: false,
				CompContDetEdit: false,
				ContPerEdit: false,
				PartFunEdit: false,
				TextNoteSectionEdit: false,
				UploadDoc: false,
				//from UI end

				CompanyCodeCond: "OPTIONAL",
				SalesOrgCond: "OPTIONAL",
				DistriChanlCond: "OPTIONAL",
				DivisionCond: "OPTIONAL",
				SystemCond: "HIDE",
				AccountGrpCond: "HIDE",
				ApplicIdCond: "HIDE",
				GoldenIdCond: "HIDE",

				CountryNameCond: "HIDE",
				AddrsVernCond: "HIDE",
				PrefAddVerCond: "HIDE",
				Name1Cond: "HIDE",
				Name2Cond: "HIDE",
				Name3Cond: "HIDE",
				Name4Cond: "HIDE",
				Street1Cond: "HIDE",
				Street2Cond: "HIDE",
				Street3Cond: "HIDE",
				Street4Cond: "HIDE",
				Street5Cond: "HIDE",
				HouseCond: "HIDE",
				HouseSuplmntCond: "HIDE",
				BuildingCond: "HIDE",
				FloorCond: "HIDE",
				RoomCond: "HIDE",
				PostalCodeCond: "HIDE",
				DistrictCond: "HIDE",
				CityCond: "HIDE",
				RegionCond: "HIDE",
				FreeTraderegCond: "HIDE",
				POBOXNumCond: "HIDE",
				PoBoxPostCodeCond: "HIDE",
				PoBoxCityCond: "HIDE",
				CompPostCodeCond: "HIDE",
				ByPassAddrValCond: "HIDE",
				streetValCond: "HIDE", //Backend MDM
				PoBoxValCond: "HIDE", //Backend MDM

				TaxVal1cond: "HIDE",
				TaxVal2cond: "HIDE",
				TaxVal3cond: "HIDE",
				TaxVal4cond: "HIDE",
				TaxVal5cond: "HIDE",
				VatCountryCond: "HIDE",
				VatNumCond: "HIDE",
				TaxJurisCodeCond: "HIDE",
				TaxationTypeCond: "HIDE",
				TaxNumberTypeCond: "HIDE",
				CFOPCatCond: "HIDE",
				ICMSLawCond: "HIDE",
				IPILawCond: "HIDE",
				NaturlPerCond: "HIDE",
				SalesPurTxCond: "HIDE",
				EqualizTaxCond: "HIDE",
				ICMSExempCond: "HIDE",
				IPIExemptCond: "HIDE",

				AccouTypeCond: "HIDE",
				IndClass1Cond: "HIDE",
				IndClass2Cond: "HIDE",
				BannerCond: "HIDE",
				IndCustTypeCond: "HIDE",
				BusActTypeCond: "HIDE",
				OrganizationLvlCond: "HIDE",
				AccLeglstusCond: "HIDE",
				CommerDelToCond: "HIDE",
				ServDelToCond: "HIDE",
				StoreCond: "HIDE",
				ChamberOfCommCond: "HIDE",
				DunsCond: "HIDE",
				ExternlTypeCond: "HIDE",
				ExternlValueCond: "HIDE",

				AlterBusNameCond: "HIDE",
				SearchTerm1Cond: "HIDE",
				SearchTerm2Cond: "HIDE",
				CommLangCond: "HIDE",
				AuthGrpCond: "HIDE",
				VendorNumCond: "HIDE",
				TransZoneCond: "HIDE",
				AltTranspZoneCond: "HIDE",
				RegStructGrpCond: "HIDE",
				GroupKeyCond: "HIDE",
				TradinParCond: "HIDE",
				MainlyCivilUsgCond: "HIDE",
				MainlyMilitUsgCond: "HIDE",
				LocationNo1Cond: "HIDE",
				LocationNo2Cond: "HIDE",
				CheckDigitCond: "HIDE",

				IBANCond: "HIDE",
				CountryCond: "HIDE",
				BankKeyCond: "HIDE",
				BankContKeyCond: "HIDE",
				BankAccCond: "HIDE",
				BankAccHolderCond: "HIDE",
				BankTypeCond: "HIDE",
				RefDetCond: "HIDE",
				CollAuthCond: "HIDE",
				AlterPayerCond: "HIDE",
				IndEntCond: "HIDE",
				AllowPayrCond: "HIDE",

				UnlodPointCond: "HIDE",
				GoodsRecHrsCond: "HIDE",
				DefaultCond: "HIDE",
				CalenderKeyCond: "HIDE",

				EditUnloadPoint: false, //from UI Side
				MondayMornOpenCond: "HIDE",
				MondayMornCloseCond: "HIDE",
				MondayAfterOpenCond: "HIDE",
				MondayAfterCloseCond: "HIDE",

				TuesdayMornOpenCond: "HIDE",
				TuesdayMornCloseCond: "HIDE",
				TuesdayAfterOpenCond: "HIDE",
				TuesdayAfterCloseCond: "HIDE",

				WednesdayMornOpenCond: "HIDE",
				WednesdayMornCloseCond: "HIDE",
				WednesdayAfterOpenCond: "HIDE",
				WednesdayAfterCloseCond: "HIDE",

				ThursdayMornOpenCond: "HIDE",
				ThursdayMornCloseCond: "HIDE",
				ThursdayAfterOpenCond: "HIDE",
				ThursdayAfterCloseCond: "HIDE",

				FridayMornOpenCond: "HIDE",
				FridayMornCloseCond: "HIDE",
				FridayAfterOpenCond: "HIDE",
				FridayAfterCloseCond: "HIDE",

				SaturdayMornOpenCond: "HIDE",
				SaturdayMornCloseCond: "HIDE",
				SaturdayAfterOpenCond: "HIDE",
				SaturdayAfterCloseCond: "HIDE",

				SundayMornOpenCond: "HIDE",
				SundayMornCloseCond: "HIDE",
				SundayAfterOpenCond: "HIDE",
				SundayAfterCloseCond: "HIDE",

				//Account Tab
				ReconAccCond: "OPTIONAL",
				HeadOfficeCond: "OPTIONAL",
				SorkKeyCond: "OPTIONAL",
				PreAccNoCond: "OPTIONAL",
				BuyingGrpCond: "OPTIONAL",
				TermsOfPayCond: "OPTIONAL",
				CredMemoPaytrmCond: "OPTIONAL",
				BeChangePayTermCond: "OPTIONAL",
				TolerncGrpCond: "OPTIONAL",
				PaymntMethCond: "OPTIONAL",
				HouseBankCond: "OPTIONAL",
				SelectnRuleCond: "OPTIONAL",
				PayHisRecod: "OPTIONAL",
				DunnProcCond: "OPTIONAL",
				LastDunnCond: "OPTIONAL",
				DunningClerkCond: "OPTIONAL",
				DunnigBlockCond: "OPTIONAL",
				DunLevelCond: "OPTIONAL",
				DunnAreaCond: "OPTIONAL",
				ClerkAbbrvCond: "OPTIONAL",
				AccAtCustCond: "OPTIONAL",
				CustomUsrCond: "OPTIONAL",
				ClerkIntrnCond: "OPTIONAL",
				AccStmntCond: "OPTIONAL",

				//Status Data
				DelFlagGenCond: "OPTIONAL",
				DelFlagAccCond: "OPTIONAL",
				DelFlagSalesCond: "OPTIONAL",
				PostingBlockCond: "OPTIONAL",
				OrderBlockCond: "OPTIONAL",
				DeliveryBlockCond: "OPTIONAL",
				BillngBlockCond: "OPTIONAL",
				BlockSalesSupportCond: "OPTIONAL",

				//sales  Data
				SalesDistrictSLDCond: "OPTIONAL",
				SalesOfficeSLDCond: "OPTIONAL",
				SalesGroupSLDCond: "OPTIONAL",
				CustomerGroupSLDCond: "OPTIONAL",
				CurrencySLDCond: "OPTIONAL",
				AcctAtCustSLDCond: "OPTIONAL",
				ExchangeRateTypeSLDCond: "OPTIONAL",
				PriceGroupSLDCond: "OPTIONAL",
				CustPricProcSLDCond: "OPTIONAL",
				PriceListSLDCond: "OPTIONAL",
				CustStatGrpSLDCond: "OPTIONAL",
				DeliveryPrioritySLDCond: "OPTIONAL",
				ShippingConditionsSLDCond: "OPTIONAL",
				DeliveryPlantSLDCond: "OPTIONAL",
				OrderCombinationSLDCond: "OPTIONAL",
				RelevantforProdSLDCond: "OPTIONAL",
				ProductionTimeFrameSLDCond: "OPTIONAL",
				CompleteDeliveryRequiredSLDCond: "OPTIONAL",
				PartialDeliveryPerItemSLDCond: "OPTIONAL",
				MaxPartialDeliveriesSLDCond: "OPTIONAL",
				RebateSLDCond: "OPTIONAL",
				PriCeDeterminCond: "OPTIONAL",
				InvoiceDatesSLDCond: "OPTIONAL",
				InvoiceListDatesSLDCond: "OPTIONAL",
				Incoterms1SLDCond: "OPTIONAL",
				Incoterms2SLDCond: "OPTIONAL",
				TermsofPaymentSLDCond: "OPTIONAL",
				AccountAssignmentGroupSLDCond: "OPTIONAL",
				TaxClassiSLDCond: "OPTIONAL",
				CustomerGroup1SLDCond: "OPTIONAL",
				CustomerGroup2SLDCond: "OPTIONAL",
				CustomerGroup3SLDCond: "OPTIONAL",
				CustomerGroup4SLDCond: "OPTIONAL",
				CustomerGroup5SLDCond: "OPTIONAL",
				CustomerGroup6SLDCond: "OPTIONAL",
				PartFunDGCond: "OPTIONAL",
				NumDGCond: "OPTIONAL",
				NameDGCond: "OPTIONAL",
				PartDescDGCond: "OPTIONAL",
				DefaultDGCond: "OPTIONAL",
				PartFunOPCond: "OPTIONAL",
				NumOPCond: "OPTIONAL",
				NameOPCond: "OPTIONAL",
				PartDescOPCond: "OPTIONAL",
				DefaultOPCond: "OPTIONAL",
				PartFunSOPCond: "OPTIONAL",
				NumSOPCond: "OPTIONAL",
				NameSOPCond: "OPTIONAL",
				PartDescSOPCond: "OPTIONAL",
				DefaultSOPCond: "OPTIONAL",

				//Text Notes
				LevelTNCond: "OPTIONAL",
				LanguageTNCond: "OPTIONAL",
				TextTypeTNCond: "OPTIONAL",
				FreeTextTNCond: "OPTIONAL",
				ClassificationTypeTNCond: "OPTIONAL",
				ClassificationTNCond: "OPTIONAL",
				ValueTNCond: "OPTIONAL",

				//contact details
				TelephoneCond: "HIDE",
				FaxCond: "HIDE",
				EmailCond: "HIDE",
				URLCond: "HIDE",
				TeleboxNumCond: "HIDE",
				TeleExtCond: "HIDE",
				FaxExtCond: "HIDE",
				FaxCommentCond: "HIDE",
				FaxDefaultCond: "HIDE",
				EmailCommentCond: "HIDE",
				EmailDefaultCond: "HIDE",
				URLCommentCond: "HIDE",
				URLDefaultCond: "HIDE",
				TeleCommentCond: "HIDE",
				DefaultTeltCond: "HIDE",
				//	FaxComment: "HIDE",

				LastNameCPCond: "HIDE",
				FunctionCPCond: "HIDE",
				TelephoneCPCond: "HIDE",
				FaxCPCond: "HIDE",
				MobilePhoneCPCond: "HIDE",
				EmailCPCond: "HIDE",
				MethodCPCond: "HIDE",
				FirstNameCPCond: "HIDE",
				DepartmentCPCond: "HIDE",
				TelebExtCPCond: "HIDE",
				FaxExtenCPCond: "HIDE",
				NotesCPCond: "HIDE",
				LangCPCond: "HIDE"

			};
			var oModelReq = new sap.ui.model.json.JSONModel(accGrp);
			this.getView().setModel(oModelReq, "RequiredOptionalSet");
		},

		readTextNotesApiFirst: function() {
			this.onTextNotesLangguage();
			this.onTextnotesLevel();
			this.onTextNotesClassification();
		},

		//read 
		readCallForPendingRequist: function() {
			var hdr = this.getView().getModel("HeaderModelSet").getData();
			var dataPassed = sap.ui.getCore().getModel("searchExtSubTableModelSet").getData().ArrayExtIdent;

			var payload = {
				"BUSINESSPARTNER": {
					"bsnsPrtnrId": hdr.GoldenRecordId.toString().trim(), // golden Record Id
					"CUSINTIDENTIFIER": []
				}
			};
			var compCode = dataPassed.CUSCOMPANYCODE ? dataPassed.CUSCOMPANYCODE.item : "";
			var salesData = dataPassed.CUSSALESAREA ? dataPassed.CUSSALESAREA.item : "";
			payload.BUSINESSPARTNER.CUSINTIDENTIFIER = {
				"rowidObject": dataPassed.rowidObject ? dataPassed.rowidObject : "",
				"altIdentifier": dataPassed.altIdentifier ? dataPassed.altIdentifier : "",
				"leadingAccount": dataPassed.leadingAccount ? dataPassed.leadingAccount : "",
				"otherBcChange": dataPassed.otherBcChange ? dataPassed.otherBcChange : "",
				"itoLogicalCompRowid": dataPassed.itoLogicalCompRowid ? dataPassed.itoLogicalCompRowid.rowidObject : "",
				"applnRoleRowid": dataPassed.applnRoleRowid ? dataPassed.applnRoleRowid.rowidObject : "",
				"transZoneCodeRowid": dataPassed.transZoneCodeRowid ? dataPassed.transZoneCodeRowid.rowidObject : "",
				"CUSCOMPANYCODE": [],
				"CUSSALESAREA": []
			};

			if (compCode) {
				if (compCode.length === undefined) {
					compCode = Array(compCode);
				}

				for (var j = 0; j < compCode.length; j++) {
					payload.BUSINESSPARTNER.CUSINTIDENTIFIER.CUSCOMPANYCODE.push({
						"rowidObject": compCode[j].rowidObject ? compCode[j].rowidObject : "",
						"delInd": compCode[j].delInd ? compCode[j].delInd : "",
						"companyCodeRowid": compCode[j].companyCodeRowid ? compCode[j].companyCodeRowid.rowidObject : ""
					});
				}
			}

			//sales Area
			if (salesData) {
				if (salesData.length === undefined) {
					salesData = Array(salesData);
				}

				for (var r = 0; r < salesData.length; r++) {
					payload.BUSINESSPARTNER.CUSINTIDENTIFIER.CUSSALESAREA.push({
						"rowidObject": salesData[r].rowidObject ? salesData[r].rowidObject : "",
						"delInd": salesData[r].delInd ? salesData[r].delInd : "",
						"rebate": salesData[r].rebate ? salesData[r].rebate : "",
						"linkingPartners": salesData[r].linkingPartners ? salesData[r].linkingPartners : "",
						"removeBlock": salesData[r].removeBlock ? salesData[r].removeBlock : "",
						"pricing": salesData[r].pricing ? salesData[r].pricing : "",
						"liableForTax": salesData[r].liableForTax ? salesData[r].liableForTax : "",
						"setBlock": salesData[r].setBlock ? salesData[r].setBlock : "",
						"salesOrganizationRowid": salesData[r].salesOrganizationRowid ? salesData[r].salesOrganizationRowid.rowidObject : "",
						"distributionChannelRowid": salesData[r].distributionChannelRowid ? salesData[r].distributionChannelRowid.rowidObject : "",
						"divisionRowid": salesData[r].divisionRowid ? salesData[r].divisionRowid.rowidObject : ""
					});
				}
			}

			var that = this;
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_MDM/PendingValidation",
				"Request": JSON.stringify(payload)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(response) {
					oBusyDialog.close();
					var json = JSON.parse(response.Response);
					if (json.objectXml === undefined) {
						that.errMsg(json.detailsXml.ValidationErrors.error.message);
					} else {
						sap.m.MessageToast.show("No pending Request");
					}
				},
				error: function(oError) {
					oBusyDialog.close();
				}
			});
		},

		///Review and Resubmit scenario
		displayCustomerRequestDetails: function() {
			// this.fetchstartupParameters();
			// this.checktaskStatus();
			this.bindExtensionCustomerModel();
		},
		fetchstartupParameters: function() {
			this.taskInstanceId = this.getOwnerComponent().getComponentData().startupParameters.TASK[0];
			this.taskStatus = this.getOwnerComponent().getComponentData().startupParameters.Status[0];
			this.taskDefinitionName = this.getOwnerComponent().getComponentData().startupParameters.TaskDefinitionName[0];
		},

		checktaskStatus: function() {
			// this.taskDefinitionName = "Actual_Requestor_Task";
			// this.taskDefinitionName = "Market_Approver_Task";
			// this.taskInstanceId = "8ab92854b6d811eaca46000000cac786";
			if (this.taskDefinitionName !== undefined && this.taskDefinitionName === "Requester Create") {
				var approveVisibleProperty = false;
				var rejectVisibleProperty = false;
				var deleteVisibleProperty = true;
				this.resubmitScenario = true;
				var uploadDocument = true;
			} else if (this.taskDefinitionName !== undefined && this.taskDefinitionName === "Customer Executor Create") {
				approveVisibleProperty = true;
				rejectVisibleProperty = false;
				deleteVisibleProperty = false;
				this.reviewScenario = true;
				uploadDocument = true;
			} else {
				approveVisibleProperty = true;
				rejectVisibleProperty = true;
				deleteVisibleProperty = false;
				this.reviewScenario = true;
				uploadDocument = true;
			}
			if (this.taskStatus === "READY") {
				var oModel = new sap.ui.model.json.JSONModel({
					"Enabled": false,
					"approveVisible": approveVisibleProperty,
					"rejectVisible": rejectVisibleProperty,
					"validatePendingRequestbtnVisible": false,
					"sendforReviewEnabled": false,
					"DeleteEnabled": false,
					"DeleteVisible": deleteVisibleProperty,
					"closeEnabled": true,
					"closeVisible": true,
					"cancelVisible": false,
					"duplicateCheckCommentVisible": this.reviewScenario === true ? true : false,
					"duplicateCheckChangeBtnVisible": this.resubmitScenario === true ? true : false,
					"duplicateCheckProcessBtnVisible": this.resubmitScenario === true ? true : false,
					"duplicateCheckCloseBtnVisible": this.reviewScenario === true ? true : false,
					"ShowNav": false,
					"hdrTextVisible": false,
					"CompanyCodeCB": this.resubmitScenario === true ? true : false,
					"CompanyCodeInput": this.reviewScenario === true ? true : false,
					"SalesOrgCB": this.resubmitScenario === true ? true : false,
					"SalesOrgInput": this.reviewScenario === true ? true : false,
					"DistributionChannelCB": this.resubmitScenario === true ? true : false,
					"DistributionChannelInput": this.reviewScenario === true ? true : false,
					"DivisionCB": this.resubmitScenario === true ? true : false,
					"DivisionInput": this.reviewScenario === true ? true : false,
					"SystemCB": this.resubmitScenario === true ? true : false,
					"SystemInput": this.reviewScenario === true ? true : false,
					"AccountGroupCB": this.resubmitScenario === true ? true : false,
					"AccountGroupInput": this.reviewScenario === true ? true : false,
					"UploadDocument": uploadDocument
				});
			} else {
				oModel = new sap.ui.model.json.JSONModel({
					"Enabled": true,
					"approveVisible": approveVisibleProperty,
					"rejectVisible": rejectVisibleProperty,
					"validatePendingRequestbtnVisible": false,
					"sendforReviewEnabled": true,
					"DeleteEnabled": true,
					"DeleteVisible": deleteVisibleProperty,
					"closeEnabled": true,
					"closeVisible": true,
					"cancelVisible": false,
					"duplicateCheckCommentVisible": this.reviewScenario === true ? true : false,
					"duplicateCheckChangeBtnVisible": this.resubmitScenario === true ? true : false,
					"duplicateCheckProcessBtnVisible": this.resubmitScenario === true ? true : false,
					"duplicateCheckCloseBtnVisible": this.reviewScenario === true ? true : false,
					"ShowNav": false,
					"hdrTextVisible": false,
					"CompanyCodeCB": this.resubmitScenario === true ? true : false,
					"CompanyCodeInput": this.reviewScenario === true ? true : false,
					"SalesOrgCB": this.resubmitScenario === true ? true : false,
					"SalesOrgInput": this.reviewScenario === true ? true : false,
					"DistributionChannelCB": this.resubmitScenario === true ? true : false,
					"DistributionChannelInput": this.reviewScenario === true ? true : false,
					"DivisionCB": this.resubmitScenario === true ? true : false,
					"DivisionInput": this.reviewScenario === true ? true : false,
					"SystemCB": this.resubmitScenario === true ? true : false,
					"SystemInput": this.reviewScenario === true ? true : false,
					"AccountGroupCB": this.resubmitScenario === true ? true : false,
					"AccountGroupInput": this.reviewScenario === true ? true : false,
					"UploadDocument": uploadDocument
				});
			}
			this.getView().setModel(oModel, "ButtonPropertyModel");

		},

		bindExtensionCustomerModel: function() {
			// this.InputData = JSON.parse(oData.results[0].Response);
			this.hideDeletionBlock();
			this.InputData = JSON.parse(sap.ui.getCore().getModel("customerDetailsModelSet").getData().results);
			this.createHeaderSetEmptyModel();
			this.bindHdrAndCustBusAreaModel();
			var country = this.getView().getModel("CreateModelSet").getData().NameAndAddress[0].Country;
			this.readRegionNameAddress(country);
			this.readFreeTradeRegionNameAddress(country);
			this.readCustomerDataTabData(country);
			this.createEmptyCustomerDataTab();
			this.readSystemBusArea();
			var system = this.getView().getModel("HeaderModelSet").getData().System;
			this.taxInputData(system);
			this.readAccountGroup(system);
			this.createEmptyContactDetailsTab();
			this.readContactPersonData(system);
			var companyCode = this.getView().getModel("HeaderModelSet").getData().CompnyCodeKey;
			this.createAccountyEmptyModel2();
			this.onAccountingData(companyCode, false, system);
			this.onAccountingDataPaymentTerms(system);
			this.onAccountingDataPaymentMethod(companyCode, system);
			// this.bindAccountingTabDataModel();
			this.createSalesDataTab();
			this.readSalesData();
			this.readSalesGroup(this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].SalesOrder.results[0].SalesOffice);
			this.createEmptyStatusDetailstab();
			this.readStatusData(system);
			this.setFieldsDisplayMode();
			this.getView().getModel("DuplicateCheckSet").getData().DuplicateBtnEnable = true;
			this.getView().getModel("DuplicateCheckSet").refresh();
			this.readTaxClassification();
			var accountGrpKey = this.getView().getModel("HeaderModelSet").getData().AccountGrpKey;
			this.createOtherPartnerFunctionModelSet(accountGrpKey);
			this.createSoldtoPartnerFunctionModelSet(accountGrpKey);
			this.readDefaultPartnerFunctions(accountGrpKey);
			this.readPartnerFunction(accountGrpKey);
			this.readIndustryClassification2();
			this.createEmptytextNoteModel();
			this.onTextNotesLangguage(system);
			this.onTextnotesLevel(system);
			this.onTextNotesClassification(system);
			this.createFileUploadSection();
			this.bindDuplicateCheckComments();
			this.bindUploadedDocuments();

			// var CustomerData = JSON.parse(oData.results[0].Response).d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData;

			// this.bindCustomerData(CustomerData);
			// var ContactDetailsData = JSON.parse(oData.results[0].Response).d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails;
			// this.bindContactDetails(ContactDetailsData);
			// var AccountingData = JSON.parse(oData.results[0].Response).d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData;
			// this.createAccountingData(AccountingData);
			// this.bindSalesData(CustomerCreate.SalesData);
			// this.bindStatusData(CustomerCreate.StatusData);
			// this.bindTextNotes();
		},

		bindHdrAndCustBusAreaModel: function() {
			this.bindCustomerBusinessAreaModel();
			this.bindBusinessPartnerTabDataModel();
		},
		bindCustomerBusinessAreaModel: function() {
			//header data
			var CustomerBusinessArea = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0].CustomerBusinessArea;
			var bsnsPrtnrId = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData.results[0].GeneralData.results[0].bsnsPrtnrId;
			var hdr = this.getView().getModel("HeaderModelSet").getData();
			hdr.CompnyCodeKey = CustomerBusinessArea.results[0].CompanyCode;
			hdr.SalesOrgKey = CustomerBusinessArea.results[0].SalesOrg;
			hdr.DistribChnnlKey = CustomerBusinessArea.results[0].DistributionChannel;
			hdr.DivisionKey = CustomerBusinessArea.results[0].Division;
			hdr.System = CustomerBusinessArea.results[0].System;
			hdr.AccountGrpKey = CustomerBusinessArea.results[0].AccountGroup;
			hdr.AppId = CustomerBusinessArea.results[0].ApplicationId;
			hdr.GoldenRecordId = bsnsPrtnrId;
			this.getView().getModel("HeaderModelSet").refresh();
			this.readSalesArea();
		},

		bindBusinessPartnerTabDataModel: function() {
			this.createEmptybusinesspartnerTabModel();
			this.bindNameAndAddress();
			// this.bindTaxData();
			// this.bindTaxRelatedData();
			// var BusinessPartnerData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0];
			// var countryset = this.getView().getModel("CountryComboSet").getData();
			// for (var i = 0; i < countryset.results.length; i++) {
			// 	if (countryset.results[i].code === BusinessPartnerData.Name_Address.results[0].Country) {
			// 		var countryName = countryset.results[i].englishShortName;
			// 		break;
			// 	}
			// }
			// this.readTaxRelatedData(BusinessPartnerData.Name_Address.results[0].Country, countryName);
			this.bindCustomerClassification();
			// this.bindExternalIdentifier();
		},

		bindTaxRelatedData: function() {
			if ((this.resubmitScenario === true || this.reviewScenario === true) && (this.InputData !== undefined)) {
				var BusinessPartnerData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0];
				var countryset = this.getView().getModel("CountryComboSet").getData();
				for (var i = 0; i < countryset.results.length; i++) {
					if (countryset.results[i].code === BusinessPartnerData.Name_Address.results[0].Country) {
						var countryName = countryset.results[i].englishShortName;
						break;
					}
				}
				this.readTaxRelatedData(BusinessPartnerData.Name_Address.results[0].Country, countryName, false);
			}
		},

		bindNameAndAddress: function() {
			// var data = {};
			// var modelMain1 = new sap.ui.model.json.JSONModel(data);
			// modelMain1.getData().NameAndAddress = [];
			var BusinessPartnerData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0];
			var model = this.getView().getModel("CreateModelSet");
			model.getData().NameAndAddress = [];
			for (var i = 0; i < BusinessPartnerData.Name_Address.results.length; i++) {
				var NameAndAddress = BusinessPartnerData.Name_Address.results[i];
				model.getData().NameAndAddress.push({
					"CONTACTrowid": NameAndAddress.CONTACTrowid,
					// "AddCountNo": "1 of 1",
					"AddCountNo": (i + 1) + " of " + (BusinessPartnerData.Name_Address.results.length),
					"Country": NameAndAddress.Country,
					"Address_Version": NameAndAddress.AddressVersion,
					"Preferred_Local_Language": JSON.parse(NameAndAddress.PreferredAddressVersion),
					"Name": NameAndAddress.Name,
					"Name_1": NameAndAddress.Name1,
					"Name_2": NameAndAddress.Name2,
					"Name_3": NameAndAddress.Name3,
					"Name_4": NameAndAddress.Name4,
					"Street": NameAndAddress.Street,
					"Street_1": NameAndAddress.Street1,
					"Street_2": NameAndAddress.Street2,
					"Street_3": NameAndAddress.Street3,
					"Street_4": NameAndAddress.Street4,
					"Street_5": NameAndAddress.Street5,
					"House_No": NameAndAddress.HouseNo,
					"House_No_Supplement": NameAndAddress.HouseNoSupplement,
					"Building": NameAndAddress.Building,
					"Floor": NameAndAddress.Floor,
					"Room": NameAndAddress.Room,
					"Postal_Code": NameAndAddress.PostalCode,
					"District": NameAndAddress.District,
					"City": NameAndAddress.City,
					"Region": NameAndAddress.Region,
					"Free_Trade_Region": NameAndAddress.FreeTradeRegion,
					"PO_Box": NameAndAddress.POBoxNumber,
					"PO_Box_Code": NameAndAddress.POBoxPostalCode,
					"PO_Box_City": NameAndAddress.POBoxCity,
					"Bypass_Validation": false,
					"Street_Validation": NameAndAddress.StreetValidation,
					"POBox_Validation": NameAndAddress.POBoxValidation,
					"CompPostalCode": NameAndAddress.CompanyPostalCode,

					"CountryState": "None",
					"CountryMessage": " ",
					"AddrVrsState": "None",
					"AddrVrsMessage": " ",
					"PrefLangState": "None",
					"PrefLangMessage": " ",
					"Name1State": "None",
					"Name1Message": " ",
					"Name2State": "None",
					"Name2Message": " ",
					"Name3State": "None",
					"Name3Message": " ",
					"Name4State": "None",
					"Name4Message": " ",

					"Street1State": "None",
					"Street1Message": " ",
					"Street2State": "None",
					"Street2Message": " ",
					"Street3State": "None",
					"Street3Message": " ",
					"Street4State": "None",
					"Street4Message": " ",
					"Street5State": "None",
					"Street5Message": " ",
					"HouseState": "None",
					"HouseMessage": " ",
					"HouseSupState": "None",
					"HouseSupMessage": " ",

					"BuildState": "None",
					"BuildMessage": " ",

					"FloorState": "None",
					"FloorMessage": " ",

					"RoomState": "None",
					"RoomMessage": " ",

					"PostCodeState": "None",
					"PostCodeMessage": " ",

					"DistrictState": "None",
					"DistrictMessage": " ",

					"CityState": "None",
					"CityMessage": " ",

					"RegionState": "None",
					"RegionMessage": " ",

					"FreeTradeRegionState": "None",
					"FreeTradeRegionMessage": " ",

					"POBoxNumState": "None",
					"POBoxNumMessage": " ",

					"POBoxPostCodState": "None",
					"POBoxPostCodMessage": " ",

					"POBoxCityState": "None",
					"POBoxCityMessage": " ",
					"PreferedAddrsVerEnabled": false,
					"CountryEnabled": i === 0 ? true : false,
					"PostalCodeEnabled": i === 0 ? true : false,
					"RegionEnabled": i === 0 ? true : false,
					"FreeTradeRegionEnabled": i === 0 ? true : false,
					"POBoxNumEnabled": i === 0 ? true : false,
					"PoBoxPostCodeEnabled": i === 0 ? true : false,
					"CompPostalCodeEnabled": i === 0 ? true : false,
					"UiAddressValidated": true,

					// "CompPostalCode": "",
					"CompPostalCodeState": "None",
					"CompPostalCodeMessage": "",
					"ByPassAddrsState": "None",
					"ByPassAddrsMessage": " ",
					"streetValState": "None",
					"StreetValMessage": " ",
					"PoBoxValState": "None",
					"POBoxValMessage": " ",
					"SIP_POP": NameAndAddress.sipPop,
					"MatchRuleGroup": NameAndAddress.matchRuleGroup,
					"cntryRowid": NameAndAddress.cntryRowid
				});

			}
			// var modelMain1 = new sap.ui.model.json.JSONModel(data);
			this.getView().getModel("CreateModelSet").refresh();
		},

		bindTaxData: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				var BusinessPartnerData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0];
				var model = this.getView().getModel("CreateModelSet");
				var TaxData = BusinessPartnerData.TaxData.results[0];
				var Text1 = this.getView().getModel("CreateModelSet").getData().TaxData.Text1;
				var Text2 = this.getView().getModel("CreateModelSet").getData().TaxData.Text2;
				var Text3 = this.getView().getModel("CreateModelSet").getData().TaxData.Text3;
				var Text4 = this.getView().getModel("CreateModelSet").getData().TaxData.Text4;
				var Text5 = this.getView().getModel("CreateModelSet").getData().TaxData.Text5;
				model.getData().TaxData = {
					"TotalAdditionalVat": TaxData.VAT.results.length - 1,
					"AdditionalVats": [],
					"Text1": Text1,
					"Text2": Text2,
					"Text3": Text3,
					"Text4": Text4,
					"Text5": Text5,
					"Text1Value": TaxData.Tax1,
					"Text2Value": TaxData.Tax2,
					"Text3Value": TaxData.Tax3,
					"Text4Value": TaxData.Tax4,
					"Text5Value": TaxData.Tax5,
					"VatNum": TaxData.VAT.results[0].Number,
					"VatCountKey": TaxData.VAT.results[0].Country,
					"TaxJurisdiction_Code": TaxData.TaxJurisdictionCode,
					"Taxation_Type": TaxData.TaxationType,
					"TaxNumber_Type": TaxData.TaxNumberType,
					"CFOP_Category": TaxData.CFOPCategory,
					"ICMS_Law": TaxData.ICMSLaw,
					"IPI_Law": TaxData.IPILaw,
					"Natural_Person": JSON.parse(TaxData.NaturalPerson),
					"salesPurchase_Tax": JSON.parse(TaxData.Sales_PurTax),
					"Equalization_Tax": JSON.parse(TaxData.EqualizationTax),
					"ICMS_Exempt": JSON.parse(TaxData.ICMSExempt),
					"IPI_Exempt": JSON.parse(TaxData.IPI_Exempt),

					"TaxJurisdictionCodeMessgae": "",
					"TaxJurisdictionCodeState": "None",

					"TaxationTypeMessage": "",
					"TaxationTypeState": "None",

					"TaxNumberTypeMessage": "",
					"TaxNumberTypeState": "None",

					"CFOPCategoryMessage": "",
					"CFOPCategoryState": "None",

					"ICMSLawMessage": "",
					"ICMSLawState": "None",

					"IPILawMessage": "",
					"IPILawState": "None",
					"VatKeyStateFrag": "None",
					"VatCountKeyFrag": "",
					"VatCountDescFrag": "",
					"VatNumStateFrag": "None",
					"VatNumFrag": "",

					"UiAddressValidated": true,
					"Tax1State": "None",
					"Tax1Message": " ",
					"Tax2State": "None",
					"Tax2Message": " ",
					"Tax3State": "None",
					"Tax3Message": " ",
					"Tax4State": "None",
					"Tax4Message": " ",
					"Tax5State": "None",
					"Tax5Message": " ",
					"VatCountryViewState": "None",
					"VatCountryViewMessage": " ",
					"VatNumViewState": "None",
					"VatNumViewMessage": " ",

					"NaturalPerState": "None",
					"NaturalPerMessage": " ",
					"salesPurchase_TaxState": "None",
					"salesPurchase_TaxMessage": " ",
					"Equalization_TaxState": "None",
					"Equalization_TaxMessage": " ",
					"ICMS_ExemptState": "None",
					"ICMS_ExemptMessage": " ",
					"IPI_ExemptState": "None",
					"IPI_ExemptMessage": " "
				};
				var additionalVats = TaxData.VAT.results.splice(1);
				var vatDataSet = this.getView().getModel("vatDataSet").getData();
				for (var i = 0; i < additionalVats.length; i++) {
					for (var j = 0; j < vatDataSet.NAVTAXCOUNTRY.length; j++) {
						if (vatDataSet.NAVTAXCOUNTRY[j].Land1 === additionalVats[i].Country) {
							var countryName = vatDataSet.NAVTAXCOUNTRY[j].Landx;
							break;
						}
					}
					model.getData().TaxData.AdditionalVats.push({
						"VatCountKey": additionalVats[i].Country,
						"VatCountDesc": countryName, // additionalVats[i].Country,
						"VatNum": additionalVats[i].Number
					});
				}
				this.getView().getModel("CreateModelSet").refresh();
			}
		},

		bindCustomerClassification: function() {
			var BusinessPartnerData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0];
			var CustomerClassificationModel = this.getView().getModel("CreateModelSet").getData().CustomerClassification;
			var CustomerClassification = BusinessPartnerData.CustomerClassification.results[0];
			CustomerClassificationModel.Account_Type = CustomerClassification.AccountType;
			CustomerClassificationModel.IndustryClassification_1 = CustomerClassification.indstryClsfnL1Rowid;
			CustomerClassificationModel.IndustryClassification_2 = CustomerClassification.indstryClsfnL2Rowid;
			CustomerClassificationModel.Banner = CustomerClassification.cusBannerRowid;
			CustomerClassificationModel.IndirectCustomer_Type = CustomerClassification.IndirectCustomerType;
			CustomerClassificationModel.BusinessActivity_Type = CustomerClassification.cusBsnsActvtyRowid;
			CustomerClassificationModel.Organization_Level = CustomerClassification.orgLvlRowid;
			CustomerClassificationModel.AccountLegal_Status = CustomerClassification.legalClassRowid;
			CustomerClassificationModel.CommercialDeal_To = JSON.parse(CustomerClassification.CommercialDeal_to);
			CustomerClassificationModel.ServiceDeal_To = JSON.parse(CustomerClassification.ServiceDeal_to);
			CustomerClassificationModel.Store = JSON.parse(CustomerClassification.Store);
			CustomerClassificationModel.UiAddressValidated = true;

			this.getView().getModel("CreateModelSet").refresh();
		},

		bindExternalIdentifier: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				var BusinessPartnerData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0];
				var ExternalIdentifierModel = this.getView().getModel("CreateModelSet").getData().ExternalIdentifer;
				var ExternalIdentifier = BusinessPartnerData.External_Identifier.results[0];
				ExternalIdentifierModel.ExternalIdenitir = [];
				ExternalIdentifierModel.TotalExternalIdent = ExternalIdentifier.ExternalIdentifier.results.length;
				ExternalIdentifierModel.ChamberOf_Commerce = ExternalIdentifier.ChamberOfCommerce;
				ExternalIdentifierModel.DUNS = ExternalIdentifier.DUNS;
				var externalIdentifierSet = this.getView().getModel("externalIdentifierSet").getData();
				for (var i = 0; i < ExternalIdentifier.ExternalIdentifier.results.length; i++) {
					if (ExternalIdentifier.ExternalIdentifier.results[i].identifierTypeRowid !== this.DunsUniqRowId && ExternalIdentifier.ExternalIdentifier
						.results[i].identifierTypeRowid !== this.ChemOfCommsRowId) {
						for (var j = 0; j < externalIdentifierSet.ExtIdentifier.length; j++) {
							if (externalIdentifierSet.ExtIdentifier[j].rowidObject === ExternalIdentifier.ExternalIdentifier.results[i].identifierTypeRowid) {
								var externalIdentifierType = externalIdentifierSet.ExtIdentifier[j].type;
								break;
							}
						}
						ExternalIdentifierModel.ExternalIdenitir.push({
							"ExterIdtType": ExternalIdentifier.ExternalIdentifier.results[i].identifierTypeRowid,
							"ExterIdtTypeDesc": externalIdentifierType,
							"ExtIdntValue": ExternalIdentifier.ExternalIdentifier.results[i].ExternalIdentifierValue
						});
					} else {
						ExternalIdentifierModel.TotalExternalIdent = ExternalIdentifierModel.TotalExternalIdent - 1;
					}
				}
				this.getView().getModel("CreateModelSet").refresh();
			}
		},

		bindCustomerData: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				this.bindGeneralData();
				this.bindBankData();
				this.bindUnloadingPoints();
			}
		},
		bindContactDetails: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				this.bindCompanyContactDetail();
				this.bindContactPersons();
			}
		},

		bindAccountingTabDataModel: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				if (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData.results[0] !== undefined) {
					this.bindAccountManagement();
					this.bindPaymentData();
					this.bindCorrespondence();
				}
			}
		},

		bindAccountManagement: function() {
			var AccountManagementData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData.results[0].AccountManagement
				.results[0];
			var AccountManagement = this.getView().getModel("AccountingDataModelSet").getData().AccountManagement;
			AccountManagement.ReconAccount = AccountManagementData.Recon_Account;
			AccountManagement.HeadOffice = AccountManagementData.Head_Office;
			AccountManagement.SortKey = AccountManagementData.Sort_Key;
			AccountManagement.PrevAcctNo = AccountManagementData.Prev_Acct_No;
			AccountManagement.BuyingGroup = AccountManagementData.Buying_Group;
			this.getView().getModel("AccountingDataModelSet").getData().AccountingDataTab.AccountingDataTabVisible = true;
			this.getView().getModel("AccountingDataModelSet").refresh();
		},

		bindPaymentData: function() {
			var PaymentData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData.results[0].PaymentData
				.results[0];
			var PaymentDataModel = this.getView().getModel("AccountingDataModelSet").getData().PaymentData;
			PaymentDataModel.terms_of_payment = PaymentData.Terms_Of_Payment;
			PaymentDataModel.Creditmemopaytterm = PaymentData.Credit_Memo_Payment_Term;
			PaymentDataModel.Bechangespaytterm = PaymentData.B_E_Changes_Payment_Term;
			PaymentDataModel.ToleranceGroup = PaymentData.Tolerance_Group;
			PaymentDataModel.PaymentMethods = PaymentData.Payment_Methods;
			PaymentDataModel.HouseBank = PaymentData.House_Bank;
			PaymentDataModel.SelectionRule = PaymentData.Selection_Rule;
			PaymentDataModel.PaymentHistoryRecord = JSON.parse(PaymentData.Payment_History_Record);
			var PaymentTerms = this.getView().getModel("AccountingDataModelSet").getData().PaymentTerms;
			PaymentTerms.terms_of_payment = PaymentData.Terms_Of_Payment;
			this.getView().getModel("AccountingDataModelSet").refresh();
		},

		bindCorrespondence: function() {
			var Correspondence = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData.results[0].Correspondence
				.results[0];
			var CorrespondenceData = this.getView().getModel("AccountingDataModelSet").getData().Correspondence;
			CorrespondenceData.DunnProcedure = Correspondence.Dunn_Procedure;
			CorrespondenceData.LastDunned = Formatter.readLastDunnedDateApproval(Correspondence.Last_Dunned); //Correspondence.Last_Dunned;
			CorrespondenceData.DunningClerk = Correspondence.Dunning_Clerk;
			CorrespondenceData.DunningBlock = Correspondence.Dunning_Block;
			CorrespondenceData.DunningLevel = Correspondence.Dunning_Level;
			CorrespondenceData.DunningArea = Correspondence.Dunning_Area;
			CorrespondenceData.ClerkAbbrev = Correspondence.Clerk_Abbrev;
			CorrespondenceData.AcctAtCust = Correspondence.Acct_At_Cust;
			CorrespondenceData.CustomerUser = Correspondence.Customer_User;
			CorrespondenceData.ClerksInternet = Correspondence.Clerks_Internet;
			CorrespondenceData.AccountStatement = Correspondence.Account_Statement;
			this.getView().getModel("AccountingDataModelSet").refresh();
		},

		bindSalesData: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				if (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].SalesOrder.results[0] !== undefined) {
					this.bindSalesOrder();
					this.bindShipping();
					this.bindBillingDocument();
					// this.bindTaxClassification(SalesData.results[0].BillingDocument.results[0].TaxClassifications);
					// this.createPartnerFunctions(SalesData.results[0].PartnerFunctions);
					this.bindAdditionalFields();
				}
			}
		},

		bindSalesOrder: function() {
			var SalesOrderData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].SalesOrder;
			var SalesOrder = this.getView().getModel("SalesDataSet").getData().SalesOrder;
			SalesOrder.SalesDistrict = SalesOrderData.results[0].SalesDistrict;
			SalesOrder.SalesOffice = SalesOrderData.results[0].SalesOffice;
			SalesOrder.SalesGroup = SalesOrderData.results[0].SalesGroup;
			SalesOrder.CustomerGroup = SalesOrderData.results[0].CustomerGroup;
			SalesOrder.Currency = SalesOrderData.results[0].Currency;
			SalesOrder.AcctAtCust = SalesOrderData.results[0].AcctAtCust;
			SalesOrder.ExchangeRateType = SalesOrderData.results[0].ExchRateType;
			SalesOrder.PriceGroup = SalesOrderData.results[0].PriceGroup;
			SalesOrder.CustPricProc = SalesOrderData.results[0].CustPricProc;
			SalesOrder.PriceList = SalesOrderData.results[0].PriceList;
			SalesOrder.CustStatGrp = SalesOrderData.results[0].CustStatsGrp;
			this.getView().getModel("SalesDataSet").refresh();
		},

		bindShipping: function() {
			var ShippingData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].Shipping;
			var Shipping = this.getView().getModel("SalesDataSet").getData().Shipping;
			Shipping.DeliveryPriority = ShippingData.results[0].DeliveryPriority;
			Shipping.ShippingConditions = ShippingData.results[0].ShippingConditions;
			Shipping.DeliveryPlant = ShippingData.results[0].DeliveringPlant;
			Shipping.OrderCombination = JSON.parse(ShippingData.results[0].OrderCombination);
			Shipping.RelevantforProd = JSON.parse(ShippingData.results[0].RelevantForPod);
			Shipping.ProductionTimeFrame = ShippingData.results[0].PodTimeframe;
			Shipping.CompleteDeliveryRequired = JSON.parse(ShippingData.results[0].CompleteDeliveryRequired);
			Shipping.PartialDeliveryPerItem = ShippingData.results[0].PartialDeliveryPerItem;
			Shipping.MaxPartialDeliveries = ShippingData.results[0].MaxPartialDeliveries;
			this.getView().getModel("SalesDataSet").refresh();
		},

		bindBillingDocument: function() {
			var BillingDocumentData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].BillingDocument;
			var BillingDocument = this.getView().getModel("SalesDataSet").getData().BillingDocument;
			BillingDocument.Rebate = JSON.parse(BillingDocumentData.results[0].Rebate);
			BillingDocument.PriceDetermination = JSON.parse(BillingDocumentData.results[0].PriceDetermination);
			BillingDocument.InvoiceDates = BillingDocumentData.results[0].InvoiceDates;
			BillingDocument.InvoiceListDates = BillingDocumentData.results[0].InvoiceListDates;
			BillingDocument.Incoterms1 = BillingDocumentData.results[0].Incoterms1;
			BillingDocument.Incoterms2 = BillingDocumentData.results[0].Incoterms2;
			BillingDocument.TermsofPayment = BillingDocumentData.results[0].TermsOfPayment;
			BillingDocument.AccountAssignmentGroup = BillingDocumentData.results[0].AcctAssgmtGroup;
			this.getView().getModel("SalesDataSet").refresh();
			// this.bindTaxClassification(BillingDocumentData.results[0].TaxClassifications);
		},

		bindTaxClassification: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				if (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].BillingDocument
					.results[0] !== undefined) {
					var TaxClassificationsData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].BillingDocument
						.results[0].TaxClassifications;
					if (TaxClassificationsData.results.length > 0) {
						var TaxClassifications = this.getView().getModel("TaxClassificationComboSet").getData().results.d.results;
						for (var i = 0; i < TaxClassifications.length; i++) {
							TaxClassifications[i].Taxclassification = TaxClassificationsData.results[i].TaxClassification;
						}
						this.getView().getModel("TaxClassificationComboSet").refresh();
					}
				}
			}
		},

		bindDefaultPartnerFunctions: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				var PartnerFunctions = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].PartnerFunctions.results;
				var DefaultPartnerFunction = this.getView().getModel("DefaultGeneratedPartnerFnSet").getData().results.d.results;
				for (var i = 0; i < DefaultPartnerFunction.length; i++) {
					for (var j = 0; j < PartnerFunctions.length; j++) {
						if (PartnerFunctions[j].PartnerFunctionSection === "D" && DefaultPartnerFunction[i].PartnerFunction === PartnerFunctions[j].PartnerFunction) {
							DefaultPartnerFunction[i].Number = PartnerFunctions[j].Number;
							DefaultPartnerFunction[i].Name = PartnerFunctions[j].Name;
							DefaultPartnerFunction[i].PartnerDescription = PartnerFunctions[j].PartnerDescription;
							DefaultPartnerFunction[i].Default = JSON.parse(PartnerFunctions[j].Default);
						}
					}
				}
				this.getView().getModel("DefaultGeneratedPartnerFnSet").refresh();
			}
		},

		bindOtherPartnerFunctions: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				var PartnerFunctions = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].PartnerFunctions.results;
				var OtherPartnerFunctions = [];
				for (var i = 0; i < PartnerFunctions.length; i++) {
					if (PartnerFunctions[i].PartnerFunctionSection === "O") {
						OtherPartnerFunctions.push({
							PartnerFunction: PartnerFunctions[i].PartnerFunction,
							PartnerDescription: PartnerFunctions[i].PartnerDescription,
							Number: PartnerFunctions[i].Number,
							Name: PartnerFunctions[i].Name,
							PartnerDescriptionText: PartnerFunctions[i].PartnerDescription,
							Default: JSON.parse(PartnerFunctions[i].Default),

							PartFunState: "None",
							PartFunMessage: " ",

							NumState: "None",
							NumMessage: " ",

							NameState: "None",
							NameMessage: "",

							PartDescState: "None",
							PartDescMessage: "",

							DefaultState: "None",
							DefaultMessage: ""
						});

					}

				}
				this.getView().getModel("OtherPartnerFunctionSet").getData().OtherPartnerFunctions = OtherPartnerFunctions;
				this.getView().getModel("OtherPartnerFunctionSet").refresh();
			}
		},

		bindSoldtoPartnerFunctions: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				var PartnerFunctions = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].PartnerFunctions.results;
				var SoldtoPartnerFunctions = [];
				for (var i = 0; i < PartnerFunctions.length; i++) {
					if (PartnerFunctions[i].PartnerFunctionSection === "L") {
						SoldtoPartnerFunctions.push({
							PartnerFunction: PartnerFunctions[i].PartnerFunction,
							PartnerDescription: PartnerFunctions[i].PartnerDescription,
							Number: PartnerFunctions[i].Number,
							Name: PartnerFunctions[i].Name,
							PartnerDescriptionText: PartnerFunctions[i].PartnerDescription,
							Default: JSON.parse(PartnerFunctions[i].Default),

							PartFunState: "None",
							PartFunMessage: " ",

							NumState: "None",
							NumMessage: " ",

							NameState: "None",
							NameMessage: "",

							PartDescState: "None",
							PartDescMessage: "",

							DefaultState: "None",
							DefaultMessage: ""
						});

					}

				}
				this.getView().getModel("SoldtoPartnerFunctionSet").getData().SoldtoPartnerFunctions = SoldtoPartnerFunctions;
				this.getView().getModel("SoldtoPartnerFunctionSet").refresh();
			}
		},

		bindAdditionalFields: function() {
			var AdditionalFieldsData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].AdditionalFields;
			var AdditionalFields = this.getView().getModel("SalesDataSet").getData().AdditionalFields;
			AdditionalFields.CustomerGroup1 = AdditionalFieldsData.results[0].CustomerGroup1;
			AdditionalFields.CustomerGroup2 = AdditionalFieldsData.results[0].CustomerGroup2;
			AdditionalFields.CustomerGroup3 = AdditionalFieldsData.results[0].CustomerGroup3;
			AdditionalFields.CustomerGroup4 = AdditionalFieldsData.results[0].CustomerGroup4;
			AdditionalFields.CustomerGroup5 = AdditionalFieldsData.results[0].CustomerGroup5;
			AdditionalFields.CustomerGroup6 = AdditionalFieldsData.results[0].CustomerGroup6;
			this.getView().getModel("SalesDataSet").refresh();
		},

		bindCompanyContactDetail: function() {
			this.bindTelephoneList();
			this.bindFaxList();
			this.bindEmailList();
			this.bindURLList();
			this.bindTeleboxNumber();
		},
		bindContactPersons: function() {
			var ContactPersons = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].ContactPersons;
			var ContactPersonsData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.ContactPerson;
			if (ContactPersons.results.length > 0) {
				ContactPersonsData.ContactPersonList = [];
				for (var i = 0; i < ContactPersons.results.length; i++) {
					if (i === 0) {
						var VisibleBasedOnNext = true;
					} else {
						VisibleBasedOnNext = false;
					}
					ContactPersonsData.ContactPersonList.push({
						"LastName": ContactPersons.results[i].Last_Name,
						"FirstName": ContactPersons.results[i].First_Name,
						"Language": ContactPersons.results[i].Language,
						"Function": ContactPersons.results[i].Function,
						"Department": ContactPersons.results[i].Department,
						"Telephone": ContactPersons.results[i].Telephone,
						"TelephoneExtension": ContactPersons.results[i].Telephone_Extension,
						"Fax": ContactPersons.results[i].Fax,
						"FaxExtension": ContactPersons.results[i].Fax_Extension,
						"MobilePhone": ContactPersons.results[i].Mobile_Phone,
						"Email": ContactPersons.results[i].Email,
						// "EmailValueState": "None",
						// "EmailValueStateText": "",
						"Notes": ContactPersons.results[i].Notes,
						"Method": ContactPersons.results[i].Method,
						"TotalCount": (i + 1) + " of " + (ContactPersons.results.length),
						"VisibleBasedOnNext": VisibleBasedOnNext,

						"LastNameState": "None",
						"LastNameMessage": " ",

						"FunctionState": "None",
						"FunctionMessage": " ",

						"TelephoneState": "None",
						"TelephoneMessage": " ",

						"FaxState": "None",
						"FaxMessage": " ",

						"MobilePhoneState": "None",
						"MobilePhoneMessage": " ",

						"EmailValueState": "None",
						"EmailValueStateText": "",

						"MethodState": "None",
						"MethodStateText": "",

						"FirstNameState": "None",
						"FirstNameMessage": " ",

						"DepartmentState": "None",
						"DepartmentMessage": " ",

						"TelepExtensionState": "None",
						"TelepExtensionMessage": " ",

						"FaxExtensionState": "None",
						"FaxExtensionMessage": " ",

						"NotesState": "None",
						"NotesMessage": " ",

						"LanguageState": "None",
						"LanguageMessage": " "
					});
				}

				this.getView().getModel("ContactDetailsSet").refresh();
			}
		},

		bindTeleboxNumber: function() {
			var TeleboxNumber = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
				.results[0].Telebox_Number;
			var Telebox = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telebox;
			Telebox.TeleboxNO = TeleboxNumber.results[0].Telebox_Number;
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		bindTelephoneList: function() {
			var TelephoneSegment = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
				.results[0].Telephone_Segment;
			var TelephoneData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Telephone;
			for (var i = 0; i < TelephoneSegment.results.length; i++) {
				if (TelephoneSegment.results[i].Default === "true") {
					TelephoneData.TotalTelephone = TelephoneSegment.results.length;
					TelephoneData.Telephone = TelephoneSegment.results[i].Telephone;
					TelephoneData.Extension = TelephoneSegment.results[i].Extension;
					TelephoneData.Comments = TelephoneSegment.results[i].Comments;
					TelephoneData.Default = JSON.parse(TelephoneSegment.results[i].Default);
					if (TelephoneSegment.results.length > 1) {
						TelephoneData.TelephoneEditable = false;
						TelephoneData.ExtensionEditable = false;
						TelephoneData.CommentsEditable = false;
					}
					// "TelephoneFrag": "",
					// "ExtensionFrag": "",
					// "CommentsFrag": "",
					// "TelephoneValueState": "None",
					// "TelephoneExtensionValueState": "None"
				}
				TelephoneData.TelephoneList.push({
					Telephone: TelephoneSegment.results[i].Telephone,
					Extension: TelephoneSegment.results[i].Extension,
					Comments: TelephoneSegment.results[i].Comments,
					Default: JSON.parse(TelephoneSegment.results[i].Default)
				});
			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		bindFaxList: function() {
			var FaxSegment = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
				.results[0].Fax_Segment;
			var FaxData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Fax;
			for (var i = 0; i < FaxSegment.results.length; i++) {
				if (FaxSegment.results[i].Default === "true") {
					FaxData.TotalFax = FaxSegment.results.length;
					FaxData.Fax = FaxSegment.results[i].Fax;
					FaxData.Extension = FaxSegment.results[i].Extension;
					FaxData.Comments = FaxSegment.results[i].Comments;
					FaxData.Default = JSON.parse(FaxSegment.results[i].Default);
					if (FaxSegment.results.length > 1) {
						FaxData.FaxEditable = false;
						FaxData.ExtensionEditable = false;
						FaxData.CommentsEditable = false;
					}
					// "FaxFrag": "",
					// "ExtensionFrag": "",
					// "CommentsFrag": "",
					// "FaxValueState": "None",
					// "FaxExtensionValueState": "None"
				}
				FaxData.FaxList.push({
					Fax: FaxSegment.results[i].Fax,
					Extension: FaxSegment.results[i].Extension,
					Comments: FaxSegment.results[i].Comments,
					Default: JSON.parse(FaxSegment.results[i].Default)
				});
			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},

		bindEmailList: function() {
			var EmailSegment = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
				.results[0].Email_Segment;
			var EmailData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.Email;
			for (var i = 0; i < EmailSegment.results.length; i++) {
				if (EmailSegment.results[i].Default === "true") {
					EmailData.TotalEmail = EmailSegment.results.length;
					EmailData.Email = EmailSegment.results[i].Email;
					EmailData.Extension = EmailSegment.results[i].Extension;
					EmailData.Comments = EmailSegment.results[i].Comments;
					EmailData.Default = JSON.parse(EmailSegment.results[i].Default);
					if (EmailSegment.results.length > 1) {
						EmailData.EmailEditable = false;
						EmailData.CommentsEditable = false;
					}
					// "EmailFrag": "",
					// "ExtensionFrag": "",
					// "CommentsFrag": "",
					// "EmailValueState": "None",
					// "EmailExtensionValueState": "None"
				}
				EmailData.EmailList.push({
					Email: EmailSegment.results[i].Email,
					Extension: EmailSegment.results[i].Extension,
					Comments: EmailSegment.results[i].Comments,
					Default: JSON.parse(EmailSegment.results[i].Default)
				});
			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},
		bindURLList: function() {
			var URLSegment = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
				.results[0].URL_Segment;
			var URLData = this.getView().getModel("ContactDetailsSet").getData().ContactDetails.URL;
			for (var i = 0; i < URLSegment.results.length; i++) {
				if (URLSegment.results[i].Default === "true") {
					URLData.TotalURL = URLSegment.results.length;
					URLData.URL = URLSegment.results[i].URL;
					URLData.Extension = URLSegment.results[i].Extension;
					URLData.Comments = URLSegment.results[i].Comments;
					URLData.Default = JSON.parse(URLSegment.results[i].Default);
					if (URLSegment.results.length > 1) {
						URLData.URLEditable = false;
						URLData.CommentsEditable = false;
					}
					// "URLFrag": "",
					// "ExtensionFrag": "",
					// "CommentsFrag": "",
					// "URLValueState": "None",
					// "URLExtensionValueState": "None"
				}
				URLData.URLList.push({
					URL: URLSegment.results[i].URL,
					Extension: URLSegment.results[i].Extension,
					Comments: URLSegment.results[i].Comments,
					Default: JSON.parse(URLSegment.results[i].Default)
				});
			}
			this.getView().getModel("ContactDetailsSet").refresh();
		},
		bindGeneralData: function() {
			var GeneralData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData.results[0].GeneralData;
			var GenData = this.getView().getModel("CustomerDataSet").getData().GenData;
			GenData.AltBusiName = GeneralData.results[0].AlternateBusinessName;
			GenData.SearchTearm1 = GeneralData.results[0].SearchTerm1;
			GenData.SearchTearm2 = GeneralData.results[0].SearchTerm2;
			GenData.CommuLang = GeneralData.results[0].CommunicationLanguage;
			GenData.AuthoGrp = GeneralData.results[0].AuthorizationGroup;
			GenData.VendNum = GeneralData.results[0].VendorNumber;
			GenData.TranspoZone = GeneralData.results[0].TransportationZone;
			GenData.AltTranspoZone = GeneralData.results[0].AlternateTransportationZone;
			GenData.RegStructGrp = GeneralData.results[0].Reg_Struct_Group;
			GenData.GroupKey = GeneralData.results[0].GroupKey;
			GenData.TradingPartner = GeneralData.results[0].Trading_Partner;
			GenData.MainlyCivilianUsg = JSON.parse(GeneralData.results[0].MainlyCivilianUsage);
			GenData.MainlyMailitaryUsg = JSON.parse(GeneralData.results[0].MainlyMilitaryUsage);
			GenData.UiCustGenDataValidated = false;
			GenData.LocationNo1 = GeneralData.results[0].Location_No1;
			GenData.LocationNo2 = GeneralData.results[0].Location_No2;
			GenData.CheckDegit = GeneralData.results[0].CheckDigit;
			this.getView().getModel("CustomerDataSet").refresh();

		},
		bindBankData: function() {
			var BankData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData.results[0].BankData;
			var BankDetailsData = this.getView().getModel("CustomerDataSet").getData().BankDetails;
			BankDetailsData.AlternPayer = BankData.AlternativePayer;
			BankDetailsData.IndivEnteris = JSON.parse(BankData.IndividualEntries);
			BankDetailsData.AllowedPayer = BankData.AllowedPayer;
			if (BankData.BankDetails.results.length > 0) {
				BankDetailsData.BankIBan = [];
				for (var i = 0; i < BankData.BankDetails.results.length; i++) {
					if (i === 0) {
						var VisibleBasedOnNext = true;
					} else {
						VisibleBasedOnNext = false;
					}
					BankDetailsData.BankIBan.push({
						IBan: BankData.BankDetails.results[i].IBAN,
						Country: BankData.BankDetails.results[i].Country,
						BankKey: BankData.BankDetails.results[i].BankKey,
						BankControlKey: BankData.BankDetails.results[i].BankControlKey,
						BankAccount: BankData.BankDetails.results[i].BankAccount,
						BankAccHolder: BankData.BankDetails.results[i].BankAccountHolder,
						BankType: BankData.BankDetails.results[i].BankType,
						RefDetails: BankData.BankDetails.results[i].ReferenceDetails,
						IBanEnabled: true,
						BankDetailsEnabled: true,
						CollectionAuth: false,
						TotalCount: (i + 1) + " of " + (BankData.BankDetails.results.length),
						VisibleBasedOnNext: VisibleBasedOnNext,
						IBanValState: "None",
						CountryValState: "None",
						BankKeyValState: "None",
						BankControlKeyValState: "None",
						BankAccountValState: "None",
						BankAccHolderValState: "None",
						BankTypeValState: "None",
						RefDetailsValState: "None",
						CollectionAuthValState: "None"
					});
				}
			}
			this.getView().getModel("CustomerDataSet").refresh();

		},
		bindUnloadingPoints: function() {
			var UnloadingPoints = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData.results[0].UnloadingPoints;
			var CustomerDataModel = this.getView().getModel("CustomerDataSet");
			if (UnloadingPoints.results.length > 0) {
				CustomerDataModel.getData().UnloadingPoint = {};
				CustomerDataModel.getData().UnloadingPoint.UnloadPointArr = [];
				for (var i = 0; i < UnloadingPoints.results.length; i++) {
					if (i === 0) {
						var VisibleBasedOnNext = true;
					} else {
						VisibleBasedOnNext = false;
					}
					var GoodsReceivingHours = UnloadingPoints.results[i].GoodsReceivingHours_24Hrs_Notion.results[0];
					CustomerDataModel.getData().UnloadingPoint.UnloadPointArr.push({
						UnloadPoint: UnloadingPoints.results[i].UnloadPoint,
						GoodsRecHrs: UnloadingPoints.results[i].GoodsReceivingHours,
						Default: JSON.parse(UnloadingPoints.results[i].Default),
						CalenderKey: UnloadingPoints.results[i].CalendarKey,
						UnloadPointState: "None",
						UnloadPointMessage: " ",
						GoodsRecHrsState: "None",
						GoodsRecHrsMessage: " ",
						DefaultState: "None",
						DefaultMessage: " ",
						CalenderKeyState: "None",
						CalenderKeyMessage: " ",
						TotalCount: (i + 1) + " of " + (UnloadingPoints.results.length),
						VisibleBasedOnNext: VisibleBasedOnNext,
						DayTable: [{
							Morningopen: new Date(0, 0, 0, GoodsReceivingHours.Monday.Morning.Open.substring(0, 2), GoodsReceivingHours.Monday.Morning
								.Open.substring(3, 5)),
							Morningclose: new Date(0, 0, 0, GoodsReceivingHours.Monday.Morning.Close.substring(0, 2), GoodsReceivingHours.Monday.Morning
								.Close.substring(3, 5)),
							Afternoonopen: new Date(0, 0, 0, GoodsReceivingHours.Monday.Afternoon.Open.substring(0, 2), GoodsReceivingHours.Monday.Afternoon
								.Open.substring(3, 5)),
							Afternoonclose: new Date(0, 0, 0, GoodsReceivingHours.Monday.Afternoon.Close.substring(0, 2), GoodsReceivingHours.Monday.Afternoon
								.Close.substring(3, 5)),
							Weekday: "Monday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false
						}, {
							Morningopen: new Date(0, 0, 0, GoodsReceivingHours.Tuesday.Morning.Open.substring(0, 2), GoodsReceivingHours.Tuesday.Morning
								.Open.substring(3, 5)),
							Morningclose: new Date(0, 0, 0, GoodsReceivingHours.Tuesday.Morning.Close.substring(0, 2), GoodsReceivingHours.Tuesday.Morning
								.Close.substring(3, 5)),
							Afternoonopen: new Date(0, 0, 0, GoodsReceivingHours.Tuesday.Afternoon.Open.substring(0, 2), GoodsReceivingHours.Tuesday.Afternoon
								.Open.substring(3, 5)),
							Afternoonclose: new Date(0, 0, 0, GoodsReceivingHours.Tuesday.Afternoon.Close.substring(0, 2), GoodsReceivingHours.Tuesday
								.Afternoon
								.Close.substring(3, 5)),
							Weekday: "Tuesday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false
						}, {
							Morningopen: new Date(0, 0, 0, GoodsReceivingHours.Wednesday.Morning.Open.substring(0, 2), GoodsReceivingHours.Wednesday.Morning
								.Open.substring(3, 5)),
							Morningclose: new Date(0, 0, 0, GoodsReceivingHours.Wednesday.Morning.Close.substring(0, 2), GoodsReceivingHours.Wednesday
								.Morning
								.Close.substring(3, 5)),
							Afternoonopen: new Date(0, 0, 0, GoodsReceivingHours.Wednesday.Afternoon.Open.substring(0, 2), GoodsReceivingHours.Wednesday
								.Afternoon
								.Open.substring(3, 5)),
							Afternoonclose: new Date(0, 0, 0, GoodsReceivingHours.Wednesday.Afternoon.Close.substring(0, 2), GoodsReceivingHours.Wednesday
								.Afternoon
								.Close.substring(3, 5)),
							Weekday: "Wednesday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false
						}, {
							Morningopen: new Date(0, 0, 0, GoodsReceivingHours.Thursday.Morning.Open.substring(0, 2), GoodsReceivingHours.Thursday.Morning
								.Open.substring(3, 5)),
							Morningclose: new Date(0, 0, 0, GoodsReceivingHours.Thursday.Morning.Close.substring(0, 2), GoodsReceivingHours.Thursday.Morning
								.Close.substring(3, 5)),
							Afternoonopen: new Date(0, 0, 0, GoodsReceivingHours.Thursday.Afternoon.Open.substring(0, 2), GoodsReceivingHours.Thursday
								.Afternoon
								.Open.substring(3, 5)),
							Afternoonclose: new Date(0, 0, 0, GoodsReceivingHours.Thursday.Afternoon.Close.substring(0, 2), GoodsReceivingHours.Thursday
								.Afternoon
								.Close.substring(3, 5)),
							Weekday: "Thursday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false
						}, {
							Morningopen: new Date(0, 0, 0, GoodsReceivingHours.Friday.Morning.Open.substring(0, 2), GoodsReceivingHours.Friday.Morning
								.Open.substring(3, 5)),
							Morningclose: new Date(0, 0, 0, GoodsReceivingHours.Friday.Morning.Close.substring(0, 2), GoodsReceivingHours.Friday.Morning
								.Close.substring(3, 5)),
							Afternoonopen: new Date(0, 0, 0, GoodsReceivingHours.Friday.Afternoon.Open.substring(0, 2), GoodsReceivingHours.Friday.Afternoon
								.Open.substring(3, 5)),
							Afternoonclose: new Date(0, 0, 0, GoodsReceivingHours.Friday.Afternoon.Close.substring(0, 2), GoodsReceivingHours.Friday.Afternoon
								.Close.substring(3, 5)),
							Weekday: "Friday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false
						}, {
							Morningopen: new Date(0, 0, 0, GoodsReceivingHours.Saturday.Morning.Open.substring(0, 2), GoodsReceivingHours.Saturday.Morning
								.Open.substring(3, 5)),
							Morningclose: new Date(0, 0, 0, GoodsReceivingHours.Saturday.Morning.Close.substring(0, 2), GoodsReceivingHours.Saturday.Morning
								.Close.substring(3, 5)),
							Afternoonopen: new Date(0, 0, 0, GoodsReceivingHours.Saturday.Afternoon.Open.substring(0, 2), GoodsReceivingHours.Saturday
								.Afternoon
								.Open.substring(3, 5)),
							Afternoonclose: new Date(0, 0, 0, GoodsReceivingHours.Saturday.Afternoon.Close.substring(0, 2), GoodsReceivingHours.Saturday
								.Afternoon
								.Close.substring(3, 5)),
							Weekday: "Saturday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false
						}, {
							Morningopen: new Date(0, 0, 0, GoodsReceivingHours.Sunday.Morning.Open.substring(0, 2), GoodsReceivingHours.Sunday.Morning
								.Open.substring(3, 5)),
							Morningclose: new Date(0, 0, 0, GoodsReceivingHours.Sunday.Morning.Close.substring(0, 2), GoodsReceivingHours.Sunday.Morning
								.Close.substring(3, 5)),
							Afternoonopen: new Date(0, 0, 0, GoodsReceivingHours.Sunday.Afternoon.Open.substring(0, 2), GoodsReceivingHours.Sunday.Afternoon
								.Open.substring(3, 5)),
							Afternoonclose: new Date(0, 0, 0, GoodsReceivingHours.Sunday.Afternoon.Close.substring(0, 2), GoodsReceivingHours.Sunday.Afternoon
								.Close.substring(3, 5)),
							Weekday: "Sunday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false
						}]

					});

				}
				this.getView().getModel("CustomerDataSet").refresh();
			}
		},

		bindStatusData: function() {
			if (this.resubmitScenario === true || this.reviewScenario === true) {
				var StatusData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.StatusData;
				var StatusDataSet = this.getView().getModel("StatusDetailsSet").getData();
				StatusDataSet.DeletionFlag.DeletionFlagGeneric = JSON.parse(StatusData.results[0].DeletionFlag.DeletionFlagGeneric);
				StatusDataSet.DeletionFlag.DeletionFlagAccounting = JSON.parse(StatusData.results[0].DeletionFlag.DeletionFlagAccounting);
				StatusDataSet.DeletionFlag.DeletionFlagSales = JSON.parse(StatusData.results[0].DeletionFlag.DeletionFlagSales);

				StatusDataSet.BlockData.PostingBlock = JSON.parse(StatusData.results[0].BlockData.PostingBlock);
				StatusDataSet.BlockData.OrderBlock = StatusData.results[0].BlockData.OrderBlock;
				StatusDataSet.BlockData.DeliveryBlock = StatusData.results[0].BlockData.DeliveryBlock;
				StatusDataSet.BlockData.BillingBlock = StatusData.results[0].BlockData.BillingBlock;
				StatusDataSet.BlockData.BlockSalesReport = JSON.parse(StatusData.results[0].BlockData.BlockSalesSupport);
				this.getView().getModel("StatusDetailsSet").refresh();
			}
		},

		bindTextNotes: function() {
			if ((this.resubmitScenario === true || this.reviewScenario === true) && (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create
					.TextNotes.results[0] !== undefined)) {
				var TextNotesData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.TextNotes.results[0].Text;
				var TextNotes = this.getView().getModel("TextNotesModelSet").getData().TextNotes.TextNotes2;
				if (TextNotesData.results.length > 0) {
					TextNotes = [];
				}
				for (var i = 0; i < TextNotesData.results.length; i++) {
					var textNotesLevelSet = this.getView().getModel("textNotesLevelSet").getData();
					for (var j = 0; j < textNotesLevelSet.results.length; j++) {
						if (textNotesLevelSet.results[j].Level_Text === TextNotesData.results[i].Level) {
							var TextTypeArray = textNotesLevelSet.results[j].NavTextType.results;
						}
					}
					TextNotes.push({
						"Level": TextNotesData.results[i].Level,
						"Language": TextNotesData.results[i].Language,
						"TextType": TextNotesData.results[i].Text_Type,
						"FreeText": TextNotesData.results[i].Free_Text,
						"TextTypeArray": TextTypeArray
					});
				}
				this.getView().getModel("TextNotesModelSet").getData().TextNotes.TextNotes2 = TextNotes;
				this.getView().getModel("TextNotesModelSet").refresh();
				// this.bindTextClassification();
			}
		},

		bindTextClassification: function() {
			if ((this.resubmitScenario === true || this.reviewScenario === true) && (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create
					.TextNotes.results[0] !== undefined)) {
				var TextClassificationData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.TextNotes.results[0].TextClassification;
				var TextClassification = this.getView().getModel("TextNotesModelSet").getData().Classification.Classification2;
				if (TextClassificationData.results.length > 0) {
					TextClassification = [];
				}
				var ClassiFicationArray = this.getView().getModel("classificationTypeSet").getData().results[0].NavClassification.results;
				var ValueArray = this.getView().getModel("classificationTypeSet").getData().results[0].NavValue.results;
				for (var i = 0; i < TextClassificationData.results.length; i++) {

					TextClassification.push({
						"ClassificationType": TextClassificationData.results[i].Classification_Type,
						"Classification": TextClassificationData.results[i].Classification,
						"Value": TextClassificationData.results[i].Value,
						"ClassificationTypeMessage": "",
						"ClassificationTypeState": "None",
						"ClassificationMessage": "",
						"ClassificationState": "None",
						"ValueMessage": "",
						"ValueState": "None",
						"ClassiFicationArray": ClassiFicationArray,
						"ValueArray": ValueArray
					});
				}
				this.getView().getModel("TextNotesModelSet").getData().Classification.Classification2 = TextClassification;
				this.getView().getModel("TextNotesModelSet").refresh();
			}
		},

		bindUploadedDocuments: function() {
			var UploadDocuments = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.UploadDocuments.results;
			for (var i = 0; i < UploadDocuments.length; i++) {
				var UploadedFiles = UploadDocuments[i].UploadedFiles.results;
				var DocumentUpload = UploadDocuments[i].DocumentUpload.results;
				var tableData = this.getView().getModel("FileUploadSet").getData().results;
				tableData.push({
					"Type": UploadedFiles[0].FileType, //fileMime,
					"FileName": UploadedFiles[0].FileName,
					"Content": DocumentUpload[0].Attachment.results[0].Attachment,
					"Size": JSON.parse(UploadedFiles[0].FileSize),
					"Note": UploadedFiles[0].Note,
					"FullName": UploadedFiles[0].Name_Of_Person,
					"TimeStamp": UploadedFiles[0].TimeStamp,
					"NoteEnabled": false, //this.resubmitScenario === true ? true : false,
					// "DeleteEnabled": sap.ushell.Container.getService("UserInfo").getUser().getFullName() === UploadedFiles[0].Name_Of_Person ? true : false
					"DeleteEnabled": false

				});
				this.getView().getModel("FileUploadSet").refresh();
			}
		},

		bindDuplicateCheckComments: function() {
			var commetModel = new sap.ui.model.json.JSONModel({
				"Comment": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.WorkFlow_Approver_Details.results[0].Duplicate_Check_Comments,
				"CommentMsgState": "None"
			});
			this.getView().setModel(commetModel, "DuplicateCommentModelSet");
		},

		readDistributionChannelAndDivision: function() {
			var that = this;
			var modelHdr = this.getView().getModel("HeaderModelSet").getData();
			var salesArea = this.getView().getModel("SalesAreaComboSet").getData();
			if (modelHdr.SalesOrgKey !== "") {
				for (var i = 0; i < salesArea.results.length; i++) {
					if (salesArea.results[i].salesOrgaization === modelHdr.SalesOrgKey) {
						var data = salesArea.results[i].DISTRIBUTIONCHANNEL.item;
						if (data.length === undefined) {
							var data12 = [];
							data12.push(data);
							data = data12;
						}
						var oODataJSONModel = new sap.ui.model.json.JSONModel({
							"results": data
						});
						oODataJSONModel.setSizeLimit(data.length);
						that.getView().setModel(oODataJSONModel, "DistbChanlComboSet");

						var data1 = salesArea.results[i].DISTRIBUTIONCHANNEL.item.DIVISION.item;
						if (data1.length === undefined) {
							var data123 = [];
							data123.push(data1);
							data1 = data123;
						}
						var oODataJSONModel1 = new sap.ui.model.json.JSONModel({
							"results": data1
						});
						oODataJSONModel1.setSizeLimit(data1.length);
						that.getView().setModel(oODataJSONModel1, "DivisionComboSet");
					}
				}
			} else {
				modelHdr.DistribChnnlKey = "";
				modelHdr.DivisionKey = "";
				var oODataJSONModel11 = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModel11, "DivisionComboSet");

				var oODataJSONModel112 = new sap.ui.model.json.JSONModel({
					"results": []
				});
				this.getView().setModel(oODataJSONModel112, "DistbChanlComboSet");
			}
			// this.getView().getModel("HeaderModelSet").refresh();

			//toast
			//toast message
			// this.showMessageBasedOnHeaderSelection();
			// if (this.getView().getModel("SalesDataSet") !== undefined) {
			// 	this.getView().getModel("SalesDataSet").setData();
			// }
			// if (this.getView().getModel("SalesDataComboSet") !== undefined) {
			// 	this.getView().getModel("SalesDataComboSet").setData();
			// }
			// if (this.getView().getModel("TaxClassificationComboSet") !== undefined) {
			// 	this.getView().getModel("TaxClassificationComboSet").setData();
			// }

		},

		readIndustryClassification2: function() {
			var that = this;
			var oClf1 = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0].CustomerClassification
				.results[0].indstryClsfnL1Rowid;
			if (oClf1 !== "") {
				var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/CUSINDSTRYCLASFL2?filter=cusClsfL1Rowid=' +
					oClf1);
				var oBusyDialog = new sap.m.BusyDialog();
				oBusyDialog.open();
				this.oModel.read(
					"/BusinessPartnerSet", {
						method: "GET",
						filters: [Filter1],
						success: function(oData, oResponse) {
							oBusyDialog.close();
							if (oData.results[0].Response.includes("<h1>Error</h1>")) {
								var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
								that.errMsg(message);
							} else {
								var dataOut = [];
								var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
								if (res !== undefined) {
									if (res.item !== undefined) {
										if (res.item.length === undefined) {
											dataOut = Array(res.item);
										} else {
											dataOut = res.item;
										}
									}
								}

								var oICModel2 = new sap.ui.model.json.JSONModel();
								oICModel2.setData({
									IndustryClassification2: dataOut
								});
								oICModel2.setSizeLimit(dataOut.length);
								that.getView().setModel(oICModel2, "industryClassificationSet2");
							}
						},
						error: function(oError) {
							oBusyDialog.close();
						}
					});
			}
		},

		resubmitRequest: function(payload) {
			this.processApprove(payload);
		},

		cancelRequest: function() {
			var payload = "";
			this.processReject(payload);
		},

		reviewRequest: function() {
			var payload = "";
			if (this.reviewScenario === true && this.approve === true) {
				this.processApprove(payload);
			} else if (this.reviewScenario === true && this.reject === true) {
				this.processReject(payload);
			}
		},

		onApprove: function() {
			this.approve = true;
			this.reject = false;
			this.showCommentDialog();
		},

		onReject: function() {
			this.approve = false;
			this.reject = true;
			this.showCommentDialog();
		},

		onDelete: function() {
			this.deleteRequest = true;
			this.showCommentDialog();
		},
		showCommentDialog: function() {
			if (!this._oValueHelpDialogComment) {
				this._oValueHelpDialogComment = sap.ui.xmlfragment("MDMZCUSTOMER.fragments.SubmitComment", this);
				this.getView().addDependent(this._oValueHelpDialogComment);
			}
			var commetModel = new sap.ui.model.json.JSONModel({
				"Comment": "",
				"CommentState": "None"
			});
			this._oValueHelpDialogComment.setModel(commetModel, "CommentSubmitModelSet");
			this._oValueHelpDialogComment.open();
		},

		processApprove: function(payload) {
			var that = this;
			if (this.reviewScenario === true) {
				this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.WorkFlow_Approver_Details.results[0].ApproverComments = this._oValueHelpDialogComment
					.getModel("CommentSubmitModelSet").getData().Comment;
			} else if (this.resubmitScenario === true) {
				this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.Requestor_Comments = this._oValueHelpDialogComment
					.getModel("CommentSubmitModelSet").getData().Comment;
			}
			var comment = this._oValueHelpDialogComment.getModel("CommentSubmitModelSet").getData().Comment;
			var data = this.createPayload(payload);
			var BusinessPartnerData = {
				"URL": "/bpmodata/taskdata.svc/" + this.taskInstanceId + "/SAPBPMOutputData?prefixReservedNames=true",
				"Request": JSON.stringify(data)
			};

			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.setUseBatch(true);
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(oData) {
					oBusyDialog.close();
					if (oData.Response.includes("Error Report")) {
						that.errMsg(oData.Response);
						return;
					} else if (oData.Response.includes("error")) {
						var errorMessage = JSON.parse(oData.Response).error.code + ". " + JSON.parse(oData.Response).error.message.value;
						that.errMsg(errorMessage);
						return;
					} else {
						if (that.reviewScenario === true) {
							var msg = that.i18nModel.getProperty("TaskSuccessfullyApproved");
						} else if (that.resubmitScenario === true) {
							msg = that.i18nModel.getProperty("TaskSuccessfullyResubmitted");
						}
						that.sendTaskComment(comment, msg, "");
					}
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});
		},

		processReject: function() {
			if (this._oValueHelpDialogComment.getModel("CommentSubmitModelSet").getData().Comment === "") {
				this._oValueHelpDialogComment.getModel("CommentSubmitModelSet").getData().CommentState = "Error";
				this._oValueHelpDialogComment.getModel("CommentSubmitModelSet").refresh();
				return;
			}
			var that = this;
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.WorkFlow_Approver_Details.results[0].Rejection_Comments =
				this._oValueHelpDialogComment.getModel("CommentSubmitModelSet").getData().Comment;
			var comment = this._oValueHelpDialogComment.getModel("CommentSubmitModelSet").getData().Comment;
			var payload = "";
			var data = this.createPayload(payload);
			switch (this.taskDefinitionName) {
				case "Customer Market Approver Create":
					var taskname = "Market_Approver_Task";
					break;
				case "Customer Credit and Collection Approver Create":
					taskname = "Credit_Collector_Approver_Task";
					break;
				case "Customer Tax Approver Create":
					taskname = "Tax_Approver_Task";
					break;
				case "Requester Create":
					taskname = "Actual_Requestor_Task";
					break;
			}
			var BusinessPartnerData = {
				"URL": "/bpmodata/taskdata.svc/" + this.taskInstanceId + "/SAPBPM" + taskname +
					"ErrorEvent?prefixReservedNames=true",
				"Request": JSON.stringify(data)
			};

			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.setUseBatch(true);
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(oData) {
					oBusyDialog.close();
					if (oData.Response.includes("Error Report")) {
						that.errMsg(oData.Response);
						return;
					} else if (oData.Response.includes("error")) {
						var errorMessage = JSON.parse(oData.Response).error.code + ". " + JSON.parse(oData.Response).error.message.value;
						that.errMsg(errorMessage);
						return;
					} else {
						if (that.deleteRequest === true) {
							var msg = that.i18nModel.getProperty("TaskSuccessfullyDeleted");
						} else {
							msg = that.i18nModel.getProperty("TaskSuccessfullyRejected");
						}
						that.sendTaskComment(comment, msg, "true");
					}
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});

		},

		sendTaskComment: function(comment, message, rejectionInd) {
			var UploadDocuments = this.getUploadedDocuments("new");
			var data = {
				"TaskInstanceID": this.taskInstanceId,
				"TaskNote": comment,
				"RequestID": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.Request_ID,
				"RejectionInd": rejectionInd,
				"UploadDocuments": UploadDocuments
			};
			var BusinessPartnerData = {
				"URL": "/RESTAdapter/REST_BPM/AddTaskNote",
				"Request": JSON.stringify(data)
			};
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.create("/BusinessPartnerSet", BusinessPartnerData, {
				success: function(oData) {
					oBusyDialog.close();
					sap.m.MessageBox.success(message, {
						title: "Success", // default
						styleClass: "sapUiSizeCompact", // default
						actions: sap.m.MessageBox.Action.OK, // default
						emphasizedAction: sap.m.MessageBox.Action.OK, // default
						initialFocus: null, // default
						textDirection: sap.ui.core.TextDirection.Inherit, // default
						onClose: function(action) {
							window.close();
						}
					});
				},
				error: function(oError) {
					oBusyDialog.close();
				}

			});
		},

		createPayload: function(payload) {
			switch (this.taskDefinitionName) {
				case "Customer Market Approver Create":
					var data = this.createMarkerApproverData();
					break;
				case "Customer Credit and Collection Approver Create":
					data = this.createCreditApproverData();
					break;
				case "Customer Tax Approver Create":
					data = this.createTaxApproverData();
					break;
				case "Requester Create":
					data = this.createActualRequestorData(payload);
					break;
				case "Customer Executor Create":
					data = this.createExecutorApproverData();
					break;
			}
			return data;
		},

		createMarkerApproverData: function() {
			this.updateDocuments();
			if (this.approve === true) {
				var MarketApproverData = {
					"Market_Approver_TaskCompleteEventTypeOUTPUT": {
						"Market_Approver_TaskCompleteEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};
			} else if (this.reject === true) {
				MarketApproverData = {
					"Market_Approver_TaskErrorEventTypeOUTPUT": {
						"Market_Approver_TaskErrorEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};

			}
			return MarketApproverData;
		},

		createExecutorApproverData: function() {
			this.updateDocuments();
			if (this.approve === true) {
				var ExecutorApproverData = {
					"Executor_TaskCompleteEventTypeOUTPUT": {
						"Executor_TaskCompleteEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};
			} else if (this.reject === true) {
				ExecutorApproverData = {
					"Executor_TaskErrorEventTypeOUTPUT": {
						"Executor_TaskErrorEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};

			}

			return ExecutorApproverData;
		},

		createCreditApproverData: function() {
			this.updateDocuments();
			if (this.approve === true) {
				var CreditApproverData = {
					"Credit_Collector_Approver_TaskCompleteEventTypeOUTPUT": {
						"Credit_Collector_Approver_TaskCompleteEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};
			} else if (this.reject === true) {
				CreditApproverData = {
					"Credit_Collector_Approver_TaskErrorEventTypeOUTPUT": {
						"Credit_Collector_Approver_TaskErrorEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};

			}

			return CreditApproverData;
		},

		createTaxApproverData: function() {
			this.updateDocuments();
			if (this.approve === true) {
				var TaxApproverData = {
					"Tax_Approver_TaskCompleteEventTypeOUTPUT": {
						"Tax_Approver_TaskCompleteEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};
			} else if (this.reject === true) {
				TaxApproverData = {
					"Tax_Approver_TaskErrorEventTypeOUTPUT": {
						"Tax_Approver_TaskErrorEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};
			}
			return TaxApproverData;
		},

		createActualRequestorData: function(payload) {
			if (this.deleteRequest === false) {
				this.createResubmitPayload(payload);
				var createActualRequestorData = {
					"Actual_Requestor_TaskCompleteEventTypeOUTPUT": {
						"Actual_Requestor_TaskCompleteEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							// "DO_DT_Fiori_Customer_Create": resubmitPayload,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};
			} else if (this.deleteRequest === true) {
				this.updateDocuments();
				createActualRequestorData = {
					"Actual_Requestor_TaskErrorEventTypeOUTPUT": {
						"Actual_Requestor_TaskErrorEvent": {
							"__metadata": {
								"id": this.InputData.d.__metadata.id,
								"uri": this.InputData.d.__metadata.uri,
								"type": "BPMTaskData.Form"
							},
							"EDM_Key": this.InputData.d.startTypeINPUT.start.EDM_Key,
							"DO_DT_Fiori_Customer_Create": this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create,
							"ProcessInstanceAttributes": this.InputData.d.startTypeINPUT.start.ProcessInstanceAttributes
						}
					}
				};

			}

			return createActualRequestorData;
		},

		createResubmitPayload: function(payload) {
			this.updateCustomerBusinessArea(payload);
			this.updateBusinessPartnerData(payload);
			this.updateCustomerData(payload);
			this.updateContactDetails(payload);
			this.updateAccountingData(payload);
			this.udpateSalesData(payload);
			this.updateStatusData(payload);
			this.updateTextNotes(payload);
			this.updateDocuments(payload);
		},

		updateCustomerBusinessArea: function(payload) {
			var CustomerBusinessArea = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0].CustomerBusinessArea
				.results[0];
			CustomerBusinessArea.applnRoleRowid = payload.BusinessPartnerData.CustomerBusinessArea.applnRoleRowid;
			CustomerBusinessArea.divisionRowid = payload.BusinessPartnerData.CustomerBusinessArea.divisionRowid;
			CustomerBusinessArea.DistributionChannel = payload.BusinessPartnerData.CustomerBusinessArea.DistributionChannel;
			CustomerBusinessArea.System = payload.BusinessPartnerData.CustomerBusinessArea.System;
			CustomerBusinessArea.companyCodeRowid = payload.BusinessPartnerData.CustomerBusinessArea.companyCodeRowid;
			CustomerBusinessArea.salesOrganizationRowid = payload.BusinessPartnerData.CustomerBusinessArea.salesOrganizationRowid;
			CustomerBusinessArea.itoLogicalCompRowid = payload.BusinessPartnerData.CustomerBusinessArea.itoLogicalCompRowid;
			CustomerBusinessArea.AccountGroup = payload.BusinessPartnerData.CustomerBusinessArea.AccountGroup;
			CustomerBusinessArea.SalesOrg = payload.BusinessPartnerData.CustomerBusinessArea.SalesOrg;
			CustomerBusinessArea.distributionChannelRowid = payload.BusinessPartnerData.CustomerBusinessArea.distributionChannelRowid;
			CustomerBusinessArea.Division = payload.BusinessPartnerData.CustomerBusinessArea.Division;
			CustomerBusinessArea.CompanyCode = payload.BusinessPartnerData.CustomerBusinessArea.CompanyCode;

		},
		updateBusinessPartnerData: function(payload) {
			this.updateNameAddress(payload);
			this.updateTaxData(payload);
			this.updateCustomerClassification(payload);
			this.updateExternalIdentifier(payload);
		},

		updateCustomerData: function(payload) {
			this.updateGeneralData(payload);
			this.updateBankData(payload);
			this.updateUnloadingPoints(payload);
		},

		updateContactDetails: function(payload) {
			this.updateCompanyContactDetail(payload);
			this.updateContactPersons(payload);
		},

		updateAccountingData: function(payload) {
			if (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData.results[0] !== undefined) {
				this.updateAccountManagement(payload);
				this.updatePaymentData(payload);
				this.updateCorrespondence(payload);
			}
		},

		udpateSalesData: function(payload) {
			var modelHdr = this.getView().getModel("HeaderModelSet").getData();
			if (modelHdr.SalesOrgKey !== "" && modelHdr.DistribChnnlKey !== "" && modelHdr.DivisionKey !== "") {
				this.updateSalesOrder(payload);
				this.updateShippping(payload);
				this.updateBillingDocument(payload);
				this.updatePartnerFunctions(payload);
				this.updateAdditionalFields(payload);
			}
		},

		updateStatusData: function(payload) {
			var StatusData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.StatusData.results[0];
			StatusData.DeletionFlag.DeletionFlagGeneric = JSON.stringify(payload.StatusData.DeletionFlag.DeletionFlagGeneric);
			StatusData.DeletionFlag.DeletionFlagAccounting = JSON.stringify(payload.StatusData.DeletionFlag.DeletionFlagAccounting);
			StatusData.DeletionFlag.DeletionFlagSales = JSON.stringify(payload.StatusData.DeletionFlag.DeletionFlagSales);

			StatusData.BlockData.OrderBlock = payload.StatusData.BlockData.OrderBlock;
			StatusData.BlockData.PostingBlock = JSON.stringify(payload.StatusData.BlockData.PostingBlock);
			StatusData.BlockData.BillingBlock = payload.StatusData.BlockData.BillingBlock;
			StatusData.BlockData.BlockSalesSupport = JSON.stringify(payload.StatusData.BlockData.BlockSalesSupport);
			StatusData.BlockData.DeliveryBlock = payload.StatusData.BlockData.DeliveryBlock;
		},

		updateTextNotes: function(payload) {
			this.updateText(payload);
			//this.updateTextClassification(payload);
		},

		updateDocuments: function(payload) {
			if (this.reviewScenario === true || this.deleteRequest === true) {
				var UploadedDocuments = this.getUploadedDocuments();
				payload = {
					"UploadDocuments": UploadedDocuments
				};
			}
			var UploadDocuments = [];
			// var FileUploadSet = this.getView().getModel("FileUploadSet").getData().results;
			for (var i = 0; i < payload.UploadDocuments.length; i++) {
				UploadDocuments.push({
					"EDM_Key": "",
					"__metadata": {},
					"DocumentUpload": {
						"results": [{
							"EDM_Key": "",
							"__metadata": {},
							"Attachment": {
								"results": [{
									"EDM_Key": "",
									"__metadata": {},
									"Attachment": payload.UploadDocuments[i].DocumentUpload.Attachment
								}]
							}
						}]
					},
					"UploadedFiles": {
						"results": [{
							"EDM_Key": "",
							"__metadata": {},
							FileName: payload.UploadDocuments[i].UploadedFiles.FileName,
							FileSize: JSON.stringify(payload.UploadDocuments[i].UploadedFiles.FileSize),
							FileType: payload.UploadDocuments[i].UploadedFiles.FileType,
							Name_Of_Person: payload.UploadDocuments[i].UploadedFiles.Name_Of_Person,
							Note: payload.UploadDocuments[i].UploadedFiles.Note,
							TimeStamp: payload.UploadDocuments[i].UploadedFiles.TimeStamp
						}]

					}
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.UploadDocuments.results = UploadDocuments;
		},

		updateNameAddress: function(payload) {
			var nameAddress = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0].Name_Address.results;
			var payloadNameAddress = payload.BusinessPartnerData.Name_Address;
			nameAddress = [];
			for (var i = 0; i < payloadNameAddress.length; i++) {
				nameAddress.push({
					"__metadata": {},
					"EDM_Key": "",
					"CONTACTrowid": payloadNameAddress[i].CONTACTrowid,
					"Building": payloadNameAddress[i].Building,
					"BypassTrilliumAddressValidation": JSON.stringify(payloadNameAddress[i].BypassTrilliumAddressValidation),
					"freeTradeRegionRowid": payloadNameAddress[i].freeTradeRegionRowid,
					"POBoxCity": payloadNameAddress[i].POBoxCity,
					"PostalCode": payloadNameAddress[i].PostalCode,
					"Name": payloadNameAddress[i].Name,
					"Name3": payloadNameAddress[i].Name3,
					"Name4": payloadNameAddress[i].Name4,
					"preferredLocalLanguage": payloadNameAddress[i].preferredLocalLanguage,
					"POBoxValidation": payloadNameAddress[i].POBoxValidation,
					"matchRuleGroup": payloadNameAddress[i].matchRuleGroup,
					"Street": payloadNameAddress[i].Street,
					"Room": payloadNameAddress[i].Room,
					"Name1": payloadNameAddress[i].Name1,
					"Name2": payloadNameAddress[i].Name2,
					"StreetValidation": payloadNameAddress[i].StreetValidation,
					"Floor": payloadNameAddress[i].Floor,
					"Street2": payloadNameAddress[i].Street2,
					"AddressVersion": payloadNameAddress[i].AddressVersion,
					"Street1": payloadNameAddress[i].Street1,
					"FreeTradeRegion": payloadNameAddress[i].FreeTradeRegion,
					"POBoxNumber": payloadNameAddress[i].POBoxNumber,
					"cntryRowid": payloadNameAddress[i].cntryRowid,
					"City": payloadNameAddress[i].City,
					"sipPop": payloadNameAddress[i].sipPop,
					"HouseNo": payloadNameAddress[i].HouseNo,
					"HouseNoSupplement": payloadNameAddress[i].HouseNoSupplement,
					"POBoxPostalCode": payloadNameAddress[i].POBoxPostalCode,
					"cntrySubdivRowid": payloadNameAddress[i].cntrySubdivRowid,
					"CompanyPostalCode": payloadNameAddress[i].CompanyPostalCode,
					"Country": payloadNameAddress[i].Country,
					"Region": payloadNameAddress[i].Region,
					"PreferredAddressVersion": JSON.stringify(payloadNameAddress[i].PreferredAddressVersion),
					"Street4": payloadNameAddress[i].Street4,
					"Street3": payloadNameAddress[i].Street3,
					"District": payloadNameAddress[i].District,
					"Street5": payloadNameAddress[i].Street5
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0].Name_Address.results = nameAddress;
		},
		updateTaxData: function(payload) {
			var TaxData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0].TaxData.results[0];
			TaxData.Tax2 = payload.BusinessPartnerData.TaxData.Tax2;
			TaxData.Tax1 = payload.BusinessPartnerData.TaxData.Tax1;
			TaxData.TaxationType = payload.BusinessPartnerData.TaxData.TaxationType;
			TaxData.Tax5 = payload.BusinessPartnerData.TaxData.Tax5;
			TaxData.Sales_PurTax = JSON.stringify(payload.BusinessPartnerData.TaxData.Sales_PurTax);
			TaxData.Tax4 = payload.BusinessPartnerData.TaxData.Tax4;
			TaxData.Tax3 = payload.BusinessPartnerData.TaxData.Tax3;
			TaxData.EqualizationTax = JSON.stringify(payload.BusinessPartnerData.TaxData.EqualizationTax);
			TaxData.taxTypeRowid = payload.BusinessPartnerData.TaxData.taxTypeRowid;
			TaxData.taxNumberTypeRowid = payload.BusinessPartnerData.TaxData.taxNumberTypeRowid;
			TaxData.CFOPCategory = payload.BusinessPartnerData.TaxData.CFOPCategory;
			TaxData.TaxJurisdictionCode = payload.BusinessPartnerData.TaxData.TaxJurisdictionCode;
			TaxData.IPILaw = payload.BusinessPartnerData.TaxData.IPILaw;
			TaxData.NaturalPerson = JSON.stringify(payload.BusinessPartnerData.TaxData.NaturalPerson);
			TaxData.TaxNumberType = payload.BusinessPartnerData.TaxData.TaxNumberType;
			TaxData.ICMSLaw = payload.BusinessPartnerData.TaxData.ICMSLaw;
			TaxData.ICMSExempt = JSON.stringify(payload.BusinessPartnerData.TaxData.ICMSExempt);
			TaxData.IPI_Exempt = JSON.stringify(payload.BusinessPartnerData.TaxData.IPI_Exempt);
			TaxData.VAT.results = [];
			for (var i = 0; i < payload.BusinessPartnerData.TaxData.VAT.length; i++) {
				TaxData.VAT.results.push({
					"__metadata": {},
					"EDM_Key": "",
					"Number": payload.BusinessPartnerData.TaxData.VAT[i].Number,
					"Country": payload.BusinessPartnerData.TaxData.VAT[i].Country
				});
			}
		},

		updateCustomerClassification: function(payload) {
			var CustomerClassification = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0].CustomerClassification
				.results[0];
			CustomerClassification.AccountType = payload.BusinessPartnerData.CustomerClassification.AccountType;
			CustomerClassification.indstryClsfnL1Rowid = payload.BusinessPartnerData.CustomerClassification.indstryClsfnL1Rowid;
			CustomerClassification.IndustryClassification2 = payload.BusinessPartnerData.CustomerClassification.IndustryClassification2;
			CustomerClassification.indstryClsfnL2Rowid = payload.BusinessPartnerData.CustomerClassification.indstryClsfnL2Rowid;
			CustomerClassification.Banner = payload.BusinessPartnerData.CustomerClassification.Banner;
			CustomerClassification.cusBannerRowid = payload.BusinessPartnerData.CustomerClassification.cusBannerRowid;
			CustomerClassification.IndirectCustomerType = payload.BusinessPartnerData.CustomerClassification.IndirectCustomerType;
			CustomerClassification.BusinessActivityType = payload.BusinessPartnerData.CustomerClassification.BusinessActivityType;
			CustomerClassification.cusBsnsActvtyRowid = payload.BusinessPartnerData.CustomerClassification.cusBsnsActvtyRowid;
			CustomerClassification.OrganizationLevel = payload.BusinessPartnerData.CustomerClassification.OrganizationLevel;
			CustomerClassification.orgLvlRowid = payload.BusinessPartnerData.CustomerClassification.orgLvlRowid;
			CustomerClassification.AccountLegalStatus = payload.BusinessPartnerData.CustomerClassification.AccountLegalStatus;
			CustomerClassification.legalClassRowid = payload.BusinessPartnerData.CustomerClassification.legalClassRowid;
			CustomerClassification.CommercialDeal_to = JSON.stringify(payload.BusinessPartnerData.CustomerClassification.CommercialDeal_to);
			CustomerClassification.ServiceDeal_to = JSON.stringify(payload.BusinessPartnerData.CustomerClassification.ServiceDeal_to);
			CustomerClassification.Store = JSON.stringify(payload.BusinessPartnerData.CustomerClassification.Store);

		},
		updateExternalIdentifier: function(payload) {
			var ExternalIdentifier = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.BusinessPartnerData.results[0].External_Identifier
				.results[0];
			ExternalIdentifier.DUNS = payload.BusinessPartnerData.External_Identifier.DUNS;
			ExternalIdentifier.ChamberOfCommerce = payload.BusinessPartnerData.External_Identifier.ChamberOfCommerce;
			//	ExternalIdentifier.intExtIndicatorRowi = payload.BusinessPartnerData.External_Identifier.intExtIndicatorRowi;
			ExternalIdentifier.ExternalIdentifier.results = [];
			for (var i = 0; i < payload.BusinessPartnerData.External_Identifier.ExternalIdentifier.length; i++) {
				ExternalIdentifier.ExternalIdentifier.results.push({
					"__metadata": {},
					"EDM_Key": "",
					"ExternalIdentifierType": "",
					"ExternalIdentifierValue": payload.BusinessPartnerData.External_Identifier.ExternalIdentifier[i].ExternalIdentifierValue,
					"External_delind": null,
					"External_rowid": null,
					"altIdentifier": payload.BusinessPartnerData.External_Identifier.ExternalIdentifier[i].altIdentifier,
					"extTypeMatch": "",
					"identifierTypeRowid": payload.BusinessPartnerData.External_Identifier.ExternalIdentifier[i].identifierTypeRowid
				});
			}
		},

		updateGeneralData: function(payload) {
			var GeneralData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData.results[0].GeneralData
				.results[0];
			GeneralData.URL = payload.CustomerData.GeneralData.URL;
			GeneralData.AlternateBusinessName = payload.CustomerData.GeneralData.AlternateBusinessName;
			GeneralData.SearchTerm1 = payload.CustomerData.GeneralData.SearchTerm1;
			GeneralData.SearchTerm2 = payload.CustomerData.GeneralData.SearchTerm2;
			GeneralData.CommunicationLanguage = payload.CustomerData.GeneralData.CommunicationLanguage;
			GeneralData.AuthorizationGroup = payload.CustomerData.GeneralData.AuthorizationGroup;
			GeneralData.VendorNumber = payload.CustomerData.GeneralData.VendorNumber;
			GeneralData.TransportationZone = payload.CustomerData.GeneralData.TransportationZone;
			GeneralData.transZoneCodeRowid = payload.CustomerData.GeneralData.transZoneCodeRowid;
			GeneralData.AlternateTransportationZone = payload.CustomerData.GeneralData.AlternateTransportationZone;
			GeneralData.Reg_Struct_Group = payload.CustomerData.GeneralData.Reg_Struct_Group;
			GeneralData.GroupKey = payload.CustomerData.GeneralData.GroupKey;
			GeneralData.Trading_Partner = payload.CustomerData.GeneralData.Trading_Partner;
			GeneralData.MainlyCivilianUsage = JSON.stringify(payload.CustomerData.GeneralData.MainlyCivilianUsage);
			GeneralData.MainlyMilitaryUsage = JSON.stringify(payload.CustomerData.GeneralData.MainlyMilitaryUsage);
			GeneralData.bsnsPrtnrId = payload.CustomerData.GeneralData.bsnsPrtnrId;
			GeneralData.Location_No1 = payload.CustomerData.GeneralData.Location_No1;
			GeneralData.Location_No2 = payload.CustomerData.GeneralData.Location_No2;
			GeneralData.CheckDigit = payload.CustomerData.GeneralData.CheckDigit;
		},

		updateBankData: function(payload) {
			var BankData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData.results[0].BankData;
			BankData.AlternativePayer = payload.CustomerData.BankData.AlternativePayer;
			BankData.AllowedPayer = payload.CustomerData.BankData.AllowedPayer;
			BankData.IndividualEntries = JSON.stringify(payload.CustomerData.BankData.IndividualEntries);
			BankData.BankDetails.results = [];
			for (var i = 0; i < payload.CustomerData.BankData.BankDetails.length; i++) {
				BankData.BankDetails.results.push({
					"__metadata": {},
					"EDM_Key": "",
					"IBAN": payload.CustomerData.BankData.BankDetails[i].IBAN,
					"Country": payload.CustomerData.BankData.BankDetails[i].Country,
					"BankKey": payload.CustomerData.BankData.BankDetails[i].BankKey,
					"BankControlKey": payload.CustomerData.BankData.BankDetails[i].BankControlKey,
					"BankAccount": payload.CustomerData.BankData.BankDetails[i].BankAccount,
					"BankAccountHolder": payload.CustomerData.BankData.BankDetails[i].BankAccountHolder,
					"BankType": payload.CustomerData.BankData.BankDetails[i].BankType,
					"ReferenceDetails": payload.CustomerData.BankData.BankDetails[i].ReferenceDetails,
					"CollectionAuth": JSON.stringify(payload.CustomerData.BankData.BankDetails[i].CollectionAuth)
				});
			}
		},

		updateUnloadingPoints: function(payload) {
			// var UnloadingPoints = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData.results[0].UnloadingPoints.results;
			// if (payload.CustomerData.UnloadingPoints.length > 0) {
			// 	UnloadingPoints = [];
			// }
			var UnloadingPoints = [];
			for (var i = 0; i < payload.CustomerData.UnloadingPoints.length; i++) {
				UnloadingPoints.push({
					"__metadata": {},
					"EDM_Key": "",
					"CalendarKey": payload.CustomerData.UnloadingPoints[i].CalendarKey,
					"Default": JSON.stringify(payload.CustomerData.UnloadingPoints[i].Default),
					"UnloadPoint": payload.CustomerData.UnloadingPoints[i].UnloadPoint,
					"GoodsReceivingHours": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours,
					"GoodsReceivingHours_24Hrs_Notion": {
						"results": [{
							"EDM_Key": "",
							"Monday": {
								"Afternoon": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Monday.Afternoon.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Monday.Afternoon.Open
								},
								"Morning": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Monday.Morning.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Monday.Morning.Open
								}
							},
							"Thursday": {
								"Afternoon": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Thursday.Afternoon.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Thursday.Afternoon.Open
								},
								"Morning": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Thursday.Morning.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Thursday.Morning.Open
								}
							},
							"Friday": {
								"Afternoon": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Friday.Afternoon.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Friday.Afternoon.Open
								},
								"Morning": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Friday.Morning.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Friday.Morning.Open
								}
							},
							"Sunday": {
								"Afternoon": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Sunday.Afternoon.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Sunday.Afternoon.Open
								},
								"Morning": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Sunday.Morning.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Sunday.Morning.Open
								}
							},
							"Wednesday": {
								"Afternoon": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Wednesday.Afternoon.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Wednesday.Afternoon.Open
								},
								"Morning": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Wednesday.Morning.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Wednesday.Morning.Open
								}
							},
							"Tuesday": {
								"Afternoon": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Tuesday.Afternoon.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Tuesday.Afternoon.Open
								},
								"Morning": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Tuesday.Morning.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Tuesday.Morning.Open
								}
							},
							"Saturday": {
								"Afternoon": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Saturday.Afternoon.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Saturday.Afternoon.Open
								},
								"Morning": {
									"__metadata": {},
									"EDM_Key": "",
									"Close": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Saturday.Morning.Close,
									"Open": payload.CustomerData.UnloadingPoints[i].GoodsReceivingHours_24Hrs_Notion.Saturday.Morning.Open
								}
							}
						}]

					}
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.CustomerData.results[0].UnloadingPoints.results = UnloadingPoints;
		},

		updateCompanyContactDetail: function(payload) {
			this.updateTelephoneSegment(payload);
			this.updateFaxSegment(payload);
			this.updateEmailSegment(payload);
			this.updateURLSegment(payload);
			this.updateTeleboxNumber(payload);
		},

		updateTelephoneSegment: function(payload) {
			// var TelephoneSegment = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
			// 	.results[0].Telephone_Segment.results;
			var TelephoneSegment = [];
			for (var i = 0; i < payload.ContactDetails.CompanyContactDetail.Telephone_Segment.length; i++) {
				TelephoneSegment.push({
					"__metadata": {},
					"EDM_Key": "",
					"Comments": payload.ContactDetails.CompanyContactDetail.Telephone_Segment[i].Comments,
					"Default": JSON.stringify(payload.ContactDetails.CompanyContactDetail.Telephone_Segment[i].Default),
					"Extension": payload.ContactDetails.CompanyContactDetail.Telephone_Segment[i].Extension,
					"Telephone": payload.ContactDetails.CompanyContactDetail.Telephone_Segment[i].Telephone
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail.results[0].Telephone_Segment
				.results = TelephoneSegment;
		},

		updateFaxSegment: function(payload) {
			// var FaxSegment = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
			// 	.results[0].Fax_Segment.results;
			var FaxSegment = [];
			for (var i = 0; i < payload.ContactDetails.CompanyContactDetail.Fax_Segment.length; i++) {
				FaxSegment.push({
					"__metadata": {},
					"EDM_Key": "",
					"Comments": payload.ContactDetails.CompanyContactDetail.Fax_Segment[i].Comments,
					"Default": JSON.stringify(payload.ContactDetails.CompanyContactDetail.Fax_Segment[i].Default),
					"Extension": payload.ContactDetails.CompanyContactDetail.Fax_Segment[i].Extension,
					"Fax": payload.ContactDetails.CompanyContactDetail.Fax_Segment[i].Fax
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail.results[0].Fax_Segment
				.results = FaxSegment;
		},

		updateEmailSegment: function(payload) {
			// var EmailSegment = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
			// 	.results[0].Email_Segment.results;
			var EmailSegment = [];
			for (var i = 0; i < payload.ContactDetails.CompanyContactDetail.Email_Segment.length; i++) {
				EmailSegment.push({
					"__metadata": {},
					"EDM_Key": "",
					"Comments": payload.ContactDetails.CompanyContactDetail.Email_Segment[i].Comments,
					"Default": JSON.stringify(payload.ContactDetails.CompanyContactDetail.Email_Segment[i].Default),
					"Email": payload.ContactDetails.CompanyContactDetail.Email_Segment[i].Email
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail.results[0].Email_Segment
				.results = EmailSegment;
		},

		updateURLSegment: function(payload) {
			// var URLSegment = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail
			// 	.results[0].URL_Segment.results;
			var URLSegment = [];
			for (var i = 0; i < payload.ContactDetails.CompanyContactDetail.URL_Segment.length; i++) {
				URLSegment.push({
					"__metadata": {},
					"EDM_Key": "",
					"Comments": payload.ContactDetails.CompanyContactDetail.URL_Segment[i].Comments,
					"Default": JSON.stringify(payload.ContactDetails.CompanyContactDetail.URL_Segment[i].Default),
					"URL": payload.ContactDetails.CompanyContactDetail.URL_Segment[i].URL
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail.results[0].URL_Segment
				.results = URLSegment;
		},

		updateTeleboxNumber: function(payload) {
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].CompanyContactDetail.results[0].Telebox_Number
				.results[0].Telebox_Number = payload.ContactDetails.CompanyContactDetail.Telebox_Number;
		},

		updateContactPersons: function(payload) {
			// var ContactPersons = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].ContactPersons.results;
			if (payload.ContactDetails.ContactPersons.length > 0) {
				var ContactPersons = [];
			} else {
				ContactPersons = [];
				ContactPersons.push({
					"__metadata": {},
					"EDM_Key": "",
					"Mobile_Phone": "",
					"Email": "",
					"Telephone": "",
					"Method": "",
					"languageRowid": "",
					"First_Name": "",
					"Telephone_Extension": "",
					"Function": "",
					"Department": "",
					"Language": "",
					"Last_Name": "",
					"Fax_Extension": "",
					"Fax": "",
					"Notes": ""
				});
			}
			for (var i = 0; i < payload.ContactDetails.ContactPersons.length; i++) {
				ContactPersons.push({
					"__metadata": {},
					"EDM_Key": "",
					"Mobile_Phone": payload.ContactDetails.ContactPersons[i].Mobile_Phone,
					"Email": payload.ContactDetails.ContactPersons[i].Email,
					"Telephone": payload.ContactDetails.ContactPersons[i].Telephone,
					"Method": payload.ContactDetails.ContactPersons[i].Method,
					"languageRowid": payload.ContactDetails.ContactPersons[i].languageRowid,
					"First_Name": payload.ContactDetails.ContactPersons[i].First_Name,
					"Telephone_Extension": payload.ContactDetails.ContactPersons[i].Telephone_Extension,
					"Function": payload.ContactDetails.ContactPersons[i].Function,
					"Department": payload.ContactDetails.ContactPersons[i].Department,
					"Language": payload.ContactDetails.ContactPersons[i].Language,
					"Last_Name": payload.ContactDetails.ContactPersons[i].Last_Name,
					"Fax_Extension": payload.ContactDetails.ContactPersons[i].Fax_Extension,
					"Fax": payload.ContactDetails.ContactPersons[i].Fax,
					"Notes": payload.ContactDetails.ContactPersons[i].Notes
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.ContactDetails.results[0].ContactPersons.results = ContactPersons;
		},

		updateAccountManagement: function(payload) {
			var AccountManagement = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData.results[0].AccountManagement
				.results[0];
			AccountManagement.Head_Office = payload.AccountingData.AccountManagement.Head_Office;
			AccountManagement.Sort_Key = payload.AccountingData.AccountManagement.Sort_Key;
			AccountManagement.Recon_Account = payload.AccountingData.AccountManagement.Recon_Account;
			AccountManagement.Buying_Group = payload.AccountingData.AccountManagement.Buying_Group;
			AccountManagement.Prev_Acct_No = payload.AccountingData.AccountManagement.Prev_Acct_No;
		},

		updatePaymentData: function(payload) {
			var PaymentData = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData.results[0].PaymentData
				.results[0];
			PaymentData.Terms_Of_Payment = payload.AccountingData.PaymentData.Terms_Of_Payment;
			PaymentData.PaymentTerms_Comments = payload.AccountingData.PaymentData.PaymentTerms_Comments;
			PaymentData.Credit_Memo_Payment_Term = payload.AccountingData.PaymentData.Credit_Memo_Payment_Term;
			PaymentData.CreditMemoPaymentTerms_Comments = payload.AccountingData.PaymentData.CreditMemoPaymentTerms_Comments;
			PaymentData.B_E_Changes_Payment_Term = payload.AccountingData.PaymentData.B_E_Changes_Payment_Term;
			PaymentData.BEPaymentTerms_Comments = payload.AccountingData.PaymentData.BEPaymentTerms_Comments;
			PaymentData.Tolerance_Group = payload.AccountingData.PaymentData.Tolerance_Group;
			PaymentData.Payment_Methods = payload.AccountingData.PaymentData.Payment_Methods;
			PaymentData.House_Bank = payload.AccountingData.PaymentData.House_Bank;
			PaymentData.Selection_Rule = payload.AccountingData.PaymentData.Selection_Rule;
			PaymentData.Payment_History_Record = JSON.stringify(payload.AccountingData.PaymentData.Payment_History_Record);
		},

		updateCorrespondence: function(payload) {
			var Correspondence = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.AccountingData.results[0].Correspondence
				.results[0];
			Correspondence.Customer_User = payload.AccountingData.Correspondence.Customer_User;
			Correspondence.Dunning_Clerk = payload.AccountingData.Correspondence.Dunning_Clerk;
			Correspondence.Dunn_Procedure = payload.AccountingData.Correspondence.Dunn_Procedure;
			Correspondence.Last_Dunned = Formatter.dateSendToSap(payload.AccountingData.Correspondence.Last_Dunned); // payload.AccountingData.Correspondence.Last_Dunned;
			Correspondence.Clerk_Abbrev = payload.AccountingData.Correspondence.Clerk_Abbrev;
			Correspondence.Acct_At_Cust = payload.AccountingData.Correspondence.Acct_At_Cust;
			Correspondence.Dunning_Level = payload.AccountingData.Correspondence.Dunning_Level;
			Correspondence.Dunning_Block = payload.AccountingData.Correspondence.Dunning_Block;
			Correspondence.Dunning_Area = payload.AccountingData.Correspondence.Dunning_Area;
			Correspondence.Clerks_Internet = payload.AccountingData.Correspondence.Clerks_Internet;
			Correspondence.Account_Statement = payload.AccountingData.Correspondence.Account_Statement;
		},

		updateSalesOrder: function(payload) {
			var SalesOrder = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].SalesOrder
				.results[0];
			if (SalesOrder !== undefined) {
				SalesOrder.SalesOffice = payload.SalesData.SalesOrder.SalesOffice;
				SalesOrder.CustomerGroup = payload.SalesData.SalesOrder.CustomerGroup;
				SalesOrder.Currency = payload.SalesData.SalesOrder.Currency;
				SalesOrder.AcctAtCust = payload.SalesData.SalesOrder.AcctAtCust;
				SalesOrder.SalesDistrict = payload.SalesData.SalesOrder.SalesDistrict;
				SalesOrder.CustPricProc = payload.SalesData.SalesOrder.CustPricProc;
				SalesOrder.ExchRateType = payload.SalesData.SalesOrder.ExchRateType;
				SalesOrder.PriceList = payload.SalesData.SalesOrder.PriceList;
				SalesOrder.SalesGroup = payload.SalesData.SalesOrder.SalesGroup;
				SalesOrder.PriceGroup = payload.SalesData.SalesOrder.PriceGroup;
				SalesOrder.CustStatsGrp = payload.SalesData.SalesOrder.CustStatsGrp;
			} else {
				this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].SalesOrder.results.push({
					"SalesOffice": payload.SalesData.SalesOrder.SalesOffice,
					"CustomerGroup": payload.SalesData.SalesOrder.CustomerGroup,
					"Currency": payload.SalesData.SalesOrder.Currency,
					"AcctAtCust": payload.SalesData.SalesOrder.AcctAtCust,
					"SalesDistrict": payload.SalesData.SalesOrder.SalesDistrict,
					"CustPricProc": payload.SalesData.SalesOrder.CustPricProc,
					"ExchRateType": payload.SalesData.SalesOrder.ExchRateType,
					"PriceList": payload.SalesData.SalesOrder.PriceList,
					"SalesGroup": payload.SalesData.SalesOrder.SalesGroup,
					"PriceGroup": payload.SalesData.SalesOrder.PriceGroup,
					"CustStatsGrp": payload.SalesData.SalesOrder.CustStatsGrp,
					"EDM_Key": "",
					"__metadata": {}
				});
			}
		},
		updateShippping: function(payload) {
			var Shipping = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].Shipping
				.results[0];
			if (Shipping !== undefined) {
				Shipping.RelevantForPod = JSON.stringify(payload.SalesData.Shipping.RelevantForPod);
				Shipping.DeliveringPlant = payload.SalesData.Shipping.DeliveringPlant;
				Shipping.DeliveryPriority = payload.SalesData.Shipping.DeliveryPriority;
				Shipping.ShippingConditions = payload.SalesData.Shipping.ShippingConditions;
				Shipping.OrderCombination = JSON.stringify(payload.SalesData.Shipping.OrderCombination);
				Shipping.PartialDeliveryPerItem = payload.SalesData.Shipping.PartialDeliveryPerItem;
				Shipping.MaxPartialDeliveries = payload.SalesData.Shipping.MaxPartialDeliveries;
				Shipping.PodTimeframe = payload.SalesData.Shipping.PodTimeframe;
				Shipping.CompleteDeliveryRequired = JSON.stringify(payload.SalesData.Shipping.CompleteDeliveryRequired);
			} else {
				this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].Shipping.results.push({
					"RelevantForPod": JSON.stringify(payload.SalesData.Shipping.RelevantForPod),
					"DeliveringPlant": payload.SalesData.Shipping.DeliveringPlant,
					"DeliveryPriority": payload.SalesData.Shipping.DeliveryPriority,
					"ShippingConditions": payload.SalesData.Shipping.ShippingConditions,
					"OrderCombination": JSON.stringify(payload.SalesData.Shipping.OrderCombination),
					"PartialDeliveryPerItem": payload.SalesData.Shipping.PartialDeliveryPerItem,
					"MaxPartialDeliveries": payload.SalesData.Shipping.MaxPartialDeliveries,
					"PodTimeframe": payload.SalesData.Shipping.PodTimeframe,
					"CompleteDeliveryRequired": JSON.stringify(payload.SalesData.Shipping.CompleteDeliveryRequired),
					"EDM_Key": "",
					"__metadata": {}
				});
			}
		},

		updateBillingDocument: function(payload) {
			var BillingDocument = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].BillingDocument
				.results[0];
			if (BillingDocument === undefined) {
				var BillDoc = [{}];
				BillingDocument = BillDoc[0];
				BillingDocument.EDM_Key = "";
				BillingDocument.__metadata = {};
				BillingDocument.TaxClassifications = {
					"results": []
				};
			}
			BillingDocument.InvoiceListDates = payload.SalesData.BillingDocument.InvoiceListDates;
			BillingDocument.TermsOfPayment = payload.SalesData.BillingDocument.TermsOfPayment;
			BillingDocument.InvoiceDates = payload.SalesData.BillingDocument.InvoiceDates;
			BillingDocument.PriceDetermination = JSON.stringify(payload.SalesData.BillingDocument.PriceDetermination);
			BillingDocument.Rebate = JSON.stringify(payload.SalesData.BillingDocument.Rebate);
			BillingDocument.Incoterms2 = payload.SalesData.BillingDocument.Incoterms2;
			BillingDocument.Incoterms1 = payload.SalesData.BillingDocument.Incoterms1;
			BillingDocument.AcctAssgmtGroup = payload.SalesData.BillingDocument.AcctAssgmtGroup;
			BillingDocument.TaxClassifications.results = [];
			for (var i = 0; i < payload.SalesData.BillingDocument.TaxClassifications.length; i++) {
				BillingDocument.TaxClassifications.results.push({
					"__metadata": {},
					"EDM_Key": "",
					"CountryName": payload.SalesData.BillingDocument.TaxClassifications[i].CountryName,
					"TaxCategory": payload.SalesData.BillingDocument.TaxClassifications[i].TaxCategory,
					"Country": payload.SalesData.BillingDocument.TaxClassifications[i].Country,
					"TaxClassification": payload.SalesData.BillingDocument.TaxClassifications[i].TaxClassification,
					"Name": payload.SalesData.BillingDocument.TaxClassifications[i].Name,
					"TaxClassificationDescription": null
				});
			}

			if (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].BillingDocument.results[0] === undefined) {
				this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].BillingDocument.results = Array(
					BillingDocument);
			}
		},

		updatePartnerFunctions: function(payload) {
			// var PartnerFunctions = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].PartnerFunctions.results;
			var PartnerFunctions = [];
			for (var i = 0; i < payload.SalesData.PartnerFunctions.length; i++) {
				PartnerFunctions.push({
					"__metadata": {},
					"EDM_Key": "",
					"PartnerFunction": payload.SalesData.PartnerFunctions[i].PartnerFunction,
					"Number": payload.SalesData.PartnerFunctions[i].Number,
					"PartnerDescription": payload.SalesData.PartnerFunctions[i].PartnerDescription,
					"PartnerFunctionSection": payload.SalesData.PartnerFunctions[i].PartnerFunctionSection,
					"Default": JSON.stringify(payload.SalesData.PartnerFunctions[i].Default),
					"Name": payload.SalesData.PartnerFunctions[i].Name
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].PartnerFunctions.results =
				PartnerFunctions;
		},

		updateAdditionalFields: function(payload) {
			var AdditionalFields = this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].AdditionalFields.results[
				0];
			if (AdditionalFields === undefined) {
				var AdditionalFlds = [{}];
				AdditionalFields = AdditionalFlds[0];
				AdditionalFields.EDM_Key = "";
				AdditionalFields.__metadata = {};
			}
			AdditionalFields.CustomerGroup6 = payload.SalesData.AdditionalFields.CustomerGroup6;
			AdditionalFields.CustomerGroup5 = payload.SalesData.AdditionalFields.CustomerGroup5;
			AdditionalFields.CustomerGroup4 = payload.SalesData.AdditionalFields.CustomerGroup4;
			AdditionalFields.CustomerGroup3 = payload.SalesData.AdditionalFields.CustomerGroup3;
			AdditionalFields.CustomerGroup2 = payload.SalesData.AdditionalFields.CustomerGroup2;
			AdditionalFields.CustomerGroup1 = payload.SalesData.AdditionalFields.CustomerGroup1;

			if (this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].AdditionalFields.results[0] ===
				undefined) {
				this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.SalesData.results[0].AdditionalFields.results = Array(
					AdditionalFields);
			}
		},

		updateText: function(payload) {
			var Text = [];
			for (var i = 0; i < payload.TextNotes.Text.length; i++) {
				Text.push({
					"__metadata": {},
					"EDM_Key": "",
					"Free_Text": payload.TextNotes.Text[i].Free_Text,
					"Language": payload.TextNotes.Text[i].Language,
					"Level": payload.TextNotes.Text[i].Level,
					"Multi_Line": JSON.stringify(payload.TextNotes.Text[i].Multi_Line),
					"Text_Type": payload.TextNotes.Text[i].Text_Type
				});
			}

			var TextClassification = [];
			for (i = 0; i < payload.TextNotes.TextClassification.length; i++) {
				TextClassification.push({
					"__metadata": {},
					"EDM_Key": "",
					"Classification": payload.TextNotes.TextClassification[i].Classification,
					"Classification_Type": payload.TextNotes.TextClassification[i].Classification_Type,
					"Value": payload.TextNotes.TextClassification[i].Value
				});
			}
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.TextNotes.results = [];
			this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.TextNotes.results.push({
				"EDM_Key": "",
				"__metadata": {},
				"Text": {
					"results": Text
				},
				"TextClassification": {
					"results": TextClassification
				}
			});
		},

		updateTextClassification: function(payload) {

			var TextClassification = [];
			for (var i = 0; i < payload.TextNotes.TextClassification.length; i++) {
				TextClassification.push({
					"__metadata": {},
					"EDM_Key": "",
					"Classification": payload.TextNotes.TextClassification[i].Classification,
					"Classification_Type": payload.TextNotes.TextClassification[i].Classification_Type,
					"Value": payload.TextNotes.TextClassification[i].Value
				});
				this.InputData.d.startTypeINPUT.start.DO_DT_Fiori_Customer_Create.TextNotes.results[0].TextClassification.results =
					TextClassification;
			}

		},

		setFieldsDisplayMode: function() {
			if (this.reviewScenario === true) {
				var accGrp = {
					NameAndAddrsEdit: false,
					TaxDataEdit: false,
					CustClassficEdit: false,
					ExternIdentEdit: false,
					BankEdit: false,
					UnlodEdit: false,
					CompContDetEdit: false,
					ContPerEdit: false,
					PartFunEdit: false,
					TextNoteSectionEdit: false,
					UploadDoc: false,
					//from UI end

					CompanyCodeCond: "HIDE", //Backend
					SalesOrgCond: "HIDE", //Backend
					DistriChanlCond: "HIDE", //Backend
					DivisionCond: "HIDE", //Backend
					SystemCond: "HIDE", //Backend
					AccountGrpCond: "HIDE", //Backend
					ApplicIdCond: "HIDE", //Backend
					GoldenIdCond: "HIDE", //Backend
					CountryNameCond: "HIDE",
					AddrsVernCond: "HIDE", //Backend
					PrefAddVerCond: "HIDE", //Backend
					Name1Cond: "HIDE",
					Name2Cond: "HIDE",
					Name3Cond: "HIDE",
					Name4Cond: "HIDE",
					Street1Cond: "HIDE",
					Street2Cond: "HIDE",
					Street3Cond: "HIDE",
					Street4Cond: "HIDE",
					Street5Cond: "HIDE",
					HouseCond: "HIDE", //Backend
					HouseSuplmntCond: "HIDE", //Backend
					BuildingCond: "HIDE",
					FloorCond: "HIDE",
					RoomCond: "HIDE",
					PostalCodeCond: "HIDE",
					DistrictCond: "HIDE",
					CityCond: "HIDE",
					RegionCond: "HIDE",
					FreeTraderegCond: "HIDE", //Backend MDM
					POBOXNumCond: "HIDE",
					PoBoxPostCodeCond: "HIDE", //Backend
					PoBoxCityCond: "HIDE",
					CompPostCodeCond: "HIDE",
					ByPassAddrValCond: "HIDE", //Backend MDM
					streetValCond: "HIDE", //Backend MDM
					PoBoxValCond: "HIDE", //Backend MDM

					TaxVal1cond: "HIDE",
					TaxVal2cond: "HIDE",
					TaxVal3cond: "HIDE",
					TaxVal4cond: "HIDE",
					TaxVal5cond: "HIDE",
					VatCountryCond: "HIDE",
					VatNumCond: "HIDE",
					TaxJurisCodeCond: "HIDE",
					TaxationTypeCond: "HIDE",
					TaxNumberTypeCond: "HIDE",
					CFOPCatCond: "HIDE",
					ICMSLawCond: "HIDE",
					IPILawCond: "HIDE",
					NaturlPerCond: "HIDE",
					SalesPurTxCond: "HIDE",
					EqualizTaxCond: "HIDE",
					ICMSExempCond: "HIDE",
					IPIExemptCond: "HIDE",

					AccouTypeCond: "HIDE", //Backend
					IndClass1Cond: "HIDE", //Backend
					IndClass2Cond: "HIDE", //Backend
					BannerCond: "HIDE", //Backend
					IndCustTypeCond: "HIDE", //Backend
					BusActTypeCond: "HIDE", //Backend
					OrganizationLvlCond: "HIDE", //Backend
					AccLeglstusCond: "HIDE", //Backend
					CommerDelToCond: "HIDE", //Backend
					ServDelToCond: "HIDE", //Backend
					StoreCond: "HIDE", //Backend
					ChamberOfCommCond: "HIDE", //Backend
					DunsCond: "HIDE", //Backend
					ExternlTypeCond: "HIDE", //Backend
					ExternlValueCond: "HIDE", //Backend

					AlterBusNameCond: "HIDE", //Backend
					SearchTerm1Cond: "HIDE", //Backend
					SearchTerm2Cond: "HIDE",
					CommLangCond: "HIDE",
					AuthGrpCond: "HIDE",
					VendorNumCond: "HIDE",
					TransZoneCond: "HIDE",
					AltTranspZoneCond: "HIDE", //Backend
					RegStructGrpCond: "HIDE",
					GroupKeyCond: "HIDE",
					TradinParCond: "HIDE",
					MainlyCivilUsgCond: "HIDE",
					MainlyMilitUsgCond: "HIDE",
					LocationNo1Cond: "HIDE",
					LocationNo2Cond: "HIDE",
					CheckDigitCond: "HIDE",

					IBANCond: "HIDE", //Backend
					CountryCond: "HIDE",
					BankKeyCond: "HIDE",
					BankContKeyCond: "HIDE",
					BankAccCond: "HIDE",
					BankAccHolderCond: "HIDE",
					BankTypeCond: "HIDE",
					RefDetCond: "HIDE",
					CollAuthCond: "HIDE",
					AlterPayerCond: "HIDE",
					IndEntCond: "HIDE",
					AllowPayrCond: "HIDE", //Backend

					UnlodPointCond: "HIDE",
					GoodsRecHrsCond: "HIDE", //backend
					DefaultCond: "HIDE",
					CalenderKeyCond: "HIDE",

					MondayMornOpenCond: "HIDE", //Backend
					MondayMornCloseCond: "HIDE", //Backend
					MondayAfterOpenCond: "HIDE", //Backend
					MondayAfterCloseCond: "HIDE", //Backend

					TuesdayMornOpenCond: "HIDE", //Backend
					TuesdayMornCloseCond: "HIDE", //Backend
					TuesdayAfterOpenCond: "HIDE", //Backend
					TuesdayAfterCloseCond: "HIDE", //Backend

					WednesdayMornOpenCond: "HIDE", //Backend
					WednesdayMornCloseCond: "HIDE", //Backend
					WednesdayAfterOpenCond: "HIDE", //Backend
					WednesdayAfterCloseCond: "HIDE", //Backend

					ThursdayMornOpenCond: "HIDE", //Backend
					ThursdayMornCloseCond: "HIDE", //Backend
					ThursdayAfterOpenCond: "HIDE", //Backend
					ThursdayAfterCloseCond: "HIDE", //Backend

					FridayMornOpenCond: "HIDE", //Backend
					FridayMornCloseCond: "HIDE", //Backend
					FridayAfterOpenCond: "HIDE", //Backend
					FridayAfterCloseCond: "HIDE", //Backend

					SaturdayMornOpenCond: "HIDE", //Backend
					SaturdayMornCloseCond: "HIDE", //Backend
					SaturdayAfterOpenCond: "HIDE", //Backend
					SaturdayAfterCloseCond: "HIDE", //Backend

					SundayMornOpenCond: "HIDE", //Backend
					SundayMornCloseCond: "HIDE", //Backend
					SundayAfterOpenCond: "HIDE", //Backend
					SundayAfterCloseCond: "HIDE", //Backend

					//Account Tab
					ReconAccCond: "HIDE",
					HeadOfficeCond: "HIDE",
					SorkKeyCond: "HIDE",
					PreAccNoCond: "HIDE",
					BuyingGrpCond: "HIDE",
					TermsOfPayCond: "HIDE",
					CredMemoPaytrmCond: "HIDE",
					BeChangePayTermCond: "HIDE",
					TolerncGrpCond: "HIDE",
					PaymntMethCond: "HIDE",
					HouseBankCond: "HIDE",
					SelectnRuleCond: "HIDE",
					PayHisRecod: "HIDE",
					DunnProcCond: "HIDE",
					LastDunnCond: "HIDE",
					DunningClerkCond: "HIDE", //Backend,
					DunnigBlockCond: "HIDE",
					DunLevelCond: "HIDE",
					DunnAreaCond: "HIDE", //Backend,
					ClerkAbbrvCond: "HIDE",
					AccAtCustCond: "HIDE",
					CustomUsrCond: "HIDE",
					ClerkIntrnCond: "HIDE",
					AccStmntCond: "HIDE",

					//Status Data
					PostingBlockCond: "HIDE", //Backend
					OrderBlockCond: "HIDE", //Backend
					DeliveryBlockCond: "HIDE", //Backend
					BillngBlockCond: "HIDE", //Backend
					BlockSalesSupportCond: "HIDE", //Backend

					//sales  Data
					SalesDistrictSLDCond: "HIDE",
					SalesOfficeSLDCond: "HIDE",
					SalesGroupSLDCond: "HIDE",
					CustomerGroupSLDCond: "HIDE",
					CurrencySLDCond: "HIDE",
					AcctAtCustSLDCond: "HIDE",
					ExchangeRateTypeSLDCond: "HIDE",
					PriceGroupSLDCond: "HIDE",
					CustPricProcSLDCond: "HIDE",
					PriceListSLDCond: "HIDE",
					CustStatGrpSLDCond: "HIDE",
					DeliveryPrioritySLDCond: "HIDE",
					ShippingConditionsSLDCond: "HIDE",
					DeliveryPlantSLDCond: "HIDE",
					OrderCombinationSLDCond: "HIDE",
					RelevantforProdSLDCond: "HIDE",
					ProductionTimeFrameSLDCond: "HIDE",
					CompleteDeliveryRequiredSLDCond: "HIDE",
					PartialDeliveryPerItemSLDCond: "HIDE",
					MaxPartialDeliveriesSLDCond: "HIDE",
					RebateSLDCond: "HIDE",
					PriCeDeterminCond: "HIDE",
					InvoiceDatesSLDCond: "HIDE",
					InvoiceListDatesSLDCond: "HIDE",
					Incoterms1SLDCond: "HIDE",
					Incoterms2SLDCond: "HIDE",
					TermsofPaymentSLDCond: "HIDE",
					AccountAssignmentGroupSLDCond: "HIDE",
					TaxClassiSLDCond: "HIDE",
					CustomerGroup1SLDCond: "HIDE", //Backend
					CustomerGroup2SLDCond: "HIDE", //Backend
					CustomerGroup3SLDCond: "HIDE", //Backend
					CustomerGroup4SLDCond: "HIDE", //Backend
					CustomerGroup5SLDCond: "HIDE", //Backend
					CustomerGroup6SLDCond: "HIDE", //Backend
					PartFunDGCond: "HIDE",
					NumDGCond: "HIDE", //Backend
					NameDGCond: "HIDE", //Backend
					PartDescDGCond: "HIDE",
					DefaultDGCond: "HIDE",
					PartFunOPCond: "HIDE",
					NumOPCond: "HIDE", //Backend
					NameOPCond: "HIDE", //Backend
					PartDescOPCond: "HIDE",
					DefaultOPCond: "HIDE",
					PartFunSOPCond: "HIDE",
					NumSOPCond: "HIDE", //Backend
					NameSOPCond: "HIDE", //Backend
					PartDescSOPCond: "HIDE",
					DefaultSOPCond: "HIDE",

					//Text Notes
					LevelTNCond: "HIDE", //Backend
					LanguageTNCond: "HIDE",
					TextTypeTNCond: "HIDE", //Backend
					FreeTextTNCond: "HIDE", //Backend
					ClassificationTypeTNCond: "HIDE", //Backend
					ClassificationTNCond: "HIDE", //Backend
					ValueTNCond: "HIDE", //Backend

					//contact details
					TelephoneCond: "HIDE",
					FaxCond: "HIDE",
					EmailCond: "HIDE",
					URLCond: "HIDE",
					TeleboxNumCond: "HIDE", //Backend
					TeleExtCond: "HIDE", //Backend
					FaxExtCond: "HIDE", //Backend
					FaxCommentCond: "HIDE", //Backend
					FaxDefaultCond: "HIDE", //Backend
					EmailCommentCond: "HIDE", //Backend
					EmailDefaultCond: "HIDE", //Backend
					URLCommentCond: "HIDE", //Backend
					URLDefaultCond: "HIDE", //Backend,
					TeleCommentCond: "HIDE", //Backend
					DefaultTeltCond: "HIDE", //Backend
					//

					LastNameCPCond: "HIDE", //Backend
					FunctionCPCond: "HIDE",
					TelephoneCPCond: "HIDE",
					FaxCPCond: "HIDE",
					MobilePhoneCPCond: "HIDE", //Backend
					EmailCPCond: "HIDE",
					MethodCPCond: "HIDE",
					FirstNameCPCond: "HIDE", //Backend
					DepartmentCPCond: "HIDE",
					TelebExtCPCond: "HIDE", //Backend
					FaxExtenCPCond: "HIDE", //Backend
					NotesCPCond: "HIDE",
					LangCPCond: "HIDE" //Backend
				};
				var oModelReq = new sap.ui.model.json.JSONModel(accGrp);
				this.getView().setModel(oModelReq, "RequiredOptionalSet");
			} else {
				this.basedOnAccountGroupEnableMandatoryOptional(this.getView().getModel("HeaderModelSet").getData().AccountGrpKey);
			}
		},

		hideReviewbtns: function() {
			var oModel = new sap.ui.model.json.JSONModel({
				"Enabled": false,
				"approveVisible": false,
				"rejectVisible": false,
				"DeleteVisible": false,
				"validatePendingRequestbtnVisible": true,
				"sendforReviewEnabled": true,
				"closeEnabled": false,
				"closeVisible": false,
				"cancelVisible": true,
				"duplicateCheckCommentVisible": false,
				"duplicateCheckChangeBtnVisible": true,
				"duplicateCheckProcessBtnVisible": true,
				"duplicateCheckCloseBtnVisible": false,
				"ShowNav": true,
				"hdrTextVisible": true,
				"CompanyCodeCB": true,
				"CompanyCodeInput": false,
				"SalesOrgCB": true,
				"SalesOrgInput": false,
				"DistributionChannelCB": true,
				"DistributionChannelInput": false,
				"DivisionCB": true,
				"DivisionInput": false,
				"SystemCB": true,
				"SystemInput": false,
				"AccountGroupCB": true,
				"AccountGroupInput": false,
				"UploadDocument": true
			});
			this.getView().setModel(oModel, "ButtonPropertyModel");
		},

		onClose: function() {
			sap.m.MessageBox.confirm("Are you sure you want to close this page?", {
				title: "Confirm", // default
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				styleClass: "sapUiSizeCompact", // default
				onClose: function(val) {
					if (val === "YES") {
						window.close();
					}
				}

			});

		},

		createHeaderSetEmptyModel: function() {

			//header data
			var hdr = {
				CompnyCodeKey: "",
				SalesOrgKey: "",
				DistribChnnlKey: "",
				DivisionKey: "",
				System: "",
				AccountGrpKey: "",
				AppId: "",
				CompnyCodeKeyEnable: true,
				SalesOrgKeyEnable: true,
				DistribChnnlKeyEnable: true,
				DivisionKeyEnable: true,
				SystemEnable: false,
				AccountGrpKeyEnable: false,
				AppIdEnableEnable: false,

				CompnyCodeKeyValState: "None",
				SalesOrgKeyValState: "None",
				DistribChnnlKeyValState: "None",
				DivisionKeyValState: "None",
				SystemValState: "None",
				AccountGrpKeyValState: "None",
				AppIdValState: "None"
			};
			var modelMain = new sap.ui.model.json.JSONModel(hdr);
			this.getView().setModel(modelMain, "HeaderModelSet");

			var panelM = new sap.ui.model.json.JSONModel({
				BusPartDataNameAddPanel: true,
				BusPartDataTaxDataPanel: false,
				BusPartDataCustClassPanel: false,
				BusPartDataExtIdntPanel: false,
				CustDataGeneralDataPanel: false,
				CustDataBankDetailsPanel: false,
				CustDataUnloadingPointsPanel: false
			});
			this.getView().setModel(panelM, "PanelModelSet");

			//selected tab
			var tabsel = new sap.ui.model.json.JSONModel({
				SelecteIconTab: "goalsSection"
			});
			this.getView().setModel(tabsel, "TabSelectionModel");

			this.getView().byId("ID_NOTE_HDR_TXT").setText(this.i18nModel.getProperty(
				"pleaseSelectTheCompanyCodeAndOrSalesAreaAndTheAccountGroup"));

			var oODataJSONModel1 = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oODataJSONModel1, "DivisionComboSet");

			var oODataJSONModel11 = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oODataJSONModel11, "DistbChanlComboSet");

			var oODataJSONModelSystem = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oODataJSONModelSystem, "SystemCombSet");

			var oODataJSONModelAcc = new sap.ui.model.json.JSONModel({
				"results": []
			});
			this.getView().setModel(oODataJSONModelAcc, "AccountGroupComboSet");

		},
		createEmptybusinesspartnerTabModel: function() {
			//for duplicate check
			var modelMainDup = new sap.ui.model.json.JSONModel({
				DuplicateBtnEnable: true,
				NeedToValidateDuplicateCheck: false
			});

			this.getView().setModel(modelMainDup, "DuplicateCheckSet");
			var data = {
				NameAndAddress: [{
					"AddCountNo": "1 of 1",
					"Country": "",
					"Address_Version": "",
					"Preferred_Local_Language": false,
					"Name": "",
					"Name_1": "",
					"Name_2": "",
					"Name_3": "",
					"Name_4": "",
					"Street": "",
					"Street_1": "",
					"Street_2": "",
					"Street_3": "",
					"Street_4": "",
					"Street_5": "",
					"House_No": "",
					"House_No_Supplement": "",
					"Building": "",
					"Floor": "",
					"Room": "",
					"Postal_Code": "",
					"District": "",
					"City": "",
					"Region": "",
					"Free_Trade_Region": "",
					"PO_Box": "",
					"PO_Box_Code": "",
					"PO_Box_City": "",
					"Bypass_Validation": false,
					"Street_Validation": "",
					"POBox_Validation": "",

					"CountryState": "None",
					"CountryMessage": " ",
					"AddrVrsState": "None",
					"AddrVrsMessage": " ",
					"PrefLangState": "None",
					"PrefLangMessage": " ",
					"Name1State": "None",
					"Name1Message": " ",
					"Name2State": "None",
					"Name2Message": " ",
					"Name3State": "None",
					"Name3Message": " ",
					"Name4State": "None",
					"Name4Message": " ",

					"Street1State": "None",
					"Street1Message": " ",
					"Street2State": "None",
					"Street2Message": " ",
					"Street3State": "None",
					"Street3Message": " ",
					"Street4State": "None",
					"Street4Message": " ",
					"Street5State": "None",
					"Street5Message": " ",
					"HouseState": "None",
					"HouseMessage": " ",
					"HouseSupState": "None",
					"HouseSupMessage": " ",

					"BuildState": "None",
					"BuildMessage": " ",

					"FloorState": "None",
					"FloorMessage": " ",

					"RoomState": "None",
					"RoomMessage": " ",

					"PostCodeState": "None",
					"PostCodeMessage": " ",

					"DistrictState": "None",
					"DistrictMessage": " ",

					"CityState": "None",
					"CityMessage": " ",

					"RegionState": "None",
					"RegionMessage": " ",

					"FreeTradeRegionState": "None",
					"FreeTradeRegionMessage": " ",

					"POBoxNumState": "None",
					"POBoxNumMessage": " ",

					"POBoxPostCodState": "None",
					"POBoxPostCodMessage": " ",

					"POBoxCityState": "None",
					"POBoxCityMessage": " ",
					"PreferedAddrsVerEnabled": false,
					"CountryEnabled": true,
					"PostalCodeEnabled": true,
					"RegionEnabled": true,
					"FreeTradeRegionEnabled": true,
					"POBoxNumEnabled": true,
					"PoBoxPostCodeEnabled": true,
					"CompPostalCodeEnabled": true,
					"UiAddressValidated": false,

					"CompPostalCode": "",
					"CompPostalCodeState": "None",
					"CompPostalCodeMessage": "",
					"ByPassAddrsState": "None",
					"ByPassAddrsMessage": " ",
					"streetValState": "None",
					"StreetValMessage": " ",
					"PoBoxValState": "None",
					"POBoxValMessage": " ",
					"SIP_POP": "",
					"MatchRuleGroup": ""
				}],
				TaxData: {
					"AdditionalVats": [],
					"TotalAdditionalVat": "0",
					"Text1": " ",
					"Text2": " ",
					"Text3": " ",
					"Text4": " ",
					"Text5": " ",
					"Text1Value": "",
					"Text2Value": "",
					"Text3Value": "",
					"Text4Value": "",
					"Text5Value": "",
					"VatNum": "",
					"VatCountKey": "",
					"TaxJurisdiction_Code": "",
					"Taxation_Type": "",
					"TaxNumber_Type": "",
					"CFOP_Category": "",
					"ICMS_Law": "",
					"IPI_Law": "",
					"Natural_Person": false,
					"salesPurchase_Tax": false,
					"Equalization_Tax": false,
					"ICMS_Exempt": false,
					"IPI_Exempt": false,

					"TaxJurisdictionCodeMessgae": "",
					"TaxJurisdictionCodeState": "None",

					"TaxationTypeMessage": "",
					"TaxationTypeState": "None",

					"TaxNumberTypeMessage": "",
					"TaxNumberTypeState": "None",

					"CFOPCategoryMessage": "",
					"CFOPCategoryState": "None",

					"ICMSLawMessage": "",
					"ICMSLawState": "None",

					"IPILawMessage": "",
					"IPILawState": "None",
					"VatKeyStateFrag": "None",
					"VatCountKeyFrag": "",
					"VatCountDescFrag": "",
					"VatNumStateFrag": "None",
					"VatNumFrag": "",

					"UiAddressValidated": true,

					"Tax1State": "None",
					"Tax1Message": " ",
					"Tax2State": "None",
					"Tax2Message": " ",
					"Tax3State": "None",
					"Tax3Message": " ",
					"Tax4State": "None",
					"Tax4Message": " ",
					"Tax5State": "None",
					"Tax5Message": " ",
					"VatCountryViewState": "None",
					"VatCountryViewMessage": " ",
					"VatNumViewState": "None",
					"VatNumViewMessage": " ",

					"NaturalPerState": "None",
					"NaturalPerMessage": " ",
					"salesPurchase_TaxState": "None",
					"salesPurchase_TaxMessage": " ",
					"Equalization_TaxState": "None",
					"Equalization_TaxMessage": " ",
					"ICMS_ExemptState": "None",
					"ICMS_ExemptMessage": " ",
					"IPI_ExemptState": "None",
					"IPI_ExemptMessage": " "

				},
				CustomerClassification: {
					"Account_Type": "Customer",
					"IndustryClassification_1": "",
					"IndustryClassification_2": "",
					"Banner": "",
					"IndirectCustomer_Type": "",
					"BusinessActivity_Type": "",
					"Organization_Level": "",
					"AccountLegal_Status": "",
					"CommercialDeal_To": false,
					"ServiceDeal_To": false,
					"Store": false,

					"AccountTypeMessage": "",
					"AccountTypeState": "None",

					"IndustryClassification1Message": "",
					"IndustryClassification1State": "None",

					"IndustryClassification2Message": "",
					"IndustryClassification2State": "None",

					"BannerMessage": "",
					"BannerState": "None",

					"IndirectCustomerTypeMessage": "",
					"IndirectCustomerTypeState": "None",

					"BusinessActivityTypeMessage": "",
					"BusinessActivityTypeState": "None",

					"OrganizationLevelMessage": "",
					"OrganizationLevelState": "None",

					"AccountLegalStatusMessage": "",
					"AccountLegalStatusState": "None",
					"CommercialDeal_ToState": "None",
					"CommercialDeal_ToMessage": " ",
					"ServiceDeal_ToState": "None",
					"ServiceDeal_ToMessage": " ",
					"StoreState": "None",
					"StoreMessage": " ",

					"UiAddressValidated": false

				},
				ExternalIdentifer: {
					"ExternalIdenitir": [
						/*{
												enable: true,
												ExterIdtType: "",
												ExtIdntValue: "",
												ExternalTypeState: "None",
												ExternalTypeMessage: "",
												ExternalTypeValueState: "None",
												ExternalTypeValueMessage: ""
											}*/
					],
					"TotalExternalIdent": "0",
					"ExternalIdentifier_Type": "",
					"ExternalIdentifier_Value": "",
					"ChamberOf_Commerce": "",
					"DUNS": "",
					"Type": "",

					"ExternalTypeStateView": "None",
					"ExternalTypeMessageView": "",

					"ExtValueMessageView": "",
					"ExtValueStateView": "None",

					"ChamberofCommerceMessage": "",
					"ChamberofCommerceState": "None",

					"DUNSMessage": "",
					"DUNSState": "None",

					"ExtIdntValue": "",
					"ExterIdtType": "",
					"ExterIdtTypeDesc": "",
					"ExternalTypeState": "None",
					"ExternalTypeValueState": "None",
					"UiAddressValidated": false
				}
			};
			var modelMain1 = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(modelMain1, "CreateModelSet");
		},

		//create Customer Data Tab
		createEmptyCustomerDataTab: function() {
			var dataCust = {
				GenData: {
					AltBusiName: "",
					SearchTearm1: "",
					SearchTearm2: "",
					CommuLang: "",
					AuthoGrp: "",
					VendNum: "",
					TranspoZone: "",
					AltTranspoZone: "",
					RegStructGrp: "",
					GroupKey: "",
					TradingPartner: "",
					MainlyCivilianUsg: true,
					MainlyMailitaryUsg: false,
					UiCustGenDataValidated: false,
					LocationNo1: "",
					LocationNo2: "",
					CheckDegit: "",

					AltBusiNameMsg: "None",
					SearchTearm1Msg: "None",
					SearchTearm2Msg: "None",
					CommuLangMsg: "None",
					AuthoGrpMsg: "None",
					VendNumMsg: "None",
					TranspoZoneMsg: "None",
					AltTranspoZoneMsg: "None",
					RegStructGrpMsg: "None",
					GroupKeyMsg: "None",
					TradingPartnerMsg: "None",
					MainlyCivilianUsgMsg: "None",
					MainlyMailitaryUsgMsg: "None",
					LocationNo1Msg: "None",
					LocationNo2Msg: "None",
					CheckDegitMsg: "None"

				},
				UnloadingPoint: {
					UnloadPointArr: [{
						UnloadPoint: "",
						GoodsRecHrs: "",
						Default: false,
						CalenderKey: "",

						UnloadPointState: "None",
						UnloadPointMessage: " ",
						GoodsRecHrsState: "None",
						GoodsRecHrsMessage: " ",
						DefaultState: "None",
						DefaultMessage: " ",
						CalenderKeyState: "None",
						CalenderKeyMessage: " ",
						TotalCount: " 1 of 1",
						VisibleBasedOnNext: true,
						DayTable: [{
							Morningopen: null,
							Morningclose: null,
							Afternoonopen: null,
							Afternoonclose: null,
							Weekday: "Monday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false,
							MorningOpenMessage: " ",
							MorningOpenState: "None",
							MorningClosenMessage: " ",
							MorningCloseState: "None",
							AfternoonOpenMessage: " ",
							AfternoonOpenState: "None",
							AfternoonCloseMessage: " ",
							AfternoonCloseState: "None"
						}, {
							Morningopen: null,
							Morningclose: null,
							Afternoonopen: null,
							Afternoonclose: null,
							Weekday: "Tuesday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false,
							MorningOpenMessage: " ",
							MorningOpenState: "None",
							MorningClosenMessage: " ",
							MorningCloseState: "None",
							AfternoonOpenMessage: " ",
							AfternoonOpenState: "None",
							AfternoonCloseMessage: " ",
							AfternoonCloseState: "None"
						}, {
							Morningopen: null,
							Morningclose: null,
							Afternoonopen: null,
							Afternoonclose: null,
							Weekday: "Wednesday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false,
							MorningOpenMessage: " ",
							MorningOpenState: "None",
							MorningClosenMessage: " ",
							MorningCloseState: "None",
							AfternoonOpenMessage: " ",
							AfternoonOpenState: "None",
							AfternoonCloseMessage: " ",
							AfternoonCloseState: "None"
						}, {
							Morningopen: null,
							Morningclose: null,
							Afternoonopen: null,
							Afternoonclose: null,
							Weekday: "Thursday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false,
							MorningOpenMessage: " ",
							MorningOpenState: "None",
							MorningClosenMessage: " ",
							MorningCloseState: "None",
							AfternoonOpenMessage: " ",
							AfternoonOpenState: "None",
							AfternoonCloseMessage: " ",
							AfternoonCloseState: "None"
						}, {
							Morningopen: null,
							Morningclose: null,
							Afternoonopen: null,
							Afternoonclose: null,
							Weekday: "Friday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false,
							MorningOpenMessage: " ",
							MorningOpenState: "None",
							MorningClosenMessage: " ",
							MorningCloseState: "None",
							AfternoonOpenMessage: " ",
							AfternoonOpenState: "None",
							AfternoonCloseMessage: " ",
							AfternoonCloseState: "None"
						}, {
							Morningopen: null,
							Morningclose: null,
							Afternoonopen: null,
							Afternoonclose: null,
							Weekday: "Saturday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false,
							MorningOpenMessage: " ",
							MorningOpenState: "None",
							MorningClosenMessage: " ",
							MorningCloseState: "None",
							AfternoonOpenMessage: " ",
							AfternoonOpenState: "None",
							AfternoonCloseMessage: " ",
							AfternoonCloseState: "None"
						}, {
							Morningopen: null,
							Morningclose: null,
							Afternoonopen: null,
							Afternoonclose: null,
							Weekday: "Sunday",
							MornOpnEnable: false,
							MornCloseEnable: false,
							AfterOpnEnable: false,
							AfterCloseEnable: false,
							MorningOpenMessage: " ",
							MorningOpenState: "None",
							MorningClosenMessage: " ",
							MorningCloseState: "None",
							AfternoonOpenMessage: " ",
							AfternoonOpenState: "None",
							AfternoonCloseMessage: " ",
							AfternoonCloseState: "None"
						}]
					}],

					UiCustUnlodPointValidated: false
				},
				BankDetails: {
					AlternPayer: "",
					IndivEnteris: false,
					AllowedPayer: "",

					AlternPayerValState: "None",
					IndivEnterisValState: "None",
					AllowedPayerValState: "None",

					BankIBan: [{
						IBan: "",
						Country: "",
						BankKey: "",
						BankControlKey: "",
						BankAccount: "",
						BankAccHolder: "",
						BankType: "",
						RefDetails: "",
						IBanEnabled: true,
						BankDetailsEnabled: true,
						CollectionAuth: false,
						TotalCount: "1 of 1",
						VisibleBasedOnNext: true,

						IBanValState: "None",
						CountryValState: "None",
						BankKeyValState: "None",
						BankControlKeyValState: "None",
						BankAccountValState: "None",
						BankAccHolderValState: "None",
						BankTypeValState: "None",
						RefDetailsValState: "None",
						CollectionAuthValState: "None"
					}]
				}
			};
			var modelCustomerData = new sap.ui.model.json.JSONModel(dataCust);
			this.getView().setModel(modelCustomerData, "CustomerDataSet");
		},

		createAccountyEmptyModel2: function() {
			var accData = {
				AccountManagement: {
					ReconAccount: "",
					HeadOffice: "",
					SortKey: "",
					PrevAcctNo: "",
					BuyingGroup: "",

					ReconAccountMessage: "",
					ReconAccountState: "None",

					HeadOfficeMessage: "",
					HeadOfficeState: "None",

					SortKeyMessage: "",
					SortKeyState: "None",

					PrevAcctNoMessage: "",
					PrevAcctNoState: "None",

					BuyingGroupMessage: "",
					BuyingGroupState: "None",
					UIAccountManagementValidator: false
				},

				PaymentData: {
					TermsofPayment: "",
					Creditmemopaytterm: "",
					Bechangespaytterm: "",
					ToleranceGroup: "",
					PaymentMethods: "",
					HouseBank: "",
					SelectionRule: "",
					PaymentHistoryRecord: false,

					TermsofPaymentMessage: "",
					TermsofPaymentState: "None",

					CreditmemopayttermMessage: "",
					CreditmemopayttermState: "None",

					BechangespayttermMessage: "",
					BechangespayttermState: "None",

					ToleranceGroupMessage: "",
					ToleranceGroupState: "None",

					PaymentMethodsMessage: "",
					PaymentMethodsState: "None",

					HouseBankMessage: "",
					HouseBankState: "None",

					SelectionRuleMessage: "",
					SelectionRuleState: "None",
					PaymentHisRecodMessage: "",
					PaymentHisRecoState: "None",

					UIPaymentDataValidator: false
				},
				Correspondence: {
					DunnProcedure: "",
					LastDunned: null,
					DunningClerk: "",
					DunningBlock: "",
					DunningLevel: "",
					DunningArea: "",
					ClerkAbbrev: "",
					AcctAtCust: "",
					CustomerUser: "",
					ClerksInternet: "",
					AccountStatement: "",

					DunnProcedureMessage: "",
					DunnProcedureState: "None",

					LastDunnedMessage: "",
					LastDunnedState: "None",

					DunningClerkMessage: "",
					DunningClerkState: "None",

					DunningBlockMessage: "",
					DunningBlockState: "None",

					DunningLevelMessage: "",
					DunningLevelState: "None",

					DunningAreaMessage: "",
					DunningAreaState: "None",

					ClerkAbbrevMessage: "",
					ClerkAbbrevState: "None",

					AcctAtCustMessage: "",
					AcctAtCustState: "None",

					CustomerUserMessage: "",
					CustomerUserState: "None",

					ClerksInternetMessage: "",
					ClerksInternetState: "None",

					AccountStatementMessage: "",
					AccountStatementState: "None",
					UICorrespondenceValidator: false

				},
				AccountingDataTab: {
					AccountingDataTabVisible: this.getView().getModel("HeaderModelSet").getData().CompnyCodeKey.toString().trim() !== "" ? true : false
				},
				PaymentTerms: {
					explanation: "",
					preferred_pt: "",
					terms_of_payment: "",
					PaymentTermMessage: "",
					CreditMemoPayTermMessage: "",
					BeChangesPayTermMessage: "",

					terms_of_paymentMessage: "",
					terms_of_paymentState: "None"
				}
			};
			var oAccModel = new sap.ui.model.json.JSONModel(accData);
			this.getView().setModel(oAccModel, "AccountingDataModelSet");

		},

		//Resubmit & Review scenario
		createEmptyStatusDetailstab: function() {
			var statusDetails = {
				DeletionFlag: {
					DeletionFlagGeneric: false,
					DeletionFlagAccounting: false,
					DeletionFlagSales: false
				},
				BlockData: {
					PostingBlock: false,
					OrderBlock: "",
					DeliveryBlock: "",
					BillingBlock: "",
					BlockSalesReport: false,

					PostingBlockSate: "None",
					PostingBlockMessage: " ",
					OrderBlockState: "None",
					OrderBlockMessage: " ",
					DeliveryBlockState: "None",
					DeliveryBlockMessage: " ",
					BillingBlockState: "None",
					BillingBlockMessage: " ",
					BlockSalesReportState: "None",
					BlockSalesReportMessage: " "
				}
			};
			var modelCustomerData = new sap.ui.model.json.JSONModel(statusDetails);
			this.getView().setModel(modelCustomerData, "StatusDetailsSet");
		},

		//Resubmit & Review scenario
		//Text Note
		createEmptytextNoteModel: function() {
			var data2 = {
				TextNotes: {
					TextNotes2: [{
							Level: "",
							Language: "",
							TextType: "",
							FreeText: "",
							enable: false,
							LevelMessage: "",
							LevelState: "None",
							LanguageMessage: "",
							LanguageState: "None",
							TextTypeMessage: "",
							TextTypeState: "None",
							FreeTextMessage: "",
							FreeTextState: "None",
							TextTypeArray: []
						}]
						/*,
											Level: "",
											Language: "",
											TextType: "",
											FreeText: "",
											enable: false,
											TextAreaPopup: "",
											LevelMessage: "",
											LevelState: "None",
											LanguageMessage: "",
											LanguageState: "None",
											TextTypeMessage: "",
											TextTypeState: "None",
											FreeTextMessage: "",
											FreeTextState: "None"*/
				},
				Classification: {
					Classification2: [{
							"ClassificationType": "",
							"Classification": "",
							"Value": "",
							"ClassificationTypeMessage": "",
							"ClassificationTypeState": "None",
							"ClassificationMessage": "",
							"ClassificationState": "None",
							"ValueMessage": "",
							"ValueState": "None",
							"ClassiFicationArray": [],
							"ValueArray": []
						}]
						/*	"ClassificationType": "",
							"Classification": "",
							"Value": "",
							"ClassificationTypeMessage": "",
							"ClassificationTypeState": "None",
							"ClassificationMessage": "",
							"ClassificationState": "None",
							"ValueMessage": "",
							"ValueState": "None"*/
				}

			};
			var oMainModel2 = new sap.ui.model.json.JSONModel(data2);
			this.getView().setModel(oMainModel2, "TextNotesModelSet");
			/*	var oModelTextArea = new sap.ui.model.json.JSONModel({
					TextAreaPopup: ""
				});
				this.getView().setModel(oModelTextArea, "TextAreaSet");*/

			/*this.onTextNotesLangguage();
			this.onTextnotesLevel();
			this.onTextNotesClassification();*/
		},

		createEmptyContactDetailsTab: function() {
			var contactDetails = {
				ContactDetails: {
					Telebox: {
						"TeleboxNO": "",
						"TeleboxState": "None",
						"TeleboxMesage": " "
					},
					Telephone: {
						"TelephoneList": [],
						"TotalTelephone": "0",
						"Telephone": "",
						"Extension": "",
						"Comments": "",
						"Default": false,
						"TelephoneFrag": "",
						"ExtensionFrag": "",
						"CommentsFrag": "",
						"TelephoneValueState": "None",
						"TelephoneExtensionValueState": "None",

						"TelephoneViewState": "None",
						"TelephoneViewMessage": " ",

						"ExtenViewState": "None",
						"ExtenViewMessage": " ",

						"CommentViewState": "None",
						"CommentViewMessage": " ",

						"TelephoneEditable": true,
						"ExtensionEditable": true,
						"CommentsEditable": true

					},
					Fax: {
						"FaxList": [],
						"TotalFax": "0",
						"Fax": "",
						"Extension": "",
						"Comments": "",
						"Default": false,
						"FaxFrag": "",
						"ExtensionFrag": "",
						"CommentsFrag": "",
						"FaxValueState": "None",
						"FaxExtensionValueState": "None",

						"FaxViewState": "None",
						"FaxViewMessage": " ",

						"ExtenViewState": "None",
						"ExtenViewMessage": " ",

						"CommentViewState": "None",
						"CommentViewMessage": " ",

						"FaxEditable": true,
						"ExtensionEditable": true,
						"CommentsEditable": true

					},
					Email: {
						"EmailList": [],
						"TotalEmail": "0",
						"Email": "",
						"Comments": "",
						"Default": false,
						"EmailFrag": "",
						"CommentsFrag": "",
						"EmailValueState": "None",
						"EmailValueStateText": "",
						"EmailFragValueState": "None",
						"EmailFragValueStateText": "",

						"EmailViewState": "None",
						"EmailViewMessage": " ",

						"CommentViewState": "None",
						"CommentViewMessage": " ",

						"EmailEditable": true,
						"CommentsEditable": true
					},
					URL: {
						"URLList": [],
						"TotalURL": "0",
						"URL": "",
						"Comments": "",
						"Default": false,
						"URLFrag": "",
						"CommentsFrag": "",
						"URLValueState": "None",

						"UrlViewState": "None",
						"UrlViewMessage": " ",

						"CommentViewState": "None",
						"CommentViewMessage": " ",

						"URLEditable": true,
						"CommentsEditable": true
					},
					ContactPerson: {
						"ContactPersonList": [{
							"LastName": "",
							"FirstName": "",
							"Language": "",
							"Function": "",
							"Department": "",
							"Telephone": "",
							"TelephoneExtension": "",
							"Fax": "",
							"FaxExtension": "",
							"MobilePhone": "",
							"Email": "",
							"Notes": "",
							"Method": "",
							"TotalCount": "1 of 1",
							"VisibleBasedOnNext": true,

							"LastNameState": "None",
							"LastNameMessage": " ",

							"FunctionState": "None",
							"FunctionMessage": " ",

							"TelephoneState": "None",
							"TelephoneMessage": " ",

							"FaxState": "None",
							"FaxMessage": " ",

							"MobilePhoneState": "None",
							"MobilePhoneMessage": " ",

							"EmailValueState": "None",
							"EmailValueStateText": "",

							"MethodState": "None",
							"MethodStateText": "",

							"FirstNameState": "None",
							"FirstNameMessage": " ",

							"DepartmentState": "None",
							"DepartmentMessage": " ",

							"TelepExtensionState": "None",
							"TelepExtensionMessage": " ",

							"FaxExtensionState": "None",
							"FaxExtensionMessage": " ",

							"NotesState": "None",
							"NotesMessage": " ",

							"LanguageState": "None",
							"LanguageMessage": " "
						}]

					}

				}
			};
			var modelCustomerData = new sap.ui.model.json.JSONModel(contactDetails);
			this.getView().setModel(modelCustomerData, "ContactDetailsSet");
		},

		//communication Language
		onCommunicationLanguageGendata: function() {
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/REFLANGUAGE?order=code');
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						var dataOut = [];
						var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
						if (res !== undefined) {
							if (res.item !== undefined) {
								if (res.item.length === undefined) {
									dataOut = Array(res.item);
								} else {
									dataOut = res.item;
								}
							}
						}

						var communLangModel = new sap.ui.model.json.JSONModel({
							"results": dataOut
						});
						communLangModel.setSizeLimit(dataOut.length);
						that.getView().setModel(communLangModel, "CommunicationLangCDCombSet");

					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		},

		CloseDuplicateCheckDialog: function() {
			this._oValueHelpDialogpDupCheck.close();
		},

		hideDeletionBlock: function() {
			var data = {
				StatusData: {
					"DeletionBlock": false
				}
			};
			var oModel = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(oModel, "StatusDataTabModel");
		},

		getUploadedDocuments: function(status) {
			var UploadDocuments = [];
			var modelUpl = this.getView().getModel("FileUploadSet").getData().results;
			for (var i = 0; i < modelUpl.length; i++) {
				// if (status === "new" && modelUpl[i].DeleteEnabled === false && this.reviewScenario === true) {
				if (status === "new" && modelUpl[i].DeleteEnabled === false) {
					continue;
				}
				UploadDocuments.push({
					"DocumentUpload": {
						"Attachment": modelUpl[i].Content
					},
					"UploadedFiles": {
						"FileName": modelUpl[i].FileName,
						"FileSize": modelUpl[i].Size,
						"FileType": modelUpl[i].Type,
						"Note": modelUpl[i].Note.toString().trim(),
						//	"TimeStamp": Formatter.DateConversionToBackend(modelUpl[i].TimeStamp),
						"TimeStamp": modelUpl[i].TimeStamp,
						"Name_Of_Person": modelUpl[i].FullName
					}
				});
			}
			return UploadDocuments;
		},

		liveChangeCommentSubmit: function() {
			this._oValueHelpDialogComment.getModel("CommentSubmitModelSet").getData().CommentState = "None";
			this._oValueHelpDialogComment.getModel("CommentSubmitModelSet").refresh();
		},
		taxTypeMDMCall: function() {
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/TAXTYPE?order=code');
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataOut = [];
							var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							if (res !== undefined) {
								if (res.item !== undefined) {
									if (res.item.length === undefined) {
										dataOut = Array(res.item);
									} else {
										dataOut = res.item;
									}
								}
							}

							//Taxtion  Type
							var oODataJSONModel = new sap.ui.model.json.JSONModel({
								"NAVTAXTYPE": dataOut
							});
							oODataJSONModel.setSizeLimit(dataOut.length);
							that.getView().setModel(oODataJSONModel, "taxationSet");
						}

					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});

		},

		taxNumberTypeMDMCall: function() {
			var that = this;
			var Filter1 = new sap.ui.model.Filter('URL', 'EQ', '/RESTAdapter/REST_MDM/MDMRefTable/TAXNUMBERTYPE?order=code');
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.oModel.read(
				"/BusinessPartnerSet", {
					method: "GET",
					filters: [Filter1],
					success: function(oData, oResponse) {
						oBusyDialog.close();
						if (oData.results[0].Response.includes("<h1>Error</h1>")) {
							var message = oData.results[0].Response.split("<pre>")[1].split("</pre>")[0];
							that.errMsg(message);
						} else {
							var dataOut = [];
							var res = JSON.parse(oData.results[0].Response)["BaseObject.Pager"];
							if (res !== undefined) {
								if (res.item !== undefined) {
									if (res.item.length === undefined) {
										dataOut = Array(res.item);
									} else {
										dataOut = res.item;
									}
								}
							}

							var oODataJSONModel2 = new sap.ui.model.json.JSONModel({
								"NAVTAXNUMTYPE": dataOut
							});
							oODataJSONModel2.setSizeLimit(dataOut.length);
							that.getView().setModel(oODataJSONModel2, "taxNumSet");
						}

					},
					error: function(oError) {
						oBusyDialog.close();
					}
				});
		}

	});

});
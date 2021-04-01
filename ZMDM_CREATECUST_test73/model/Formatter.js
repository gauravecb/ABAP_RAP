jQuery.sap.require("sap.ca.ui.model.format.DateFormat");
jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");
jQuery.sap.declare("MDMZCUSTOMER.model.Formatter");

MDMZCUSTOMER.model.Formatter = (function() {
	return {
		basedOnNaturalPersonChangeTaxLabel: function(textVal, NatuPer, textNo) {
			if (textVal !== undefined) {
				var val = textVal.split("||");
				if (NatuPer !== undefined && NatuPer !== "") {
					if (NatuPer === true) {
						if (val.length > 1) {
							if (val[1] !== "") {
								return textNo + " (" + val[1] + ")";
							} else {
								return textNo;
							}
						} else if (val.length == 1) {
							if (val[0] !== "") {
								return textNo + " (" + val[0] + ")";
							} else {
								return textNo;
							}

						} else {
							return textNo;
						}
					}

					if (NatuPer === false) {
						if (val.length >= 1) {
							if (val[0] !== "") {
								return textNo + " (" + val[0] + ")";
							} else {
								return textNo;
							}
						} else {
							return textNo;
						}
					}
				}
			}
		},

		//count of vat country vat num
		countBasedVatCountryVatNum: function(val1, val2) {
			return val2 + " (" + val1 + ")";
		},

		countBasedExtTypeValue: function(val1, val2) {
			return val2 + " (" + val1 + ")";
		},

		calenderKeyTest: function(val1, val2) {

		},

		//day Table Customer Data Tab
		DayTimeTableEnabled: function(val1, val2) {
			if (val1 === true && val2 === true) {
				return true;
			} else {
				return false;
			}
		},

		BankdetailsEnabled: function(val1, val2) {
			//assign edit value 
			var val2 = true;
			if (val1 !== undefined && val1 !== null && val1.trim() !== "") {
				return false;
			} else if (val2 === true) {
				return true;
			} else {
				return false;
			}
		},
		BankdetailsIBanEnabled: function(val1, val2, val3, val4, val5, iban) {
			//assign edit value 
			var val5 = true;
			if (iban !== undefined && iban !== null && iban.trim() !== "" && val5 === true) {
				return true;
			}

			if ((val1 !== undefined && val1 !== null && val1.trim() !== "") ||
				(val2 !== undefined && val2 !== null && val2.trim() !== "") ||
				(val3 !== undefined && val3 !== null && val3.trim() !== "") ||
				(val4 !== undefined && val4 !== null && val4.trim() !== "")) {
				return false;
			} else if (val5 === true) {
				return true;
			} else {
				return false;
			}
		},
		basedOnInputLengthNeedToShowcommentButtoninTextNotes: function(value1) {
			if (value1 !== null && value1 !== undefined && value1.trim().length > 40) {
				return true;
			} else {
				return false;
			}
		},
		countBasedTelephone: function(val1, val2) {
			return val2 + " (" + val1 + ")";
		},

		DateTimeConversionDDMMYYTime: function(oDate) {
			if (oDate) {
				var oDateFormat = sap.ca.ui.model.format.DateFormat.getTimeInstance({
					pattern: "dd.MM.YYYY\' \'HH:mm:ss"
				});
				return oDateFormat.format(oDate);
			} else {
				return "";
			}
		},
		enableBasedOnUnloadPointCalenderKey: function(unlodPoint, CalenderKey, Editable) {
			if (unlodPoint !== undefined && unlodPoint !== null && unlodPoint.trim() !== "" && CalenderKey !== undefined && CalenderKey !== null &&
				CalenderKey.trim() !== "" && Editable !== "HIDE") {
				return true;
			} else {
				return false;
			}
		},

		//code value pair with Paranthesis
		//code value
		codeValuePair: function(oVal1, oVal2) {
			if (oVal1 === undefined && oVal2 === undefined) {
				return "";
			}

			if (oVal1 !== "" && oVal2 !== "") {
				//	return oVal2 +" ("+oVal1+")";
				return oVal1 + " - " + oVal2;
			} else if (oVal1 !== "") {
				return oVal1;
			} else if (oVal2 !== "") {
				return oVal2;
			} else {
				return "";
			}
		},

		fileUploadFileSizeConvert: function(size) {
			if (size !== null && size !== undefined && isNaN(size) === false) {
				if (parseInt(size) < 1048576) {
					return (parseInt(size) * 0.0009765625).toFixed(1) + " KB";
				} else {
					return (parseInt(size) * 0.00000095367432).toFixed(1) + " MB";
				}
			} else {
				return size;
			}
		},
		fileUploadFileType: function(name) {
			if (name !== null && name !== undefined) {
				return name.split(".").pop();
			} else {
				return name;
			}
		},
		//converting date 
		dateToStringForm: function(oDate) {
			if (oDate) {
				var oDateFormat = sap.ca.ui.model.format.DateFormat
					.getTimeInstance({
						pattern: "dd:MM:yyyy HH:mm"
					});
				return oDateFormat.format(oDate);
			} else {
				return null;
			}
		},

		addTimeFormat: function(time) {
			if (time) {
				var oDateFormat = sap.ca.ui.model.format.DateFormat
					.getTimeInstance({
						pattern: "HH:mm:ss"
					});
				return oDateFormat.format(time);
			} else {
				return null;
			}
		},

		//converting date  for send backend
		DateConversionToBackend: function(oDate) {
			if (oDate) {
				var oDateFormat = sap.ca.ui.model.format.DateFormat
					.getTimeInstance({
						pattern: "yyyy-MM-dd\'T\'HH:mm:ss"
					});
				return oDateFormat.format(oDate);
			} else {
				return null;
			}
		},

		sendForReviewVisble: function(selTab, edit) {
			//selTab = "ID_OP_UPLOD_DOC";
			if (edit && selTab === "ID_OP_UPLOD_DOC") {
				return true;
			} else {
				return false;
			}
		},

		sendForReviewVisbleCreate: function(selTab, edit) {
			edit = true;
			//selTab = "ID_OP_UPLOD_DOC";
			if (edit && selTab === "ID_OP_UPLOD_DOC") {
				return true;
			} else {
				return false;
			}
		},

		duplicateCheckBtnVisble: function(selTab, edit) {
			if (edit && selTab !== "ID_OP_UPLOD_DOC") {
				return true;
			} else {
				return false;
			}
		},

		duplicateCheckBtnVisbleCreate: function(selTab, edit) {
			edit = true;
			if (edit && selTab !== "ID_OP_UPLOD_DOC") {
				return true;
			} else {
				return false;
			}
		},

		ChengeBtnVisble: function(selTab, edit) {
			if (edit) {
				return false;
			} else {
				return true;
			}
		},

		requiredLabel: function(val) {
			if (val === "REQUIRED") {
				return true;
			} else {
				return false;
			}
		},
		optionalDisabled: function(val) {
			if (val !== "HIDE") {
				return true;
			} else {
				return false;
			}
		},
		podTimeFrameEnabled: function(val, relpod) {
			if (relpod) {
				if (val !== "HIDE") {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		basedOnDunningProcedure: function(val, dunnProce) {
			if (dunnProce !== "") {
				if (val !== "HIDE") {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		BasedOnPartialDeilPerItm: function(val, parDel) {
			if (parDel !== "") {
				if (val !== "HIDE") {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		bankDetailsEnabledCond: function(current, cond) {
			if (current && cond !== "HIDE") {
				return true;
			} else {
				return false;
			}
		},
		EnabledHdrBusAreaBothCond: function(current, cond) {
			if (current && cond !== "HIDE") {
				return true;
			} else {
				return false;
			}
		},

		NameaddSectionEnabledCond: function(current, cond) {
			if (current && cond !== "HIDE") {
				return true;
			} else {
				return false;
			}
		},

		//for Display screen checkbox
		checkBoxCheck: function(val) {
			if (val === "Y" || val === true || val === "X") {
				return true;
			} else {
				return false;
			}
		},

		readBackendTime: function(mrgOpn) {
			if (mrgOpn) {
				return new Date(0, 0, 0, mrgOpn.split("PT")[1].split("H")[0], mrgOpn.split("PT")[1].split("H")[1].split(
					"M")[
					0], mrgOpn.split("PT")[1].split("H")[1].split("M")[1].split("S")[0]);
			} else {
				return null;
			}
		},
		buttonHanldeiExBusSubEdit: function(mode) {
			if (mode === "EDIT") {
				return true;
			} else {
				return false;
			}
		},
		buttonHanldeiExBusSubOpen: function(mode) {
			if (mode === "OPEN") {
				return true;
			} else {
				return false;
			}
		},

		partnerFunBtnEnable: function(partFun, edit) {
			if (partFun && edit) {
				return true;
			} else {
				return false;
			}
		},
		VisibleSalesDataTabExtension: function(SalesOrg, DistChannel, Division) {
			if (SalesOrg !== "" && DistChannel !== "" && Division !== "") {
				return true;
			} else {
				return false;
			}

		},
		AccountGroupText: function(accountGroup) {
			switch (accountGroup) {
				case "0001":
					var accountGroupText = accountGroup + " - " + "Sold-to party";
					break;
				case "0002":
					accountGroupText = accountGroup + " - " + "Ship-to party";
					break;
				case "0003":
					accountGroupText = accountGroup + " - " + "Payer";
					break;
				case "0004":
					accountGroupText = accountGroup + " - " + "Bill-to party";
					break;
			}
			return accountGroupText;
		},

		readLastDunnedDate: function(date) {
			if (date === null || date === "" || date === undefined) {
				return null;
			} else {
				var outDate = date.replace(/[^0-9]+/g, '');
				if (outDate !== null && outDate !== "") {
					return new Date(parseInt(outDate));
				} else {
					return null;
				}
			}
		},

		dateSendToSap: function(date) {
			if (date) {
				var oDateFormat = sap.ca.ui.model.format.DateFormat
					.getTimeInstance({
						pattern: "yyyy-MM-dd\'T\'HH:mm:ss"
					});
				return oDateFormat.format(date);
			} else {
				return null;
			}

		},

		readLastDunnedDateApproval: function(date) {
			if (date) {
				return new Date(date);
			} else {
				return null;
			}
		},

		createTooltipConcat: function(reviewScenario, oldValue, NewValue, text) {
			if (reviewScenario === true && oldValue !== "" && oldValue !== NewValue) {
				return oldValue + " - " + text;
			} else {
				return "";
			}
		},

		createTooltipText: function(reviewScenario, oldValue, NewValue, text) {
			if (reviewScenario === true && oldValue !== "" && oldValue !== NewValue) {
				return text;
			} else {
				return "";
			}
		}

		// createTooltipConcatUndefined: function(reviewScenario, oldValueArray, oldValue, NewValue, text) {
		// 	if (reviewScenario === true && oldValueArray !== undefined && oldValue !== "" && oldValue !== NewValue) {
		// 		return oldValue + " - " + text;
		// 	} else {
		// 		return "";
		// 	}
		// },

		// createTooltipTextUndefined: function(reviewScenario, oldValueArray, oldValue, NewValue, text) {
		// 	if (reviewScenario === true && oldValueArray !== undefined && oldValue !== "" && oldValue !== NewValue) {
		// 		return text;
		// 	} else {
		// 		return "";
		// 	}
		// }

	};
}());
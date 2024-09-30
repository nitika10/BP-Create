sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("com.bp.bpcreate.controller.Main", {
            onInit: function () {
                let bpAddDataModel = new JSONModel()
                // this.getView().setModel(bpAddDataModel, "BPData");
                this.getOwnerComponent().setModel(bpAddDataModel, "BPData"); // Store at component level
                this._initialTemplate = {
                    Msg: '',
                    ToMultiCustDataNav: [
                        {
                            Msg: '',
                            Referencenumber: '',
                            Custacctgroup: '',
                            Panno: '',
                            Title: '',
                            Name: '',
                            Street: '',
                            City: '',
                            District: '',
                            Region: '',
                            Postalcode: '',
                            Country: '',
                            Language: '',
                            Searchterm1: '',
                            Companycode: '',
                            Reconcacct: '',
                            Salesorg: '',
                            Distchannel: '',
                            Division: '',
                            Currency: '',
                            Pricingproc: '',
                            Shipcond: '',
                            Custgroup: '',
                            Salesdistrict: '',
                            Salesoffice: '',
                            Pricegroup: '',
                            Incoterms: '',
                            Incotermsloc: '',
                            Paymentterms: ''
                            
                        }
                    ]
                }
            },
            
            onDataAdd: function (e) {
                this._import(e.getParameter("files") && e.getParameter("files")[0]);
                console.log(e.getParameter("files"));
                console.log(e.getParameter("files")[0]);
                
            },

            _import: function (file) {
                var that = this;
                var excelData = {};
                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        workbook.SheetNames.forEach(function (sheetName) {
                            // Here is your object for every sheet in workbook
                            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    
                        });
                        // Setting the data to the local model 
                        console.log(excelData);
                        // let bpNewDataModel = that.getView().getModel("BPData");
                        let bpNewDataModel = that.getView().getModel("BPData");
                        bpNewDataModel.setData({
                            items: excelData
                        });
                        console.log(that.getView().getModel("BPData").getData());
                        bpNewDataModel.refresh(true);
                    };
                    reader.onerror = function (ex) {
                        console.log(ex);
                    };
                    reader.readAsBinaryString(file);
                }
            },

            onUploadTemplate: function () {
                let that = this
                let custData = this.getView().getModel("BPData").getData();
                let oDataModel = this.getView().getModel()
                let arrPayload = [] 

                custData.items.forEach( (el) =>
                arrPayload.push({
                    Custacctgroup: el.CustAcctGroup.toString(),
                    Panno: el.PANNO.toString(),
                    Title: el.Title.toString(),
                    Name: el.Name.toString(),
                    Street: el.Street.toString(),
                    City: el.City.toString(),
                    District: el.District.toString(),
                    Region: el.State.toString(),
                    Postalcode: el.PostalCode.toString(),
                    Country: el.Country.toString(),
                    Language: el.Language.toString(),
                    Searchterm1: el.SearchTerm1.toString(),
                    Companycode: el.CompanyCode.toString(),
                    Reconcacct: el.ReconcAcct.toString(),
                    Salesorg: el.SalesOrg.toString(),
                    Distchannel: el.DistChannel.toString(),
                    Division: el.Division.toString(),
                    Currency: el.Currency.toString(),
                    Pricingproc: el.PricingProc.toString(),
                    Shipcond: el.ShipCond.toString(),
                    Custgroup: el.CustGroup.toString(),
                    Salesdistrict: el.SalesDistrict.toString(),
                    Salesoffice: el.SalesOffice.toString(),
                    Pricegroup: el.PriceGroup.toString(),
                    Incoterms: el.IncoTerms.toString(),
                    Incotermsloc: el.IncoTermsLoc.toString(),
                    Paymentterms: el.PaymentTerms.toString()

                })
                )
                // let arrPayload = [
                //     {
                //         Custacctgroup : custData.items[0].CustAcctGroup.toString(),
                //         Panno: custData.items[0].PANNO.toString(),
                //         Title: custData.items[0].Title.toString(),
                //         Name: custData.items[0].Name.toString(),
                //         Street: custData.items[0].Street.toString(),
                //         City: custData.items[0].City.toString(),
                //         District: custData.items[0].District.toString(),
                //         Region: custData.items[0].State.toString(),
                //         Postalcode: custData.items[0].PostalCode.toString(),
                //         Country: custData.items[0].Country.toString(),
                //         Language: custData.items[0].Language.toString(),
                //         Searchterm1: custData.items[0].SearchTerm1.toString(),
                //         Companycode: custData.items[0].CompanyCode.toString(),
                //         Reconcacct: custData.items[0].ReconcAcct.toString(),
                //         Salesorg: custData.items[0].SalesOrg.toString(),
                //         Distchannel: custData.items[0].DistChannel.toString(),
                //         Division: custData.items[0].Division.toString(),
                //         Currency: custData.items[0].Currency.toString(),
                //         Pricingproc: custData.items[0].PricingProc.toString(),
                //         Shipcond: custData.items[0].ShipCond.toString(),
                //         Custgroup: custData.items[0].CustGroup.toString(),
                //         Salesdistrict: custData.items[0].SalesDistrict.toString(),
                //         Salesoffice: custData.items[0].SalesOffice.toString(),
                //         Pricegroup: custData.items[0].PriceGroup.toString(),
                //         Incoterms: custData.items[0].IncoTerms.toString(),
                //         Incotermsloc: custData.items[0].IncoTermsLoc.toString(),
                //         Paymentterms: custData.items[0].PaymentTerms.toString()
                //     }
                // ]
                let oPayload  = {
                    Msg: '',
                    ToMultiCustDataNav: arrPayload
                }
                console.log(oPayload)
                // oData.items = oData.items
                oDataModel.create('/CustMultiSet', oPayload, {
                    success: function (msg) {
                        MessageBox.success("Created Successfully")
                        console.log(msg)
                        console.log(oPayload)
                    },
                    error: function (msg) {
                        let errorMsg = JSON.parse(msg.responseText).error.innererror.errordetails
                        let returnMsg = []
                        errorMsg.forEach((error)=>{ 
                            returnMsg.push({
                                code: error.code,
                                message: error.message,
                                severity: error.severity
                            })
                        })
                        that
                        ._setReturnData(errorMsg)
                        .then(that._onResponsivePaddingDialogPress.bind(that))
                      console.log(msg)
                      console.log(errorMsg)

                        // MessageBox.error(msg)
                    }
                })
            },

            _onResponsivePaddingDialogPress: function () {
                if (!this.oResponsivePaddingDialog) {
                  let oTable = new sap.m.Table({
                    fixedLayout: false,
                    alternateRowColors: true,
                    columns: [
                      new sap.m.Column({
                        header: new sap.m.Label({
                          text: 'Code',
                        }),
                      }),
                      new sap.m.Column({
                        header: new sap.m.Label({
                          text: 'Message',
                        }),
                      }),
                      new sap.m.Column({
                        header: new sap.m.Label({
                          text: 'Severity',
                        }),
                      }),
                    ],
                  })
                  oTable.addItem(
                    new sap.m.ColumnListItem({
                      cells: [
                        new sap.m.Text({
                          text: '{returnMsg>code}',
                        }),
                        new sap.m.Text({
                          text: '{returnMsg>message}',
                        }),
                        new sap.m.Text({
                          text: '{returnMsg>severity}',
                        }),
                      ],
                    }),
                  )
                  oTable.bindAggregation('items', {
                    path: 'returnMsg>/',
                    template: new sap.m.ColumnListItem({
                      cells: [
                        new sap.m.Text({
                          text: '{returnMsg>code}',
                        }),
                        new sap.m.Text({
                          text: '{returnMsg>message}',
                        }),
                        new sap.m.Text({
                          text: '{returnMsg>severity}',
                        }),
                      ],
                    }),
                  })
                  this.oResponsivePaddingDialog = new sap.m.Dialog({
                    title: 'BAPI Return',
                    contentWidth: '760px',
                    contentHeight: '450px',
                    resizable: true,
                    draggable: true,
                    beginButton: new sap.m.Button({
                      type: sap.m.ButtonType.Emphasized,
                      text: 'OK',
                      press: function () {
                        this.oResponsivePaddingDialog.close()
                      }.bind(this),
                    }),
                    endButton: new sap.m.Button({
                      text: 'Close',
                      press: function () {
                        this.oResponsivePaddingDialog.close()
                      }.bind(this),
                    }),
                  })
                  this.oResponsivePaddingDialog.addContent(oTable)
                  // Enable responsive padding by adding the appropriate classes to the control
                  this.oResponsivePaddingDialog.addStyleClass(
                    'sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader',
                  )
        
                  //to get access to the controller's model
                  this.getView().addDependent(this.oResponsivePaddingDialog)
                }
        
                this.oResponsivePaddingDialog.open()
              },

            _setReturnData: function (errorMsg) {
                let that = this
                return new Promise((resolve, reject) => {
                  this.getView().setModel(new JSONModel(errorMsg), 'returnMsg')
                  resolve()
                })
              },
            
            onApprove: function () {
                this.getOwnerComponent().getRouter().navTo("Approve")
            }

        });
    });

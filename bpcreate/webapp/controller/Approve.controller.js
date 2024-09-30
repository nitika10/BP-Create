sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    "sap/m/MessageToast"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller,
    JSONModel,
    MessageBox,
    MessageToast) {
    'use strict'
    return Controller.extend('com.bp.bpcreate.controller.Approve', {
      onInit: function () {
        let approveDataModel = new JSONModel()
        this.getView().setModel(approveDataModel, 'approveData')
        // let bpDataNewModel = this.getOwnerComponent().getModel('bpData')
        // bpDataNewModel.getData()
        this._initialTemplate = {
          Timestamp: '',
          RefNo: '',
          UserLevel: '',
          Name: '',
          Status: '',
          Remarks: '',
        }

        let oModel = this.getOwnerComponent().getModel('ZNI_BPAPPROVE_SRV')
        let approveDataArr = []
        oModel.read('/ApproverSet', {
          success: function (oData) {
            console.log(oData)
            oData.results.forEach((el) =>
              approveDataArr.push({
                RefNo: el.RefNo,
                Timestamp: el.Timestamp,
                Name: el.Name,
                UserLevel: el.UserLevel,
                Status: el.Status,
                Remarks: el.Remarks,
                inProcess: el.Status === 'PEND' ? true : false,
              }),
            )
            approveDataModel.setData(approveDataArr)
          },
          error: function (err) {
            MessageBox.error(err)
          },
        })
      },

      onApproveData: async function (oEvent) {
        let that = this
        let oButton = oEvent.getSource()
        let oBindingContext = oButton.getBindingContext('approveData')
        if (!oBindingContext) {
          console.error('No binding context found for the selected row.')
          return
        }
        let selectedData = oBindingContext.getObject()
        let oPayload = {
          RefNo: selectedData.RefNo,
          Timestamp: selectedData.Timestamp,
          UserLevel: selectedData.UserLevel,
          Name: selectedData.Name,
          Status: selectedData.Status,
          Remarks: selectedData.Remarks,
        }
        let oModel = this.getView().getModel('ZNI_BPAPPROVE_SRV')
        let oJSONModel = this.getView().getModel('approveData')
        let approvalState = await this._sendData(oModel, oPayload)
        if (approvalState) {
          let fetchData = await this._fetchData(oModel)
          if (fetchData.state) {
            oJSONModel.setData(fetchData.data)
            oJSONModel.refresh(true)
          }
        }
      },

      _fetchData: function (oGetModel) {
        let approveDataArr = []
        return new Promise(function (resolve, reject) {
          oGetModel.read('/ApproverSet', {
            success: function (oData) {
              console.log(oData)
              oData.results.forEach((el) =>
                approveDataArr.push({
                  RefNo: el.RefNo,
                  Timestamp: el.Timestamp,
                  Name: el.Name,
                  UserLevel: el.UserLevel,
                  Status: el.Status,
                  Remarks: el.Remarks,
                  inProcess: el.Status === 'PEND' ? true : false,
                }),
              )
              resolve({
                state: true,
                data: approveDataArr,
              })
            },
            error: function (err) {
              MessageBox.error(err)
              reject({
                state: false,
                data: [],
              })
            },
          })
        })
      },

      _sendData: function (oApproveModel, oPayload) {
        let that = this
        return new Promise((resolve, reject) => {
          oApproveModel.create('/ApproverSet', oPayload, {
            success: function (msg) {
              MessageBox.success('Approved')
              resolve(true)
            },
            error: function (msg) {
              // MessageBox.error(msg, "Error")
              let errorMsg = JSON.parse(msg.responseText).error.innererror
                .errordetails
              let returnMsg = []
              errorMsg.forEach((error) => {
                returnMsg.push({
                  code: error.code,
                  message: error.message,
                  severity: error.severity,
                })
              })
              that
                ._setReturnData(errorMsg)
                .then(that._onResponsivePaddingDialogPress.bind(that))
              console.log(msg)
              console.log(errorMsg)
              reject(false)
            },
          })
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

      onStatus: function (oEvent) {
        // this.getOwnerComponent().getModel()
        this._statusInput = oEvent.getSource()
        let oTable = new sap.m.Table({
          fixedLayout: false,
          mode: sap.m.ListMode.SingleSelectLeft,
          selectionChange: this._onSelectionChange.bind(this),
        })
        oTable.bindAggregation('items', {
          path: '/StatusVHSet',
          template: new sap.m.ColumnListItem({
            cells: [
              new sap.m.Text({
                text: '{Status}',
              }),
              new sap.m.Text({
                text: '{StatusDesc}',
              }),
            ],
          }),
        })
        oTable.addColumn(
          new sap.m.Column({
            header: new sap.m.Label({
              text: 'Status',
            }),
          }),
        )
        oTable.addColumn(
          new sap.m.Column({
            header: new sap.m.Label({
              text: 'Status Description',
            }),
          }),
        )
        oTable.addItem(
          new sap.m.ColumnListItem({
            cells: [
              new sap.m.Text({
                text: '{Status}',
              }),
              new sap.m.Text({
                text: '{StatusDesc}',
              }),
            ],
          }),
        )
        let oTableModel = this.getOwnerComponent().getModel('ZNI_BPAPPROVE_SRV')
        oTable.setModel(oTableModel)
        this._oValueHelpDialog = new sap.m.Dialog({
          title: 'Status',
        })
        this.getView().addDependent(this._oValueHelpDialog)
        this._oValueHelpDialog.addContent(oTable)
        this._oValueHelpDialog.open()
      },

      _onSelectionChange: function (oEvent) {
        this._statusInput.setValue(
          oEvent.getParameter('listItem').getBindingContext().getObject()
          .Status,
        )
        this._oValueHelpDialog.close()
      },


      // For Downloading PDF and Uploading it to SAP

      onPdfDownload: function () {
        let oTable = this.byId("approveTable");
        let aSelectedIndices = oTable.getSelectedIndices();
        let oModel = this.getView().getModel("approveData");
        let aSelectedData = [];
      
        // Gather data for the selected rows
        aSelectedIndices.forEach(function (index) {
          let oContext = oTable.getContextByIndex(index);
          if (oContext) {
            aSelectedData.push(oContext.getObject());
          }
        });
      
        if (aSelectedData.length === 0) {
          sap.m.MessageBox.warning("Please select at least one row to download the PDF.");
          return;
        }
      
        let { jsPDF } = window.jspdf;
      
        // Iterate over selected data to generate PDFs for each selected row
        aSelectedData.forEach((item, idx) => {
          let doc = new jsPDF();

              // Add Header Section with Title and Styling
              doc.setFont("helvetica", "bold");
              doc.setFontSize(18);
              doc.setTextColor(44, 62, 80); // Dark blue
              doc.text("Approval Data", 105, 20, null, null, "center");

              doc.setFontSize(12);
              doc.setDrawColor(44, 62, 80); // Blue line
              doc.line(10, 30, 200, 30); // Horizontal line separator

              // Set Label and Value Alignment and Formatting for the first box
              let labelX = 10;  // X position for labels
              let valueX = 60;  // X position for values
              let lineSpacing = 10; // Space between lines
              let boxPadding = 5; // Padding for boxes

              let yOffset = 40; // Start with some gap from the top

              // Draw the first box for Reference No, Name, and Company Code
              doc.setDrawColor(100, 100, 100); // Gray border
              doc.roundedRect(5, yOffset, 200, 3 * lineSpacing + boxPadding, 3, 3); // Rounded corner box for Reference No, Name, and Company Code

              // Add Reference No
              doc.setFont("helvetica", "bold");
              doc.setTextColor(52, 73, 94); // Dark gray
              doc.text("Reference No:", labelX, yOffset + 10); // Reference No label

              doc.setFont("helvetica", "normal");
              doc.setTextColor(39, 174, 96); // Green for values
              doc.text(item.RefNo || "N/A", valueX, yOffset + 10); // Reference No value

              // Add Name
              doc.setFont("helvetica", "bold");
              doc.setTextColor(52, 73, 94); // Dark gray
              doc.text("Name:", labelX, yOffset + 20); // Name label

              doc.setFont("helvetica", "normal");
              doc.setTextColor(39, 174, 96); // Green for values
              doc.text(item.Name || "N/A", valueX, yOffset + 20); // Name value

              // Add Company Code
              doc.setFont("helvetica", "bold");
              doc.setTextColor(52, 73, 94); // Dark gray
              doc.text("Company Code:", labelX, yOffset + 30); // Company Code label

              doc.setFont("helvetica", "normal");
              doc.setTextColor(39, 174, 96); // Green for values
              doc.text(item.CompanyCode || "N/A", valueX, yOffset + 30); // Company Code value

              yOffset += 50; // Increase the yOffset to leave space between the two boxes

              // Draw the second box for additional details
              let fields = [
                  { label: "Timestamp", value: new Date(item.Timestamp).toLocaleString() },
                  { label: "User Level", value: item.UserLevel },
                  { label: "Status", value: item.Status },
                  { label: "Remarks", value: item.Remarks },
              ];

              // Draw a Box Around the Details Section for a Cleaner Look
              doc.setDrawColor(100, 100, 100); // Gray border
              doc.roundedRect(5, yOffset, 200, fields.length * lineSpacing + boxPadding, 3, 3); // Rounded corner box for details

              // Add Fields with Labels and Values in the second box
              fields.forEach((field) => {
                  doc.setFont("helvetica", "bold");
                  doc.setTextColor(52, 73, 94); // Dark gray
                  doc.text(field.label + ":", labelX, yOffset + 10); // Label

                  doc.setFont("helvetica", "normal");
                  doc.setTextColor(39, 174, 96); // Green for values
                  doc.text(field.value || "N/A", valueX, yOffset + 10); // Value

                  yOffset += lineSpacing;
              });

              // Add Footer with Timestamp and Page Number
              yOffset += 20; // Extra space before footer
              doc.setFontSize(10);
              doc.setTextColor(128, 139, 150); // Light gray
              doc.text("Generated on: " + new Date().toLocaleString(), 10, 280); // Generation timestamp
              doc.text("Page 1", 200, 280, null, null, "right"); // Page number

              // Create Blob for SAP upload and Download
              let pdfBlob = doc.output("blob");

              // Save the PDF with a Descriptive Filename
              let fileName = `ApprovalData_${item.RefNo}_${item.UserLevel}.pdf`;
              doc.save(fileName);
      
          // Convert Blob to Base64
          let reader = new FileReader();
          reader.onloadend = function () {
            let base64Data = reader.result.split(",")[1]; // Get Base64 part
      
            // Now attach this base64 PDF data to SAP using the OData service
            this.attachPdfToSap(item.RefNo, base64Data, item.Name, item.UserLevel);
          }.bind(this);  // Bind "this" to ensure context is maintained
      
          reader.readAsDataURL(pdfBlob);  // Trigger the conversion
        });
      
        sap.m.MessageToast.show("PDF files have been downloaded and attached.");
      },
      
      attachPdfToSap: function (refNo, base64Data, name, userLevel) {
        // Get the OData model for ZNI_BPAPPROVE_SRV
        let oModel = this.getOwnerComponent().getModel("ZNI_BPAPPROVE_SRV");
      
        let payload = {
          RefNo: refNo,
          UserLevel: userLevel,
          PdfFile: base64Data,
          FileName: `ApprovalData_${refNo}.pdf`,
          MimeType: "application/pdf",
          Name: name
        };
      
        // Call OData service to attach the PDF
        oModel.update(`/ApproverSet(RefNo='${payload.RefNo}',UserLevel='${payload.UserLevel}')`, payload, {
          method: 'PUT',
          success: function (oData) {
            sap.m.MessageToast.show("PDF attached successfully to SAP.");
          },
          error: function (oError) {
            let errorMsg = JSON.parse(oError.responseText).error.message.value;
            sap.m.MessageBox.error("Error attaching PDF to SAP: " + errorMsg);
          }
        });
      }
      
      
    
      // only for uploading Data to SAP
      // onPdfDownload: function () {
      //   let oTable = this.byId("approveTable");
      //   let aSelectedIndices = oTable.getSelectedIndices();
      //   let oModel = this.getView().getModel("approveData");
      //   let aSelectedData = [];
        
      //   // Gather data for the selected rows
      //   aSelectedIndices.forEach(function (index) {
      //     let oContext = oTable.getContextByIndex(index);
      //     if (oContext) {
      //       aSelectedData.push(oContext.getObject());
      //       console.log(aSelectedIndices)
      //     }
      //   });

      //   if (aSelectedData.length === 0) {
      //     sap.m.MessageBox.warning("Please select at least one row to download the PDF.");
      //     return;
      //   }

      //   let {
      //     jsPDF
      //   } = window.jspdf;

      //   aSelectedData.forEach((item) => {
      //     let doc = new jsPDF();

      //     // Add Header Section with Title and Styling
      //     doc.setFont("helvetica", "bold");
      //     doc.setFontSize(18);
      //     doc.setTextColor(44, 62, 80); // Dark blue
      //     doc.text("Approval Data", 105, 20, null, null, "center");

      //     // Convert the PDF to a Blob
      //     let pdfBlob = doc.output("blob");

      //     // Convert Blob to Base64
      //     let reader = new FileReader();
      //     reader.onloadend = function () {
      //       let base64Data = reader.result.split(",")[1]; // Get Base64 part
      //       console.log(aSelectedIndices)
      //       console.log(aSelectedData)
      //       // aSelectedData.forEach((el => {
              
      //       // }))

      //       // Now attach this base64 PDF data to SAP using the OData service
      //       this.attachPdfToSap(item.RefNo, base64Data, item.Name, item.UserLevel);
      //     }.bind(this); // Bind "this" to ensure context is maintained

      //     reader.readAsDataURL(pdfBlob); // Trigger the conversion
      //   });

      //   sap.m.MessageToast.show("PDF files have been downloaded and attached.");
      // },

      // attachPdfToSap: function (refNo, base64Data, name, userLevel) {
      //   // Get the OData model for ZNI_BPAPPROVE_SRV
      //   let oModel = this.getOwnerComponent().getModel("ZNI_BPAPPROVE_SRV");

      //   let payload = {
      //     RefNo: refNo,
      //     UserLevel: userLevel,
      //     PdfFile: base64Data,
      //     FileName: `ApprovalData_${refNo}.pdf`,
      //     MimeType: "application/pdf",
      //     Name: name
      //   };
      //   let that = this;

      //   // Call OData service to attach the PDF
      //   // oModel.update("/ApproverSet", payload, {
      //   // oModel.update(`/ApproverSet('${payload.RefNo}')`, payload, {
      //   oModel.update(`/ApproverSet(RefNo='${payload.RefNo}',UserLevel='${payload.UserLevel}')`, payload, {
      //     method: 'PUT',
      //     success: function (oData) {
      //       sap.m.MessageToast.show("PDF attached successfully to SAP.");
      //     },
      //     error: function (oError) {
      //       let errorMsg = JSON.parse(oError.responseText).error.message.value
      //       sap.m.MessageBox.error("Error attaching PDF to SAP: " + errorMsg);
      //     }
      //   });
      // },



      // For Downloading PDF

      //   onPdfDownload: function () {
      //     let oTable = this.byId("approveTable");
      //     let aSelectedIndices = oTable.getSelectedIndices();
      //     let oModel = this.getView().getModel("approveData");
      //     let aSelectedData = [];

      //     // Gather data for the selected rows
      //     aSelectedIndices.forEach(function (index) {
      //         let oContext = oTable.getContextByIndex(index);
      //         if (oContext) {
      //             aSelectedData.push(oContext.getObject());
      //         }
      //     });

      //     if (aSelectedData.length === 0) {
      //         sap.m.MessageBox.warning("Please select at least one row to download the PDF.");
      //         return;
      //     }

      //     let { jsPDF } = window.jspdf;

      //     aSelectedData.forEach(function (item) {
      //         let doc = new jsPDF();

      //         // Add Header Section with Title and Styling
      //         doc.setFont("helvetica", "bold");
      //         doc.setFontSize(18);
      //         doc.setTextColor(44, 62, 80); // Dark blue
      //         doc.text("Approval Data", 105, 20, null, null, "center");

      //         doc.setFontSize(12);
      //         doc.setDrawColor(44, 62, 80); // Blue line
      //         doc.line(10, 30, 200, 30); // Horizontal line separator

      //         // Set Label and Value Alignment and Formatting for the first box
      //         let labelX = 10;  // X position for labels
      //         let valueX = 60;  // X position for values
      //         let lineSpacing = 10; // Space between lines
      //         let boxPadding = 5; // Padding for boxes

      //         let yOffset = 40; // Start with some gap from the top

      //         // Draw the first box for Reference No, Name, and Company Code
      //         doc.setDrawColor(100, 100, 100); // Gray border
      //         doc.roundedRect(5, yOffset, 200, 3 * lineSpacing + boxPadding, 3, 3); // Rounded corner box for Reference No, Name, and Company Code

      //         // Add Reference No
      //         doc.setFont("helvetica", "bold");
      //         doc.setTextColor(52, 73, 94); // Dark gray
      //         doc.text("Reference No:", labelX, yOffset + 10); // Reference No label

      //         doc.setFont("helvetica", "normal");
      //         doc.setTextColor(39, 174, 96); // Green for values
      //         doc.text(item.RefNo || "N/A", valueX, yOffset + 10); // Reference No value

      //         // Add Name
      //         doc.setFont("helvetica", "bold");
      //         doc.setTextColor(52, 73, 94); // Dark gray
      //         doc.text("Name:", labelX, yOffset + 20); // Name label

      //         doc.setFont("helvetica", "normal");
      //         doc.setTextColor(39, 174, 96); // Green for values
      //         doc.text(item.Name || "N/A", valueX, yOffset + 20); // Name value

      //         // Add Company Code
      //         doc.setFont("helvetica", "bold");
      //         doc.setTextColor(52, 73, 94); // Dark gray
      //         doc.text("Company Code:", labelX, yOffset + 30); // Company Code label

      //         doc.setFont("helvetica", "normal");
      //         doc.setTextColor(39, 174, 96); // Green for values
      //         doc.text(item.CompanyCode || "N/A", valueX, yOffset + 30); // Company Code value

      //         yOffset += 50; // Increase the yOffset to leave space between the two boxes

      //         // Draw the second box for additional details
      //         let fields = [
      //             { label: "Timestamp", value: new Date(item.Timestamp).toLocaleString() },
      //             { label: "User Level", value: item.UserLevel },
      //             { label: "Status", value: item.Status },
      //             { label: "Remarks", value: item.Remarks },
      //         ];

      //         // Draw a Box Around the Details Section for a Cleaner Look
      //         doc.setDrawColor(100, 100, 100); // Gray border
      //         doc.roundedRect(5, yOffset, 200, fields.length * lineSpacing + boxPadding, 3, 3); // Rounded corner box for details

      //         // Add Fields with Labels and Values in the second box
      //         fields.forEach((field) => {
      //             doc.setFont("helvetica", "bold");
      //             doc.setTextColor(52, 73, 94); // Dark gray
      //             doc.text(field.label + ":", labelX, yOffset + 10); // Label

      //             doc.setFont("helvetica", "normal");
      //             doc.setTextColor(39, 174, 96); // Green for values
      //             doc.text(field.value || "N/A", valueX, yOffset + 10); // Value

      //             yOffset += lineSpacing;
      //         });

      //         // Add Footer with Timestamp and Page Number
      //         yOffset += 20; // Extra space before footer
      //         doc.setFontSize(10);
      //         doc.setTextColor(128, 139, 150); // Light gray
      //         doc.text("Generated on: " + new Date().toLocaleString(), 10, 280); // Generation timestamp
      //         doc.text("Page 1", 200, 280, null, null, "right"); // Page number

      //         // Save the PDF with a Descriptive Filename
      //         let fileName = `ApprovalData_${item.RefNo}.pdf`;
      //         doc.save(fileName);
      //     });

      //     sap.m.MessageToast.show("PDF files have been downloaded.");
      // }


    })
  },
)
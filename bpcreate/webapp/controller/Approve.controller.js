sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageBox) {
    'use strict'
    return Controller.extend('com.bp.bpcreate.controller.Approve', {
      onInit: function () {       
        let approveDataModel = new JSONModel()
        this.getView().setModel(approveDataModel, 'approveData')
        this._initialTempalte = {
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
              }),
            )
            approveDataModel.setData(approveDataArr)
          },
          error: function (err) {
            MessageBox.error(err)
          },
        })

      },

      onApproveData: function (oEvent) {
        let that = this
        let oButton = oEvent.getSource(); 
        let oBindingContext = oButton.getBindingContext("approveData");
        if (!oBindingContext) {
            console.error("No binding context found for the selected row.");
            return;
        }
        let selectedData = oBindingContext.getObject();

        let oPayload = {
          RefNo: selectedData.RefNo,
          Timestamp: selectedData.Timestamp,
          UserLevel: selectedData.UserLevel,
          Name: selectedData.Name,
          Status: selectedData.Status,
          Remarks: selectedData.Remarks
        }
        let oApproveModel = this.getView().getModel("ZNI_BPAPPROVE_SRV")
        oApproveModel.create("/ApproverSet", oPayload, {
          success: function(msg) {
            MessageBox.success("Approved")
            oApproveModel.refresh(true);
            that.getOwnerComponent().getRouter().navTo('Approve')
          },
          error: function(msg) {
            // MessageBox.error(msg, "Error")
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
          }
        })


        // var oButton = oEvent.getSource()
        // var oContext = oButton.getBindingContext('approveData')

        // if (oContext) {
        //   var oData = oContext.getObject()

        //   var sStatus = oData.Status
        //   var sRemarks = oData.Remarks

        //   var oTableRow = oButton.getParent() 

          
        //   var oStatusInput = oTableRow.getCells()[4] 
        //   oStatusInput.setEnabled(false) 

          
        //   var oRemarksInput = oTableRow.getCells()[5] 
        //   oRemarksInput.setEnabled(false) 

        //   oButton.setEnabled(false);

        //   // You can now handle the data as per your requirement
        //   console.log('Reference No: ' + oData.RefNo)
        //   console.log('Timestamp: ' + oData.Timestamp)
        //   console.log('User Level: ' + oData.UserLevel)
        //   console.log('Name: ' + oData.Name)
        //   console.log('Status: ' + sStatus)
        //   console.log('Remarks: ' + sRemarks)

        //   // Further processing, like sending the data to a backend, can be done here
        // } else {
        //   console.error('No binding context found for the selected row.')
        // }

        // let oPayload = {
        //   RefNo:  oData.RefNo,
        //   Timestamp: oData.Timestamp,
        //   UserLevel: oData.UserLevel,
        //   Name: oData.Name,
        //   Status: oData.Status,
        //   Remarks: oData.Remarks
        // }
        // let oApproveModel = this.getView().getModel("ZNI_BPAPPROVE_SRV")
        // let that = this
        // oApproveModel.create("/ApproverSet", oPayload, {
        //   success: function(msg) {
        //     MessageBox.success("Approved")
        //     oApproveModel.refresh(true);
        //   },
        //   error: function(msg) {
        //     // MessageBox.error(msg, "Error")
        //     let errorMsg = JSON.parse(msg.responseText).error.innererror.errordetails
        //           let returnMsg = []
        //           errorMsg.forEach((error)=>{
        //               returnMsg.push({
        //                   code: error.code,
        //                   message: error.message,
        //                   severity: error.severity
        //               })
        //           })
        //           that
        //           ._setReturnData(errorMsg)
        //           .then(that._onResponsivePaddingDialogPress.bind(that))
        //         console.log(msg)
        //         console.log(errorMsg)
        //   }
        // })


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
              new sap.m.Text({ text: '{Status}' }),
              new sap.m.Text({ text: '{StatusDesc}' }),
            ],
          }),
        })
        oTable.addColumn(
          new sap.m.Column({
            header: new sap.m.Label({ text: 'Status' }),
          }),
        )
        oTable.addColumn(
          new sap.m.Column({
            header: new sap.m.Label({ text: 'Status Description' }),
          }),
        )
        oTable.addItem(
          new sap.m.ColumnListItem({
            cells: [
              new sap.m.Text({ text: '{Status}' }),
              new sap.m.Text({ text: '{StatusDesc}' }),
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
    })
  },
)

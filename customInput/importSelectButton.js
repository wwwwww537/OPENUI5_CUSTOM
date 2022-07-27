sap.ui.define("custom/customInput/importSelectButton", [  // remove the first parameter in "real" apps
    "sap/ui/core/Control",
    "sap/ui/core/CustomData",
    "sap/ui/table/Table",
    "sap/m/Input",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Select",
    'sap/m/VBox',
    'sap/m/FlexBox',
    'sap/m/FlexItemData',
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel',
    'sap/ui/thirdparty/jquery',
    'sap/ui/unified/FileUploader',
    'sap/ui/unified/FileUploaderParameter',
    'custom/tableHelp/TableFilter',
    'custom/tableHelp/TablePage',
], function (Control, CustomData, Table, Input, Dialog, Button, Label, Select,VBox, FlexBox, FlexItemData, MessageToast, JSONModel, jQuery,FileUploader,FileUploaderParameter, TableFilter, TablePage) {
    "use strict";
    return Control.extend("custom.customInput.importSelectButton", {
        // the control API:
        metadata: {
            properties: {
                url: { type: "string", defaultValue: '' },
                templateUrl: { type: "string", defaultValue: ''},
                isInit: { type: "boolean", defaultValue: true },
            },
            aggregations: {
                _button: { type: "sap.m.Button", multiple: false, visibility: "hidden" },
                _fileUploader: { type: "sap.ui.unified.FileUploader", multiple: false, visibility: "hidden" },
                _select:{type:"sap.m.Select",multiple: false, visibility: "hidden" }
            },

            associations: {
            },

            events: {
            }
        },

        // be careful with this, better avoid it!
        // See why at https://www.nabisoft.com/tutorials/sapui5/why-initializing-properties-on-prototypes-can-have-nasty-side-effects-in-sapui5
        //_oLink : null,

        init: function () {
            
        },

        onAfterRendering: function () {
        },
        getFileUploader: function () {
            return this.getAggregation("_fileUploader")
        },
        getSelect: function () {
            return this.getAggregation("_select")
        },
        renderer: {

            render: function (oRm, oControl) {
                if (oControl.getIsInit()) {
                    oControl.setIsInit(false)
                    let i18n = oControl.getModel('i18n').getResourceBundle(),
                        randomId ='w' + Number(Math.random().toString().substr(3, length) + Date.now()).toString(36),
                        flieRandomId='file' + Number(Math.random().toString().substr(3, length) + Date.now()).toString(36)
                    let selectbukrs ='select' + Number(Math.random().toString().substr(3, length) + Date.now()).toString(36)
                    let oButton = new Button({
                        icon: 'sap-icon://upload',
                        tooltip: i18n.getText('Buttons_Import'),
                    }).addStyleClass('DefaultButton AutoButton ImportButton')

                    let oFileUploader = new FileUploader({
                        id: flieRandomId,
                        name: 'myFileUpload',
                        uploadUrl: oControl.getUrl(),
                        tooltip: i18n.getText('custom_ImportButton_Tooltip'),
                        fileType: ['xlsx', 'xls'],
                        typeMissmatch: function (oEvent) {
                            let aFileTypes = oEvent.getSource().getFileType();
                            aFileTypes.map(function (sType) {
                                return "*." + sType;
                            });
                            MessageToast.show(i18n.getText('Message_Error_Import_TypeErr', [oEvent.getParameter('fileType'), aFileTypes.join(', ')]))
                        },
                        uploadComplete: function (oEvent) {
                            let sResponse = oEvent.getParameter('response'),
                                iHttpStatusCode = parseInt(/\d{3}/.exec(sResponse)[0]),
                                sMessage = sResponse.replace(/.*"Message":"(.*?)".*/g, '$1')

                            if (sResponse) {
                                if (iHttpStatusCode == 200) {
                                    MessageToast.show(i18n.getText('Message_Success_Import'))
                                }
                                else {
                                    MessageToast.show(i18n.getText('Message_Error') + ':' + sMessage)
                                }
                            }
                            
                        }
                    })
                   
                    let currentUser= oControl.getModel('_sysInfo').getProperty('/' + 'CurrentUser'),
                        list
                    jQuery.ajax({
                        type: 'Post',
                        url: '/ProfitCenter/GetFiltersData',
                        dataType: 'json',
                        async: false,
                        data: {
                            'currentUser': currentUser
                        },
                        success: function (res) {
                            if (res.Code == 200) {
                                let fitlerSelect = {}
                                res.Data.forEach(u => {
                                    fitlerSelect[u.Name] = u.Value == null ? [] : u.Value
                                    if (u.Name !='BUKRS_NAME_Select')
								    fitlerSelect[u.Name].unshift({ id: '', text: '' })
                                 })
                                list=fitlerSelect
                            }
                            else {
                                MessageToast.show(i18n.getText('Message_Error') + ':' + res.Message)
                            }
                        }
                    })
                    let selectBukrs= new Select({
                        id:selectbukrs,
                        width:"280px",
                        items: {
                            path: "Select>/BUKRS_NAME_Select", // this is a diffent table
                            template: new sap.ui.core.Item({
                            key:"{Select>id}",
                            text: "{Select>text}"
                            })
                        },
                    })
                    let oDialog = new Dialog({
                        id: randomId,
                        title: i18n.getText('custom_ImportButton_Import'),
                        contentWidth: '400px',
                        content: new VBox({
                            items: [new FlexBox({
                                renderType: 'List',
                                alignItems:'Center',
                                wrap: 'Wrap',
                                items: [
                                    new VBox({
                                        items:new Label({
                                            text: i18n.getText('custom_importSelectButton_uploadBukrs'),
                                            labelFor: flieRandomId
                                        }),
                                        layoutData: new FlexItemData({
                                            baseSize: '23%',
                                            maxWidth: '23%'
                                        })
                                    }),
                                    new VBox({
                                        items: selectBukrs,
                                        layoutData: new FlexItemData({
                                            baseSize: '70%',
                                            maxWidth: '70%'
                                        })
                                    }),
                                    new VBox({
                                        items:new Label({
                                            text: i18n.getText('custom_ImportButton_Import'),
                                            labelFor: flieRandomId
                                        }),
                                        layoutData: new FlexItemData({
                                            baseSize: '23%',
                                            maxWidth: '23%'
                                        })
                                    }),
                                    new VBox({
                                        items: oFileUploader,
                                        layoutData: new FlexItemData({
                                            baseSize: '70%',
                                            maxWidth: '70%'
                                        })
                                    }),
                                    new VBox({
                                        items: new Label({
                                            text: i18n.getText('custom_ImportButton_TemplateDownload'),
                                            labelFor: flieRandomId
                                        }),
                                        layoutData: new FlexItemData({
                                            baseSize: '23%',
                                            maxWidth: '23%'
                                        })
                                    }),
                                    new VBox({
                                        items: new Button({
                                            text: i18n.getText('Buttons_Download'),
                                            press: function (oEvent) {
                                                let url = '/Home/DownloadFile',
                                                    form = $("<form></form>").attr("action", url).attr("method", "post")
                                                form.append($("<input></input>").attr("type", "hidden").attr("name", "url").attr("value", oControl.getTemplateUrl()));
                                                form.appendTo('body').submit().remove()
                                            }
                                        }).addStyleClass('DefaultButton'),
                                        layoutData: new FlexItemData({
                                            baseSize: '23%',
                                            maxWidth: '23%'
                                        })
                                    })
                                ]
                            }).addStyleClass('FlexBoxClass')]
                        }),
                        beginButton: new Button({
                            text: i18n.getText('Buttons_Import'),
                            press: function (oEvent) {
                                if (!oFileUploader.getValue()) {
                                    MessageToast.show(i18n.getText('Message_Error_Upload_NoData'));
                                    return;
                                }
                                oFileUploader.checkFileReadable().then(function () {
                                    debugger
                                    
                                    oFileUploader.setSendXHR(true);
                                    if(selectBukrs.getSelectedKey()==null||selectBukrs.getSelectedKey()==undefined||selectBukrs.getSelectedKey()==""){
                                        MessageToast.show(i18n.getText('custom_importSelectButton_errorselect'));
                                        return;
                                    }
                                    let fileval1=new FileUploaderParameter({
                                        name:"searchBukrs",
                                        value:selectBukrs.getSelectedKey()
                                    })
                                    let fileval2=new FileUploaderParameter({
                                        name:"currentUser",
                                        value:currentUser.Company
                                    })
                                    oFileUploader.addHeaderParameter(fileval1)
                                    oFileUploader.addHeaderParameter(fileval2)
                                    oFileUploader.upload();
                                }, function (error) {
                                    MessageToast.show('The file cannot be read. It may have changed.');
                                }).then(function () {
                                    oFileUploader.clear();
                                });
                            }
                        }).addStyleClass('LightButton'),
                        endButton: new Button({
                            text: i18n.getText('Buttons_Cancel'),
                            press: function (oEvent) {
                                oDialog.close()
                            }
                        }).addStyleClass('DarkButton')
                    }).addStyleClass('Padding DialogClass')

                    oButton.attachPress(function (oEvent) {
                        oDialog.setModel(new JSONModel(list), 'Select')
                        oDialog.open()
                    })
                    
                    oControl.addDependent(oDialog)
                    oControl.setAggregation("_button", oButton)
                    //oControl.setAggregation("_fileUploader", oFileUploader)
                    //oControl.setAggregation("_select", oFileUploader)
                    oRm.renderControl(oButton)
                }
                else {
                    oRm.renderControl(oControl.getAggregation("_button"))
                }
            }
        }
    });

    custom.customTable.CustomTable.prototype.exit = function () {
        /* release resources that are not released by the SAPUI5 framework */
        /*if (this.getRows()) {
            this.getRows().destroy();
            delete this.getRows();
        }*/
    };
});
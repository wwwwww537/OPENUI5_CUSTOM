sap.ui.define("custom/customInput/TableButton", [  // remove the first parameter in "real" apps
    "sap/ui/core/Control",
    "sap/ui/core/CustomData",
    "sap/ui/table/Table",
    "sap/m/Input",
    "sap/m/Dialog",
    "sap/m/Button",
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel',
    'custom/tableHelp/TableFilter',
    'custom/tableHelp/TablePage',
], function (Control, CustomData, Table, Input, Dialog, Button, MessageToast, JSONModel, TableFilter, TablePage) {
    "use strict";
    return Control.extend("custom.customInput.TableButton", {
        // the control API:
        metadata: {
            properties: {
                text: { type: "string", default: '' },
                type: { type: "string", default: 'Default' },
                tableTitle: { type: "string", defaultValue: "" },
                tableVisibleRowCount: { type: "int", defaultValue: 10 },
                tableHeight: { type: "sap.ui.core.CSSSize", defaultValue: "auto" },
                tableWidth: { type: "sap.ui.core.CSSSize", defaultValue: "40rem" },
                selectionMode: { type: "string", defaultValue: "Single" },
                selectionBehavior: { type: "string", defaultValue: "Row" },
                styleClass: { type: "string", defaultValue: '' },
                url: { type: "string", defaultValue: '' },
                attachedData: { type: "object", defaultValue: {} },
                firstSearch: { type: "boolean", defaultValue: true },
                isInit: { type: "boolean", defaultValue: true },
            },
            defaultAggregation: "columns",
            aggregations: {
                columns: { type: "sap.ui.table.Column", multiple: true },
                _button: { type: "sap.m.Button", multiple: false, visibility: "hidden" },
            },

            associations: {
            },

            events: {
                rowSelectionChange: { enablePreventDefault: true }
            }
        },

        // be careful with this, better avoid it!
        // See why at https://www.nabisoft.com/tutorials/sapui5/why-initializing-properties-on-prototypes-can-have-nasty-side-effects-in-sapui5
        //_oLink : null,

        init: function () {
        },

        onAfterRendering: function () {
        },

        addStyleClass: function (oClass) {
            if (this.getAggregation('_button') == null)
                this.setStyleClass(oClass)
            else
                this.getAggregation('_button').addStyleClass(oClass)
        },

        //获取服务器时间
        getServerDate: function () {
            return new Date($.ajax({ async: false }).getResponseHeader("Date"));
        },

        //获取token
        getToken: function () {
            let _token = JSON.parse(localStorage.getItem('token'))
            if (_token == null || _token.expires_in < this.getServerDate().getTime()) {
                jQuery.ajax({
                    type: 'Post',
                    url: '/Home/GetToken',
                    async: false,
                    success: function (res) {
                        if (res.code == 200) {
                            if (res.data != null) {
                                localStorage.setItem('token', JSON.stringify(res.data))
                                _token = res.data
                            }
                            else {
                                localStorage.removeItem('token')
                                _token = null
                            }
                        }
                        else {
                            MessageToast.show(_i18n.getText('Message_Error') + ':' + oData.message)
                        }
                    }
                })
            }
            return _token
        },

        renderer: {

            render: function (oRm, oControl) {
                if (oControl.getIsInit()) {
                    oControl.setIsInit(false)
                    let i18n = oControl.getModel('i18n').getResourceBundle(),
                        randomId ='w' + Number(Math.random().toString().substr(3, length) + Date.now()).toString(36)
                    let oButton = new Button({
                        text: oControl.getText(),
                        type: oControl.getType()
                    }).addStyleClass(oControl.getStyleClass())

                    let oTable = new Table({
                        id: randomId,
                        visibleRowCount: oControl.getTableVisibleRowCount(),
                        selectionMode: oControl.getSelectionMode(),
                        selectionBehavior: oControl.getSelectionBehavior(),
                        enableCellFilter: false,
                        columns: oControl.getColumns(),
                        footer: new TablePage({
                            tableFor: randomId
                        }),
                        customData: new CustomData({
                            key: 'pageReq',
                            value: {
                                Page: 1,
                                Count: 0,
                                TotalCount: 0,
                                TotalPage: 1,
                                Limit: oControl.getTableVisibleRowCount(),
                                Filters: []
                            }
                        })
                    })

                    /*new BlockLayout({
                        background: 'Dashboard',
                        content: new BlockLayoutRow({
                            content: new BlockLayoutCell({

                            })
                        })
                    })*/

                    let oDialog = new Dialog({
                        title: oControl.getTableTitle(),
                        contentHeight: oControl.getTableHeight(),
                        contentWidth: oControl.getTableWidth(),
                        content:[
                            new TableFilter({
                                expandable: false,
                                contentMode:'OneRow',
                                tableFor: randomId,
                                search: function () {
                                    if (oControl.getUrl() != '') {
                                        let _req = oTable.getCustomData().find(u => u.getKey() == 'pageReq')
                                        let oData = {
                                            'pageReq': _req == null ? null : _req.getValue(),
                                            'token': oControl.getToken()
                                        },
                                            att = oControl.getAttachedData(),
                                            pattern = /@@(.+?)/g
                                        for (let item in att) {
                                            if (pattern.test(att[item])) {
                                                let m = att[item].replace(pattern, '$1'),
                                                    oD = oControl.getModel('_sysInfo').getProperty('/' + m.replace(/>/g, '/'))
                                                att[item] = oD
                                            }
                                        }
                                        Object.assign(oData, att)
                                        jQuery.ajax({
                                            type: 'Post',
                                            url: oControl.getUrl(),
                                            async: false,
                                            dataType: 'json',
                                            data: oData,
                                            success: function (res) {
                                                if (res.Code == 200) {
                                                    let _d = res.Data,
                                                        oPageReq = _req == null ? null : _req.getValue()
                                                    if (oPageReq != null) {
                                                        oPageReq['Count'] = _d.length;
                                                        oPageReq['TotalCount'] = res.Count;
                                                        oPageReq['TotalPage'] = Math.ceil(res.Count / oPageReq['Limit']);
                                                    }
                                                    oTable.setModel(new JSONModel(_d)).bindRows('/')
                                                }
                                                else {
                                                    MessageToast.show(i18n.getText('Message_Error') + ':' + res.Message)
                                                }
                                            }
                                        })
                                    }
                                }
                            }),
                            oTable
                        ],
                        beginButton: new Button({
                            type: 'Emphasized',
                            text: i18n.getText('Buttons_Query'),
                            press: function () {
                                oDialog.getContent()[0].fireSearchButton()
                            }
                        }).addStyleClass('LightButton'),
                        endButton: new Button({
                            text: i18n.getText('Buttons_Cancel'),
                            press: function () {
                                oDialog.close()
                            }
                        }).addStyleClass('DarkButton')
                    });
                    oButton.attachPress(function (oEvent) {
                        oDialog.open()
                        if (oControl.getFirstSearch()) {
                            oControl.setFirstSearch(false)
                            oDialog.getContent()[0].fireSearchButton()
                        }
                    })
                    oTable.attachRowSelectionChange(function (oEvent) {
                        if (oControl.fireRowSelectionChange(oEvent.getParameters()) != false) {
                            oDialog.close()
                        }
                    })
                    oTable.getFooter().attachLoadTable(function (oEvent) {
                        oDialog.getContent()[0].fireSearchButton()
                    })
                   
                    oControl.addDependent(oDialog)
                    oControl.setAggregation("_button", oButton)
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
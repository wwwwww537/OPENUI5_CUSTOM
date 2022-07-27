sap.ui.define("custom/tableHelp/TablePage", [  // remove the first parameter in "real" apps
    "sap/ui/core/Control",
    "sap/ui/core/CustomData",
    "sap/m/OverflowToolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/m/Text",
], function (Control, CustomData, OverflowToolbar, ToolbarSpacer, Button, Text) {
    "use strict";
    return Control.extend("custom.tableHelp.TablePage", {
        // the control API:
        metadata: {
            properties: {
                count: { type: "int", defaultValue: 0 },
                totalCount: { type: "int", defaultValue: 0 },
                limit: { type: "int", defaultValue: 10 },
                page: { type: "int", defaultValue: 1 },
                totalPage: { type: "int", defaultValue: 8 },
                isInit: { type: "boolean", defaultValue: true }
            },

            aggregations: {
                _toolbar: { type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden" },
            },

            associations: {
                tableFor: { type: "sap.ui.core.Control", multiple: false }
            },

            events: {
                loadTable: { enablePreventDefault: true }
            }
        },

        // be careful with this, better avoid it!
        // See why at https://www.nabisoft.com/tutorials/sapui5/why-initializing-properties-on-prototypes-can-have-nasty-side-effects-in-sapui5
        //_oLink : null,

        init: function () {
        },

        onAfterRendering: function (oEvent) {
        },

        onBeforeRendering: function (oEvent) {
        },

        JumpPage: function (ipage) {
            this.setPage(ipage)
            this.redrawTable()
            this.redrawButton()
        },

        redrawPage: function () {
            let sTableControlId = this.getTableFor(),
                oTableControl = sTableControlId && sap.ui.getCore().byId(sTableControlId),
                oPageReq = oTableControl.getCustomData().find(u => u.getKey() == 'pageReq'),
                i18n = this.getModel('i18n').getResourceBundle()
            if (oPageReq != null) {
                oPageReq = oPageReq.getValue()
                this.setCount(oPageReq['Count'])
                this.setTotalCount(oPageReq['TotalCount'])
                this.setPage(oPageReq['Page'])
                this.setTotalPage(oPageReq['TotalPage'])
                this.setLimit(oPageReq['Limit'])
            }
            this.getAggregation('_toolbar').getContent()[0].setText(i18n.getText('custom_TablePage_PageInfo', [this.getCount(), this.getTotalCount()])).rerender()
            this.redrawButton()
        },

        redrawButton: function () {
            let oToolbar = this.getAggregation('_toolbar')
            if (this.getTotalPage() < this.getPage())
                this.setPage(this.getTotalPage())
            let ipage = this.getPage()
            oToolbar.getContent()[2].setEnabled(ipage > 1).rerender()
            oToolbar.getContent()[6].setEnabled(ipage < this.getTotalPage()).rerender()
            if (ipage == 1) ipage++
            else if (ipage == this.getTotalPage()) ipage--
            this._redrawButton(oToolbar.getContent()[3], ipage - 1)
            this._redrawButton(oToolbar.getContent()[4], ipage)
            this._redrawButton(oToolbar.getContent()[5], ipage + 1)
        },

        _redrawButton: function (oButton, oPage) {
            if (this.getTotalPage() >= oPage && 1 <= oPage) {
                oButton.setText(oPage).setVisible(true)
                if (this.getPage() == oPage) {
                    oButton.addStyleClass('LightButton').removeStyleClass('DefaultButton')
                }
                else {
                    oButton.addStyleClass('DefaultButton').removeStyleClass('LightButton')
                }
            }
            else {
                oButton.setVisible(false)//setText('').setEnabled(false).setType('Transparent')
            }
            oButton.rerender()
        },

        redrawTable: function () {
            let sTableControlId = this.getTableFor(),
                oTableControl = sTableControlId && sap.ui.getCore().byId(sTableControlId)
            let oPageReq = oTableControl.getCustomData().find(u => u.getKey() == 'pageReq')
            if (oPageReq != null) {
                oPageReq = oPageReq.getValue()
                oPageReq['Page'] = this.getPage()
                oPageReq['Limit'] = this.getLimit()
            }
            else {
                oTableControl.addCustomData(
                    new CustomData({
                        key: 'pageReq',
                        value: {
                            Page: this.getPage(),
                            Count: this.getCount(),
                            TotalCount: this.getTotalCount(),
                            TotalPage: this.getTotalPage(),
                            Limit: this.getLimit(),
                            Filters: []
                        }
                    })
                )
            }
            this.fireLoadTable({
                pageReq: {
                    Page: this.getPage(),
                    Limit: this.getLimit()
                }
            })
        },

        renderer: {

            render: function (oRm, oControl) {
                if (oControl.getIsInit()) {
                    oControl.setIsInit(false)
                    let i18n = oControl.getModel('i18n').getResourceBundle(),
                        sTableControlId = oControl.getTableFor(),
                        oTableControl = sTableControlId && sap.ui.getCore().byId(sTableControlId)

                    if (oTableControl.getCustomData().find(u => u.getKey() == 'pageReq') == null) {
                        oTableControl.addCustomData(
                            new CustomData({
                                key: 'pageReq',
                                value: {
                                    Page: 1,
                                    Count: 0,
                                    TotalCount: 0,
                                    TotalPage: 1,
                                    Limit: oTableControl.getVisibleRowCount(),
                                    Filters: []
                                }
                            })
                        )
                    }

                    let oToolbar = new OverflowToolbar({
                        style: 'Clear',
                        content: [
                            new Text({
                                text: i18n.getText('custom_TablePage_PageInfo', [oControl.getCount(), oControl.getTotalCount()])
                            }),
                            new ToolbarSpacer(),
                            new Button({
                                icon: 'sap-icon://slim-arrow-left',
                                enabled: false,
                                tooltip: '{i18n>custom_TablePage_PrevPage}',
                                press: function (oEvent) {
                                    oControl.JumpPage(oControl.getPage() - 1)
                                }
                            }).addStyleClass('DefaultButton'),
                            new Button({
                                text: 1,
                                visible: false,
                                press: function (oEvent) {
                                    let _i = parseInt(oEvent.getSource().getText())
                                    if (_i != oControl.getPage()) {
                                        oControl.JumpPage(_i)
                                    }
                                }
                            }).addStyleClass('LightButton'),
                            new Button({
                                text: 2,
                                visible: false,
                                press: function (oEvent) {
                                    let _i = parseInt(oEvent.getSource().getText())
                                    if (_i != oControl.getPage()) {
                                        oControl.JumpPage(_i)
                                    }
                                }
                            }),
                            new Button({
                                text: 3,
                                visible: false,
                                //visible: oControl.getTotalPage() >= 3,
                                press: function (oEvent) {
                                    let _i = parseInt(oEvent.getSource().getText())
                                    if (_i != oControl.getPage()) {
                                        oControl.JumpPage(_i)
                                    }
                                }
                            }),
                            new Button({
                                icon: 'sap-icon://slim-arrow-right',
                                enabled: oControl.getTotalPage() >= 2,
                                tooltip: '{i18n>custom_TablePage_NextPage}',
                                press: function (oEvent) {
                                    oControl.JumpPage(oControl.getPage() + 1)
                                }
                            }).addStyleClass('DefaultButton')
                        ]
                    }).addStyleClass('TablePage')
                    oTableControl.attachRowsUpdated(function (oEvent) {
                        oControl.redrawPage()
                    })
                    //oTableControl.addDependent(oToolbar)
                    oControl.setAggregation('_toolbar', oToolbar)
                    oRm.renderControl(oToolbar)
                }
                else {
                    oRm.renderControl(oControl.getAggregation("_toolbar"))
                }
            }
        }
    });

    custom.customTable.CustomTable.prototype.exit = function () {
        /* release resources that are not released by the SAPUI5 framework */
        
    };
});
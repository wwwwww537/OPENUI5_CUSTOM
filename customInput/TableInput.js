sap.ui.define("custom/customInput/TableInput", [  // remove the first parameter in "real" apps
    "sap/ui/core/Control",
    "sap/ui/core/CustomData",
    "sap/ui/table/Table",
    "sap/ui/base/ManagedObject",
    "sap/m/Input",
    "sap/m/Dialog",
    "sap/m/Button",
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel',
    'custom/tableHelp/TablePage',
    'custom/tableHelp/TableFilter'
], function (Control, CustomData, Table, ManagedObject, Input, Dialog, Button, MessageToast, JSONModel, TablePage, TableFilter) {
    "use strict";
    return Control.extend("custom.customInput.TableInput", {
        // the control API:
        metadata: {
            properties: {
                name: { type: "string", defaultValue: '' },
                required: { type: "boolean", defaultValue: false },
                value: { type: "string", default: '' },
                visible: { type: "boolean", defaultValue: true },
                showValue: { type: "string", default: '' },
                tableId: { type: "string", defaultValue: '' },
                tableTitle: { type: "string", defaultValue: '' },
                tableRequired: { type: "boolean", defaultValue: false },
                tableVisibleRowCount: { type: "int", defaultValue: 10 },
                tableHeight: { type: "sap.ui.core.CSSSize", defaultValue: "auto" },
                tableWidth: { type: "sap.ui.core.CSSSize", defaultValue: "40rem" },
                selectionMode: { type: "string", defaultValue: "Single" },
                selectionBehavior: { type: "string", defaultValue: "RowOnly" },
                styleClass: { type: "string", defaultValue: '' },
                url: { type: "string", defaultValue: '' },
                attachedData: { type: "object", defaultValue: {} },

                tableBinds: { type: "object", defaultValue: {} },

                firstSearch: { type: "boolean", defaultValue: true },
                firstUpdate: { type: "boolean", defaultValue: false },
                inputEditable: { type: "boolean", defaultValue: true },
                inputEnabled: { type: "boolean", defaultValue: true },
                isInit: { type: "boolean", defaultValue: true },
            },
            defaultAggregation: "columns",
            aggregations: {
                columns: { type: "sap.ui.table.Column", multiple: true },
                _input: { type: "sap.m.Input", multiple: false },
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

        addStyleClass: function (oClass) {
            if (this.getAggregation('_input') == null) {
                this.setStyleClass(this.getStyleClass() + ' ' + oClass)
            }
            else
                this.getAggregation('_input').addStyleClass(oClass)
        },

        setInputValue: function (bv, sv) {
            this.setValue(bv)
            this.setShowValue(sv || bv)
            if (this.getAggregation('_input') != null) {
                this.getAggregation('_input').setValue(sv || bv).rerender()
            }
        },

        setEditable: function (v) {
            this.setInputEditable(v)
            if (this.getAggregation('_input') != null)
                this.getAggregation('_input').setEditable(v).rerender()
        },

        setEnabled: function (v) {
            this.setInputEnabled(v)
            if (this.getAggregation('_input') != null)
                this.getAggregation('_input').setEnabled(v).rerender()
        },

        setValueState: function (v) {
            if (this.getAggregation('_input') != null) {
                this.getAggregation('_input').setValueState(v).rerender()
                return this.getAggregation('_input')
            }
        },

        setValueStateText: function (t) {
            if (this.getAggregation('_input') != null) {
                this.getAggregation('_input').setValueStateText(t).rerender()
                return this.getAggregation('_input')
            }
        },

        updateValue: function () {
            
            let oData = {
                'pageReq': {
                    Filters: [],
                    Page: 0
                }
            },
                _this = this,
                att = this.getAttachedData(),
                bs = this.getTableBinds(),
                pattern = /@@(.+?)/g,
                _i18n = this.getModel('i18n').getResourceBundle(),
                _columns = sap.ui.getCore().byId(this.getTableId()).getColumns()

            if (this.getValue() != null && this.getValue() != '') {
                let bind = this.getBindingInfo('value')
                if (bind != null) {
                    let p = bind.parts[0]['model'],
                        f = ''
                    if (p.length > 0) p += '>'
                    p += bind.parts[0]['path']
                    for (let b in bs) {
                        if (f == '' && bs[b] == p)
                            f = b
                    }
                    if (f != '') {
                        oData['pageReq']['Filters'].push({
                            Field: f,
                            Conditional: '=',
                            Value: this.getValue(),
                            Type: this.sInternalType || 'string'
                        })

                        _columns.forEach(u => {
                            if ((u.getVisible() || (u.getWidth() == '0' || u.getWidth() == '0rem' || u.getWidth() == '0px')) && u.getFilterProperty() != '' && u.getFilterProperty() != null) {
                                let textB = u.getTemplate().getBindingPath('text')
                                if (textB != null) {
                                    let tb = _this.getTableBinds()[textB]
                                    if (tb != null) {
                                        if (/(.+?)>.+/.test(tb)) {
                                            let _m = tb.replace(/(.+?)>.+/, '$1')
                                            if (_this.getModel(_m) != null) {
                                                let _m_d = _this.getModel(_m).getProperty(tb.replace(/.+?>(.+)/, '$1'))
                                                if (_m_d != null && _m_d != '') {
                                                    let oFilterType = u.getFilterType(),
                                                        oFilterTypeConstraints,
                                                        otype
                                                    if (oFilterType == null) {
                                                        otype = 'string'
                                                    }
                                                    else {
                                                        oFilterTypeConstraints = oFilterType.getConstraints()
                                                        if (oFilterTypeConstraints['type'] == null)
                                                            otype = 'string'
                                                        else
                                                            otype = oFilterTypeConstraints['type']
                                                    }

                                                    oData['pageReq']['Filters'].push({
                                                        Field: u.getFilterProperty(),
                                                        Conditional: '=',
                                                        Value: _m_d,
                                                        Type: otype
                                                    })
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    }
                }

                for (let item in att) {
                    if (pattern.test(att[item])) {
                        let m = att[item].replace(pattern, '$1'),
                            n = m.replace(/(.+?)>.+/, '$1'),
                            oD = att[item]
                        let temp = this.getModel('_sysInfo').getProperty('/' + m.replace(/>/g, '/'))
                        if (temp != null)
                            oD = temp
                        if (this.getModel(n) != null) {
                            temp = this.getModel(n).getProperty('/' + m.replace(/.+?>(.+)/, '$1').replace(/>/g, '/'))
                            if (temp != null)
                                oD = temp
                        }
                        att[item] = oD
                    }
                }
                Object.assign(oData, att)
                jQuery.ajax({
                    type: 'Post',
                    url: this.getUrl(),
                    async: false,
                    dataType: 'json',
                    data: oData,
                    success: function (res) {
                        if (res.Code == 200) {
                            let _d = res.Data
                            if (_d.length > 0) {
                                let dialog = _this.getDependents()[0]
                                if (dialog != null) {
                                    dialog.getContent()[1].setModel(new JSONModel(_d)).bindRows('/')
                                    let row = dialog.getContent()[1].getContextByIndex(0)
                                    if (row != null) {
                                        dialog.getContent()[1].fireRowSelectionChange({ rowContext: row })
                                    }
                                }
                            }
                        }
                        else {
                            MessageToast.show(_i18n.getText('Message_Error') + ':' + res.Message)
                        }
                    }
                })
            }
        },

        bindAttachedData: function () {
            let att = this.getAttachedData(),
                pattern = /@@(.+?)/g
            for (let item in att) {
                if (pattern.test(att[item])) {
                    let m = att[item].replace(pattern, '$1')

                    let c = new CustomData({
                        key: item,
                        value: att[item]
                    })
                    c.bindProperty('value',{
                        parts: [{
                            path: m
                        }]
                    })
                    this.addCustomData(c)
                }
            }
        },

        //获取服务器时间
        getServerDate: function () {
            return new Date($.ajax({ async: false }).getResponseHeader("Date"));
        },

        renderer: {

            render: function (oRm, oControl) {
                if (TableFilter == null)
                    TableFilter = custom.tableHelp.TableFilter
                if (oControl.getIsInit()) {
                    oControl.setIsInit(false)
                    let _i18n = oControl.getModel('i18n').getResourceBundle(),
                        randomId = oControl.getTableId() == '' ? 'w' + Number(Math.random().toString().substr(3, length) + Date.now()).toString(36) : oControl.getTableId()

                    let oInput = new Input({
                        name: oControl.getName(),
                        showValueHelp: true,
                        valueHelpOnly: true,
                        //showClearIcon: true,
                        autocomplete: false,
                        editable: oControl.getInputEditable(),
                        enabled: oControl.getInputEnabled(),
                        value: oControl.getShowValue(),
                        required: oControl.getTableRequired(),
                        valueHelpIconSrc: 'sap-icon://search'
                    }).addStyleClass(oControl.getStyleClass())

                    if (oControl.getBindingInfo('showValue') != null) {
                        let info = oControl.getBindingInfo('showValue')
                       /* if (info != null) {
                            oInput.bindValue(info)
                        }*/
                        if (info != null) {
                            let parts = []
                            info.parts.forEach(u => {
                                let bind = ''
                                if (u['model'] != null)
                                    bind += u['model'] + '>'
                                bind += u['path']
                                parts.push({ path: bind })
                            })
                            oInput.bindValue({
                                parts: parts,
                                formatter: info.formatter
                            })
                        }
                        /*let info = oControl.getBindingInfo('showValue').parts
                            if (info != null && info.length > 0) {
                            info.forEach(u => {
                                let bind = ''
                                if (u['model'] != null)
                                    bind += u['model'] + '>'
                                bind += u['path']
                                oInput.bindValue(bind)
                            })
                        }*/
                    }
                    if (oControl.getBindingInfo('visible') != null) {
                        /*let info = oControl.getBindingInfo('visible')
                        if (info != null) {
                            oInput.bindProperty('visible', info)
                        }*/
                        let info = oControl.getBindingInfo('visible').parts
                        if (info != null && info.length > 0) {
                            let bind = ''
                            if (info[0]['model'] != null)
                                bind += info[0]['model'] + '>'
                            bind += info[0]['path']
                            oInput.bindProperty('visible', bind)
                        }
                    }

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
                    }).addStyleClass('TableClass')
                    oControl.setTableId(randomId)

                    oControl.bindAttachedData()

                    let oDialog = new Dialog({
                        title: oControl.getTableTitle(),
                        contentHeight: oControl.getTableHeight(),
                        contentWidth: oControl.getTableWidth(),
                        content:[
                            new  TableFilter({
                                expandable: false,
                                contentMode:'FlexBox',
                                tableFor: randomId,
                                search: function () {
                                    if (oControl.getUrl() != '') {
                                        let _req = oTable.getCustomData().find(u => u.getKey() == 'pageReq')
                                        let oData = {
                                            'pageReq': _req == null ? null : _req.getValue()
                                        },
                                            att = oControl.getAttachedData(),
                                            pattern = /@@(.+?)/g
                                        for (let item in att) {
                                            if (pattern.test(att[item])) {
                                                let m = att[item].replace(pattern, '$1'),
                                                    n = m.replace(/(.+?)>.+/, '$1'),
                                                    oD = att[item]
                                                /*let temp = oControl.getModel('_sysInfo').getProperty('/' + m.replace(/>/g, '/'))
                                                if (temp != null)
                                                    oD = temp
                                                if (oControl.getModel(n) != null) {
                                                    temp = oControl.getModel(n).getProperty('/' + m.replace(/.+?>(.+)/, '$1').replace(/>/g, '/'))
                                                    if (temp != null)
                                                        oD = temp
                                                }
                                                att[item] = oD*/
                                            }
                                        }
                                        Object.assign(oData, att)
                                        oTable.setBusy(true)
                                        jQuery.ajax({
                                            type: 'Post',
                                            url: oControl.getUrl(),
                                            async: true,
                                            dataType: 'json',
                                            data: oData,
                                            success: function (res) {
                                                oTable.setBusy(false)
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
                                                    MessageToast.show(_i18n.getText('Message_Error') + ':' + res.Message)
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
                            text: _i18n.getText('Buttons_Query'),
                            press: function () {
                                oDialog.getContent()[0].fireSearchButton()
                            }
                        }).addStyleClass('LightButton'),
                        endButton: new Button({
                            text: _i18n.getText('Buttons_Cancel'),
                            press: function () {
                                oDialog.close()
                            }
                        }).addStyleClass('DarkButton')
                    }).addStyleClass('DialogClass');
                    oControl.updateSearch = function () {
                        oDialog.getContent()[0].fireSearchButton()
                    }
                    oInput.attachValueHelpRequest(function (oEvent) {
                        oDialog.open()
                        if (oControl.getFirstSearch()) {
                            oControl.setFirstSearch(false)
                            oDialog.getContent()[0].fireSearchButton()
                        }
                    })
                    oTable.attachRowSelectionChange(function (oEvent) {
                        if (oControl.fireRowSelectionChange(oEvent.getParameters()) != false) {
                            /*let pattern = /@@(.+?)\s/g,
                                oInputShow = oControl.getInputShow(),
                                oRow = oEvent.getParameter('rowContext')
                            if (pattern.test(oInputShow)) {
                                let arr = oInputShow.match(pattern)
                                arr.forEach((u, i) => {
                                    pattern = /@@(.+?)\s/
                                    let oS = oInputShow.match(pattern),
                                        oD = oRow.getProperty(oS[1])
                                    oInputShow = oInputShow.replace(pattern, oD + ' ')
                                })
                            }
                            pattern = /@@(.+)/
                            if (pattern.test(oInputShow)) {
                                let oS = oInputShow.match(pattern),
                                    oD = oRow.getProperty(oS[1])
                                oInputShow = oInputShow.replace(pattern, oD)
                            }

                            oInput.setValue(oInputShow)
                            oControl.setValue(oEvent.getParameter('rowContext').getProperty(oControl.getInputBind()))
                            oControl.setShowValue(oInputShow)
                            oDialog.close()*/

                            let pattern = /(.+)>(.*)/g,
                                oTableBinds = oControl.getTableBinds(),
                                oRow = oEvent.getParameter('rowContext')
                            for (let oTableBind in oTableBinds) {
                                let model = '',
                                    property = '',
                                    oV = oRow.getProperty(oTableBind)
                                if (pattern.test(oTableBinds[oTableBind])) {
                                    model = oTableBinds[oTableBind].replace(pattern, '$1')
                                    property = oTableBinds[oTableBind].replace(pattern, '$2')
                                    let oM = oControl.getModel(model)
                                    if (oM != null) {
                                        oM.setProperty(property, oV)
                                    }
                                }
                                else {
                                    let oM = oControl.getBindingContext()
                                    if (oM != null) {
                                        oM.getObject()[oTableBinds[oTableBind]] = oV
                                    }
                                    oControl.getModel().refresh()
                                }
                            }
                            oDialog.close()
                        }
                    })
                    oTable.getFooter().attachLoadTable(function (oEvent) {
                        oDialog.getContent()[0].fireSearchButton()
                    })
                    oControl.addDependent(oDialog)
                    oControl.setAggregation("_input", oInput)
                    if (oControl.getFirstUpdate())
                        oControl.updateValue()
                    oRm.renderControl(oInput)
                }
                else {
                    oRm.renderControl(oControl.getAggregation("_input"))
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
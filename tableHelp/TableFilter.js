sap.ui.define("custom/tableHelp/TableFilter", [  // remove the first parameter in "real" apps
    "sap/ui/core/Control",
    "sap/ui/core/CustomData",
    "sap/m/Panel",
    "sap/m/OverflowToolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Title",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/CheckBox",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/Select",
    "sap/m/SearchField",
    "sap/m/SuggestionItem",
    "sap/m/MultiComboBox",
    "sap/m/DatePicker",
    "sap/m/DateRangeSelection",
    "sap/m/ScrollContainer",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/ui/model/Filter",
    'sap/ui/model/json/JSONModel',
    "sap/ui/core/ListItem",
    "sap/ui/table/Column",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/layout/GridData",
    "sap/ui/layout/HorizontalLayout",
    "custom/customInput/TableInput",
], function (Control, CustomData, Panel, OverflowToolbar, ToolbarSpacer, Title, Label, Input, CheckBox, Button, Text, Select, SearchField, SuggestionItem, MultiComboBox, DatePicker, DateRangeSelection, ScrollContainer, HBox, VBox, Filter, JSONModel, ListItem, Column, SimpleForm, GridData, HorizontalLayout, TableInput) {
        "use strict";
        var datePickers = [],
            filterField = [],
            _i18n
    return Control.extend("custom.tableHelp.TableFilter", {
        // the control API:
        metadata: {
            properties: {
                title: { type: "string", defaultValue: "" },
                titleMode: { type: "string", defaultValue: "Title" },//Filter/Title
                visible: { type: "boolean", defaultValue: true },
                col: { type: "int[]", defaultValue: [3, 4, 4] },
                expanded: { type: "boolean", defaultValue: false },
                expandable: { type: "boolean", defaultValue: true },
                autoSearch: { type: "boolean", defaultValue: true },
                contentMode: { type: "string", defaultValue: 'Default' },
                isInit: { type: "boolean", defaultValue: true }
            },

            aggregations: {
                _panel: { type: "sap.m.Panel", multiple: false, visibility: "hidden" },
            },

            associations: {
                tableFor: { type: "sap.ui.core.Control", multiple: false }
            },

            events: {
                search: { enablePreventDefault: true },
                afterClear: { enablePreventDefault: true }
            }
        },

        // be careful with this, better avoid it!
        // See why at https://www.nabisoft.com/tutorials/sapui5/why-initializing-properties-on-prototypes-can-have-nasty-side-effects-in-sapui5
        //_oLink : null,

        init: function () { 
        },

        onBeforeRendering: function (oEvent) {
        },

        onAfterRendering: function (oEvent) {
            datePickers.forEach((u, i) => {
                let oDelegate = {}
                oDelegate = {
                    onclick: function (e) {
                        if (e.target.nodeName == 'INPUT') {
                            $(e.target).next().children().first().click()
                        }
                    }
                }
                u.addEventDelegate(oDelegate)
            })
            this.datePickersAttribute()
        },

        datePickersAttribute: function () {
            datePickers.forEach(u => {
                if (u.getDomRef('inner') != null) {
                    u.getDomRef('inner').setAttribute('disabled', 'disabled')
                }
            })
        },

        //日期格式转换
        formatting: function (_time) {
            let time = new Date(_time);
            let y = time.getFullYear();
            let m = time.getMonth() + 1;
            let d = time.getDate();
            let h = time.getHours();
            let mm = time.getMinutes();
            let s = time.getSeconds();
            return y + '-' + this.repair0(m) + '-' + this.repair0(d) + ' ' + this.repair0(h) + ':' + this.repair0(mm) + ':' + this.repair0(s);
        },

        //日期格式美化
        repair0: function (m) {
            return m < 10 ? '0' + m : m
        },

        //html 转码
        htmlEncodeByRegExp: function (str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&amp;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            return s;
        },

        getLayout: function () {
            let oLayout
            switch (this.getContentMode()) {
                case 'OneRow':
                    oLayout = new ScrollContainer({
                        height:"100%",
                        width: "100%"
                    }).addStyleClass('Scroll')
                    break
                case 'FlexBox':
                    oLayout = new VBox({
                        items: new HBox()
                    })
                    break
                case 'Default':
                default:
                    oLayout = new HorizontalLayout({
                        allowWrapping: true,
                    })
                    break
            }
            return oLayout
        },

        getOper: function (oTypeConstraints) {
            let oper,
                item = [],
                nitem = [],
                _this = this
                //i18n = this.getModel('i18n').getResourceBundle()
            switch (oTypeConstraints['model']) {
                case 'Input':
                    switch (oTypeConstraints['type']) {
                        case 'short':
                        case 'int':
                        case 'long':
                        case 'float':
                        case 'decimal':
                            item = [
                                { text: '=', key: '=' },
                                { text: '>', key: '>' },
                                { text: '<', key: '<' },
                                { text: '<>', key: '<>' }]
                            oper = new Select({
                                items: [],
                                layoutData: new GridData({
                                    span: "XL2 L2 M2 S2"
                                })
                            }).addStyleClass('FilterOper SelectClass')
                            break
                        case 'string':
                            item = [
                                { text: _i18n.getText('custom_TableFilter_Contains'), key: 'like' },
                                { text: _i18n.getText('custom_TableFilter_EQ'), key: '=' }]
                            oper = new Select({
                                items: [],
                                layoutData: new GridData({
                                    span: "XL2 L2 M2 S2"
                                })
                            }).addStyleClass('FilterOper SelectClass')
                            break
                        case 'DateTime':
                            item = [
                                { text: _i18n.getText('custom_TableFilter_BT'), key: 'between' },
                                { text: _i18n.getText('custom_TableFilter_BF'), key: '<' },
                                { text: _i18n.getText('custom_TableFilter_AF'), key: '>' }]
                           
                            oper = new Select({
                                items: [],
                                layoutData: new GridData({
                                    span: "XL2 L2 M2 S2"
                                }),
                                change: function (oEvent) {
                                    let oKey = oEvent.getParameter('selectedItem').getKey(),
                                        oInput = oEvent.getSource().getParent().getContent()[2].getContent()
                                    if (oKey == 'between') {
                                        oInput[0].setVisible(true).rerender()
                                        oInput[1].setValue().setVisible(false).rerender()
                                    }
                                    else {
                                        oInput[0].setValue().setVisible(false).rerender()
                                        oInput[1].setVisible(true).rerender()
                                    }
                                    _this.datePickersAttribute()
                                }
                            }).addStyleClass('FilterOper SelectClass')
                            
                            break
                        case 'bool':
                        default:
                            item = [
                                { text: _i18n.getText('custom_TableFilter_EQ'), key: '=' }]
                            oper = new Select({
                                visible: false,
                                layoutData: new GridData({
                                    visibleXL: false,
                                    visibleL: false,
                                    visibleM: false,
                                    visibleS: false
                                }),
                                items: [],
                                selectedKey: '='
                            })
                            break
                    }
                    break
                case 'MultiComboBox':
                    item = [
                        { text: _i18n.getText('custom_TableFilter_Includes'), key: 'includes' }]
                    oper = new Select({
                        visible: false,
                        layoutData: new GridData({
                            visibleXL: false,
                            visibleL: false,
                            visibleM: false,
                            visibleS: false
                        }),
                        items: [],
                        selectedKey: 'includes'
                    })
                    break
                case 'SingleSelect':
                case 'SearchSelect':
                case 'TableSelect':
                default:
                    item = [
                        { text: _i18n.getText('custom_TableFilter_EQ'), key: '=' }]
                    oper = new Select({
                        visible: false,
                        layoutData: new GridData({
                            visibleXL: false,
                            visibleL: false,
                            visibleM: false,
                            visibleS: false
                        }),
                        items: [],
                        selectedKey: '='
                    })
                    break
            }
            if (oTypeConstraints['oper'] != "") {
                let os = oTypeConstraints['oper'].split(',')
                nitem = item.filter(u => os.includes(u.key))
                if (nitem.length > 0)
                    item = nitem
            }
            item.forEach(u => {
                oper.addItem(new ListItem({
                    text: u.text,
                    key: u.key
                }))
            })
            if (oTypeConstraints['doper'] != '' && item.findIndex(u => u.key == oTypeConstraints['doper']) != -1)
                oper.setSelectedKey(oTypeConstraints['doper'])
            if (item.length == 1)
                oper.setEditable(false)
            oper.addCustomData(new CustomData({
                key: 'type',
                value: 'Oper'
            }))
            return oper
        },

        getInput: function (oTypeConstraints, oProperty, oReq) {
            let input,
                _this = this
            switch (oTypeConstraints['model']) {
                case 'Input':
                    switch (oTypeConstraints['type']) {
                        case 'short':
                        case 'int':
                        case 'long':
                        case 'float':
                        case 'decimal':
                            input = new Input({
                                name: oProperty,
                                type: 'Number',
                                required: oReq
                            }).addStyleClass('InputClass')
                            break
                        case 'string':
                            input = new Input({
                                name: oProperty,
                                required: oReq
                            }).addStyleClass('InputClass')
                            break
                        case 'DateTime':
                            let drs = new DateRangeSelection({
                                name: oProperty,
                                placeholder: ' ',
                                required: oReq,
                                change: function (oEvent) {
                                }
                            }).addStyleClass('DatePickerClass'),
                                dp = new DatePicker({
                                    name: oProperty,
                                    placeholder: ' ',
                                    valueFormat: 'yyyy-MM-dd',
                                    visible: false,
                                    change: function (oEvent) {
                                    }
                                }).addStyleClass('DatePickerClass')
                            datePickers.push(drs)
                            datePickers.push(dp)
                            input = new HorizontalLayout({
                                allowWrapping: true,
                                content: [drs, dp]
                            })
                            break
                        case 'bool':
                            input = new CheckBox({
                                name: oProperty,
                                required: oReq
                            }).addStyleClass('CheckBoxClass')
                            break
                        default:
                            input = new Text({
                                visible: false,
                                layoutData: new GridData({
                                    visibleXL: false,
                                    visibleL: false,
                                    visibleM: false,
                                    visibleS: false
                                })
                            })
                            break
                    }
                    break
                case 'SingleSelect':
                    let n = this
                    do {
                        n = n.getParent()
                    } while (n != null && n.getMetadata().getName() != 'sap.ui.core.mvc.XMLView')
                    
                    input = new Select({
                        name: oProperty,
                        forceSelection: false,
                        required: oReq,
                        change: function (oEvent) {
                            if (n != null && n.getController() != null) {
                                let c = n.getController()[oTypeConstraints['change']]
                                if (c != null) {
                                    c(oEvent)
                                    //eval('n.getController().'+oTypeConstraints['change'] + '(' + oEvent + ')')
                                }
                            }
                        },
                        width: '100%'
                    }).addStyleClass('SelectClass')
                    if (oTypeConstraints['bind'] != null) {
                        let main = oTypeConstraints['bind'].replace(/(.*>).*/g, '$1')
                        input.bindItems({
                            path: oTypeConstraints['bind'],
                            template: new ListItem({
                                key: '{' + main + 'id}',
                                text: '{' + main + 'text}',
                            })
                        })
                    }
                    break
                case 'MultiComboBox':
                    input = new MultiComboBox({
                        name: oProperty,
                        required: oReq,
                        width: '100%'
                    }).addStyleClass('FilterInput MultiComboBoxClass')
                    if (oTypeConstraints['bind'] != null) {
                        let main = oTypeConstraints['bind'].replace(/(.*>).*/g, '$1')
                        input.bindItems({
                            path: oTypeConstraints['bind'],
                            template: new ListItem({
                                key: '{' + main + 'id}',
                                text: '{' + main + 'text}',
                            })
                        })
                    }
                    break
                case 'TableSelect':
                    let oColumns = []
                    oTypeConstraints['colsBind'].forEach((u,i) => {
                        oColumns.push(new Column({
                            width: oTypeConstraints['colsWidth'][i],
                            showFilterMenuEntry: false,
                            filterProperty: u,
                            label: new Label({
                                text: oTypeConstraints['colsShow'][i]
                            }),
                            template: new Text({
                                text: '{' + u + '}'
                            }),
                        }))
                    })
                    if (TableInput == null)
                        TableInput = custom.customInput.TableInput
                    let tabs = JSON.parse(oTypeConstraints['tableBinds'].replace(/'/g, '"'))
                    for (let t in tabs) {
                        let pet = /(.+)>.+/g
                        if (pet.test(tabs[t])) {
                            let m = tabs[t].replace(pet, '$1')
                            if (this.getModel(m) == null) {
                                this.setModel(new JSONModel({}), m)
                            }
                        }
                    }
                    input = new TableInput({
                        name: oProperty,
                        value: oTypeConstraints['value'],
                        required: oReq,
                        showValue: oTypeConstraints['showValue'],
                        tableTitle: oTypeConstraints['tableTitle'],
                        //tableBinds: oTypeConstraints['tableBinds'],
                        tableBinds: tabs,
                        url: oTypeConstraints['url'],
                        attachedData: oTypeConstraints['attachedData'],
                        styleClass:'InputClass',
                        columns: oColumns
                    })
                    break
                case 'SearchSelect':
                    let s = this
                    do {
                        s = s.getParent()
                    } while (s != null && s.getMetadata().getName() != 'sap.ui.core.mvc.XMLView')

                    input = new SearchField({
                        placeholder:'',
                        enableSuggestions:true,
                        showSearchButton:false,
                        suggest: function (event) {
                            let sValue = event.getParameter('suggestValue'),
                                aFilters = [],
                                oS = event.getSource()
                            if (sValue) {
                                aFilters = [
                                    new Filter([
                                        new Filter('text', function (sText) {
                                            return (sText || '').toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                                        })
                                    ], false)
                                ];
                            }

                            oS.getBinding('suggestionItems').filter(aFilters)
                            oS.suggest()
                        },
                        change: function (oEvent) {
                            if (s != null && s.getController() != null) {
                                let c = s.getController()[oTypeConstraints['change']]
                                if (c != null) {
                                    c(oEvent)
                                    //eval('n.getController().'+oTypeConstraints['change'] + '(' + oEvent + ')')
                                }
                            }
                        },
                        width: '100%'
                    }).addStyleClass('SearchFieldClass')
                    if (oTypeConstraints['bind'] != null) {
                        let main = oTypeConstraints['bind'].replace(/(.*>).*/g, '$1')
                        input.bindAggregation('suggestionItems',{
                            path: oTypeConstraints['bind'],
                            template: new SuggestionItem({
                                key: '{' + main + 'id}',
                                text: '{' + main + 'text}',
                            })
                        })
                    }
                    break
                default:
                    input = new Text({
                        visible: false,
                        layoutData: new GridData({
                            visibleXL: false,
                            visibleL: false,
                            visibleM: false,
                            visibleS: false
                        })
                    })
                    break
            }
            input.addCustomData(new CustomData({
                key: 'type',
                value: 'Field'
            })).addStyleClass('FilterInput')

            if (input != null) {
                if (oTypeConstraints['type'] == 'DatePickerClass')
                    input.getContent().forEach(u => {
                        u['getAllFilters'] = function () { return _this }
                    })
                else {
                    input['getAllFilters'] = function () { return _this }
                }
            }
            return input
        },

        getInputValue: function (oInput, oTypeConstraints) {
            let _d = ''
            switch (oTypeConstraints['model']) {
                case 'Input':
                    switch (oTypeConstraints['type']) {
                        case 'short':
                        case 'int':
                        case 'long':
                        case 'float':
                        case 'decimal':
                        case 'string':
                            _d = this.htmlEncodeByRegExp(oInput.getValue())
                            break
                        case 'DateTime':
                            let oKey = oInput.getParent().getContent()[1].getSelectedKey()
                            if (oKey == 'between') {
                                oInput = oInput.getContent()[0]
                                if (oInput.getValue() != '')
                                    _d = this.formatting(oInput.getFrom()) + ' and ' + this.formatting(oInput.getTo())
                            }
                            else {
                                oInput = oInput.getContent()[1]
                                _d = oInput.getValue() + (oKey == '>' ? ' 00:00:00' : ' 23:59:59')
                            }
                            break
                        case 'bool':
                            _d = oInput.getSelected()
                            break
                        default:
                            _d = oInput.getValue()
                    }
                    break
                case 'SingleSelect':
                    _d = oInput.getSelectedKey()
                    break
                case 'MultiComboBox':
                    _d = oInput.getSelectedKeys().join()
                    break
                case 'TableSelect':
                    _d = oInput.getValue()
                    break
                case 'SearchSelect':
                    let _item = oInput.getSuggestionItems().find(u => u.getText() == oInput.getValue())
                    if (_item != null)
                        _d = _item.getKey()
                    else
                        _d = oInput.getValue()
                    break
                default:
                    break
            }
            return _d
        },

        getData: function () {
            let _data = [],
                items = [],
                content = this.getAggregation('_panel').getContent()[0].getContent()[0]
            if (content.getItems != null) {
                content.getItems().forEach(u => {
                    items = items.concat(u.getItems())
                })
            }
            else {
                items = content.getContent()
            }
            items.forEach(u => {
                let temp = u.getContent()
                if (temp != null) {
                    let _t = temp[0].getCustomData().find(x => x.getKey() == 'TypeConstraints')
                    if (_t != null && _t.getValue() != null) {
                        let _v = this.getInputValue(temp[2], _t.getValue())
                        if (_v != null && _v != '') {
                            _data.push({
                                Field: _t.getValue()['property'],
                                Conditional: temp[1].getSelectedKey(),
                                Value: _v,
                                Type: _t.getValue()['type']
                            })
                        }
                    }
                }
            })
            return _data
        },

        byName: function (n) {
            let i = filterField.findIndex(u => u.name == n)
            return i != -1 ? filterField[i]['content'] : null
        },

        _getInput: function (c) {
            let input = null
            if (c != null) {
                input = c.getContent()[2]
                if (input != null && input.getMetadata().getName() == 'sap.ui.layout.HorizontalLayout')
                    input = input.getContent().find(u => u.getVisible())
            }

            return input
        },

        clearFilter: function (oInput, oTypeConstraints) {
            switch (oTypeConstraints['model']) {
                case 'Input':
                    switch (oTypeConstraints['type']) {
                        case 'short':
                        case 'int':
                        case 'long':
                        case 'float':
                        case 'decimal':
                        case 'string':
                            oInput.setValue()
                            break
                        case 'DateTime':
                            oInput.getContent()[0].setValue()
                            oInput.getContent()[1].setValue()
                            break
                        case 'bool':
                            oInput.setSelected(false)
                            break
                        default:
                            oInput.setValue()
                    }
                    break
                case 'SingleSelect':
                    oInput.setSelectedKey()
                    break
                case 'MultiComboBox':
                    oInput.setSelectedKeys()
                    break
                case 'TableSelect':
                    oInput.setInputValue()
                    break
                default:
                    break
            }
        },

        clearAllFilter: function () {
            let sTableControlId = this.getTableFor(),
                oTableControl = sTableControlId && sap.ui.getCore().byId(sTableControlId)
            this.getAggregation('_panel').getContent()[0].getContent()[0].getContent().forEach(u => {
                let temp = u.getContent()
                if (temp != null) {
                    let _t = temp[0].getCustomData().find(x => x.getKey() == 'TypeConstraints')
                    if (_t != null && _t.getValue() != null) {
                        this.clearFilter(temp[2], _t.getValue())
                    }
                }
            })
            if (oTableControl != null) {
                oTableControl.sort(null)
            }
        },

        fireSearchButton: function() {
            if (this.getAggregation('_panel'))
                this.getAggregation('_panel').getHeaderToolbar().getContent()[2].firePress()
        },

        CheckRequired: function (oData) {
            let _data = [],
                items = [],
                content = this.getAggregation('_panel').getContent()[0].getContent()[0],
                success = true
            if (content.getItems != null) {
                content.getItems().forEach(u => {
                    items = items.concat(u.getItems())
                })
            }
            else {
                items = content.getContent()
            }
            items.forEach(u => {
                if (u.getInput().getRequired != null && u.getInput().getRequired()) {
                    let temp = oData.find(x => x['Field'] == u.getInput().getName())
                    if (temp != null && temp['Value'] != null && temp['Value'] != '') {
                        u.getInput().setValueState('None').setValueStateText()
                    }
                    else {
                        success = false
                        u.getInput().setValueState('Error').setValueStateText(_i18n.getText('ValueStateText_CannotEmpty'))
                    }
                }
            })

            return success
        },

        //获取CustomData
        getCustomData: function (oT, oKey) {
            let _t = oT.getCustomData().find(u => u.getKey() == oKey)
            return _t == null ? null : _t.getValue()
        },

        renderer: {

            render: function (oRm, oControl) {
                if (oControl.getIsInit()) {
                    oControl.setIsInit(false)
                    _i18n = oControl.getModel('i18n').getResourceBundle()
                    let sTableControlId = oControl.getTableFor(),
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
                    let oSearchButton = new Button({
                        icon: 'sap-icon://search',
                        text: '{i18n>Buttons_Query}',
                        visible: false,
                        press: function (oEvent) {
                            let _d = oControl.getData(),
                                oPageReq = oTableControl.getCustomData().find(u => u.getKey() == 'pageReq'),
                                oSord = oTableControl.getSortedColumns()
                            if (oControl.CheckRequired(_d)) {
                                if (oPageReq != null) {
                                    let oTableReq = oPageReq.getValue()
                                    oTableReq['Filters'] = _d
                                    if (oSord != null && oSord.length > 0) {
                                        oTableReq['SField'] = oSord[0].getSortProperty()
                                        oTableReq['SOrder'] = oSord[0].getSortOrder()
                                    }
                                    else {
                                        oTableReq['SField'] = null
                                        oTableReq['SOrder'] = null
                                    }
                                }
                                else {
                                    oTableControl.addCustomData(
                                        new CustomData({
                                            key: 'pageReq',
                                            value: {
                                                Page: 1,
                                                Count: 0,
                                                TotalCount: 0,
                                                TotalPage: 1,
                                                Limit: oTableControl.getVisibleRowCount(),
                                                Filters: _d,
                                                SField: oSord != null && oSord.length > 0 ? oSord[0].getSortProperty() : null,
                                                SOrder: oSord != null && oSord.length > 0 ? oSord[0].getSortOrder() : null
                                            }
                                        })
                                    )
                                }
                                oControl.fireSearch({
                                    data: _d
                                })
                            }
                        }
                    }).addStyleClass('DefaultButton AutoButton')
                    let oClearButton = new Button({
                        icon: 'sap-icon://clear-filter',
                        visible: false,
                        tooltip: '{i18n>Buttons_ClearFilters}',
                        press: function (oEvent) {
                            oControl.clearAllFilter()
                            oControl.fireAfterClear()
                            if (oControl.getAutoSearch())
                                oSearchButton.firePress()
                        }
                    }).addStyleClass('DefaultButton AutoButton')
                    let oExpandButton = new Button({
                        icon: 'sap-icon://drop-down-list',
                        tooltip: '{i18n>custom_TableFilter_ShowFilter}',
                        press: function (oEvent) {
                            let oButton = oEvent.getSource(),
                                oExpanded = oPanel.getExpanded()
                            oPanel.setExpanded(!oExpanded).rerender()
                            if (oExpanded) {
                                oButton.setIcon("sap-icon://drop-down-list").setTooltip(_i18n.getText('custom_TableFilter_ShowFilter')).rerender()
                                oSearchButton.setVisible(false)
                                oClearButton.setVisible(false)
                            }
                            else {
                                oButton.setIcon("sap-icon://collapse-all").setTooltip(_i18n.getText('custom_TableFilter_CloseFilter')).rerender()
                                oSearchButton.setVisible(true)
                                oClearButton.setVisible(true)
                            }
                            oControl.datePickersAttribute()
                        }
                    }).addStyleClass('DefaultButton AutoButton')
                    let oPanel = new Panel({
                        expandable: oControl.getExpandable(),
                        width: 'auto',
                        visible: oControl.getVisible(),
                        headerToolbar: new OverflowToolbar({
                            visible: oControl.getExpandable(),
                            style: 'Clear',
                            content: [
                                new ToolbarSpacer(),
                                oSearchButton,
                                oClearButton,
                                oExpandButton
                            ]
                        }),
                        content: new SimpleForm({
                            editable: true,
                            layout: 'ResponsiveGridLayout',
                            content: oControl.getLayout()
                        }).addStyleClass('TableFilter NoTitle')
                    }).addStyleClass('NoExpandButton')
                    if (oControl.getTitleMode() == 'Title') {
                        oPanel.getHeaderToolbar().insertContent(new Title({
                            text: oControl.getTitle()
                        }), 0)
                    }
                    let oSimpleForm = oPanel.getContent()[0].getContent()[0]
                    oTableControl.getColumns().forEach(u => {
                        if ((u.getVisible() || (u.getWidth() == '0' || u.getWidth() == '0rem' || u.getWidth() == '0px')) && u.getFilterProperty() != '' && u.getFilterProperty() != null) {
                            let oFilterType = u.getFilterType(),
                                oFilterTypeConstraints,
                                req = oControl.getCustomData(u, 'required') == 'true'//字段必填
                            if (oFilterType == null) {
                                oFilterTypeConstraints = {
                                    model: 'Input',
                                    type: 'string',
                                    oper: u.getFilterOperator(),
                                    doper: u.getDefaultFilterOperator(),
                                    property: u.getFilterProperty()
                                }
                            }
                            else {
                                oFilterTypeConstraints = oFilterType.getConstraints()
                                if (oFilterTypeConstraints['model'] == null)
                                    oFilterTypeConstraints['model'] = 'Input'
                                if (oFilterTypeConstraints['type'] == null)
                                    oFilterTypeConstraints['type'] = 'string'
                                oFilterTypeConstraints['oper'] = u.getFilterOperator()
                                oFilterTypeConstraints['doper'] = u.getDefaultFilterOperator()
                                oFilterTypeConstraints['property'] = u.getFilterProperty()
                            }
                            let content = new HorizontalLayout({
                                allowWrapping: true,
                                content: [
                                    new Label({
                                        text: u.getLabel().getText(),
                                        width: '10rem',
                                        wrapping: true,
                                        required: req
                                    }).addCustomData(new CustomData({
                                        key: 'TypeConstraints',
                                        value: oFilterTypeConstraints
                                    })).addStyleClass('FilterField'),
                                    oControl.getOper(oFilterTypeConstraints),
                                    oControl.getInput(oFilterTypeConstraints, u.getFilterProperty(), req)
                                ]
                            }).addStyleClass('layout')
                            content['getInput'] = function () { return oControl._getInput(content) }
                            if (oControl.getContentMode() == "FlexBox") {
                                if (oFilterTypeConstraints['wrapping'] == 'true') {
                                    oSimpleForm.addItem(new HBox())
                                }
                                oSimpleForm.getItems()[oSimpleForm.getItems().length - 1].addItem(content)
                            }
                            else {
                                oSimpleForm.addContent(content)
                            }
                            let i = filterField.findIndex(x => x.name == u.getFilterProperty())
                            if (i == -1)
                                filterField.push({ name: u.getFilterProperty(), content: content })
                            else
                                filterField[i].content = content
                        }
                    })
                    oTableControl.attachSort(function (oEvent) {
                        let column = oEvent.getParameter('column'),
                            order = oEvent.getParameter('sortOrder')
                        column.setSortOrder(order)
                        oSearchButton.firePress()
                    })
                    oTableControl.addDependent(oPanel)
                    if (oControl.getExpanded())
                        oExpandButton.firePress()
                    oControl.setAggregation("_panel", oPanel)
                    oRm.renderControl(oPanel)
                }
                else {
                    oRm.renderControl(oControl.getAggregation("_panel"))
                }
            }
        }
    });

    custom.customTable.CustomTable.prototype.exit = function () {
        /* release resources that are not released by the SAPUI5 framework */
        
    };
});
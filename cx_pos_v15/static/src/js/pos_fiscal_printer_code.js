odoo.define('cx_pos_v15_fiscal_printer.code', function(require) {
    "use strict";

    const {Gui} = require('point_of_sale.Gui');
    const Registries = require('point_of_sale.Registries');
    const PaymentScreen  = require('point_of_sale.PaymentScreen');

    //Override order model
    var models = require('point_of_sale.models');
    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        set_code_value: function(code_value) {
            this.code_value = code_value;
        },
        export_as_JSON: function() {
            var json = _super_order.export_as_JSON.apply(this, arguments);
            var order = this.pos.get('selectedOrder');
            if (order) {
                json.input_value = this.code_value;
            }
            return json
        },

    })

    //Fiscal Printer code popup
    const FiscalPrinterCode = (PaymentScreen) =>
        class extends PaymentScreen{
            constructor(){
                super(...arguments);
            }
            async fiscalPrinterCode() {
                var self = this;
                const { confirmed, payload } = await this.showPopup('TextInputPopup', {
                    title: this.env._t('Insert fiscal printer code'),
                });
                if (confirmed) {
                    let order = this.env.pos.get_order();
                    order.set_code_value(payload);
                }
             };
        };
        Registries.Component.extend(PaymentScreen, FiscalPrinterCode);
        return FiscalPrinterCode;

});
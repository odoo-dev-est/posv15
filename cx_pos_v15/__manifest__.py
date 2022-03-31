# -*- coding: utf-8 -*-
{
    'name': "Customizations POS",
    'description': """

    Customizations for Point of Sale, print receipts using api.

    Colaborador: Jesús David Briceño
    """,
    'author': "ESTELIO",
    'category': 'Point of Sale',
    'version': '15.0.1',
    'depends': ['point_of_sale', 'hr'],
    'data': [
        'security/ir.model.access.csv',
        # 'views/pos_assets.xml',
        'views/account_tax.xml',
        'views/pos_session.xml',
        'views/payment_methods.xml',
        'views/cashier.xml',
        #'views/return.xml',
        'views/header_footer.xml'
    ],
    # 'qweb':[
    #     'static/src/xml/pos.xml',
    #     'static/src/xml/pos_return.xml'
    # ],
    'assets': {
        'point_of_sale.assets': [
            'cx_pos_v15/static/src/js/pos_print.js',
            'cx_pos_v15/static/src/js/pos_fiscal_printer_code.js',
        ],
        'web.assets_qweb': [
            'cx_pos_v15/static/src/xml/pos.xml',
        ],
    },
    'installable': True
}

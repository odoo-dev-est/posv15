# -*- coding: utf-8 -*-

from odoo import api, fields, models
from odoo.exceptions import UserError

class HeaderFooter(models.Model):
    _name = 'pos.header.footer'
    _description = 'Header and footer for register in fiscal printer'

    name = fields.Char(string='Descriptor', require=True)
    header = fields.Text(string='Header', require=True)
    footer = fields.Text(string='Footer', require=True)
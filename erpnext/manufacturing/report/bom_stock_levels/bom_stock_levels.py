from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
        if not filters: filters = {}

        columns = get_columns()

        data = get_bom_stock(filters)

        return columns, data

def get_columns():
        """return columns"""
        columns = [
                _("Item") + ":Link/Item:150",
                _("Description") + "::500",
                _("Qty per BOM Line") + ":Float:100",
                _("Required Qty") + ":Float:100",
                _("In Stock Qty") + ":Float:100",
                _("Enough Parts to Build") + ":Float:200",
        ]

        return columns
def get_bom_stock(filters):
        bom = filters.get("bom")
        table = "`tabBOM Item`"
	bom_item = table
        qty_field = "qty"
        qty_to_produce = filters.get("qty_to_produce",1)
        
        item_qty = frappe.db.count("Serial No", {"item_code": bom_item.item_code, "status": "Free"})
        return frappe.db.sql("""
                        SELECT
                                bom_item.item_code,
                                bom_item.description,
                                bom_item.{qty_field},
                                bom_item.{qty_field} * {qty_to_produce},
                                sum(item_qty) as actual_qty,
                                sum(FLOOR(item_qty / (bom_item.{qty_field} * {qty_to_produce})))
                        FROM
                                {table} AS bom_item
                                LEFT JOIN `tabBin` AS ledger
                                ON bom_item.item_code = ledger.item_code
                        WHERE
                                bom_item.parent = '{bom}' and bom_item.parenttype = 'BOM'
                                
                        GROUP BY bom_item.item_code""".format(
                                qty_field=qty_field,
                                table=table,
                                bom=bom,
                                qty_to_produce=qty_to_produce or 1)
                        )        

                                
                                

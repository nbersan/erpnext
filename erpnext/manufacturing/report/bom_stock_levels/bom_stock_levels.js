frappe.query_reports["BOM Stock Levels"] = {
        "filters": [
                {
                        "fieldname": "bom",
                        "label": __("BOM"),
                        "fieldtype": "Link",
                        "options": "BOM",
                        "reqd": 1
                }, {
                        "fieldname": "show_exploded_view",
                        "label": __("Show exploded view"),
                        "fieldtype": "Check"
                }, {
                        "fieldname": "qty_to_produce",
                        "label": __("Quantity to Produce"),
                        "fieldtype": "Int",
                        "default": "1"
                 },
        ],
        "formatter": function(value, row, column, data, default_formatter) {
                value = default_formatter(value, row, column, data);
                if (column.id == "Item"){
                        if (data["Enough Parts to Build"] > 0){
                                value = `<a style='color:green' href="#Form/Item/${data['Item']}" data-doctype="Item">${data['Item']}</a>`
                        } else {
                                value = `<a style='color:red' href="#Form/Item/${data['Item']}" data-doctype="Item">${data['Item']}</a>`
                        }
                }
                return value
        }
}


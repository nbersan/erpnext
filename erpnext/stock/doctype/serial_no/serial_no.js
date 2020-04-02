// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

cur_frm.add_fetch("customer", "customer_name", "customer_name")
cur_frm.add_fetch("supplier", "supplier_name", "supplier_name")
cur_frm.add_fetch("item_code", "item_name", "item_name")
cur_frm.add_fetch("item_code", "description", "description")
cur_frm.add_fetch("item_code", "item_group", "item_group")
cur_frm.add_fetch("item_code", "brand", "brand")

cur_frm.cscript.onload = function() {
	cur_frm.set_query("item_code", function() {
		return erpnext.queries.item({"is_stock_item": 1, "has_serial_no": 1})
	});
};

let table;
let is_v1;
let tst_port;

frappe.ui.form.on('Serial No', {
	refresh: function(frm) {
		tst_port = cur_frm.doc.cam_port;
		frm.toggle_enable("item_code", frm.doc.__islocal);
		table = cur_frm.doc.item_details;
		if(cur_frm.doc.item_group === "Full Systems") {
			//Filter the proposed values for the "cam_port" field.
			frm.set_query("cam_port", function() {
				return {
					filters: [
						["Serial No", "item_code", "in", "CCPort"],
						["Serial No", "status", "in", "Free"]
					]
				};
			});
			//Filter the proposed values for the "serial_no" field in the "item_details" table.
			frm.fields_dict.item_details.grid.get_field("serial_no").get_query = function(doc,cdt,cdn) {
				return {
					filters: [
						["Serial No", "status", "in", ["Free", "WIP Need Case", "WIP"]]
					]
				};
			};
			//If the camera status is "Under Testing", set the camera location value to "Testbench - Lausanne".
			if(cur_frm.doc.status === "Under Testing") {
				frm.set_value("cc_location", "Testbench - Lausanne");
			}
			//If the camera status is "Ready" or "Committed", set the camera location value to "Storage Room - Lausanne".
			if(cur_frm.doc.status === "Ready" || cur_frm.doc.status === "Committed") {
				frm.set_value("cc_location", "Storage Room - Lausanne");
			}
			//If the camera status is WIP, WIP Need Case,To Investigate, To Be Tested or To Refurbish, set the camera location to "Workshop - Lausanne".
			if (cur_frm.doc.status==="WIP"||cur_frm.doc.status==="WIP Need Case"||cur_frm.doc.status==="To Investigate"||cur_frm.doc.status==="To Be Tested") {
				frm.set_value("cc_location", "Workshop - Lausanne");
			}
			//If the camera port field is not empty and not qual to "CC-NoPort, set the port status to "Used". 
			if(cur_frm.doc.cam_port.length !== 0 && cur_frm.doc.cam_port !== "CC-NoPort") {
				frappe.call({
					method: "frappe.client.set_value",
					args: {
						doctype: "Serial No",
						name: cur_frm.doc.cam_port,
						fieldname: {
							status: "Used",
							parent_item_serial_no: cur_frm.doc.serial_no
						}
					}
				});
			}
			if(table.length !== 0) {
				//For all the records in the table, set the serial no status to "Used".
				for (var i = 0; i < table.length; i++) {
					frappe.call({
						method: "frappe.client.set_value",
						args: {
							doctype: "Serial No",
							name: table[i].serial_no,
							fieldname: {
								status: "Used",
								parent_item_serial_no: cur_frm.doc.serial_no
							}
						}
					});
				}
			}
		}
	}
});

frappe.ui.form.on('Crane Camera Item', {
	//When removing an item in the table, set the serial no status to "Free".
	before_item_details_remove: function(frm,cdt,cdn) {
		const selected = frm.get_selected();
		selected.item_details.forEach(function(name) {
			const item = table.find(function(item) {
				return item.name === name;
			});
			frappe.call({
				method: "frappe.client.set_value",
				args: {
					doctype: "Serial No",
					name: item.serial_no,
					fieldname: {
						status: "Free",
						parent_item_serial_no: ""
					}
				}
			});
		});
	}
});

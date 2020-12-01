frappe.listview_settings['Customer'] = {
	add_fields: ["customer_name", "territory", "customer_group", "customer_type", "image", "disabled"],
	onload: function(me) {
		frappe.route_options = {
			"disabled": 0
		}
	},
	///filters: [["disabled", "=", "0"]]
};

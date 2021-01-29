frappe.listview_settings['Customer Project'] = {
	add_fields: ["status", "site", "customer"],
	get_indicator: function(doc) {
		return [__(doc.status), {
			"Open": "red",
			"In Progress": "yellow",
			"Done": "green",
			"Cancelled": "red"
		}[doc.status],"status,=,"+ doc.status];
	}
};

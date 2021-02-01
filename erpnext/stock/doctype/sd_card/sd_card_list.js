frappe.listview_settings['Serial No'] = {
	add_fields: ["id_no", "status"],
	get_indicator: function (doc) {
		return [__(doc.status), {
			"Free": "green",
			"Used": "red",
			"Old": "red"
		}[doc.status], "status,="+ doc.status];
	}
};

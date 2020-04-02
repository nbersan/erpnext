frappe.listview_settings['Crane Camera Issue'] = {
	add_fields: ["log_type", "log_name"],
	get_indicator: function (doc)  {
		return [__(doc.log_type), {
			"Error": "red",
			"Warning": "yellow"
		}[doc.log_type],"log_type,=,"+ doc.log_type];
	}
};

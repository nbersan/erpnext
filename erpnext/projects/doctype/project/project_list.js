frappe.listview_settings['Project'] = {
	add_fields: ["status", "priority", "is_active", "percent_complete", "expected_end_date", "project_name"],
	//filters:[["status","=", "Open"]],
	get_indicator: function(doc) {
		return [__(doc.status), {
			"Open": "red",
			"Cameras Assigned": "orange",
			"In Progress": "yellow",
			"Cameras Return": "blue",
			"Completed": "green",
			"Cancelled": "red"
		}[doc.status],"status,=,"+ doc.status];
/*		if(doc.status=="Open" && doc.percent_complete) {
			return [__("{0}%", [cint(doc.percent_complete)]), "orange", "percent_complete,>,0|status,=,Open"];
		} else {
			return [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
		}*/
	}
};

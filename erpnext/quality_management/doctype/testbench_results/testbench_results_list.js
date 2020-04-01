frappe.listview_settings['TestBench Results'] = {
	add_fields: ["test_status", "camera_port", "camera_version"],
	get_indicator: function (doc)  {
		return [__(doc.test_status), {
			"Not Started": "blue",
			"In Progress": "yellow",
			"Passed": "green",
			"Failed": "red"
		}[doc.test_status],"test_status,=,"+ doc.test_status];
	}
};

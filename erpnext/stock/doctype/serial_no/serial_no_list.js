frappe.listview_settings['Serial No'] = {
	add_fields: ["status", "item_code", "warehouse", "warranty_expiry_date", "delivery_document_type", "under_test_state"],
	get_indicator: function (doc)  {
		return [__(doc.status), {
			"Free": "green",
			"Used": "red",
			"Broken": "red",
			"Lost": "red",
			"On Site": "blue",
			"To Be Tested": "yellow",
			"WIP": "yellow",
			"WIP Need Case": "yellow",
			"R&D": "black",
			"Committed": "green",
			"Tradeshow": "dark blue",
			"To Investigate": "red",
			"Empty": "black",
			"Under Testing": "yellow",
			"Ready": "green",
			"Shipped": "blue"
		}[doc.status],"status,=,"+ doc.status];
		return [__(doc.under_test_state), {
			"Online": "green",
			"Offline": "red"
		}[doc.under_test_state],"under_test_state,=,"+ doc.under_test_state];
	}/*
		if (doc.status) {
			return [__("Used"), "red", "status,=,Used"];
		} else if (doc.status) {
			return [__("Free"), "green", "status,=,Free"];
		} else if (doc.status) {
			return [__("Broken"), "red", "status,=,Broken"];
		} else if (doc.status) {
			return [__("Lost"), "red", "status,=,Lost"];
		} else if (doc.status) {
			return [__("On Site"), "blue", "status,=,On Site"];
		} else if (doc.status) {
			return [__("To Be Tested"), "yellow", "status,=,To Be Tested"];
		} 
	}*/
};

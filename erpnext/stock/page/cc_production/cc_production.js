frappe.pages['cc_production'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'CC Production',
		single_column: true
	});
$(frappe.render_template('cc_production')).appendTo(page.body);
}

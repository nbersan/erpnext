frappe.pages['test_page'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Test page',
		single_column: true
	});
$(frappe.render_template(‘test_page’)).appendTo(page.body);
}

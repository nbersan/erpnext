frappe.provide('frappe.dashboards.chart_sources');

frappe.dashboards.chart_sources["Cameras"] = {
        method: "erpnext.stock.dashboard_chart_source.cameras.cameras.get",

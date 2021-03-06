// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

let cam_ass;

frappe.ui.form.on("Customer", {
	refresh: function(frm,cdt,cdn) {
		//Default code at refresh.
                if (frappe.defaults.get_default("cust_master_name")!="Naming Series") {
                	frm.toggle_display("naming_series", false);
                } else {
                	erpnext.toggle_naming_series();
                }

                frappe.dynamic_link = {doc: frm.doc, fieldname: 'name', doctype: 'Customer'}
                frm.toggle_display(['address_html','contact_html','primary_address_and_contact_detail'], !frm.doc.__islocal);

                if(!frm.doc.__islocal) {
                        frappe.contacts.render_address_and_contact(frm);

                        // custom buttons
                        frm.add_custom_button(__('Accounting Ledger'), function() {
                                frappe.set_route('query-report', 'General Ledger',
                                        {party_type:'Customer', party:frm.doc.name});
                        });

                        frm.add_custom_button(__('Accounts Receivable'), function() {
                                frappe.set_route('query-report', 'Accounts Receivable', {customer:frm.doc.name});
                        });

                        frm.add_custom_button(__('Pricing Rule'), function () {
                                erpnext.utils.make_pricing_rule(frm.doc.doctype, frm.doc.name);
                        }, __('Create'));

                        // indicator
                        erpnext.utils.set_party_dashboard_indicators(frm);

                } else {
                        frappe.contacts.clear_address_and_contact(frm);
                }

                var grid = cur_frm.get_field("sales_team").grid;
                grid.set_column_disp("allocated_amount", false);
                grid.set_column_disp("incentives", false);


		//Custom Code at refresh.
		var d = locals[cdt][cdn];
		cam_ass = cur_frm.doc.cam_assigned;
		//Filter list of ready cameras displayed that can be assigne to the customer.
		frm.fields_dict.cam_assigned.grid.get_field("serial_no").get_query = function(doc,cdt,cdn) {
			return {
				filters: [
					["Serial No", "status", "in", "Ready"]
				],
			};
		};

		//Display the total amount of cameras assigned to this customer.
		var total_cam_ass = 0;
		cur_frm.doc.cam_assigned.forEach(function(d) {
			if (d.is_sent === 0 && d.is_back === 0) {
				total_cam_ass++;
			}
		});
		frm.set_value("cam_assi", total_cam_ass);
		console.log("Cameras Assigned : "+ cur_frm.doc.cam_assi);

		//For SDV Cameras:
		//Check in the projects table the quantity of cameras needed for Open Projects.
		var total_sdv = 0;
		cur_frm.doc.cam_nd.forEach(function(d) {
			if (d.sdv_nd !== 0) {
				total_sdv += d.sdv_nd;
			}
		});
		cur_frm.doc.proj_done.forEach(function(d) {
			if (d.sdv_nd !== 0) {
				total_sdv += d.sdv_nd;
			}
		});
		var total_sdv_nd = 0;
		cur_frm.doc.cam_nd.forEach(function(d) {
			if (d.status !== "Done" && d.sdv_nd !== 0) {
				total_sdv_nd += d.sdv_nd;
			}
		});
		frm.set_value("sdv_tot", total_sdv);
		console.log("Total SDV: "+ total_sdv);

		//Check in the assigned cameras table the quantity of cameras on site.
		var total_sdv_left = 0;
		cur_frm.doc.cam_assigned.forEach(function(d) {
			if (d.is_sent === 1 && d.is_back === 0 && d.item_code === "CCV1SDV") {
				total_sdv_left++;
			}
		});
		frm.set_value("sdv_left", total_sdv_left);
		console.log("SDV Left: "+ total_sdv_left);

		//In the Cameras Detail Section, check if the qty of cameras needed minus the qty of cameras on site is >0 and set the cameras needed and the cameras to be returned fields.
		var sdv_needed = 0;
		var sdv_back = 0;
		if  ((total_sdv_nd - total_sdv_left) >= 0) {
			sdv_needed = total_sdv_nd - total_sdv_left;
			frm.set_value("sdv_needed", sdv_needed);
			sdv_back = 0;
			frm.set_value("sdv_back", sdv_back);
		} else {
			sdv_back = -(total_sdv_nd - total_sdv_left);
			sdv_needed = 0;
			frm.set_value("sdv_back", sdv_back);
			frm.set_value("sdv_needed", sdv_needed);
		}
		console.log("SDV Needed: "+ sdv_needed);


		//For WCV Cameras.
		//Check in the projects table the quantity of cameras needed for Open Projects.
		var total_wcv = 0;
		cur_frm.doc.cam_nd.forEach(function(d) {
			if (d.wcv_nd !== 0) {
				total_wcv += d.wcv_nd;
			}
		});
		cur_frm.doc.proj_done.forEach(function(d) {
			if (d.wcv_nd !== 0) {
				total_wcv += d.wcv_nd;
			}
		});
		var total_wcv_nd = 0;
		cur_frm.doc.cam_nd.forEach(function(d) {
			if (d.status !== "Done" && d.wcv_nd !== 0) {
				total_wcv_nd += d.wcv_nd;
			}
		});
		frm.set_value("wcv_tot", total_wcv);
		console.log("Total WCV: "+ total_wcv);

		//Check in the assigned cameras table the quantity of cameras on site.
		var total_wcv_left = 0;
		var total_wcv_assigned = 0;
		cur_frm.doc.cam_assigned.forEach(function(d) {
			if (d.is_sent === 1 && d.is_back === 0 && d.item_code === "CCV1WCV") {
				total_wcv_left++;
			}
			if (d.is_sent === 0 && d.is_back === 0 && d.item_code === "CCV1WCV") {
				total_wcv_assigned++;
			}
		});
		frm.set_value("wcv_left", total_wcv_left);
		console.log("WCV Left: "+ total_wcv_left);

		//In the Cameras Detail Section, check if the qty of cameras needed minus the qty of cameras on site is >0 and set the cameras needed and the cameras to be returned fields.
		var wcv_needed = 0;
		var wcv_back = 0;
		if ((total_wcv_nd - total_wcv_left) >= 0) {
			wcv_needed = total_wcv_nd - total_wcv_left - total_wcv_assigned;
			frm.set_value("wcv_needed", wcv_needed);
			wcv_back = 0;
			frm.set_value("wcv_back", wcv_back);
		} else {
			wcv_back = -(total_wcv_nd - total_wcv_left);
			frm.set_value("wcv_back", wcv_back);
			wcv_needed = 0;
			frm.set_value("wcv_needed", wcv_needed);
		}
		console.log("WCV Needed: "+ wcv_needed);


		//For KCV Cameras.
		//Check in the projects table the quantity of cameras needed for Open Projects.
		var total_kcv = 0;
		cur_frm.doc.cam_nd.forEach(function(d) {
			if (d.kcv_nd !== 0) {
				total_kcv += d.kcv_nd;
			}
		});
		cur_frm.doc.proj_done.forEach(function(d) {
			if (d.kcv_nd !== 0) {
				total_kcv += d.kcv_nd;
			}
		});
		var total_kcv_nd = 0;
		cur_frm.doc.cam_nd.forEach(function(d) {
			if (d.status !== "Done" && d.kcv_nd !== 0) {
				total_kcv_nd += d.kcv_nd;
			}
		});
		frm.set_value("kcv_tot", total_kcv);
		console.log("Total KCV: "+ total_kcv);

		//Check in the assigned cameras table the quantity of cameras on site.
		var total_kcv_left = 0;
		var total_kcv_assigned = 0;
		cur_frm.doc.cam_assigned.forEach(function(d) {
			if (d.is_sent === 1 && d.is_back === 0 && d.item_code === "CCV1KCV") {
				total_kcv_left++;
			}
			if (d.is_sent === 0 && d.is_back === 0 && d.item_code === "CCV1KCV") {
				total_kcv_assigned++;
			}
		});
		frm.set_value("kcv_left", total_kcv_left);
		console.log("KCV Left: "+ total_kcv_left);

		//In the Cameras Detail Section, check if the qty of cameras needed minus the qty of cameras on site is >0 and set the cameras needed and the cameras to be returned fields.
		var kcv_needed = 0;
		var kcv_back = 0;
		if ((total_kcv_nd - total_kcv_left) >= 0) {
			kcv_needed = total_kcv_nd - total_kcv_left - total_kcv_assigned;
			frm.set_value("kcv_needed", kcv_needed);
			kcv_back = 0;
			frm.set_value("kcv_back", kcv_back);
		} else {
			kcv_back = -(total_kcv_nd - total_kcv_left);
			frm.set_value("kcv_back", kcv_back);
			kcv_needed = 0;
			frm.set_value("kcv_needed", kcv_needed);
		}
		console.log("KCV Needed: "+ kcv_needed);

		//Set the total amount of cameras in each field in the Cameras Summary Section.
		var cam_tot = cur_frm.doc.sdv_tot + cur_frm.doc.wcv_tot + cur_frm.doc.kcv_tot;
		var cam_need = cur_frm.doc.sdv_needed + cur_frm.doc.wcv_needed + cur_frm.doc.kcv_needed;
		var cam_left = cur_frm.doc.sdv_left + cur_frm.doc.wcv_left + cur_frm.doc.kcv_left;
		var cam_back = cur_frm.doc.sdv_back + cur_frm.doc.wcv_back + cur_frm.doc.kcv_back;
		frm.set_value("cam_tot", cam_tot);
		frm.set_value("cam_need", cam_need);
		frm.set_value("cam_left", cam_left);
		frm.set_value("cam_back", cam_back);

		//In the cameras assigned table.
		for (var i = 0; i < cam_ass.length; i++) {
			//for each camera that is only committed, set its status to "Committed" and fill its on_site field with the customer name.
			if (cam_ass[i].is_sent === 0 && cam_ass[i].is_back === 0) {
				frappe.call({
					method: "frappe.client.set_value",
					args: {
						doctype: "Serial No",
						name: cam_ass[i].serial_no,
						fieldname: {
							status: "Committed",
							on_site: cur_frm.doc.customer_name
						}
					}
				});
			}
			//For each camera tha is on site, set its status to "Shipped" and fill its on_site field with the customer name.
			if (cam_ass[i].is_sent === 1 && cam_ass[i].is_back === 0) {
				frappe.call({
					method: "frappe.client.set_value",
					args: {
						doctype: "Serial No",
						name: cam_ass[i].serial_no,
						fieldname: {
							on_site: cur_frm.doc.customer_name,
							status: "Shipped"
						}
					}
				});
			}
		}
	},






	setup: function(frm) {

		frm.make_methods = {
			'Quotation': () => frappe.model.open_mapped_doc({
				method: "erpnext.selling.doctype.customer.customer.make_quotation",
				frm: cur_frm
			}),
			'Opportunity': () => frappe.model.open_mapped_doc({
				method: "erpnext.selling.doctype.customer.customer.make_opportunity",
				frm: cur_frm
			})
		}

		frm.add_fetch('lead_name', 'company_name', 'customer_name');
		frm.add_fetch('default_sales_partner','commission_rate','default_commission_rate');
		frm.set_query('customer_group', {'is_group': 0});
		frm.set_query('default_price_list', { 'selling': 1});
		frm.set_query('account', 'accounts', function(doc, cdt, cdn) {
			var d  = locals[cdt][cdn];
			var filters = {
				'account_type': 'Receivable',
				'company': d.company,
				"is_group": 0
			};

			if(doc.party_account_currency) {
				$.extend(filters, {"account_currency": doc.party_account_currency});
			}
			return {
				filters: filters
			}
		});

		if (frm.doc.__islocal == 1) {
			frm.set_value("represents_company", "");
		}

		frm.set_query('customer_primary_contact', function(doc) {
			return {
				query: "erpnext.selling.doctype.customer.customer.get_customer_primary_contact",
				filters: {
					'customer': doc.name
				}
			}
		})
		frm.set_query('customer_primary_address', function(doc) {
			return {
				filters: {
					'link_doctype': 'Customer',
					'link_name': doc.name
				}
			}
		})
	},
	customer_primary_address: function(frm){
		if(frm.doc.customer_primary_address){
			frappe.call({
				method: 'frappe.contacts.doctype.address.address.get_address_display',
				args: {
					"address_dict": frm.doc.customer_primary_address
				},
				callback: function(r) {
					frm.set_value("primary_address", r.message);
				}
			});
		}
		if(!frm.doc.customer_primary_address){
			frm.set_value("primary_address", "");
		}
	},

	is_internal_customer: function(frm) {
		if (frm.doc.is_internal_customer == 1) {
			frm.toggle_reqd("represents_company", true);
		}
		else {
			frm.toggle_reqd("represents_company", false);
		}
	},

	customer_primary_contact: function(frm){
		if(!frm.doc.customer_primary_contact){
			frm.set_value("mobile_no", "");
			frm.set_value("email_id", "");
		}
	},

	loyalty_program: function(frm) {
		if(frm.doc.loyalty_program) {
			frm.set_value('loyalty_program_tier', null);
		}
	},

	validate: function(frm) {
		if(frm.doc.lead_name) frappe.model.clear_doc("Lead", frm.doc.lead_name);

	},
});

// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
let test_table;
let tst_st;
let tst_lg;
let tst_st_day;
let day_add;
let tot_number;

frappe.ui.form.on('TestBench Results', {
	camera_serial: function(frm) {
		//Automatically fill the camera port corresponding to the camera serial number.
		cur_frm.add_fetch("camera_serial", "cam_port", "camera_port");
		//Get the camera version corresponding to the Serial No, keeps only the 3 last characters and set the camera version field.
		frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Serial No",
				filters: {name: cur_frm.doc.camera_serial},
				fieldname:[
					"item_code"
				]
			},
			callback: function(r){
				//console.log(r.message.item_code);
				var it_code = r.message.item_code;
				var version = it_code.substring(it_code.length - 3);
				//console.log(version);
				cur_frm.set_value("camera_version",version);
			}
		});
	},
	refresh: function(frm,cdt,cdn) {
		var d = locals[cdt][cdn];
		test_table = cur_frm.doc.testbench_results_detail;
		tst_st = cur_frm.doc.testbench_results_detail[0].date;
		tst_lg = 0;
		var id_fail = 0;
		var fail = 0;
		var k = (test_table.length -5);
		var counter = 0;
		tot_number = 0;
		tst_st_day = moment.weekdays(cur_frm.doc.st_dte);
		frm.set_value("tot_number",0);
		frm.set_value("st_dte",tst_st);

		//Filter the proposed values in the camera_serial field.
		frm.set_query("camera_serial", function() {
			return {
				filters:[
					["Serial No","product_type","in","V1 Camera"],
					//["Serial No","status","in","Under Testing"]
				]
			};
		});

		//If no records in the testbench tabvle, set the testbench status as "Not Started".
		if(test_table.length === 0) {
			frm.set_value("test_status","Not Started");
		}
		if(test_table.length === 1) {
			frm.set_value("st_dte",tst_st);

			//When the first row is recorded, set the testbench status to "In Progress".
			frm.set_value("test_status","In Progress");

			//If the first row doesn't have comments.
			if(test_table[0].comments === "None") {

				//If the testbench start date is a Monday, set the testbench end date to "testbench start date +4 days".
				if(tst_st_day === "Monday") {
					frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.st_dte, 4));
				}

				//If the testbench start date is not a Monday, set the testbench end date to "testbench start date +6 days".
				else {
					frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.st_dte, 6));
				}
			}
			//If the first row has a comment.
			if(test_table[0].comments !== "None") {

				//Set the testbench end date to "testbench start date +7 days".
				frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.st_dte, 7));
			}
		}
		for (var i = 0; i < test_table.length; i++){
			//If all the tests are passed, increase by one "tot_number".
			if(test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" && (test_table[i].mdm_tst === "Passed" || test_table[i].mdm_tst === "N/A")) {
				tot_number++;
				//console.log("Tot_number + Row ID: "+tot_number+" "+test_table[i].idx);
			}
			//If one of the tests failed, set "tot_number" to 0, set "id_fail" to "row id + 1" and increase by 1 "fail".
			if(test_table[i].cam_tst === "Failed" || test_table[i].sys_tst === "Failed" || test_table[i].mdm_tst === "Failed") {
				tot_number = 0;
				//console.log("Tot_number + Row ID: "+tot_number+" "+test_table[i].idx);
				id_fail = test_table[i].idx + 1;
				fail++;

				//If one of the tests failed, set the testbench end date to "next row date + 6".
				if(id_fail < test_table.length) {
					if(frappe.datetime.add_days(test_table[id_fail].date,6) > cur_frm.doc.end_dte) {
						frm.set_value("end_dte",frappe.datetime.add_days(test_table[id_fail].date,6));
					}
				}
			}

			/*
			If the penultimate row date is Friday and this date +3 days (week-end) doesn't correspond to the Testbench end date
			if True, set the Testbench end date to the row date +3 days.
			*/
			if(test_table[i].idx === test_table.length-1 && moment.weekdays(test_table[i].date) === "Friday" && test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" && test_table[i].mdm_tst === "Passed") {
				if(frappe.datetime.add_days(test_table[i].date, 3) !== cur_frm.doc.end_dte) {
					frm.set_value("end_dte",frappe.datetime.add_days(test_table[i].date, 3));
				}
			}

			/*
			If the penultimate row date is not Friday and this date +1 day doesn't correspond to the Testbench end date
			if True, set the Testbench end date to the row date +1 day.
			*/
			if(test_table[i].idx === test_table.length-1 && moment.weekdays(test_table[i].date) !== "Friday" && test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" && test_table[i].mdm_tst === "Passed") {
				if(frappe.datetime.add_days(test_table[i].date, 1) !== cur_frm.doc.end_dte) {
					frm.set_value("end_dte",frappe.datetime.add_days(test_table[i].date, 1));
				}
			}

			//If the test passed with warnings the adjust the test length.
			if(test_table[i].idx >= k && test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" && test_table[i].mdm_tst === "Passed" && test_table[i].comments !== "None") {
				counter++;
			}
		}
		//If one record has a comment, set the testbench length to 6 days.
		if(counter >= 1) {
			tst_lg = 6;
		}
		//If no record has a comment, set the testbench length to 5 days.
		else {
			tst_lg = 5;
		}
		//If the tests failed three times, set the testbench status to "Failed".
		if(fail >= 3) {
			frm.set_value("test_status","Failed");
		}

		//Set % Completed to 0 if the tot_number field value is 0.
		if(tot_number === 0) {
			frm.set_value("per_comp",0);
		}
		if(tst_lg === 5) {

			//Set % Completed to 20 if the tot_number field value is 1.
			if(tot_number === 1) {
				frm.set_value("per_comp",20);
			}

			//Set % Completed to 40 if the tot_number field value is 2.
			if(tot_number === 2) {
				frm.set_value("per_comp",40);
			}

			//Set % Completed to 60 if the tot_number field value is 3.
			if(tot_number === 3) {
				frm.set_value("per_comp",60);
			}

			//Set % Completed to 80 if the tot_number field value is 4.
			if(tot_number === 4) {
				frm.set_value("per_comp",80);
			}

			//Set % Completed to 100 if the tot_number field value is 5.
			if(tot_number >= 5) {
				frm.set_value("per_comp",100);
			}
		}
		if(tst_lg === 6) {
			//Set % Completed to 20 if the tot_number field value is 1.
			if(tot_number === 1) {
				frm.set_value("per_comp",20);
			}

			//Set % Completed to 40 if the tot_number field value is 2.
			if(tot_number === 2) {
				frm.set_value("per_comp",40);
			}

			//Set % Completed to 60 if the tot_number field value is 3.
			if(tot_number === 3) {
				frm.set_value("per_comp",60);
			}

			//Set % Completed to 80 if the tot_number field value is 4.
			if(tot_number === 4) {
				frm.set_value("per_comp",80);
			}

			//Set % Completed to 90 if the tot_number field value is 5.
			if(tot_number === 5) {
				frm.set_value("per_comp",90);
			}

			//Set % Completed to 100 if the tot_number field value is 6.
			if(tot_number >= 6) {
				frm.set_value("per_comp",100);
			}
		}
		//If "tot_number" is equal to the testbench length, set the testbench status to "Passed".
		if(tot_number >= tst_lg) {
			frm.set_value("test_status","Passed");
		}
		//console.log(cur_frm.doc.tot_number);
	},
	//If the testbench status changes, save the document.
	test_status: function(frm) {
		frm.save();
		if(cur_frm.doc.test_status === "Passed") {
			frappe.call({
				method: "frappe.client.set_value",
				args: {
					doctype: "Serial No",
					name: cur_frm.doc.camera_serial,
					fieldname: {
						status: "Ready"
					}
				}
			});
		}
	}
});

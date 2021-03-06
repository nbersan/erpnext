// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
let test_table;
let tst_st;
let tst_lg;
let tst_st_day;
let day_add;
let tot_number;
let last_row;

frappe.ui.form.on('TestBench Results', {
	camera_serial: function(frm) {
		//Get the camera version corresponding to the Serial No, keeps only the 3 last characters and set the camera version field.
		frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Serial No",
				filters: {name: cur_frm.doc.camera_serial},
				fieldname:[
					"item_code",
					"cam_port"
				]
			},
			callback: function(r){
				//console.log(r.message.item_code);
				var it_code = r.message.item_code;
				var version = it_code.substring(it_code.length - 3);
				var port = r.message.cam_port;
				//console.log(version);
				cur_frm.set_value("camera_version",version);
				cur_frm.set_value("camera_port",port);
			}
		});
		frm.set_value("test_status","Not Started");
	},
	onload: function(frm,cdt,cdn) {
		if(cur_frm.doc.test_status !== "Passed" && cur_frm.doc.test_status !== "On Hold") {
			//Filter the proposed values in the camera_serial field.
			frm.set_query("camera_serial", function() {
				return {
					filters:[
						["Serial No","product_type","in","V1 Camera"],
						["Serial No","status","in","To Be Tested"]
					]
				};
			});
			var d = locals[cdt][cdn];
			test_table = cur_frm.doc.testbench_results_detail;
			tst_lg = 0;
			var id_fail = 0;
			var fail = 0;
			var k = (test_table.length -5);
			var counter = 0;
			tot_number = 0;
			tst_st_day = moment(cur_frm.doc.st_dte).format("dddd");
			console.log(tst_st_day + " cest le bon");
			frm.set_value("tot_number",0);

			//If no records in the testbench table, set the testbench status as "Not Started".
			if(cur_frm.doc.testbench_results_detail.length === 0) {
				if(cur_frm.doc.cam_con === "Offline") {
					frm.set_value("test_status", "Camera Offline");
				}
				else {
					frm.set_value("test_status","Not Started");
				}
			}
			if(cur_frm.doc.testbench_results_detail.length !== 0) {
				tst_st = cur_frm.doc.testbench_results_detail[0].date;
				frm.set_value("st_dte", tst_st);
			}
			if(test_table.length !== 0 && test_table[0].date !== undefined) {
				tst_st = cur_frm.doc.testbench_results_detail[0].date;
				frm.set_value("st_dte",tst_st);

				//When the first row is recorded, set the testbench status to "In Progress".
				frm.set_value("test_status","In Progress");

				//If the first row doesn't have comments.
				if(test_table[0].comments === "None" && cur_frm.doc.blck_end_dte !== 1) {

					//If the testbench start date is a Monday, set the testbench end date to "testbench start date +4 days".
					if(tst_st_day === "Monday") {
						frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.st_dte, 4));
						console.log("Was monday");
					}

					//If the testbench start date is not a Monday, set the testbench end date to "testbench start date +6 days".
					else {
						frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.st_dte, 6));
						console.log("Was Monday, Has Comments");
					}
				}
				//If the first row has a comment.
				if(test_table[0].comments !== "None" && cur_frm.doc.blck_end_dte !== 1) {

					//Set the testbench end date to "testbench start date +7 days".
					frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.st_dte, 7));
				}
			}
			for (var i = 0; i < test_table.length; i++){
				var previous
				//If all the tests are passed, increase by one "tot_number".
				if(test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" /*&& (test_table[i].mdm_tst === "Passed" || test_table[i].mdm_tst === "N/A")*/) {
					if(test_table[i].idx !== 1){
						test_table[i].number_passed = test_table[i-1].number_passed +1;
						console.log("number_passed + Row ID: "+test_table[i].number_passed+" "+test_table[i].idx);
						frm.set_value("tot_number", test_table[i].number_passed);
					}
					else {
						test_table[i].number_passed = 1;
						console.log("number_passed + Row ID: "+test_table[i].number_passed+" "+test_table[i].idx);
						frm.set_value("tot_number", test_table[i].number_passed);
					}
				}
				//If one of the tests failed, set "tot_number" to 0, set "id_fail" to "row id + 1" and increase by 1 "fail".
				if(test_table[i].cam_tst === "Failed" || test_table[i].sys_tst === "Failed" || test_table[i].mdm_tst === "Failed") {
					test_table[i].number_passed = 0;
					console.log("number_passed + Row ID: "+test_table[i].number_passed+" "+test_table[i].idx);
					id_fail = test_table[i].idx + 1;
					fail++;
					frm.set_value("tot_number", test_table[i].number_passed);

					//If one of the tests failed, set the testbench end date to "next row date + 6".
					if(id_fail < test_table.length && cur_frm.doc.blck_end_dte !== 1) {
						if(frappe.datetime.add_days(test_table[id_fail].date,6) > cur_frm.doc.end_dte) {
							frm.set_value("end_dte",frappe.datetime.add_days(test_table[id_fail].date,6));
						}
					}
				}

				/*
				If the penultimate row date is Friday and this date +3 days (week-end) doesn't correspond to the Testbench end date
				if True, set the Testbench end date to the row date +3 days.
				*/
				if(test_table[i].idx === test_table.length-1 && cur_frm.doc.tot_number >= 4 && moment(test_table[i].date).format("dddd") === "Friday" && test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" && test_table[i].mdm_tst === "Passed" && cur_frm.doc.blck_end_dte !== 1) {
					if(frappe.datetime.add_days(test_table[i].date, 3) !== cur_frm.doc.end_dte) {
						frm.set_value("end_dte",frappe.datetime.add_days(test_table[i].date, 3));
					}
				}

				/*
				If the penultimate row date is not Friday and this date +1 day doesn't correspond to the Testbench end date
				if True, set the Testbench end date to the row date +1 day.
				*/
				if(test_table[i].idx === test_table.length-1 && cur_frm.doc.tot_number >= 4 && moment(test_table[i].date).format("dddd") !== "Friday" && test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" && test_table[i].mdm_tst === "Passed" && cur_frm.doc.blck_end_dte !== 1) {
					if(frappe.datetime.add_days(test_table[i].date, 1) !== cur_frm.doc.end_dte) {
						frm.set_value("end_dte",frappe.datetime.add_days(test_table[i].date, 1));
					}
				}

				//If the test passed with warnings then adjust the test length.
				if(test_table[i].idx >= k && test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" && /*(test_table[i].mdm_tst === "Passed" || test_table[i].mdm_tst === "N/A") &&*/ test_table[i].comments !== "None") {
					counter++;
					console.log("Comments");
					frm.set_value("test_comments",1);
					console.log(counter);
				}
				if(test_table[i].cam_tst === "Passed" && test_table[i].sys_tst === "Passed" && test_table[i].comments !== "None") {
					counter++;
					console.log("Comments");
					frm.set_value("test_comments",1);
					console.log(counter);
				}
			}
			//If one record has a comment, set the testbench length to 6 days.
			if(counter >= 1) {
				tst_lg = 6;
			}
			//If the Comments checkbox is checked, set the testbench length to 6 days.
			if(cur_frm.doc.test_comments === 1) {
				tst_lg = 6;
			}
			//If no record has a comment, set the testbench length to 5 days.
			else {
				tst_lg = 5;
			}
			console.log(tst_lg);
			var last_row = test_table.length
			console.log(last_row);
			//If the tests failed three times, set the testbench status to "Failed".
			if(fail >= 3 && cur_frm.doc.tot_number === 0) {
				frm.set_value("test_status","Failed");
			}
			//If the test failed three times and then passed, set the testbench status to "In Progress".
			if(fail >= 3 && cur_frm.doc.tot_number !== 0) {
				frm.set_value("test_status","In Progress");
			}
			//Set % Completed to 0 if the tot_number field value is 0.
			if(cur_frm.doc.tot_number === 0) {
				frm.set_value("per_comp",0);
			}
			if(tst_lg === 5) {

				//Set % Completed to 20 if the tot_number field value is 1.
				if(cur_frm.doc.tot_number === 1) {
					frm.set_value("per_comp",20);
				}

				//Set % Completed to 40 if the tot_number field value is 2.
				if(cur_frm.doc.tot_number === 2) {
					frm.set_value("per_comp",40);
				}

				//Set % Completed to 60 if the tot_number field value is 3.
				if(cur_frm.doc.tot_number === 3) {
					frm.set_value("per_comp",60);
				}

				//Set % Completed to 80 if the tot_number field value is 4.
				if(cur_frm.doc.tot_number === 4) {
					frm.set_value("per_comp",80);
				}

				//Set % Completed to 100 if the tot_number field value is 5.
				if(cur_frm.doc.tot_number >= 5) {
					frm.set_value("per_comp",100);
				}
			}
			if(tst_lg === 6) {
				//Set % Completed to 20 if the tot_number field value is 1.
				if(cur_frm.doc.tot_number === 1) {
					frm.set_value("per_comp",20);
				}

				//Set % Completed to 40 if the tot_number field value is 2.
				if(cur_frm.doc.tot_number === 2) {
					frm.set_value("per_comp",40);
				}

				//Set % Completed to 60 if the tot_number field value is 3.
				if(cur_frm.doc.tot_number === 3) {
					frm.set_value("per_comp",60);
				}

				//Set % Completed to 80 if the tot_number field value is 4.
				if(cur_frm.doc.tot_number === 4) {
					frm.set_value("per_comp",80);
				}

				//Set % Completed to 90 if the tot_number field value is 5.
				if(cur_frm.doc.tot_number === 5) {
					frm.set_value("per_comp",90);
				}

				//Set % Completed to 100 if the tot_number field value is 6.
				if(cur_frm.doc.tot_number >= 6) {
					frm.set_value("per_comp",100);
				}
			}
			//If "tot_number" is equal to the testbench length, set the testbench status to "Passed".
			if(cur_frm.doc.tot_number >= tst_lg) {
				frm.set_value("test_status","Passed");
			}
			console.log(cur_frm.doc.per_comp);
		}
	},
	//If the testbench status changes, save the document.
	test_status: function(frm) {
		frm.save();
		if(cur_frm.doc.test_status === "In Progress") {
			frappe.call({
				method: "frappe.client.set_value",
				args: {
					doctype: "Serial No",
					name: cur_frm.doc.camera_serial,
					fieldname: {
						status: "Under Testing",
						testbench: cur_frm.doc.name
					}
				}
			});
		}
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
	},
	refresh: function(frm) {
		let day_event;
		frappe.call({
			method: "frappe.client.get_count",
			args: {
				doctype: "Event",
				filters: {'starts_on': cur_frm.doc.end_dte},
				fieldname: ["name","subject"]
			},
			callback: function(r){
				day_event = r.message;
				console.log(day_event);
				if (day_event === 1 && moment(cur_frm.doc.end_dte).format("dddd") === "Friday" && cur_frm.doc.blck_end_dte !== 1) {
					console.log("It's Friday");
					frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.end_dte,3));
				}
				if (day_event === 1 && moment(cur_frm.doc.end_dte).format("dddd") !== "Friday" && cur_frm.doc.blck_end_dte !== 1) {
					console.log("It's not Friday");
					frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.end_dte,1));
				}
			}
		});
		if (moment(cur_frm.doc.end_dte).format("dddd") === "Saturday" && cur_frm.doc.blck_end_dte !== 1) {
			frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.end_dte,2));
		}
		if (moment(cur_frm.doc.end_dte).format("dddd") === "Sunday" && cur_frm.doc.blck_end_dte !== 1) {
			frm.set_value("end_dte",frappe.datetime.add_days(cur_frm.doc.end_dte,1));
		}
	},
	per_comp: function(frm) {
		frm.save();
	}
});

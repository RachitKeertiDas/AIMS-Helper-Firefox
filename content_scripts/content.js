
main();

function main(){
	/*if(window.hasRun == true)
		return;
	window.hasRun = true;
	*/
	let courses_array = [];
	function getGradesData(){
		let grade_container_list = document.querySelectorAll(".hierarchyLi.dataLi.tab_body_bg");
		console.log(grade_container_list);
		console.log(window.location.href);
		/**
		 * Get Student Data from the top of the document
		 * Wrap it into an object,
		 * store it into the extension storage
		 */
		let student_data_div = document.querySelectorAll(".studentInfoDiv.inlineBlock")[0]
		let student_name = student_data_div.childNodes[1].innerHTML;
		let roll_no = student_data_div.childNodes[5].childNodes[3].innerHTML;
		let branch = student_data_div.childNodes[9].childNodes[1].childNodes[3].innerHTML;
		let student_type = student_data_div.childNodes[9].childNodes[3].childNodes[3].innerHTML;
		console.log("Retrieved Student Data")
		let student_data = {
			name : student_name,
			roll_no : roll_no,
			branch : branch,
			type : student_type 
		}
		console.log(student_data)
		grade_container_list = document.querySelectorAll(".hierarchyLi.dataLi.tab_body_bg");
		console.log(grade_container_list);

		for(let i=0;i<grade_container_list.length;i++){
			let each_course = grade_container_list[i];
			console.log("Hallo");
			if(each_course.childNodes.length < 10)
				continue;
			let course_code = each_course.childNodes[0].innerText;
			let course_name = each_course.childNodes[1].innerText;
			let course_credits = each_course.childNodes[2].innerText;
			let course_grade = each_course.childNodes[7].innerText;
			let course_type =  each_course.childNodes[4].innerText;
			let new_course = {
				code : course_code,
				name : course_name,
				type : course_type,
				grade: course_grade,
				credits: course_credits,
			}
			//console.log("Course added");
			courses_array.push(new_course);
		}
		/**Remove any keys earlier and set new keys in extension storage */
		browser.storage.local.remove('courses_data',function(){
			
			browser.storage.local.set({'courses_data': courses_array,'student_data': student_data},function() {
			console.log("Course Data saved locally")
			courses_array = [];
			/**Content script has finished execution, call browser script for further action */
			browser.runtime.sendMessage({"command":"calculateGPA"})
		});
		});
		console.log("Adding courses successful")
		console.log(courses_array.length)
	}

	browser.runtime.onMessage.addListener((message)=>{
		if(message.command === "fetch-gpa"){
			getGradesData();
		} else if (message.command == "fetch-timetable"){
			console.log("Not yet implemented")
			//activateTimetable();
		}
	})

}

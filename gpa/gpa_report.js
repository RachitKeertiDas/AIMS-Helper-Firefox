let data = {};
data.gpa = 10;
data.roll_no = "CS19BTECH11034";
data.branch = "Computer Science and Engineering"


let exclude_list = [
  'Minor core',
  'Honors core',
  'Honours project',
  'Honours coursework',
  'FCC',
  'Additional',
  'Audit'
];

let grade_values = {
  "A+": 10,
  "A": 10,
  "A-": 9,
  "B": 8,
  "B-": 7,
  "C": 6,
  "C-": 5,
  "D": 4,
  "FR": 0,
  "FS": 0
};


browser.storage.local.get(['student_data','courses_data'],function(result){
    //inject student data to PDF
    data.name = result.student_data.name;
    data.gpa = 10;
    data.roll_no = result.student_data.roll_no;
    data.branch = result.student_data.branch;
    data.student_type = result.student_data.type;

    document.getElementsByClassName("value name")[0].innerText = data.name;
    document.getElementsByClassName("value cgpa")[0].innerText = data.gpa;
    document.getElementsByClassName("value rollno")[0].innerText = data.roll_no;
    document.getElementsByClassName("value branch")[0].innerText = data.branch;
    document.getElementsByClassName("value student-type")[0].innerText = data.student_type;

//now work on calculating CGPA and adding courses to last table
  let courses_array = [];
  console.log(result.courses_data.length)
  let total_credits = 0;
  let total_grade_points = 0;
  let course_data =JSON.parse(JSON.stringify(result.courses_data));
  course_data.sort(function(a, b){
      if (a.code < b.code)
          return -1;
      if (a.code > b.code)
          return 1;
      else return 0;
  });
  let max_length = course_data.length;
  for(let i=0;i<max_length;i++){
      let each_course = course_data[i];
      if(exclude_list.includes(each_course.type.trim())){
          continue;
      }else {
          if(each_course.grade.trim() === "S" || each_course.grade.trim() === "")
              continue;

          total_credits+=parseInt(each_course.credits);

          total_grade_points+=(grade_values[each_course.grade.trim()])*parseInt(each_course.credits);
          let new_row = document.createElement("tr");
          new_row.innerHTML = `<td>${each_course.code}</td>
          <td>${each_course.name}</td>
          <td class="credits">${each_course.credits}</td>
          <td class="credits">${each_course.grade}</td>`;
          courses_array.push(new_row);
      }
  }
  let cgpa = total_grade_points/total_credits;
  console.log(cgpa);

  document.getElementsByClassName("value cgpa")[0].innerText = Number(cgpa.toFixed(2));
  //do the credit map:= second table

  let courses_type_map = new Map();
  for(let i=0;i<max_length;i++){
      let each_course = course_data[i];
      if(courses_type_map.has(each_course.type.trim())){
          let current_number = courses_type_map.get(each_course.type.trim());
          current_number+=1;
          courses_type_map.set(each_course.type.trim(),current_number);
      }
      else {
          courses_type_map.set(each_course.type.trim(),1);
      }
  }
  let summary_table = document.getElementsByClassName("summary")[0];
  for(let [type, credits] of courses_type_map.entries()) {
      let row = document.createElement("tr");
      console.log(type, credits);
      total_credits += credits;
      row.innerHTML = `<td>${type}</td><td class="credits">${credits}</td>`;
      summary_table.appendChild(row);
  }

  let courses_table = document.getElementsByClassName("courses")[0];

  for (let course of courses_array) {
      courses_table.appendChild(course);
  }
})

document.addEventListener('DOMContentLoaded', function() {
    document.getElementsByClassName("download-pdf")[0].addEventListener('click', function() {
        var element = document.getElementsByClassName('report')[0];
        html2pdf(element);
    });
});

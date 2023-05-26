const data = {};
/* global html2pdf */

const excludeList = [
  'honors core',
  'honours project',
  'honours coursework',
  'fcc',
  'audit',
];
// Additional has to be excluded
// This is to ensure ticked additional courses
// get displayed in updated reports
const minorList = [
  'minor core',
  'minor elective'
];

const gradeValues = {
  'A+': 10,
  A: 10,
  'A-': 9,
  B: 8,
  'B-': 7,
  C: 6,
  'C-': 5,
  D: 4,
  FR: 0,
  FS: 0,
};

function createCourseTableRow(eachCourse) {
  const newRow = document.createElement('tr');
  newRow.innerHTML = `<td>${eachCourse.code}</td>
  <td>${eachCourse.name}</td>
  <td class="credits">${eachCourse.credits}</td>
  <td class="credits">${eachCourse.grade}</td>`;
  return newRow;
}

browser.storage.local.get(['studentData', 'coursesData'], (result) => {
  // inject student data to HTML Page
  data.name = result.studentData.name;
  data.gpa = 10;
  data.rollNo = result.studentData.rollNo;
  data.branch = result.studentData.branch;
  data.studentType = result.studentData.type;

  document.getElementsByClassName('value name')[0].innerText = data.name;
  document.getElementsByClassName('value cgpa')[0].innerText = data.gpa;
  document.getElementsByClassName('value rollno')[0].innerText = data.rollNo;
  document.getElementsByClassName('value branch')[0].innerText = data.branch;
  document.getElementsByClassName('value student-type')[0].innerText = data.studentType;

  // now work on calculating CGPA and adding courses to last table
  const coursesArray = [];
  const additionalArray = [];
  const upcomingArray = [];
  const minorArray = [];
  let totalCredits = 0;
  let totalGradePoints = 0;
  const courseData = JSON.parse(JSON.stringify(result.coursesData));
  courseData.sort((a, b) => {
    if (a.code < b.code) return -1;
    if (a.code > b.code) return 1;
    return 0;
  });

  const maxLength = courseData.length;
  for (let i = 0; i < maxLength; i += 1) {
    const eachCourse = courseData[i];
    if (eachCourse.grade.trim() === '' || eachCourse.status === 'upcoming') {
      const newRow = createCourseTableRow(eachCourse);
      upcomingArray.push(newRow);

    } else if (eachCourse.status === 'unselected') {
      const newRow = createCourseTableRow(eachCourse);
      additionalArray.push(newRow);
      
    } else if (minorList.includes(eachCourse.type.trim().toLowerCase())) {
      const newRow = createCourseTableRow(eachCourse);
      minorArray.push(newRow);

    }
      else if (!excludeList.includes(eachCourse.type.trim().toLowerCase())) {
      if (eachCourse.grade.trim() !== 'S') {
        totalCredits += parseInt(eachCourse.credits, 10);
        totalGradePoints += gradeValues[eachCourse.grade.trim()] * parseInt(eachCourse.credits, 10);
      }
      const newRow = createCourseTableRow(eachCourse);
      coursesArray.push(newRow);
    }
  }
  const cgpa = totalGradePoints / totalCredits;
  //console.log(cgpa);

  document.getElementsByClassName('value cgpa')[0].innerText = Number(cgpa.toFixed(2));
  // do the credit map:= second table

  const coursesTypeMap = new Map();
  for (let i = 0; i < maxLength; i += 1) {
    const eachCourse = courseData[i];
    if (coursesTypeMap.has(eachCourse.type.trim())) {
      let currentNumber = coursesTypeMap.get(eachCourse.type.trim());
      currentNumber += eachCourse.credits;
      coursesTypeMap.set(eachCourse.type.trim(), currentNumber);
    } else {
      coursesTypeMap.set(eachCourse.type.trim(), eachCourse.credits);
    }
  }
  const summaryTable = document.getElementsByClassName('summary')[0];

  coursesTypeMap.forEach((credits, type) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${type}</td><td class="credits">${credits}</td>`;
    summaryTable.appendChild(row);
  });

  const totalRow = document.createElement('tr');
  totalRow.innerHTML = `<td><b>Total</b></td><td class='credits'><b>${totalCredits}</b></td>`;
  summaryTable.appendChild(totalRow);

  const coursesTable = document.getElementsByClassName('courses')[0];
  const additionalTable = document.getElementsByClassName('additional')[0];
  const upcomingTable = document.getElementsByClassName('upcoming')[0];
  const minorTable = document.getElementsByClassName('minor')[0];

  coursesArray.forEach((course) => {
    coursesTable.appendChild(course);
  });
  additionalArray.forEach((element) => {
    additionalTable.appendChild(element);
  });

  upcomingArray.forEach((course) => {
    upcomingTable.appendChild(course);
  });

  minorArray.forEach((course) => {
    minorTable.appendChild(course);
  });

  if (additionalArray.length === 0) {
    const additionalHeader = document.getElementsByClassName('additional-header')[0];
    additionalTable.remove();
    additionalHeader.remove();
  }
  if (upcomingArray.length === 0) {
    const upcomingHeader = document.getElementsByClassName('upcoming-header')[0];
    upcomingTable.remove();
    upcomingHeader.remove();
  }

  if (minorArray.length === 0) {
    const minorHeader = document.getElementsByClassName('minor-header')[0];
    minorTable.remove();
    minorHeader.remove();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementsByClassName('download-pdf')[0].addEventListener('click', () => {
    const element = document.getElementsByClassName('report')[0];
    html2pdf(element);
  });
});

const data = {};
data.gpa = 10;
data.rollNo = 'CS19BTECH11034';
data.branch = 'Computer Science and Engineering';

const excludeList = [
  'Minor core',
  'Honors core',
  'Honours project',
  'Honours coursework',
  'FCC',
  'Additional',
  'Audit',
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

browser.storage.local.get(['studentData', 'coursesData'], (result) => {
  // inject student data to PDF
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
    if (excludeList.includes(eachCourse.type.trim())) {
      continue;
    } else {
      if (eachCourse.grade.trim() === 'S' || eachCourse.grade.trim() === '') continue;

      totalCredits += parseInt(eachCourse.credits, 10);

      totalGradePoints
        += gradeValues[eachCourse.grade.trim()] * parseInt(eachCourse.credits, 10);
      const newRow = document.createElement('tr');
      newRow.innerHTML = `<td>${eachCourse.code}</td>
          <td>${eachCourse.name}</td>
          <td class="credits">${eachCourse.credits}</td>
          <td class="credits">${eachCourse.grade}</td>`;
      coursesArray.push(newRow);
    }
  }
  const cgpa = totalGradePoints / totalCredits;
  console.log(cgpa);

  document.getElementsByClassName('value cgpa')[0].innerText = Number(
    cgpa.toFixed(2),
  );
  // do the credit map:= second table

  const coursesTypeMap = new Map();
  for (let i = 0; i < maxLength; i += 1) {
    const eachCourse = courseData[i];
    if (coursesTypeMap.has(eachCourse.type.trim())) {
      let currentNumber = coursesTypeMap.get(eachCourse.type.trim());
      currentNumber += 1;
      coursesTypeMap.set(eachCourse.type.trim(), currentNumber);
    } else {
      coursesTypeMap.set(eachCourse.type.trim(), 1);
    }
  }
  const summaryTable = document.getElementsByClassName('summary')[0];
  for (const [type, credits] of coursesTypeMap.entries()) {
    const row = document.createElement('tr');
    totalCredits += credits;
    row.innerHTML = `<td>${type}</td><td class="credits">${credits}</td>`;
    summaryTable.appendChild(row);
  }

  const coursesTable = document.getElementsByClassName('courses')[0];

  for (const course of coursesArray) {
    coursesTable.appendChild(course);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementsByClassName('download-pdf')[0]
    .addEventListener('click', () => {
      const element = document.getElementsByClassName('report')[0];
      html2pdf(element);
    });
});

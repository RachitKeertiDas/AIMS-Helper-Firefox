function main() {
  /* if(window.hasRun == true)
   return;
   window.hasRun = true;
  */
  const appendCheckbox = (parent, isChecked) => {
    const checkbox = document.createElement('input');
    checkbox.className = 'cgpa_cal_check';
    checkbox.type = 'checkbox';
    if (isChecked === true) checkbox.checked = true;
    else checkbox.checked = false;
    parent.before(checkbox);
  };
  const appendSelectionCheckbox = (element) => {
    const checkbox = document.createElement('input');
    checkbox.className = 'sem_sel_check';
    checkbox.type = 'checkbox';
    checkbox.checked = true;

    checkbox.addEventListener('change',function(){
      console.log(this.checked);
      const semHeaderList = this.parentElement.parentElement.parentElement;
      const checkboxList = semHeaderList.querySelectorAll('.cgpa_cal_check');
      if(this.checked){
        /* select all courses in that semester which should be selected by default. */
        checkboxList.forEach((each) => {
          each.checked = true;
          const type = each.parentNode.children[5].innerText.trim();
          const grade = each.parentNode.children[8].innerText.trim();
          if (excludeList.indexOf(type) > -1 || grade === '' || grade === 'I') {
            /* If Course is incomplete, hasn't finished or is to be excluded */
            each.checked = false;
          }
        });
      } else {
        /* unselect all courses in that semester */
        checkboxList.forEach((each) => {
          each.checked = false;
        });
      }
    })
    element.after(checkbox);
  }
  const excludeList = [
    'Honors core',
    'Honours project',
    'Honours coursework',
    'FCC',
    'Additional',
  ];
  const addCheckboxes = () => {
    const coursesChecked = new Set();
    const checkboxList = document.querySelectorAll('.cgpa_cal_check');
    checkboxList.forEach((each) => {
      each.remove();
    });
    const elems = document.querySelectorAll('.hierarchyLi.dataLi.tab_body_bg');
    elems.forEach((eachCourse) => {
      if (eachCourse.childNodes.length < 9) return;

      const courseID = eachCourse.childNodes[0].innerText;
      if (coursesChecked.has(courseID)) {
        /* incase the course has already been done before
        / For example, Improvements, do not include it. */
        appendCheckbox(eachCourse.childNodes[0], false);
        return;
      }
      let isChecked = true; // assume all courses to be valid
      const type = eachCourse.childNodes[4].innerText.trim();
      const grade = eachCourse.childNodes[7].innerText.trim();
      /* console.log(grade); */
      if (excludeList.indexOf(type) > -1 || grade === '' || grade === 'I') {
        /* If Course is incomplete, hasn't finished or is to be excluded */
        isChecked = false;
      }
      if (isChecked) {
        coursesChecked.add(courseID);
      }
      appendCheckbox(eachCourse.childNodes[0], isChecked);
    });
    
    const semMarkers = document.querySelectorAll('.hierarchyLi.dataLi.hierarchyHdr.changeHdrCls.tab_body_bg');
    semMarkers.forEach((eachSem)=>{
      const insertionElement = eachSem.lastChild.firstChild;
      appendSelectionCheckbox(insertionElement);
    })
  };

  let coursesArray = [];
  function getGradesData() {
    /**
     * Get Student Data from the top of the document
     * Wrap it into an object,
     * store it into the extension storage
     */
    const studentDataDiv = document.querySelectorAll('.studentInfoDiv.inlineBlock')[0];
    const studentName = studentDataDiv.childNodes[1].innerHTML;
    const rollNo = studentDataDiv.childNodes[5].childNodes[3].innerHTML;
    const branch = studentDataDiv.childNodes[9].childNodes[1].childNodes[3].innerHTML;
    const studentType = studentDataDiv.childNodes[9].childNodes[3].childNodes[3].innerHTML;
    // console.log('Retrieved Student Data');
    const studentData = {
      name: studentName,
      rollNo,
      branch,
      type: studentType,
    };
    const checkboxList = document.querySelectorAll('.cgpa_cal_check');
    if (checkboxList.length === 0) addCheckboxes();
    const gradeContainerList = document.querySelectorAll('.hierarchyLi.dataLi.tab_body_bg');

    for (let i = 0; i < gradeContainerList.length; i += 1) {
      const eachCourse = gradeContainerList[i];
      if (eachCourse.childNodes.length > 9) {
        const courseCheckbox = eachCourse.childNodes[0];
        let courseStatus = 'unselected';
        if (courseCheckbox.checked === true) courseStatus = 'selected';
        /**
         * All the indices have to be shifted by 1 to compensate for the added checkbox
         */
        const courseCode = eachCourse.childNodes[1].innerText.trim();
        const courseName = eachCourse.childNodes[2].innerText;
        const courseType = eachCourse.childNodes[5].innerText;
        const courseGrade = eachCourse.childNodes[8].innerText.trim();
        const courseCredits = Number(eachCourse.childNodes[3].innerText.trim());
		    const courseSemester = eachCourse.parentNode.firstChild.firstChild.innerText.trim();
		    //console.log(courseSemester);

        if (courseGrade === '') courseStatus = 'upcoming';
        const newCourse = {
          code: courseCode,
          name: courseName,
          type: courseType,
          grade: courseGrade,
          credits: courseCredits,
          status: courseStatus,
          semester: courseSemester,
        };
        //console.log(newCourse);
        coursesArray.push(newCourse);
      }
    }
    /** Remove any keys earlier and set new keys in extension storage */
    browser.storage.local.remove('coursesData', () => {
      browser.storage.local.set({ coursesData: coursesArray, studentData }, () => {
        coursesArray = [];
        /** Content script has finished execution, call browser script for further action */
        browser.runtime.sendMessage({ command: 'calculateGPA' });
      });
    });
    // console.log('Adding courses successful');
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === 'fetch-gpa') {
      getGradesData();
    } else {
      console.log('DEBUG: fetchGPA.js: Wrong Message Recieved');
    }
  });
}
main();

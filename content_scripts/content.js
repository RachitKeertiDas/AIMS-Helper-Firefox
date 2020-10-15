function main() {
  /* if(window.hasRun == true)
   return;
   window.hasRun = true;
  */
  let coursesArray = [];
  function getGradesData() {
    let gradeContainerList = document.querySelectorAll(
      '.hierarchyLi.dataLi.tab_body_bg',
    );

    // console.log(window.location.href);
    /**
     * Get Student Data from the top of the document
     * Wrap it into an object,
     * store it into the extension storage
     */
    const studentDataDiv = document.querySelectorAll(
      '.studentInfoDiv.inlineBlock',
    )[0];
    const studentName = studentDataDiv.childNodes[1].innerHTML;
    const rollNo = studentDataDiv.childNodes[5].childNodes[3].innerHTML;
    const branch = studentDataDiv.childNodes[9].childNodes[1].childNodes[3].innerHTML;
    const studentType = studentDataDiv.childNodes[9].childNodes[3].childNodes[3].innerHTML;
    console.log('Retrieved Student Data');
    const studentData = {
      name: studentName,
      rollNo,
      branch,
      type: studentType,
    };
    gradeContainerList = document.querySelectorAll(
      '.hierarchyLi.dataLi.tab_body_bg',
    );

    for (let i = 0; i < gradeContainerList.length; i += 1) {
      const eachCourse = gradeContainerList[i];
      if (eachCourse.childNodes.length < 10) { continue; }
      const courseCode = eachCourse.childNodes[0].innerText;
      const courseName = eachCourse.childNodes[1].innerText;
      const courseCredits = eachCourse.childNodes[2].innerText;
      const courseGrade = eachCourse.childNodes[7].innerText;
      const courseType = eachCourse.childNodes[4].innerText;
      const newCourse = {
        code: courseCode,
        name: courseName,
        type: courseType,
        grade: courseGrade,
        credits: courseCredits,
      };
      coursesArray.push(newCourse);
    }
    /** Remove any keys earlier and set new keys in extension storage */
    browser.storage.local.remove('coursesData', () => {
      browser.storage.local.set(
        { coursesData: coursesArray, studentData },
        () => {
          console.log('Course Data saved locally');
          coursesArray = [];
          /** Content script has finished execution, call browser script for further action */
          browser.runtime.sendMessage({ command: 'calculateGPA' });
        },
      );
    });
    console.log('Adding courses successful');
    console.log(coursesArray.length);
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === 'fetch-gpa') {
      getGradesData();
    } else if (message.command === 'fetch-timetable') {
      console.log('Not yet implemented');
      // activateTimetable();
    }
  });
}
main();

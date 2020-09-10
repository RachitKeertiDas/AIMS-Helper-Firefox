
function listenforClicks() {
  document.addEventListener("click", (e) => {
    /**Just log an error to the console */
    function reportError(error) {
      console.error(`Could not perform desired action: $(error)`);
  }
  
  /**
   * Send a message to content scripts to start execution
   */
  function startGPAcalc(tabs) {
	  browser.tabs.sendMessage(tabs[0].id, {
	    command: "fetch-gpa",
   }).catch(reportScriptError);
  }

 if (e.target.classList.contains("calculate-gpa")) {
  /**GPA calculation button was clicked*/
  showLoading();
  browser.tabs
   .query({ active: true, currentWindow: true})
   .then(startGPAcalc)
   .catch(reportError);
  } else if (e.target.classList.contains("generate-timetable")) {
    /*Generate Timetable button was clicked*/
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
     browser.tabs.sendMessage(tabs[0].id, {
         command: "fetch-timetable",
       });
     });
   }
  });
}

const grades_page_url = browser.runtime.getURL("/gpa/gpa_report.html");

function showLoading() {
  document.querySelectorAll(".button-container")[0].style.display = "none";
  document.querySelectorAll("#loader")[0].style.display = "block";
}

function removeLoading() {
  document.querySelectorAll("#loader")[0].style.display = "none";
  document.querySelectorAll(".button-container")[0].style.display =
    "flex";
}

/**
 * Listen For Messages being transmitted by content scripts and act accordingly.
 */
function listenforMessages() {
  browser.runtime.onMessage.addListener((message)=>{
		if(message.command === "calculateGPA"){
        browser.tabs.create({url : browser.runtime.getURL("/gpa/gpa_report.html")})
        .then(()=>{window.close();})    
    } else if (message.command === "injectTimetable"){
      browser.tabs.create({url : browser.runtime.getURL("/timetable/table.html")})
    }
   });
}
/**
 * There was an error executing the script.
 * Display the popup's error message and hide the normal UI.
 */
function reportScriptError(error) {
  document.querySelectorAll("#loader")[0].style.display = "none";
  document.querySelectorAll("#error-content")[0].classList.remove("hidden");
  document.querySelectorAll(".button-container")[0].classList.add("hidden");
  console.log(`"Error in executing content script."${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({ file: "/content_scripts/content.js" })
  .then(listenforClicks)
  .catch(reportScriptError);
  
listenforMessages();


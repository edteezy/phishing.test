document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('proceed_button').addEventListener('click', function() {
    // Retrieve the original page URL from local storage
    chrome.storage.local.get('originalPageUrl', function(data) {
      var originalPageUrl = data.originalPageUrl;
      
      // Check if the originalPageUrl is not empty or null
      if (originalPageUrl) {
        // Redirect the user to the original page
        window.location.href = originalPageUrl;
      } else {
        // If the originalPageUrl is empty or null, display an alert
        alert("Could not retrieve the original page URL.");
      }
    });
  });

  document.getElementById('go_back_button').addEventListener('click', function() {
    // Go back action, for example closing the current tab
    window.close();
  });
});

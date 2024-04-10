var colors = {
    "-1": "#58bc8a",
    "0": "#ffeb3c",
    "1": "#ff8b66"
};
var featureList = document.getElementById("features");

chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
    chrome.storage.local.get(['results', 'legitimatePercents', 'isPhish'], function(items) {
        var result = items.results[tabs[0].id];
        var isPhish = items.isPhish[tabs[0].id];
        var legitimatePercent = items.legitimatePercents[tabs[0].id];

        for (var key in result) {
            var newFeature = document.createElement("li");
            newFeature.textContent = key;
            newFeature.style.backgroundColor = colors[result[key]];
            featureList.appendChild(newFeature);
        }

        $("#site_score").text(parseInt(legitimatePercent) + "%");
        if (isPhish) {
            $("#res-circle").css("background", "#ff8b66");
            $("#site_msg").text("Warning!! You're being phished.");
            $("#site_score").text(parseInt(legitimatePercent) - 20 + "%");
            
            // Redirect to the phishing landing page
            chrome.tabs.update(tabs[0].id, {url: "phishing-detected.html"});
        }
    });
});

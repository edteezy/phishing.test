var results = {};
var legitimatePercents = {};
var isPhish = {};

function fetchLive(callback) {
  fetch('https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/classifier.json', {
      method: 'GET'
    })
    .then(function(response) {
      if (!response.ok) {
        throw response
      }
      return response.json();
    })
    .then(function(data) {
      chrome.storage.local.set({
        cache: data,
        cacheTime: Date.now()
      }, function() {
        callback(data);
      });
    });
}

function fetchCLF(callback) {
  chrome.storage.local.get(['cache', 'cacheTime'], function(items) {
    if (items.cache && items.cacheTime) {
      return callback(items.cache);
    }
    fetchLive(callback);
  });
}

function classify(tabId, result) {
  var legitimateCount = 0;
  var suspiciousCount = 0;
  var phishingCount = 0;

  for (var key in result) {
    if (result[key] == "1") phishingCount++;
    else if (result[key] == "0") suspiciousCount++;
    else legitimateCount++;
  }
  legitimatePercents[tabId] = legitimateCount / (phishingCount + suspiciousCount + legitimateCount) * 100;

  if (result.length != 0) {
    var X = [];
    X[0] = [];
    for (var key in result) {
      X[0].push(parseInt(result[key]));
    }
    console.log(result);
    console.log(X);
    fetchCLF(function(clf) {
      var rf = random_forest(clf);
      y = rf.predict(X);
      console.log(y[0]);
      if (y[0][0]) {
        isPhish[tabId] = true;
        // Redirect to the phishing landing page
        chrome.tabs.update(tabId, {
          url: "https://edteezy.github.io/phishing.test/phishing-detected-local.html"
        });
      } else {
        isPhish[tabId] = false;
      }
      chrome.storage.local.set({
        'results': results,
        'legitimatePercents': legitimatePercents,
        'isPhish': isPhish
      });
    });
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  results[sender.tab.id] = request;
  classify(sender.tab.id, request);

  // Store the original page URL in local storage when phishing is detected
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    var originalPageUrl = tabs[0].url;
    chrome.storage.local.set({
      originalPageUrl: originalPageUrl
    });

    // Redirect to the hosted HTML file
    chrome.tabs.update(sender.tab.id, {
      url: "https://edteezy.github.io/phishing.test/phishing-detected-local.html"
    });
  });

  sendResponse({
    received: "result"
  });
});

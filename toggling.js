function turnFilteringOff(){
	chrome.storage.sync.set({'isEnabled': false}, function() {
		chrome.browserAction.setIcon({path:{"16": 'off.png'}});
		console.log('Filtering disabled');
	});
}

function turnFilteringOn(callback){
	if (callback === undefined){
		callback = function(confirm){};
	}
	var tabsToDeny = [];
	chrome.storage.sync.get('blockedSites', function (data) {
		chrome.tabs.query({}, function(tabs){
			tabs.forEach(function(tab){
				data.blockedSites.forEach(function (site) {
					if (tab.url.includes(site)) {
						tabsToDeny.push(tab);
					}
				});
			});
			if(tabsToDeny.length > 0){
				var communicate = "There are " + tabsToDeny.length + " sites";
				if(tabsToDeny.length == 1){
					communicate = "There is 1 site";
				}
				 communicate += " open which will be closed.\nAre you sure you want to switch the blocking on?";
				var switchOnConfirm = confirm(communicate);
				if (switchOnConfirm == true) {
					console.log("User confirmed switching on");
					chrome.storage.sync.set({'isEnabled': true}, function() {
						chrome.browserAction.setIcon({path:{"16": 'on.png'}});
						console.log('Filtering enabled.');
						tabsToDeny.forEach(function(tab){
							denyPage(tab.id);
						});
						callback(true);
					});
				} 
				else {
					console.log("User cancelled the prompt.");
					return false;
					callback(true);
				}
			}
			else{
				chrome.storage.sync.set({'isEnabled': true}, function() {
					chrome.browserAction.setIcon({path: 'on.png'}, function(){
						console.log('Filtering enabled.');
						callback(true);
					});
				});
			}
		});
	});
};

function denyPage(tabId){
	chrome.storage.sync.get('blockingMethod', function (data) {
		console.log(data.blockingMethod)
		switch (data.blockingMethod) {
			case "close_tab":
				chrome.tabs.remove(tabId);
				break;
			case "clear_tab":
				chrome.tabs.discard(tabId);
				break;
			case "nobody_cares":
				console.log("nobody cares")
				chrome.tabs.update(tabId, {url: 'https://static.displate.com/857x1200/displate/2020-04-27/f75f15e36b7f67b03f0653458f10d995_b6d5050d9438f87bf7dd6601d5b64e26.jpg'})
				break;
		}
	});
};
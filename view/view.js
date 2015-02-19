nodecg.listenFor('newFollower', function (user) {
	newFollower(user);
});

var timer = false,
	notification = document.getElementById('ncg-f_notification');

function addClass(el, className) {
	if (el.classList) {
		el.classList.add(className);
	} else {
		el.className += ' ' + className;
	}
}

function removeClass(el, className) {
	if (el.classList) {
		el.classList.remove(className);
	} else {
		el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}
}

function newFollower(user) {
	if(timer) {
		setTimeout(function () {
			newFollower(user);
		}, 1000);
		return;
	}

	addClass(notification, 'show');
	document.getElementById('ncg-f_followerName').innerHTML = user;

	timer = setTimeout(function () {
		removeClass(notification, 'show');
		setTimeout(function () {
			timer = false;
		}, 500);
	}, 5000);
}
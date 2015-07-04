var timer = false,
	audio = new Audio(),
	notification = document.getElementById('ncg-f_notification');

nodecg.listenFor('newFollower', function (user) {
	newFollower(user);
});

nodecg.Replicant('settings')
	.on('change', function (old, s) {
		// Position
		notification.className = '';
		switch (s.position) {
			case 'topLeft':
				notification.classList.add('top', 'left');
				break;
			case 'topCenter':
				notification.classList.add('top', 'centerHorizontal');
				break;
			case 'topRight':
				notification.classList.add('top', 'right');
				break;
			case 'centerLeft':
				notification.classList.add('centerVertical', 'left');
				break;
			case 'center':
				notification.classList.add('centerHorizontal', 'centerVertical');
				break;
			case 'centerRight':
				notification.classList.add('centerVertical', 'right');
				break;
			case 'bottomLeft':
				notification.classList.add('bottom', 'left');
				break;
			case 'bottomCenter':
				notification.classList.add('bottom', 'centerHorizontal');
				break;
			case 'bottomRight':
				notification.classList.add('bottom', 'right');
				break;
		}

		// Easing
		notification.classList.add(s.easing);

		// Animation
		notification.classList.add(s.animation);

		// Background Image
		if (s.backgroundImage) notification.style.backgroundImage = 'url(uploads/' + s.backgroundImage + ')';

		// Sound
		if (s.notificationSound) audio = new Audio('uploads/' + s.notificationSound);
	});

function newFollower(user) {
	if(timer) {
		setTimeout(function () {
			newFollower(user);
		}, 1000);
		return;
	}

	notification.classList.add('show');
	audio.play();
	document.getElementById('ncg-f_followerName').innerHTML = user;

	timer = setTimeout(function () {
		notification.classList.remove('show');
		setTimeout(function () {
			timer = false;
		}, 500);
	}, 5000);
}

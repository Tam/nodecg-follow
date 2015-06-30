/**
 * Vars
 */
function Settings() {
	this.username = '';
	this.backgroundImage = '';
	this.notificationSound = '';
	this.position = '';
	this.animation = {
		in: '',
		out: ''
	};
	this.easing = {
		in: '',
		out: ''
	};
	this.css = '';
}

var isInit = true,
	followerLoop;

var settings = new Settings(),
	settingsModal = {},
	settingsFields = {};

var ncg_f_followPanelList = $('#ncg-f_followList'),
	ncg_f_followers = {},
	ncg_f_followersCount = -5;

/**
 * Init
 */
function init() {
	isInit = false;

	$(document).ready(function () {
		// Update vars
		settingsModal = {
			modal: $('#ncg-f_settingsModal'),
			form: $('#ncg-f_settingsForm'),
			saveButton: $('#ncg-f_settingsModalButton')
		};
		settingsFields.username = $('#ncg-f_channelName');
		settingsFields.backgroundImage = $('#ncg-f_backgroundImageFileLocation');
		settingsFields.notificationSound = $('#ncg-f_notificationSoundFileLocation');
		settingsFields.position = $('#ncg-f_screenPosition');//.find('input[name=screenPosition]');
		settingsFields.animation = {
			in: $('#ncg-f_animIn'),
			out: $('#ncg-f_animOut')
		};
		settingsFields.easing = {
			in: $('#ncg-f_animInEasing'),
			out: $('#ncg-f_animOutEasing')
		};
		settingsFields.css = ace.edit("ncg-f_css");
		settingsFields.css.getSession().setMode("ace/mode/css");
		settingsFields.css.setOptions({
			maxLines: Infinity
		});

		ncg_f_startLoop();

		settingsModal.modal.on('hidden.bs.modal', function () {
			setTimeout(function () {
				settings.update();
			}, 250);
		});

		settingsModal.saveButton.on('click', function () {
			settings.save();
			settingsModal.modal.modal('hide');
		});

		settingsModal.form.on('submit', function (e) {
			e.preventDefault();
			settings.save();
			settingsModal.modal.modal('hide');
		})
	});
}

/**
 * Settings
 */
Settings.prototype.set = function (s) {
	for (var k in s) {
		if (s.hasOwnProperty(k) && settings.hasOwnProperty(k))
			settings[k] = s[k];
		else
			console.error('NodeCG Transition: Can\'t set setting "' + k + '"');
	}
};

Settings.prototype.update = function () {
	if (isInit) init();

	settingsFields.username.val(this.username);
	settingsFields.backgroundImage.val(this.backgroundImage);
	settingsFields.notificationSound.val(this.notificationSound);

	settingsFields.position.find(':checked').prop('checked', false);
	settingsFields.position.find('[value=' + this.position + ']').prop('checked', true).trigger("change");

	settingsFields.animation.in.val(this.animation.in);
	settingsFields.animation.out.val(this.animation.out);

	settingsFields.easing.in.val(this.easing.in);
	settingsFields.easing.out.val(this.easing.out);

	settingsFields.css.setValue(this.css);
};

Settings.prototype.save = function () {
	this.username = settingsFields.username.val();
	this.backgroundImage = settingsFields.backgroundImage.val();
	this.notificationSound = settingsFields.notificationSound.val();
	this.position = settingsFields.position.find(':checked').val() || 'topLeft';
	this.animation.in = settingsFields.animation.in.val();
	this.animation.out = settingsFields.animation.out.val();
	this.easing.in = settingsFields.easing.in.val();
	this.easing.out = settingsFields.easing.out.val();
	this.css = settingsFields.css.getValue();

	nodecg.variables.settings = this;

	ncg_f_startLoop();
};

nodecg.declareSyncedVar({
	name: 'settings',
	setter: function(s) {
		settings.set(s);
		settings.update();
	}
});

$('.nodecg-follow .panel-heading').append('<button class="btn btn-info btn-xs ncg-f_panel-btn" data-toggle="modal" data-target="#ncg-f_settingsModal" title="Followers Settings"><i class="fa fa-cog"></i></button>');

/**
 * Followers
 */
function ncg_f_startLoop() {
	if (settings.username) {
		ncg_f_followPanelList.removeClass('no-user');
		ncg_f_getFollowers();
		followerLoop = setInterval(ncg_f_getFollowers, 5000);
	} else {
		ncg_f_followPanelList.addClass('no-user');
	}
}

function ncg_f_getFollowers(all, offset) {
	all = all || false;
	offset = offset || 0;

	if (offset > 1000) return;

	if (all) {
		$.getJSON('https://api.twitch.tv/kraken/channels/' + settings.username + '/follows?direction=desc&limit=5&offset=' + offset + '&callback=?', function (data) {
			if (data.follows && data.follows.length > 0) {
				data.follows.forEach(function (follower) {
					ncg_f_followers[follower.user.name] = true;
				});

				ncg_f_getFollowers(true, offset + 5);
			}
		}).fail(function () {
			setTimeout(function () {
				ncg_f_getFollowers(true, offset);
			}, 5000);
		});
	} else {
		$.getJSON('https://api.twitch.tv/kraken/channels/' + settings.username + '/follows?direction=desc&limit=5&offset=' + offset + '&callback=?', function (data) {
			if (data.follows) {
				if (data['_total'] > 0 && ncg_f_followers.length === 0) {
					data.follows.forEach(function (follower) {
						ncg_f_followers[follower.user.name] = true;
					});
				} else {
					data.follows.forEach(function (follower) {
						if (!ncg_f_followers[follower.user.name]) {
							ncg_f_followers[follower.user.name] = true;
							ncg_f_newFollower(follower.user.display_name);
						}
					})
				}
			}
		});
	}
}

function ncg_f_newFollower(user) {
	nodecg.sendMessage('newFollower', user);

	ncg_f_followersCount++;
	$('#ncg-f_totalNewFollowers').html(ncg_f_followersCount + ((ncg_f_followersCount === 69) ? ' <small>hehe</small>' : ''));

	ncg_f_followPanelList.prepend('<li><span>' + user + '</span></li>');

	if ($('#ncg-f_followList li').length > 5) {
		ncg_f_followPanelList.find('li:last-child').addClass('ncg-f_remove');
		setTimeout(function () {
			ncg_f_followPanelList.find('li:last-child').remove();
		}, 500);
	}
}

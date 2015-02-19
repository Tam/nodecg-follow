/**
 * Settings
 */
$('.nodecg-follow .panel-heading').append('<button class="btn btn-info btn-xs ncg-f_panel-btn" data-toggle="modal" data-target="#ncg-f_settingsModal" title="Followers Settings"><i class="fa fa-cog"></i></button>');

// Advanced settings CSS
var ncg_f_cssEditor = ace.edit("ncg-f_css");
ncg_f_cssEditor.getSession().setMode("ace/mode/css");
ncg_f_cssEditor.setOptions({
	maxLines: Infinity
});

/**
 * Followers
 */
var ncg_f_channel = 'giantwaffle',
	ncg_f_timer = false,
	ncg_f_followPanelList = $('#ncg-f_followList'),
	ncg_f_followers = {},
	ncg_f_followersCount = -5;

function ncg_f_getFollowers(all, offset) {
	all = all || false;
	offset = offset || 0;

	if (offset > 1000) return;

	if (all) {
		$.getJSON('https://api.twitch.tv/kraken/channels/' + ncg_f_channel + '/follows?direction=desc&limit=5&offset=' + offset + '&callback=?', function (data) {
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
		$.getJSON('https://api.twitch.tv/kraken/channels/' + ncg_f_channel + '/follows?direction=desc&limit=5&offset=' + offset + '&callback=?', function (data) {
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

$(document).ready(function () {
	ncg_f_getFollowers();
	setInterval(ncg_f_getFollowers, 5000);
});
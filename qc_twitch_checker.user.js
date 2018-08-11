// ==UserScript==
// @name         QC twitch stream checker
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  hai
// @author       @yolanda_becool
// @match        https://www.twitch.tv/*
// @grant        GM_xmlhttpRequest
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @connect      api.twitch.tv
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    let debug = true;
    let redirect = function (user_id = null) {
        // get streamer login and redirect there
        GM_xmlhttpRequest ( {
            method:     "GET",
            url:        "https://api.twitch.tv/helix/users?id=" + user_id,
            headers:    {
                "Client-ID": "wq9v6tx81c3emlbw8vlfp7mq71tk2f",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            onload:     function (response) {
                response = JSON.parse(response.responseText);
                let login = response.data[0].login;
                let goto = "https://www.twitch.tv/" + login;
                console.info("Found " + name + "'s stream, loading page...");
                window.location.replace(goto);
            }
        } );
    }
    let checkOffline = function (user_id = null){
        let game = $('[data-a-target=stream-game-link]').text() == "Quake Champions";
        let online = $('.player-streamstatus__label').text() == 'Live';
        let drops = ($('.drops-campaign-details__drops-success').text() == 'Drops enabled!') || ($('.side-nav-channel-info-drops__icon'));
        let not_hosting = !($('[data-a-target=hosting-ui-link]').length > 0);
        let nodrops = [];

        if (debug) console.info('Game is "' + game + '", online: ' + online + ', drops: ' + drops + ', not_hosting: ' + not_hosting);
        // check for "2000: Network error"
        if ($('.player-center-content').text() == '2000: Network error') {
            console.info('Fixing error 2000');
            $('.player-button.qa-pause-play-button').click();
        }
        if (game && online && drops && not_hosting) {
            // do nothing
            if (debug) console.info('Drops enabled, nothing to do now. Next check in 30 seconds.');
            return true;
        } else {
            if (debug) console.info('Looks like stream went offline. Searching for new stream.');
            // put channel to localstorage if drops not enabled\
            if (game && online == true && drops == false && not_hosting == true) {
                if (localStorage.getItem('nodrops') != null) nodrops = JSON.parse(localStorage.getItem('nodrops'));
                if (!nodrops.includes(user_id)) {
                    nodrops[nodrops.length] = user_id;
                    localStorage.setItem('nodrops', JSON.stringify(nodrops));
                }
            }
            GM_xmlhttpRequest ( {
                method:     "GET",
                url:        "https://api.twitch.tv/helix/streams?game_id=496253&first=100",
                headers:    {
                    "Client-ID": "wq9v6tx81c3emlbw8vlfp7mq71tk2f",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload:     function (response) {
                    let streams = JSON.parse(response.responseText);
                    // remove streams without drops (from localstorage)
                    streams.data.forEach(function(item, index, object) {
                        if (nodrops.includes(item.user_id) || item.user_id == user_id) {
                            object.splice(index, 1);
                            index += -1;
                            if (debug) console.log("Removed " + item.user_id + " from streams list");
                        };
                    });
                    // pick random stream and redirect
                    redirect(streams.data[Math.floor(Math.random() * (streams.data.length-1))].user_id);
                }
            } );
        };
    }

    $(document).ready(function(){
        if (debug) console.info('Stream checker loaded. Starting stream checking in 5 seconds.');
        let getUserId = function(id = null, login = null) {
            GM_xmlhttpRequest ( {
                method:     "GET",
                url:        "https://api.twitch.tv/helix/users?login=" + login,
                headers:    {
                    "Client-ID": "wq9v6tx81c3emlbw8vlfp7mq71tk2f",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload:     function (response) {
                    response = JSON.parse(response.responseText);
                    // if user exists
                    if (response.data.length > 0) {
                        let user_id = response.data[0].id;
                        checkOffline(user_id);
                        setInterval(function(){
                            checkOffline(user_id)
                        }, 30000);
                    } else {
                        console.log('User_id for ' + login + ' not found, stopping');
                    }
                }
            } );
        }
        setTimeout(function() {
            ////////////////// TODO: REDO THIS TO WINDOW.LOCATION.STUFF
            let stream = window.location.pathname;
            if (stream.match("^\/[^\/]+$")) {
                getUserId(null, stream.replace('/', ''));
            } else {
                console.log('No stream name found, stopping');
            }
        }, 5000);
    });
    // TODO: Add button to clear localstorage from non-drop streams. Now you can clear it by typing "localStorage.setItem('nodrops', JSON.stringify([]));" in browser console.
    // TODO: Check for logged in state and linked bethesda account
})();
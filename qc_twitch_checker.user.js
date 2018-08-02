// ==UserScript==
// @name         QC twitch stream checker
// @namespace    http://tampermonkey.net/
// @version      0.1
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
    let debug = false;
    let checkOffline = function (){
        let game = $('[data-a-target=stream-game-link]').text();
        let online = $('.player-streamstatus__label').text() == 'Live';
        let drops = $('.drops-campaign-details__drops-success').text() == 'Drops enabled!';
        // TODO:
        // check if game is QC
        // check if hosted
        // check for "2000: Network error"
        // if ($('.player-center-content').text == '2000: Network error')
        // $('.player-button.qa-pause-play-button').click()
        if (debug) console.info('Game is "' + game + '", stream is ' + online + ' and drop status: ' + drops);
        if (game == "Quake Champions" && online && drops) {
            // do nothing
            return true;
        } else {
            if (debug) console.info('Looks like stream went offline. Searching for new stream.');
            GM_xmlhttpRequest ( {
                method:     "GET",
                url:        "https://api.twitch.tv/helix/streams?game_id=496253",
                headers:    {
                    "Client-ID": "wq9v6tx81c3emlbw8vlfp7mq71tk2f",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload:     function (response) {
                    let streams = JSON.parse(response.responseText);
                    let s = streams.data[Math.floor(Math.random() * 5)].thumbnail_url;
                    let name = s.match(/live_user_(.+)-{/)[1];
                    s = "https://www.twitch.tv/" + name;
                    console.info("Found " + name + "'s stream, loading page...");
                    window.location.replace(s);
                }
            } );
        };
    }

    $(document).ready(function(){
        if (debug) console.info('Stream checker loaded');
        setTimeout(setInterval(checkOffline, 2000), 10000);
    });
})();
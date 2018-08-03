# qc_twitch_checker
Hello bois.

I made a small tool to keep us watching QC streams and getting that favor SadKappa. It's lame, but it's working for me so you can try it too.

To use it follow these steps (I tested it in Firefox, you can try Chrome, but I have no idea how will it work):
- Install this extension https://tampermonkey.net/
- Go here https://github.com/phx7/qc_twitch_checker/raw/master/qc_twitch_checker.user.js and click "Install"
- You're ready to go. Try opening my stream (https://www.twitch.tv/yolanda_becool, should be offline) or any other offline QC stream and wait a few seconds. If everything is ok it should redirect you to live QC stream with drops.
- To disable script click extension button and click script name to switch it off (https://i.imgur.com/lXrAhTq.png)
- Feel free to post any issues you encounter or features you may think of. But I can't promise I will have much time to fix it :]

How script works now:
- It checks if stream is online, game is Quake Champions, drops are enabled and streamer not hosting anyone.
- When you get network 2000 error it automatically clicks Play to resume stream.
- When it encounters live stream without drops it saves its User_ID to localStorage to avoid this stream later.
- When it detects any condition to change stream (offline, hosting, disabled drops) it gets all online QC streams from twitch API and loads random stream excluding these that was previously found to have disabled drops (if you want to clear localStorage from saved streams without drops you can type *localStorage.setItem('nodrops', JSON.stringify([]));* in browser console, I maybe will add button for this later).

Bugs that need to be tested:
- Sometimes stream stops playing when its page not in focus. I have no idea if it will redirect and I wasn't able to test it.

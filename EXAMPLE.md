# Пример `Debug` лога обработки одного файла

```log
[19.12.2022 23:06:27] : [info] : ##############################################################################################
[19.12.2022 23:06:27] : [info] : transmission-torrentdone: "2.0.0"
[19.12.2022 23:06:27] : [info] : TORRENT ID: "1" FINISH: START PROCESS ...
[19.12.2022 23:06:27] : [info] : ==============================================================================================
[19.12.2022 23:06:27] : [info] : VER:   "Transmission version - 3.00"
[19.12.2022 23:06:27] : [info] : DIR:   "/mnt/data/download"
[19.12.2022 23:06:27] : [info] : NAME:  "Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv"
[19.12.2022 23:06:27] : [info] : DTIME: "Mon Dec 19 23:06:26 2022"
[19.12.2022 23:06:27] : [info] : HASH:  "58de8ec377668b60610a58fd541b645df4821b3f"
[19.12.2022 23:06:27] : [info] : ==============================================================================================
[19.12.2022 23:06:27] : [info] : ================================
[19.12.2022 23:06:27] : [info] : Element: "Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv" is a FILE
[19.12.2022 23:06:27] : [debug] : Element: file extension: ".mkv"
[19.12.2022 23:06:27] : [debug] : Element: full path: "/mnt/data/download/Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv"
[19.12.2022 23:06:27] : [debug] : Check Releaser for: "Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv"
[19.12.2022 23:06:27] : [info] : Releaser found: "LostFilm"
[19.12.2022 23:06:27] : [debug] : Releaser regex: "/lostfilm/i"
[19.12.2022 23:06:27] : [debug] : RELEASER: lostfilm
[19.12.2022 23:06:27] : [debug] : Check Serial or Film: "Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv"
[19.12.2022 23:06:27] : [info] : File "Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv" is a SERIAL
[19.12.2022 23:06:27] : [debug] : File check is regex: "/(s[0-9]{2}e[0-9]{2}).+(lostfilm\.tv)/i"
[19.12.2022 23:06:27] : [debug] : Extracted data (lostfilm): name="Shantaram" season="Season 01"
[19.12.2022 23:06:27] : [debug] : Extracted serial data regex: "/(.+)\.(s([0-9]{2}))/i"
[19.12.2022 23:06:27] : [debug] : Processing serial file: "Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv"
[19.12.2022 23:06:27] : [debug] : Saving path: "/mnt/data/media/serials/Shantaram/Season 01"
[19.12.2022 23:06:27] : [debug] : Saving path is exists
[19.12.2022 23:06:27] : [info] : MOVE file "Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv" to saving path "/mnt/data/media/serials/Shantaram/Season 01"
[19.12.2022 23:06:27] : [debug] : Move command: "transmission-remote 127.0.0.1:9091 --auth login:password --torrent 1 --move "/mnt/data/media/serials/Shantaram/Season 01""
[19.12.2022 23:06:27] : [debug] : Start moving file...
[19.12.2022 23:06:27] : [debug] : execResult: 127.0.0.1:9091/transmission/rpc/ responded: "success"
[19.12.2022 23:06:27] : [info] : File "Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv" moving successfully. => END
[19.12.2022 23:06:27] : [debug] : File final path: "/mnt/data/media/serials/Shantaram/Season 01/Shantaram.S01E12.1080p.rus.LostFilm.TV.mkv"
[19.12.2022 23:06:27] : [info] : ==============================================================================================
[19.12.2022 23:06:27] : [info] : TORRENT ID: "1" END PROCESS
[19.12.2022 23:06:27] : [info] : ##############################################################################################
```

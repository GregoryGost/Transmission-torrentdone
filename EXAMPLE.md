# Примеры вывода логов приложения

## Пример `Debug` лога обработки одного файла

```txt
[11.05.2024_04:38:08.204] : [INFO] : ##############################################################################################
[11.05.2024_04:38:08.206] : [INFO] : transmission-torrentdone: "3.0.0"
[11.05.2024_04:38:08.206] : [INFO] : TORRENT ID: "16" FINISH: START PROCESS ...
[11.05.2024_04:38:08.206] : [INFO] : ==============================================================================================
[11.05.2024_04:38:08.206] : [INFO] : VER:   "Transmission version - 3.00"
[11.05.2024_04:38:08.207] : [INFO] : DIR:   "/mnt/data/download"
[11.05.2024_04:38:08.209] : [INFO] : NAME:  "Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv"
[11.05.2024_04:38:08.209] : [INFO] : DTIME: "Sat May 11 04:38:08 2024"
[11.05.2024_04:38:08.209] : [INFO] : HASH:  "36dab085ebb331e8bbd9cb839d7b867102786032"
[11.05.2024_04:38:08.210] : [INFO] : ==============================================================================================
[11.05.2024_04:38:08.211] : [INFO] : ================================
[11.05.2024_04:38:08.211] : [INFO] : Element: "Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv" is a FILE
[11.05.2024_04:38:08.211] : [DEBUG] : Element: file extension: ".mkv"
[11.05.2024_04:38:08.211] : [DEBUG] : Element: full path: "/mnt/data/download/Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv"
[11.05.2024_04:38:08.211] : [DEBUG] : Check Releaser for: "Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv"
[11.05.2024_04:38:08.211] : [INFO] : Releaser found: "LostFilm"
[11.05.2024_04:38:08.211] : [DEBUG] : Releaser regex: "/lostfilm/i"
[11.05.2024_04:38:08.212] : [DEBUG] : RELEASER: lostfilm
[11.05.2024_04:38:08.212] : [DEBUG] : Check Serial or Film: "Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv"
[11.05.2024_04:38:08.212] : [INFO] : File "Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv" is a SERIAL
[11.05.2024_04:38:08.212] : [DEBUG] : File check is regex: "/(s[0-9]{2}e[0-9]{2}).+(lostfilm\.tv)/i"
[11.05.2024_04:38:08.212] : [DEBUG] : Extracted data (lostfilm): name="Dark.Matter" dirName="Dark Matter" season="Season
 01"
[11.05.2024_04:38:08.212] : [DEBUG] : Extracted serial data regex: "/(.+)\.([sS]([0-9]{2}))/i"
[11.05.2024_04:38:08.212] : [DEBUG] : Processing serial file: "Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv"
[11.05.2024_04:38:08.212] : [DEBUG] : Saving path: "/mnt/data/media/serials/Dark Matter/Season 01"
[11.05.2024_04:38:08.212] : [DEBUG] : Saving path does not exist. Create the missing folders.
[11.05.2024_04:38:08.212] : [DEBUG] : Saving path directories is created
[11.05.2024_04:38:08.213] : [INFO] : MOVE file "Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv" to saving path "/mnt/data
/media/serials/Dark Matter/Season 01"
[11.05.2024_04:38:08.213] : [DEBUG] : Move command: "transmission-remote 127.0.0.1:9091 --auth narakot:247050689Hh
--torrent 16 --move "/mnt/data/media/serials/Dark Matter/Season 01""
[11.05.2024_04:38:08.213] : [DEBUG] : Start moving file...
[11.05.2024_04:38:08.223] : [DEBUG] : execResult: 127.0.0.1:9091/transmission/rpc/ responded: "success"
[11.05.2024_04:38:08.223] : [INFO] : File "Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv" moving successfully. => END
[11.05.2024_04:38:08.223] : [DEBUG] : File final path: "/mnt/data/media/serials/Dark Matter/Season 01/Dark.Matter.S01E01.1080p.rus.LostFilm.TV.mkv"
[11.05.2024_04:38:08.224] : [INFO] : ==============================================================================================
[11.05.2024_04:38:08.224] : [INFO] : TORRENT ID: "16" END PROCESS
[11.05.2024_04:38:08.224] : [INFO] : ##############################################################################################
```

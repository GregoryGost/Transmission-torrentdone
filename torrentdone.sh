#!/bin/bash
# Torrent Done Script v1.2.3
# Author: GregoryGost <info@gregory-gost.ru>
#
# Latest version: https://github.com/GregoryGost/Transmission/blob/master/torrentdone.sh
#
# Tested on:
# Debian GNU/Linux 9.4 (stretch)
# transmission-daemon 2.92 (14714)
#
# Example naming serials: (match regex_ser)
#	File:		The.Mandalorian.S02E08.1080p.rus.LostFilm.TV.mkv
#	Directory:	The Mandalorian S02 - LostFilm.TV [1080p]
#	Directory:	Шерлок Холмс S01 Serial WEB-DL (1080p)
# Example naming films: (match regex_film -> regex_3d)
#	File:		
#	Directory:	
#
# You need Create logfile dir if not exist it:
# mkdir /var/log/transmission && chown -R debian-transmission:debian-transmission /var/log/transmission
#
# Algorithm:
# ── Check File or Directory
#   ├─ IS FILE
#   | └─ Check file is Serial or Film
#   |   ├─ IS SERIAL => serialprocess()
#   |   └─ IS FILM
#   |     └─ Check 2D or 3D
#   |       ├─ IS 2D => filmprocess()
#   |       └─ IS 3D => filmprocess()
#   ├─ IS DIRECTORY
#     └─ Check torrent is Serial or Film (we cannot influence the name of the file in the directory)
#       ├─ IS SERIAL => serialprocess()
#       └─ IS FILM
#         └─ Check 2D or 3D
#           ├─ IS 2D => filmprocess()
#           └─ IS 3D => filmprocess()
#

# INIT
LOGFILE="/var/log/transmission/torrentdone.log"
TRANSIP="127.0.0.1"
TRANSPORT="9091"
TR_LOGIN="user"
TR_PASSWORD="123456789"
TR_TORRENT_DIR="$TR_TORRENT_DIR/"
TR_TORRENT_NAME="$TR_TORRENT_NAME"
regex_ser="(LostFilm|TV|serial|Serial|novafilm|S[0-9]{2}|E[0-9]{2})"
regex_film="[.(_-\s](19|20)[0-9]{2}[.)_-\s]\.(mkv|avi|mp4)"
regex_film_dir="[.(_-\s](19|20)[0-9]{2}[-._\s](19|20)[0-9]{2}[.)_-\s]"
regex_3d="\s(3D|3d)\s"

# FUNCTIONS
function logging
{
	if [ -e $LOGFILE ]; then
		echo "`date '+%d.%m.%Y %H:%M:%S'`    $1" >> $LOGFILE
	else
		touch $LOGFILE
		echo "`date '+%d.%m.%Y %H:%M:%S'`    $1" >> $LOGFILE
	fi
}
function serialprocess
{
	# Variables:
	# $1 - Full file path = $TR_TORRENT_DIR + $TR_TORRENT_NAME
	# $2 - Is File or Directory (1 - File | 2 - Directory)
	# $3 - Base torrent directory name (only $2 - Directory) !!! 
	
	if ! [[ -f "$1" ]]; then
		# Additional check for file existence
		logging "Error: Serial file not found into folder"
		exit 0;
	fi
	
	# If File
	if [ $2 == 1 ]; then
		logging "This File is Serial..."
		# Get Serial name
		local TR_TORRENT_NAME=`/usr/bin/basename "$1"` # example result: name.mkv
		logging "TR_TORRENT_NAME: $TR_TORRENT_NAME"
		# Get and Change Serial name
		local SERIALNAME=`echo $TR_TORRENT_NAME | /bin/grep -Po '^(.*?).S[0-9].' | /bin/sed -r 's/(\.)/_/g' | /bin/sed -r 's/(_S[0-9].)//'`
		logging "SERIALNAME: $SERIALNAME"
		# Get Serial season
		local SEASON=`echo $TR_TORRENT_NAME | /bin/grep -Po 'S[0-9]{2}' | /bin/sed -r 's/S//'`
		logging "SEASON: $SEASON"
		# Set Serial path
		local SERIALPATH="/mnt/data/media/serials/$SERIALNAME/Season_$SEASON/"
		logging "SERIALPATH: $SERIALPATH"
		# Check Serial path
		if ! [ -d $SERIALPATH ]; then
			logging "Path $SERIALPATH does not exist. Create the missing folders..."
			mkdir -m 777 -p $SERIALPATH
		fi
		
		# Move Serial file
		logging "Move file $1 to folder $SERIALPATH"
		transmission-remote $TRANSIP:$TRANSPORT -n $TR_LOGIN:$TR_PASSWORD -t $TR_TORRENT_ID --move $SERIALPATH
		
		# Check result
		if [ -f "$SERIALPATH$TR_TORRENT_NAME" ]; then
			logging "Success: File $TR_TORRENT_NAME saved to folder $SERIALPATH"
		else
			logging "Error: File $TR_TORRENT_NAME NOT saved to folder $SERIALPATH"
		fi
	fi
	
	# If Dir
	if [ $2 == 2 ]; then
    logging "#========================#"
		logging "This File in directory is Serial..."
		# Get Serial directory name
		local TR_DIR_NAME="$3"
		logging "DIR NAME: $TR_DIR_NAME"
		# Get Serial file name
		local TR_TORRENT_NAME=`/usr/bin/basename "$1"` # example result: name.mkv
		logging "TR_TORRENT_NAME: $TR_TORRENT_NAME"
		# Get and change Serial name
		local SERIALNAME=`echo $TR_TORRENT_NAME | /bin/grep -Po '^(.*?).S[0-9].' | /bin/sed -r 's/([\s\.]S[0-9].)//' | /bin/sed -r 's/(\s|\.)/_/g'`
		logging "SERIALNAME: $SERIALNAME"
		# Get Serial season
		local SEASON=`echo $TR_TORRENT_NAME | /bin/grep -Po 'S[0-9]{2}' | /bin/sed -r 's/S//'`
		logging "SEASON: $SEASON"
		# Set Serial path
		local SERIALPATH="/mnt/data/media/serials/$SERIALNAME/Season_$SEASON/"
		logging "SERIALPATH: $SERIALPATH"
		# Check Serial path
		if ! [ -d $SERIALPATH ]; then
			logging "Path $SERIALPATH does not exist. Create the missing folders..."
			mkdir -m 777 -p $SERIALPATH
		fi
		# Copy Serial file
		logging "Copy file $1 to folder $SERIALPATH"
		cp "$1" $SERIALPATH
		
		# Check result
		if [ -f "$SERIALPATH$TR_TORRENT_NAME" ]; then
			logging "Success: File $TR_TORRENT_NAME saved to folder $SERIALPATH"
		else
			logging "Error: File $TR_TORRENT_NAME NOT saved to folder $SERIALPATH"
		fi
	fi

}
function filmprocess
{
	# Variables:
	# $1 - $TR_TORRENT_DIR$TR_TORRENT_NAME
	# $2 - File or Directory (1 - File | 2 - Directory)
	# $3 - 3D or 2D (1 - 2D | 2 - 3D)
	# $4 - Base torrent directory name (only $2 - Directory) !!!
	
	if ! [[ -f "$1" ]]; then
		# Additional check for file existence
		logging "Error: Film file not found into folder"
		exit 0;
	fi
	
	# If File
	if [ $2 == 1 ]; then
		
		logging "This File is Film..."
		# Get Film name
		local TR_TORRENT_NAME=`/usr/bin/basename "$1"` # example result: name.mkv
		logging "TR_TORRENT_NAME: $TR_TORRENT_NAME"
		# Get YEAR
		local YEAR=`echo $TR_TORRENT_NAME | /bin/grep -Po '[\.\s\(\_](19|20)\d{2}[\.\s\)\_]' | /bin/sed -r 's/[\.\s\(\)\_]//g'`
		logging "YEAR: $YEAR"
		# Set Film path
		if [ $3 == 2 ]; then
			# 3D = 2
			local FILMPATH="/mnt/data/media/films/3D/$YEAR/"
		fi
		if [ $3 == 1 ]; then
			# 2D = 1
			local FILMPATH="/mnt/data/media/films/2D/$YEAR/"
		fi
		logging "FILMPATH: $FILMPATH"
		# Check Film path
		if ! [ -d $FILMPATH ]; then
			logging "Path $FILMPATH does not exist. Create the missing folders."
			mkdir -m 777 -p $FILMPATH
		fi
		
		# Move Film file
		logging "Move file $1 to folder $FILMPATH"
		transmission-remote $TRANSIP:$TRANSPORT -n $TR_LOGIN:$TR_PASSWORD -t $TR_TORRENT_ID --move $FILMPATH
		
		# Check result
		if [ -f "$FILMPATH$TR_TORRENT_NAME" ]; then
			logging "Success: File $TR_TORRENT_NAME saved to folder $FILMPATH"
		else
			logging "Error: File $TR_TORRENT_NAME NOT saved to folder $FILMPATH"
		fi
	fi
	
	# If Dir
	if [ $2 == 2 ]; then
    logging "#========================#"
		logging "This File in directory is Film..."
		# Get Film directory name
		local TR_DIR_NAME="$4"
		logging "DIR NAME: $TR_DIR_NAME"
		# Get Film name
		local TR_TORRENT_NAME=`/usr/bin/basename "$1"` # example result: name.mkv
		logging "TR_TORRENT_NAME: $TR_TORRENT_NAME"
		# Get YEAR
		local YEAR=`echo $TR_TORRENT_NAME | /bin/grep -Po '[\.\s\(\_](19|20)\d{2}[\.\s\)\_]' | /bin/sed -r 's/[\.\s\(\)\_]//g'`
		logging "YEAR: $YEAR"
		# Set Film path
		if [ $3 == 2 ]; then
			# 3D = 2
			local FILMPATH="/mnt/data/media/films/3D/$YEAR/"
		fi
		if [ $3 == 1 ]; then
			# 2D = 1
			local FILMPATH="/mnt/data/media/films/2D/$YEAR/"
		fi
		logging "FILMPATH: $FILMPATH"
		# Check Film path
		if ! [ -d $FILMPATH ]; then
			logging "Path $FILMPATH does not exist. Create the missing folders."
			mkdir -m 777 -p $FILMPATH
		fi
		# Copy Film file
		logging "Copy file $1 to folder $FILMPATH"
		cp "$1" $FILMPATH
		
		# Check result
		if [ -f "$FILMPATH$TR_TORRENT_NAME" ]; then
			logging "Success: File $TR_TORRENT_NAME saved to folder $FILMPATH"
		else
			logging "Error: File $TR_TORRENT_NAME NOT saved to folder $FILMPATH"
		fi
	fi
}

# ACTION
# Start recording torrent information in a log file
logging "#========================# TORRENT ID: $TR_TORRENT_ID FINISH #========================#"
logging "VER:	Transmission - v$TR_APP_VERSION"
logging "DIR:	$TR_TORRENT_DIR"
logging "NAME:	$TR_TORRENT_NAME"
logging "DTIME:	$TR_TIME_LOCALTIME"
logging "HASH:	$TR_TORRENT_HASH"
logging "#========================#"
logging "Start Torrent process - $TR_TORRENT_NAME"
logging "Check path: $TR_TORRENT_DIR$TR_TORRENT_NAME"

# Check File or Directory
if [[ -f "$TR_TORRENT_DIR$TR_TORRENT_NAME" ]]; then
	# Is File
	logging "#========================#"
	logging "Is File..."
	
	FILE="$TR_TORRENT_DIR$TR_TORRENT_NAME"
	# Is serial?
	if [[ "${TR_TORRENT_NAME}" =~ $regex_ser ]]; then
		serialprocess "$FILE" 1
		exit 0;
	# Is Film?
	elif [[ "${TR_TORRENT_NAME}" =~ $regex_film ]]; then
		# Is Film 3D?
		if [[ "${TR_TORRENT_NAME}" =~ $regex_3d ]]; then
			# Is Film 3D
			filmprocess "$FILE" 1 2
			exit 0;
		else
			# Is film 2D
			filmprocess "$FILE" 1 1
			exit 0;
		fi
	# No Serial and no Film. Other file
	else
		logging "File(s) \"$TR_TORRENT_NAME\" not defined as TV show or movie"
		exit 0;
	fi
else
	# Is Directory
	logging "#========================#"
	logging "Is Directory..."
	
	# Is serial?
	if [[ "${TR_TORRENT_NAME}" =~ $regex_ser ]]; then
		for FILE in "$TR_TORRENT_DIR$TR_TORRENT_NAME"/*; do
			if  [[ $FILE != *.part ]]; then
				serialprocess "$FILE" 2 "$TR_TORRENT_NAME"
			fi
		done
		exit 0;
	# Is Film?
	elif [[ "${TR_TORRENT_NAME}" =~ $regex_film_dir ]]; then
		# Is Film 3D?
		if [[ "${TR_TORRENT_NAME}" =~ $regex_3d ]]; then
			# Is Film 3D
			for FILE in "$TR_TORRENT_DIR$TR_TORRENT_NAME"/*; do
				if  [[ $FILE != *.part ]]; then
					filmprocess "$FILE" 2 2 "$TR_TORRENT_NAME"
				fi
			done
			exit 0;
		else
			# Is film 2D
			for FILE in "$TR_TORRENT_DIR$TR_TORRENT_NAME"/*; do
				if  [[ $FILE != *.part ]]; then
					filmprocess "$FILE" 2 1 "$TR_TORRENT_NAME"
				fi
			done
			exit 0;
		fi
	# No Serial and no Film. Other file
	else
		logging "#========================#"
		logging "File(s) \"$TR_TORRENT_NAME\" not defined as TV show or movie"
		exit 0;
	fi
fi
exit 0;

!topic: RECOVERY
              ^BRECOVERY

 * Recover deleted files and repair
   damaged ones.
 * Restore formatted disks.
 * Protect disks against data loss.
 * Diagnose problems with computer
   hardware.

!command: Diagnostics
!dos-cmd: NDIAGS
^BNorton Diagnostics
NDIAGS [SWITCHES]

Identify problems with your computer
hardware.

^BCOMMONLY USED SWITCHES
/AUTO:^Bn^N    Auto mode, ^Bn^N seconds/screen
/BURNIN:^Bn^N  Repeat tests ^Bn^N times
/SPEC:^Bfile^N Run tests specified by ^Bfile
/REP:^Bfile^N  Output results to ^Bfile
/RESET     Reset saved hardware config

!command: Disk Doctor
!dos-cmd: NDD
^BNorton Disk Doctor
NDD [drive:][drive:]... [SWITCHES]

Automatically detect and correct
physical and logical disk errors.

^BCOMMONLY USED SWITCHES
/QUICK     Just test System Area
/COMPLETE  Test System and Data Areas
/R:^Bfile^N    Write a report to ^Bfile
/RA:^Bfile^N   Append a report to ^Bfile
/X:^Bd^N       Exclude drive from testing

!command: Disk Editor
!dos-cmd: DISKEDIT
^BDisk Editor
DISKEDIT [drive:][path][file] [SWITCHES]

View and edit the entire contents of a
diskette or hard disk, including disks
that DOS cannot recognize or access.
Repair or rescue damaged files or their
data.

^BCOMMONLY USED SWITCHES
/M   Maintenance mode 컴 bypass DOS and
     examine disk directly

!command: Disk Tools
!dos-cmd: DISKTOOL
^BDisk Tools
DISKTOOL

A set of four utilities to make disks
bootable, recover from the DOS RECOVER
command, revive defective diskettes,
and mark clusters as bad or good.

!command: File Fix
!dos-cmd: FILEFIX
^BFile Fix
FILEFIX [filename]

Diagnose and repair damaged Lotus 1-2-3,
Symphony, Excel, Quattro Pro, dBASE and
WordPerfect files. "UnZap" dBase files.

!command: Image
!dos-cmd: IMAGE
^BImage
IMAGE [drive:][drive:]... [/NOBACK]

Take a "snapshot" of a disk's vital
bookkeeping information to ensure
that accidentally formatted disks
can be recovered.

^BSWITCH
/NOBACK  Overwrite current IMAGE.DAT
         file (IMAGE.BAK backup file
         is not created)

!command: INI Tracker
!dos-cmd: INITRAKD
^BINI Tracker for DOS
INITRAKD [SWITCHES]

Take a snapshot of your DOS and/or
Windows system or INI files.  Also,
recover previous snapshots.  (Use
Windows INITRACK to configure).

^BCOMMONLY USED SWITCHES
/B         Snapshot files being tracked
/L:^Bfile^N    Output change log to ^Bfile
/R:^Bn^N       Restore ^Bn^Nth previous snapshot
/S:^Bname^N    Label the startup snapshot

!command: Rescue Disk
!dos-cmd: RESCUE
^BRescue Disk
RESCUE [/CREATE | /RESTORE]

Create or restore from a Rescue Disk,
which contains vital information about
how your computer is set up. Recovery is
easy if CMOS data, partition tables, or
boot sectors are lost.

^BIf you don't have one, create it now!

^BSWITCHES
/CREATE     Create a rescue disk
/RESTORE    Restore from a rescue disk

!command: SmartCan
!dos-cmd: SMARTCAN
^BSmartCan
SMARTCAN [SWITCHES]

Protect against accidentally deleted
files. Guarantees future recovery of
deleted data.

^BCOMMONLY USED SWITCHES
/STATUS     Display SmartCan status
/ON         Enable SmartCan
/OFF        Unload SmartCan

!command: UnErase
!dos-cmd: UNERASE
^BUnErase
UNERASE [filename]

Search for and recover erased
(deleted) files.

Automatically recover intact files
컴 use manual mode to recover data
from files that have been partially
overwritten or fragmented.

!command: UnFormat
!dos-cmd: UNFORMAT
^BUnFormat
UNFORMAT [drive:]

Recover from an accidental format of a
hard disk or a floppy disk formatted
with Safe Format 컴 the data is back.

A near-perfect recovery of a hard disk
is possible if you've used Image to take
a "snapshot" of your disk's vital system
information.

^BIf you haven't used Image on your hard
^Bdisk, do it now!

!topic: SECURITY
              ^BSECURITY

 * Secure data from unauthorized use
   or examination.
 * Guard against viral infection.

!command: Disk Monitor
!dos-cmd: DISKMON
^BDisk Monitor
DISKMON [SWITCHES]

Prevent data from being written to disk
without your approval; display letter of
drive currently being accessed; park
hard disk heads.

^BCOMMONLY USED SWITCHES
/STATUS    On-screen status summary
/PROTECT+  Turn protect features on
/LIGHT+    Turn DiskLight feature on
/PARK      Park disk drive heads
/UNINSTALL Remove DISKMON from memory

!command: Diskreet
!dos-cmd: DISKREET
^BDiskreet
DISKREET [SWITCHES]

Encrypt and password-protect files.
Create password-protected "virtual"
disk drives (NDisks) on which all
files are encrypted.

^BCOMMONLY USED SWITCHES
/ENCRYPT:^Bfile^N    Encrypt specified file
/DECRYPT:^Bfile^N    Decrypt specified file
/PASSWORD:^Bxxxxxx^N Set password to ^Bxxxxxx
/STATUS          Display NDisk status

!command: WipeInfo
!dos-cmd: WIPEINFO
^BWipeInfo
WIPEINFO [drive:] [SWITCHES]
WIPEINFO [filename] [SWITCHES]

Totally obliterate single files, entire
disks, or erased data, so that they
cannot be recovered by any means 컴 not
even the Norton Utilities.

^BCOMMONLY USED SWITCHES
/E  Wipe erased/unused space on disk
/N  Delete files DOS-style without
    wiping
/K  Wipe slack space at end of file

!topic: SPEED
                ^BSPEED

 * Soup up your computer to improve
   performance.
 * Tune up your disks to protect data.

!command: Calibrate
!dos-cmd: CALIBRAT
^BCalibrate
CALIBRAT [drive:] [SWITCHES]

Optimize the speed and reliability of
data transfer to and from your hard
disk.

^BCOMMONLY USED SWITCHES
/BATCH    Skip all prompts, exit to DOS
          when done
/NOSEEK   Do not perform seek tests
/NOFORMAT Do pattern testing only, do
          not format
/X:^Bdrives^N Don't test listed drives

!command: Norton Cache
!dos-cmd: NCACHE2 /STATUS
^BNorton Cache
NCACHE2 [SWITCHES]

Improve performance by holding recently
read data in RAM 컴 frequently-needed
data can be accessed faster. Also,
buffer data so that disk writes are
performed in the background.

See the Users Guide for complete
information.


^B컴 ^NNCACHE2 is a command-line utility.

!command: Speed Disk
!dos-cmd: SPEEDISK
^BSpeed Disk
SPEEDISK [drive:] [SWITCHES]

Improve hard disk performance by
optimizing the physical placement of
all directories and files on the disk.
Unfragment files and consolidate free
space.

^BCOMMONLY USED SWITCHES
/F  Optimize complete disk
/Q  Compress free space only
/U  Unfragment files only
/B  Reboot after optimization

!topic: TOOLS
                ^BTOOLS

Programs to make your computing faster
and easier:

 * Control your display and keyboard
 * Set timers
 * Find files
 * Navigate through directories quickly
 * Format diskettes safely
 * Get information about your computer
   system
 * And much more...

!command: Batch Enhancer
!dos-cmd: BE /?
^BBatch Enhancer
BE subcommand(s)

Automate procedures by creating batch
files that can be controlled in real
time.

Draw demonstration and sign-on screens.





^B컴^N Use in batch files.

!command: Configuration
!dos-cmd: NUCONFIG
^BNorton Utilities Configuration
NUCONFIG [/BW]

Reconfigure Norton Utilities setup
options.

Install or remove device drivers and
programs run at system startup.



^BOCCASIONALLY USED SWITCH
/BW  Use black and white for the display

!command: Control Center
!dos-cmd: NCC
^BNorton Control Center
NCC [pathname] [SWITCHES]

Control your PC's hardware settings.
Set the cursor size, change DOS
colors, set palette colors, select
video mode, change keyboard settings,
set mouse speed, and more.

^BCOMMONLY USED SWITCHES
/SET   ^B   ^NSet options saved in ^Bpathname
/CO80  ^B   ^NSet display to 25x80 color
/50    ^B   ^NSet display to 50 lines (VGA)
/START:^Bn^N  Start watch number ^Bn

!command: Directory Sort
!dos-cmd: DS
^BDirectory Sort
DS [path]
DS sortkeys [path] [/S]

Sort directories for easier viewing.

^BSORT KEYS
N   name          Append a dash to the
D   date          sort key to reverse
E   extension     the sort order.
S   size
T   time
^BSWITCH
/S  Sort subdirectories

!command: Duplicate Disk
!dos-cmd: DUPDISK
^BDuplicate Disk
DUPDISK [source-drive: [target-drive:]]

Fast diskette copying 컴 especially
when making multiple copies.

!command: File Attributes
!dos-cmd: FA
^BFile Attributes
FA [filename] [SWITCHES]

Display files by attribute; change
attributes of files and directories.

^BCOMMONLY USED SWITCHES
/A    archive         Use ^B+^N or ^B-^N after
/R    read-only       switch to set or
/HID  hidden          clear attribute.
/SYS  system


^B컴 ^NFA is a command-line utility.

!command: File Date
!dos-cmd: FD
^BFile Date
FD filename [SWITCHES]

Change file time and date information.

^BCOMMONLY USED SWITCHES
/D:^Bdate^N  Set date to mm-dd-yy
/T:^Btime^N  Set time to hh:mm:ss
/S       Include files in Subdirectories

FD without /D and /T will stamp the
current date and time on the file.

^B컴^N FD is a command-line utility.

!command: File Find
!dos-cmd: FILEFIND
^BFile Find
FILEFIND [wildcard] [text] [SWITCHES]

Locate misplaced files by searching
for their data or names through all
available drives (including network
drives) and directories. Change file
attributes.

^BCOMMONLY USED SWITCHES
/S      Include files in subdirectories
/CS     Case-sensitive search
/CLEAR  Clear all file attributes
/NOW    Set time & date to current time

!command: File Locate
!dos-cmd: FL
^BFile Locate
FL [drive:] [filename] [SWITCHES]

Locate a file. FL by itself lists all
files on the default drive.

^BCOMMONLY USED SWITCHES
/A      Search All drives
/P      Pause after each screen
/W      List files in Wide format
/T      Search the PATH only
/F[^Bn^N]   Find first ^Bn^N files (default=1)

^B컴^N FL is a command-line utility.

!command: File Size
!dos-cmd: FS
^BFile Size
FS [pathname] [target-drive:] [SWITCHES]

Display the size of files and
directories. Find out if a group of
files will fit on another drive.

^BCOMMONLY USED SWITCHES
target-drive:    Test for enough space
/P               Pause after each screen
/S               Include Subdirectories
/T               Display Totals only

^B컴^N FS is a command-line utility.

!command: Line Print
!dos-cmd: LP
^BLine Print
LP filename [output] [SWITCHES]

Print text files to printer or disk.

^BCOMMONLY USED SWITCHES
/CONFIG:^Bdescription^N Printer configuration
                 (created with NUCONFIG)
/T^Bn^N /B^Bn^N /L^Bn^N /R^Bn^N  Margins
/W^Bn^N /HI^Bn^N         Page Width/HeIght
/HEADER^Bn^N         Type of header (1,2,3)
/PR:la           Laserjet output
/PR:po           Postscript output
^B컴^N LP is a command-line utility.

!command: Norton CD
!dos-cmd: NCD
^BNorton Change Directory
NCD [directory name] [SWITCHES]

Navigate through and manage the
directory structure on your disk,
no matter how complex. Rename, move,
copy, and delete directories.

Switch to any directory, no matter how
deep, with a few keystrokes.

^BCOMMONLY USED SWITCHES
/R  Rescan disk directory
/N  Do not write or update TREEINFO.NCD

!command: Safe Format
!dos-cmd: SFORMAT
^BSafe Format
SFORMAT [drive:] [SWITCHES]

Safely and quickly format a disk. Data
is not overwritten so that recovery is
possible if you format a disk by
mistake.

^BCOMMONLY USED SWITCHES
/F:^Bsize^N   Specify size (360, 720, etc.)
/Q        Quick format
/S        Copy DOS system files
/V:^Blabel^N  Add a volume label

!command: System Info
!dos-cmd: SYSINFO
^BSystem Information
SYSINFO [SWITCHES]

Reports on all facets of your computer
system: hardware, memory, networks,
disks, TSRs, device drivers, and so on.
Includes benchmarks and performance
ratings.

^BCOMMONLY USED SWITCHES
/AUTO:^Bn^N    Auto mode, ^Bn^N seconds/screen
/SPEC:^Bfile^N Use report specs in ^Bfile
/REP:^Bfile^N  Output report to ^Bfile
/TSR       Show only active TSRs

!command: Text Search
!dos-cmd: TS
^BText Search
TS [pathname [text]] [/S][/T] [SWITCHES]
TS [drive: [text]] /D^B|^N/E [/Cn][SWITCHES]

Search for text in files, disks, or
erased space on disks.

^BCOMMONLY USED SWITCHES
/S    Include subdirectories
/T    List filenames only
/D    Search entire Disk
/E    Search Erased space
/C^Bn   ^NStart search at cluster ^Bn
^B컴 ^NTS is a command-line utility.


Norton Rescue Disk 14.1 for Windows 95, 98, and Millennium
Release Notes - 09/01/00
Copyright (c) 2000 Symantec Corporation
All rights reserved

Please read this document carefully; it contains important
information about Norton Rescue Disk.

===========
Rescue Disk is designed for the Windows 95 (OSR2), Windows 98
(OSR1 and Second Edition) and Windows Millenium (OSR1).
Rescue Disk will not install or function on Windows NT or
Windows 2000.
===========
The Rescue Disk utility requires a 3.5" floppy disk drive or
Iomega Zip drive.  Zip drives not manufactured by IOMega are
not supported.  Rescue Disk requires up to seven 1.44MB 3.5"
floppy diskettes and/or 1 Zip/Jaz disk for Zip and Basic
Rescue sets.  720K disks and 5.25" diskettes are not
supported.  2.88MB and 120MB LS-120 floppy drives may be used
to create Rescue Disks, but only using 1.44MB floppy
diskettes. Rescue Disk does not support creating Zip Rescue
sets with USB Iomega drives. Rescue Disk does not detect USB
drives.
===========
Basic Rescue Disk recovery must be run from DOS.  Rescue Disk
does not support running the Basic Rescue Disk recovery
utility from a DOS window inside Windows.
===========
The DOS Rescue Disk utility in both Zip and Basic Rescue mentions
that it has the capability to restore the CMOS information of the
machine.  This is incorrect.  The CMOS restore feature was removed.
===========
Rescue Disk sets, both Zip and Basic, will not boot properly
or repair hard disks that require a Dynamic Drive Overlay
(DDO).  Dynamic Drive Overlay refers to a particular type of
drive translation software.  Brand names such as Ontrack
Disk Manager, MaxBlast, EZ-Drive, or BootMagic basically
perform the same function as Dynamic Drive Overlays.  If the
computer uses a DDO, it must be loaded each time the system
is started.  Your DDO software includes either a bootable
floppy disk that has the necessary files, or it includes
instructions for how to create a bootable floppy disk that
you can use to start your system before running programs from
the Rescue Disk set.
===========
If Rescue Disk freezes while you are creating Rescue Disks,
format the disk in Windows and run Rescue Disk again.
===========
Creating a Rescue Disk set requires that you restart your
system using the Rescue Disk set, in order to complete the
set creation.  Restarting your system after an update is
optional, but is highly recommended.
===========
We strongly recommend shutting down any applications running
in the background before creating a Rescue Disk set.
===========
Disk Manager partitions are not compatible with Rescue Disk.
===========
Rescue Disk does not support Rescue Disk sets created by
previous versions Rescue Disk. Please make and test a new
Rescue Disk set.
===========
Rescue Disks require the following Norton Utilities and
Norton Anti-Virus components to be complete:

   For a Basic Rescue Disk set:
   - Norton Utilities 2000 DOS applications
   - Norton Anti-Virus

   For a Zip Rescue Disk set:
   - Norton Disk Doctor
   - Norton UnErase Wizard
   - Norton Anti-Virus

If you do not have these components, some features of
the Rescue Disks will not be available.
===========
Rescue Disk disks are closely tied to the operating system.
If you are not using a full release version of Windows 95
(OSR2 only), Windows 98 (OSR1 or SE) or Windows Millennium,
Rescue Disk may not have full functionality.
===========
Windows ME users can expect the following message on a Rescue
mode boot of Windows:
 "Performance warning:
  Windows has detected a new MS-DOS driver named 'ASPIATAP'.
  This driver may decrease your computer's performance.
  Would you like to see more information about this problem?"
This is not a problem. The driver for the ATAPI Zip device is
not recognized by Windows ME as of this release. This forces
us to use a compatability mode driver. Your Rescue set will
fully function using this driver.
===========
If booting the Zip Rescue Disk set causes an error stating
"VFAT & DOS Volume on drive C: layouts mismatched", you may
have boot record corruption on the C: drive. In this case,
create and boot from the emergency recovery disks as
explained in the Norton SystemWorks User Guide. NOTE: If
you're using Norton Your Eyes Only with the BootLock feature,
use the NYEO emergency recovery disks to recover the boot
record instead of Rescue Disk.
===========
When booting from a Zip Rescue set, make sure the Zip or Jaz
disk is inserted into the correct drive before booting off
the floppy.
===========
If your system loads virtual device drivers (VxDs) from
SYSTEM.INI, and the C: drive does not come up, Zip Rescue may
show "Error reading cluster on drive C:" messages while
booting up. Choose [Abort] or [Fail], and Zip Rescue should
continue booting.
===========
Rescue Disk does not support compressed disks.
Compressed floppy, Zip or Jaz disks cannot be used.
===========
You cannot save Rescue Disk items to the root of any hard
disk. The root typically contains important data that
could be overwritten.
===========
SCSI drive problems: If Rescue Disk's default set of SCSI
drive adapters does not include the one necessary for
your Zip drive, Rescue Disk displays an error and creates
a ZipAdapter*.reg file. This file can be used to modify the
registry as necessary to enable your Zip drive.  NOTE: If
you have more than one Zip drive attached to a non-supported
SCSI adapter, there may be more than one of these files on
your system. To fix this problem:

   1 Get real-mode drivers from the manufacturer of each 
     unsupported SCSI adapter.

   2 Copy your CONFIG.SYS file to CONFIG.BAK

   3 Install the new drivers.

   4 Open CONFIG.SYS and CONFIG.BAK.  Find the device line(s)
     that has been added to CONFIG.SYS by the SCSI driver.

   5 Select ZipAdapter*.reg in Windows Explorer, where * 
     is a number.

   6 Right-click and choose Edit to open the file in a 
     text editor.
     The file will look something like this:

     REGEDIT4
     [HKEY_LOCAL_MACHINE\Software\Symantec\NortonRescue\4.5\
     Setup\Zip Adapters\Your Adapter]
     "L0"=" "
     "F0"=" "

   7 Add the line(s) from CONFIG.SYS into the *.reg file 
     LO key. If there are two drivers, you must add one 
     to each line.

     For example: 
     "L0"="device=xxx.sys"
     "L1"="device=yyy.sys"

   8 Add the SCSI driver file name(s) referred to in the 
     LO key to the F0 key. There should be no path.
     For example: 
     "FO"="xxx.sys"
     "F1"="yyy.sys"

   9 Save and close the file. It should look like this:
     REGEDIT4
     [HKEY_LOCAL_MACHINE\Software\Symantec\NortonRescue\
     \Zip Adapters\Your Adapter]
     "L0"="DEVICEHIGH=SCSIDRV.SYS "
     "F0"="SCSIDRV.SYS "

   10 Copy the driver files into the \Rescue Disk folder.
      In this example, you would copy xxx.sys and yyy.sys.

   11 Double-click the file in Windows Explorer. The 
      file's information is merged into the registry 
      automatically.

   12 Run Rescue Disk and the Zip/Jaz drives should 
      appear. 
===========
If you fail to boot a Zip Rescue Disk set into full 
Windows and boot into Safe Mode instead, you can try 
deleting the BOOTSAFE.TXT file from the Windows directory 
on your Zip disk. This will allow Zip Rescue to 
try booting into full mode again. If the recovery fails 
to boot into Normal Mode again, allow it to use Safe 
Mode.
===========
Some customers have reported problems with Rescue Disk not
functioning correctly when running in conjunction with
MagnaRAM or QEMM97. If Rescue crashes on your system, try
disabling the MagnaRAM option to see if it clears up the
problem. 
===========
Zip drives attached to PCMCIA SCSI cards are not supported
by default. Limited support is available. To enable this,
start rescue32.exe with the /PCMCIA switch.  To do this,
choose Start Menu / Run, select the Browse button, browse to
the Rescue Disk folder and select RESCUE32.EXE, and add in
"/PCMCIA" at the end.

The run command would look something like:
"c:\program files\norton systemworks\rescue
disk\rescue32.exe" /PCMCIA
===========
If you make significant changes to your system, such as
adding new hardware or changing your hard drive layout, you
should reset Zip Rescue and create a new Zip Rescue set. To
do this, run Rescue32 with the "/RESET" switch.  Choose Start
Menu / Run, select the Browse button, browse to the Rescue
Disk folder and select RESCUE32.EXE, and add in "/RESET" at
the end.

The run command would look something like:
"c:\program files\norton systemworks\rescue
disk\rescue32.exe" /RESET
===========
If your Zip Rescue zip disk fills to capacity with files that
Windows requires to start, Norton System Doctor's Rescue
sensor (a Norton Utilities component) will no longer turn red
(since it is unable to copy any new files to the disk). If
this occurs, we recommend that you reset Zip Rescue, via the
procedure outlined above.
===========
If your SysDoc (a component of Norton Utilities) sensor turns
yellow and reports that Rescue Disk is not installed, we
recommend that you reset Zip Rescue, via the procedure outlined
above.
===========
If you start your computer with a Zip Rescue set and Windows
displays error messages or blue screens reporting that it can
not load certain VxDs or drivers, try to continue. In many
cases, these missing files are not essential to the operation
of Zip Rescue and Recovery Wizard will still work to recover
your system.
===========
On some system configurations, your computer's Plug and Play
BIOS may prevent your system from booting into your Zip Rescue
set.  Please refer to your system configuration manuals on how
to turn this option off.
===========
Please see trouble.txt in the Rescue Disk folder for more
information regarding problems creating Zip Rescue sets and
problems booting from Zip Rescue sets.
===========
For additional information and technical support for Rescue Disk
please visit Symantec's Technical Support Site at 
http://service.symantec.com
===========

END
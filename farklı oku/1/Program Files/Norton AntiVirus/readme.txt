**********************************************************************
Norton AntiVirus 2001 for Windows 95b/98/ME                 README.TXT
Copyright (c) 2000 Symantec Corporation                    August 2000

**********************************************************************
HOW TO USE THIS DOCUMENT
**********************************************************************
To view README.TXT on screen in Notepad or WordPad, maximize the
Notepad or WordPad window.

To print README.TXT in Notepad or WordPad, choose Print from the File
menu.  If you use another word processor, select the entire document
and format the text in 10-point Courier before printing to ensure
proper spacing.

To print README.TXT from the DOS prompt, type COPY README.TXT PRN:

**********************************************************************
NORTON ANTIVIRUS NOTES
**********************************************************************
This README.TXT file covers compatibility information, late-breaking
news, and usage tips for Norton AntiVirus for Windows 95/98/Me. The
following topics are discussed:

 * Creating Emergency Disks
 * Rescue Disks
 * Email message headers contain "X-NAV-TimeoutProtection" 
 * Using the Windows Me restore feature with Norton AntiVirus
 * If you are also running older versions of Norton products
 * Using Norton AntiVirus Email Scanning with Wingate
 * Using Norton AntiVirus with Pegasus Mail
 * Install freeze when using outlook express with SPA
 * Automatic LiveUpdate requirements
 * Using Netscape with Norton AntiVirus
 * Using Norton AntiVirus with Netscape 6.0
 * Using Norton AntiVirus with Netscape 4.x
 * Inoculation Alerts when upgrading to Microsoft Windows 98
 * LiveUpdate subscriptions
 * Print versions of Norton AntiVirus Guide
 * Uninstall Beta versions of Norton AntiVirus
 * Uninstalling LiveUpdate or LiveReg
 * Quarantining non-deletable files
 * NAVDX and Long Filenames (LFNs)
 * Inoculation Change Alerts
 * Automatic Protection and Downloading Software
 * Auto-Protect (NAVAPW32.EXE, NAVAP.VxD, and SYMEVNT.386)
 * Scheduling scans for Windows 95
 * Win 95/98/Me System Shutdown and Auto-Protect
 * Creating a test text file that looks like a virus
 * NAVDX and ZIP drives
 * "IOS Failed to Initialize" error message after installation
 * NEC platform only: CONFIG.SYS and NAVDX.EXE
 * Updating Windows 95/98/Me video drivers for Auto-Protect
 * Mijenix ZipMagic and Norton AntiVirus installation
 * Disabling email scanning while a download is in progress
 * Upgrading to Windows NT or Windows 2000
 * Secure Live Registration issues with Windows 95 OSR2
 * Error starting email protection
 * Using Norton AntiVirus with Netscape Previews
 * Email protection does not work with Eudora 5 beta

**********************************************************************

Creating Emergency Disks
------------------------
You can create Emergency Disks to start your computer and eliminate 
viruses in emergency situations. Certain boot viruses, for example, 
prevent booting properly from the hard disk or seeing the hard disk at 
all. For additional information, go to the \support\edisk folder on the 
product CD.

Rescue Disks
------------
For information on Rescue Disks, see the Readme.txt file in the Rescue folder.

Email message headers contain "X-NAV-TimeoutProtection" 
-------------------------------------------------------
Norton AntiVirus (NAV) Email Protection options include a feature 
called Timeout Protection. 
This provides protection for your email client software during email 
transfers. If your POP3 email server sends a message with an attachment 
to the NAV POP3 email scanner without Timeout Protection enabled, there 
is a possibility you could lose the message. Timeout Protection sends 
"X-NAV-TimeoutProtection?:X" as a continuous header to the email client 
until the incoming message is complete.

If you have multiple "X-NAV-TimeoutProtection?:X" entries in the header, 
it indicates how long it took to get the complete message from your POP3 
incoming mail server. To turn off Timeout Protection, follow these steps:

1. Start Norton AntiVirus 2001.
2. Click Options.
3. Double-click Email Protection, and then click Advanced.
4. Uncheck "Protect against timeouts when scanning email." This will 
   remove the "X-NAV-TimeoutProtection?:X" header information.
5. Restart your computer.

Using the Windows ME restore feature with Norton AntiVirus
----------------------------------------------------------
Restoring your system to a previous setting using 
Windows Me System Restore might revert virus definition 
engine changes and cause mismatched virus definitions. 
To solve this problem run LiveUpdate to install the latest 
virus definitions.

If you are also running older versions of Norton products
---------------------------------------------------------
If you have both this new Norton product installed and any 2000 
version Norton product installed on your computer, the 
LiveAdvisor button on the menu bar of your 2000 version Norton 
product will be removed. As LiveAdvisor is no longer being used for 
information delivery, there is no loss of functionality. As was 
explained in the final LiveAdvisor messages, Symantec has replaced 
the LiveAdvisor delivery mechanism with information on the Symantec 
web site (http://www.symantec.com) and product-specific newsletters 
(http://www.symantec.com/techsupp/bulletin/index.html). In this way 
we can offer information of specific interest to you as quickly as 
possible.

Using Norton AntiVirus Email Scanning with Wingate
-------------------------------------------------
Norton AntiVirus email scanner uses port 110 to check incoming email 
for viruses. Wingate also uses this port.
To change the port Norton AntiVirus uses, change the following Windows 
registry key:
 
HKEY_LOCAL_MACHINE\SOFTWARE\Symantec\Norton AntiVirus
\eMail Protection\Default Port 

Change the value of this entry to an unused port (port 22000 is usually 
available). If you enter a port that is already in use, Poproxy (the 
Norton AntiVirus email scanner) will not start. 
You must also unconfigure all of your email clients and re-configure 
them so they will work with the new port. 
Even after doing this some email clients, including Netscape, will not 
work because they do not support ports other than 110. 

Using Norton AntiVirus with Pegasus Mail
----------------------------------------
When using Norton AntiVirus email Scanning with Pegasus mail using 
long email address, you may reach the Pegasus 55 
character email address limit. To retrieve email again, 
disable Norton AntiVirus email protection from this account. 
You will need to update your server name and user name in 
Pegasus mail. 

Install freeze when using outlook express with SPA
--------------------------------------------------
When installing Norton AntiVirus on a Windows 95b machine
using IE4 and Outlook express with Secure Password Authentication 
enabled, the system may pause for a few minutes. This is due to an 
older version of Winsock used in this system. Updating to the latest 
version of Winsock from Microsoft's website will solve this problem.

Automatic LiveUpdate requirements
---------------------------------
Automatic LiveUpdate requires Microsoft Internet Explorer 4.0 or later 
and Microsoft Task Scheduler. 

Using Netscape with Norton AntiVirus
------------------------------------
If Norton AntiVirus is installed as a Netscape helper application, 
a downloaded file will be lost if Netscape is closed before the
download is complete.

Using Norton AntiVirus with Netscape 6.0
----------------------------------------
Norton AntiVirus Netscape Plug-in does not support Netscape 6.0 due to 
the removal of helper application functionality from Navigator.

Using Norton AntiVirus with Netscape 4.x
----------------------------------------
Netscape 4.x uses a feature called Smart Download. This feature is 
launched each time you download a zip file and it handles the download
without running it through the Norton AntiVirus plugin. Virus 
protection is provided by Norton AntiVirus Auto-Protect when you 
extract files from the compressed file.

Inoculation Alerts when upgrading to Microsoft Windows 98
---------------------------------------------------------
If you receive an Inoculation Alert during a virus scan after
upgrading from Microsoft Windows 95 to Windows 98, choose Inoculate
to respond to the alert. Do not choose Repair. In this case, the
inoculation change is expected because of the Windows upgrade. If
you choose Repair, you will corrupt your disk.

LiveUpdate subscriptions
------------------------
With the purchase and installation of Norton AntiVirus 2001, you
automatically qualify for limited free use of LiveUpdate to receive
virus definition updates. Your installed Norton AntiVirus program will
notify you when your subscription is about to expire and provide
information on how to extend your subscription to ensure continuing,
up-to-date protection.

Print versions of Norton AntiVirus Guides
-----------------------------------------
Print versions of the Norton AntiVirus User Guide can be ordered 
through Symantec Customer Service.

Uninstall Beta versions of Norton AntiVirus
-------------------------------------------
If you tested a Beta version of Norton AntiVirus, uninstall the Beta
before installing the release version.  This removes unneeded files
that would otherwise remain on your disk and prevents problems that
could arise due to changed file formats.

Uninstalling LiveUpdate or LiveReg
----------------------------------
Because LiveUpdate and LiveReg are shared by several Symantec products, 
it is not uninstalled automatically if you select Uninstall Norton 
AntiVirus. Do not uninstall these components if there is any other
Symantec software installed on your system.

To uninstall LiveUpdate or LiveReg, choose Add/Remove Programs 
from the Windows Control Panel and select LiveUpdate or LiveReg.

Quarantining non-deletable files
--------------------------------
Norton AntiVirus cannot automatically quarantine non-deletable files 
(for example, files infected by the DirII virus). To manually add 
these types of files to the Quarantine, open the Quarantine and choose 
Add Item.

NAVDX and Long Filenames (LFNs)
-------------------------------
NAVDX, the command-line scanner used for startup scans and emergency
recovery, does not properly display long filenames in a DOS box.

Inoculation Change Alerts
-------------------------
When responding to an inoculation change alert, you must determine if
the change is legitimate (choose Inoculate to let Norton AntiVirus
generate new inoculation data) or the change indicates the activity
of a virus (choose Repair to let Norton AntiVirus restore the item).

The following examples demonstrate legitimate changes. In these cases
you should choose Inoculate to let Norton AntiVirus generate new
inoculation data.

 * Installing or Upgrading Windows

   If you are running Norton AntiVirus and reinstalling or upgrading
   Windows, you may receive more than one inoculation change alert.
   Choose Inoculate, not Repair, to respond to the alert.

   Windows modifies boot records during the install operation and
   restarts your system more than once. Each time your system is
   restarted, these changes are properly detected by Norton AntiVirus.
   If you choose Repair, you are undoing some of the changes that
   Windows is making and, therefore, corrupting your boot records. You
   may not be able to start your system from its hard disk. If this
   occurs, start up from a floppy disk and reinstall Windows.

 * Partitioning Software

   If you use partitioning software (such as Partition Magic) or
   drive overlay software (such as Disk Manager and EZ drive), you
   may receive inoculation alerts for legitimate changes. When you
   set or modify partitions after Norton AntiVirus is installed,
   choose Inoculate, not Repair, to respond to these alerts.

   For example, Partition Magic may generate several legitimate
   inoculation alerts when setting or modifying partitions. If you
   choose Repair, your drive may be rendered inaccessible with little
   chance of recovery.

Automatic Protection and Downloading Software
---------------------------------------------
If you configure Norton AntiVirus to monitor for virus-like activities,
you may get unknown virus alerts when downloading program files from
some online services. These alerts do not necessarily mean a file is
infected with an unknown virus. The alert may be generated due to the
way the file is transferred.

For example, the CompuServe WinCIM program creates a file the size of
the expected download when you begin a file transfer. During the
transfer, the contents of this file are replaced with the data being
downloaded. If you are downloading an executable program,
Auto-Protect will properly notice that the file is being modified and
alert you.

Simply select Continue when the alert is generated to complete the
download. If you frequently download programs, you can add exclusions
for this behavior so that the alerts are not generated at all. For
example, you could add exclusions for WinCIM for "Write to program
files."

Auto-Protect (NAVAPW32.EXE, NAVAP.VxD, and SYMEVNT.386)
-------------------------------------------------------
Auto-Protect and Inoculation ignore disk label (volume label) changes
to prevent false virus alerts. Viruses cannot use the disk label to
infect your system. For the same reason, changes to the OEM ID in a
boot record are not reported.

By design, Auto-Protect does not report writes to a boot sector or
master boot record if the new sector is identical to the one
previously on the drive. For example, you may use a disk editor to
write back the same data to a boot sector or master boot record.

Scheduling scans in Windows 95
------------------------------
Norton AntiVirus for Windows 98/ME and Windows 95 use different
schedulers. The Windows 98/ME version uses the built-in Windows
scheduler, while the Windows 95 version uses the Norton Program
Scheduler.

In Windows 95, if your computer is turned off when a scheduled task is
suppose to run, Norton Program Scheduler will notify you the next time
your computer is started.

Win 95/98 System Shutdown and Auto-Protect
------------------------------------------
Auto-Protect is often configured to scan removable media devices for
boot sector viruses during system shutdown.  While scanning the boot
sector, Auto-Protect can display a text mode message that notes it is
currently scanning a boot record. Some video boards and video drivers
have problems switching to text mode after the shutdown screen is
displayed and cause a system lockup. Because of this, we have disabled
the AP text message from displaying by default.

You can control whether or not the text message is displayed by
merging the following Registry Entry files with your Registry:

   APMSGOFF.REG      Prevents the AP text message from displaying
   APMSGON.REG       Permits the AP text message to be displayed

To merge a Registry Entry file with your Registry, simply double
click the file from the Explorer or a My Computer window. Both files
are located where Norton AntiVirus is installed. By default, this is
the C:\Program Files\Norton AntiVirus folder.

Note that if a virus is found, Auto-Protect will attempt to display a
message irrespective of this setting.

Creating a test text file that looks like a virus
-------------------------------------------------
To create a harmless text file that will be detected as a virus,
which you can use to verify detection of viruses, logging, and
alert functioning, visit this site: 
http://www.eicar.org/anti_virus_test_file.htm

Disable Auto-Protect temporarily before you save the file.

NAVDX and ZIP drives
--------------------
Some ZIP drives require that a disk be present when they are started.
You may see an "Invalid Drive type on drive <ZIP drive>" with NAVDX,
the Norton AntiVirus component that performs startup scans and scans
in emergency situations, if no disk is in the ZIP drive. Insert a disk
in the drive and choose "Retry."

"IOS Failed to Initialize" error message after installation
-----------------------------------------------------------
When you restart Windows 95 after installing a program or making a
configuration change to your computer, you may receive one of the
following error messages:

 * Windows initializing device IOS: Windows protection error. IOS
   failed to Initialize, Please restart
 * While initializing IOS: Windows protection error. You need to
   restart your computer.

This is a Windows 95 problem that occurs on a very small number of
system configurations. After the error message is displayed, you may
not be able to start Windows 95 normally. However, you should be able
to start Windows 95 in Safe mode.

To correct the problem:

 1 Boot Windows 95 in Safe mode or to a command prompt.
 2 Do one of the following:
   * Edit your CONFIG.SYS and AUTOEXEC.BAT files and remove or
     disable any references to SMARTDRV.EXE
   * Rename SMARTDRV.EXE to another name (for example, SMARTDRV.EX?).

For more information, visit the Microsoft Knowledge Base and review
article Q157924.

NEC platform only: CONFIG.SYS and NAVDX.EXE
-------------------------------------------
During installation, Norton AntiVirus checks your system's CONFIG.SYS
file for a line that loads the EMM386 memory manager. If such a line
is in the file, it is remarked out so that EMM386 does not load. This
is done to avoid reported problems with NAVDX on machines with 32 MB
or more of RAM.

If your system has less than 32 MB, you can edit CONFIG.SYS to remove
the remark that Norton AntiVirus adds so that EMM386 loads as before.
If you do this, you must remove any switches and parameters to EMM386,
and replace them with the /DPMI switch. For example, you should change

   device=a:\windows\emm386.exe noems ram
to
   device=a:\windows\emm386.exe /DPMI

NAVDX will not run if you load EMM386 without the /DPMI switch.

Updating Windows 95/98/Me video drivers for Auto-Protect
-----------------------------------------------------
Some versions of Windows 95/98/Me video drivers cause display corruption
or an apparent system lock up when an Auto-Protect alert is generated.
To correct the problem, upgrade to the latest version of the video
driver.

Mijenix ZipMagic and Norton AntiVirus installation
--------------------------------------------------
Norton AntiVirus should be installed before ZipMagic is installed.
If ZipMagic is installed first, you must change a ZipMagic option
setting for proper operation.

To configure an already installed ZipMagic:

 * Access ZipMagic options and set up Norton AntiVirus as a program
   that recognizes ZipMagic archives as files, not as folders.

For more information, consult your ZipMagic documentation.

Disabling email scanning while a download is in progress
--------------------------------------------------------
Norton AntiVirus does not support disabling email scanning while an
email download is in progress. If you do this and if the email that
you are downloading contains an infected file attachment, portions
of this infected file attachment might be left in your TEMP directory
(usually C:\WINDOWS\TEMP or C:\TEMP). It is recommended that you 
delete this file. If you should attempt to extract the infected
contents of this file, Norton AntiVirus Auto-Protect will protect you
from any infections.

Upgrading to Windows NT or Windows 2000
---------------------------------------
Uninstall Norton AntiVirus before installing Windows NT or Windows 2000 
on your computer. Reinstall Norton AntiVius after the new operating 
system is installed.

Secure Live Registration issues with Windows 95 OSR2
----------------------------------------------------
If you are running Windows 95 OSR2 and would like to use Secure Socket 
Layer (SSL) to register, upgrade Internet Explorer to at least 
version 4.01 SP2. You can download this upgrade from http://www.microsoft.com/windows/ie/download/ie401sp2.htm. Once you 
have upgraded Internet Explorer, you can register your Norton product 
from Help > About.

Error starting email protection
-------------------------------
If you see the error "Norton AntiVirus is unable to start email 
protection. Please ensure that TCP/IP is installed and port 110 is 
available," it might be because you are running a firewall program. 
If you are using a firewall, the firewall must be configured to allow 
Poproxy.exe permission to access the Internet on port 110.

Using Norton AntiVirus with Netscape Previews
-----------------
Norton AntiVirus does not automatically configure Netscape Previews 
for email protection. You can configure it manually for email 
protection.

Email protection does not work with Eudora 5 beta
-------------------------------------------------
Norton AntiVirus email protection does not work with the beta release 
of Eudora 5. Manual configuration does not work.

**********************************************************************
                                END OF FILE
**********************************************************************

**********************************************************************
LiveUpdate (Version 1.62 Release 03)                        README.TXT
Copyright (c) 2000 Symantec Corporation               August 25th 2000

**********************************************************************
                              CONTENTS
**********************************************************************
This README.TXT file describes LiveUpdate from Symantec.  The following
topics are discussed:

 * About LiveUpdate 
 * What's New?
 * Proxy Servers
 * Version Information
 * Running LiveUpdate
 * Updating LiveUpdate
 * Installing/Uninstalling LiveUpdate
 * Using AOL (America Online)
 * Using IBM Global Network
 * "Can Not Read The List of New Updates" with ZipMagic Installed
 * Technical Information
 * Known Issues

**********************************************************************
                           ABOUT LIVEUPDATE
**********************************************************************
LiveUpdate is the Symantec technology that permits an installed 
Symantec product to connect to a Symantec server over the Internet to 
check for program and other updates such as virus definitions and URL 
lists.

When updates are available, LiveUpdate downloads them to your computer 
and installs them, keeping your Symantec software up to date.

Certain types of content may require a subscription and so LiveUpdate 
will only download subscription content if a valid subscription is 
found on your machine.

**********************************************************************
                              WHAT'S NEW?
**********************************************************************
1. Download redirection
LiveUpdate now has the ability to download updates from the closest 
LiveUpdate host server. In many cases this server will be located on 
the same ISP network that you are connecting to. We expect that 
downloading updates using LiveUpdate v1.6 should be consistently faster 
than previous versions.

2. Windows 2000 and Windows Me compatibility
LiveUpdate v1.6 has been fully tested on the new Windows 2000 platforms 
recently introduced by Microsoft. In addition, we have tested LiveUpdate 
with many of the latest available builds of Windows Me and have not 
discovered any incompatibilities.

3. New User Interface (UI)
LiveUpdate v1.6 has been redesigned with a new UI, which we think you 
will find clearer and more informative.

4. Logging and Error Reporting
LiveUpdate now keeps a log of all its recent activity. This log file is 
located in the "All Users" application data folder on your machine. We 
have also added lots of new informative warning and error messages to 
make it easier for you to figure out when something has gone wrong.

5. The 'Update Now' button in the LiveUpdate control panel aplet has 
been removed. If you wish to run LiveUpdate outside of a Symantec 
product you can now run 'LUALL.EXE' from the Start menu.

**********************************************************************
                              PROXY SERVERS
**********************************************************************
Most Internet users don't need to configure their computers to use a 
proxy server, however some ISPs and companies require you to connect to 
the Internet through a proxy server. So, we've made it easier then ever 
via a new Proxy tab in the LiveUpdate Control Panel.

Note: If you do not know what a proxy server is, it may be best to set 
options using the Proxy tab only when instructed to do so by a network 
administrator.

To configure LiveUpdate to use a proxy server, simply select the Proxy 
tab and then choose either the second or third radio buttons.

The second radio button allows you to customize your proxy server 
settings and the third button tells LiveUpdate to use the same proxy 
server settings that you have setup for use with Internet Explorer.

* Note: LiveUpdate uses HTTP by default.  

If your proxy server requires authorization for outside access, you can 
also enter a Username and Password for either FTP or HTTP (or both) 
proxy access.  Please note that this is different from the username and 
password you use to connect to your Internet Service Provider (if you 
use one).  

If you have any difficulty configuring your proxy settings, contact 
your network administrator for assistance.  Each network is different, 
so only they can help you with this step.

**********************************************************************
                         VERSION INFORMATION
**********************************************************************
To determine the exact version of LiveUpdate that you have installed on 
your machine, open Windows Explorer and locate the file luall.exe. This 
is usually located in the LiveUpdate client installation folder 
(\Program Files\Symantec\LiveUpdate). Right click on this file and 
select Properties. On the Version tab the File version information will 
be listed.

**********************************************************************
                           RUNNING LIVEUPDATE
**********************************************************************
Most Symantec products, which use LiveUpdate, offer a LiveUpdate button. 
In Norton SystemWorks, for example, you can run LiveUpdate from the 
SystemWorks Integrator. This will automatically download updates for 
all Symantec products, which use our One Button Update technology. You 
can also run LiveUpdate from the folder created under the start menu by 
your Symantec product(s).

**********************************************************************
                          UPDATING LIVEUPDATE
**********************************************************************
Sometimes even the update program needs an update.  LiveUpdate will 
automatically check to see if there are any available updates to itself 
each time it is run.  It should update itself transparently (without 
any extra input), but in certain rare cases may require that you run 
LiveUpdate one additional time to complete your session after it has 
finished its update.  If this is required, it will tell you.

**********************************************************************
                   INSTALLING/UNINSTALLING LIVEUPDATE
**********************************************************************
All Symantec products, which use LiveUpdate, install it themselves, but 
if you encounter a problem with LiveUpdate that you or Technical 
Support believe to be the result of an install problem or corrupted 
files, you can reinstall easily.

To reinstall, locate LUSETUP.EXE on your system or download the latest 
version from the Internet at:

ftp://ftp.symantec.com/public/english_us_canada/liveupdate/updates/

Once the file is on your system, double click the icon.  You will be 
asked if you wish to install LiveUpdate.  Answer yes, and it will 
automatically reinstall.  Your previous settings will be saved, and you 
will still be able to run LiveUpdate from any Symantec product without 
further configuration.

If you wish to uninstall LiveUpdate, please note that you will no 
longer be able to receive updates to your Symantec products.  Your 
configuration information will also be removed so that when you 
reinstall, you may need to re-configure custom proxy settings or 
connection information.

To uninstall LiveUpdate:
1. From the Start menu, select Settings > Control Panel.
2. Double-click Add/Remove Programs.  
3. Select LiveUpdate from the list and then click Add/Remove.

To reinstall LiveUpdate at any time, find the LUSETUP.EXE at the above 
URL and simply double-click it.

**********************************************************************
                      USING AOL (America Online)
**********************************************************************
Symantec has documentation in our online knowledgebase that can assist 
you in using LiveUpdate with America Online.  Please go to the 
following URL to review this information:

http://service1.symantec.com/SUPPORT/sharedtech.nsf/docid/19982515512

An important issue in configuring LiveUpdate to work with AOL is to 
first make sure you are using a Windows 95/98 version of the AOL 
software. Many free CD's that AOL makes available do not contain this 
version, but the Windows 3.x version instead.  While that version can 
be run under Win 95 or 98, it will not provide you with the necessary 
32-bit Internet connection that is required by LiveUpdate.

To check this, go to the HELP menu in your AOL software, and choose the 
"About" option.  If the screen does not say that it is a version for 
Windows 95 or Windows 98, then you have the incorrect AOL software 
installed.

You can download the latest Win 95/98 version of the AOL software 
directly from AOL by going to this web page:

http://www.aol.com/downloadaol.adp

Once you have verified the correct AOL software is installed, you may 
follow these steps to get LiveUpdate to work with an AOL connection.

Note: if you are using AOL to connect to the Internet via your modem, 
LiveUpdate requires that a TCP/IP connection be established prior to 
launching LiveUpdate. Note that Symantec is not liable for any phone 
charges incurred when making this dial up connection.

1) Update to the latest release of LiveUpdate.  Normally, LiveUpdate 
will automatically update itself.  However, following the instructions 
in the section above titled "INSTALLING/UNINSTALLING LIVEUPDATE" will 
ensure that you have the most current version of LiveUpdate.

2) Click on the START button on your desktop, then select SETTINGS, and 
then CONTROL PANEL.  Then double click on the LiveUpdate icon. 

3) Next, click on the ISP tab.  SELECT the option to "The Internet 
options in the Control Panel". If you do this, LiveUpdate will 
automatically use your already opened Internet connection.

4) Sign on to your AOL account. The AOL software will dial your AOL 
access phone number and make the Internet connection.

5) Once connected, launch LiveUpdate from your Symantec software. The 
software will then detect your already opened AOL connection, and use 
it to download any available Symantec software updates that you require.

**********************************************************************
                       USING IBM GLOBAL NETWORK
**********************************************************************
If you are already online with your IBM Global Network service you do 
not need to follow these instructions. The following information only 
applies if:

1) You wish to use an IBM Global Network to connect to the Internet 
2) You are not on-line when a LiveUpdate session is started

If you are using the IBM Global Network Dial-Up Networking client to 
establish an Internet connection to enable LiveUpdate to connect to the 
Symantec LiveUpdate servers, you are required to have the following 
settings:

1) From the Control Panel double-click on the LiveUpdate icon to open 
the LiveUpdate Settings Applet
2) Select the ISP tab
3) Select the "Customized settings for LiveUpdate" option
4) Within the "Use this Dial-Up Networking connection" section, select 
'IBM Global Network'
5) Within the "User Name" field enter first the "Account" followed by 
either a period, "." or "\" and then the "User ID". IBM Global Network 
should have provided both the Account and User ID to you.

                      i.e. Username: myaccount.myusername
                           Password: mypassword

6) In the "Password" field enter the password as provided to you by IBM 
Global Network

**********************************************************************
   "Can Not Read The List of New Updates" with ZipMagic Installed
**********************************************************************
LiveUpdate 1.6 is not compatible with the Zip Folders feature of
Mijenix's ZipMagic.  You may persistently receive "LiveUpdate can not
read the list of new updates" while ZipMagic is installed.  You can
work around this problem by temporarily turning off the Zip Folders
feature.  To do so, right-click ZipMagic's "Zip" icon in the Windows
Taskbar, then uncheck the "Show Zip Folders" item on the menu.

To prevent the problem from occurring again, use the following steps to
update ZipMagic's list of incompatible applications:

1. Right click ZipMagic's "Zip" icon in the toolbar and choose 
"Properties" from the menu.

2. Click the "Zip Folders" tab on the left of the ZipMagic window.

3. Click the "Applications" tab on the bottom of the Zip Folders
feature list.

4. To the right of the list box, click the "Add..." button to bring up
the Add New Application dialog box.

5. Click the "Browse..." button to find the LiveUpdate program file.

6. Click the "Look in" drop-down list and choose the drive LiveUpdate
is installed on (typically drive C).  Double click the folders,
"Program Files", then "Symantec", then "LiveUpdate".  Then double-
click the file "LuComServer.exe".

7. In the "Add New Application" window, click the "Add" button.

8. Click the "Done" button.  (Be sure you've already clicked "Add"!)

9. In the ZipMagic window, click Ok to apply the change.


**********************************************************************
                        TECHNICAL INFORMATION
**********************************************************************
LiveUpdate uses three possible methods, or transports, for retrieving 
updates and installing them.

1.  HTTP
We now use HTTP to download files from the Internet.  This replaces FTP 
as our primary method for the following reasons.

a: With the advent of the World-Wide-Web, HTTP is more widely used than 
FTP. More Internet Service Providers and corporations are configured to 
allow unrestricted HTTP transfers than FTP. This reduces the likelihood 
that you will need to configure LiveUpdate manually.
b: Through switching to HTTP, LiveUpdate now offers Download Resumption 
via the Internet. If a LiveUpdate transfer is interrupted because of a 
severed connection to the Internet (due to line noise or call waiting, 
for example) or merely canceled, it can be continued the next time 
LiveUpdate is run.
c: HTTP is slightly faster than FTP.  Also, if the file that LiveUpdate 
uses to determine the availability of updates has not changed since the 
last time it was run, LiveUpdate can now detect it and avoid 
re-transferring it. This will make your LiveUpdate sessions faster than 
before.

2.  FTP
FTP is the backbone of file transfers on the Internet.  If LiveUpdate 
is unable connect via HTTP, it will attempt to use the old FTP method 
automatically.  FTP does not offer download resumption. Corporate 
customers may need to configure LiveUpdate to use an FTP proxy or to 
use FTP in passive mode (as discussed above), but the updates it 
downloads are identical to those retrieved via HTTP.

3.  LAN (Local Area Network)
Corporate customers may wish to create their own internal LiveUpdate 
servers to ease bandwidth usage.  

In addition to the previous three transports mentioned, corporate 
customers may configure a network server to provide the updates using a 
standard file copy operation.  This may be faster and easier to 
configure than FTP or HTTP.  More information about the LAN transport 
is available from within the LiveUpdate Administration Utility.

**********************************************************************
                            KNOWN ISSUES
**********************************************************************
1. Some Symantec products provided a link to the LiveUpdate control 
panel entry from the start menu. These links may not work any longer on 
some systems. If you wish to configure LiveUpdate you should open the 
control panel and double-click on the LiveUpdate icon.

2. Some corporations distribute a LAN transport option with LiveUpdate. 
If LiveUpdate v1.6 finds this file in the same directory that it is 
being run from, it will search for a LAN entry in its settings file and 
use that transport instead on the FTP and HTTP transports.

**********************************************************************
                            END OF FILE
**********************************************************************
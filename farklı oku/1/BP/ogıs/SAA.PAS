{***************************************************************************
*  SAA: A unit containing routines for implementing SAA dialog boxes.      *
**------------------------------------------------------------------------**
*  Author           : MICHAEL TISCHER                                      *
*  developed on     : 07/13/1989                                           *
*  last update on   : 03/12/1990                                           *
***************************************************************************}

unit SAA;

interface

{***************************************************************************
* Imported units                                                           *
***************************************************************************}

uses Crt,                                          { Turbo Pascal CRT unit }
     Win,                   { Turbo Pascal Internals window unit ( Ch. 6 ) }
     Kbm2;       { Turbo Pascal Internals keyboard and mouse unit ( Ch. 7 ) }

{***************************************************************************
* Declarations of typed and untyped constants, accessible from other units *
* or programs                                                              *
***************************************************************************}

const {-- Return codes of individual objects to scheduler -----------------}
      {-- for use with external subclasses                -----------------}

      RC_ACCEPTED  = 0;        { Return code : Accept keyboard/mouse event }
      RC_NEXT      = 1;        { Return code : Activate next object        }
      RC_PREV      = 2;        { Return code : Activate previous object    }
      RC_ACT_ME_T  = 3;        { Return code : Activate me w/ a keypress   }
      RC_ACT_ME_M  = 4;        { Return code : Activate me w/ the mouse    }
      RC_NOT_MINE  = 32;       { Return code : Key/mouse event not for me  }
      RC_TERMINATE = 127;      { Return code : End scheduler               }

      {-- Predefined exit codes for called procedures ---------------------}

      RS_OK        = 0;             { Exit code Scheduler : End with OK    }
      RS_A_BREAK   = 1;             { Exit code Scheduler : End with break }
      RS_HELP      = 256;           { Exit code Scheduler : Get help       }

      {-- Predefined color values for screen layout -----------------------}

      CO_HOT       : byte = CYAN shl 4 + YELLOW;     { hotkey of an object }
      CO_NORM      : byte = CYAN shl 4 + BLACK;      { normal line display }
      CO_FRAME     : byte = CYAN shl 4 + WHITE;         { SAA window frame }
      CO_WIN       : byte = CYAN shl 4 + BLACK;        { window background }
      CO_ACT       : byte = CYAN;                     { current end button }
      CO_INVERS    : byte = CYAN;      { current entry in selection window }

{***************************************************************************
* Declarations of different objects and corresponding types                *
***************************************************************************}

{** Common SAA objects. Ancestor objects for all SAA objects **************}

type SAAT        =
       object
         {-- Variables ----------------------------------------------------}

         RCode,                       { internal return code for scheduler }
         MCode    : word;     { internal message code for called procedure }
         IsActive,                                        { object active? }
         Hkeys    : boolean;                             { hotkey pressed? }

         {-- Statistical methods ------------------------------------------}

         constructor Init;                      { initialization procedure }
         procedure ReturnCode( var RC, XC : word );
         procedure WriteIt( X, Y : byte;
                             Text : string;
                             HKey : boolean );

         {-- Virtual methods ----------------------------------------------}

         procedure Open; virtual;                     { open an SAA object }
         procedure DispHKey; virtual;                    { display hotkeys }
         procedure SetActive( message : word ); virtual;        { activate }
         procedure SetPassive; virtual;            { deactivate SAA object }
         procedure Get_AKey( Key : word ); virtual;       { keyboard event }
         procedure GetMouse( NewX, NewY,                     { mouse event }
                            OldX, OldY : byte;               { received    }
                            FrstEv,
                            Pressed    : boolean;
                            Time       : longint ); virtual;
       end;

     SAAPtr      = ^SAAT;                  { pointer to common SAA objects }

{** SAA object input field ************************************************}

     SAAIn      =
       object ( SAAT )                                  { subclass of SAAT }
         {-- Variables ----------------------------------------------------}

         InpTitle  : String[ 40 ];                 { title above the input }
         Content   : String[ 255 ];                           { input text }
         CurPos    : word;                 { cursor position in input text }
         ScrnCur,                            { cursor column on the screen }
         ColumnOne,                    { column of first character entered }
         Column,                                            { title column }
         Row,                                                  { title row }
         VWidth,                                    { visible screen width }
         TWidth,                                    { total width of input }
         Wait      : byte;                 { delay counter for mouse event }
         InsertM   : boolean;                        { insert mode active? }

         {-- Static methods -----------------------------------------------}

         procedure Print( TColor : byte );            { display input text }
         constructor Init( Cl, Ro,           { initialize input text field }
                           GWidth,
                           BWidth : byte;
                           PreText,
                           Default : string );

         {-- Virtual methods ----------------------------------------------}

         function IsItValid( Key : word ) : boolean; virtual;     { valid? }
         procedure Open; virtual;                     { create input field }
         procedure DispHKey; virtual;                     { display hotkey }
         procedure SetActive( message : word ); virtual;  { activate input }
         procedure SetPassive; virtual;           { deactivate input field }
         procedure Get_AKey( Key : word ); virtual;       { keyboard event }
         procedure GetMouse( NewX, NewY,             { receive mouse event }
                            OldX, OldY : byte;
                            FrstEv,
                            Pressed    : boolean;
                            Time       : longint ); virtual;
         function Result : string; virtual;

     end;

{** SAA object end buttons ************************************************}

     SAAEButtons =
        object                              { data block for an end button }
          {-- Variables ---------------------------------------------------}

          X,                                               { screen column }
          Y          : byte;                                  { screen row }
          KeyCode,                             { direct keycode for button }
          ReturnCode : word;                  { return code for end button }
          Text       : string[ 80 ];                         { button text }

          {-- Static methods ----------------------------------------------}

          constructor Init( XL, YT : byte;         { initialize data block }
                            KeyC   : word;
                            RCode  : word;
                            Name   : string) ;
        end;

     SAAEButtonF = array[ 1 .. 500 ] of SAAEbuttons;{ array w/ end buttons }
     SAAEButtPtr = ^SAAEButtonF;         { pointer to array w/ end buttons }

     SAAEndB     =
       object ( SAAT )                            { a group of end buttons }

        {-- Variables -----------------------------------------------------}

        RDataPtr   : SAAEButtPtr;                        { pointer to data }
        NumBut,                                    { number of end buttons }
        Default,                           { number of default end buttons }
        Current    : byte;                            { current end button }

        {-- Static methods ------------------------------------------------}

        procedure DispButton( No   : byte;            { display end button }
                              Mouse : boolean );
        constructor Init( Defaultkey,                  { end button object }
                          NumKey     : byte;           { initialization    }
                          RData      : pointer );

        {-- Virtual methods -----------------------------------------------}

        procedure Open; virtual;               { create and display object }
        procedure DispHKey; virtual;          { display end button hotkeys }
        procedure SetActive( message : word ); virtual;{ activate end bttn }
        procedure Get_AKey( Key : word ); virtual;        { keyboard event }
        procedure GetMouse( NewX, NewY,               { return mouse event }
                           OldX, OldY : byte;
                           FrstEv,
                           Pressed    : boolean;
                           Time       : longint ); virtual;

      end;

{** SAA object radio buttons **********************************************}

     SAARButtons =
       object                              { data block for a radio button }
        {-- Variables -----------------------------------------------------}

        X,                                                 { screen column }
        Y    : byte;                                          { screen row }
        Text : string[ 40 ];                                 { button text }

        {-- Static methods ------------------------------------------------}

        constructor Init( XL,                      { initialize data block }
                          YT   : byte;
                          Name : string );
      end;

     SAARButtonF = array[ 1 .. 500 ] of SAARButtons;        { radio button }
                                                            { data block   }

     SAARButtPtr = ^SAARButtonF;      { pointer to radio button data block }

     SAARadioB   =
       object ( SAAT )                                  { subclass of SAAT }
         {-- Variables ----------------------------------------------------}

         NumBut    : byte;                             { number of buttons }
         RDataPtr  : SAARButtPtr;           { pointer to button data block }
         CurBut    : byte;                               { current buttons }

         {-- Static methods -----------------------------------------------}

         constructor Init( Number  : byte;          { initialization of    }
                           RData   : pointer;       { radio button objects }
                           Current : byte );
         procedure DispButton( Pos : byte );

         {-- Virtual methods ----------------------------------------------}

         procedure Open; virtual;                   { create radio buttons }
         procedure DispHKey; virtual;   { display hotkey for radio buttons }
         procedure SetActive( message : word ); virtual;        { activate }
         procedure Get_AKey( Key : word ); virtual;       { keyboard event }
         procedure GetMouse( NewX, NewY,             { receive mouse event }
                            OldX, OldY : byte;
                            FrstEv,
                            Pressed    : boolean;
                            Time       : longint ); virtual;
       end;

{** SAA object toggle button **********************************************}

     SAAPushB    =
       object ( SAAT )                                  { subclass of SAAT }
         {-- Variables ----------------------------------------------------}

         X,                                         { screen column button }
         Y       : byte;                               { screen row button }
         Text    : string[ 40 ];                             { button text }
         Hotkey  : word;                                 { code for hotkey }
         PushSet : boolean;                           { toggle button set? }

         {-- Static methods -----------------------------------------------}

         constructor Init( Cl, Ro  : byte;             { initialization of }
                           Name    : string;           { toggle buttons    }
                           Default : boolean );

         {-- Virtual methods ----------------------------------------------}

         procedure Open; virtual;                   { toggle button design }
         procedure DispHKey; virtual;       { display toggle button hotkey }
         procedure SetActive( message : word ); virtual;     { activate it }
         procedure Get_AKey( Key : word ); virtual;       { keyboard event }
         procedure GetMouse( NewX, NewY,             { receive mouse event }
                            OldX, OldY : byte;
                            FrstEv,
                            Pressed    : boolean;
                            Time       : longint ); virtual;
       end;

{** Object Scheduler ******************************************************}

     SAAListPtr  = ^SAAList;                      { pointer to object list }

     SAAList     = record                 { enter object list in scheduler }
                    OP    : SAAPtr;                    { pointer to object }
                    Next,                          { pointer to next entry }
                    Prev  : SAAListPtr;        { pointer to previous entry }
                  end;

     SAASched    =
       object                                           { object scheduler }
         {-- Variables ----------------------------------------------------}

         XL,                          { left window column, screen window  }
         YO,                          { top window row, screen window      }
         XR,                          { right window column, screen window }
         YU         : byte;           { bottom window row, screen window   }
         MouseX,                  { mouse position on exit from schedulers }
         MouseY     : byte;
         NumObj     : byte;                  { number of displayed objects }
         WinHandle  : integer;                     { screen window handler }
         First,                           { pointer to head of object list }
         Last      : SAAListPtr;           { pointer to end of object list }

         {-- Static methods -----------------------------------------------}

         constructor Init( Cl1,                           { initialization }
                           Ro1,                           { of scheduler   }
                           Cl2,
                           Ro2  : byte );
         procedure Add( AnObject : SAAPtr );           { display an object }
         procedure Open;                                 { open SAA window }
         function Run( StartPos  : word ) : word;                    { run }
         procedure Close;                               { close SAA window }
         destructor Done;                                 { release memory }
       end;

     SAASchedPtr = ^SAASched;                       { pointer to scheduler }

{***************************************************************************
* Constants, accessible to other programs and units                        *
***************************************************************************}

const MouseDelay   = 5;                      { normal delay rate for mouse }
      MouseInpWait = 20;                      { delay rate for mouse input }

      Left_MouseB = 1;          { comparison for test of left mouse button }

implementation

{***************************************************************************
* Constant/type/var. declarations, inaccessible to other units and prgs    *
***************************************************************************}

type {-- structure to pointer arithmetic ----------------------------------}

     IncPointer = record
                    case boolean of
                      true  : ( APoint   : Pointer );
                      false : ( Ofs, Seg : word );
                    end;

{***************************************************************************
* non-object-oriented procedures                                           *
***************************************************************************}

{***************************************************************************
*  LeftPressed : tests for a pressed left mouse button.                    *
**------------------------------------------------------------------------**
*  Input   : Buttons = Mouse button status                                 *
*  Output  : TRUE if left mouse button is pressed, otherwise FALSE         *
*  Info    : Uses mouse button codes as declared in KBM unit.              *
***************************************************************************}

function LeftPressed( Buttons : word ) : boolean;

begin
  LeftPressed := ( ( Buttons and Left_MouseB ) = Left_MouseB );
end;

{***************************************************************************
*  Cursor : sets the internal display position for Write and Writeln, as   *
*           well as the position for the blinking screen cursor.           *
**------------------------------------------------------------------------**
*  Input   : X = Column, Y = Row                                           *
*  Info    : The WIN unit distinguishes between the visible cursor and the *
*            text display position. This procedure positions BOTH cursors. *
***************************************************************************}

procedure Cursor( X, Y : byte );

begin
  GotoXY( X, Y );                                    { set internal cursor }
end;

{***************************************************************************
*  TBColor : sets the text and background colors.                          *
**------------------------------------------------------------------------**
*  Input   : CVal = color value                                            *
*  Info    : Low  = text color, High = background color                    *
***************************************************************************}

procedure TBColor( CVal : byte );

begin
  TextColor( CVal and 15 );                               { set text color }
  TextBackground( CVal shr 4 );                     { set background color }
end;

{***************************************************************************
*  HotKeyCode : establishes codes for hotkeys.                             *
**------------------------------------------------------------------------**
*  Input   : TEXT = string which supplies the hotkey codes.                *
*  Output  : Key code of the hotkeys                                       *
*  Info    : The hotkey is the first character in the string preceded by a *
*            #. To select the object, the <Alt> key must be pressed at the *
*            same time as the hotkey.                                      *
***************************************************************************}

function HotKeyCode( Text : string ) : word;

const AltTab : array[ 0.. 42 ] of word     { table containing hotkey codes }
                      = ( 385, 376, 377, 378, 379, 380, 381, 382,  { 0 - 7 }
                          383, 384, 0, 0, 0, 0, 0, 0, 0,           { 8 - @ }
                          286, 304, 302, 288, 274, 289, 290, 291,  { A - H }
                          279, 292, 293, 294, 306, 305, 280, 281,  { I - P }
                          272, 275, 287, 276, 278, 303, 273, 301,  { Q - X }
                          277, 300 );

var Where: byte;              { position of #, PAlt code position in table }

begin
  {-- convey hotkey characters as string ----------------------------------}

  Where:= Pos( '#', Text );                      { search for mark in text }
  if ( Where<> 0  ) then                                   { hotkey found? }
    begin                               { other characters following the # }
      Where:= Ord( Upcase( Text [ Where+ 1 ] ) ) - $30; { table pos. char. }
      HotKeyCode := AltTab[ Where ];              { read hotkey from table }
    end
  else
    HotKeyCode := 0;                             { no hotkey in input text }
end;

{***************************************************************************
*  WithinRange : test for cursor position within specified rectangle.      *
**------------------------------------------------------------------------**
*  Input   : X, Y   = column, row of cursor                                *
*            XL, YT = column, row of upper left corner of test range       *
*            XR, YB = column, row of lower right corner of test range      *
*  Output  : TRUE if cursor is within rectangle, otherwise FALSE           *
***************************************************************************}

function WithinRange( X, Y, XL, YT, XR, YB : byte ) : boolean;

begin
  WithinRange := ( X >= XL ) and ( X <= XR ) and ( Y >= YT ) and ( Y <= YB );
end;

{***************************************************************************
* Implementation of objects :  S A A T                                     *
***************************************************************************}

{***************************************************************************
*  Init : Initialization of SAA objects                                    *
***************************************************************************}

constructor SAAT.Init;

begin
  RCode := RC_ACCEPTED;                    { initialize return code with 0 }
  MCode := 0;                             { initialize message code with 0 }
  HKeys := false;                                { still no hotkey display }
end;

{***************************************************************************
*  WriteIt : screen display for all SAA object texts .                     *
**------------------------------------------------------------------------**
*  Input   : X, Y = column, row of output                                  *
*            TEXT = output text                                            *
*            HKEY = hotkey pressed?                                        *
***************************************************************************}

procedure SAAT.WriteIt( X, Y : byte; Text : String; HKey : boolean );

var Position : byte;        { position of hotkey characters in output text }

begin
  Cursor( X, Y );                           { cursor to beginning of input }
  Position := Pos( '#', Text );
  if ( Position <> 0 ) then                                 { hotkey found }
    begin                                    { yes, string appears divided }
      Delete( Text, Position, 1 );                              { delete # }
      WriteStr(X, Y, text, CO_NORM);
      if ( Hkey ) then                { hotkey displayed in another color? }
        WriteStr(X + Position - 1, Y, Text[ Position ], CO_HOT  );
    end
  else                            { if no hotkey, then display entire text }
    WriteStr( X, Y, Text, CO_NORM );                        { display text }
end;

{***************************************************************************
*  Open : opens an SAA object.                                             *
**------------------------------------------------------------------------**
*  Info : blank superclass procedure needed, just as virtual methods and   *
*         functions are needed in subclasses.                              *
***************************************************************************}

procedure SAAT.Open;

begin
end;

{***************************************************************************
*  DispHKey : "displays" the hotkeys of an SAA object                      *
***************************************************************************}

procedure SAAT.DispHKey;

begin
  HKeys := true;                               { display text with hotkeys }
end;

{***************************************************************************
*  SetActive : activates an SAA object.                                    *
**------------------------------------------------------------------------**
*  Input   : MESSAGE = bases of activation through the scheduler           *
***************************************************************************}

procedure SAAT.SetActive( message : word );

begin
  IsActive := true;                              { set active flag to TRUE }
end;

{***************************************************************************
*  SetPassive : deactivates an SAA object.                                 *
***************************************************************************}

procedure SAAT.SetPassive;

begin
  IsActive := false;                            { set active flag to FALSE }
end;

{***************************************************************************
*  Get_AKey : receives a keyboard event from scheduler.                    *
**------------------------------------------------------------------------**
*  Input   : KEY = key value                                               *
***************************************************************************}

procedure SAAT.Get_AKey( Key : word );

begin
  RCode := RC_NOT_MINE;                 { superclass cannot handle the key }
end;

{***************************************************************************
*  GetMouse : receives a mouse event from scheduler.                       *
**------------------------------------------------------------------------**
*  Input   : NEWX, NEWY = column, row of new mouse position                *
*            OLDX, OLDY = column, row of previous mouse position           *
*            FRSTEV     = first call for object?                           *
*            PRESSED    = left mouse button pressed?                       *
*            TIME       = time period of mouse event                       *
***************************************************************************}

procedure SAAT.GetMouse( NewX, NewY, OldX, OldY : byte;
                        FrstEv, Pressed        : boolean;
                        Time                   : longint );

begin
  RCode := RC_NOT_MINE;        { superclass cannot handle any mouse events }
end;

{***************************************************************************
*  ReturnCode : returns object message to scheduler.                       *
*--------------------------------------------------------------------------*
*  Input   : RC = variable containing the return code taken from           *
*                 Get_AKey or GetMouse                                     *
*            X  = variable in which the Exit code is entered               *
*  Info    : the Exit code in XC is only valid when the preceding call     *
*            from GetMouse or Get_AKey was set with the RC_TERMINATE code. *
***************************************************************************}


procedure SAAT.ReturnCode( var RC, XC : word );

begin
  RC := Rcode;                                 { return code for scheduler }
  XC := Mcode;                         { message code for called procedure }
  RCode := RC_ACCEPTED;                { default for subsequent calls from }
  Mcode := 0;                          { GetMouse and Get_AKey loads       }
end;

{***************************************************************************
* Implementation of objects :  S A A E n d B                               *
***************************************************************************}

{***************************************************************************
*  Init : initializes one end button.                                      *
**------------------------------------------------------------------------**
*  Input   : XL, YT = column, row of left button border                    *
*            KEYC   = shortcut key                                         *
*            RCODE  = return code for scheduler                            *
*            NAME   = button text                                          *
***************************************************************************}

constructor SAAEButtons.Init( XL, YT : byte; KeyC : word;
                              RCode  : word; Name  : string );

begin
  X := XL;                                         { column of left border }
  Y := YT;                                                 { row of button }
  KeyCode := KeyC;                                       { default end key }
  Returncode := RCode;{ end code for scheduler when end button is selected }
  Text := Name;                                              { button text }
end;

{***************************************************************************
*  DispButton : displays text of an end button.                            *
**------------------------------------------------------------------------**
*  Input   : NO    = position in RData block                               *
*            MOUSE = row selected by mouse?                                *
*  Info    : When a button is selected by the mouse, the button changes to *
*            inverse video.                                                *
***************************************************************************}

procedure SAAEndB.DispButton( No : byte; Mouse : boolean );

var Dummy : string[ 80 ];                         { help string for output }

begin
  with RDataPtr^[ No ] do                                { row to be shown }
    begin
      {-- Button selected by mouse ----------------------------------------}

      if ( Mouse ) then
        begin
          Dummy := Text;                           { copy text for editing }
          if ( pos( '#', Dummy ) > 0 ) then            { marking received? }
            Delete( Dummy, Pos( '#', Dummy ), 1 );        { yes, delete it }
          WRiteStr( X ,  Y ,  '< ' + Dummy + ' >', CO_ACT );
        end

      {--- No input currently resulting from button selection w/ mouse ----}

      else if ( No = Current ) then
        begin
          WriteStr(  X ,  Y , '<', CO_HOT );   { highlighted edges }
          WriteIt(  X  + 1,  Y , ' '+Text+' ', Hkeys);
          if ( Pos( '#', Text ) > 0 ) then             { text highlighted? }
            WriteStr( X + Length(Text) + 2, Y, '>', CO_HOT )
          else                                        { no markers in text }
            WriteStr( X + Length(Text) + 3, Y, '>', CO_HOT );
        end

      {-- Display normal button -------------------------------------------}

      else
        WriteIt( X, Y, '< ' + Text + ' >', Hkeys );
      Cursor( X + pos( '#', text ) + 1, Y );      { set cursor }
    end;
end;

{***************************************************************************
*  DispHKey : displays an end button object through hotkey.                *
***************************************************************************}

procedure SAAEndB.DispHKey;

var i : byte;                                               { loop counter }

begin
  SAAT.DispHKey;                               { call superclass procedure }
  for i := 1 to NumBut do                            { display all buttons }
    DispButton( i, false );
end;

{***************************************************************************
*  Init : initializes the end button object.                               *
**------------------------------------------------------------------------**
*  Input   : DEFAULTKEY = default end key                                  *
*            NUMKEY     = number of end keys                               *
*            RDATA      = pointer to start of RData block                  *
***************************************************************************}

constructor SAAEndB.Init( DefaultKey, NumKey : byte; RData : pointer );

begin
  SAAT.Init;                    { call superclass initialization procedure }
  RDataPtr := SAAEButtPtr( RData );        { direct pointer to RData block }
  NumBut := NumKey;                                 { mark amount of RData }
  Default := DefaultKey;                       { direct to default end key }
end;

{***************************************************************************
*  Open : opens an end button type object.                                 *
***************************************************************************}

procedure SAAEndB.Open;

var i : byte;                                               { loop counter }

begin
  SAAT.Open;                               { call superclass open function }
  Current := Default;               { current end button is default button }
  for i := 1 to NumBut do                            { execute all buttons }
    DispButton( i, false );                              { display buttons }
end;

{***************************************************************************
*  SetActive : activates the end button object.                            *
**------------------------------------------------------------------------**
*  Input   : MESSAGE = reason for activation by scheduler                  *
***************************************************************************}


procedure SAAEndB.SetActive( message : word );

var Dummy : byte;                           { buffer for old active button }

begin
  SAAT.SetActive( message );             { superclass activation procedure }
  if ( message <> RC_ACT_ME_M ) then        { activation through keyboard? }
    begin                           { yes, then display new current button }
      Dummy := Current;                          { mark old current button }
      if ( message = RC_NEXT ) then              { call followed by <Tab>? }
        Current := 1                    { yes, set first button as current }
      else if ( message = RC_PREV ) then           { call using <BackTab>? }
        Current := NumBut;               { yes, set last button as current }
      if ( Dummy <> Current ) then          { current button been changed? }
        DispButton( Dummy, false );         { display old button as normal }
      DispButton( Current, false );             { cursor on current button }
    end;
end;

{***************************************************************************
*  Get_AKey : receives keyboard event from scheduler.                      *
**------------------------------------------------------------------------**
*  Input   : KEY = key value                                               *
***************************************************************************}

procedure SAAEndB.Get_AKey( Key : word );

var OlderButton : byte;                            { buffer for old button }
    Pos         : byte;                  { position pointer in RData block }

begin
  {-- <Tab> key -----------------------------------------------------------}

  if ( Key = TAB ) then
    if ( Current = NumBut ) then                          { end of object? }
      begin                                 { yes, continue to next object }
        RCode := RC_NEXT;     { <Tab> =  "next object active" in scheduler }
        OlderButton := Current;                          { mark old button }
        Current := Default;              { default button is again current }
        DispButton( OlderButton, false );   { display old button as normal }
        DispButton( Current, false );                { mark default button }
      end
    else
      begin                             { no, jump to next end button only }
        OlderButton := Current;                          { mark old button }
        inc( Current );                         { increment current button }
        DispButton( OlderButton, false );   { display old button as normal }
        DispButton( Current, false );                { mark default button }
      end

  {-- <BackTab> key -------------------------------------------------------}

  else if ( Key = BACKTAB ) then
    if ( Current = 1 ) then                            { start of objects? }
      begin                             { yes, continue to previous object }
        RCode := RC_PREV;          { "previous object active" in scheduler }
        OlderButton := Current;                          { mark old button }
        Current := Default;              { default button is again current }
        DispButton( OlderButton, false );   { display old button as normal }
        DispButton( Current, false );                { mark default button }
      end
    else
    begin                                { no, jump to previous end button }
      OlderButton := Current;                            { mark old button }
      dec( Current );                           { decrement current button }
      DispButton( OlderButton, false );     { display old button as normal }
      DispButton( Current, false );                  { mark default button }
    end

  {-- <Enter> key ---------------------------------------------------------}

  else if ( Key = CR ) then                      { end with current button }
    begin
      RCode := RC_TERMINATE;                                   { terminate }
      Mcode := RDataPtr^[ Current ].Returncode;          { set return code }
    end

  {-- Test for button activation through hotkey or direct access ----------}

  else
    begin
      {-- Check for hotkey or shortcut key --------------------------------}

      Pos := 1;                                  { use as position counter }
      while ( HotKeyCode( RDataPtr^[ Pos ].Text ) <> Key ) and
            ( RDataPtr^[ Pos ].Keycode <> Key ) and
            ( Pos < NumBut ) do            { end of list still not reached }
         Inc( Pos );

      {-- Hotkey selection ------------------------------------------------}

      if ( HotKeyCode( RDataPtr^[ Pos ].Text ) = Key ) then      { hotkey? }
        begin
          OlderButton := Current;                { mark old current button }
          Current := Pos;           { current button corresponds to hotkey }
          DispButton( OlderButton, false ); { display old button as normal }
          DispButton( Current, false );              { mark default button }
          if ( IsActive ) then                    { object already active? }
            RCode := RC_ACCEPTED              { yes, handle key internally }
          else
            RCode := RC_ACT_ME_T;           { no, object will be activated }
        end

      {-- Select using direct key selection -------------------------------}

      else if ( RDataPtr^[ Pos ].Keycode = Key ) then           { end key? }
        begin
          OlderButton := Current;                { mark old current button }
          Current := Pos;           { current button corresponds to hotkey }
          DispButton( OlderButton, false ); { display old button as normal }
          DispButton( Current, false );              { mark default button }
          RCode := RC_TERMINATE;                               { terminate }
          Mcode := RDataPtr^[ Pos ].ReturnCode;              { return code }
        end

      {-- Key not intended for object -------------------------------------}

      else
        RCode := RC_NOT_MINE;                { key not intended for object }
    end;
end;

{***************************************************************************
*  GetMouse : receives mouse event from scheduler.                         *
**------------------------------------------------------------------------**
*  Input   : NEWX, NEWY = column, row of new mouse position                *
*            OLDX, OLDY = column, row of previous mouse position           *
*            FRSTEV     = first call for object?                           *
*            PRESSED    = left mouse button pressed?                       *
*            TIME       = time period of mouse event                       *
***************************************************************************}

procedure SAAEndB.GetMouse( NewX, NewY, OldX, OldY : byte;
                           FrstEv, Pressed        : boolean;
                           Time                   : longint );

var Pos     : byte;                              { position in RData field }

begin
  if ( Pressed ) then                        { mouse button still pressed? }
    begin
      if ( OldX <> NewX ) or ( OldY <> NewY ) or ( FrstEv ) then
        begin            { when position on one button, display as inverse }
          Pos := 1;                      { check for button in RData field }
          while ( Pos <= NumBut) and
             ( ( OldY <>  RDataPtr^[ Pos ].Y  ) or
               ( OldX <  RDataPtr^[ Pos ].X  ) or
               ( OldX >  RDataPtr^[ Pos ].X  +
                        Length( RDataPtr^[ Pos  ].Text ) + 3 ) )
              do     { execute all end buttons until appropriate one found }
            Inc( Pos );
          if ( Pos <= NumBut ) then                 { old end button found }
            DispButton( Pos, false );           { display button as normal }
          Pos := 1;                    { display 2nd new button as inverse }
          while ( Pos <= NumBut) and
             ( ( NewY <>  RDataPtr^[ Pos ].Y  ) or
               ( NewX <  RDataPtr^[ Pos ].X  ) or
               ( NewX >  RDataPtr^[ Pos ].X  +
                        Length( RDataPtr^[ Pos  ].Text ) + 3 ) )
              do     { execute all end buttons until appropriate one found }
            Inc( Pos );
          if ( Pos <= NumBut ) then                 { new end button found }
            begin
              DispButton(  Pos, true );        { display button as inverse }
              if FrstEv then                  { first call for mouse event }
                Rcode := RC_ACT_ME_M                     { activate object }
              else
                Rcode := RC_ACCEPTED;               { mouse event accepted }
            end
          else if FrstEv then                 { first call for mouse event }
            Rcode := RC_NOT_MINE     { mouse event not intended for object }
          else
            Rcode := RC_ACCEPTED;                   { mouse event accepted }
        end
      else
        Rcode := RC_ACCEPTED;                       { mouse event accepted }
    end
  else                           { mouse exits when terminated by a button }
    begin
      Pos := 1;                         { search for button in RData field }
      while ( Pos <= NumBut) and
            ( ( NewY <>  RDataPtr^[ Pos ].Y  ) or
            ( NewX <  RDataPtr^[ Pos ].X  ) or
            ( NewX >  RDataPtr^[ Pos ].X  +
                     Length( RDataPtr^[ Pos  ].Text ) + 3 ) )
            do       { execute all end buttons until appropriate one found }
        Inc( Pos );
      MouHideMouse;                                   { hide mouse pointer }
      if ( Pos <= NumBut ) then                         { end button found }
        begin
          RCode := RC_TERMINATE;                               { terminate }
          Mcode := RDataPtr^[ Pos ].ReturnCode;              { return code }
          DispButton( Pos, false );              { hide button under mouse }
        end
      else
        DispButton( Current, false );          { pointer on current button }
      MouShowMouse;                          { display mouse pointer again }
    end;
end;

{***************************************************************************
* Implementation of objects :  S A A R a d i o B                           *
***************************************************************************}

{***************************************************************************
*  Init : initializes individual radio buttons.                            *
**------------------------------------------------------------------------**
*  Input   : XL, YT = column, row,                                         *
*            NAME   = text of buttons                                      *
***************************************************************************}

constructor SAARButtons.Init( XL, YT : byte; Name : string );

begin
  X := XL;                                      { column of left character }
  Y := YT;                                                 { row of button }
  Text := Name;                                              { button text }
end;

{***************************************************************************
*  DispButton : displays a button marker.                                  *
**------------------------------------------------------------------------**
*  Input   : POS = position in RData block                                 *
***************************************************************************}

procedure SAARadioB.DispButton( Pos : byte );

var HelpP : SAARButtPtr;                    { help pointer for RData block }

begin
  MouHideMouse;                                       { hide mouse pointer }
  with RDataPtr^[ Pos ] do                           { row to be displayed }
    begin
      WriteIt( X, Y, '( ) '+ Text, Hkeys );   { display button }
      if ( Pos = CurBut ) then                           { button current? }
        WriteStr( X+1, Y, #7, CO_NORM );        { yes, mark it }
      Cursor(  X + 1 , Y );              { set cursor to marking }
   end;
   MouShowMouse;                                { re-display mouse pointer }
end;

{***************************************************************************
*  Init : initializes radio button SAA objects.                            *
**------------------------------------------------------------------------**
*  Input   : NUMBER  = number of buttons in object                         *
*            RDATA   = pointer to the RData field                          *
*            CURRENT = number of active buttons                            *
***************************************************************************}

constructor SAARadioB.Init( Number  : byte; RData : pointer;
                            Current : byte );

begin
  SAAT.Init;                                     { initialize superclasses }
  NumBut := Number;                          { number of buttons in object }
  RDataPtr := RData;            { pointer to array [ 1.. Number ] of RData }
  CurBut := Current;                    { point to currently active button }
end;

{***************************************************************************
*  Open : opens a radio button object.                                     *
***************************************************************************}

procedure SAARadioB.Open;

var i : byte;                                               { loop counter }

begin
  SAAT.Open;                                             { call superclass }
  for i := 1 to NumBut do                            { display all buttons }
    DispButton( i );
end;

{***************************************************************************
*  DispHKey : displays hotkeys for radio buttons.                          *
***************************************************************************}

procedure SAARadioB.DispHKey;

var i : byte;                                               { loop counter }

begin
  SAAT.DispHKey;                               { call superclass procedure }
  for i := 1 to NumBut do                            { display all buttons }
    DispButton( i );
end;

{***************************************************************************
*  SetActive : activates a radio button object.                            *
**------------------------------------------------------------------------**
*  Input   : MESSAGE = reason for activation by scheduler                  *
***************************************************************************}

procedure SAARadioB.SetActive( message : word );

begin
  SAAT.SetActive( message );        { call superclass activation procedure }
  DispButton( CurBut );                      { place cursor in current row }
end;

{***************************************************************************
*  Get_AKey : receives keyboard event from scheduler.                      *
**------------------------------------------------------------------------**
*  Input   : KEY = key value                                               *
***************************************************************************}

procedure SAARadioB.Get_AKey( Key : word );

var ButtonPtr : SAARButtPtr;                      { pointer to button data }
    DummyPos,                                               { loop counter }
    Old       : byte;                       { buffer for old active button }

begin
  {-- Hotkey tests for a radio button -------------------------------------}

  DummyPos := 1;
  while  ( DummyPos <= NumBut ) and
         ( Key <> HotKeyCode( RDataPtr^[ DummyPos ].Text ) ) do
    Inc( DummyPos );
  if ( DummyPos <= NumBut ) then            { appropriate end button found }
    begin
      Old := CurBut;                                     { mark old button }
      CurBut := DummyPos;                           { direct to new button }
      DispButton( Old );                    { display old button as normal }
      DispButton( CurBut );                           { new display button }
      RCode := RC_ACT_ME_T;                              { activate object }
    end

  {-- Other keyboard events must only be possible on the active object ----}

  else if ( IsActive ) then
    begin
      {-- <Tab> key => "activate next object" message ---------------------}

      if ( Key = Tab ) then
        RCode := RC_NEXT

      {-- <BackTab> key => "activate previous object" message -------------}

      else if ( Key = BACKTAB ) then
        RCode := RC_PREV

      {-- <Cursor Dn> key => select next radio button ---------------------}

      else if ( Key = CDOWN ) then
        begin
          Dummypos := CurBut;                            { mark old button }
          if ( CurBut = NumBut ) then                          { last row? }
            CurBut := 1                     { then continue with first row }
          else
            Inc( CurBut );              { otherwise continue with next row }
          DispButton( DummyPos );                  { deactivate old button }
        end

      {-- <Cursor Up> key => select previous radio button -----------------}

      else if ( Key = CUP ) then
        begin
          DummyPos := CurBut;                            { mark old button }
          if ( CurBut = 1 ) then                              { first row? }
            CurBut := NumBut                 { then continue with last row }
          else
            Dec( CurBut );          { otherwise continue with previous row }
          DispButton( DummyPos );                  { deactivate old button }
        end

      {-- Key could not be accepted by object -----------------------------}

      else
        RCode := RC_NOT_MINE;
      DispButton( CurBut );                              { display new row }
    end

  {-- Object inactive and no hotkey pressed, key not accepted -------------}

  else
    RCode := RC_NOT_MINE;
end;

{***************************************************************************
*  GetMouse : receives mouse event from scheduler.                         *
**------------------------------------------------------------------------**
*  Input   : NEWX, NEWY = column, row of new mouse position                *
*            OLDX, OLDY = column, row of previous mouse position           *
*            FRSTEV     = first call for object?,                          *
*            PRESSED    = left mouse button pressed?                       *
*            TIME       = time period for mouse event                      *
***************************************************************************}

procedure SAARadioB.GetMouse( NewX, NewY, OldX, OldY : byte;
                             FrstEv, Pressed        : boolean;
                             Time                   : longint );

var Action  : boolean;                         { object action flag needed }
    Pos,                                       { counter for button number }
    Old     : byte;                         { memory for old active button }

begin
  if ( Pressed ) then                              { mouse button pressed? }
    begin
      if FrstEv then               { event does not depend on object, test }
        begin
          Pos := 1;                     { number of buttons to be compared }
          while ( (  RDataPtr^[ Pos ].Y  <> NewY ) or
                (  RDataPtr^[ Pos ].X  > NewX ) or
                (  RDataPtr^[ Pos ].X  +
                  Length( RDataPtr^[ Pos ].Text ) + 3 < NewX ) )
                and ( Pos < NumBut ) do
            Inc( Pos );                        { increment position number }
          if (  RDataPtr^[ Pos ].Y  = NewY ) and
            (  RDataPtr^[ Pos ].X  <= NewX ) and
            (  RDataPtr^[ Pos ].X  +
              Length( RDataPtr^[ Pos ].Text ) + 3 >= NewX ) then
            begin                               { new current button found }
              RCode := RC_ACT_ME_M;           { "activate me" in scheduler }
              Action := true;                   { action within the object }
            end
          else
            begin
              RCode := RC_NOT_MINE;            { "not for me" in scheduler }
              Action := false;                       { no action in object }
            end
        end
      else           { events following caused in mouse movement w/ button }
        begin
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
          Action := ( NewY <> OldY );    { action only when status changes }
        end;
      if ( Action ) then
        begin                     { mouse event for object, execute action }
          Pos := 1;                     { number of buttons to be compared }
          while ( RDataPtr^[ Pos ].Y  <> NewY ) and
                ( Pos < NumBut ) do
            Inc( Pos );                        { increment position number }
          if (  RDataPtr^[ Pos ].Y  = NewY ) then
            begin
              Old := CurBut;                             { mark old button }
              CurBut := Pos;                { direct to new current button }
              DispButton( Old );            { display old button as normal }
              DispButton( CurBut );           { display new current button }
            end;
        end;
    end
  else if ( FrstEv ) then
    RCode := RC_NOT_MINE                   { event not intended for object }
  else
    Rcode := RC_ACCEPTED;                { event accepted without reaction }
end;

{***************************************************************************
* Implementation of object :  S A A P u s h B                              *
***************************************************************************}

{***************************************************************************
*  Init : initializes SAA object toggle buttons.                           *
**------------------------------------------------------------------------**
*  Input   : Cl, Ro  = column, row of toggle button                        *
*            NAME    = text of toggle button                               *
*            DEFAULT = default value of toggle button                      *
***************************************************************************}

constructor SAAPushB.Init( Cl, Ro  : byte; Name : string;
                           Default : boolean );

begin
  SAAT.Init;                                       { initialize superclass }
  X := Cl;                                           { display text column }
  Y := Ro;                                              { display text row }
  Text := Name;                                      { button display text }
  PushSet := Default;                                      { button status }
  HotKey := HotKeyCode( Text );                  { filter hotkey from text }
end;

{***************************************************************************
*  DispHKey : displays the hotkey of a toggle button.                      *
***************************************************************************}

procedure SAAPushB.DispHKey;

begin
  SAAT.DispHKey;                               { call superclass procedure }
  WriteIt( X+4, Y, Text, Hkeys );               { display text }
end;

{***************************************************************************
*  Open : opens the object toggle button.                                  *
***************************************************************************}

procedure SAAPushB.Open;

begin
  SAAT.Open;                                          { open common object }
  WriteIt( X, Y, '[ ] ' + Text, Hkeys );        { display text }
  if PushSet then                                  { toggle button marked? }
    WriteStr( X+1, Y, 'X', CO_NORM )          { yes, display X }
end;

{***************************************************************************
*  SetActive : activates a toggle button object.                           *
**------------------------------------------------------------------------**
*  Input   : MESSAGE = reason for activation by scheduler                  *
***************************************************************************}

procedure SAAPushB.SetActive( message : word );

begin
  SAAT.SetActive( message );             { superclass activation procedure }
  Cursor(  X + 1 , Y );                     { cursor for marking }
end;

{***************************************************************************
*  Get_AKey : receives keyboard event from scheduler.                      *
**------------------------------------------------------------------------**
*  Input   : KEY = key value                                               *
***************************************************************************}

procedure SAAPushB.Get_AKey( Key : word );

begin
  {-- test hotkey for object ----------------------------------------------}

  if ( Key = Hotkey ) then
    begin
      RCode := RC_ACT_ME_T;                              { activate object }
      PushSet := not PushSet;                             { invert marking }
      if PushSet then                              { toggle button marked? }
        WriteStr( X+1, Y, 'X', CO_NORM )
      else
        WriteStr( X+1, Y, ' ', CO_NORM )
    end

  {-- Other keys can only be used with the active object ------------------}

  else if ( IsActive ) then
    begin
      {-- Display key code ------------------------------------------------}

      case Key of
        TAB     :  RCode := RC_NEXT;                { activate next object }
        BACKTAB :  RCode := RC_PREV;            { activate previous object }
        CDOWN,
        CLEFT   :  PushSet:= false;                       { delete marking }
        CUP,
        CRIGHT  :  PushSet := true;                          { set marking }
        SPACE   :  PushSet := not PushSet;                { invert marking }
        else       RCode := RC_NOT_MINE;     { key not intended for object }
      end;

      {-- Display button with new marking ---------------------------------}

      if PushSet then                              { toggle button marked? }
        WriteStr( X+1, Y, 'X', CO_NORM )
      else
        WriteStr( X+1, Y, ' ', CO_NORM )
    end

  {-- Object inactive and not a hotkey - not acceptable -------------------}

  else
    RCode := RC_NOT_MINE;                                { object inactive }
end;

{***************************************************************************
*  GetMouse : receives mouse event from scheduler.                         *
**------------------------------------------------------------------------**
*  Input   : NEWX, NEWY = column, row of new mouse position                *
*            OLDX, OLDY = column, row of previous mouse position           *
*            FRSTEV     = first call for object?,                          *
*            PRESSED    = left mouse button pressed?                       *
*            TIME       = time period of mouse event                       *
***************************************************************************}

procedure SAAPushB.GetMouse( NewX, NewY, OldX, OldY : byte;
                            FrstEv, Pressed        : boolean;
                            Time                   : longint );
var Action : boolean;                       { object action flag necessary }

begin
  if FrstEv then                   { event does not depend on object, test }
    if WithinRange( NewX, NewY, X, Y,
                  X + Length( Text ) + 4, Y ) then
      begin
        RCode := RC_ACT_ME_M;                 { "activate me" in scheduler }
        Action := true;                         { action within the object }
      end
    else
      begin
        RCode := RC_NOT_MINE;                  { "not for me" in scheduler }
        Action := false;                              { no action i object }
      end
  else
    begin
      RCode := RC_ACCEPTED;                  { "key accepted" in scheduler }
      Action := ( NewY <> OldY ) and ( NewY = Y ) and Pressed;
    end;
  if ( Action ) then
    begin                         { mouse event for object, execute action }
      PushSet := not PushSet;                                { invert flag }
      MouHideMouse;                                   { hide mouse pointer }
      if PushSet then                              { toggle button marked? }
        WriteStr( X+1, Y, 'X', CO_NORM )
      else
        WriteStr( X+1, Y, ' ', CO_NORM );
      MouShowMouse;                             { show mouse pointer again }
    end;
end;

{***************************************************************************
* Implementation of object :  S A A E I n                                  *
***************************************************************************}

{***************************************************************************
*  IsItValid : tests a key to see whether it is a valid input key.         *
**------------------------------------------------------------------------**
*  Input   : KEY  = key value to be tested                                 *
*  Output  : TRUE if key is valid, otherise FALSE                          *
*  Info    : By changing this virtual method into a subclass of SAAIn,    *
*            it can be adapted for input objects for numeric values, etc.  *
***************************************************************************}

function SAAIn.IsItValid( Key : word ) : boolean;

begin
  IsItValid := ( byte( Key and 255 ) in [ 8, 32..126, 128..175, 224..254 ] )
end;

{***************************************************************************
*  Print : displays the visible part of input field.                       *
**------------------------------------------------------------------------**
*  Input   : COLOR = display color of the input text                       *
***************************************************************************}

procedure SAAIn.Print( TColor : byte );

begin
  WriteStr(  ColumnOne ,  Row ,             { display text }
            Copy( Content ,
            Curpos - ScrnCur + 1, VWidth ), TColor );
  Cursor(  ColumnOne  + ScrnCur - 1,  Row  );         { set cursor }
end;

{***************************************************************************
*  Init : initializes SAA object input.                                    *
**------------------------------------------------------------------------**
*  Input   : Cl, Ro  = column, row                                         *
*            GWIDTH  = total width of text input                           *
*            BWIDTH  = width of visible region                             *
*            PRETEXT = title text                                          *
*            DEFAULT = default text for entry                              *
***************************************************************************}

constructor SAAIn.Init( Cl, Ro, GWidth, BWidth : byte;
                         PreText, Default         : String );

begin
  SAAT.Init;                                   { superclass initialization }
  InpTitle := PreText;                              { title text for input }
  Content := Default;                       { point to object default text }
  Column := Cl;                                          { column of title }
  Row := Ro;                                                { row of title }
  ColumnOne := Column + Length( InpTitle );       { column 1 of input line }
  if ( Pos( '#', InpTitle ) = 0 ) then                           { hotkey? }
   dec( ColumnOne );                         { no, decrement by one column }
  VWidth := BWidth;                          { input field width on screen }
  TWidth := GWidth;                               { length of input string }
end;

{***************************************************************************
*  Open : opens the input object.                                          *
***************************************************************************}

procedure SAAIn.Open;

begin
  SAAT.Open;                                   { call superclass procedure }
  InsertM := false;                                  { disable insert mode }
  CurPos := 1;                       { default to cursor position at start }
  ScrnCur := 1;                 { cursor position at start of screen range }
  WriteIt(  Column , Row ,                  { display input title }
            InpTitle , HKeys );
  Print( CO_NORM );                               { display input contents }
  Content := Content;
end;                                     { fill length of string with #255 }

{***************************************************************************
*  DispHKey : displays hotkeys for an input type.                          *
***************************************************************************}

procedure SAAIn.DispHKey;

begin
  SAAT.DispHKey;                               { call superclass procedure }
  WriteIt( Column ,  Row , InpTitle, HKeys );     { display title }
end;

{***************************************************************************
*  SetActive : activates an input object.                                  *
**------------------------------------------------------------------------**
*  Input   : MESSAGE = reason for activation by scheduler                  *
***************************************************************************}

procedure SAAIn.SetActive( message : word );

begin
  SAAT.SetActive( message );             { superclass activation procedure }
  Print( CO_ACT );                    { display input contents, set cursor }
  if ( insertM ) then                               { insert mode enabled? }
end;

{***************************************************************************
*  SetPassive : deactivates an input object.                               *
***************************************************************************}

procedure SAAIn.SetPassive;

begin
  SAAT.SetPassive;                     { superclass deactivation procedure }
  Print( CO_NORM );                   { display input contents, set cursor }
end;

{***************************************************************************
*  Get_AKey : receives keyboard event from scheduler.                      *
**------------------------------------------------------------------------**
*  Input   : KEY = key value                                               *
***************************************************************************}

procedure SAAIn.Get_AKey( Key : word );

var i : byte;                                               { loop counter }

begin
  {-- Test of hotkey for object -------------------------------------------}

  if ( Key = HotkeyCode( InpTitle ) ) then
    RCode := RC_ACT_ME_T

  {-- Other keys only enabled by active object ----------------------------}

  else if ( IsActive ) then      { otherwise, keys only when object active }
    case Key of                                              { process key }
      {-- <Tab> key => "activate next object" -----------------------------}

      TAB :
        RCode := RC_NEXT;

      {-- <BackTab> key => "activate previous object" ---------------------}

      BACKTAB :
        RCode := RC_PREV;

      {-- <Insert> key ----------------------------------------------------}

      INSERTKEY :
        begin
          InsertM := not InsertM;                     { invert Insert mode }
          if ( insertM ) then                        { Insert mode active? }
          else
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
        end;


      {-- <Home> key ------------------------------------------------------}

      CHOME :
        begin
          if ( ScrnCur = 1 ) then             { cursor on first character? }
            begin                           { yes, display text from start }
              CurPos := 1;                           { set cursor to start }
              ScrnCur := 1;              { cursor to start of screen range }
              Print( CO_ACT );                   { display text from start }
            end
          else                         { no, set cursor to first character }
            begin
              CurPos := CurPos - ScrnCur + 1;        { new cursor position }
              ScrnCur := 1;             { visible cursor to start of input }
            end;
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
        end;

      {-- <End> key -------------------------------------------------------}

      CEND :
        begin
          if ( ScrnCur = VWidth ) then          { cursor on last character }
            begin                      { yes, display last section of text }
              CurPos := TWidth;                              { cursor back }
              ScrnCur := VWidth;           { cursor to end of screen field }
              Print( CO_ACT );                              { display text }
            end
          else                                      { set cursor only back }
            begin
              Curpos := Curpos - ScrnCur + VWidth;            { set cursor }
              ScrnCur := VWidth;                        { cursor displayed }
            end;
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
        end;

      {-- <Ctrl><Home> key ------------------------------------------------}

      CTRL_HOME :
        begin
          Content := spaces(TWidth );        { make Content blank }
          CurPos := 1;                           { set cursor to the start }
          ScrnCur := 1;                  { cursor to start of screen range }
          Print( CO_ACT );                    { print input field as blank }
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
        end;


      {-- <Cursor Right> key ----------------------------------------------}

      CRIGHT :
        begin
          if ( CurPos < TWidth ) then
            begin                    { only sensible when still not at end }
              if ( ScrnCur = VWidth ) then        { cursor to end of field }
                begin                                { scroll screen range }
                  WinScrollLeft( VL( ColumnOne ) + 1, VO ( Row ),
                                 VL( ColumnOne ) + VWidth - 1,
                                 VO( Row ), 1, CO_ACT );
                  Inc( CurPos );              { increment position in text }
                  WriteStr( VL( ColumnOne ) + ScrnCur - 1, VO( Row ),
                            CO_ACT, Content[ CurPos ] );       { character }
                end
              else
                begin                                   { move cursor only }
                  Inc( ScrnCur );              { increment screen position }
                  Inc( Curpos );               { increment cursor position }
                end
             end;
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
        end;

      {-- <Cursor Left> key -----------------------------------------------}

      CLEFT :
        begin
          if ( CurPos > 1 ) then
            begin                   { only makes sense if not at start yet }
              if ( ScrnCur = 1 ) then           { cursor to start of field }
                begin                                { scroll screen range }
                  WinScrollRight( VL( ColumnOne ), VO( Row ),
                                  VL( ColumnOne ) + VWidth - 2,
                                  VO( Row ), 1, CO_ACT );
                  Dec( CurPos );                 { decrement text position }
                  WriteStr( VL( ColumnOne ), VO( Row ), CO_ACT,
                            Content[ CurPos ] );       { display character }
                end
              else
                begin                                   { move cursor only }
                  Dec( ScrnCur );              { increment screen position }
                  Dec( Curpos );               { increment cursor position }
                end;
            end;
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
        end;

      {-- <Delete> key ----------------------------------------------------}

      DELETEKEY  :
        begin
          Delete( Content, CurPos, 1 );    { delete character under cursor }
          Content := Content + #255;              { fill up contents again }
          WinScrollLeft( VL( ColumnOne ) + ScrnCur, VO( Row ),
                         VL( ColumnOne ) + VWidth - 1,       { scroll rest }
                         VO( Row ), 1, CO_ACT );
          WriteStr( VL( ColumnOne ) + VWidth - 1, VO( Row ), CO_ACT,
                   Content[ Curpos - ScrnCur + VWidth ] );
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
        end;

      {-- <Backspace> key -------------------------------------------------}

      BS :
        begin
          if ( Curpos > 1 ) then         { action only when cursor is not  }
            begin                        { at the first character position }
              Dec( Curpos );                   { decrement cursor position }
              Delete( Content, CurPos, 1 );        { delete left of cursor }
              Content := Content + #255;                 { refill contents }
              if ( ScrnCur > 1 ) then       { cursor cannot be moved left? }
                begin
                  WinScrollLeft( VL( ColumnOne ) + ScrnCur - 1,
                                 VO( Row ), VL( ColumnOne ) + VWidth - 1,
                                 VO( Row ), 1, CO_ACT );
                  Dec( ScrnCur );
                  WriteStr( VL( ColumnOne ) + VWidth - 1, VO( Row ),
                            CO_ACT, Content[ Curpos - ScrnCur + VWidth ] );
                end;
            end;
          RCode := RC_ACCEPTED;              { "key accepted" in scheduler }
        end;

      {-- Specific characters instead of control keys ---------------------}

      else
        if ( Key < 256 ) and IsItValid( Key ) then
          begin
            {-- Handle the key in insert mode -----------------------------}

            if ( insertM ) then                     { insert mode enabled? }
              begin
                if ( ( CurPos < TWidth ) and ( ScrnCur < VWidth ) ) then
                  begin
                    Delete( Content, TWidth, 1 );       { delete character }
                    Insert( chr( Key and 255 ), Content, Curpos );
                    WinScrollRight( VL( ColumnOne ) + ScrnCur - 1,
                                    VO( Row ), VL( ColumnOne ) + VWidth - 2,
                                    VO( Row ), 1, CO_ACT );
                    WriteStr( VL( ColumnOne ) + ScrnCur - 1, VO( Row ),
                              CO_ACT, chr( Key and 255 ) );
                    inc( CurPos );
                    inc( ScrnCur );
                  end
              end

           {-- Handle key in overwrite mode -------------------------------}

            else
              begin
                Content [ CurPos ] := chr( Key and 255 );      { character }
                WriteStr( VL( ColumnOne ) + ScrnCur - 1, VO( Row ),
                          CO_ACT, Content[ Curpos ] );           { display }
                if ( CurPos < TWidth ) then              { last character? }
                  begin                  { no, move cursor one char. right }
                    Inc( Curpos );             { increment cursor position }
                    if ( ScrnCur = VWidth ) then            { end of field }
                      begin                         { scroll field to left }
                        WinScrollLeft( VL( ColumnOne ) + 1,VO( Row ),
                                       VL( ColumnOne ) + VWidth - 1,
                                       VO( Row ), 1, CO_ACT );

                         WriteStr( VL( ColumnOne ) + VWidth - 1, VO( Row ),
                                CO_ACT, Content[Curpos - ScrnCur + VWidth]);
                      end
                    else
                      Inc( ScrnCur );          { increment screen position }
                  end;
              end;
            RCode := RC_ACCEPTED;            { "key accepted" in scheduler }
          end

      {-- Key cannot be accepted from object ------------------------------}

      else
        RCode := RC_NOT_MINE;            { key unsuitable for input object }
    end

  {-- Object inactive and NOT a hotkey, therefore cannot be accepted ------}

  else
    RCode := RC_NOT_MINE;              { "key not for object" in scheduler }

  if ( RCode = RC_ACCEPTED ) then                          { key accepted? }
    Cursor( VL( ColumnOne ) + ScrnCur - 1, VO( Row ) );      { yes, cursor }
end;

{***************************************************************************
*  GetMouse : receives mouse event from scheduler.                         *
**------------------------------------------------------------------------**
*  Input   : NEWX, NEWY = column, row of new mouse position                *
*            OLDX, OLDY = column, row of previous mouse position           *
*            ERSTEV     = first call for object?                           *
*            PRESSED    = left mouse button pressed?                       *
*            TIME       = time period for mouse event                      *
***************************************************************************}

procedure SAAIn.GetMouse( NewX, NewY, OldX, OldY : byte;
                          FrstEv, Pressed        : boolean;
                          Time                   : longint );

var Action : boolean;                       { object action flag necessary }
    Pos    : byte;

begin
  if FrstEv then                  { event not depending on object, testing }
    if ( NewY = VO( Row ) ) and ( NewX >= VL( ColumnOne ) ) and
        ( NewX <= VL( ColumnOne ) + VWidth ) then
      begin
        RCode := RC_ACT_ME_M;               { "activate me" from scheduler }
        Wait := MouseInpWait;                           { initialize delay }
        Action := true;                         { action within the object }
      end
    else
      begin
        RCode := RC_NOT_MINE;            { "not meant for me" in scheduler }
        Action := false;                            { no action for object }
      end
  else
    begin
      RCode := RC_ACCEPTED;                  { "key accepted" in scheduler }
      Action := true;                           { action within the object }
    end;
  if ( Action ) then
    begin                      { mouse event for object, so execute action }
      if ( NewX < VL( ColumnOne ) ) then
        begin       { mouse position to left of input, scroll to the right }
          Dec( Wait );                           { decrement delay counter }
          if ( Wait = 0 ) then                           { action or delay }
            begin
              if ( ScrnCur > 1 ) then  { cursor previously in input field? }
                begin                 { no, move cursor one character back }
                  Dec( ScrnCur );                    { visible cursor back }
                  Dec( CurPos );                    { internal cursor back }
                end
              else if ( CurPos > 1 ) then      { cursor to start of input? }
                begin             { cursor already at start of input field }
                  WinScrollRight( VL( ColumnOne ), VO( Row ),
                                  VL( ColumnOne ) + VWidth - 2, VO( Row ),
                                  1, CO_ACT );                    { scroll }
                  Dec( CurPos );                    { internal cursor back }
                  WriteStr( VL( ColumnOne ), VO( Row ),      { display new }
                            CO_ACT, Content[ CurPos ] );     { first char. }
                end;
              Wait := MouseInpWait;                        { set new delay }
            end;
        end
      else if ( NewX > VL( ColumnOne ) + VWidth - 1 ) then
        begin       { mouse position to right of input, scroll to the left }
          Dec( Wait );                           { decrement delay counter }
          if ( Wait = 0 ) then                           { action or delay }
            begin
              if ( ScrnCur < VWidth ) then { cursor behind in input field? }
                begin           { no, move first cursor one character back }
                  Inc( ScrnCur );               { visible cursor as before }
                  Inc( CurPos );               { internal cursor as before }
                end
              else if ( CurPos < TWidth ) then   { cursor at end of input? }
                begin
                  WinScrollLeft( VL( ColumnOne ) + 1, VO( Row ),
                                 VL(  ColumnOne ) + VWidth - 1, VO( Row ),
                                 1, CO_ACT );                     { scroll }
                  Inc( CurPos );                   { reset internal cursor }
                  WriteStr( VL( ColumnOne ) + VWidth - 1, VO( Row ),
                            CO_ACT, Content[ CurPos ] );   { display char. }
                end;
              Wait := MouseInpWait;                        { set new delay }
            end;
        end
      else
        begin                          { mouse position within input field }
          Wait := MouseInpWait;              { re-initialize delay counter }
          Pos := NewX - VL( ColumnOne ) + 1;   { cursor position on screen }
          CurPos := CurPos - ScrnCur + Pos;       { position of input text }
          ScrnCur := Pos;                       { point to screen position }
        end;
      Cursor( VL( ColumnOne ) + ScrnCur - 1, VO( Row ) );         { cursor }
    end;
end;

{***************************************************************************
*  Result : returns a prepared string.                                     *
**------------------------------------------------------------------------**
*  Output  : Specified string                                              *
*  Info    : If contents are read directly, the input contains fill char-  *
*            acters (#255). These are used for absolute results.           *
***************************************************************************}

function SAAIn.Result : string;

var Stringdummy : string[ 255 ];                       { buffer for result }
    i           : byte;                                     { loop counter }

begin
  i := TWidth;                                { position on last character }
  while ( Content[ i ] = #255 ) and ( i >= 0 ) do         { fill character }
    Dec( I );                                         { decrement position }
  if ( i > 0 ) then                                      { no blank input? }
    begin
      Stringdummy := Copy( Content, 1, i );               { copy out input }
      for i := 1 to length( Stringdummy ) do               { execute input }
        if ( Stringdummy[ i ] = #255 ) then      { replace fill characters }
          Stringdummy[ i ] := #32;               { in input with spaces    }
      Result := Stringdummy;                                 { pass result }
    end
  else
    Result := '';                                      { blank input field }
end;


{***************************************************************************
* Implementation of objects :  S A A S c h e d                             *
***************************************************************************}

{***************************************************************************
*  Init : initializes an SAA scheduler.                                    *
**------------------------------------------------------------------------**
*  Input   : Cl1, Ro1 = upper left window corner,                          *
*            Cl2, Ro2 = lower right window corner                          *
***************************************************************************}

constructor SAASched.Init( Cl1, Ro1, Cl2, Ro2 : byte );

begin
  NumObj := 0;                         { no objects displayed up until now }
  First := nil;                             { initialize list in specified }
  Last := nil;                              { scheduler objects as blank   }
  XL := Cl1;                                           { left column frame }
  YO := Ro1;                                               { top row frame }
  XR := Cl2;                                          { right column frame }
  YU := Ro2;                                            { bottom row frame }
  MouseX := ( XR + XL ) div 2;                      { position mouse in    }
  MouseY := ( YU + YO ) div 2;                      { center of SAA window }
end;

{***************************************************************************
*  Add : displays an object for scheduler.                                 *
**------------------------------------------------------------------------**
*  Input   : ANOBJECT = pointer to an inserted object                      *
***************************************************************************}

procedure SAASched.Add( AnObject : SAAPtr );

var ListP : SAAListPtr;                   { help pointer to list insertion }

begin
  new( ListP );                        { reserve memory for new list entry }
  Inc( NumObj );                   { increment number of displayed objects }
  ListP^.OP := AnObject;                    { direct pointer to new object }
  if ( First = nil ) then                             { ListP still empty? }
    begin                                        { yes, alternate handling }
      ListP^.Next := nil;                { next object still not available }
      ListP^.Prev := nil;            { previous object still not available }
      First := ListP;            { ListP is first entry in the object list }
      Last := ListP;                     { ListP is also last single entry }
    end
  else                                                { ListP is not empty }
    begin
      ListP^.Next := nil;                     { still no entries following }
      ListP^.Prev := Last;                      { preceding was last entry }
      Last^.Next := ListP;       { old last entry has another following it }
      Last := ListP;                             { ListP is new last entry }
    end;
end;

{***************************************************************************
*  Open : opens an SAA window.                                             *
***************************************************************************}

procedure SAASched.Open;

var Pos : SAAListPtr;                        { help pointer to object list }

begin
  WinHandle := WinOpenShadow( XL, YO, XR, YU );          { open SAA window }
  WinFill( XL, YO, XR, YU, #32, CO_WIN );                    { fill window }
  WinFrame( XL, YO, XR, YU, SIN_FR, CO_FRAME );               { draw frame }
  Pos := First;                     { position to beginning of object list }
  while ( Pos <> nil ) do                           { execute entire ListP }
    begin
      Pos^.OP^.Open;                     { call open procedure for objects }
      Pos^.OP^.SetPassive;                            { deactivate objects }
      Pos := Pos^.Next;                        { continue with next object }
    end;
end;

{***************************************************************************
*  Run : controls and governs input in an SAA dialog box.                  *
*--------------------------------------------------------------------------*
*  Input   : StartPos = number of the first active object                  *
*  Output  : return code of the scheduler                                  *
***************************************************************************}

function SAASched.Run( StartPos : word ) : word;

var HPtr,                          { pointer for executing the object list }
    ActOb       : SAAListPtr;           { pointer to current active object }
    NewAction,                         { test for new readable mouse event }
    Action    : Event;                           { keyboard or mouse event }
    OldX,
    OldY      : byte;                  { buffer for cursor, mouse position }
    Answer,
    ExitCode   : word;            { return code of object on the scheduler }

begin
  {-- Pass pointer to current object and activate object ------------------}

  ActOb := First;                { pointer to the first object on the list }
  for Answer := 1 to StartPos-1 do            { pointer to starting object }
    ActOb := ActOb^.Next;
  ActOb^.OP^.SetActive( RC_NEXT );               { activate current object }

  Answer := RC_ACCEPTED;                  { initialize object return codes }
  ExitCode := 0;

  MouMovePtr( MouseX, MouseY );                        { set mouse pointer }
  OldX := MouseX;                            { note current mouse position }
  OldY := MouseY;

  {-- Scheduler work loop -------------------------------------------------}

  repeat
    MouShowMouse;                                  { display mouse pointer }
    KBMEventWait( EV_ALL, Action );     { wait for keyboard or mouse event }
    MouHideMouse;                                     { hide mouse pointer }

    with Action do                        { convey keyboard or mouse event }
      begin
        {-- <Alt> key pressed = display hotkeys ---------------------------}

        if ( EvntCode = EV_KEY_STATUS ) and ( StateKey = KEY_ALT ) then
          begin                       { <Alt><hotkeys> display all objects }
            OldX := WhereX;                          { store cursor column }
            OldY := WhereY;                             { store cursor row }

            HPtr := First;               { pointer to start of object list }
            while ( HPtr <> nil ) do                 { execute entire list }
              begin
                HPtr^.OP^.DispHKey;                       { display hotkey }
                HPtr := HPtr^.Next;               { pointer to next object }
              end;

            Cursor( OldX, OldY );        { cursor returned to old position }
          end

        {-- Normal keystroke ----------------------------------------------}

        else if ( EvntCode = EV_KEY_PRESSED ) then          { key pressed? }
          begin     { yes, send key to active object and evaluate reaction }
            ActOb^.OP^.Get_AKey( Key );
            ActOb^.OP^.ReturnCode( Answer, ExitCode );

            {-- Convert return message of active object -------------------}

            if ( Answer = RC_NEXT ) then          { next object activated? }
              begin                                                  { yes }
               ActOb^.OP^.SetPassive;              { deactivate old object }
                if ( ActOb^.Next = nil ) then               { end of list? }
                  ActOb := First          { yes, continue from top of list }
                else
                  ActOb := ActOb^.Next;    { no, continue with next object }
                ActOb^.OP^.SetActive( RC_NEXT );     { activate new object }
              end

            else if ( Answer = RC_PREV ) then { previous object activated? }
              begin                                                  { yes }
                ActOb^.OP^.SetPassive;             { deactivate old object }
                if ( ActOb^.Prev = nil ) then             { start of list? }
                  ActOb := Last           { yes, continue from end of list }
                else
                  ActOb := ActOb^.Prev;{ no, continue with previous object }
                ActOb^.OP^.SetActive( RC_PREV );  { activate newest object }
              end

            else if ( Answer = RC_NOT_MINE ) then    { key not acceptable? }
              begin                             { no, search for addresses }
                HPtr := First;         { start search at beginning of list }
                repeat
                  HPtr^.OP^.Get_AKey( Key );                    { send key }
                  HPtr^.OP^.Returncode( Answer, ExitCode );
                  if ( Answer = RC_NOT_MINE ) then
                    HPtr := HPtr^.Next;              { not found, continue }
                until ( Answer <> RC_NOT_MINE ) or ( HPtr = nil );

                if ( HPtr <> nil ) then                    { answer found? }
                  begin                                              { yes }
                    ActOb^.OP^.SetPassive;         { deactivate old object }
                    ActOb := HPtr;            { point to new active object }
                    if ( Answer = RC_ACT_ME_T ) then
                      ActOb^.OP^.SetActive( RC_ACT_ME_T );      { activate }
                 end;
             end;
         end

       {-- Mouse event, left mouse button was pressed ---------------------}

       else if ( EvntCode = EV_LEFT_PRESS ) then
         begin
           OldX := AbsColumn;          { mouse not moved, but the left     }
           OldY := Abs_Row;            { button has been pressed           }
           HPtr := First;

           {-- Search for mouse event addresses ---------------------------}

           repeat
             HPtr^.OP^.GetMouse( AbsColumn, Abs_Row, OldX, OldY,
                                true, LeftPressed( Buttons ), Time );
             HPtr^.OP^.Returncode( Answer, ExitCode );
             if ( Answer = RC_NOT_MINE ) then            { event occurred? }
               HPtr := HPtr^.Next;                          { no, continue }
           until ( Answer <> RC_NOT_MINE ) or ( HPtr = nil );

           if ( HPtr <> nil ) then                        { nothing found? }
             begin                                                   { yes }
               if ( Answer = RC_ACT_ME_M ) then
                 begin        { object would like to be activated by mouse }
                   ActOb^.OP^.SetPassive;          { deactivate old object }
                   ActOb := HPtr;            { direct to new active object }
                   ActOb^.OP^.SetActive( RC_ACT_ME_M );         { Activate }
                   MouShowMouse;                   { display mouse pointer }

                   {-- Mouse loop, as long as left mouse button is pressed }

                   repeat                              { mouse action loop }
                     Delay( MouseDelay );                    { mouse delay }
                     OldX := AbsColumn;          { mark old mouse position }
                     OldY := Abs_Row;

                     {-- If no event is ready for, display until the user -}
                     {-- presses the mouse button again                   -}

                     KBMPeekEvent( NewAction );               { read event }
                     if ( NewAction.EvntCode <> EV_NO_EVENT ) then
                       KBMGetEvent( NewAction );               { get event }

                     if ( ( NewAction.EvntCode = EV_MOU_MOVE ) or
                          ( NewAction.EvntCode = EV_LEFT_REL ) )  then
                       begin                    { new sensible mouse event }
                         OldX := AbsColumn;          { mark mouse position }
                         OldY := Abs_Row;
                         Action := NewAction;              { use new event }
                       end;

                     HPtr^.OP^.GetMouse( AbsColumn, Abs_Row, OldX, OldY,
                                        false, LeftPressed( Buttons ),
                                        Time );
                     HPtr^.OP^.Returncode( Answer, ExitCode );
                   until ( EvntCode = EV_LEFT_REL ) or
                         ( Answer = RC_TERMINATE );

                   if ( Answer = RC_TERMINATE ) then    { scheduler ended? }
                     MouHideMouse;
                 end;
             end;
          end;
      end;
  until ( Answer = RC_TERMINATE );

  Run := ExitCode;                         { end code for called procedure }
  ActOb^.OP^.SetPassive;                   { deactivate last active object }
  MouseX := OldX;                                    { stores mouse column }
  MouseY := OldY;                                       { stores mouse row }
end;

{***************************************************************************
*  Close : closes an SAA window.                                           *
***************************************************************************}

procedure SAASched.Close;

begin
  WinClose( true );                  { close window and restore background }
end;

{***************************************************************************
*  Done : releases reserved memory from the scheduler.                     *
***************************************************************************}

destructor SAASched.Done;

begin
  {-- Execute list of objects and release allocated memory ----------------}

  Last := First;                       { both pointer to beginning of list }
  while ( First <> nil ) do            { as long as list still isn't empty }
    begin
      First := First^.Next;                { a pointer to the next element }
      Dispose( Last );                                    { release memory }
      Last := First;                   { set both pointers to rest of list }
    end;
end;

{***************************************************************************
*         I N I T I A L I Z A T I O N    O F   T H E   U N I T             *
***************************************************************************}

begin
  if not( color ) then                             { color card installed? }
    begin                        { no, monochrome card, change color codes }
      CO_HOT    := LIGHTGRAY shl 4 + WHITE;                 { hotkey color }
      CO_NORM   := LIGHTGRAY shl 4 + BLACK;        { normale display color }
      CO_FRAME  := LIGHTGRAY shl 4 + BLACK;     { frame color - SAA window }
      CO_WIN    := LIGHTGRAY shl 4 + BLACK;{ background color - SAA window }
      CO_ACT    := LIGHTGRAY;                     { color coded end button }
      CO_INVERS := LIGHTGRAY;                      { color slider position }
    end;
end.

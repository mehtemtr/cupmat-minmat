{***************************************************************************
*  K B M : A unit which provides easy access to mouse and keyboard.        *
**------------------------------------------------------------------------**
*  Author           : MICHAEL TISCHER                                      *
*  developed on     : 06/01/1989                                           *
*  last update on   : 09/23/1989                                           *
***************************************************************************}

unit Kbm2;

interface

uses Dos;                                                { link units }

{== Type declarations needed by procedures and functions using this unit ==}

type  KCODE    = word;              { key code, >= 256 : extended key code }
      PTRVIEW  = longint;                           { mouse pointer design }

      MSRANGE  = record                          { describes a mouse range }
                   x1,                     { upper left coordinates of the }
                   y1,                     { specified range               }
                   x2,                    { lower right coordinates of the }
                   y2  : byte;            { specified range                }
                 end;
      RNGARRAY = array [0..99] of MSRANGE;                   { range array }
      RNGPTR   = ^RNGARRAY;                       { pointer to range array }

      EVENT = record                   { describes mouse or keyboard event }
                EvntCode : integer;                           { event code }
                Time     : longint;                        { time in ticks }

                case byte of                           { keyboard or mouse }
                  0 : { Mouse: ( EV_MOU_...) ------------------------------}
                       ( Rel_Row,                { mouse pointer position, }
                         RelColumn,              { relative to range       }
                         Abs_Row,              { mouse pointer position,   }
                         AbsColumn,            { relative to stored screen }
                         Range,                              { mouse range }
                         Buttons : byte );                 { button status }

                   1 : { KCode: ( EV_KEY_PRESSED ) ------------------------}
                       ( Key : KCODE );                      { key pressed }

                   2 : { Keys which produce no code: ( EV_KEY_UNKNOWN ) ---}
                       ( ScanCode,                    { scan code returned }
                         Status    : byte );          { control key status }

                   3 : { Status key, no code ( EV_KEY_STATUS ) ------------}
                       ( StateKey : byte );
              end;

      EVENTHANDLER = procedure ( var EvRec : EVENT );

{== Declaration of functions and procedures which can be called from ======}
{== other programs                                                   ======}

procedure KbmRegisterHandler  ( Event : word; Handler : EVENTHANDLER );
procedure KbmDeRegisterHandler( Event : word );
procedure KbmGetEvent         ( var EvRec : EVENT );
procedure KbmPeekEvent        ( var EvRec : EVENT );
procedure KbmReleaseMode      ( KMode : byte  );
procedure KbmSetMode          ( KMode : byte  );
function  MouPtrMask          ( Character, Color  : word ) : PTRVIEW;
function  PtrDifChar          ( Character : byte ) : word;
function  PtrDifCol           ( Color : byte ) : word;
procedure MouDefinePtr        ( Mask : PTRVIEW );
procedure MouDefRange         ( Amount : byte; BPtr : RNGPTR );
procedure KbmEventWait        ( WaitEvent : integer; var EvRec : EVENT );
procedure MouShowMouse;
procedure MouHideMouse;
procedure MouSetMoveArea      ( x1, y1, x2, y2 : byte );
procedure MouSetSpeed         ( XSpeed, YSpeed : integer );
procedure MouMovePtr          ( Col, Row : byte );
procedure KbmInit             ( Columns, Lines_ : byte );
procedure KbmEnd;

{== Variables needed from within an application program ===================}

var MouAvail : boolean;                   { TRUE when a mouse is available }

   {-- Variables loaded every time the mouse handler is called ------------}

    CurRng,                                      { number of current range }
    CurBut,                                          { mouse button status }
    CurX,                                 { current mouse pointer position }
    CurY  : byte;                         { relative to entire screen      }

{== Constants needed by an application program ============================}

const {------------------------------------------------- Event codes ------}

      EV_NO_EVENT     =    0;                          { no event prepared }
      EV_MOU_MOVE     =    1;                                { mouse moved }
      EV_LEFT_PRESS   =    2;                  { left mouse button pressed }
      EV_LEFT_REL     =    4;                 { left mouse button released }
      EV_RIGHT_PRESS  =    8;                 { right mouse button pressed }
      EV_RIGHT_REL    =   16;                { right mouse button released }
      EV_KEY_PRESSED  =  256;                                { key pressed }
      EV_KEY_UNKNOWN  =  512;      { key combination that produces no code }
      EV_KEY_STATUS   = 1024;               { Status key, produces no code }

      EV_MOU_ALL      =   31;                           { all mouse events }
      EV_KEY_ALL      = 1792;                        { all keyboard events }
      EV_ALL          = 1823;              { all mouse and keyboard events }

      {------------------------------------- Status key codes -------------}

      KEY_RIGHT_SHIFT =   1;
      KEY_LEFT_SHIFT  =   2;
      KEY_CTRL        =   4;
      KEY_ALT         =   8;
      KEY_SCROLL_LOCK =  16;
      KEY_NUM_LOCK    =  32;
      KEY_CAPS_LOCK   =  64;
      KEY_INSERT      = 128;

      {--------------- Constants used for describing mouse pointer --------}

      PtrSameChar = $00ff;
      PtrSameCol  = $00ff;
      PtrInvCol   = $7777;
      PtrSameColB = $807f;                    { blinking - same color      }
      PtrInvColB  = $F777;                    { blinking - different color }

      {------------------------------------- Control key codes ------------}

      BEL       =   7;                                   { Bell character  }
      BS        =   8;                                   { Backspace key   }
      TAB       =   9;                                   { Tab key         }
      LF        =  10;                                   { Linefeed        }
      CR        =  13;                                   { Return key      }
      ESC       =  27;                                   { Escape key      }
      SPACE     =  32;                                   { Space           }
      CTRL_A    =   1;                                   { CTRL + A        }
      CTRL_B    =   2;                                   { CTRL + B        }
      CTRL_C    =   3;                                   { CTRL + C        }
      CTRL_D    =   4;                                   { CTRL + D        }
      CTRL_E    =   5;                                   { CTRL + E        }
      CTRL_F    =   6;                                   { CTRL + F        }
      CTRL_G    =   7;                                   { CTRL + G        }
      CTRL_H    =   8;                                   { CTRL + H        }
      CTRL_I    =   9;                                   { CTRL + I        }
      CTRL_J    =  10;                                   { CTRL + J        }
      CTRL_K    =  11;                                   { CTRL + K        }
      CTRL_L    =  12;                                   { CTRL + L        }
      CTRL_M    =  13;                                   { CTRL + M        }
      CTRL_N    =  14;                                   { CTRL + N        }
      CTRL_O    =  15;                                   { CTRL + O        }
      CTRL_P    =  16;                                   { CTRL + P        }
      CTRL_Q    =  17;                                   { CTRL + Q        }
      CTRL_R    =  18;                                   { CTRL + R        }
      CTRL_S    =  19;                                   { CTRL + S        }
      CTRL_T    =  20;                                   { CTRL + T        }
      CTRL_U    =  21;                                   { CTRL + U        }
      CTRL_V    =  22;                                   { CTRL + V        }
      CTRL_W    =  23;                                   { CTRL + W        }
      CTRL_X    =  24;                                   { CTRL + X        }
      CTRL_Y    =  25;                                   { CTRL + Y        }
      CTRL_Z    =  26;                                   { CTRL + Z        }
      BACKTAB   = 271;                                   { SHIFT + TAB     }
      ALT_Q     = 272;                                   { ALT + Q         }
      ALT_W     = 273;                                   { ALT + W         }
      ALT_E     = 274;                                   { ALT + E         }
      ALT_R     = 275;                                   { ALT + R         }
      ALT_T     = 276;                                   { ALT + T         }
      ALT_Y     = 277;                                   { ALT + Y         }
      ALT_U     = 278;                                   { ALT + U         }
      ALT_I     = 279;                                   { ALT + I         }
      ALT_O     = 280;                                   { ALT + O         }
      ALT_P     = 281;                                   { ALT + P         }
      ALT_A     = 286;                                   { ALT + A         }
      ALT_S     = 287;                                   { ALT + S         }
      ALT_D     = 288;                                   { ALT + D         }
      ALT_F     = 289;                                   { ALT + F         }
      ALT_G     = 290;                                   { ALT + G         }
      ALT_H     = 291;                                   { ALT + H         }
      ALT_J     = 292;                                   { ALT + J         }
      ALT_K     = 293;                                   { ALT + K         }
      ALT_L     = 294;                                   { ALT + L         }
      ALT_Z     = 300;                                   { ALT + Z         }
      ALT_X     = 301;                                   { ALT + X         }
      ALT_C     = 302;                                   { ALT + C         }
      ALT_V     = 303;                                   { ALT + V         }
      ALT_B     = 304;                                   { ALT + B         }
      ALT_N     = 305;                                   { ALT + N         }
      ALT_M     = 306;                                   { ALT + M         }
      F1        = 315;                                   { F1 key          }
      F2        = 316;                                   { F2 key          }
      F3        = 317;                                   { F3 key          }
      F4        = 318;                                   { F4 key          }
      F5        = 319;                                   { F5 key          }
      F6        = 320;                                   { F6 key          }
      F7        = 321;                                   { F7 key          }
      F8        = 322;                                   { F8 key          }
      F9        = 323;                                   { F9 key          }
      F10       = 324;                                   { F10 key         }
      CDOWN     = 336;                                   { Cursor Down     }
      CHOME     = 327;                                   { Cursor Home     }
      CUP       = 328;                                   { Cursor Up       }
      CPGUP     = 329;                                   { Page Up         }
      CLEFT     = 331;                                   { Cursor Left     }
      CRIGHT    = 333;                                   { Cursor Right    }
      CEND      = 335;                                   { Cursor Right    }
      CPGDN     = 337;                                   { Page Dn         }
      INSERTKEY = 338;                                   { INSERT key      }
      DELETEKEY = 339;                                   { DELETE key      }
      SHIFT_F1  = 340;                                   { SHIFT + F1      }
      SHIFT_F2  = 341;                                   { SHIFT + F2      }
      SHIFT_F3  = 342;                                   { SHIFT + F3      }
      SHIFT_F4  = 343;                                   { SHIFT + F4      }
      SHIFT_F5  = 344;                                   { SHIFT + F5      }
      SHIFT_F6  = 345;                                   { SHIFT + F6      }
      SHIFT_F7  = 346;                                   { SHIFT + F7      }
      SHIFT_F8  = 347;                                   { SHIFT + F8      }
      SHIFT_F9  = 348;                                   { SHIFT + F9      }
      SHIFT_F10 = 349;                                   { SHIFT + F10     }
      CTRL_F1   = 350;                                   { CTRL + F1       }
      CTRL_F2   = 351;                                   { CTRL + F2       }
      CTRL_F3   = 352;                                   { CTRL + F3       }
      CTRL_F4   = 353;                                   { CTRL + F4       }
      CTRL_F5   = 354;                                   { CTRL + F5       }
      CTRL_F6   = 355;                                   { CTRL + F6       }
      CTRL_F7   = 356;                                   { CTRL + F7       }
      CTRL_F8   = 357;                                   { CTRL + F8       }
      CTRL_F9   = 358;                                   { CTRL + F9       }
      CTRL_F10  = 359;                                   { CTRL + F10      }
      ALT_F1    = 360;                                   { ALT + F1        }
      ALT_F2    = 361;                                   { ALT + F2        }
      ALT_F3    = 362;                                   { ALT + F3        }
      ALT_F4    = 363;                                   { ALT + F4        }
      ALT_F5    = 364;                                   { ALT + F5        }
      ALT_F6    = 365;                                   { ALT + F6        }
      ALT_F7    = 366;                                   { ALT + F7        }
      ALT_F8    = 367;                                   { ALT + F8        }
      ALT_F9    = 368;                                   { ALT + F9        }
      ALT_F10   = 369;                                   { ALT + F10       }
      CTRL_LF   = 371;                                   { CTRL + Left     }
      CTRL_RI   = 372;                                   { CTRL + Right    }
      CTRL_PGDN = 374;                                   { CTRL + PgUp     }
      CTRL_HOME = 375;                                   { CTRL + Home     }
      ALT_1     = 376;                                   { ALT + 1         }
      ALT_2     = 377;                                   { ALT + 2         }
      ALT_3     = 378;                                   { ALT + 3         }
      ALT_4     = 379;                                   { ALT + 4         }
      ALT_5     = 380;                                   { ALT + 5         }
      ALT_6     = 381;                                   { ALT + 6         }
      ALT_7     = 382;                                   { ALT + 7         }
      ALT_8     = 383;                                   { ALT + 8         }
      ALT_9     = 384;                                   { ALT + 9         }
      ALT_0     = 385;                                   { ALT + 0         }
      CTRL_PGUP = 388;                                   { CTRL + PgUp     }

implementation

{$L kbma}                                  { add kbma.obj assembler module }

{== Internal constants ====================================================}

const NO_MSRANGE    = 255;                 { mouse pointer not in range xy }
      EVQ_LEN         = 100;           { length of mouse or keyboard queue }

{== Internal type declarations ============================================}

type  PTRREC   = record                        { used for access to the    }
                   Ofs : word;                 { elements of any mouse     }
                   Seg : word;                 { pointer                   }
                 end;

      PTRVREC  = record                           { used for access to the }
                   ScreenMask : word;             { elements of a PTRVIEW  }
                   PointrMask : word;
                 end;

      RNGBUF   = array [0..10000] of byte;                  { range buffer }

      RBPTR    = ^RNGBUF;                      { pointer to a range buffer }

      EVQUEUE = record                                 { an EvntCode queue }
                  Next,                            { pointer to next event }
                  Last  : integer;                 { pointer to last event }
                  Queue : array [1..EVQ_LEN] of EVENT;      { event buffer }
                end;

      EVQUEUEPTR  = ^EVQUEUE;                 { pointer to the event queue }

      EVHANDREC = record              { element in the event handler table }
                    Call    : boolean;                { handler installed? }
                    Handler : EVENTHANDLER;            { procedure pointer }
                  end;

{== Internal global variables =============================================}

var  NumRanges,                                         { number of ranges }
     TLine,                                         { number of text lines }
     TCol     : byte;                             { number of text columns }
     BufPtr   : RBPTR;               { pointer to range recognition buffer }
     CurRngPtr: RNGPTR;                  { pointer to current range vector }
     BLen     : integer;                    { range buffer length in bytes }
     ExitOld  : pointer;                   { pointer to old exit procedure }
     HandTab  : array [1..16] of EVHANDREC;    { table with event handlers }
                                               { for application program   }

     KbQueueP,                                 { queue for keyboard events }
     MouQueueP : EVQUEUEPTR;                      { queue for mouse events }

     OldKbHandler : pointer;                { address of old int09 handler }

     Time       : longint absolute $40:$6C;            { BIOS tick counter }
     BiosKbFlag : byte absolute $40:$17;              { BIOS keyboard flag }
     CurStatus  : byte;                          { current keyboard status }

{== Declarations of external functions ====================================}

{$F+}                                                { the function is FAR }
procedure NewMouHandler ; external ;                 { mouse event handler }
procedure NewKbHandler  ; external ;      { new keyboard handler (Int $09) }
{$F-}                                             { FAR functions disabled }

{**************************************************************************}
{*  KbmIGetIndex : uses an event mask to retrieve the corresponding index *}
{*                 from the event handler table                           *}
{**-----------------------------------------------------------------------*}
{*  Input  : MASK = the event mask                                        *}
{*  Output : Index between 1 and 16                                       *}
{**************************************************************************}

function KbmIGetIndex( Mask : word ) : byte ;

var i : byte;                                           { stores the index }

begin
  i := 1;
  while ( Mask <> 1 ) do                  { event bit still not in bit 0 ? }
    begin                                                             { No }
      Mask := Mask shr 1;                 { move mask one bit to the right }
      inc( i );                                          { increment index }
    end;
  KbmIGetIndex := i;                                        { return index }
end;

{**************************************************************************}
{*  KbmIBufFill: stores the range code for a mouse range in the internal  *}
{*               range buffer of this module                              *}
{**----------------------------------------------------------------------**}
{*  Input  : x1, y1 = upper left corner of the mouse range                *}
{*           x2, y2 = lower right corner of the mouse range               *}
{*           Code   = the range code                                      *}
{**************************************************************************}

procedure KbmIBufFill( x1, y1, x2, y2, Code : byte );

var Index   : integer;                   { points to field being processed }
    Column,                                                 { loop counter }
    Row     : byte;

begin
  for Row  :=y1 to y2 do                               { process each line }
    begin
      Index := Row * TCol + x1;                  { first index of the line }
      for Column:=x1 to x2 do            { process each column in the line }
        begin
          BufPtr^[ Index ] := Code;                            { save code }
          inc( Index );                          { set index to next field }
        end;
    end;
end;

{**************************************************************************}
{*  KbmIGetX: returns the text column where the mouse pointer is located  *}
{**----------------------------------------------------------------------**}
{*  Output : column of the mouse pointer relative to the text screen      *}
{**************************************************************************}

function KbmIGetX : byte;

var Regs : Registers;              { processor register for interrupt call }

begin
  Regs.AX := $0003;             { function number for "Get mouse position" }
  Intr( $33,  Regs );                                  { call mouse driver }
  KbmIGetX := Regs.CX shr 3;                   { compute and return column }
end;

{**************************************************************************}
{*  KbmIGetY: returns the text row where the mouse pointer is located     *}
{**----------------------------------------------------------------------**}
{*  Output : row of the mouse pointer, relative to the text screen        *}
{**************************************************************************}

function KbmIGetY : byte;

var Regs : Registers;              { processor register for interrupt call }

begin
  Regs.AX := $0003;             { function number for "Get mouse position" }
  Intr( $33, Regs );                                   { call mouse driver }
  KbmIGetY := Regs.DX shr 3;                      { compute and return row }
end;


{**************************************************************************}
{*  KbmPutQueue : adds an EVENT record to the end of an event queue       *}
{**-----------------------------------------------------------------------*}
{*  Input  : Qp    = pointer to the queue of interest                     *}
{*           EvRec = the EVENT record to be added to the queue            *}
{*  Info:    if there is no more room in the event queue, the procedure   *}
{*           overwrites the last event                                    *}
{**************************************************************************}

procedure KbmPutQueue( Qp : EVQUEUEPTR; EvRec : EVENT );

var NewLast : integer;                                    { new last entry }

begin
  with Qp^ do                                { process the specified queue }
    begin
      Queue[ Last ] := EvRec;                 { copy EVENT record to queue }
      NewLast := Last + 1;                      { number of new last entry }
      if ( NewLast > EVQ_LEN ) then          { wrap around to end of queue }
        NewLast := 1;
      if ( NewLast <> Next ) then                               { overflow }
        Last := NewLast;                              { no, set last entry }
    end;
end;

{**************************************************************************}
{*  KbmGetQueue : reads the next event from the mouse or keyboard queue   *}
{**-----------------------------------------------------------------------*}
{*  Input  : Qp    = pointer to the queue of interest                     *}
{*           EvRec = variable that stores and EVENT record                *}
{*  Info:    if no event is in the queue at the time of the function      *}
{*           call, the function returns the constant EV_NO_EVENT and      *}
{*           loads the Time field with the value MAXLONGINT               *}
{**************************************************************************}

procedure KbmGetQueue( Qp : EVQUEUEPTR; var EvRec : EVENT );

begin
  with Qp^ do                                { process the specified queue }
    begin
      if ( Next = Last ) then                         { no event in queue? }
        begin                                                         { No }
          EvRec.EvntCode := EV_NO_EVENT;                        { no event }
          EvRec.Time := MAXLONGINT;                         { invalid time }
        end
      else                    { there is at least one element in the queue }
        begin
          EvRec := Queue[ Next ];            { get EVENT record from queue }
          if ( Next = EVQ_LEN ) then Next := 1        { set EvNext to next }
                                else inc( Next );     { queue element      }
        end;
    end;
end;

{**************************************************************************}
{*  KbmPeekQueue : reads the next event from the mouse or keyboard queue  *}
{*                 without removing the event from the queue              *}
{**-----------------------------------------------------------------------*}
{*  Input  : Qp    = pointer to the queue of interest                     *}
{*           EvRec = variable that stores an event record                 *}
{*  Info:    if no event is in the queue when the function is called,     *}
{*           the function returns event type EV_NO_EVENT and loads the    *}
{*           Time field with the value MAXLONGINT                         *}
{**************************************************************************}

procedure KbmPeekQueue( Qp : EVQUEUEPTR; var EvRec : EVENT );

begin
  with Qp^ do                                { process the specified queue }
    begin
      if ( Next = Last ) then                   { no element in the queue? }
        begin                                                         { No }
          EvRec.EvntCode := EV_NO_EVENT;                        { no event }
          EvRec.Time := MAXLONGINT;                         { invalid time }
        end
      else                              { there is an element in the queue }
        EvRec := Queue[ Next ];              { get EVENT record from queue }
    end;
end;

{**************************************************************************}
{*  KbmGetEvent : reads next event                                        *}
{**-----------------------------------------------------------------------*}
{*  Input  : EvRec = variable taken on by event record                    *}
{*  Info:    if no event exists when KbmGetEvent is called, this procedure*}
{*           waits for the next event                                     *}
{**************************************************************************}

procedure KbmGetEvent( var EvRec : EVENT );

var MouEv,                               { event code from the mouse queue }
    KbEv : EVENT;                     { event code from the keyboard queue }

begin
  repeat           { read loop - waits for the occurrence of an event code }
    KbmPeekQueue( MouQueueP, MouEv );               { get mouse event code }
    KbmPeekQueue( KbQueueP, KbEv );              { get keyboard event code }
  until ( ( MouEv.EvntCode <> EV_NO_EVENT ) or
          ( KbEv.EvntCode  <> EV_NO_EVENT ) );

  if ( KbEv.Time <= MouEv.Time ) then        { early keyboard event code ? }
    KbmGetQueue( KbQueueP, EvRec )          { Yes, get keyboard event code }
  else                                          { No, get mouse event code }
    KbmGetQueue( MouQueueP, EvRec )
end;


{**************************************************************************}
{*  KbmPeekEvent : reads the next event from the event queue              *}
{**----------------------------------------------------------------------**}
{*  Input  : EvRec = variable from which the event record is taken        *}
{*  Info:    If no event exists when KbmPeekEvent is called, EV_NO_EVENT  *}
{*           is placed in the EVNTCODE array.                             *}
{**************************************************************************}

procedure KbmPeekEvent( var EvRec : EVENT );

var MouEv,                               { event code from the mouse queue }
    KbEv : EVENT;                     { event code from the keyboard queue }

begin
  KbmPeekQueue( MouQueueP, MouEv );                 { get mouse event code }
  KbmPeekQueue( KbQueueP, KbEv );                { get keyboard event code }

  if ( KbEv.Time <= MouEv.Time ) then         { early keyboard event code? }
    EvRec := KbEv                        { Yes, return keyboard event code }
  else                                       { No, return mouse event code }
    EvREc := MouEv;
end;

{**************************************************************************}
{*  KbHandler : called by the Int09 handler (NewKbHandler in the          *}
{*              assembler module) when a key is pressed                   *}
{**----------------------------------------------------------------------**}
{*  Input  : KbPort = code read from keyboard port $60                    *}
{**************************************************************************}

procedure KbHandler( KbPort : byte );

var EvRec  : EVENT;                           { EVENT record to be created }
    Regs   : Registers;                               { processor register }
    NewKbS : byte;                                   { new keyboard status }

begin
  EvRec.Time := Time;                                     { get clock time }
  Regs.AH := 1;                              { determine if a key has been }
  intr( $16, Regs );                         { converted to a key code     }
  if ( Regs.Flags and FZERO = 0 ) then
    begin                          { yes, character now in keyboard buffer }
      Regs.AH := 0;                         { load character from keyboard }
      intr( $16, Regs );                    { buffer via the BIOS          }
      if ( Regs.AL = 0 ) then EvRec.Key := Regs.AH + 256
                         else EvRec.Key := Regs.AL;
      EvRec.EvntCode := EV_KEY_PRESSED;                   { set event code }
      KbmPutQueue( KbQueueP, EvRec );               { place event in queue }
    end
  else                                    { keystroke produced no key code }
    begin
      NewKbS := BiosKbFlag;                   { get status of control keys }
      if ( CurStatus <> NewKbS ) then                     { status change? }
        begin
          if ( CurStatus < NewKbS ) then                  { was a bit set? }
            begin                                        { yes, save event }
              EvRec.StateKey := CurStatus xor NewKbS;       { isolate flag }
              if ( EvRec.StateKey <> KEY_INSERT ) then       { not INSERT? }
                begin                                   { no, create EVENT }
                  EvRec.EvntCode := EV_KEY_STATUS;
                  KbmPutQueue( KbQueueP, EvRec );     { put event in queue }
                end;
            end
        end
      else                                          { no, no status change }
        if ( KbPort < 128 ) then                              { make code? }
          begin                                        { yes, create event }
            EvRec.EvntCode := EV_KEY_UNKNOWN;               { unknown code }
            EvRec.ScanCode := KbPort;                     { pass scan code }
            EvRec.Status   := NewKbs;        { load status in EVENT record }
            KbmPutQueue( KbQueueP, EvRec );           { put event in queue }
          end;
      CurStatus := NewKbS;                     { store new keyboard status }
    end;
end;

{**************************************************************************}
{*  MouEventHandler: called by mouse driver via the assembler routine     *}
{*                   kbma when a mouse event occurs                       *}
{**----------------------------------------------------------------------**}
{*  Input  : EvFlags  = the event mask                                    *}
{*           ButState = current status of mouse buttons                   *}
{*           X, Y     = current position of mouse pointer in relation to  *}
{*                      the text screen                                   *}
{**************************************************************************}

procedure MouEventHandler( EvFlags, ButState, x, y : integer );

var NewC,                               { new coordinates of mouse pointer }
    NewR,                               { relative to new range            }
    NewRng : byte;                                { range number where the }
    EvData : EVENT;                               { new event occurred     }
    Ticks  : longint;                      { stores the current clock time }
    i,                                                      { loop counter }
    Mask   : integer;                                           { bit mask }

begin
  Ticks := Time;                                                { get time }
  NewRng  := BufPtr^[ y * TCol + x ];                          { get range }
  if ( NewRng = NO_MSRANGE ) then                              { no range? }
    begin                       { yes, coordinates relate to entire screen }
      NewR := y;
      NewC := x;
    end
  else              { no, coordinates relate to upper left corner of range }
    begin
      NewR := y - CurRngPtr^[ NewRng ].y1;
      NewC := x - CurRngPtr^[ NewRng ].x1;
    end;

  {-- capture each event separately as an EVENT record --------------------}

  Mask := 1;                                      { start with event bit 0 }
  with EvData do                                     { create event record }
    begin
      Time      := Ticks;                  { load data in the event record }
      Buttons   := ButState;
      Range   := NewRng;
      Rel_Row  := NewR;
      RelColumn := NewC;
      Abs_Row  := y;
      AbsColumn := x;
   end;

  for i:=0 to 4 do                            { look at each bit in EvFlag }
    begin
      if not((EvFlags and Mask = 0) or
             ((Mask = EV_MOU_MOVE) and ((x = CurX) and (y = CurY)))) then
        begin
         EvData.EvntCode := Mask;                       { store event code }
         KbmPutQueue( MouQueueP, EvData );     { put event record in queue }
       end;
      Mask := Mask shl 1;                         { process next event bit }
    end;

  {-- store new mouse data in global variables ----------------------------}

  CurX := x;                                          { new mouse position }
  CurY := y;
  CurBut := ButState;                      { store status of mouse buttons }
  CurRng := NewRng;                                { store new mouse range }
end;

{**************************************************************************}
{*  KbmEventWait: waits for the occurrence of a certain keyboard or mouse *}
{*                event                                                   *}
{**----------------------------------------------------------------------**}
{*  Input  : WAIT_EVENT = bit mask that specifies the desired event       *}
{*           EV_REC     = event record in which information on the event  *}
{*                        will be returned.                               *}
{*  Info:    - WAIT_EVENT can be specified by combining the various       *}
{*             event constants EV_MOU_MOVE, EV_LEFT_PRESS etc. with a     *}
{*             logical OR                                                 *}
{*           - the procedure will only return when one of the specified   *}
{*             events occurs. Non-specified events that occur in the      *}
{*             meantime are ignored                                       *}
{*           - this procedure can e called recursively, so that an event  *}
{*             handler can also access KbmEventWait.                      *}
{**************************************************************************}

procedure KbmEventWait( WaitEvent : integer; var EvRec : EVENT );

var CurEvent : EVENT;                     { stores the current event index }
    Index    : byte;                      { in the event handler table     }

begin
  repeat                                         { wait for specific event }
    KbmGetEvent( CurEvent );                              { get event code }

    {-- call handler of application program -------------------------------}

    Index := KbmIGetIndex( CurEvent.EvntCode );     { get index from table }
    if ( HandTab[ Index ].Call ) then                 { handler installed? }
     HandTab[ Index ].Handler( CurEvent );                     { yes, call }

  until ( CurEvent.EvntCode and WaitEvent <> 0 );
  EvRec := CurEvent;                       { pass event to calling routine }
end;

{**************************************************************************}
{*  KbmRegisterHandler : registers an application program's handler       *}
{*                       for a certain event                              *}
{**-----------------------------------------------------------------------*}
{*  Input  : EVENT   = the event mask                                     *}
{*           HANDLER = the handler to e called                            *}
{**************************************************************************}

procedure KbmRegisterHandler( Event : word; Handler : EVENTHANDLER );

var i : byte;                               { index in event handler table }

begin
  i := KbmIGetIndex( Event );                                  { get index }
  HandTab[ i ].Call := TRUE;                                { call handler }
  HandTab[ i ].Handler := Handler;              { store pointer to handler }
end;

{**************************************************************************}
{*  KbmDeRegisterHandler : removes an application program's handler for   *}
{*                         a certain event                                *}
{**-----------------------------------------------------------------------*}
{*  Input  : EVENT = the event mask                                       *}
{**************************************************************************}

procedure KbmDeRegisterHandler( Event : word );

begin
  HandTab[ KbmIGetIndex( Event ) ].Call := FALSE;       { do not call the  }
end;                                                    { handler any more }

{**************************************************************************}
{*  MouPtrMask: creates the pointer mask and screen mask from the bit     *}
{*              for the character and the color                           *}
{**----------------------------------------------------------------------**}
{*  Input  : Character = bit mask for pointer mask and screen mask        *}
{*                       character                                        *}
{*           Color     = bit mask for pointer mask and screen mask  color *}
{*  Output : pointer mask and screen mask as one value of type PTRVIEW    *}
{*  Info:    the constants PtrSameChar, PtrSameCol, PtrSameColB,          *}
{*           PtrInvCol and PtrInvColB as well as the results of the       *}
{*           functions PtrDifChar and PtrDifCol can be passed as the      *}
{*           color and character                                          *}
{**************************************************************************}

function MouPtrMask( Character, Color  : word ) : PTRVIEW;

var Mask : PTRVIEW;                { the pointer/screen mask to be created }

begin
  PTRVREC( Mask ).ScreenMask := ( ( Color and $ff ) shl 8 ) +
                                ( Character and $ff );
  PTRVREC( Mask ).PointrMask := ( Color and $ff00 ) + ( Character shr 8 );
  MouPtrMask := Mask;                     { return mask to calling routine }
end;

{**************************************************************************}
{*  PtrDifChar: creates the character component of the screen mask and    *}
{*              pointer mask                                              *}
{**----------------------------------------------------------------------**}
{*  Input  : ASCII code of the character to represent the mouse pointer   *}
{*  Output : pointer and screen masks for this character                  *}
{*  Info:    the result is further processed by the MouPtrMask procedure  *}
{**************************************************************************}

function PtrDifChar( Character : byte ) : word;

begin
  PtrDifChar := Character shl 8;
end;

{**************************************************************************}
{*  PtrDifCol: creates the color component of the pointer mask and screen *}
{*             mask                                                       *}
{**----------------------------------------------------------------------**}
{*  Input  : color of the character that will represent the mouse pointer *}
{*  Output : pointer and screen masks for this color                      *}
{*  Info:    the result is further processed by the MouPtrMask procedure  *}
{**************************************************************************}

function PtrDifCol( Color : byte ) : word;

begin
  PtrDifCol := Color shl 8;
end;

{**************************************************************************}
{*  MouDefinePtr: passes the pointer mask and screen mask to the mouse    *}
{*                driver, which then define the appearance of the mouse   *}
{*                pointer                                                 *}
{**----------------------------------------------------------------------**}
{*  Input  : Mask = the pointer mask and screen mask as one parameter of  *}
{*                  type PTRVIEW                                          *}
{*  Info:    - the parameter mask is created by the MouPtrMask procedure  *}
{*           - the upper 16 bits of Mask represents the screen mask,      *}
{*             the lower 16 bits represent the pointer mask               *}
{**************************************************************************}

procedure MouDefinePtr( Mask : PTRVIEW );

var Regs : Registers;              { processor register for interrupt call }

begin
  Regs.AX := $000a;          { function number for "Set text pointer type" }
  Regs.BX := 0;                                  { create software pointer }
  Regs.CX := PTRVREC( Mask ).ScreenMask;            { low word is AND mask }
  Regs.DX := PTRVREC( Mask ).PointrMask;           { high word is XOR mask }
  Intr( $33, Regs);                                    { call mouse driver }
end;

{**************************************************************************}
{*  MouDefRange:   enables the assignment of different screen ranges      *}
{*                 which can be recognized as mouse ranges                *}
{**----------------------------------------------------------------------**}
{*  Input  : Amount = number of the screen range                          *}
{*           BPtr   = pointer to the array describing the ranges as a     *}
{*                    structure of type MSRANGE                           *}
{*  Info:    - the free remaining screen ranges are assigned the code     *}
{*             NO_MSRANGE                                                 *}
{**************************************************************************}

procedure MouDefRange( Amount : byte; BPtr : RNGPTR );

var CurRng,                                  { number of the current range }
    Range : byte;                                           { loop counter }

begin
  CurRngPtr := BPtr;                          { mark pointer to vector and }
  NumRanges := Amount;                        { number of ranges           }
  FillChar( BufPtr^, BLen, NO_MSRANGE );       { all elements = NO_MSRANGE }
  for Range:=0 to amount-1 do                  { process individual ranges }
   with BPtr^[ Range ] do
     KbmIBufFill( x1, y1, x2, y2, Range );

  CurRng := BufPtr^[ CurY * TCol + CurX ];            { send current range }
end;

{**************************************************************************}
{*  MouShowMouse: makes mouse pointer visible on the screen               *}
{**----------------------------------------------------------------------**}
{*  Info: calls to MouShowMouse and MouHideMouse must be balanced         *}
{**************************************************************************}

procedure MouShowMouse;

var Regs : Registers;              { processor register for interrupt call }

begin
  Regs.AX := $0001;                     { function number for "Show Mouse" }
  Intr( $33, Regs );                                   { call mouse driver }
end;

{**************************************************************************}
{*  MouHideMouse: remove the mouse pointer from the screen                *}
{**----------------------------------------------------------------------**}
{*  Info: calls to MouShowMouse and MouHideMouse must be balanced         *}
{**************************************************************************}

procedure MouHideMouse;

var Regs : Registers;              { processor register for interrupt call }

begin
  Regs.AX := $0002;                     { function number for "Hide Mouse" }
  Intr( $33, Regs);                                    { call mouse driver }
end;

{**************************************************************************}
{*  MouSetMoveArea: set the area in which the mouse can move              *}
{**----------------------------------------------------------------------**}
{*  Input  :  x1, y1 = coordinates of the upper left corner of the range  *}
{*            x2, y2 = coordinates of the lower right corner of the range *}
{*  Info:    - these coordinates relate to the text screen and not to the *}
{*             virtual graphics screen of the mouse driver                *}
{**************************************************************************}

procedure MouSetMoveArea( x1, y1, x2, y2 : byte );

var Regs : Registers;              { processor register for interrupt call }

begin
  Regs.AX := $0008;            { function number for "Set vertical limits" }
  Regs.CX := integer( y1 ) shl 3;                     { convert to virtual }
  Regs.DX := integer( y2 ) shl 3;                     { mouse screen       }
  Intr( $33, Regs );                                   { call mouse driver }
  Regs.AX := $0007;          { function number for "Set horizontal limits" }
  Regs.CX := integer( x1 ) shl 3;                     { convert to virtual }
  Regs.DX := integer( x2 ) shl 3;                     { mouse screen       }
  Intr( $33, Regs );                                   { call mouse driver }
end;

{**************************************************************************}
{*  MouSetSpeed: set the relationship between mouse movement and the      *}
{*               resulting movement of the mouse pointer                  *}
{**----------------------------------------------------------------------**}
{*  Input  : XSpeed = speed in X direction                                *}
{*           YSpeed = speed in Y direction                                *}
{*  Info:    - both parameters are expressed in Mickeys (8 pixels)        *}
{**************************************************************************}

procedure MouSetSpeed( XSpeed, YSpeed : integer );

var Regs : Registers;              { processor register for interrupt call }

begin
  Regs.AX := $000f;     { function number for "Set mickeys to pixel ratio" }
  Regs.CX := XSpeed;
  Regs.DX := YSpeed;
  Intr( $33, Regs);                                    { call mouse driver }
end;

{**************************************************************************}
{*  MouMovePtr: moves the mouse pointer to a new screen position          *}
{**----------------------------------------------------------------------**}
{*  Input  : COL = the new screen column of the mouse pointer             *}
{*           ROW = the new screen row of the mouse pointer                *}
{*  Info:    - the coordinates relate to the text screen and not to the   *}
{*             virtual graphics screen of the mouse driver                *}
{**************************************************************************}

procedure MouMovePtr( Col, Row : byte );

var Regs   : Registers;            { processor register for interrupt call }
    NewRng : byte;                                { range to move mouse to }

begin
  Regs.AX := $0004;     { function number for "Set mouse pointer position" }
  CurX := col;                                       { store coordinates   }
  CurY := row;                                       { in global variables }
  Regs.CX := integer( col ) shl 3;             { convert coordinates and   }
  Regs.DX := integer( row ) shl 3;             { store in global variables }
  Intr( $33, Regs );                                   { call mouse driver }

  CurRng := BufPtr^[ Row * TCol + Col ];                   { get new range }
end;

{**************************************************************************}
{*  KbmReleaseMode : clears one of the keyboard modes (SCROLL LOCK,       *}
{*                   NUM LOCK or CAPS LOCK)                               *}
{**-----------------------------------------------------------------------*}
{*  Input  : KMode = one of the codes KEY_SCROLL_LOCK, KEY_CAPS_LOCK or   *}
{*                   KEY_NUM_LCOK                                         *}
{*  Info   : on ATs and 386 machines, this procedure automatically        *}
{*           updates the keyboard LEDs to reflect the status change -     *}
{*           this does not work on XTs                                    *}
{**************************************************************************}

procedure KbmReleaseMode( KMode : byte  );

var Regs : Registers;              { processor register for interrupt call }

begin
  BiosKbFlag := BiosKbFlag and ( KMode xor $FF );              { clear bit }
  Regs.AH := $02;                        { query BIOS keyboard status so   }
  intr( $16, Regs );                     { BIOS recognizes the mode change }
end;

{**************************************************************************}
{*  KbmSetMode : turns on one of the keyboard modes (SCROLL LOCK,         *}
{*               NUM LOCK or CAPS LOCK)                                   *}
{**-----------------------------------------------------------------------*}
{*  Input  : KMode = one of the codes KEY_SCROLL_LOCK, KEY_CAPS_LOCK or   *}
{*                   KEY_NUM_LCOK                                         *}
{*  Info   : on At and 386 machines, this procedure also updates the      *}
{*           keyboard LEDs to reflect the mode change -                   *}
{*           this does not work on XTs                                    *}
{**************************************************************************}

procedure KbmSetMode( KMode : byte  );

var Regs : Registers;              { processor register for interrupt call }

begin
  BiosKbFlag := BiosKbFlag or KMode;                             { set bit }
  Regs.AH := $02;                        { query BIOS keyboard status so   }
  intr( $16, Regs );                     { BIOS recognizes the mode change }
end;

{**************************************************************************}
{*  KbmEnd: called to end use of the functions and procedures of the      *}
{*          mouse module                                                  *}
{**----------------------------------------------------------------------**}
{*  Info:   - this procedure does not have to be explicitly called from   *}
{*            the application program since the procedure KbmInit defines *}
{*            it as the Exit procedure                                    *}
{**************************************************************************}

{$F+}                         { must be FAR to be called as Exit procedure }

procedure KbmEnd;

var Regs : Registers;              { processor register for interrupt call }

begin
  MouHideMouse;                           { hide mouse pointer from screen }
  Regs.AX := 0;                                       { reset mouse driver }
  Intr( $33, Regs);                                    { call mouse driver }

  Dispose( KbQueueP );                         { dispose of keyboard queue }
  Dispose( MouQueueP );                           { dispose of mouse queue }

  FreeMem( BufPtr, BLen );                         { free allocated memory }
  SetIntVec( $09, OldKBHandler );           { restore old keyboard handler }
  ExitProc := ExitOld;                     { re-install old exit procedure }
end;

{$F-}                                              { disable FAR procedure }

{**************************************************************************}
{*  KbmInit: initialization procedure                                     *}
{**------------------------------------------------------------------------}
{*  Input  : Columns = number of screen columns                           *}
{*           Lines_  = number of screen lines                             *}
{**************************************************************************}

procedure KbmInit( Columns, Lines_ : byte );

var Regs   : Registers;            { processor register for interrupt call }
    i      : byte;                      { loop counter as index in HandTab }

begin

  {-- install new keyboard handler ----------------------------------------}

  CurStatus := BiosKbFlag;                     { load BIOS keyboard status }

  GetIntVec( $09, OldKBHandler );         { Get address of int 09h handler }
  SetIntVec( $09, @NewKbHandler );                   { install new handler }

  TLine := Lines_;                           { Store number of columns and }
  TCol  := Columns;                          { rows in global variables    }

  {-- allocate and fill buffer for mouse range ----------------------------}

  BLen := TLine * TCol;                   { number of characters on screen }
  GetMem( BufPtr, BLen );                 { allocate internal range buffer }
  KbmIBufFill( 0, 0, TCol-1, TLine-1, NO_MSRANGE );

  Regs.AX := 0;                                  { initialize mouse driver }
  Intr( $33, Regs );                                   { call mouse driver }
  MouAvail := ( Regs.AX = $ffff );                      { mouse available? }

  CurRng := NO_MSRANGE;                        { mouse pointer in no range }
  CurX   := TCol + 1;                        { position outside the screen }

  {-- configure and initialize mouse and keyboard queue -------------------}

  New( KbQueueP );                                 { create keyboard queue }
  KbQueueP^.Next := 1;                       { still no event in the queue }
  KbQueueP^.Last := 1;

  New( MouQueueP );                                   { create mouse queue }
  MouQueueP^.Next := 1;                      { still no event in the queue }
  MouQueueP^.Last := 1;

  for i := 1 to 16 do              { still no user event handler installed }
   HandTab[ i ].Call := FALSE;

  if ( MouAvail ) then                       { is there a mouse installed? }
    begin                                                            { Yes }
      MouSetMoveArea( 0, 0, TCol-1, TLine-1 );     { set range of movement }

      CurX     := KbmIGetX;                  { load current mouse position }
      CurY     := KbmIGetY;                  { in global variables         }

      {-- install NewMouHandler mouse event handler  ----------------------}

      Regs.AX := $000C;          { function number for "Set Mouse Handler" }
      Regs.CX := EV_MOU_ALL;                             { load event mask }
      Regs.DX := Ofs( NewMouHandler );         { offset address of handler }
      Regs.ES := Seg( NewMouHandler );        { segment address of handler }
      Intr( $33,  Regs );                              { call mouse driver }
    end;
end;

{**----------------------------------------------------------------------**}
{** Starting code of unit                                                **}
{**----------------------------------------------------------------------**}

begin
  KbmInit( 80, 25 );                            { initialize unit }
  ExitOld := ExitProc;                    { mark address of Exit procedure }
  ExitProc := @KbmEnd;                   { define KbmEnd as Exit procedure }
end.

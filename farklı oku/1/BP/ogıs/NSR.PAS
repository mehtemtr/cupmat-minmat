unit Nsr;

interface
uses Crt,Dos, StrIn;
const
      FORMFEED = #12;
      CTRLLEFTKEY = #243;
      CTRLRIGHTKEY = #244;
      NULL     =   #0;
      BEL      =   #7;                                   { Bell character  }
      BS       =   #8;                                   { Backspace key   }
      TAB      =   #9;                                   { Tab key         }
      LF       =  #10;                                   { Linefeed        }
      CR       =  #13;                                   { Return key      }
      ESC      =  #27;                                   { Escape key      }
      SPACE    =  #32;                                   { Space           }
      CTRL_A   =   #1;                                   { CTRL + A        }
      CTRL_B   =   #2;                                   { CTRL + B        }
      CTRL_C   =   #3;                                   { CTRL + C        }
      CTRL_D   =   #4;                                   { CTRL + D        }
      CTRL_E   =   #5;                                   { CTRL + E        }
      CTRL_F   =   #6;                                   { CTRL + F        }
      CTRL_G   =   #7;                                   { CTRL + G        }
      CTRL_H   =   #8;                                   { CTRL + H        }
      CTRL_I   =   #9;                                   { CTRL + I        }
      CTRL_J   =  #10;                                   { CTRL + J        }
      CTRL_K   =  #11;                                   { CTRL + K        }
      CTRL_L   =  #12;                                   { CTRL + L        }
      CTRL_M   =  #13;                                   { CTRL + M        }
      CTRL_N   =  #14;                                   { CTRL + N        }
      CTRL_O   =  #15;                                   { CTRL + O        }
      CTRL_P   =  #16;                                   { CTRL + P        }
      CTRL_Q   =  #17;                                   { CTRL + Q        }
      CTRL_R   =  #18;                                   { CTRL + R        }
      CTRL_S   =  #19;                                   { CTRL + S        }
      CTRL_T   =  #20;                                   { CTRL + T        }
      CTRL_U   =  #21;                                   { CTRL + U        }
      CTRL_V   =  #22;                                   { CTRL + V        }
      CTRL_W   =  #23;                                   { CTRL + W        }
      CTRL_X   =  #24;                                   { CTRL + X        }
      CTRL_Y   =  #25;                                   { CTRL + Y        }
      CTRL_Z   =  #26;                                   { CTRL + Z        }
      BACKTAB  = #143;                                   { SHifT + TAB     }
      ALT_Q    = #144;                                   { ALT + Q         }
      ALT_W    = #145;                                   { ALT + W         }
      ALT_E    = #146;                                   { ALT + E         }
      ALT_R    = #147;                                   { ALT + R         }
      ALT_T    = #148;                                   { ALT + T         }
      ALT_Y    = #149;                                   { ALT + Y         }
      ALT_U    = #150;                                   { ALT + U         }
      ALT_I    = #151;                                   { ALT + I         }
      ALT_O    = #152;                                   { ALT + O         }
      ALT_P    = #153;                                   { ALT + P         }
      ALT_A    = #158;                                   { ALT + A         }
      ALT_S    = #159;                                   { ALT + S         }
      ALT_D    = #160;                                   { ALT + D         }
      ALT_F    = #161;                                   { ALT + F         }
      ALT_G    = #162;                                   { ALT + G         }
      ALT_H    = #163;                                   { ALT + H         }
      ALT_J    = #164;                                   { ALT + J         }
      ALT_K    = #165;                                   { ALT + K         }
      ALT_L    = #166;                                   { ALT + L         }
      ALT_Z    = #172;                                   { ALT + Z         }
      ALT_X    = #173;                                   { ALT + X         }
      ALT_C    = #174;                                   { ALT + C         }
      ALT_V    = #175;                                   { ALT + V         }
      ALT_B    = #176;                                   { ALT + B         }
      ALT_N    = #177;                                   { ALT + N         }
      ALT_M    = #178;                                   { ALT + M         }
      F1       = #187;                                   { F1 key          }
      F2       = #188;                                   { F2 key          }
      F3       = #189;                                   { F3 key          }
      F4       = #190;                                   { F4 key          }
      F5       = #191;                                   { F5 key          }
      F6       = #192;                                   { F6 key          }
      F7       = #193;                                   { F7 key          }
      F8       = #194;                                   { F8 key          }
      F9       = #195;                                   { F9 key          }
      F10      = #196;                                   { F10 key         }
      DOWNKEY  = #208;                                   { Cursor Down     }
      HOMEKEY  = #199;                                   { Cursor Home     }
      UPKEY    = #200;                                   { Cursor Up       }
      PGUPKEY  = #201;                                   { Page Up         }
      LEFTKEY  = #203;                                   { Cursor Left     }
      RIGHTKEY = #205;                                   { Cursor Right    }
      ENDKEY   = #207;                                   { Cursor Right    }
      PGDNKEY  = #209;                                   { Page Dn         }
      INSKEY   = #210;                                   { Insert key      }
      DELKEY   = #211;                                   { DELETE key      }
      SHifT_F1 = #212;                                   { SHifT + F1      }
      SHifT_F2 = #213;                                   { SHifT + F2      }
      SHifT_F3 = #214;                                   { SHifT + F3      }
      SHifT_F4 = #215;                                   { SHifT + F4      }
      SHifT_F5 = #216;                                   { SHifT + F5      }
      SHifT_F6 = #217;                                   { SHifT + F6      }
      SHifT_F7 = #218;                                   { SHifT + F7      }
      SHifT_F8 = #219;                                   { SHifT + F8      }
      SHifT_F9 = #220;                                   { SHifT + F9      }
      SHifT_F10= #221;                                   { SHifT + F10     }
      CTRL_F1  = #222;                                   { CTRL + F1       }
      CTRL_F2  = #223;                                   { CTRL + F2       }
      CTRL_F3  = #224;                                   { CTRL + F3       }
      CTRL_F4  = #225;                                   { CTRL + F4       }
      CTRL_F5  = #226;                                   { CTRL + F5       }
      CTRL_F6  = #227;                                   { CTRL + F6       }
      CTRL_F7  = #228;                                   { CTRL + F7       }
      CTRL_F8  = #229;                                   { CTRL + F8       }
      CTRL_F9  = #230;                                   { CTRL + F9       }
      CTRL_F10 = #231;                                   { CTRL + F10      }
      ALT_F1   = #232;                                   { ALT + F1        }
      ALT_F2   = #233;                                   { ALT + F2        }
      ALT_F3   = #234;                                   { ALT + F3        }
      ALT_F4   = #235;                                   { ALT + F4        }
      ALT_F5   = #236;                                   { ALT + F5        }
      ALT_F6   = #237;                                   { ALT + F6        }
      ALT_F7   = #238;                                   { ALT + F7        }
      ALT_F8   = #239;                                   { ALT + F8        }
      ALT_F9   = #240;                                   { ALT + F9        }
      ALT_F10  = #241;                                   { ALT + F10       }
      CTRL_LF  = #243;                                   { CTRL + Left     }
      CTRL_RI  = #244;                                   { CTRL + Right    }
      CTRL_PGDN= #246;                                   { CTRL + PgUp     }
      CTRL_HOME= #247;                                   { CTRL + Home     }
      ALT_1    = #248;                                   { ALT + 1         }
      ALT_2    = #249;                                   { ALT + 2         }
      ALT_3    = #250;                                   { ALT + 3         }
      ALT_4    = #251;                                   { ALT + 4         }
      ALT_5    = #252;                                   { ALT + 5         }
      ALT_6    = #253;                                   { ALT + 6         }
      ALT_7    = #254;                                   { ALT + 7         }
      ALT_8    = #255;                                   { ALT + 8         }

      ALFABESTR:STRING =' !"#$%&'#39'()*+,-./0123456789:;<=>?ABC€DEFG¦HI˜JKLMNO™PQRSžTUšVWXYZ';

    MaxTab = 10;
    MesWinX1=24;
    MesWinY1=10;
    MesWinX2=54;
    MesWinY2=15;


   Delimeters   : String='@();&';
   CizChar ='Ä';

   NumericSet =['0'..'9','.'];

   HiliteAttr   = White     + 16*Black;
   NormalAttr   = LightGray + 16*Black;
   InverseAttr  = Black     + 16*LightGray;
   TitleColor   : Byte = InverseAttr;
   ValueColor   : Byte = NormalAttr;
   CmdColor     : Byte = InverseAttr;
   MenuBarColor : Byte = NormalAttr;
   SelectColor  : Byte = InverseAttr;
   ErrorColor   : Byte = InverseAttr;
   MenuSelectColor:Byte = InverseAttr;
   MenuSelHilite: Byte = HiLiteAttr;
   FieldTitColor:Byte = InverseAttr;
   GirisColor   :Byte = NormalAttr;

   AllKar   = [#32..#127, 'ž','š','™','€','¦','˜'];
   MaxWindow = 10;

type

  TitleStrPtr = ^TitleStr;
  TitleStr    = string[78];
  FrameChars = array[1..8] of Char;
const

  Frame: FrameChars = 'ÚÄ¿³³ÀÄÙ';

  type


  WinRecPtr = ^WinRec;
  WinRec = Record
    Title            : TitleStrPtr;
    CurX, CurY       : Byte;        { The Cursor position under }
    Buffer           : Pointer;     { The image under it }
    WMin, WMax       : Word;        { The WindMin and Wind Max under }
    TAttr            : Byte;        { Text Attr under}
    Framed           : Boolean;     { Is Window framed ? }
end;
var
  WindStack  :  Array[0..MaxWindow] of WinRecPtr;
  WindSP     : Word;





type
  WinState = record
    WindMin, WindMax: Word;
    WhereX, WhereY: Byte;
    TextAttr: Byte;
  end;

const

{ Standard frame character sets }

  SingleFrame: FrameChars = 'ÚÄ¿³³ÀÄÙ';
  DoubleFrame: FrameChars = 'ÉÍ»ººÈÍ¼';

   Spacing=4;
   MaxMenu = 100;


  Type

    CharSet    = Set of Char;
    ByteSet    = Set of Byte;

    TabType    = Array[1..MaxTab+1] of Byte;

    ProcType = Procedure;
    MenuName = String[25];
    BoxType = record
	X1, Y1, X2, Y2 : Byte
   end;

   MenuType=record
	Name    : MenuName;
	Row     : Byte;
	HotKey  : Char;
	LitChar : Char;
	Cmd     : Byte;
	Father  : Byte;
	Son     : Byte;
	Next    : Byte;
	Prev    : Byte;
	Box     : BoxType
     end;

     EditForm = record
       FieldSay : BYTE;
       FieldLen, FieldKol : ARRAY[1..10] OF BYTE;
   end;

   VAR
    Menu         : Array[1..MaxMenu] of MenuType;
    MenuSay      : Byte;
    L            : Byte;
    MenuBar      : Byte;
    MainCharSet  : CharSet;
    HotKeySet    : CharSet;
    ActiveMenuSet: Set of Byte;
    EventKey     : Byte;
    Event        : Array [Byte] of ProcType;

    WMax, WMin   : Word;
    WX,WY        : Byte;
    TAttr        : Byte;
    Term         : CharSet;
    TermStack    : Array[1..MaxWindow] of CharSet;
    CmdStack     : Array[1..MaxWindow] of ByteSet;
    TermSP       : Word;

    Form     : Editform;
    EdStack  : Array[1..MaxWindow] of EditForm;
    EdSP     : Word;

  procedure WriteStr(X, Y: Byte; S: String; Attr: Byte);
  procedure WriteChar(X, Y, Count: Byte; Ch: Char; Attr: Byte);
  procedure FillWin(Ch: Char; Attr: Byte);
  procedure WriteWin(var Buf);
  procedure ReadWin(var Buf);
  function  WinSize: Word;
  procedure FrameWin;
  procedure UnFrameWin;
  Procedure OpenWindow(X1, Y1, X2, Y2: Byte; T: TitleStr; TxtAt : Byte; FrameIt : Boolean);
  procedure CloseWindow;
  procedure Initilize;
  Function  WinLastRow:Word;
  Function  WinLastCol:Word;

  Function StrToReal(S:String):Real;
  Function StrToInt(S:String):Word;
  Function RealToStr(X:Real;Width,Decimal:Byte):String;
  Function IntToStr(K:Word; Width:Byte):String;

  Procedure SaveWinInfo;
  Procedure PrevWin;
  Procedure RestoreWinInfo;
  Procedure NormalWindow;

  Procedure SplitPrint(X, Y : Byte; S : String; Attr : Byte);
  Procedure PromptCmdLine(S:String);

  Procedure HideCursor;
  Procedure ShowCursor;

  Procedure EdTit(Var S, A : String);
  Procedure OpenEditWindow( Title, EdT, CmdLn:String;
			    CmdSet:CharSet; ComSet:ByteSet;
			    FirstRow, MaxEntry : Word);


  Procedure OpenSplitWindow( Title, EdT, CmdLn:String;
			     CmdSet:CharSet; ComSet:ByteSet);

  Procedure CloseEdit;

 {KeyBoard Routines}

  Function GetKey2 : Char;
  Function getKeyCmd:Char;

  Function GetDesiredKey(T : CharSet):Char;
  Function Evet   : Boolean;

  Function Spaces(Num : Word) : String;
  Function ConstStr(C : Char ; Num : Byte) : String;

  Procedure Beep;

  Procedure ScrollUpWin;
  Procedure ScrollDownWin;
  Function InvColor(Attr : Byte) : Byte;


  Procedure  Complain( S : String);
  Procedure Bekleyiniz( S : String);

  Procedure Message( Title, S: String; TRMSET : CharSet ; Var TC : Char);

  Function UpperCase(S : String) : String;

  Procedure InputStr(Var S : String;
		   X,Y,L : Byte;
		   Exact : Boolean;
		   Target: CharSet;
		   NumLen :Byte;
		Var TC   : Char);


   Procedure PadL(Var S: String; Len : Integer; C : Char);
   Function  YilStr(Y:Word; Z:Byte):String;
   Procedure EnableTerm(T : CharSet; L : ByteSet);
   Procedure DisableTerm;

   Function Max(A, B : Word) : Word;
   Function Min(A, B : Word) : Word;

   Function  AddMenu(C:MenuName; HKey:Char; Comd : Byte; E:ProcType; S, B :Byte):Byte;
   Procedure LinkMenu(F, K : Byte);
   Procedure DefineMainBox(K : Byte);
   Procedure ShowMenuBar(T:Byte);
   Procedure DoEvent(Var EvKey : Byte);
   Function  HotKeyEvent(TC:Char; K : Byte):Byte;


   Procedure OpenForm( Title, EdT, CmdLn:String;
		       CmdSet:CharSet; ComSet : ByteSet;
		       FirstRow:Byte);

 Procedure  GetTarih(Kolon, Row : Byte; Var Tarih : String; Var TC:Char);

implementation

Function HotKeyEvent(TC:Char; K : Byte):Byte;
Var L, B : Byte;
begin
    B:=0;
    L:=K;
    HotKeyEvent:=0;
    if (MenuSay=0) or (K=0) then exit;
    Repeat
	With Menu[L] do begin
	  If TC = HotKey then B:=Cmd;
	  If (B=0) and (Son<>0) then
	     B:=HotKeyEvent(TC, Son);
	  L:=Next
	end;
    until (B<>0) or (L=K);
    HotKeyEvent:=B;
end;
Procedure SelChar(Var TC:Char; Var K : Byte);
Var L : Byte;
begin
    L:=K;
    Repeat
	With Menu[L] do begin
	  If TC = LitChar then begin
	     TC:=CR;
	     K:=L
	  end else
	    L:=Next
	end;
    until L=K;
end;
Function AddMenu(C:MenuName; HKey:Char; Comd : Byte; E:ProcType; S, B :Byte):Byte;
Var K : Byte;
begin
    Inc(MenuSay);
    With Menu[MenuSay] do begin
       Name:=C; Cmd:=Comd;
       K:=Pos('~',Name);
       If K=0 then
	  LitChar:=Name[1]
       else begin
	  LitChar:=Name[K+1];
	  Delete(Name,K,1)
       end;
       Son:=S;
       Next:=B;
       Event[Cmd]:=E;
       HotKey:=HKey;
       If HKey<>NULL then HotKeySet:=HotKeySet+[HKey];
       ActiveMenuSet:=ActiveMenuSet+[Cmd];
    end;
    AddMenu:=MenuSay
end;
Procedure LinkMenu(F, K : Byte);
Var L, R : Byte;
begin
    L:=K;
       While L<>0 do begin
	 With Menu[L] do begin
	    R:=L;Father:=F;L:=Next;
	 end;
	 If L<>0 then Menu[L].Prev:=R;
       end;
    Menu[K].Prev:=R; Menu[R].Next:=K;
    L:=K;
       Repeat
	   R:=Menu[L].Son;
	   If R<>0 then LinkMenu(L,R);
	   L:=Menu[L].Next;
       Until L=K
end;
Procedure LenSubSay(K:Byte; Var Len, N : Byte);
Var L, R : Byte;
begin
    N:=0; Len:=0; L:=K;
    Repeat
	Inc(N);
	With Menu[L] do begin
	    R:=Length(Name);
	    If R>Len then Len:=R;
	    L:=Next
	end;
    Until L=K
end;

Procedure DefineSubBox(K, X, Y : Byte);
Var L, Len, N, T : Byte;
begin
    L:=K; Inc(X); T:=1;
    Repeat
       With Menu[L] do begin
	 If Son = 0 then begin
	    Len:=Length(Name);
	    N:=0
	 end else  LenSubSay(Son,Len,N);
	  With Box do begin
	     X1:=X;
	     Row:=T;
	     Y1:=Y+Row+1;
	     X2:=X1+Len+1;
	     Y2:=Y1+N+1;
	     If Son<>0 then DefineSubBox(Son,X1, Y1);
	     Inc(T);
	 end;
	 L:=Next
       end;
    until L=K
end;
Procedure DefineMainBox(K : Byte);
Var L, R, Len, N, X, Y : Byte;
begin
    L:=K; X:=Spacing+1; Y:=2;
    Repeat
       With Menu[L] do begin
	 MainCharSet:=MainCharSet+[HotKey];
	 If Son = 0 then begin
	    Len:=Length(Name);
	    N:=0
	 end else  LenSubSay(Son,Len,N);
	  With Box do begin
	     X1:=X;
	     Y1:=2;
	     Row:=1;
	     X2:=X+Len+1;
	     Y2:=Y+N+1;
	     if Son<>0 then DefineSubBox(Son, X, Y);
	     X:=X1+Spacing+Length(Menu[L].Name);
	 end;
	 L:=Next
       end;
    until L=K;
    ActiveMenuSet:=ActiveMenuSet;
end;
Procedure ShowMenuName(R : Byte; Selecting : Boolean);
Var I, J, X, Color : Byte;
    S : String;
    ShowIt:Boolean;
begin
    ShowIt:=True;
    If not Selecting then Color:=MenuBarColor else Color:=MenuSelectColor;
    With Menu[R] do begin
       X:=Length(Name);
       If Father = 0 then begin
	  J:=Box.X1;
          S:=Name;
       end
       else begin
	  J:=1;
	  X:=Menu[Father].Box.X2-Menu[Father].Box.X1-1;
          S:=Name+Spaces(X-Length(Name));
          If Not (Cmd in ActiveMenuSet) then begin
             S:=Spaces(Length(S));
             ShowIt:=False
          end;
       end;
       WriteStr(J,Row,S,Color);
       If selecting Or Not ShowIt then exit;
       I:=Pos(LitChar,Name);
       WriteChar(J+I-1,Row,1, LitChar, MenuSelHilite);
    end;
end;
Procedure ShowMenu(K:Byte);
Var L, R , I : Byte;
begin
  With Menu[K].Box do
       OpenWindow(X1, Y1, X2, Y2,'',MenuBarColor, True);
    L:=Menu[K].Son;R:=L;
    Repeat
	ShowMenuName(R, False);
	R:=Menu[R].Next;
    Until R=L
  end;
Procedure ShowMenuBar(T:Byte);
Var L, R : Byte;
begin
  SaveWinInfo;
  NormalWindow;
  WriteStr(1,1,Spaces(80), MenuBarColor);
  L:=MenuBar;R:=L;
    Repeat
	if R<>T then ShowMenuName(R, False) else ShowMenuName(R, True);
	R:=Menu[R].Next;
    Until R=L;
   RestoreWinInfo;
 end;

Function SelectMenu(K:Byte; Var HK : Char):Byte;
Var L, R, SL : Byte;
    TC : Char;
    Stop:Boolean;

begin
    If Menu[K].Father=0 then ShowMenuBar(K);
    SL:=0; Stop:=False;
    ShowMenu(K);
    R:=Menu[K].Son;
    HideCursor;
    Repeat
	With Menu[R] do begin
	  ShowMenuName(R, True);
	  TC:=GetKey2;
	  ShowMenuName(R, False);
	  SL:=HotKeyEvent(TC,R);
	  If SL<>0 then begin
	     Stop:=True;
	     TC:=NULL;
	     HK:=HotKey;
	  end;
	  SelChar(TC,R);
	  Case TC of
	     ESC    : begin
			 Stop:=True;SL:=0;HK:=NULL;
		      end;
	     UPKey   : R:=Prev;
	     DownKey : R:=Next;
	     LeftKey : If Menu[K].Father=0 then begin
			  SL:=255;HK:=NULL;
			  Stop:=True;
		       end;
	     RightKey: If Menu[K].Father=0 then begin
			  SL:=254;HK:=NULL;
			  Stop:=True;
		       end;
	     CR      : begin
			If Menu[R].Son<>0 then
			    SL:=SelectMenu(R, HK)
			else begin
			    SL:=Menu[R].Cmd;
                            HK:=HotKey
                        end;
			If SL <>0 then Stop:=True;
		      end;
		end;
	  end;
    until Stop;
    ShowCursor;
    CloseWindow;
    If Not ( SL in ActiveMenuSet+[255,254]) then begin SL:=0; HK:=NULL end;
    SelectMenu:=SL;
end;
Procedure InitMenu;
begin
   MenuSay:=0;
   MenuBar:=0;
   EventKey:=0;
   MainCharSet:=[];
   HotKeySet:=[#253];
   ActiveMenuSet:=[];
   Term:=[];
   FillChar(Event        , SizeOf(Event),#0);
end;

Procedure DoEvent(Var EvKey : Byte);
begin
   If (EvKey <>0) and ( EvKey in ActiveMenuSet )then begin
      ShowMenuBar(0);
      Event[EvKey];
   end;
   EvKey := 0;
end;

Function GetKeyCmd:Char;
Var C : Char; K : Byte;
begin
    EventKey:=0;
    C:=GetKey2;GetKeyCmd:=C;
    If C in Term then exit;
    { So it is not in terminator group}
    { could it be a hotkey?}
    EventKey := HotKeyEvent(C, MenuBar);
    If (EventKey <>0) then begin { if yes then}
	If ( EventKey in ActiveMenuSet ) then begin {is it an active menu}
	   GetKeyCmd:=C; { An active command is activated through hotkey}
	   exit
	end
    end
    else begin { C is not a HotKey }
       If Not (C in MainCharSet) then exit;
       K:=MenuBar;
       While Menu[K].HotKey<>C do K:=Menu[K].Next;
       Repeat
	   EventKey:=SelectMenu(K, C);
	   Case EventKey of
	       255: K:=Menu[K].Prev;
	       254: K:=Menu[K].Next;
	   end
	 until Not (EventKey in [255,254]);
	 If EventKey<>0 then begin
	    If C=NULL then C:=#253;
	    GetKeyCmd:=C;
	 end else ShowMenuBar(0);
    end;
end;


  Procedure PushForm;
  begin
     Inc(EDSP);
     EdStack[EdSP]:=Form;
  end;
  Procedure PopForm;
  begin
     If EDSP = 0 then exit;
     Form:=EdStack[EdSP];
     Dec(EDSP);
  end;



Function StrToReal(S:String):Real;
Var L : Real;
    I : Integer;
begin
   Strip(S); SetBlankZero(S); Val(S,L,I);
   if I<>0 then begin
      Complain('HATALI SAYISAL G˜R˜ž');
      StrToReal:=0;
   end else StrToReal:=L;
end;
Function StrToInt(S:String):Word;
Var L , I : Integer;
begin
   Strip(S); SetBlankZero(S); Val(S,L,I);
   if I<>0 then begin
      Complain('HATALI SAYISAL G˜R˜ž');
      StrToInt:=0;
   end else StrToInt:=L;
end;
Function RealToStr(X:Real;Width,Decimal:Byte):String;
Var S:String;
begin
   Str(X:Width:Decimal,S);
   RealToStr:=S;
end;
Function IntToStr(K:Word; Width:Byte):String;
Var S:String;
begin
   Str(K:Width,S);
   IntToStr:=S;
end;

 Procedure SaveWinInfo;
 begin
    WMax:=WindMax; WMin:=WindMin; TAttr:=TextAttr;WX:=WhereX;WY:=WhereY
 end;
 Procedure PrevWin;
 begin
    SaveWinInfo;
    With WindStack[WindSP]^ do begin
       WindMin:=WMin;
       WindMax:=WMAx;
       TextAttr:=TAttr;
       GotoXY(CurX,CurY);
   end;
 end;
Procedure RestoreWinInfo;
begin
   WindMax:=WMax; WindMin:=WMin; TextAttr:=TAttr;GotoXY(WX,WY);
end;

Procedure NormalWindow;
begin
   Window(1,1,80,25);
   TextAttr:=NormalAttr;
end;
Procedure PromptCmdLine(S:String);
begin
    GotoXY(1, WinLastRow);
    Clreol;
    SplitPrint(1, WinLastRow,S,CmdColor);
end;

Procedure HideCursor;
Var Regs : Registers;
begin
  Regs.AX :=$0100;
  Regs.CX :=$2020;
  Intr($10,Regs);
end;
Procedure ShowCursor;
var regs:registers;
    VideoMode : Byte Absolute $0040:$0049;
begin
    if Videomode=7 then
       Regs.CX:=$0C0D
    else
       Regs.CX:=$0607;
    Regs.AX:=$0100;
    Intr($10,Regs)
end;

Procedure OpenEditWindow( Title, EdT, CmdLn:String;
			    CmdSet:CharSet; ComSet:ByteSet;
			    FirstRow, MaxEntry : Word);
Var V, L, M, Y, Delta : Word;
    T : String;
begin
   PushForm;
   EnableTerm(CmdSet, ComSet);
   EdTit(EdT, T);
   L:=Length(T);
   M:=Length(CmdLn+' ');
   V:=Length(Title+' ');
   If V>M then M:=V;
   If L > M then M:=L; L:= 2 + (78-M) Div 2;
   Y:= FirstRow + MaxEntry + 4;
   If Y < 24 then
      FirstRow:= FirstRow + (24-Y) div 2;
   Y:= FirstRow + MaxEntry + 4;
   If Y > 24 then Y := 24;
   OpenWindow(L, FirstRow , L + M+1, Y, Title, NormalAttr, True);
   WriteStr(1,1,T, NorMalAttr); WriteStr(1,2,EdT,NormalAttr);
   PromptCmdLine(CmdLn);
   OpenWindow(L+1, FirstRow + 3, L+M, Y-2,'',NormalAttr,False);
end;

Procedure OpenSplitWindow( Title, EdT, CmdLn:String;
			   CmdSet:CharSet; ComSet:ByteSet);

Var L, M, Y, Delta : Word;
    T : String;
begin
   PushForm; EnableTerm(CmdSet, ComSet);
   EdTit(EdT, T); L:=Length(T); M:=Length(CmdLn+' ');
   If L > M then M:=L; L:= 2 + (78-M) Div 2;
   OpenWindow(L, 3 , L + M+1, 25, Title, NormalAttr, True);
   WriteStr(1,2,ConstStr(CizChar,WinLastCol),NormalAttr);
   WriteStr(1,3,T,NorMalAttr); WriteStr(1,4,EdT,NormalAttr);
   PromptCmdLine(CmdLn);
   OpenWindow(L+1, 8, L+M, 23,'',NormalAttr,False);
end;

procedure CloseEdit;
begin
    CloseWindow; CloseWindow; DisableTerm; PopForm;
end;
Function GetKey2 : Char;
CONST
   Special      : String = ALT_S+ALT_U+ALT_O+ALT_C+ALT_G+ALT_I;
   SpecialChars : String = 'žš™€¦˜';

var
  C : Char;
begin
REPEAT
 C := ReadKey;
 repeat
     if C = NULL then
     begin
	 C := ReadKey;
	 if Ord(C) > 127 then
	     C := NULL
	 else
	     C:= Chr(Ord(C) + 128);
     end
 until C<>NULL;
UNTIL NOT (C IN [#255, #254, #253] );
 if C in [ALT_S, ALT_U, ALT_O, ALT_C,ALT_G,ALT_I] then
       C:=SpecialChars[Pos(C,Special)];
 C:=UpCase(C);
 GetKey2:=UpCase(C);
end;


function Evet:boolean;
begin
   Evet:=GetDesiredKey(['E','e','H','h'])='E';
end;

Function Spaces(Num : Word) : String;
var
  S : String;
begin
  S:='';
  If Num > 255 then exit;
  S[0]:= Chr(Num);
  FillChar(S[1], Num, ' ');
  Spaces:=S;
end; { Spaces }

Function ConstStr(C : Char ; Num : Byte) : String;
var
  S : String;
begin
  S[0] := Chr(Num);
  FillChar(S[1], Num, C);
  ConstStr := S;

end; { ConstStr }

procedure beep;
begin
  Sound(500); Delay(25); NoSound;
end;


Procedure Complain( S : String);
var K  : Integer;
    CH    : Char;
begin
    Beep;
    S:=  S + '@DEVAM<ESC>';
    K:=Length(S);
    OpenWindow(2, 19, 5+K, 21,'HATA',NormalAttr, True);
    Clrscr;
    SplitPrint(1,1,S,ErrorColor);
    CH:=GetDesiredKey([ESC]);
    CloseWindow;
end;
Procedure Bekleyiniz( S : String);
var K  : Integer;
    CH    : Char;
begin
    S:=  S + '@LšTFEN BEKLEY˜N˜Z';
    K:=Length(S);
    OpenWindow(2, 19, 5+K, 21,'',NormalAttr, True);
    Clrscr;
    SplitPrint(1,1,S,ErrorColor);
end;

Procedure Message(Title, S: String; TRMSET : CharSet ; Var TC : Char);
var T     : Array[1..2] of String;
    CmdLn : String;
    M, I  : Word;
    B     : Boolean;
begin
    M:=Length(Title);
    For I:=1 to 2 do begin
	B:=ParseWord(S,T[I],'@');
	if M< Length(T[I]) then M:=Length(T[I])
    end;
    CmdLn:=S;
    if M< Length(CmdLn) then M:=Length(CmdLn);
    I:=1+(80-M) div 2;
    OpenWindow(I,20,I+M+1,24,Title,NormalAttr, True);
    Clrscr; GotoXY(1,1);
    For I:=1 to 2 do WriteStr(1,I,T[I],NormalAttr);
    PromptCmdLine(CmdLn);
    TC:=GetDesiredKey(TRMSET);
    CloseWindow;
end;

Function UpperCase(S : String) : String;
var
  Counter : Word;
begin
  for Counter := 1 to Length(S) do
    S[Counter] := UpCase(S[Counter]);
  UpperCase := S;
end; { UpperCase }

Function GetDesiredKey(T : CharSet):Char;
var CH : Char;
    Q  : Integer;
begin
    Repeat
       CH:=GetKey2;
       if not (CH in T) then beep;
    until CH in T;
    GetDesiredKey:=CH;
end;
Procedure InputStr(Var S : String;
		   X,Y,L : Byte;
		   Exact : Boolean;
		   Target: CharSet;
		   NumLen :Byte;
		Var TC   : Char);

var
   P : Byte;
   Ch: Char;
   NU: Byte;
   ChangeNum, Dur, Start, EventRequest : Boolean;
   Filter : CharSet;
begin
  P     := 0;
  Start := True;
  DUR   := False;
  NU    := 0;
  TC:=NULL;
  if Length(S) > L then S[0]:=Char(L);
  Filter:=Term+Target+[CR, LeftKey, RightKey, HomeKey, EndKey, DelKey, BS];
  Repeat
    if Start then
       WriteStr(X,Y,S,InverseAttr)         {InvColor(TextAttr))}
    else
       WriteStr(X,Y,S+ConstStr(CizChar,L-Length(S)),TextAttr);
    GotoXY(X+P,Y);
    CH:=GetKeyCmd;
    EventRequest:=(EventKey<>0) and (CH in HotKeySet);
    if EventRequest or (CH in Term) then begin
       WriteStr(X,Y,S+Spaces(L-Length(S)+1),TextAttr);
       TC:=CH;
       Exit
    end;
    if Not (CH in Filter) then beep;
    if CH in Target then begin
       if Start then S :='';
       Inc(P); Insert(CH,S,P);
       If Length(S) > L then begin S:=Copy(S,1,L); Dec(P) end;
       ChangeNum := (NUMLen<>0) and ( CH in ['0'..'9']);
       if ChangeNum then begin
   	inc(NU); if NU = NUMLen then DUR := TRUE;
       end;
       if Exact and (Length(S) = L) then DUR := TRUE;
    END;
    CASE CH OF
       CR       : DUR:=TRUE;
       LEFTKEY  : if P > 0 then DEC(P);
       RIGHTKEY : if P < Length(S) then INC(P);
       HOMEKEY  : P := 0;
       ENDKEY   : P := Length(S);
       DELKEY   : if Length(S)>=P+1 then begin
	      	    if (NUMLen<>0) and (S[P+1] IN ['0'..'9']) then DEC(NU);
		    DELETE(S,P+1,1);
	          END  ELSE BEEP;
          BS     : if P>0 then BEGIN
		     if (NUMLen<>0) and  (S[P] IN ['0'..'9']) then dec(NU);
		     Delete(S,P,1);
		     DEC(P);
        	   END else beep;
       end;
    Start := False
  until DUR;
  WriteStr(X,Y,S+Spaces(L-Length(S)+1),TextAttr);
END;

Procedure PadL(Var S: String; Len : Integer; C : Char);
begin
    if Length(S)>=Len then exit;
    S:=ConstStr(C,Len - Length(S))+S;
end;



{$L WIN}

procedure WriteStr(X, Y: Byte; S: String; Attr: Byte);
external {WIN};

procedure WriteChar(X, Y, Count: Byte; Ch: Char; Attr: Byte);
external {WIN};

procedure FillWin(Ch: Char; Attr: Byte);
external {WIN};

procedure WriteWin(var Buf);
external {WIN};

procedure ReadWin(var Buf);
external {WIN};

function WinSize: Word;
external {WIN};

procedure SaveWin(var W: WinState);
begin
  W.WindMin := WindMin;
  W.WindMax := WindMax;
  W.WhereX := WhereX;
  W.WhereY := WhereY;
  W.TextAttr := TextAttr;
end;

procedure RestoreWin(var W: WinState);
begin
  WindMin := W.WindMin;
  WindMax := W.WindMax;
  GotoXY(W.WhereX, W.WhereY);
  TextAttr := W.TextAttr;
end;
procedure FrameWin;
var
   W, H, Y: Word;
begin
  With WindStack[WindSP]^ do begin
    W := WinLastCol;
    H :=WinLastRow;
    WriteChar(1, 1, 1, Frame[1], InverseAttr);
    WriteChar(2, 1, W - 2, Frame[2], InverseAttr);
    WriteChar(W, 1, 1, Frame[3], InverseAttr);
    if Length(Title^) > W - 2 then Title^[0] := Chr(W - 2);
    WriteStr((W - Length(Title^)) shr 1 + 1 , 1, Title^, TitleColor);
    for Y := 2 to H - 1 do
    begin
        WriteChar(1, Y, 1, Frame[4], InverseAttr);
        WriteChar(W, Y, 1, Frame[5], InverseAttr);
    end;
    WriteChar(1, H, 1, Frame[6], InverseAttr);
    WriteChar(2, H, W - 2, Frame[7], InverseAttr);
    WriteChar(W, H, 1, Frame[8], InverseAttr);
  end;
  Inc(WindMin, $0101);
  Dec(WindMax, $0101);
end;

procedure UnFrameWin;
begin
  Dec(WindMin, $0101);
  Inc(WindMax, $0101);
end;

Procedure OpenWindow(X1, Y1, X2, Y2: Byte; T: TitleStr; TxtAt : Byte; FrameIt : Boolean);
begin
  if WindSp = WindMax then exit;
  Inc(WindSP);
  New(WindStack[WindSP]);
  With WindStack[WindSP]^ do begin
    CurX:=WhereX;
    CurY:=WhereY;
    WMin:=WindMin;
    WMax:=WindMax;
    TAttr:=TextAttr;
    GetMem(Title, Length(T) + 1);
    Title^ := T;
    TextAttr  := TxtAt;
    Framed:=FrameIt;
    Window(X1, Y1, X2, Y2);
    GetMem(Buffer,WinSize);
    ReadWin(Buffer^);
  end;
  if FrameIt then FrameWin;
  FillWin(' ',TxtAt);
end;

procedure CloseWindow;
begin
  if WindSP = 0 then exit;
  With WindStack[WindSP]^ do begin
    if Framed then UnFrameWin;
    WriteWin(Buffer^);
    FreeMem(Buffer, WinSize);
    FreeMem(Title, Length(Title^) + 1);
    WindMin:=WMin;
    WindMax:=WMax;
    TextAttr:=TAttr;
    GotoXY(CurX,CurY);
  end;
  Dispose(WindStack[WindSP]);
  dec(WindSP);
end;
procedure Initilize;
  begin
    CheckBreak := False;
    if (LastMode <> CO80) and (LastMode <> BW80) and
      (LastMode <> Mono) then TextMode(CO80);
    Window(1, 1, 80, 25);
  WindSp:=0;
  FillChar(Form,SizeOf(Form),#0);
  EDSP:=0;
  TermSP:=0;
  If LastMode = CO80 then begin
     SelectColor := 16*LightGray+Blue;
     TitleColor  := 16*Red+LightGreen;
     CmdColor    := LightGreen+16*Red;
     MenuSelHilite:=16*LightGray+Red;
     MenuBarColor:=InverseAttr;
     MenuSelectColor:=White+16*Magenta;
     FieldTitColor:=16*Cyan+Black;
     GirisColor:=16*Magenta+Yellow;
     ErrorColor:=16*Red+White;
  end;
end;
Function  WinLastCol:Word;
begin
   WinLastCol  := Lo(WindMax) - Lo(WindMin) + 1;
end;
Function  WinLastRow:Word;
begin
   WinLastRow := Hi(WindMax) - Hi(WindMin) + 1;
end;

Function YilStr(Y:Word; Z:Byte):String;
Var S, T:String;
begin
    Str(Y:4,S);
    Str((Y+1):4,T);
    S:=S+'-'+Copy(T,3,2);
    Case Z of
       1: S:=S+'  GšZ ';
       2: S:=S+' BAHAR';
       3: S:=S+' YAZ  '
    end;
    YilStr:=S;
end;

  Procedure EnableTerm(T : CharSet; L : ByteSet);
  begin
      Inc(TermSp);
      TermStack[TermSP]:=Term;
      CmdStack[TermSP] :=ActiveMenuSet;
      Term:=T;
      ActiveMenuSet:=L;
  end;
 Procedure DisableTerm;
  begin
     If TermSP=0 then exit;
     Term:=TermStack[TermSP];
     ActiveMenuSet:=CmdStack[TermSP];
     Dec(TermSP);
  end;

  Function Max(A, B : Word) : Word;
  begin Max:=A; if B>A then Max:=B end;
  Function Min(A, B : Word) : Word;
  begin Min:=A; if B<A then Min:=B end;

{$F+}
{$L EDTIT.OBJ}
Procedure EdTit(Var S, A : String);EXTERNAL;
{$L SPLIPR}
    Procedure SplitPrint(X, Y : Byte; S : String; Attr : Byte);External;
{$L SCROLL.OBJ}
Procedure ScrollUpWin;External;
Procedure ScrollDownWin;External;
Function InvColor(Attr : Byte) : Byte; External;


Procedure OpenForm( Title, EdT, CmdLn:String;
		    CmdSet:CharSet; ComSet : ByteSet;
		    FirstRow:Byte);

Var I, L, K, M, N : Word;
    T, S: String;
    Tit : Array[1..25] of String[40];
    B   : Boolean;
begin
   PushForm;
   EnableTerm(CmdSet, ComSet);
   I:=0;L:=0;K:=0;M:=0;
   While ParseWord(EdT,S,'@') do begin
      Inc(I);
      Form.FieldLen[I]:=StrToInt(S);
      B:=ParseWord(EdT,S,'@');
      Tit[I]:=S;
      If M<Length(Tit[I]) then M:=Length(Tit[I]);
      If K<Form.FieldLen[I] then K:=Form.FieldLen[I];
   end;
   Form.FieldSay:=I;
   While FirstRow + Form.FieldSay > 21 do Dec(FirstRow);
   L:=M+K+5;
   Form.FieldKol[1]:=1;
   If L<Length(CmdLn+' ')  then  L:=Length(CmdLn+' ');
   If L< Length(Title+' ') then  L:=Length(Title+' ');
   N:= 2 + (78-L) Div 2;
   OpenWindow(N, FirstRow , L+N, FirstRow+Form.FieldSay + 4, Title, NormalAttr, True);
   PromptCmdLine(CmdLn);
   For I:=1 to Form.FieldSay do
       WriteStr(2,I+1,Tit[I]+spaces(M+1 - length(tit[i])), FieldTitColor);
   OpenWindow(N+M+4, FirstRow + 2, L+N-1,FirstRow + Form.FieldSay +2 ,'',NormalAttr,False);
   TextAttr:=GirisColor;
end;

Procedure  GetTarih(Kolon, Row : Byte; Var Tarih : String; Var TC:Char);
var A,G,Y : String;
begin
    G:=Copy(Tarih,1,2);
    A:=Copy(Tarih,4,2);
    Y:=Copy(Tarih,7,4);
    Tarih:=G+'/'+A+'/'+Y;
    WriteStr(Kolon,Row,Tarih,NormalAttr);
    InputStr(G,Kolon,Row,2,True,['0'..'9'],2,TC);
    Move(G[1],Tarih[1],2);
    WriteStr(Kolon,Row,Tarih,NormalAttr);
    if TC<>NULL then exit;
    InputStr(A,Kolon+3,Row,2,True,['0'..'9'],2,TC);
    Move(A[1],Tarih[4],2);
    if TC<>NULL then exit;
    WriteStr(Kolon,Row,Tarih,NormalAttr);
    InputStr(Y,Kolon+6,Row,4,True,['0'..'9'],4,TC);
    Move(Y[1],Tarih[7],4);
    WriteStr(Kolon,Row,Tarih,NormalAttr);
end;

begin
   Initilize;
   InitMenu;
end.


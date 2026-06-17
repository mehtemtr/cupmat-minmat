unit Exist;
interface
Uses
  Win, Dos;

   Type DiskObj = Object
       CurDrive     : Char;
       CurDir       : String;
       IoErrorFlag  : Boolean;
       Constructor Init;
       Function    DriveReady(Drive : Char) : Boolean;
       Function    DirExists(Var DirName : String) : Boolean;
       Function    MakeDir(Var NewDir : String):Boolean;
       Function    LogDir(Var NewDir : String):Boolean;
       Function    ChangeDir:Boolean;
       Procedure   IOError(ErrorCode : Word);
       Function    ParseDirName(Var Drive:Char; Var DirName:String):Boolean;
   end;
   Function Exists(FileName : String) : Boolean;

   Var Disk : DiskObj;
implementation

Procedure DiskObj.IOError(ErrorCode : Word);
var
  S : String;
begin
  IOErrorFlag:=True;
  case ErrorCode of
      3: S := 'PAT˜KA BULUNAMADI';
      5: S := 'ER˜ž˜ME ˜Z˜N VER˜LMED˜';
     15: S := 'GE€ERS˜Z SšRšCš ADI';
    152: S := 'SšRšCš HAZIR DE¦˜L';
    $1000: S:='GE€ERS˜Z D˜RECTORY ADI';
    else S := 'D˜RECTORY ARARKEN HATA';
  end;
  COMPLAIN(S);
end;

Function DiskObj.ParseDirName(Var Drive:Char; Var DirName:String):Boolean;
Var L, Ndx : Integer; CH : Char;
  Function GetCh(Var Ndx : integer) : Char;
    begin
       GetCh:=DirName[Ndx];
       Ndx:=Ndx+1;
   end;
begin
  GetDir(0,CurDir); CurDrive:=CurDir[1];
  DirName:=DirName+#0;
  Ndx:=1;
  ParseDirName:=False;
  CH:=GetCh(Ndx);
  If CH = #0 then begin
     DirName:=CurDir;Drive:=CurDrive;
     ParseDirName:=True;
     exit
  end;
  if not ( CH in ['\',':','0'..'9','A'..'Z'] ) then exit;
  if CH='\' then begin
     DirName:=CurDir+DirName;
     Drive:=CurDrive;
  end else begin
     CH:=GetCH(Ndx);
     If CH = ':' then begin
	Drive:=DirName[1];
	CH:=GetCH(Ndx);
        If CH=#0 then
           DirName:=Drive+':\'+#0
        else if CH<>'\' then exit;
     end else begin
	 Drive:=CurDrive;
	 DirName:=CurDir+'\'+DirName;
     end;
  end;
  L:=Length(DirName)-1;
  DirName[0]:=Char(L);
  ParseDirName:=True;
  If (DirName[L]='\') then
     if ( DirName[L-1]<>':') then DirName[0]:=Char(L-1);
end;
Function DiskObj.DriveReady(Drive : Char) : Boolean;
Var ErrorCode : Word;
  begin
     Drive:=UpCase(Drive);
     DriveReady:=False; IOErrorFlag:=False;
     If not ( Drive in ['A'..'Z'] ) then begin
        IoError(15);
        exit
     end;
     If DiskSize(Succ(Ord(Drive)) - Ord('A'))<>-1 then
        DriveReady:=True
     else
        IOError(152);
end;
Function DiskObj.DirExists(Var DirName:String):Boolean;
Var Drive:Char;
begin
    DirExists:=False; IOErrorFlag:=False;
    If not ParseDirName(Drive,DirName) then begin
       IOError($1000);
      exit;
    end;
    If Not DriveReady(Drive) then exit;
    {$I-}
    ChDir(DirName);
    if IOResult = 0 then DirExists:=True;
    ChDir(CurDir);
    {$I+}
end;
Function Exists(FileName : String) : Boolean;
var
  SR : SearchRec;
begin
  FindFirst(FileName, ReadOnly + Hidden + SysFile, SR);
  Exists := (DosError = 0) and (Pos('?', FileName) = 0) and
	    (Pos('*', FileName) = 0);
end; { Exists }

Function DiskObj.MakeDir(Var NewDir : String):Boolean;
begin
    MakeDir:=False;
    If Not DirExists(NewDir) and Not IOErrorFlag then begin
        {$I+}
        MkDir(NewDir);
        {$I-}
       if IOResult<>0 then begin
          complain(NewDir + 'D˜RECTORY Y˜ OLUžTURAMIYORUM');
          Exit
       end else MakeDir:=True;
    end;
    IOErrorFlag:=False;
end;
Function DiskObj.LogDir(Var NewDir : String):Boolean;
begin
  LogDir:=False;
  if DirExists(NewDir) then begin
       ChDir(NewDir);
       LogDir:=True;
       GetDir(0,CurDir);
       CurDrive:=CurDir[1];
  end else if Not IOErrorFlag then begin IOError(3);IoErrorFlag:=False end;
end;
Function DiskObj.ChangeDir:Boolean;
    Var Direct, S: String; TC:Char;
    begin
       ChangeDir:=False;Direct:='';
       OpenEditWindow('SšRšCš VE D˜RECTORY DE¦˜ž˜M˜',
	 '44@D˜RECTORY','END:DE¦˜ž˜T˜R@ESC:VAZGE€', [ENDKEY,ESC], [],10, 5);
       GetDir(0,S);
       WriteStr(1,3,'MEVCUT D˜RECTORY : '+S, CmdColor);
       Repeat
          InputStr(Direct,Form.FieldKol[1],1,43,False,AllKar,0,TC );
          If TC = ENDKEY then
             If LogDir(Direct) then begin
                TC:=ESC;
                ChangeDir:=True
             end
             else if Not IOErrorFlag then begin
                    Message('YEN˜ D˜RECTORY',
                    'BU D˜RECTORY YOK@OLUžTURMAMI ˜STERM˜S˜N˜Z@ESC:VAZGE€@ENTER:G˜R',
                   [ESC,CR], TC);
                If TC = CR then begin
                   if MakeDir(Direct) then
                      TC:=ESC; ChangeDir:=True;
                      ChangeDir:=LogDir(Direct);
                   end;
                end;
       until TC = ESC;
       closeEdit;
    end;
Constructor DiskObj.Init;
begin
   IOErrorFlag:=False;
   GetDir(0,CurDir);
   CurDrive:=CurDir[1];
end;
begin
   Disk.Init
end.


       
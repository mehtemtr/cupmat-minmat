uses Crt, Dos;
const
      BS       =   #8;                                   { Backspace key   }
      CR       =  #13;                                   { Return key      }
      ESC      =  #27;                                   { Escape key      }
      ALT_S    = #159;                                   { ALT + S         }
      ALT_U    = #150;                                   { ALT + U         }
      ALT_I    = #151;                                   { ALT + I         }
      ALT_O    = #152;                                   { ALT + O         }
      ALT_G    = #162;                                   { ALT + G         }
      ALT_C    = #174;                                   { ALT + C         }
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
      TumIzinli= [#32..#127, 'ž','š','™','€','¦','˜'];
Type
     CharSet = Set of Char;
     BorcTah = record
     Gun : Byte;
     Ay  : Byte;
     Yil : Word;
     Bag : LongInt;
     Case Byte of
          0 : (Borc     : LongInt);
          1 : (Tahsilat : LongInt);
          2 : (BosSatir : LongInt);
     end;
     Musteri = record
        Ad      : String[15];
        SoyAd   : String[15];
        BorcBag : LongInt;
        TahBag  : LongInt;
     end;
Var
    BrcTahDos : File of BorcTah;
    MusDos    : File of Musteri;
    MusSay    : LongInt;

function Deger(S : String):LongInt;
Var K, I : Integer; X : LongInt;
begin
   I:=Length(S);
   While (I>0) and Not( S[I] in ['0'..'9']) do dec(I);
   S[0]:=Chr(I);
   for I:=1 to Length(S) do If Not( S[I] in ['0'..'9']) then S[I]:='0';
   Val(S, X,K);
   Deger:=X;
end;
procedure beep;
begin
   write(#7)
end;
Function GetKey : Char;
CONST
   Ozel    : String = ALT_S+ALT_U+ALT_O+ALT_C+ALT_G+ALT_I;
   OzelChar: String = 'žš™€¦˜';

var
  C : Char;
begin
  C := ReadKey;
  repeat
    if C = #0 then
    begin
      C := ReadKey;
      if Ord(C) > 127 then
	C := #0
      else
	C:= Chr(Ord(C) + 128);
    end
  until C <> #0;
  if C in [ALT_S, ALT_U, ALT_O, ALT_C,ALT_G,ALT_I] then
     C:=OzelChar[Pos(C,Ozel)];
  GetKey:=UpCase(C);
end; { GetKey }
procedure YazXY(S : String; X, Y : Byte);
begin
   GotoXY(X,Y);
   Write(S);
end;

Procedure Input(Var S : String;
		   X,Y,L : Byte;
		   Islem  : CharSet;
		   Izinli : CharSet;
		Var TC   : Char);

var
   P : Byte;
   Ch: Char;
   Dur, Basla : Boolean;
   Filter : CharSet;
begin
  P     := 0;
  Basla := True;
  DUR   := False;
  TC:=#0;
  if Length(S) > L then S[0]:=Char(L);
  Filter:=Izinli+Islem+[CR, LeftKey, RightKey, HomeKey, EndKey, DelKey, BS];
  Repeat
    YazXY(S+' ', X,Y);
    GotoXY(X+P,Y);
    Repeat
       CH:=GetKey;
       If not ( CH in Filter) then beep;
    until CH in Filter;
    if CH in Islem then begin
       YazXY(S+' ',X,Y);
       TC:=CH;
       Exit
    end;
    if CH in Izinli then begin
       Inc(P);
       Insert(CH,S,P);
       If Length(S) > L then begin S:=Copy(S,1,L); if P > L then Dec(P) end;
    end;
    Case CH of
       CR       : Dur:=True;
       LEFTKEY  : if P > 0 then Dec(P);
       RIGHTKEY : if P < Length(S) then Inc(P);
       HOMEKEY  : P := 0;
       ENDKEY   : P := Length(S);
       DELKEY   : if Length(S)>=P+1 then Delete(S,P+1,1) else beep;
       BS       : if P>0 then begin
		     Delete(S,P,1);
		     Dec(P);
        	   end else beep;
       end;
  until Dur;
  YazXY(S+' ',X,Y);
end;
Procedure BorcTahOku(Var X : BorcTah; Satir : LongInt);
begin
    Seek(BrcTahDos, Satir);
    Read(BrcTahDos, X);
end;
Procedure BorcTahYaz(Var X : BorcTah; Satir : LongInt);
begin
    Seek(BrcTahDos, Satir);
    Write(BrcTahDos, X);
end;
Function BosSat : LongInt;
Var T : BorcTah;
begin
    BorcTahOku(T,0);
    BosSat:=T.BosSatir;
end;
Procedure BosSatDegis;
Var T : BorcTah;
begin
    BorcTahOku(T,0); Inc(T.BosSatir); BorcTahYaz(T,0)
end;
Procedure MusOku(Var X : Musteri; Kod : LongInt);
begin
    Seek(MusDos, Kod);
    Read(MusDos, X);
end;
Procedure MusYaz(Var X : Musteri; Kod : LongInt);
begin
    Seek(MusDos, Kod);
    Write(MusDos, X);
end;
Procedure BorcTahIlave(Kod : LongInt; BT : Boolean; X : BorcTah);
Var  I, J : LongInt;
     Mus : Musteri;
begin
   I:=BosSat;
   MusOku(Mus, Kod);
   If BT then begin
      J:=Mus.BorcBag; Mus.BorcBag:=I
   end else begin
     J:=Mus.TahBag; Mus.BorcBag:=I
   end;
   MusYaz(Mus, Kod);
   X.Bag:=J;
   BorcTahYaz(X,I);
   BosSatDegis;
end;
Function Tarih(X : BorcTah) : String;
Var A, B, C : String;
begin
    Str(X.Gun:2, A); Str(X.Ay:2, B); Str(X.Yil:4, C);
    Tarih := A+'/'+B+'/'+C
end;
Function  DosyaVarmi(DosyaAdi : String) : Boolean;
var
  SR : SearchRec;
begin
  FindFirst(DosyaAdi, ReadOnly + Hidden + SysFile, SR);
  DosyaVarmi := (DosError = 0) and (Pos('?', DosyaAdi) = 0) and
	    (Pos('*', DosyaAdi) = 0);
end;

Procedure DosyaAc(MusDosAdi, BrcTahAdi : String);
var
  X : BorcTah; Mus : Musteri;
begin
  Assign(MusDos, MusDosAdi);
  Assign(BrcTahDos, BrcTahAdi);
  If Not DosyaVarmi(MusDosAdi) then begin
       ReWrite(MusDos);
       MusSay:=0;
       Mus.BorcBag:=0;
       MusYaz(Mus, 0)
  end
  else begin
       Reset(MusDos);
       MusOku(Mus,0);
       MusSay:=Mus.BorcBag
  end;
  If Not DosyaVarmi(BrcTahAdi) then begin
       ReWrite(BrcTahDos);
       X.BosSatir:=1;
       BorcTahYaz(X,0);
  end else
      Reset(BrcTahDos);
end;

Procedure DosyaKapa;
Var Mus : Musteri;
begin
  Mus.BorcBag:=MusSay;
  MusYaz(Mus,0);
  Close(MusDos);Close(BrcTahDos);
end;

Procedure YeniMusGir;
Var X : Musteri; Var A, S : String; TC : Char; Kod : LongInt;
Procedure Goster;
begin
   GotoXY(9,3); Write(A+'               ');
   GotoXY(9,4); Write(S+'               ');
end;

Procedure AdOku;
begin
   Input(A,9,3,15,[ESC, F1, F2, InsKey],TumIzinli,TC);
end;
Procedure SoyAdOku;
begin
   If TC=#0 then
   Input(S,9,4,15,[ESC, F1, F2, InsKey],TumIzinli,TC);
end;

begin
   A:=''; S:='';
   Kod:=MusSay+1;
   ClrScr;
   writeln('Musteri Girisi');
   writeln;
   Writeln('Adi   :');
   Writeln('SoyAdi:');
   writeln;
   Writeln('Musteri Kodu :', Kod:6);
   writeln;
   Writeln('ESC : Cikis F1 : Onceki F2 : Sonraki : Ins : Gir');
   repeat
      Goster;
      AdOku;
      SoyAdOku;
      case TC of
        InsKey : begin

               X.Ad:=A; X.Soyad:=S;
               if Kod = MusSay+1 then
                  begin Inc(MusSay);
                        X.BorcBag:=-1;
                        X.TahBag :=-1;
                        MusYaz(X, MusSay);
                        X.BorcBag:=MusSay;
                        MusYaz(X,0);
                        A:='';S:='';
                        Kod:=MusSay+1;
                  end else MusYaz(X, Kod);
            end;
        F1 :if Kod>1 then begin
                  Dec(Kod);
                  MusOku(X,Kod);
                  A:=X.Ad; S:=X.SoyAd;
               end;
        F2: begin
            if Kod<=MusSay then Inc(Kod);
               if Kod<=MusSay then begin
                 MusOku(X,Kod);
                 A:=X.Ad; S:=X.SoyAd;
               end else begin
                A:=''; S:=''
               end
            end;
      end;
   until TC=ESC;
end;

Procedure BorcTahGir(BT : Boolean);
Var X : Musteri; Y : BorcTah;
  Kd, GunS, AyS, YilS, BorcS : String;
  GunX : Byte; AyX : Byte; YilX : Word;
  TC : Char;
  Kod, Borc : LongInt;

Procedure Goster;
begin
   GotoXY(16,3); Write(GunS+'               ');
   GotoXY(16,4); Write(AyS +'               ');
   GotoXY(16,5); Write(YilS +'               ');
   GotoXY(16,7); Write(Kd+'               ');
   GotoXY(16,8); Write(X.Ad +'               ');
   GotoXY(16,9); Write(X.SoyAd +'               ');
   GotoXY(16,11); Write(BorcS+'               ');
end;
Procedure TarihOku;
   Procedure GunOku;
   Var K : Integer;
   begin
      Str(GunX:2,GunS);
      Input(GunS,16,3,2,[ESC, EndKey],['0'..'9'],TC);
      GunX:=Deger(GunS);
   end;
   Procedure AyOku;
   Var K : Integer;
   begin
      Str(AyX:2,AyS);
      if TC=#0 then
         Input(AyS,16,4,2,[ESC, EndKey],['0'..'9'],TC);
      AyX:=Deger(AyS);
   end;
   Procedure YilOku;
   Var K : Integer;
   begin
     Str(YilX:4,YilS);
     If TC=#0 then
        Input(YilS,16,5,4,[ESC, EndKey],['0'..'9'],TC);
     YilX:=Deger(YilS);
   end;
 begin
   gotoXY(1,13); ClrEol;
   Writeln('ESC : Cikis End : Tamam');
   repeat
       GunOku;
       AyOku;
       YilOku;
       if TC = Endkey Then begin
          gotoXY(1,13); ClrEol;
          Writeln('ESC : Cikis F1 : Onceki F2 : Sonraki F3 : Tarih Ins : Gir ');
          TC:=ESC;
       end;
   until TC = ESC;
 end;
Procedure KodOku;
Var K : Integer;
begin
   Str(Kod:6, Kd);
   Input(Kd,16,7,6,[ESC, F1, F2, InsKey],['0'..'9'],TC);
   Kod:=Deger(Kd);
   Str(Kod:6, Kd);
   if (Kod<=0) or (Kod>MusSay) then begin
      beep;
      Kod:=MusSay;
   end;
   MusOku(X, Kod);
end;
Procedure BorcTahOku;
Var K : Integer;
begin
   If TC=#0 then begin
      Str(Borc:10, BorcS);
      Input(BorcS,16,11,10,[ESC, F1, F2, InsKey],['0'..'9'],TC);
      Borc:=Deger(BorcS);
      Str(Borc:6, BorcS);
      Goster;
   end;
end;
begin
   Kod:=MusSay;
   Borc:=0;
   Str(Borc:10,BorcS);
   Str(Kod:6, Kd);
   GunX:=1; AyX:=1;YilX:=1995;
   if Kod = 0 then begin
      writeln('Henuz bir Musteri Yok. Devam Icin Bir Tusa Basiniz');
      TC:=GetKey;
      Exit
   end;
   ClrScr;
   if Bt then writeln('Borc Girisi') else writeln('Tahsilat Girisi');
   writeln;
   WriteLn('Gun         : ');
   Writeln('Ay          : ');
   Writeln('Yil         : ');
   writeln;
   WriteLn('Musteri Kodu : ');
   Writeln('Adi         : ');
   Writeln('SoyAdi      : ');
   writeln;
   If Bt then WriteLn('Borc Miktari: ') else WriteLn('Tahsilat Miktari: ');
   writeln;
   TarihOku;
   MusOku(X, Kod);
   repeat
      Goster;
      KodOku;
      Goster;
      BorcTahOku;
      case TC of
        InsKey : begin
                        Y.Gun:=GunX; Y.Ay:=AyX; Y.Yil:=YilX;Y.Borc:=Borc;
                        BorcTahIlave(Kod, Bt, Y);
                  end;
        F1 :if Kod>1 then begin
                  Dec(Kod);
                  MusOku(X,Kod);
             end;
        F2: begin
                if Kod<MusSay then Inc(Kod);
                 MusOku(X,Kod);
            end;
        F3 : TarihOku;
      end;
   until TC=ESC;
end;
Var Menu:Char;
begin
   DosyaAc('MUS.DAT','BRCTAH.DAT');
   Repeat
      clrscr;
      WriteLn('F1  : Yeni Musteri Gir');
      WriteLn('F2  : BorcGir');
      Writeln('F3  : Tahsilat Gir');
      Writeln('ESC : Vazgec');
      Writeln;
      Writeln('Seciminiz : ');
      Menu:=GetKey;
      Case Menu Of
          F1 : YeniMusGir;
          F2 : BorcTahGir(True);
          F3 : BorcTahGir(False);
          ESC:
          else Beep;
      end;
   Until Menu=ESC;
   DosyaKapa;
end.

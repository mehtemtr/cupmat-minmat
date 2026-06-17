Function AdAndMarker:String;
Var L, KK, M : Word;CH:Char;
begin
  with Ogr do begin
    Ad:=Ad+Spaces(23); Ad:=Copy(Ad,1,23); AdAndMarker:=Ad;
    if YKK=$FFFF then begin
       if YKK=$FFFF then AdAndMarker:=copy(Ad,1,22)+' **';
       exit
    end;
    for KK:=YYCount downto 1 do begin
      If (Donem[KK].YY = ActYY) and (Donem[KK].YL < ActYil) then begin
        L:=WordAra(DersAdresi,AnaKay[KK], Donem[KK].CNT,SizeOf(AnaRec));
        If L<>0 then begin
           M:=AnaKay[KK, L].Grd;
           if not GRAD^.Grade[M].Basari then begin
                 CH:=GRAD^.Grade[M].Isaret; AdAndMarker:=Ad+' '+CH;
                 exit;
           end;
        end;
      end;
    end;
  end;
end;
/** Periyot ödülü taşıyan profil alanları (döngüsel import önlenir) */
export interface PeriodRewardFields {
  periyotOdulMinmatSaniyeSeviye: number;
  periyotOdulMinmatPuanSeviye: number;
  periyotOdulCupmatGlobalPuan: number;
  periyotOdulGecerliBitis: string;
  cupMatRewardSeconds?: number;
  cupMatRewardPoints?: number;
}

/** CupMat dönem sonu ilk 3 → bir SONRAKİ periyot boyunca MinMat bonusu */
export const CUPMAT_TO_MINMAT_PERIOD_REWARDS = [
  { secondsPerLevel: 10, pointsPerLevel: 0 },
  { secondsPerLevel: 0, pointsPerLevel: 5 },
  { secondsPerLevel: 0, pointsPerLevel: 2 },
] as const;

/** MinMat dönem sonu ilk 3 → bir SONRAKİ periyot boyunca CupMat global puan bonusu */
export const MINMAT_TO_CUPMAT_PERIOD_REWARDS = [50, 30, 15] as const;

export const PERIOD_LENGTH_DAYS = 3;

export function parseTrDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  if (dateStr.includes("-")) return new Date(dateStr);
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

export function getPeriodStart(periodEndIso: string): Date {
  const periodStart = new Date(periodEndIso);
  periodStart.setDate(periodStart.getDate() - PERIOD_LENGTH_DAYS);
  const compareStart = new Date(periodStart);
  compareStart.setHours(0, 0, 0, 0);
  return compareStart;
}

export function scheduleNextPeriodEnd(from: Date = new Date()): string {
  const newEnd = new Date(from);
  newEnd.setDate(newEnd.getDate() + PERIOD_LENGTH_DAYS);
  return newEnd.toISOString();
}

export function clearPeriodRewardFields(user: PeriodRewardFields): void {
  user.periyotOdulMinmatSaniyeSeviye = 0;
  user.periyotOdulMinmatPuanSeviye = 0;
  user.periyotOdulCupmatGlobalPuan = 0;
  user.periyotOdulGecerliBitis = "";
  user.cupMatRewardSeconds = 0;
  user.cupMatRewardPoints = 0;
}

/** Süresi dolmuş veya periyot uyuşmayan ödülleri temizler; değişiklik olduysa true */
export function expirePeriodRewardsIfNeeded(
  user: PeriodRewardFields,
  currentPeriodEnd: string,
): boolean {
  const hasReward =
    user.periyotOdulMinmatSaniyeSeviye > 0 ||
    user.periyotOdulMinmatPuanSeviye > 0 ||
    user.periyotOdulCupmatGlobalPuan > 0 ||
    !!user.periyotOdulGecerliBitis;

  if (user.periyotOdulGecerliBitis !== currentPeriodEnd && hasReward) {
    clearPeriodRewardFields(user);
    return true;
  }
  return false;
}

export function isPeriodRewardActive(
  user: PeriodRewardFields,
  currentPeriodEnd: string,
): boolean {
  return (
    user.periyotOdulGecerliBitis === currentPeriodEnd &&
    (user.periyotOdulMinmatSaniyeSeviye > 0 ||
      user.periyotOdulMinmatPuanSeviye > 0 ||
      user.periyotOdulCupmatGlobalPuan > 0)
  );
}

export function getActiveCupmatGlobalBonus(
  user: PeriodRewardFields,
  currentPeriodEnd: string,
): number {
  return isPeriodRewardActive(user, currentPeriodEnd)
    ? user.periyotOdulCupmatGlobalPuan
    : 0;
}

export type ProfileWithPeriodRewards<T extends PeriodRewardFields> = T & {
  periyotOdulAktif: boolean;
};

export function enrichProfileWithPeriodRewards<T extends PeriodRewardFields>(
  profile: T,
  currentPeriodEnd: string,
): ProfileWithPeriodRewards<T> {
  const aktif = isPeriodRewardActive(profile, currentPeriodEnd);
  return {
    ...profile,
    periyotOdulAktif: aktif,
    periyotOdulMinmatSaniyeSeviye: aktif
      ? profile.periyotOdulMinmatSaniyeSeviye
      : 0,
    periyotOdulMinmatPuanSeviye: aktif ? profile.periyotOdulMinmatPuanSeviye : 0,
    periyotOdulCupmatGlobalPuan: aktif ? profile.periyotOdulCupmatGlobalPuan : 0,
  };
}

export function applyCupmatPeriodReward(
  user: PeriodRewardFields,
  rankIndex: number,
  validUntil: string,
): void {
  const tier = CUPMAT_TO_MINMAT_PERIOD_REWARDS[rankIndex];
  if (!tier) return;
  user.periyotOdulMinmatSaniyeSeviye = tier.secondsPerLevel;
  user.periyotOdulMinmatPuanSeviye = tier.pointsPerLevel;
  user.periyotOdulGecerliBitis = validUntil;
}

export function applyMinmatPeriodReward(
  user: PeriodRewardFields,
  rankIndex: number,
  validUntil: string,
): void {
  const bonus = MINMAT_TO_CUPMAT_PERIOD_REWARDS[rankIndex];
  if (bonus == null) return;
  user.periyotOdulCupmatGlobalPuan = bonus;
  user.periyotOdulGecerliBitis = validUntil;
}

export interface PlayerStatusUpdate {
  playerId: string; // E.g., "son-heung-min" or "kor-p25"
  status: "sakat" | "cezali" | "hazir";
  detail: string;
}

interface PlayerStatusStore {
  statuses: PlayerStatusUpdate[];
}

const globalStore = globalThis as unknown as {
  playerStatuses?: PlayerStatusStore;
};

function getStore(): PlayerStatusStore {
  if (!globalStore.playerStatuses) {
    globalStore.playerStatuses = {
      statuses: [
        {
          playerId: "son-heung-min",
          status: "hazir",
          detail: "Tamamen hazır durumda ve antrenmanlara katılıyor.",
        },
        {
          playerId: "guillermo-ochoa",
          status: "hazir",
          detail: "Kondisyonu yerinde, Meksika kalesini korumaya hazır.",
        }
      ],
    };
  }
  return globalStore.playerStatuses;
}

export function getPlayerStatus(playerId: string): PlayerStatusUpdate | null {
  const store = getStore();
  return store.statuses.find((s) => s.playerId === playerId) || null;
}

export function updatePlayerStatus(
  playerId: string,
  status: "sakat" | "cezali" | "hazir",
  detail: string
): PlayerStatusUpdate {
  const store = getStore();
  let found = store.statuses.find((s) => s.playerId === playerId);

  if (!found) {
    found = { playerId, status, detail };
    store.statuses.push(found);
  } else {
    found.status = status;
    found.detail = detail;
  }

  return found;
}

export function getAllPlayerStatuses(): PlayerStatusUpdate[] {
  const store = getStore();
  return store.statuses;
}

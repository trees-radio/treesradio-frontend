import fbase from "libs/fbase";
import { ref, set, get, onValue } from "firebase/database";

export default function getRank(uid) {
  if (uid === undefined || uid.length == 0) return false;

  const rankRef = ref(fbase, `ranks/${uid}`);
  return get(rankRef).then((snapshot) => snapshot.val());
}

export async function getUserRank(uid) {
  if (uid === undefined || uid.length == 0) return false;
  const rankRef = ref(fbase, `ranks/${uid}`);
  const rank = await get(rankRef).then((snapshot) => snapshot.val());
  if (!rank) return "User";
  return rank;
}

export function listenRank(uid) {
  if (uid === undefined || uid.length == 0) return false;
  const rankRef = ref(fbase, `ranks/${uid}`);
  return onValue(rankRef);
}

function ranksSettings() {
  const ranksSettings = ref(fbase, "ranks_settings_READ_ONLY");
  return get(ranksSettings).then((snapshot) => snapshot.val());
}

export async function getSettingsForRank(rank) {
  const settings = await ranksSettings();
  return (await settings.ranks[rank]) || {};
}

export async function getAllRanks(cbFunc) {
  const rankRef = ref(fbase, `ranks`);
  return await get(rankRef).then((snapshot) => cbFunc(snapshot.val()));
}

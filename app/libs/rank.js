import fbase from "libs/fbase";

export default function getRank(uid) {
  return fbase.database().ref("ranks").child(uid).once("value").then(snap => snap.val());
}

export function listenRank(uid) {
  return fbase.database().ref("ranks").child(uid).on("value");
}

function ranksSettings() {
  return fbase.database().ref("ranks_settings_READ_ONLY").once("value").then(snap => snap.val());
}

export async function getSettingsForRank(rank) {
  const settings = await ranksSettings();
  return (await settings.ranks[rank]) || {};
}

export async function getAllRanks(cbFunc) {
  fbase.database().ref("ranks").once("value", snap => cbFunc(snap.val()));
}

import axios from "axios";

export const SC_API_KEY = "9kBUwwrRTbFmi1IGN5qGBOoS4E57Oex7";

export async function searchSoundcloud(query) {
  const detailsResult = await axios.get("https://api.soundcloud.com/tracks", {
    params: {
      client_id: SC_API_KEY,
      q: query
    }
  });
  return detailsResult;
}

import axios from "axios";
import URL from "url-parse";

export const SC_API_KEY = "Cw9DmapUMAAhetX9DjUO9081SomxDZUY";
const VALID_SC_HOSTNAMES = ["soundcloud.com", "www.soundcloud.com"];

export async function searchSoundcloud(query) {
  const detailsResult = await axios.get("https://api.soundcloud.com/tracks", {
    params: {
      client_id: SC_API_KEY,
      q: query
    }
  });
  return detailsResult;
}

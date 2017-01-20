
import axios from 'axios';
import URL from 'url-parse';

export const YT_API_KEY = 'AIzaSyDXl5mzL-3BUR8Kv5ssHxQYudFW1YaQckA';
const VALID_YT_HOSTNAMES = ['youtube.com', 'www.youtube.com'];

export async function searchYouTube(query) {
  const idsResult = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      maxResults: '25', // think this is the max allowed?
      type: 'video',
      videoEmbeddable: 'true',
      key: YT_API_KEY,
      q: query
    }
  });

  const idArray = idsResult.data.items.map(data => data.id.videoId);
  const ids = idArray.reduce((p, c) => p + ',' + c, '');

  const detailsResult = axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      id: ids,
      part: 'contentDetails,snippet',
      key: YT_API_KEY
    }
  });

  return detailsResult;
}

function parseYtPlaylistId(url) {
  let parsed;
  try {
    parsed = new URL(url, true);
  } catch (e) {
    return null; //probably not a link.
  }

  if (!VALID_YT_HOSTNAMES.includes(parsed.hostname)) {
    return null;
  }

  return parsed.query.list;
}

function getPlaylistPage(playlistId, pageToken) {
  return axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
    params: {
      part: 'contentDetails,snippet',
      playlistId: playlistId,
      key: YT_API_KEY,
      maxResults: 50,
      pageToken
    }
  }).then(({data}) => data);
}

export async function getYtPlaylist(url) {
  const playlistId = parseYtPlaylistId(url);
  let playlistItems = [];

  const firstPage = await getPlaylistPage(playlistId);
  playlistItems = [...firstPage.items, ...playlistItems];

  let nextPageToken = firstPage.nextPageToken;
  while (nextPageToken) {
    let thisPage = await getPlaylistPage(playlistId, nextPageToken);
    playlistItems = [...thisPage.items, ...playlistItems];
    nextPageToken = thisPage.nextPageToken;
  }

  const videoIds = playlistItems.map(i => i.contentDetails.videoId);

  const detailRequests = videoIds.map(id => axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      id: id,
      part: 'contentDetails,snippet',
      key: YT_API_KEY
    }
  }).then(r => r.data.items[0]));

  const playlistVideos = await Promise.all(detailRequests);

  const cleanList = playlistVideos.filter(item => item && item.snippet.title.toUpperCase() !== 'DELETED VIDEO');

  return cleanList;
}
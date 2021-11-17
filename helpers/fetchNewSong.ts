import { IParsedSong } from "../types/ISong"

export const fetchNewSong = async (allSongs: IParsedSong[], countOfSongs: number, apiKey: string): Promise<(IParsedSong | null)> => {
  const randomIndexOfArr: number = Math.floor(Math.random() * countOfSongs)
  const currentSong: IParsedSong = allSongs[randomIndexOfArr]  

  try {
    const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${currentSong.songName}&type=track&limit=1`, {
      method: 'GET',
      headers: {
        'User-Agent': 'ANYTHING_WILL_WORK_HERE',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
    })
    const searchData = await searchResponse.json()

    if (searchData.tracks?.items[0]) {
      
      return {
        ...currentSong,
        id: searchData.tracks.items[0].id,
        duration: searchData.tracks.items[0].duration_ms,
        image: searchData.tracks.items[0].album.images[0].url,
      }
    }
  } catch (error) {
    console.log('error', error);
  }
  
  return null
}
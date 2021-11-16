// types 
import type { InferGetStaticPropsType } from 'next'
import { IParsedSong, ISong } from '../types/ISong'

import { promises as fs } from 'fs'
import path from 'path'

import { useEffect, useState } from 'react'

// helpers
import { fetchNewSong } from '../helpers/fetchNewSong'
import { parseName } from '../helpers/parseName'

const Home = ({allSongs, apiKey}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [readySongs, setReadySongs] = useState<IParsedSong[]>([])
  const [currentSong, setCurrentSong] = useState<number>(0)

  const [player, setPlayer] = useState<any>(undefined);
  const [deviceId, setDeviceId] = useState('')
  const [is_paused, setPaused] = useState(false);

  const countOfSongs: number = allSongs.length

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const player = new (window as any).Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb: any) => { cb(apiKey); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }: any) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id)
      });

      player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('initialization_error', ({ message }: any) => { 
        console.log('error', message);
      });
    
      player.addListener('authentication_error', ({ message }: any) => {
          console.log('error', message);
      });
    
      player.addListener('account_error', ({ message }: any) => {
          console.log('error', message);
      });

      player.addListener('playback_error', ({ message }: any) => {
        console.log('error', message);
      });

      player.addListener('player_state_changed', ( (state: any) => {
        console.log('state', state);

        if (!state) {
            return;
        }
    
        setPaused(state.paused);
      }));

      setPlayer(player);

      player.connect().then((success: any) => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      })

    };
  }, []);

  useEffect(() => {
    const getData = async () => {
      let songs: IParsedSong[] = []

      while(songs.length < 3) {
        const fetchedSong = await fetchNewSong(allSongs, countOfSongs, apiKey)
        if(fetchedSong) {
          songs.push(fetchedSong)
        }
      }

      setReadySongs(songs)
    }
    
    getData()
  }, [])

  const prevSong = async () => {
    if(currentSong > 0) {
      setCurrentSong(currentSong - 1)
    }
  } 

  const nextSong = async () => {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      body: '{"uris": ["spotify:track:7w87IxuO7BDcJ3YUqCyMTT"]}',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      method: "PUT"
    })
    
    if(currentSong === readySongs.length - 3) {
      const fetchedSong: IParsedSong | null = await fetchNewSong(allSongs, countOfSongs, apiKey)

      if(fetchedSong) {
        setReadySongs([...readySongs, fetchedSong])
        setCurrentSong(currentSong + 1)
      }
    } else {
      setCurrentSong(currentSong + 1)
    }
  } 
  
  return (
    <div className="bg-red-300 h-screen">
      <div className="w-lowest mx-auto">

        <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
          &lt;&lt;
        </button>

        <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
          { is_paused ? "PLAY" : "PAUSE" }
        </button>

        <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
          &gt;&gt;
        </button>
        
        <div className="flex justify-center">
          <button className="p-2 m-2 border-2 border-gray-300" onClick={prevSong}>prev</button>
          <button className="p-2 m-2 border-2 border-gray-300" onClick={nextSong}>next</button>
        </div>
        <ul className="mt-4 p-2 border-2 border-red-500">
          {
            readySongs.map((e, index: number) => {
              return (
                <li className={currentSong === index ? 'h-auto current-song' : 'h-0 overflow-hidden'} key={index}>
                  <p><span>{index}. </span> {e.songName} - {e.songCode}</p>
                  <iframe 
                    className="w-full h-80px" 
                    src={`https://open.spotify.com/embed/track/${e?.id}`}
                  ></iframe>
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  )
}

export const getStaticProps = async ( ) => {
  const urls = ['https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&ninja_table_public_nonce=3a5901169d&chunk_number=0',
    'https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&ninja_table_public_nonce=3a5901169d&chunk_number=0',
    'https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=1&ninja_table_public_nonce=3a5901169d',
    'https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=2&ninja_table_public_nonce=3a5901169d',
    'https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=3&ninja_table_public_nonce=3a5901169d',
  ]
  let allSongs: IParsedSong[] = [] 

  await Promise.all(urls.map(async (url) => {
    try {
      const songsResponse = await fetch(url)
      const songs: ISong[] = await songsResponse.json() 
      const parsedArray: IParsedSong[] = []

      songs.splice(0, 20).forEach(song => {
        const songName = song.value.nameofthesong ? parseName(song.value.nameofthesong) : ''
        const songCode = +song.value.robloxcode.replace('<k1>', '').replace('</k1>', '')

        parsedArray.push({
          songName,
          songCode
        })
      })

      allSongs = [...allSongs, ...parsedArray]
    } catch (error) {
      console.log('error', error);
    }
  }))

  const apiKeyFile = path.join(process.cwd(), '/api_key_spotify/key.txt')
  const apiKey: string = await fs.readFile(apiKeyFile, 'utf-8')

  return { 
    props: { allSongs, apiKey },
    revalidate: 3600,
  }
}

export default Home

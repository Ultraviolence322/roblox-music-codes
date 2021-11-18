// types 
import type { InferGetStaticPropsType } from 'next'
import { IParsedSong, ISong } from '../types/ISong'

import { promises as fs } from 'fs'
import path from 'path'

import { useEffect, useState } from 'react'

// helpers
import { fetchNewSong } from '../helpers/fetchNewSong'
import { parseName } from '../helpers/parseName'
import { parseNameToView } from '../helpers/parseNameToView'

const Home = ({allSongs, apiKey}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [readySongs, setReadySongs] = useState<any[]>([])
  const [playedSongs, setPlayedSongs] = useState(0)
  const [isStarted, setIsStarted] = useState(false)

  const [deviceId, setDeviceId] = useState('')
  const [player, setPlayer] = useState<any>(null);

  const [currentTrack, setCurrentTrack] = useState<any>(null)

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

        if (state) {
          setCurrentTrack(state.track_window.current_track)
        }
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

      while(songs.length < 20) {
        const fetchedSong = await fetchNewSong(allSongs, countOfSongs, apiKey)
        if(fetchedSong && !songs.find((track: any) => track.id === fetchedSong.id)) {
          songs.push(fetchedSong)
        }
      }
      
      setReadySongs(songs)
    }

    getData()
  }, [])

  useEffect(() => {
    function startPlay(e: any) {
      if (e.code === 'KeyS') setIsStarted(true)
    }

    window.addEventListener('keydown', startPlay)

    return () => {
      window.removeEventListener('keydown', startPlay)
    }
  }, [])

  useEffect(() => {
    const getData = async () => {
      player?.nextTrack()
      player?.seek(readySongs[playedSongs]?.duration / 3).then(() => {
        setTimeout(() => {
          setPlayedSongs(playedSongs => playedSongs + 1)
        }, 6000)
      });
    }

    window.scrollBy({
      top: document.documentElement.clientHeight,
      behavior: "smooth"
    })
    getData()
  }, [playedSongs])

  useEffect(() => {
    const start = async () => {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        body: JSON.stringify({
          uris: readySongs.map(e => `spotify:track:${e.id}`,),
          "position_ms": readySongs[0]?.duration / 3
        }),
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        method: "PUT"
      })
  
      setTimeout(() => {
        setPlayedSongs(playedSongs + 1)
      }, 6000)
    }

    if(isStarted) start()
  }, [isStarted])

  const trackNameClassName = () => {
    let className = `
      px-4
      w-full 
      absolute top-1/3 2xl:top-72
      transform  
      text-9xl font-black text-center text-white text-shadow
    `
    return className
  }

  const trackCodeClassName = () => {
    let className = `
      w-full 
      absolute bottom-1/3 2xl:bottom-60
      transform  
      2xl:text-11xl text-10xl font-black text-center text-white text-shadow
    `
    return className
  }

  return (
    <div>
      <ul>
        {
          readySongs.map((e, index) => {
            return (
              <li className={'h-auto current-song relative'} key={e.id}>
                <img className='w-screen h-screen filter blur-md' src={e?.image} alt="image" />
                <p className={trackNameClassName()}>
                  {parseNameToView(e?.songName)}
                </p>
                <p className={trackCodeClassName()}>
                  {e?.songCode}
                </p>
              </li>
            )
          })
        }
      </ul>
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

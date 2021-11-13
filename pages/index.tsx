import type { InferGetStaticPropsType } from 'next'
import { IParsedSong, ISong } from '../types/ISong'

import { promises as fs } from 'fs'
import path from 'path'
import { useEffect, useState } from 'react'
import { fetchNewSong } from '../helpers/fetchNewSong'
import { parseName } from '../helpers/parseName'

const Home = ({allSongs, apiKey}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [readySongs, setReadySongs] = useState<IParsedSong[]>([])
  const countOfSongs: number = allSongs.length

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

  const prevSong = () => {

  } 

  const nextSong = async () => {
    const fetchedSong: IParsedSong | null = await fetchNewSong(allSongs, countOfSongs, apiKey)

    if(fetchedSong) {
      setReadySongs([...readySongs, fetchedSong])
    }
  } 
  
  console.log('readySongs', readySongs);
  
  return (
    <div className="bg-red-300 ">
      <div>
        <button onClick={prevSong}>prev</button>
        <button onClick={nextSong}>next</button>
      </div>
      <ul>
        {
          readySongs.map((e: any, index: any) => {
            return (
              <li key={index}>
                <p><span>{index}. </span> {e.songName} - {e.songCode}</p>
                <iframe src={`https://open.spotify.com/embed/track/${e?.id}`}></iframe>
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

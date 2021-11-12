import type { InferGetStaticPropsType } from 'next'
import { IParseSong, ISong } from '../types/ISong'

import { promises as fs } from 'fs'
import path from 'path'

const Home = ({resArr}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <div className="bg-red-300 ">
      <ul>
        {
          resArr.map((e, index) => {
            return (
              <li key={index}>
                <p><span>{index}. </span> {e?.name} - {e?.code}</p>
                <iframe src={`https://open.spotify.com/embed/track/${e?.id}`}></iframe>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

function parseName(name: string): string {
  let result: string = ''
  let splittedName = name.split('>')
  result = splittedName[1].split('').splice(0, splittedName[1].length - 3).join('')

  return result
}

export const getStaticProps = async ( ) => {
  const res = await fetch(`https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&ninja_table_public_nonce=3a5901169d&chunk_number=0`)
  const data: ISong[] = await res.json()

  const apiKeyFile = path.join(process.cwd(), '/api_key_spotify/key.txt')
  const apiKey = await fs.readFile(apiKeyFile, 'utf-8')

  const resArr: (IParseSong | null)[] = await Promise.all(data.splice(0, 20).map( async (e) => {
    const songName = e.value.nameofthesong ? parseName(e.value.nameofthesong) : ''
    const songCode = +e.value.robloxcode

    try {
      const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${songName}&type=track&limit=1`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ANYTHING_WILL_WORK_HERE',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
      })
      const searchData = await searchResponse.json()
      console.log('searchData', searchData);
      

      if (searchData.tracks?.items[0]) {
        return {
          id: searchData.tracks.items[0].id,
          name: songName,
          code: songCode,
        }
      } else {
        return null
      }
    } catch (error) {
      console.log('error', error);
      return null
    } 
  })) 

  return { 
    props: { resArr: resArr.filter(e => !!e) },
    revalidate: 3600,
  }
}

// https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&ninja_table_public_nonce=3a5901169d&chunk_number=0
// https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=1&ninja_table_public_nonce=3a5901169d
// https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=2&ninja_table_public_nonce=3a5901169d
// https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=3&ninja_table_public_nonce=3a5901169d

export default Home

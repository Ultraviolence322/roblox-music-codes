import type { GetServerSideProps, NextPage } from 'next'
import { IParseSong, ISong } from '../types/IParseSong'

interface PropType {
  resArr: IParseSong[]
}

const Home = ({resArr}: PropType) => {
  return (
    <div className="bg-red-300 ">
      <ul>
        {
          resArr.map((e, index) => {
            return (
              <li>
                <span>{index}. </span>
                <p>{e.name}</p>
                <p>{e.code}</p>
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&ninja_table_public_nonce=3a5901169d&chunk_number=0`)
  const data: ISong[] = await res.json()

  const resArr: IParseSong[] = data.splice(0, 10).map(e => {
    return {
      id: Date.now(),
      name: e.value.nameofthesong ? parseName(e.value.nameofthesong) : '',
      code: +e.value.robloxcode,
    }
  })

  return { props: { resArr } }
}

// https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&ninja_table_public_nonce=3a5901169d&chunk_number=0
// https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=1&ninja_table_public_nonce=3a5901169d
// https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=2&ninja_table_public_nonce=3a5901169d
// https://robloxmusics.com/wp-admin/admin-ajax.php?action=wp_ajax_ninja_tables_public_action&table_id=44265&target_action=get-all-data&default_sorting=new_first&skip_rows=0&limit_rows=0&chunk_number=3&ninja_table_public_nonce=3a5901169d

export default Home

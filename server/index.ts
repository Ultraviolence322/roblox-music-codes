import express, { Request, Response } from "express";
import next from "next";
import request from 'request'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import schedule from 'node-schedule'

import { promises as fs } from 'fs'
import path from 'path'

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

let client_id = '4bbb0b6df015481eb15a3ac94173c591'; 
let client_secret = '5c21c780ac0f49189f0dff0e3563b73d'; 

function updateApiKey() {
  console.log('key updated');
  
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, async function(error, response, body) {
    if (!error && response.statusCode === 200) {

      // use the access token to access the Spotify Web API
      var token = body.access_token;

      const apiKeyFile = path.join(process.cwd(), '/api_key_spotify/key.txt')
      await fs.writeFile(apiKeyFile, token)
    }
  });
}

(async () => {
  try {
    await app.prepare();
    const server = express();
    updateApiKey()

    schedule.scheduleJob('0 */55 * * * *', function(){
      updateApiKey()
    });

    server
    .use(cors())
    .use(cookieParser());

    server.get("*", (req: Request, res: Response) => {
      return handle(req, res);
    });

    server.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(`> Ready on localhost:${port}`);
    });


  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
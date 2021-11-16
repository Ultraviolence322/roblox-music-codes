import express, { Request, Response } from "express";
import next from "next";
import request from 'request'
import schedule from 'node-schedule'

import { promises as fs } from 'fs'
import path from 'path'

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

let spotify_client_id = 'fc3d3fca8d8744cdbc4ed25ca37f0233'; 
let spotify_client_secret = '34db08733cca48d995d23a5487ec8bba'; 
let spotify_redirect_uri = 'http://localhost:3000/auth/callback'

let access_token = 'BQDdHYmEqTKZdB8fYe3r2LRFLlMe9X7dvbzj_uR1Jdt7GSkdhaPpr3hKAEWzIuCkuMlgX8-Vyf1g5FgypYVkBNwjsNtKHCMYDvKaUnWCAbCe6SQYdDpcz-OSMMcoJY8lnGYDemG0-K_-B3yEoO1D_-8QgF5qPV6eKqRZyDHgejK5XuvznI6DXbqdF5cWrn8'
let refresh_token = 'AQCWzIUJY0NwWOiZ4vQD1ims5_Rde8h1k2pSWlLY-YzZpV6VUn_IGsDvM1aYp8sqYdpapismHrBEKhk1f2z0hSCuve9CR_GRIelLkekW2AP5CPbxtmBje8h386T8C0j66Gk'
let updatedDate = 0

var generateRandomString = function (length: any) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

(async () => {
  try {
    await app.prepare();
    const server = express();

    request.get('http://localhost:3000/refresh_token')

    schedule.scheduleJob('0 */55 * * * *', function(){
      request.get('http://localhost:3000/refresh_token')
    });

    server.get('/auth/login', (req, res) => {
      var scope = "streaming user-read-email user-read-private user-read-currently-playing user-read-playback-state"
      var state = generateRandomString(16);
    
      var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: spotify_redirect_uri,
        state: state
      })
    
      res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
    })
    
    server.get('/auth/callback', (req, res) => {
      var code = req.query.code;
    
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: spotify_redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
          'Content-Type' : 'application/x-www-form-urlencoded'
        },
        json: true
      };
    
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          
          access_token = body.access_token;
          refresh_token = body.refresh_token;
          updatedDate = Date.now()
          res.redirect('/')
        }
      });
    })

    server.get('/refresh_token', function(req, res) {
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        },
        json: true
      };
    
      request.post(authOptions, async function(error, response, body) {
        if (!error && response.statusCode === 200) {
          
          access_token = body.access_token;
          updatedDate = Date.now()

          const apiKeyFile = path.join(process.cwd(), '/api_key_spotify/key.txt')
          await fs.writeFile(apiKeyFile, access_token)

          res.json({ access_token, updatedDate: Date.now()})
        }
      });
    });
    
    server.get('/auth/token', (req, res) => {
      res.json({ access_token, updatedDate})
    })

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
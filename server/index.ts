import express, { Request, Response } from "express";
import next from "next";
import querystring from 'query-string'
import request from 'request'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { promises as fs } from 'fs'
import path from 'path'

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

let client_id = '4bbb0b6df015481eb15a3ac94173c591'; 
let client_secret = '5c21c780ac0f49189f0dff0e3563b73d'; 
let redirect_uri = 'http://localhost:3000/callback'; 

let generateRandomString = function(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let stateKey = 'spotify_auth_state';


(async () => {
  try {
    await app.prepare();
    const server = express();

    server
    .use(cors())
    .use(cookieParser());

    server.get('/login', function(req, res) {

      var state = generateRandomString(16);
      res.cookie(stateKey, state);
    
      var scope = 'user-read-private user-read-email';
      res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: client_id,
          scope: scope,
          redirect_uri: redirect_uri,
          state: state
        }));
    });
    
    server.get('/callback', function(req, res) {
      var code = req.query.code || null;
      var state = req.query.state || null;
      var storedState = req.cookies ? req.cookies[stateKey] : null;
    
      if (state === null || state !== storedState) {
        res.redirect('/#' +
          querystring.stringify({
            error: 'state_mismatch'
          }));
      } else {
        res.clearCookie(stateKey);
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
          },
          headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
          },
          json: true
        };
    
        request.post(authOptions, async function(error, response, body) {
          if (!error && response.statusCode === 200) {
    
            var access_token = body.access_token,
                refresh_token = body.refresh_token;

            const apiKeyFile = path.join(process.cwd(), '/api_key_spotify/key.txt')
            await fs.writeFile(apiKeyFile, access_token)
    
            res.redirect('/?' +
              querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
              }));
          } else {
            res.redirect('/#' +
              querystring.stringify({
                error: 'invalid_token'
              }));
          }
        });
      }
    });
    
    server.get('/refresh_token', function(req, res) {
      var refresh_token = req.query.refresh_token;
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        },
        json: true
      };
    
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var access_token = body.access_token;
          res.send({
            'access_token': access_token
          });
        }
      });
    });

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
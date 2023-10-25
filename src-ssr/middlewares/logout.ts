import axios from 'axios';
import bodyParser from 'body-parser';
import { ssrMiddleware } from 'quasar/wrappers';
import { getDiscordUser } from '../utils/auth';
export default ssrMiddleware(async ({ app, resolve }) => {
  app.use(bodyParser.json());
  app.all(resolve.urlPath('*'), async (req, res, next) => {
    if (req.url.startsWith('/' + process.env.URL_SEGMENT_FOR_LOGOUT)) {
      const user = await getDiscordUser(req.headers.cookie);
      if (!user) {
        res.status(403).json({
          message: 'You must be logged in.',
        });
        return;
      }

      try {
        const paramsToSend: Record<string, string> = {
          client_id: process.env.DISCORD_OOTR_LADDER_ID as string,
          client_secret: process.env.DISCORD_CLIENT_SECRET as string,
          token: req.headers.cookie as string,
        };
        const bodyParams = Object.entries(paramsToSend)
          .map(([key, value]) => {
            return (
              value &&
              `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            );
          })
          .join('')
          .substring(1);
        await axios.post(
          `${process.env.DISCORD_API_ENDPOINT}/oauth2/token/revoke`,
          bodyParams,
          {
            headers: {
              'Content-type': 'application/x-www-form-urlencoded',
            },
          }
        );
        res.cookie('tokenData', null, { expires: new Date(Date.now() + 0), httpOnly: true }).status(200).json();
        return;
      } catch (error: any) {
        if ((error.response?.status ?? 0) === 404) {
          res.status(404).json();
          return;
        }
        console.log(error);
        res.status(500).json({
          message: `An error has occured in match : ${error}`,
        });
        return;
      }
    }
    next();
  });
});

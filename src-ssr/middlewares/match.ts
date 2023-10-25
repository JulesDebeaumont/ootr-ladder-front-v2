import axios from 'axios';
import bodyParser from 'body-parser';
import { ssrMiddleware } from 'quasar/wrappers';
import { getDiscordUser } from '../utils/auth';
export default ssrMiddleware(async ({ app, resolve }) => {
  app.use(bodyParser.json());
  app.all(resolve.urlPath('*'), async (req, res, next) => {
    if (
      req.url.startsWith('/' + process.env.URL_SEGMENT_FOR_MATCH_EDITION) &&
      req.method === 'POST'
    ) {
      const matchId = req.query['id'];
      if (!matchId) {
        res.status(422).json({
          message: 'Query param is missing : id',
        });
        return;
      }

      const user = await getDiscordUser(req.headers.cookie);
      if (!user) {
        res.status(403).json({
          message: 'You must be logged in.',
        });
        return;
      }

      try {
        const matchInfo = await axios.post(
          `${process.env.LADDER_BOT_HOSTNAME}/match/${matchId}?discordUsername=${user.username}`,
          req.body,
          {
            headers: {
                'X-ApiKey': process.env.LADDER_BOT_API_KEY
            }
          }
        );
        res.status(200).json(matchInfo.data);
        return;
      } catch (error: any) {
        if ((error.response?.status ?? 0) === 404) {
          res.status(404).json()
          return
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

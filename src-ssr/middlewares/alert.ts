import axios from 'axios';
import { ssrMiddleware } from 'quasar/wrappers';
import { getDiscordUser } from '../utils/auth';
export default ssrMiddleware(async ({ app, resolve }) => {
  app.all(resolve.urlPath('*'), async (req, res, next) => {
    if (
      req.url.startsWith('/' + process.env.URL_SEGMENT_FOR_ALERT) &&
      req.method === 'POST'
    ) {
      const sessionId = req.query['id'];
      const stateAlert = Boolean(req.query['active']);
      if (!sessionId || !stateAlert) {
        res.status(422).json({
          message: 'Query params are missing : id, active',
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
        if (stateAlert === true) {
          const matchInfo = await axios.post(
            `${process.env.LADDER_BOT_HOSTNAME}/player/${user.username}/alert=${sessionId}`,
            {},
            {
              headers: {
                'X-ApiKey': process.env.LADDER_BOT_API_KEY,
              },
            }
          );
          res.status(200).json(matchInfo.data);
          return;
        } else {
          const matchInfo = await axios.delete(
            `${process.env.LADDER_BOT_HOSTNAME}/player/${user.username}/alert=${sessionId}`,
            {
              headers: {
                'X-ApiKey': process.env.LADDER_BOT_API_KEY,
              },
            }
          );
          res.status(200).json(matchInfo.data);
          return;
        }
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

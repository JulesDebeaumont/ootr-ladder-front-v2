import { ssrMiddleware } from 'quasar/wrappers';
import { getDiscordUser, getUserProfile } from '../utils/auth';
export default ssrMiddleware(async ({ app, resolve }) => {
  app.all(resolve.urlPath('*'), async (req, res, next) => {
    if (req.url.startsWith('/' + process.env.URL_SEGMENT_FOR_DISCORD_PROFILE)) {
      try {
        const userDataDiscord = await getDiscordUser(req.headers.cookie);
        if (!userDataDiscord) {
          res.status(200).json({});
          return;
        }
        if (userDataDiscord.email === null) {
          res.status(400).json({
            message:
              'No e-mail linked to this account. Make sure everything is correctly set up in your account.',
          });
          return;
        }

        res.status(200).json(userDataDiscord);
        return;
      } catch (error: any) {
        if (error.response.status === 404) {
          res.status(404).json()
          return
        }
        console.log(error);
        res.status(500).json({
          message: `An error has occured in discord-profile : ${error}`,
        });
        return;
      }
    }
    next();
  });
});

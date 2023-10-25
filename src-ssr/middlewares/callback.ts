import axios from 'axios';
import { ssrMiddleware } from 'quasar/wrappers';
import { IDiscordAPIResponse } from 'src/components/models';

export default ssrMiddleware(async ({ app, resolve }) => {
  app.all(resolve.urlPath('*'), async (req, res, next) => {
    if (req.url.startsWith('/' + process.env.URL_SEGMENT_FOR_AUTH_CALLBACK)) {
      try {
        const paramsToSend: Record<string, string> = {
          client_id: process.env.DISCORD_OOTR_LADDER_ID as string,
          client_secret: process.env.DISCORD_CLIENT_SECRET as string,
          grant_type: 'authorization_code',
          code: req.query.code as string,
          redirect_uri: `${process.env.DOMAIN}/${process.env.URL_SEGMENT_FOR_AUTH_CALLBACK}`,
        };
        const responseLoginDiscord = await axios.post(
          `${process.env.DISCORD_API_ENDPOINT}/oauth2/token`,
          Object.entries(paramsToSend)
            .map(([key, value]) => {
              return (
                value &&
                `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`
              );
            })
            .join('')
            .substring(1),
          {
            headers: {
              'Content-type': 'application/x-www-form-urlencoded',
            },
          }
        );
        const tokenData = responseLoginDiscord.data as IDiscordAPIResponse;
        if (tokenData.error) {
          res.status(403).json({
            message: `An error has occured with the tokenData : ${tokenData.error}`,
          });
          return;
        }
        
        res.cookie('tokenData', tokenData, { expires: new Date(Date.now() + 36_000_000 /* 10H */), httpOnly: true }).redirect('/profile')
        return
      } catch (error: any) {
        if ((error.response?.status ?? 0) === 404) {
          res.status(404).json()
          return
        }
        console.error(error);
        res.status(500).json({
          message: `An error has occured in api-proxy-auth : ${error}`,
        });
        return;
      }
    }

    next();
  });
});

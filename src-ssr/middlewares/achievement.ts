import axios from 'axios';
import bodyParser from 'body-parser';
import NodeCache  from 'node-cache';
import { ssrMiddleware } from 'quasar/wrappers';
import { ICacheAchievementData } from 'src/components/models';
export default ssrMiddleware(async ({ app, resolve }) => {
  app.use(bodyParser.json());
  app.all(resolve.urlPath('*'), async (req, res, next) => {
    if (req.url.startsWith('/' + process.env.URL_SEGMENT_FOR_ACHIEVEMENT)) {
      try {
        const keyForAchievement = 'achievements'
        const timeLimitBeforeRefetching = 1000 * 60 * 60 * 24 * 3 // 3 days
        const nodeCache = new NodeCache()
        const cachedAchievementData = nodeCache.get(keyForAchievement) as ICacheAchievementData | undefined
        let achievements: ICacheAchievementData['data'] = []
        if (cachedAchievementData && (new Date().getTime() - new Date(cachedAchievementData.fetchedOn).getTime()) < timeLimitBeforeRefetching) {
          achievements = cachedAchievementData.data
        } else {
          achievements = (await axios.get(`${process.env.LADDER_BOT_HOSTNAME}/data/achievements`)).data;
          nodeCache.set(keyForAchievement, { fetchedOn: new Date(), data: achievements })
        }
        res.status(200).json(achievements);
        return;
      } catch (error: any) {
        if ((error.response?.status ?? 0) === 404) {
          res.status(404).json()
          return
        }
        console.log(error);
        res.status(500).json({
            message: `An error has occured in achievement : ${error}`,
        });
        return;
      }
    }
    next();
  });
});

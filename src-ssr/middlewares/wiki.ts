import bodyParser from 'body-parser';
import {
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { ssrMiddleware } from 'quasar/wrappers';
import { IWiki } from 'src/components/models';
import { isUserAdmin } from '../utils/auth';
export default ssrMiddleware(async ({ app, resolve }) => {
  app.use(bodyParser.json());
  app.all(resolve.urlPath('*'), async (req, res, next) => {
    if (req.url.startsWith('/' + process.env.URL_SEGMENT_FOR_WIKI)) {
      const wikiPath = './data/wiki';
      const wikiFileExtension = '.md';
      const typeParam = req.query['type'];
      try {
        // get
        if (req.method === 'GET') {
          // by type
          if (typeParam) {
            const wikiContent = await readFileSync(
              `${wikiPath}/${typeParam}${wikiFileExtension}`,
              'utf8'
            );
            const statWiki = await statSync(
              `${wikiPath}/${typeParam}${wikiFileExtension}`
            );
            const wikiByType: IWiki = {
              title: typeParam as string,
              markdownBody: wikiContent,
              lastModifiedDate: statWiki.mtime.toLocaleDateString(),
            };
            res.status(200).json(wikiByType);
            return;
          }

          // index
          const allTypes = await readdirSync(wikiPath);
          res.status(200).json(
            allTypes.map((fileName) => {
              return fileName.replace(wikiFileExtension, '');
            })
          );
          return;
        }

        // patch/post
        if (req.method === 'PATCH' || req.method === 'POST') {
          if ((await isUserAdmin(req.headers.cookie)) === false) {
            res.status(403).json({});
            return;
          }
          await writeFileSync(
            `${wikiPath}/${typeParam}${wikiFileExtension}`,
            req.body.markdownBody
          );
          if (req.body.title !== typeParam) {
            await renameSync(
              `${wikiPath}/${typeParam}${wikiFileExtension}`,
              `${wikiPath}/${req.body.title}${wikiFileExtension}`
            );
          }
          res.status(200).json({});
          return;
        }

        // delete
        if (req.method === 'DELETE') {
          if ((await isUserAdmin(req.headers.cookie)) === false) {
            res.status(403).json({});
            return;
          }
          await unlinkSync(`${wikiPath}/${typeParam}${wikiFileExtension}`);
          res.status(200).json({});
          return;
        }
      } catch (error: any) {
        if ((error.response?.status ?? 0) === 404) {
          res.status(404).json()
          return
        }
        console.log(error);
        res.status(500).json({
          message: `An error has occured in wiki : ${error}`,
        });
        return;
      }
    }

    next();
  });
});

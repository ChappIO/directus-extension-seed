import { defineHook } from '@directus/extensions-sdk';
import { readFile } from 'node:fs/promises';
import { load as loadYaml } from 'js-yaml';
import { glob as globCB } from 'glob';
import { promisify } from "util";
export default defineHook(async ({ init }, { services, getSchema, database, env, logger }) => {
    const SEED_FILES = env.SEED_FILES;
    const glob = promisify(globCB);
    const accountability = {
        admin: true
    };
    init('app.before', async () => {
        if (!SEED_FILES) {
            logger.info('SEED_FILES is not set, skipping seeding');
            return;
        }
        const sourceFiles = (await Promise.all(SEED_FILES
            .split(':')
            .map((pattern) => glob(pattern))))
            .flatMap(set => set)
            .sort();
        if (sourceFiles.length === 0) {
            logger.warn('No seed files found');
            return;
        }
        else {
            logger.info(`Found ${sourceFiles.length} seed files:`);
            sourceFiles.forEach((file) => {
                logger.info(` - ${file}`);
            });
        }
        for (let sourceFile of sourceFiles) {
            const fileContents = await readFile(sourceFile, 'utf8');
            const dataSource = loadYaml(fileContents);
            for (let collectionName in dataSource) {
                const collection = new services.ItemsService(collectionName, {
                    knex: database,
                    schema: await getSchema(),
                    accountability,
                });
                const results = await collection.upsertMany(dataSource[collectionName]);
                logger.info(`Upserted ${results.length} items into ${collectionName}`);
            }
        }
    });
});

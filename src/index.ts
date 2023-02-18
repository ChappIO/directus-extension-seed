import {defineHook} from '@directus/extensions-sdk';
import {readFile, writeFile} from 'node:fs/promises';
import {load as loadYaml, dump as dumpYaml} from 'js-yaml';


export default defineHook(async ({init}, {services, getSchema, database, logger}) => {
    const accountability = {
        admin: true
    };

    async function importFile(sourceFile: string) {
        const fileContents = await readFile(sourceFile, 'utf8');
        const dataSource = loadYaml(fileContents) as Record<string, any>;

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

    init('cli.after', ({program}: any) => {

        const dataCommand = program.command('data');
        dataCommand
            .command('apply')
            .description('Seed .yaml files into your database.')
            .argument('<files...>')
            .action(async function (files: string[]) {
                for (let file of files) {
                    await importFile(file);
                }
            });
        dataCommand
            .command('snapshot')
            .description('Dump a table to a file')
            .requiredOption('-o, --output <targetFile>', 'The target output file')
            .argument('<collections...>')
            .action(async function (collections: string[], opts: any) {
                const data: Record<string, any[]> = {};

                for (let collectionName of collections) {
                    const collection = new services.ItemsService(collectionName, {
                        knex: database,
                        schema: await getSchema(),
                        accountability,
                    });
                    data[collectionName] = await collection.readByQuery({});
                }
                const yamlData = dumpYaml(data);
                await writeFile(opts.output, yamlData);
                process.exit(0);
            });
    });
});

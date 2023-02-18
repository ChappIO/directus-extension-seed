# Directus CLI Extension: Seed

**Note:** This extension is very much under development.
Use at own risk.

Seed your directus instance from .yml files from the CLI.

## Usage:

1. Install the extension: `npm install directus-extension-seed`.
2. Create your seed file: `00_directus_settings.yml`:
   ```yaml
   # This key is the collection to import into
   directus_settings:
    # directus_settings is a singleton collection so its id is always 1
     - id: 1
       project_name: My Backoffice
       project_url: https://thing.com
       project_color: #7B219F
   ```
3. Run `directus data apply ./path/to/your/file.yml`

Essentially, the .yml file contains your collection data which should be upserted.
Note that primary keys are required as they are used to determine if the image should be updated or added.

## Dumping data

1. Install the extension: `npm install directus-extension-seed`.
2. Run `directus data snapshot --output <targetFile> <collections...>` (For example: `directus data snapshot --output dump.yml directus_settings`)

## Some Examples:

To grant public read access to the `projects` collection:

```yaml
directus_permissions:
   - id: 1
     collection: projects
     role: null
     action: read
     fields: "*"
```

To create a role with full rights on the `projects` collection:

```yaml
directus_roles:
   - id: 8a4cabd2-53d9-4be4-9d23-5d27b459ef7f
     name: Project Manager
        
directus_permissions:
   - id: 2
     role: 8a4cabd2-53d9-4be4-9d23-5d27b459ef7f
     collection: projects
     action: create
     fields: "*"
   - id: 3
     role: 8a4cabd2-53d9-4be4-9d23-5d27b459ef7f
     collection: projects
     action: read
     fields: "*"
   - id: 4
     role: 8a4cabd2-53d9-4be4-9d23-5d27b459ef7f
     collection: projects
     action: update
     fields: "*"
   - id: 5
     role: 8a4cabd2-53d9-4be4-9d23-5d27b459ef7f
     collection: projects
     action: delete
     fields: "*"
```

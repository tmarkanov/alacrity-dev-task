## Alacrity platform engineering task

### Requirements
- Node.js >= 12.13
- application requires a PostgreSQL database named `encrypted_storage_dev` on `localhost` (port `5432`) and a user `alacrity` with password `alacrity`
- tests require another table named `encrypted_storage_test`

### Setup
- `npm install`
- `node migrations/initialMigration`

### Running
- `node index.js`

### Available routes
- `POST /api/encrypted-data` with payload `{ id: <string>, encryption_key: <string>, value: <string> }`
- `GET /api/encrypted-data?id=<string>&decryption_key=<string>`

### Notes
- API only allows requests with `Content-Type: application/json` header.
- `encryption_key` must be 32 characters long

### Tests
- tests can be run with `npm test`

import dbConfig from './db-config';
import FS from 'fs-extra';
import Path from 'path'

module.exports = {
    dbConfig,
    privateKey: FS.readFileSync(Path.resolve(__dirname, '.', 'jwt-keys', 'private.key')),
    publicKey: FS.readFileSync(Path.resolve(__dirname, '.', 'jwt-keys', 'public.key')),
};
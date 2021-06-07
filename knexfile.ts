// Update with your config settings.require('ts-node/register');
import dotenv from 'dotenv'
dotenv.config()
module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      loadExtensions: ['.ts'],
      extension: 'ts',
      tableName: 'knex_migrations',
      directory: __dirname + './src/database/migrations'
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  test: {
    client: 'mysql2',
    connection: {
      database: process.env.TEST_DB_NAME,
      user: process.env.DB_USERNAME,
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      loadExtensions: ['.ts'],
      extension: 'ts',
      tableName: 'knex_migrations',
      directory: __dirname + './src/database/migrations'
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }

};

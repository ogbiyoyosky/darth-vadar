import Knex from 'knex'
import dotenv from 'dotenv';
dotenv.config()

import * as knexObj from '../../knexfile'


module.exports = async () => {

    const knex = Knex(knexObj[process.env.NODE_ENV || 'test'])

    try {
      await knex.raw(`DROP DATABASE IF EXISTS darthvadar`)
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }


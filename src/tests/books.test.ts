import request from 'supertest'
import Knex from 'knex'
import {Model} from 'objection'
import app from '../app'
import * as knexObj from '../../knexfile'



describe('books', () => {
  let knex: any

  beforeAll(async () => {
    knex = Knex(knexObj['test'])
    Model.knex(knex)
  })

  afterAll(() => {
    knex.destroy()
  })

  it('should return 404 error ', async () => {
    const badId = 7500
    const {body: errorResult} = await request(app).get(`/books/${badId}`).expect(404)
  
  })
  
})
import request from 'supertest'
import * as ORM from "knex";
import app from '../app'
import dotenv from 'dotenv'
import { assert } from '@hapi/joi';
dotenv.config()
const knex = ORM.knex({
  client: 'mysql2',
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    port: Number(process.env.DB_PORT),
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
    directory: __dirname + '../../database/migrations'
  },
});


beforeAll(async()=> {
   await knex.migrate.rollback()
   await knex.migrate.latest()
},30000)

afterAll(async ()=> {
  await knex.migrate.rollback()
})


describe('Film management suites', () => {
  let token
  let refreshToken

  it('should register a user', async (done) => {
  
    const res = await request(app).post(`/api/auth/register`).send({
      "firstName": "Emmanuel",
      "lastName": "Ogbiyoyo",
      "email": "nuel@nueljoe.com",
      "password": "Miracle123ogbiyoyo"
     })
     expect(res.status).toBe(201)
     expect(res.body.data.firstName).toEqual('Emmanuel')
     done()
  })

  it('should login a user', async (done) => {
  
    const res = await request(app).post(`/api/auth/login`).send({
      "email": "nuel@nueljoe.com",
      "password": "Miracle123ogbiyoyo"
     })
     expect(res.status).toBe(200)
     expect(res.body.message).toEqual('Logged in successfully')
     token = res.body.data.token
     refreshToken = res.body.data.refreshToken
     done()
  })

  it('should return list of films', async (done) => {
  
    const res = await request(app).get(`/api/films`)
          .set("authorization",`Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data).not.toEqual(null)
    done()
  })

  it('should search for film and return response', async (done) => {
  
    const res = await request(app).get(`/api/films/?search=jedi`)
          .set("authorization",`Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data).not.toEqual(null)
    done()
  })

  it('should add a comment to film', async (done) => {
  
    const res = await request(app).post(`/api/films/1/comments`)
          .set("authorization",`Bearer ${token}`)
          .send({body: "this is a new comment"})
    expect(res.status).toBe(201)
    expect(res.body.data).not.toEqual(null)
    done()
  })

  it('should return comment on a film', async (done) => {
  
    const res = await request(app).get(`/api/films/1/comments`)
          .set("authorization",`Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data).not.toEqual(null)
    done()
  })
})

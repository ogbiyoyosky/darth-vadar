import request from 'supertest'
import * as ORM from "knex";
import app from '../app'
import dotenv from 'dotenv'
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

describe('User and Authentication management', () => {
  let token
  let refreshToken
 
  it('should register a user', async (done) => {
  
    const res = await request(app).post(`/api/auth/register`).send({
      "firstName": "Emmanuel",
      "lastName": "Ogbiyoyo",
      "email": "nuel@nueljoe.com",
      "password": "Miracle123ogbiyoyo"
     })
     console.log("STATUS_RES",res.body.data)
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
   
     refreshToken = res.body.data.refreshToken
     done()
  })
  
  it('should logout a user', async (done) => {
  
    const res = await request(app).post(`/api/auth/logout`).send({
      "refreshToken": refreshToken
     })
     expect(res.body.message).toEqual('Successfully logged out')
     expect(res.status).toBe(200)
     done()
  })
})

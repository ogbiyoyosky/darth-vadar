import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', t => {
        t.increments('id')
        t.string('firstName')
        t.string('lastName')
        t.string('email').unique()
        t.boolean('isActivated').defaultTo(0)
        t.string('activationToken')
        t.string('password')
        t.dateTime('deactivatedAt')
        t.boolean('isDeleted')
        t.string('role').defaultTo("user")
        t.timestamp('createdAt').defaultTo(knex.fn.now());
        t.timestamp('updatedAt').defaultTo(knex.fn.now());
        t.timestamp('deletedAt').defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users')
}


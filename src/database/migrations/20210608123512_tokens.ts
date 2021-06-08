import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('tokens', t => {
        t.increments('id')
        t.string('value')
        t.string('type')
        t.string('ownerId')
        t.dateTime('expiresAt')
        t.timestamp('createdAt').defaultTo(knex.fn.now());
        t.timestamp('updatedAt').defaultTo(knex.fn.now());
        t.timestamp('deletedAt').defaultTo(knex.fn.now());
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('tokens')
}


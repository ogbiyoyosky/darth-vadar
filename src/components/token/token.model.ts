import {Model, ModelObject} from 'objection'

export class Token extends Model {
  id!: string;
  value?: string;
  type?: string;
  ownerId?: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  static tableName = 'users' // database table name
  static idColumn = 'id' // id column name
}

export type TokenShape = ModelObject<Token>
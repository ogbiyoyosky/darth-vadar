import {Model, ModelObject} from 'objection'

export class User extends Model {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  isActivated!: boolean;
  activationToken: string;
  password!: string;
  deactivatedAt!: Date;
  isDeleted!: boolean
  role!: string;
  createdAt!: Date;
  updatedAt!: Date;
  
  static tableName = 'users' // database table name
  static idColumn = 'id' // id column name
}

export type UserShape = ModelObject<User>
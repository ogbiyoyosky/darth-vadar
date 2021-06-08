import { User } from '../user/user.model';
import {Model, ModelObject} from 'objection'

export class Comment extends Model {
  id!: number;
  userId: number;
  filmId: number;
  commentBody: string;
  createdAt: Date;
  

  static tableName = 'comments' 
  static idColumn = 'id' 

  static get relationMappings() {
    return {
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
                from: 'comments.userId',
                to: 'users.id'
            }
        }
    }
  }

  
}

export type CommentShape = ModelObject<Comment>
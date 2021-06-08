import { Response } from 'express';
import env from '../../helpers/env';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../../errors';
import apiRequest from "../../helpers/axios"
import { Comment } from './comment.model'
import logger from '../../logger';
import { ServiceMethodOptions } from '../../shared/types/ServiceMethodOptions';


export class CommentService {
  constructor(
    private readonly commentModel = Comment
  ) { }



  /**
   * Create a comment on a film
   */
  async createComment(filmId: string,payload, options?: ServiceMethodOptions): Promise<any> {
      
    try {
      await apiRequest.get(`/films/${filmId}`)
      logger.info(`Request film from /films/${filmId}`)
      const commentPayload ={
        commentBody: payload.body,
        userId: options.currentUser.id,
        filmId
      }
      const commentId = await this.commentModel.query().insert(commentPayload);
      logger.info(`response for fetch all film from /films/${filmId}`, JSON.stringify(commentId))
      return this.commentModel.query().findOne(commentId)
    } catch (error) {
      if(error.response?.status == 404) {
        logger.info(`${filmId}, does not exist`)
        throw new NotFoundError("You can't comment on a film that doesnot exist")
      } 
    }
  }

  /**
   * fetch a comment by film id
   */
  async fetchCommentsByFilmId(filmId: string , options: ServiceMethodOptions) {

    
    let { pagination: { limit, page } } = options
    console.log(limit, page)
    page =  page <= 1 ? 0 : page - 1
    return await this.commentModel.query().where({filmId: filmId }).withGraphFetched("user").orderBy('createdAt', 'desc').page(page, limit)
  }

  /**
   * fetch all comments on film
   */
  async fetchAllCommentsOnFilm(filmId: string ) {
    return await this.commentModel.query().where({filmId: filmId }).count()
  }


}
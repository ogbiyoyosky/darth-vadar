import { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';
import logger from '../../logger';
import { CurrentUserType } from '../../shared/types/CurrentUser';
import { FilmService } from './film.service';


export interface IFilmController {
  fetchFilms: RequestHandler,
  createCommentOnFlim: RequestHandler,
  getCommentOnFlim: RequestHandler
}

export function FilmControllerFactory(filmService: FilmService): IFilmController {
  return {
  
    /**
     * Fetch all films
     */
    async fetchFilms(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<any> {
      try {
        const { query: { search } } :any= req;
        const films = await filmService.fetchFilms(search);
        logger.info(JSON.stringify(films))
        return res.status(httpStatus.OK).json({
          message: 'Film successfully fetched',
          status: 'success',
          statusCode: httpStatus.OK,
          data: films,
        });
      } catch (error) {
        logger.info(error)
        next(error);
      }
    },

    /**
     * create comment on film
     */
     async createCommentOnFlim(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<any> {
      const { params, body, user } = req;
      try {
        const films: any= await filmService.createFilmComment(params.filmId, body, { currentUser: user } );
        logger.info(JSON.stringify(films))
        return res.status(httpStatus.CREATED).json({
          message:  'Comment successfully added',
          status: 'success',
          statusCode: httpStatus.CREATED,
          data: films,
        });

      } catch (error) {
        logger.info(error)
        next(error);
      }
    },

    /**
     * Fetch all comments on film
     */
     async getCommentOnFlim(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<any> {
      const { params, query: {page, limit} } :any= req;
      try {
        const films: any= await filmService.getCommentOnFlim(params.filmId, { pagination: {
          page: Number(page),
          limit: Number(limit)
        }} );

        logger.info(JSON.stringify(films))
        return res.status(httpStatus.OK).json({
          message:  'Successfully fetch comments',
          status: 'success',
          statusCode: httpStatus.Ok,
          data: films,
        });

      } catch (error) {
        logger.info(error)
        next(error);
      }
    },


    
  }
}

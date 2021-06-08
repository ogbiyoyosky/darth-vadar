import { Response } from 'express';
import env from '../../helpers/env';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../../errors';
import apiRequest from "../../helpers/axios"
import { CommentService } from '../comment/comment.service';
import { ServiceMethodOptions } from '../../shared/types/ServiceMethodOptions';
import logger from '../../logger';
import { redisClient } from '../../redis.connection';



export class FilmService {
  constructor(
    private readonly commentService: CommentService,
  ) { }

  /**
   * fetch films
   */
  async fetchFilms(search: string): Promise<any> {
    try {
      let url = '/films/'
      url = search ? url + '?' + 'search=' + search : url
      logger.info(`fetch all film from swapi ${url}`)
      //check cache
      return new Promise((resolve, reject) => {
        logger.info("Checking films in cache")
        redisClient.GET(`films`, async (err, result) => {
          logger.info("Internal Server Error")
          if (err) {
            logger.info("Internal Server Error")
            reject(Error("Internal Server Error"));
          }

          if (result) {
            logger.info("films gotten from cache")
            resolve(JSON.parse(result));
          } else {
            logger.info("Making api request from films")
            const films = await apiRequest.get(url)
            const filmApiResult = films.data.results
            if(!search) {
              redisClient.SET(
                'films',
                JSON.stringify(filmApiResult),
                "EX",
                365 * 24 * 60 * 60,
                (err, reply) => {
  
                  if (err) {
                    logger.info("Internal Server Error")
                    reject(new Error("Internal Server Error"));
  
                  }
                  logger.info("films gotten from swapApi")
                  resolve(filmApiResult);
                }
              );
            }
            resolve(filmApiResult);
          }
        });

      }).then(async (data: any) => {
       
        const filmsResult = data
        logger.info(`response for fetch all film from swapi ${JSON.stringify(filmsResult)}`)
        await Promise.all( filmsResult.map(async (film) => {
          const commentCount = await this.commentService.fetchAllCommentsOnFilm(film.episode_id)
          film.comment_count = commentCount[0]["count(*)"]
          return film
        }))
        const newResult = this.sortFilmsByDate(filmsResult)
  
        return newResult
      })

    } catch (error) {
      logger.info(JSON.stringify(error))
      throw new BadRequestError('Unable to fetch films')
    }
  }

  /**
   * @method sort films by release date
   * @param films
   * @returns 
   */
  sortFilmsByDate(films): any {
    return films.sort((a, b) => b.release_date - a.release_date)
  }

  /**
  * create film comment
  */
  async createFilmComment(filmId: string, payload, options: ServiceMethodOptions): Promise<any> {
    return this.commentService.createComment(filmId, payload, options)
  }

  /**
  * get comment on film
  */
  async getCommentOnFlim(filmId: string, options: ServiceMethodOptions): Promise<any> {
    try {
      await apiRequest.get(`/films/${filmId}`)
      logger.info(`fetch all comments on film from--  films/${filmId}`)

      return this.commentService.fetchCommentsByFilmId(filmId, options)
    } catch (error) {
      if (error.response?.status == 404) {
        logger.info(`${filmId}, does not exist`)
        throw new NotFoundError("You can't comment on a film that doesnot exist")
      }
    }
  }




}
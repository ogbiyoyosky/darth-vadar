import { NextFunction, Response } from 'express';
import env from '../../helpers/env';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../../errors';
import apiRequest from "../../helpers/axios"
import logger from '../../logger';


export class CharacterService {
  constructor(
  
  ) {}

  /**
   * fetch films
   */
  async fetchFilms(search: string): Promise<any> {
    try {
        

    } catch (error) {
      logger.info("Unable to fetch films")
      throw new BadRequestError('Unable to fetch films')
    }
  }

  async fetchCharacters(orderByField, order): Promise<any> {
    try {
        

    } catch (error) {
      logger.info("Unable to fetch films")
      throw new BadRequestError('Unable to fetch films')
    }
  }


  
  
  
}
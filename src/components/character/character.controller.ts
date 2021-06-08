import { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';
import logger from '../../logger';
import { CurrentUserType } from '../../shared/types/CurrentUser';
import { CharacterService } from './character.service';


export interface ICharacterController {
  fetchCharacters: RequestHandler,
}

export function CharacterControllerFactory(characterService: CharacterService): ICharacterController {
  return {
  
    /**
     * Fetch film characters
     */
    async fetchCharacters(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<any> {
      try {
        const { query: { orderBy, order } } :any= req;
        console.log({ orderBy, order })
        const films = await characterService.fetchCharacters(orderBy, order);
        logger.info(JSON.stringify(films))
        return res.status(httpStatus.OK).json({
          message: 'Characters successfully fetched',
          status: 'success',
          statusCode: httpStatus.OK,
          data: films,
        });
      } catch (error) {
        logger.info(JSON.stringify(error))
        next(error);
      }
    }

  }
}

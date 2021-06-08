import { NextFunction, Response } from 'express';
import env from '../../helpers/env';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../../errors';
import apiRequest from "../../helpers/axios"
import logger from '../../logger';


export class CharacterService {
  constructor() { }

  /**
   * Fetch character by an order
   * @param orderByField 
   * @param order 
   */
  async fetchCharacters(orderByField, order): Promise<any> {



    if (!['name', 'gender'].includes(orderByField)) {
      throw new BadRequestError("Invalid Filter for ordering. filter can only be by gender or name")
    }

    if (!['asc', 'desc'].includes(order)) {
      throw new BadRequestError("order param can only be asc or desc")
    }
    if ((order && !orderByField) || (!order && orderByField)) {
      throw new BadRequestError("incomplete filter parameters")
    }

    let url = '/people/'
    logger.info(`fetch characters from swapi ${url}`)
    const characters = await apiRequest.get(url)
    const characterApiResult = characters.data.results
    logger.info(`fetch characters  from swapi ${url}`)
    if (orderByField) {
      return this.orderCharactersByField(orderByField, order, characterApiResult)
    }
    console.log("HHHH")
    return characterApiResult
  }

  /**
   *  Order characters
   * @param orderBy 
   * @param order 
   * @param characters 
   * @returns 
   */
  orderCharactersByField(orderBy: string, order: string, characters: []): any {
    return characters.sort((a:any, b: any) => {
      if (order = 'asc') {
        return a[orderBy].localeCompare(b[orderBy]);
        
      }
      return b[orderBy].localeCompare(a[orderBy]);

    })
  }





}
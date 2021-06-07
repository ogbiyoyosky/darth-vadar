
import { commentService } from '../comment';
import Guards from '../../shared/guards';
import { CharacterControllerFactory } from './character.controller';
import { CharacterRouter } from './character.router';
import { CharacterService } from './character.service';



export const characterService = new CharacterService();

export const characterController = CharacterControllerFactory(characterService);

export const filmRouter = CharacterRouter({
  controller: characterController,
  guards: Guards,
});

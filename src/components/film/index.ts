
import { commentService } from '../comment';
import Guards from '../../shared/guards';
import { FilmControllerFactory } from './film.controller';
import { FilmRouter } from './film.router';
import { FilmService } from './film.service';
import { FilmValidator } from './film.dto';


export const filmService = new FilmService(
  commentService
  );

export const filmController = FilmControllerFactory(filmService);

export const filmRouter = FilmRouter({
  controller: filmController,
  guards: Guards,
  validator: new FilmValidator()
});

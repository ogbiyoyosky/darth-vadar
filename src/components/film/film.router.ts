import { Router } from "express";
import { IFilmController } from "./film.controller";
import { ComponentRouterOptions } from '../../shared/types/ComponentRouterOptions';
import { FilmValidator } from "./film.dto";

export function FilmRouter(options: ComponentRouterOptions<IFilmController, FilmValidator>): Router {
    const { controller, guards, validator } = options;
    const router = Router();

    /**
     * @fetchFilms - fetch films
     */
    router.get("/",guards.AuthGuard({ strict: true }), controller.fetchFilms);

    router.route("/:filmId/comments")
    .post(validator.createCommentValidator.validate, guards.AuthGuard({ strict: true }), controller.createCommentOnFlim)
    .get(guards.AuthGuard({ strict: true }), controller.getCommentOnFlim)

    return router;
}

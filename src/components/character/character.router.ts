import { Router } from "express";
import { ICharacterController } from "./character.controller";
import { ComponentRouterOptions } from '../../shared/types/ComponentRouterOptions';


export function CharacterRouter(options: ComponentRouterOptions<ICharacterController, {}>): Router {
    const { controller, guards, validator } = options;
    const router = Router();

    /**
     * @fetchFilms - fetch films
     */
    router.get("/",controller.fetchCharacters);

    router.route("/characters")
    .get(guards.AuthGuard({ strict: true }), controller.fetchCharacters)

    return router;
}

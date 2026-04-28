package com.pokesobres.controller;

import com.pokesobres.service.AlbumService;
import io.javalin.http.Context;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class AlbumController {
    private static AlbumService albumService = new AlbumService();
    private static ObjectMapper mapper = new ObjectMapper();

    public static void getAlbum(Context ctx) {
        try {
            int userId = Integer.parseInt(ctx.pathParam("userId"));
            ctx.status(200).json(albumService.getUserAlbum(userId));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }

    public static void toggleFavorite(Context ctx) {
        try {
            Map<String, Object> body = mapper.readValue(ctx.body(), new TypeReference<Map<String, Object>>(){});
            
            if (!body.containsKey("userId") || !body.containsKey("cardId")) {
                ctx.status(400).json(Map.of("error", "Faltan datos en la petición."));
                return;
            }

            int userId = (Integer) body.get("userId");
            int cardId = (Integer) body.get("cardId");

            boolean success = albumService.toggleFavorite(userId, cardId);
            if(success) {
                ctx.status(200).json(Map.of("message", "Favorito actualizado."));
            } else {
                ctx.status(400).json(Map.of("error", "No se encontró la carta en el álbum del usuario."));
            }
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }
}

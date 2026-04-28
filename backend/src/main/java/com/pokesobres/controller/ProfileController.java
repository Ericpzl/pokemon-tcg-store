package com.pokesobres.controller;

import com.pokesobres.service.ProfileService;
import io.javalin.http.Context;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public class ProfileController {
    private static ProfileService profileService = new ProfileService();
    private static ObjectMapper mapper = new ObjectMapper();

    public static void addFunds(Context ctx) {
        try {
            Map<String, Object> body = mapper.readValue(ctx.body(), new TypeReference<Map<String, Object>>(){});
            
            if (!body.containsKey("userId") || !body.containsKey("amount")) {
                ctx.status(400).json(Map.of("error", "Faltan datos en la petición."));
                return;
            }

            int userId = (Integer) body.get("userId");
            int amount = (Integer) body.get("amount");

            int newBalance = profileService.addFunds(userId, amount);
            
            ctx.status(200).json(Map.of("message", "Saldo añadido con éxito", "newBalance", newBalance));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }
}


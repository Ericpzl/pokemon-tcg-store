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

    public static void updateProfile(Context ctx) {
        try {
            Map<String, Object> body = mapper.readValue(ctx.body(), new TypeReference<Map<String, Object>>(){});
            
            if (!body.containsKey("userId")) {
                ctx.status(400).json(Map.of("error", "Falta el ID de usuario."));
                return;
            }

            int userId = (Integer) body.get("userId");
            String newEmail = body.containsKey("newEmail") ? (String) body.get("newEmail") : null;
            String currentPassword = body.containsKey("currentPassword") ? (String) body.get("currentPassword") : null;
            String newPassword = body.containsKey("newPassword") ? (String) body.get("newPassword") : null;
            String newAvatarUrl = body.containsKey("newAvatarUrl") ? (String) body.get("newAvatarUrl") : null;

            com.pokesobres.model.User updatedUser = profileService.updateProfile(userId, currentPassword, newEmail, newPassword, newAvatarUrl);
            
            ctx.status(200).json(updatedUser);
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }
}


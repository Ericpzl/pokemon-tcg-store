package com.pokesobres.controller;

import com.pokesobres.service.AuthService;
import com.pokesobres.model.User;
import com.pokesobres.util.JsonUtil;
import io.javalin.http.Context;
import java.util.Map;
import java.util.HashMap;

public class AuthController {
    private static AuthService authService = new AuthService();

    public static void register(Context ctx) {
        try {
            // Recibimos un JSON con las props del nuevo usuario
            Map<String, String> body = ctx.bodyAsClass(Map.class);
            String username = body.get("username");
            String email = body.get("email");
            String password = body.get("password");

            if(username == null || email == null || password == null) {
                ctx.status(400).json(Map.of("error", "Faltan campos obligatorios."));
                return;
            }

            User registeredUser = authService.register(username, email, password);
            ctx.status(201).json(registeredUser);

        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }

    public static void login(Context ctx) {
        try {
            Map<String, String> body = ctx.bodyAsClass(Map.class);
            String email = body.get("email");
            String password = body.get("password");

            if(email == null || password == null) {
                ctx.status(400).json(Map.of("error", "Faltan campos obligatorios."));
                return;
            }

            User user = authService.login(email, password);
            ctx.status(200).json(user);

        } catch (Exception e) {
            ctx.status(401).json(Map.of("error", e.getMessage()));
        }
    }
}

package com.pokesobres.controller;

import com.pokesobres.service.DailyRewardService;
import io.javalin.http.Context;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class DailyRewardController {
    private static DailyRewardService service = new DailyRewardService();
    private static ObjectMapper mapper = new ObjectMapper();

    public static void getDailyStatus(Context ctx) {
        try {
            int userId = Integer.parseInt(ctx.pathParam("userId"));
            long msUntilNext = service.getMsUntilNextDaily(userId);
            ctx.status(200).json(Map.of("msUntilNext", msUntilNext));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }

    public static void claimDailyPack(Context ctx) {
        try {
            Map<String, Object> body = mapper.readValue(ctx.body(), new TypeReference<Map<String, Object>>(){});
            if (!body.containsKey("userId")) {
                ctx.status(400).json(Map.of("error", "Falta el userId"));
                return;
            }
            int userId = (Integer) body.get("userId");
            
            com.pokesobres.model.Card wonCard = service.claimDailyPack(userId);
            ctx.status(200).json(Map.of(
                "message", "Sobre diario abierto",
                "wonCard", wonCard
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }
}

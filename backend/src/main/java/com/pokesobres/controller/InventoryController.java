package com.pokesobres.controller;

import com.pokesobres.service.InventoryService;
import com.pokesobres.model.Card;
import io.javalin.http.Context;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

public class InventoryController {
    private static InventoryService inventoryService = new InventoryService();
    private static ObjectMapper mapper = new ObjectMapper();

    public static void getInventory(Context ctx) {
        try {
            int userId = Integer.parseInt(ctx.pathParam("userId"));
            ctx.status(200).json(inventoryService.getUserPacks(userId));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }

    public static void openPack(Context ctx) {
        try {
            Map<String, Object> body = mapper.readValue(ctx.body(), new TypeReference<Map<String, Object>>(){});
            
            if (!body.containsKey("userId") || !body.containsKey("expansionId")) {
                ctx.status(400).json(Map.of("error", "Faltan datos en la petición."));
                return;
            }

            int userId = (Integer) body.get("userId");
            int expansionId = (Integer) body.get("expansionId");

            Card wonCard = inventoryService.openPack(userId, expansionId);
            List<Card> allCards = inventoryService.getAllCardsByExpansion(expansionId);
            
            ctx.status(200).json(Map.of(
                "message", "Sobre abierto con éxito", 
                "wonCard", wonCard,
                "allCards", allCards
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }
}

package com.pokesobres.controller;

import com.pokesobres.model.CartItem;
import com.pokesobres.service.InventoryService;
import io.javalin.http.Context;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;

import java.util.List;
import java.util.Map;

public class PurchaseController {
    private static InventoryService inventoryService = new InventoryService();
    private static ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public static void checkout(Context ctx) {
        try {
            Map<String, Object> body = mapper.readValue(ctx.body(), new TypeReference<Map<String, Object>>(){});
            
            if (!body.containsKey("userId") || !body.containsKey("cart")) {
                ctx.status(400).json(Map.of("error", "Faltan datos en la petición."));
                return;
            }

            int userId = (Integer) body.get("userId");
            List<CartItem> cart = mapper.convertValue(body.get("cart"), new TypeReference<List<CartItem>>(){});

            int newBalance = inventoryService.processPurchase(userId, cart);
            
            ctx.status(200).json(Map.of("message", "Compra realizada con éxito", "newBalance", newBalance));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }
}

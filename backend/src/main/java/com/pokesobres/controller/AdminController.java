package com.pokesobres.controller;

import com.pokesobres.service.TCGDexSyncService;
import io.javalin.http.Context;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class AdminController {
    private static TCGDexSyncService syncService = new TCGDexSyncService();
    private static ObjectMapper mapper = new ObjectMapper();

    public static void syncCollection(Context ctx) {
        try {
            Map<String, Object> body = mapper.readValue(ctx.body(), new TypeReference<Map<String, Object>>(){});
            String collectionId = (String) body.get("collectionId");
            String customName = (String) body.get("customName");
            Object packPriceObj = body.get("packPrice");
            int packPrice = 250;
            if (packPriceObj != null) {
                if (packPriceObj instanceof Integer) {
                    packPrice = (Integer) packPriceObj;
                } else {
                    packPrice = Integer.parseInt(packPriceObj.toString());
                }
            }

            if (collectionId == null || collectionId.isEmpty()) {
                ctx.status(400).json(Map.of("error", "Falta el ID de la colección (collectionId)"));
                return;
            }

            // Llamada a la API gratuita y guardado
            syncService.parseAndSaveCollection(collectionId, customName, packPrice);

            ctx.status(200).json(Map.of(
                "message", "Colección importada y guardada en MySQL exitosamente."
            ));

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
}

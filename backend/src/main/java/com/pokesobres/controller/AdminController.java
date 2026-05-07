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

    public static void resetDatabase(Context ctx) {
        try {
            // Verificar que se envía userId y es admin
            Map<String, Object> body = mapper.readValue(ctx.body(), new TypeReference<Map<String, Object>>(){});
            if (!body.containsKey("userId")) {
                ctx.status(400).json(Map.of("error", "Falta el ID del administrador (userId)"));
                return;
            }
            int userId = (Integer) body.get("userId");
            
            // Validar admin
            com.pokesobres.dao.UserDAO userDAO = new com.pokesobres.dao.UserDAO();
            com.pokesobres.model.User user = userDAO.findById(userId);
            if (user == null || !"admin".equalsIgnoreCase(user.getRole())) {
                ctx.status(403).json(Map.of("error", "Acceso denegado. Se requieren permisos de administrador."));
                return;
            }

            // Ejecutar reset
            try (java.sql.Connection conn = com.pokesobres.util.DBConnection.getConnection();
                 java.sql.Statement stmt = conn.createStatement()) {
                
                stmt.execute("SET FOREIGN_KEY_CHECKS = 0;");
                stmt.execute("TRUNCATE TABLE Transactions;");
                stmt.execute("TRUNCATE TABLE PackInventory;");
                stmt.execute("TRUNCATE TABLE CollectionAlbum;");
                stmt.execute("DELETE FROM Users WHERE role != 'admin';");
                stmt.execute("SET FOREIGN_KEY_CHECKS = 1;");
            }

            ctx.status(200).json(Map.of("message", "Base de datos reseteada con éxito. Todos los usuarios (excepto admins) han sido eliminados."));

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
}

package com.pokesobres.main;

import com.pokesobres.controller.AuthController;
import com.pokesobres.controller.ExpansionController;
import io.javalin.Javalin;

public class Main {
    public static void main(String[] args) {
        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.anyHost();
                });
            });
        }).start(7070);

        // Schema update para la versión actual
        try (java.sql.Connection conn = com.pokesobres.util.DBConnection.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {
            try {
                stmt.execute("ALTER TABLE Users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;");
                System.out.println("Base de datos actualizada: Columna avatar_url añadida.");
            } catch (Exception e) {
                // Ignore if it already exists
            }
        } catch (Exception e) {
            System.err.println("Advertencia al actualizar esquema de base de datos: " + e.getMessage());
        }

        app.get("/", ctx -> ctx.result("Backend Pokesobres is running!"));
        
        // Endpoints de autenticación
        app.post("/api/auth/register", AuthController::register);
        app.post("/api/auth/login", AuthController::login);

        // Endpoints de la tienda
        app.get("/api/expansions", ExpansionController::getExpansions);
        app.get("/api/ranking", ExpansionController::getRanking);
        app.post("/api/purchase", com.pokesobres.controller.PurchaseController::checkout);
        
        // Endpoints de perfil
        app.post("/api/profile/add_funds", com.pokesobres.controller.ProfileController::addFunds);
        app.put("/api/profile/update", com.pokesobres.controller.ProfileController::updateProfile);

        // Endpoints de inventario
        app.get("/api/inventory/{userId}", com.pokesobres.controller.InventoryController::getInventory);
        app.post("/api/inventory/open", com.pokesobres.controller.InventoryController::openPack);

        // Endpoints de Álbum
        app.get("/api/album/{userId}", com.pokesobres.controller.AlbumController::getAlbum);
        app.post("/api/album/favorite", com.pokesobres.controller.AlbumController::toggleFavorite);
        app.post("/api/album/sell", com.pokesobres.controller.AlbumController::sellCards);

        // Endpoints de Recompensa Diaria
        app.get("/api/store/daily-status/{userId}", com.pokesobres.controller.DailyRewardController::getDailyStatus);
        app.post("/api/store/daily-claim", com.pokesobres.controller.DailyRewardController::claimDailyPack);

        // Endpoints de Administración (Scrydex y Mantenimiento)
        app.post("/api/admin/sync-tcgdex", com.pokesobres.controller.AdminController::syncCollection);
        app.delete("/api/admin/reset-db", com.pokesobres.controller.AdminController::resetDatabase);
    }
}

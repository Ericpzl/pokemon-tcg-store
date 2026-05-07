package com.pokesobres.util;

import java.sql.Connection;
import java.sql.Statement;

public class UpdateDb {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // Add avatar_url column if not exists (MySQL syntax workaround)
            try {
                stmt.execute("ALTER TABLE Users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;");
                System.out.println("Columna avatar_url añadida exitosamente.");
            } catch (Exception e) {
                if (e.getMessage().contains("Duplicate column name")) {
                    System.out.println("La columna ya existe.");
                } else {
                    throw e;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

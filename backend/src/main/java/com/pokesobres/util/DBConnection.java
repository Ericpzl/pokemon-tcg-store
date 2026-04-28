package com.pokesobres.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String USER = "root";
    private static final String PASSWORD = ""; // Cambiar según configuración local

    public static Connection getConnection() throws SQLException {
        String dbHost = System.getenv("DB_HOST");
        if (dbHost == null || dbHost.isEmpty()) {
            dbHost = "localhost";
        }
        String url = "jdbc:mysql://" + dbHost + ":3306/pokemon_tcg_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        return DriverManager.getConnection(url, USER, PASSWORD);
    }
}

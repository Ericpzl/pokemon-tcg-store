package com.pokesobres.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    public static Connection getConnection() throws SQLException {
        // Lee la configuración desde variables de entorno
        String host     = getEnv("DB_HOST",     "localhost");
        String port     = getEnv("DB_PORT",     "3306");
        String dbName   = getEnv("DB_NAME",     "pokemon_tcg_db");
        String user     = getEnv("DB_USER",     "root");
        
        // Buscamos DB_PASSWORD, pero si usas DB_PASS en el docker-compose, también lo cazamos
        String password = System.getenv("DB_PASSWORD");
        if (password == null || password.isEmpty()) {
            password = getEnv("DB_PASS", ""); // Fallback local
        }

        // Aiven MySQL requiere SSL, pero nuestro contenedor local 'db' y 'localhost' NO.
        boolean useSSL = !(host.equals("localhost") || host.equals("db"));
        String sslParam = useSSL ? "true" : "false";

        String url = "jdbc:mysql://" + host + ":" + port + "/" + dbName
                + "?useSSL=" + sslParam
                + "&requireSSL=" + sslParam
                + "&serverTimezone=UTC"
                + "&allowPublicKeyRetrieval=true"
                + "&connectionCollation=utf8mb4_unicode_ci";

        return DriverManager.getConnection(url, user, password);
    }

    private static String getEnv(String key, String defaultValue) {
        String value = System.getenv(key);
        return (value != null && !value.isEmpty()) ? value : defaultValue;
    }
}
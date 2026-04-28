package com.pokesobres.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    public static Connection getConnection() throws SQLException {
        // Lee la configuración desde variables de entorno (Render/Aiven)
        // Si no existen, usa los valores locales por defecto
        String host     = getEnv("DB_HOST",     "localhost");
        String port     = getEnv("DB_PORT",     "3306");
        String dbName   = getEnv("DB_NAME",     "pokemon_tcg_db");
        String user     = getEnv("DB_USER",     "root");
        String password = getEnv("DB_PASSWORD", "");

        // Aiven MySQL requiere SSL
        boolean useSSL = !host.equals("localhost");
        String sslParam = useSSL ? "true" : "false";

        String url = "jdbc:mysql://" + host + ":" + port + "/" + dbName
                + "?useSSL=" + sslParam
                + "&requireSSL=" + sslParam
                + "&serverTimezone=UTC"
                + "&allowPublicKeyRetrieval=true";

        return DriverManager.getConnection(url, user, password);
    }

    private static String getEnv(String key, String defaultValue) {
        String value = System.getenv(key);
        return (value != null && !value.isEmpty()) ? value : defaultValue;
    }
}

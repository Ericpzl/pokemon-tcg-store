package com.pokesobres.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokesobres.dao.CardDAO;
import com.pokesobres.dao.ExpansionDAO;
import com.pokesobres.model.Card;
import com.pokesobres.model.Expansion;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class TCGDexSyncService {
    
    private static final String TCGDEX_URL = "https://api.tcgdex.net/v2/es/sets/";
    private static ExpansionDAO expansionDAO = new ExpansionDAO();
    private static CardDAO cardDAO = new CardDAO();
    private static ObjectMapper mapper = new ObjectMapper();

    public void parseAndSaveCollection(String collectionId, String customName, int packPrice) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(TCGDEX_URL + collectionId))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Error de TCGDex: HTTP " + response.statusCode() + " - " + response.body());
        }

        String json = response.body();
        JsonNode root = mapper.readTree(json);

        // 1. Guardar la Expansión
        String officialName = root.path("name").asText("Colección Desconocida");
        String finalName = (customName != null && !customName.trim().isEmpty()) ? customName : officialName;
        String releaseDate = root.path("releaseDate").asText("2020-01-01");
        
        // Logo de TCGdex
        String logoUrl = "";
        if (root.has("logo")) {
            logoUrl = root.get("logo").asText() + ".png";
        }

        Expansion exp = new Expansion();
        exp.setName(finalName);
        exp.setReleaseDate(releaseDate);
        exp.setPackPrice(packPrice);
        exp.setCoverImage(logoUrl);

        int newExpId = expansionDAO.insertExpansion(exp);
        if (newExpId == -1) {
            throw new RuntimeException("No se pudo insertar la expansión en la base de datos.");
        }

        // 2. Guardar las Cartas
        JsonNode cardsNode = root.path("cards");
        if (cardsNode.isArray()) {
            for (JsonNode cardNode : cardsNode) {
                Card c = new Card();
                c.setExpansionId(newExpId);
                c.setName(cardNode.path("name").asText("Carta Desconocida"));
                c.setType("Normal"); // TCGdex lista básica no tiene tipos
                c.setRarity("Común"); // TCGdex lista básica no tiene rareza
                c.setHp(100);

                String imageUrl = "https://via.placeholder.com/240x330?text=No+Image";
                if (cardNode.has("image") && !cardNode.get("image").isNull()) {
                    imageUrl = cardNode.get("image").asText() + "/high.webp";
                }
                c.setImageUrl(imageUrl);
                
                // Precio aleatorio para que tenga economía (entre 10 y 100 por defecto)
                double randomPrice = Math.round((10 + Math.random() * 90) * 100.0) / 100.0;
                c.setPrice(randomPrice);

                cardDAO.insertCard(c);
            }
        }
    }
}

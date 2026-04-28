package com.pokesobres.controller;

import com.pokesobres.service.ExpansionService;
import io.javalin.http.Context;
import java.util.Map;

public class ExpansionController {
    
    private static ExpansionService expansionService = new ExpansionService();

    public static void getExpansions(Context ctx) {
        try {
            ctx.status(200).json(expansionService.getAllExpansions());
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", "Error fetching expansions"));
        }
    }

    public static void getRanking(Context ctx) {
        try {
            ctx.status(200).json(expansionService.getTopRanking());
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", "Error fetching ranking"));
        }
    }
}

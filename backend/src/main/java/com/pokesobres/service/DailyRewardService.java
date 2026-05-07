package com.pokesobres.service;

import com.pokesobres.dao.CardDAO;
import com.pokesobres.dao.PackInventoryDAO;
import com.pokesobres.dao.UserDAO;
import com.pokesobres.model.Card;
import com.pokesobres.model.User;
import com.pokesobres.dao.ExpansionDAO;
import com.pokesobres.model.Expansion;
import java.sql.Timestamp;
import java.util.List;
import java.util.Random;

public class DailyRewardService {
    private UserDAO userDAO = new UserDAO();
    private CardDAO cardDAO = new CardDAO();
    private PackInventoryDAO packDAO = new PackInventoryDAO();
    private ExpansionDAO expansionDAO = new ExpansionDAO();

    public long getMsUntilNextDaily(int userId) {
        User user = userDAO.findById(userId);
        if (user == null) return -1;
        
        if (user.getLastFreePackDate() == null || user.getLastFreePackDate().isEmpty()) {
            return 0; // Available immediately
        }

        try {
            Timestamp lastDate = Timestamp.valueOf(user.getLastFreePackDate());
            long msSinceLast = System.currentTimeMillis() - lastDate.getTime();
            long msIn24h = 24L * 60 * 60 * 1000;
            
            if (msSinceLast >= msIn24h) {
                return 0;
            } else {
                return msIn24h - msSinceLast;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    public com.pokesobres.model.Card claimDailyPack(int userId) {
        long msUntilNext = getMsUntilNextDaily(userId);
        if (msUntilNext > 0) {
            throw new RuntimeException("Todavía no han pasado 24 horas.");
        }

        List<Expansion> expansions = expansionDAO.findAll();
        if (expansions == null || expansions.isEmpty()) {
            throw new RuntimeException("No hay expansiones disponibles.");
        }

        Random rand = new Random();
        Expansion randomExp = expansions.get(rand.nextInt(expansions.size()));

        // Añadir el Sobre aleatorio al inventario del usuario
        packDAO.addPacks(userId, randomExp.getId(), 1);

        // Update last free pack date
        userDAO.updateLastFreePackDate(userId, new Timestamp(System.currentTimeMillis()));

        // Retornamos un objeto indicando qué sobre ha tocado
        return new com.pokesobres.model.Card(0, randomExp.getId(), randomExp.getName(), "", "", 0, "", 0.0);
    }
}

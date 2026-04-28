package com.pokesobres.service;

import com.pokesobres.dao.CardDAO;
import com.pokesobres.dao.PackInventoryDAO;
import com.pokesobres.dao.UserDAO;
import com.pokesobres.model.Card;
import com.pokesobres.model.User;
import java.sql.Timestamp;

public class DailyRewardService {
    private UserDAO userDAO = new UserDAO();
    private CardDAO cardDAO = new CardDAO();
    private PackInventoryDAO packDAO = new PackInventoryDAO();

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

        // Añadir el Sobre Diario (ID 999) al inventario del usuario
        packDAO.addPacks(userId, 999, 1);

        // Update last free pack date
        userDAO.updateLastFreePackDate(userId, new Timestamp(System.currentTimeMillis()));

        return new com.pokesobres.model.Card(0, 999, "Sobre Diario", "", "", 0, "", 0.0);
    }
}

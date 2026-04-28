package com.pokesobres.service;

import com.pokesobres.dao.CollectionAlbumDAO;
import com.pokesobres.dao.UserDAO;
import com.pokesobres.model.User;
import com.pokesobres.model.UserCardDTO;
import java.util.List;

public class AlbumService {
    private CollectionAlbumDAO albumDAO = new CollectionAlbumDAO();
    private UserDAO userDAO = new UserDAO();

    public List<UserCardDTO> getUserAlbum(int userId) {
        return albumDAO.getUserAlbum(userId);
    }

    public boolean toggleFavorite(int userId, int cardId) {
        return albumDAO.toggleFavorite(userId, cardId);
    }

    public double sellCards(int userId, List<Integer> cardIds) {
        double earned = albumDAO.sellCards(userId, cardIds);
        if (earned > 0) {
            User user = userDAO.findById(userId);
            if (user != null) {
                int newBalance = (int)(user.getBalance() + earned);
                userDAO.updateBalance(userId, newBalance);
            }
        }
        return earned;
    }
}

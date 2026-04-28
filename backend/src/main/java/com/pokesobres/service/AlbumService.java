package com.pokesobres.service;

import com.pokesobres.dao.CollectionAlbumDAO;
import com.pokesobres.model.UserCardDTO;
import java.util.List;

public class AlbumService {
    private CollectionAlbumDAO albumDAO = new CollectionAlbumDAO();

    public List<UserCardDTO> getUserAlbum(int userId) {
        return albumDAO.getUserAlbum(userId);
    }

    public boolean toggleFavorite(int userId, int cardId) {
        return albumDAO.toggleFavorite(userId, cardId);
    }
}

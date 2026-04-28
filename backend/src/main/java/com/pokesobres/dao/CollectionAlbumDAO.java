package com.pokesobres.dao;

import com.pokesobres.model.Card;
import com.pokesobres.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

public class CollectionAlbumDAO {

    public void addCardsToAlbum(int userId, List<Card> cards) {
        String sql = "INSERT INTO CollectionAlbum (user_id, card_id, quantity) VALUES (?, ?, 1) " +
                     "ON DUPLICATE KEY UPDATE quantity = quantity + 1";
                     
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            conn.setAutoCommit(false); 
            
            for (Card card : cards) {
                stmt.setInt(1, userId);
                stmt.setInt(2, card.getId());
                stmt.addBatch();
            }
            
            stmt.executeBatch();
            conn.commit();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (CollectionAlbumDAO.addCardsToAlbum): " + e.getMessage());
        }
    }

    public List<com.pokesobres.model.UserCardDTO> getUserAlbum(int userId) {
        List<com.pokesobres.model.UserCardDTO> album = new java.util.ArrayList<>();
        String sql = "SELECT c.id, c.expansion_id, c.name, c.type, c.rarity, c.hp, c.image_url, c.price, " +
                     "a.quantity, a.is_favorite, a.obtained_at " +
                     "FROM CollectionAlbum a " +
                     "JOIN Cards c ON a.card_id = c.id " +
                     "WHERE a.user_id = ? " +
                     "ORDER BY c.expansion_id ASC, c.id ASC";
                     
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            java.sql.ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                album.add(new com.pokesobres.model.UserCardDTO(
                    rs.getInt("id"),
                    rs.getInt("expansion_id"),
                    rs.getString("name"),
                    rs.getString("type"),
                    rs.getString("rarity"),
                    rs.getInt("hp"),
                    rs.getString("image_url"),
                    rs.getDouble("price"),
                    rs.getInt("quantity"),
                    rs.getBoolean("is_favorite"),
                    rs.getString("obtained_at")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (CollectionAlbumDAO.getUserAlbum): " + e.getMessage());
        }
        return album;
    }

    public boolean toggleFavorite(int userId, int cardId) {
        String sql = "UPDATE CollectionAlbum SET is_favorite = NOT is_favorite WHERE user_id = ? AND card_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            stmt.setInt(2, cardId);
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (CollectionAlbumDAO.toggleFavorite): " + e.getMessage());
        }
    }
}

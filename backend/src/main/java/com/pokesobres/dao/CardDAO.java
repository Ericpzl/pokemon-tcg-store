package com.pokesobres.dao;

import com.pokesobres.model.Card;
import com.pokesobres.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CardDAO {

    public List<Card> getRandomCardsByExpansion(int expansionId, int limit) {
        List<Card> cards = new ArrayList<>();
        String sql = "SELECT * FROM Cards WHERE expansion_id = ? ORDER BY RAND() LIMIT ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, expansionId);
            stmt.setInt(2, limit);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                cards.add(new Card(
                    rs.getInt("id"),
                    rs.getInt("expansion_id"),
                    rs.getString("name"),
                    rs.getString("type"),
                    rs.getString("rarity"),
                    rs.getInt("hp"),
                    rs.getString("image_url"),
                    rs.getDouble("price")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (CardDAO.getRandomCardsByExpansion): " + e.getMessage());
        }
        return cards;
    }

    public List<Card> getCardsByExpansion(int expansionId) {
        List<Card> cards = new ArrayList<>();
        String sql = "SELECT * FROM Cards WHERE expansion_id = ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, expansionId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                cards.add(new Card(
                    rs.getInt("id"),
                    rs.getInt("expansion_id"),
                    rs.getString("name"),
                    rs.getString("type"),
                    rs.getString("rarity"),
                    rs.getInt("hp"),
                    rs.getString("image_url"),
                    rs.getDouble("price")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (CardDAO.getCardsByExpansion): " + e.getMessage());
        }
        return cards;
    }

    public Card getRandomCheapCard(double maxPrice) {
        String sql = "SELECT * FROM Cards WHERE price <= ? ORDER BY RAND() LIMIT 1";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setDouble(1, maxPrice);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return new Card(
                    rs.getInt("id"),
                    rs.getInt("expansion_id"),
                    rs.getString("name"),
                    rs.getString("type"),
                    rs.getString("rarity"),
                    rs.getInt("hp"),
                    rs.getString("image_url"),
                    rs.getDouble("price")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (CardDAO.getRandomCheapCard): " + e.getMessage());
        }
        return null;
    }

    public List<Card> getAllCheapCards(double maxPrice) {
        List<Card> cards = new ArrayList<>();
        String sql = "SELECT * FROM Cards WHERE price <= ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setDouble(1, maxPrice);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                cards.add(new Card(
                    rs.getInt("id"),
                    rs.getInt("expansion_id"),
                    rs.getString("name"),
                    rs.getString("type"),
                    rs.getString("rarity"),
                    rs.getInt("hp"),
                    rs.getString("image_url"),
                    rs.getDouble("price")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (CardDAO.getAllCheapCards): " + e.getMessage());
        }
        return cards;
    }

    public void insertCard(Card card) {
        String sql = "INSERT INTO Cards (expansion_id, name, type, rarity, hp, image_url, price) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, card.getExpansionId());
            stmt.setString(2, card.getName());
            stmt.setString(3, card.getType());
            stmt.setString(4, card.getRarity());
            stmt.setInt(5, card.getHp());
            stmt.setString(6, card.getImageUrl());
            stmt.setDouble(7, card.getPrice());
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo al insertar Carta: " + e.getMessage());
        }
    }
}

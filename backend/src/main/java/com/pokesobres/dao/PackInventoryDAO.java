package com.pokesobres.dao;

import com.pokesobres.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.pokesobres.model.UserPackDTO;

public class PackInventoryDAO {

    public List<UserPackDTO> getUserInventory(int userId) {
        List<UserPackDTO> inventory = new ArrayList<>();
        String sql = "SELECT p.expansion_id, e.name as expansion_name, e.cover_image, p.quantity " +
                     "FROM PackInventory p " +
                     "JOIN Expansions e ON p.expansion_id = e.id " +
                     "WHERE p.user_id = ? AND p.quantity > 0";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                UserPackDTO dto = new UserPackDTO(
                    rs.getInt("expansion_id"),
                    rs.getString("expansion_name"),
                    rs.getString("cover_image"),
                    rs.getInt("quantity")
                );
                inventory.add(dto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (PackInventoryDAO.getUserInventory): " + e.getMessage());
        }
        return inventory;
    }

    public boolean addPacks(int userId, int expansionId, int quantity) {
        // Asumimos que la tabla se llama PackInventory. 
        // En MySQL, podemos usar ON DUPLICATE KEY UPDATE si hay una restricción única en (user_id, expansion_id).
        // Si no la hay o si la tabla se llama de otra manera, esto podría fallar.
        String sql = "INSERT INTO PackInventory (user_id, expansion_id, quantity) VALUES (?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE quantity = quantity + ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            stmt.setInt(2, expansionId);
            stmt.setInt(3, quantity);
            stmt.setInt(4, quantity); // para el UPDATE
            
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (PackInventoryDAO.addPacks): " + e.getMessage());
        }
    }

    public boolean removePack(int userId, int expansionId) {
        String sql = "UPDATE PackInventory SET quantity = quantity - 1 WHERE user_id = ? AND expansion_id = ? AND quantity > 0";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            stmt.setInt(2, expansionId);
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (PackInventoryDAO.removePack): " + e.getMessage());
        }
    }
}

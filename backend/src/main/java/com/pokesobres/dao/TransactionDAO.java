package com.pokesobres.dao;

import com.pokesobres.model.Transaction;
import com.pokesobres.util.DBConnection;

import java.sql.*;

public class TransactionDAO {

    public boolean insert(Transaction transaction) {
        String sql = "INSERT INTO Transactions (user_id, expansion_id, quantity, total_price) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setInt(1, transaction.getUserId());
            stmt.setInt(2, transaction.getExpansionId());
            stmt.setInt(3, transaction.getQuantity());
            stmt.setDouble(4, transaction.getTotalPrice());
            
            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        transaction.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (TransactionDAO.insert): " + e.getMessage());
        }
        return false;
    }
}

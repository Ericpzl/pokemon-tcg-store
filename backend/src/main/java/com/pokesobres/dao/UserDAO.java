package com.pokesobres.dao;

import com.pokesobres.model.User;
import com.pokesobres.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {

    public User findByEmail(String email) {
        String sql = "SELECT * FROM Users WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (findByEmail): " + e.getMessage());
        }
        return null;
    }

    public User findByUsername(String username) {
        String sql = "SELECT * FROM Users WHERE username = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (findByUsername): " + e.getMessage());
        }
        return null;
    }

    public User findById(int id) {
        String sql = "SELECT * FROM Users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (findById): " + e.getMessage());
        }
        return null;
    }

    public boolean insert(User user) {
        String sql = "INSERT INTO Users (username, email, password_hash, balance) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPasswordHash());
            stmt.setInt(4, user.getBalance());
            
            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        user.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL: " + e.getMessage());
        }
        return false;
    }

    public boolean updateBalance(int userId, int newBalance) {
        String sql = "UPDATE Users SET balance = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, newBalance);
            stmt.setInt(2, userId);
            
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (updateBalance): " + e.getMessage());
        }
    }

    public List<User> getRanking() {
        List<User> ranking = new ArrayList<>();
        String sql = "SELECT * FROM Users ORDER BY balance DESC LIMIT 5";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                User user = mapResultSetToUser(rs);
                // Hash clearing for safety before sending to frontend
                user.setPasswordHash(null); 
                ranking.add(user);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return ranking;
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setBalance(rs.getInt("balance"));
        user.setLanguage(rs.getString("language"));
        user.setRole(rs.getString("role"));
        
        Timestamp lastFree = rs.getTimestamp("last_free_pack_date");
        if (lastFree != null) {
            user.setLastFreePackDate(lastFree.toString());
        }
        return user;
    }

    public boolean updateLastFreePackDate(int userId, Timestamp date) {
        String sql = "UPDATE Users SET last_free_pack_date = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setTimestamp(1, date);
            stmt.setInt(2, userId);
            int rows = stmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateProfile(int userId, String newEmail, String newPasswordHash) {
        String sql;
        if (newPasswordHash != null && !newPasswordHash.isEmpty()) {
            sql = "UPDATE Users SET email = ?, password_hash = ? WHERE id = ?";
        } else {
            sql = "UPDATE Users SET email = ? WHERE id = ?";
        }
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, newEmail);
            if (newPasswordHash != null && !newPasswordHash.isEmpty()) {
                stmt.setString(2, newPasswordHash);
                stmt.setInt(3, userId);
            } else {
                stmt.setInt(2, userId);
            }
            
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo en MySQL (updateProfile): " + e.getMessage());
        }
    }
}

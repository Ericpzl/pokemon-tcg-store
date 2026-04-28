package com.pokesobres.dao;

import com.pokesobres.model.Expansion;
import com.pokesobres.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ExpansionDAO {

    public List<Expansion> findAll() {
        List<Expansion> expansions = new ArrayList<>();
        String sql = "SELECT * FROM Expansions";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Expansion exp = new Expansion();
                exp.setId(rs.getInt("id"));
                exp.setName(rs.getString("name"));
                exp.setReleaseDate(rs.getString("release_date"));
                exp.setPackPrice(rs.getInt("pack_price"));
                exp.setCoverImage(rs.getString("cover_image"));
                expansions.add(exp);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return expansions;
    }

    public int insertExpansion(Expansion exp) {
        String sql = "INSERT INTO Expansions (name, release_date, pack_price, cover_image) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, exp.getName());
            stmt.setString(2, exp.getReleaseDate());
            stmt.setDouble(3, exp.getPackPrice());
            stmt.setString(4, exp.getCoverImage());
            
            stmt.executeUpdate();
            
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fallo al insertar Expansion: " + e.getMessage());
        }
        return -1;
    }
}

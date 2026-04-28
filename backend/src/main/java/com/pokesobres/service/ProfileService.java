package com.pokesobres.service;

import com.pokesobres.dao.UserDAO;
import com.pokesobres.model.User;

public class ProfileService {
    private UserDAO userDAO = new UserDAO();

    public int addFunds(int userId, int amount) throws Exception {
        if (amount <= 0) {
            throw new Exception("La cantidad debe ser mayor que 0.");
        }
        
        User user = userDAO.findById(userId);
        if (user == null) {
            throw new Exception("Usuario no encontrado.");
        }

        int newBalance = user.getBalance() + amount;
        if (!userDAO.updateBalance(userId, newBalance)) {
            throw new Exception("Error al actualizar el saldo del usuario.");
        }

        return newBalance;
    }
}


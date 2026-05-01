package com.pokesobres.service;

import com.pokesobres.dao.UserDAO;
import com.pokesobres.model.User;
import com.pokesobres.util.PasswordUtil;

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

    public User updateProfile(int userId, String currentPassword, String newEmail, String newPassword) throws Exception {
        User user = userDAO.findById(userId);
        if (user == null) {
            throw new Exception("Usuario no encontrado.");
        }

        // Si se envió nueva contraseña, validar la actual
        String newHash = null;
        if (newPassword != null && !newPassword.isEmpty()) {
            if (currentPassword == null || currentPassword.isEmpty()) {
                throw new Exception("Debe proporcionar la contraseña actual para cambiarla.");
            }
            if (!PasswordUtil.checkPassword(currentPassword, user.getPasswordHash())) {
                throw new Exception("La contraseña actual es incorrecta.");
            }
            newHash = PasswordUtil.hashPassword(newPassword);
        }

        // Validar si el email ya existe en otro usuario (opcional pero recomendado)
        if (newEmail != null && !newEmail.equals(user.getEmail())) {
            User existing = userDAO.findByEmail(newEmail);
            if (existing != null && existing.getId() != userId) {
                throw new Exception("El correo electrónico ya está en uso.");
            }
        }

        String finalEmail = newEmail != null && !newEmail.isEmpty() ? newEmail : user.getEmail();

        if (!userDAO.updateProfile(userId, finalEmail, newHash)) {
            throw new Exception("Error al actualizar el perfil.");
        }

        // Devolver el usuario actualizado
        user.setEmail(finalEmail);
        if (newHash != null) {
            user.setPasswordHash(newHash);
        }
        user.setPasswordHash(null); // No devolver hash al front
        return user;
    }
}


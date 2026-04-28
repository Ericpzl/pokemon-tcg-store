package com.pokesobres.service;

import com.pokesobres.dao.UserDAO;
import com.pokesobres.model.User;
import com.pokesobres.util.PasswordUtil;

public class AuthService {
    
    private UserDAO userDAO = new UserDAO();

    public User register(String username, String email, String rawPassword) throws Exception {
        // Verificar si existe el usuario o el email
        if (userDAO.findByUsername(username) != null) {
            throw new Exception("El nombre de usuario ya está en uso.");
        }
        if (userDAO.findByEmail(email) != null) {
            throw new Exception("El correo electrónico ya está registrado.");
        }

        // Crear usuario con hash
        String hashedPassword = PasswordUtil.hashPassword(rawPassword);
        User newUser = new User(username, email, hashedPassword);

        if (userDAO.insert(newUser)) {
            // No devolver el hash al frontend por seguridad
            newUser.setPasswordHash(null);
            return newUser;
        } else {
            throw new Exception("Error interno al registrar el usuario en la base de datos.");
        }
    }

    public User login(String email, String rawPassword) throws Exception {
        User user = userDAO.findByEmail(email);
        
        if (user == null) {
            throw new Exception("El correo electrónico no existe.");
        }
        
        if (!PasswordUtil.checkPassword(rawPassword, user.getPasswordHash())) {
            throw new Exception("Contraseña incorrecta.");
        }

        // Limpiamos el hash para que no viaje al front
        user.setPasswordHash(null);
        return user;
    }
}

package com.pokesobres.service;

import com.pokesobres.dao.ExpansionDAO;
import com.pokesobres.dao.UserDAO;
import com.pokesobres.model.Expansion;
import com.pokesobres.model.User;

import java.util.List;

public class ExpansionService {
    private ExpansionDAO expansionDAO = new ExpansionDAO();
    private UserDAO userDAO = new UserDAO();

    public List<Expansion> getAllExpansions() {
        return expansionDAO.findAll();
    }

    public List<User> getTopRanking() {
        return userDAO.getRanking();
    }
}

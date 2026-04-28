package com.pokesobres.service;

import com.pokesobres.dao.PackInventoryDAO;
import com.pokesobres.dao.TransactionDAO;
import com.pokesobres.dao.UserDAO;
import com.pokesobres.model.Transaction;
import com.pokesobres.model.User;
import com.pokesobres.model.UserPackDTO;
import com.pokesobres.model.Card;
import com.pokesobres.model.CartItem;
import com.pokesobres.dao.CardDAO;
import com.pokesobres.dao.CollectionAlbumDAO;

import java.util.List;

public class InventoryService {
    private UserDAO userDAO = new UserDAO();
    private TransactionDAO transactionDAO = new TransactionDAO();
    private PackInventoryDAO packInventoryDAO = new PackInventoryDAO();
    private CardDAO cardDAO = new CardDAO();
    private CollectionAlbumDAO albumDAO = new CollectionAlbumDAO();

    public List<UserPackDTO> getUserPacks(int userId) {
        return packInventoryDAO.getUserInventory(userId);
    }

    public List<Card> getAllCardsByExpansion(int expansionId) {
        if (expansionId == 999) {
            return cardDAO.getAllCheapCards(50.0);
        }
        return cardDAO.getCardsByExpansion(expansionId);
    }

    public Card openPack(int userId, int expansionId) throws Exception {
        boolean success = packInventoryDAO.removePack(userId, expansionId);
        if (!success) {
            throw new Exception("No tienes este sobre en tu inventario o no hay suficientes existencias.");
        }

        Card wonCard = null;
        if (expansionId == 999) {
            wonCard = cardDAO.getRandomCheapCard(50.0);
            if (wonCard == null) {
                throw new Exception("No hay cartas disponibles para el sobre diario.");
            }
        } else {
            List<Card> drawnCards = cardDAO.getRandomCardsByExpansion(expansionId, 1);
            if (drawnCards.isEmpty()) {
                throw new Exception("No hay cartas disponibles en esta expansión para generar el sobre.");
            }
            wonCard = drawnCards.get(0);
        }

        albumDAO.addCardsToAlbum(userId, List.of(wonCard));

        return wonCard;
    }

    public int processPurchase(int userId, List<CartItem> cartItems) throws Exception {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new Exception("El carrito está vacío.");
        }

        User user = userDAO.findById(userId);
        if (user == null) {
            throw new Exception("Usuario no encontrado.");
        }

        double totalCostDouble = cartItems.stream().mapToDouble(CartItem::getSubtotal).sum();
        int totalCost = (int) Math.round(totalCostDouble);

        if (user.getBalance() < totalCost) {
            throw new Exception("Saldo insuficiente para completar la compra.");
        }

        // Deducir saldo
        int newBalance = user.getBalance() - totalCost;
        if (!userDAO.updateBalance(userId, newBalance)) {
            throw new Exception("Error al actualizar el saldo del usuario.");
        }

        // Procesar items
        for (CartItem item : cartItems) {
            // Guardar transacción
            Transaction tx = new Transaction(userId, item.getExpansionId(), item.getQuantity(), item.getSubtotal());
            transactionDAO.insert(tx);

            // Actualizar inventario
            packInventoryDAO.addPacks(userId, item.getExpansionId(), item.getQuantity());
        }

        return newBalance;
    }
}

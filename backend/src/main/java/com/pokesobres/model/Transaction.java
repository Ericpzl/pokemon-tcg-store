package com.pokesobres.model;

public class Transaction {
    private int id;
    private int userId;
    private int expansionId;
    private int quantity;
    private double totalPrice;
    private String createdAt;

    public Transaction() {}

    public Transaction(int userId, int expansionId, int quantity, double totalPrice) {
        this.userId = userId;
        this.expansionId = expansionId;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getExpansionId() { return expansionId; }
    public void setExpansionId(int expansionId) { this.expansionId = expansionId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

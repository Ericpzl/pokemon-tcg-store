package com.pokesobres.model;

public class PackInventory {
    private int id;
    private int userId;
    private int expansionId;
    private int quantity;

    public PackInventory() {}

    public PackInventory(int userId, int expansionId, int quantity) {
        this.userId = userId;
        this.expansionId = expansionId;
        this.quantity = quantity;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getExpansionId() { return expansionId; }
    public void setExpansionId(int expansionId) { this.expansionId = expansionId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}

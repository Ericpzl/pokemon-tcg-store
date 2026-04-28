package com.pokesobres.model;

public class CartItem {
    private int expansionId;
    private String expansionName;
    private double unitPrice;
    private int quantity;
    private double subtotal;

    public CartItem() {}

    public CartItem(int expansionId, String expansionName, double unitPrice, int quantity) {
        this.expansionId = expansionId;
        this.expansionName = expansionName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = unitPrice * quantity;
    }

    public int getExpansionId() { return expansionId; }
    public void setExpansionId(int expansionId) { this.expansionId = expansionId; }

    public String getExpansionName() { return expansionName; }
    public void setExpansionName(String expansionName) { this.expansionName = expansionName; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { 
        this.quantity = quantity; 
        this.subtotal = this.unitPrice * this.quantity; 
    }

    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
}

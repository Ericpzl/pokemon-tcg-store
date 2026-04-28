package com.pokesobres.model;

public class UserCardDTO {
    private int cardId;
    private int expansionId;
    private String name;
    private String type;
    private String rarity;
    private int hp;
    private String imageUrl;
    private double price;
    private int quantity;
    private boolean isFavorite;
    private String obtainedAt;

    public UserCardDTO() {}

    public UserCardDTO(int cardId, int expansionId, String name, String type, String rarity, int hp, String imageUrl, double price, int quantity, boolean isFavorite, String obtainedAt) {
        this.cardId = cardId;
        this.expansionId = expansionId;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.hp = hp;
        this.imageUrl = imageUrl;
        this.price = price;
        this.quantity = quantity;
        this.isFavorite = isFavorite;
        this.obtainedAt = obtainedAt;
    }

    public int getCardId() { return cardId; }
    public void setCardId(int cardId) { this.cardId = cardId; }

    public int getExpansionId() { return expansionId; }
    public void setExpansionId(int expansionId) { this.expansionId = expansionId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getRarity() { return rarity; }
    public void setRarity(String rarity) { this.rarity = rarity; }

    public int getHp() { return hp; }
    public void setHp(int hp) { this.hp = hp; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }

    public String getObtainedAt() { return obtainedAt; }
    public void setObtainedAt(String obtainedAt) { this.obtainedAt = obtainedAt; }
}

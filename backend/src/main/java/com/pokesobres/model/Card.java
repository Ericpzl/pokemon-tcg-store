package com.pokesobres.model;

public class Card {
    private int id;
    private int expansionId;
    private String name;
    private String type;
    private String rarity;
    private int hp;
    private String imageUrl;
    private double price;

    public Card() {}

    public Card(int id, int expansionId, String name, String type, String rarity, int hp, String imageUrl, double price) {
        this.id = id;
        this.expansionId = expansionId;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.hp = hp;
        this.imageUrl = imageUrl;
        this.price = price;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

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
}

package com.pokesobres.model;

public class Expansion {
    private int id;
    private String name;
    private String releaseDate;
    private int packPrice;
    private String coverImage;

    public Expansion() {}

    public Expansion(int id, String name, String releaseDate, int packPrice, String coverImage) {
        this.id = id;
        this.name = name;
        this.releaseDate = releaseDate;
        this.packPrice = packPrice;
        this.coverImage = coverImage;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }

    public int getPackPrice() { return packPrice; }
    public void setPackPrice(int packPrice) { this.packPrice = packPrice; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
}

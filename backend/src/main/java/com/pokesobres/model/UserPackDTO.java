package com.pokesobres.model;

public class UserPackDTO {
    private int expansionId;
    private String expansionName;
    private String coverImage;
    private int quantity;

    public UserPackDTO() {}

    public UserPackDTO(int expansionId, String expansionName, String coverImage, int quantity) {
        this.expansionId = expansionId;
        this.expansionName = expansionName;
        this.coverImage = coverImage;
        this.quantity = quantity;
    }

    public int getExpansionId() { return expansionId; }
    public void setExpansionId(int expansionId) { this.expansionId = expansionId; }

    public String getExpansionName() { return expansionName; }
    public void setExpansionName(String expansionName) { this.expansionName = expansionName; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
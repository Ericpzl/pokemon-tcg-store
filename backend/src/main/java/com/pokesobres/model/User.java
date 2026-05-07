package com.pokesobres.model;

public class User {
    private int id;
    private String username;
    private String email;
    private String passwordHash;
    private int balance;
    private String language;
    private String role;
    private String lastFreePackDate;
    private String createdAt;
    private String avatarUrl;

    public User() {}

    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.balance = 500; // Saldo inicial por defecto
        this.language = "ES";
        this.role = "user";
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public int getBalance() { return balance; }
    public void setBalance(int balance) { this.balance = balance; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getLastFreePackDate() { return lastFreePackDate; }
    public void setLastFreePackDate(String lastFreePackDate) { this.lastFreePackDate = lastFreePackDate; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}

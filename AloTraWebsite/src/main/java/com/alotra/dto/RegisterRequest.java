package com.alotra.dto;

import jakarta.validation.constraints.*;

public class RegisterRequest {
    @NotBlank
    private String fullName;
    @Email @NotBlank
    private String email;
    @NotBlank
    private String phone;
    @NotBlank
    private String password;
    public String getFullName(){return fullName;}
    public void setFullName(String fullName){this.fullName=fullName;}
    public String getEmail(){return email;}
    public void setEmail(String email){this.email=email;}
    public String getPhone(){return phone;}
    public void setPhone(String phone){this.phone=phone;}
    public String getPassword(){return password;}
    public void setPassword(String password){this.password=password;}
}

package com.Skin_Predict_Platform.project.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RoleConverter implements AttributeConverter<Role, Boolean> {

    @Override
    public Boolean convertToDatabaseColumn(Role role) {
        return role == Role.SUPER_ADMIN;
    }

    @Override
    public Role convertToEntityAttribute(Boolean isAdmin) {
        return Boolean.TRUE.equals(isAdmin) ? Role.SUPER_ADMIN : Role.USER;
    }
}

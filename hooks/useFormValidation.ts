import { useState } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  match?: string; // Para confirmar contraseñas o emails
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: string, formValues?: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return 'Este campo es obligatorio';
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return null;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `Debe tener al menos ${rule.minLength} caracteres`;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `No puede exceder ${rule.maxLength} caracteres`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      if (name === 'email') {
        return 'Ingrese un email válido';
      }
      if (name === 'cedula') {
        return 'Ingrese una cédula válida (solo números)';
      }
      if (name === 'telefono') {
        return 'Ingrese un teléfono válido';
      }
      return 'Formato inválido';
    }

    // Match validation (for password confirmation)
    if (rule.match && formValues && value !== formValues[rule.match]) {
      if (name.includes('password') || name.includes('Password')) {
        return 'Las contraseñas no coinciden';
      }
      if (name.includes('email') || name.includes('Email')) {
        return 'Los emails no coinciden';
      }
      return 'Los valores no coinciden';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const validateForm = (formValues: any): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const error = validateField(fieldName, formValues[fieldName], formValues);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const validateSingleField = (name: string, value: string, formValues?: any): void => {
    const error = validateField(name, value, formValues);
    setErrors((prev) => ({
      ...prev,
      [name]: error || '',
    }));
  };

  const clearErrors = (): void => {
    setErrors({});
  };

  const clearFieldError = (fieldName: string): void => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: '',
    }));
  };

  return {
    errors,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.values(errors).some((error) => error !== ''),
  };
};

// Patrones de validación comunes
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  cedula: /^\d{8,11}$/,
  telefono: /^[\d\s\-\+\(\)]{7,15}$/,
  password: /^.{6,}$/, // Al menos 6 caracteres
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, // Al menos 8 caracteres, una mayúscula, una minúscula y un número
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/,
  code: /^[A-Za-z0-9]{4,10}$/,
  cardNumber: /^\d{13,19}$/,
  cardCvc: /^\d{3,4}$/,
  cardExpiration: /^(0[1-9]|1[0-2])\/\d{2}$/,
};

// Reglas comunes para diferentes tipos de formularios
export const commonValidationRules = {
  signup: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 48,
      pattern: validationPatterns.name,
    },
    lastname: {
      required: true,
      minLength: 2,
      maxLength: 48,
      pattern: validationPatterns.name,
    },
    email: {
      required: true,
      maxLength: 128,
      pattern: validationPatterns.email,
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 64,
      pattern: validationPatterns.password,
    },
    cedula: {
      required: true,
      pattern: validationPatterns.cedula,
    },
    telefono: {
      required: true,
      pattern: validationPatterns.telefono,
    },
  },
  signin: {
    email: {
      required: true,
      pattern: validationPatterns.email,
    },
    password: {
      required: true,
      minLength: 6,
    },
  },
  account: {
    cedula: {
      required: true,
      pattern: validationPatterns.cedula,
    },
    name: {
      required: true,
      minLength: 2,
      maxLength: 48,
      pattern: validationPatterns.name,
    },
    lastname: {
      required: true,
      minLength: 2,
      maxLength: 48,
      pattern: validationPatterns.name,
    },
    telefono: {
      required: true,
      pattern: validationPatterns.telefono,
    },
    email: {
      required: true,
      maxLength: 128,
      pattern: validationPatterns.email,
    },
  },
  passwordChange: {
    password: {
      required: true,
      minLength: 6,
    },
    newPassword: {
      required: true,
      minLength: 6,
      maxLength: 64,
      pattern: validationPatterns.password,
    },
    newPasswordAgain: {
      required: true,
      match: 'newPassword',
    },
  },
  emailChange: {
    email: {
      required: true,
      maxLength: 128,
      pattern: validationPatterns.email,
    },
    emailAgain: {
      required: true,
      match: 'email',
    },
  },
  activationCode: {
    code: {
      required: true,
      minLength: 4,
      maxLength: 10,
      pattern: validationPatterns.code,
    },
  },
  purchase: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 48,
      pattern: validationPatterns.name,
    },
    email: {
      required: true,
      maxLength: 128,
      pattern: validationPatterns.email,
    },
    cardName: {
      required: true,
      minLength: 2,
      maxLength: 64,
      pattern: validationPatterns.name,
    },
    cardNumber: {
      required: true,
      pattern: validationPatterns.cardNumber,
    },
    cardExpiration: {
      required: true,
      pattern: validationPatterns.cardExpiration,
    },
    cardCvc: {
      required: true,
      pattern: validationPatterns.cardCvc,
    },
  },
};

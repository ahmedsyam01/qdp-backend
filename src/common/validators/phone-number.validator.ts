import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// Test/Admin phone numbers that should be allowed as exceptions
const ALLOWED_TEST_NUMBERS = [
  '+97411111111',
  '+97422222222',
];

@ValidatorConstraint({ async: false })
export class IsValidPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(phoneNumber: string) {
    if (!phoneNumber) {
      return false;
    }

    // Allow specific test/admin phone numbers
    if (ALLOWED_TEST_NUMBERS.includes(phoneNumber)) {
      return true;
    }

    try {
      // Check if the phone number is valid in E.164 format
      return isValidPhoneNumber(phoneNumber);
    } catch (error) {
      return false;
    }
  }

  defaultMessage() {
    return 'Phone number must be a valid international phone number in E.164 format (e.g., +97412345678)';
  }
}

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneNumberConstraint,
    });
  };
}

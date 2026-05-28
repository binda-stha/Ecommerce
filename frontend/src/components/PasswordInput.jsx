import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

const PasswordInput = ({
  value,
  onChange,
  placeholder = "Enter password",
  showValidation = true,
  name = "password",
  required = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validatePassword = async (password) => {
    if (!password || !showValidation) return;

    setIsValidating(true);
    try {
      const response = await fetch("/api/auth/validate-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      if (result.success) {
        setValidationResults(result);
      }
    } catch (error) {
      console.error("Password validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);

    if (showValidation) {
      // Debounce validation
      clearTimeout(window.passwordValidationTimeout);
      window.passwordValidationTimeout = setTimeout(() => {
        validatePassword(newValue);
      }, 500);
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case "Very Strong":
        return "text-green-600";
      case "Strong":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "Weak":
        return "text-orange-500";
      default:
        return "text-red-500";
    }
  };

  const getStrengthBgColor = (strength) => {
    switch (strength) {
      case "Very Strong":
        return "bg-green-500";
      case "Strong":
        return "bg-green-400";
      case "Medium":
        return "bg-yellow-500";
      case "Weak":
        return "bg-orange-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {showValidation && validationResults && (
        <div className="space-y-2">
          {/* Password Strength Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Strength:</span>
            <span
              className={`text-sm font-medium ${getStrengthColor(
                validationResults.strength
              )}`}
            >
              {validationResults.strength}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthBgColor(
                  validationResults.strength
                )}`}
                style={{
                  width: `${
                    (Object.values(validationResults.requirements).filter(
                      Boolean
                    ).length /
                      5) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Requirements List */}
          <div className="space-y-1">
            {Object.entries(validationResults.requirements).map(
              ([requirement, met]) => (
                <div
                  key={requirement}
                  className="flex items-center gap-2 text-sm"
                >
                  {met ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className={met ? "text-green-600" : "text-red-600"}>
                    {requirement}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {isValidating && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          Checking password strength...
        </div>
      )}
    </div>
  );
};

export default PasswordInput;

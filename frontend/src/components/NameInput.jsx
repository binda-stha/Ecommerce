import React, { useState } from "react";
import { Check, X } from "lucide-react";

const NameInput = ({
  value,
  onChange,
  placeholder = "Enter your full name",
  showValidation = true,
  name = "name",
  required = true,
}) => {
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateName = async (name) => {
    if (!name || !showValidation) return;

    setIsValidating(true);
    try {
      const response = await fetch("/api/auth/validate-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();
      if (result.success) {
        setValidationResults(result);
      }
    } catch (error) {
      console.error("Name validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);

    if (showValidation) {
      // Debounce validation
      clearTimeout(window.nameValidationTimeout);
      window.nameValidationTimeout = setTimeout(() => {
        validateName(newValue);
      }, 500);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          validationResults && !validationResults.isValid
            ? "border-red-300 bg-red-50"
            : validationResults && validationResults.isValid
            ? "border-green-300 bg-green-50"
            : "border-gray-300"
        }`}
      />

      {showValidation && validationResults && (
        <div className="space-y-1">
          {/* Overall Status */}
          <div className="flex items-center gap-2">
            {validationResults.isValid ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                validationResults.isValid ? "text-green-600" : "text-red-600"
              }`}
            >
              {validationResults.isValid ? "Valid name" : "Invalid name"}
            </span>
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
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
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
          Validating name...
        </div>
      )}
    </div>
  );
};

export default NameInput;

import React from 'react';
import Select from 'react-select';
import { ChevronDown, Search, X } from 'lucide-react';

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'white',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    borderWidth: '2px',
    borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem',
    minHeight: '56px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#3b82f6',
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? '#eff6ff'
      : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    padding: '12px 16px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#1d4ed8',
      color: 'white',
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 9999,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '0.95rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#1f2937',
    fontWeight: '500',
  }),
  input: (base) => ({
    ...base,
    color: '#1f2937',
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#9ca3af',
    cursor: 'pointer',
    '&:hover': {
      color: '#ef4444',
    },
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#9ca3af',
    cursor: 'pointer',
  }),
};

export default function SelectPremium({
  options,
  value,
  onChange,
  onInputChange,
  placeholder = 'Seleccionar...',
  isSearchable = true,
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  error = '',
  label = '',
  required = false,
  icon: Icon,
  className = '',
}) {
  // Eliminamos 'value' de aquí porque no se usa, y 'icon' ahora se usa como Icon

  const formatOptionLabel = (option) => (
    <div className="flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      <span>{option.label}</span>
    </div>
  );

  const DropdownIndicator = (props) => (
    <div {...props.innerProps} className="pr-2">
      <ChevronDown className="h-5 w-5 text-gray-400" />
    </div>
  );

  const ClearIndicator = (props) => (
    <div {...props.innerProps} className="pr-2 cursor-pointer hover:text-red-500">
      <X className="h-5 w-5" />
    </div>
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Select
        options={options}
        value={value}
        onChange={onChange}
        onInputChange={onInputChange}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        components={{ DropdownIndicator, ClearIndicator }}
        className="react-select-container"
        classNamePrefix="react-select"
      />
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
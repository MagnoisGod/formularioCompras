import React from 'react';
import styled from 'styled-components';

const InputGroup = styled.div`
  font-family: 'Segoe UI', sans-serif;
  margin: 1em 0;
  width: 100%;
  position: relative;
`;

const InputField = styled.input`
  font-size: 100%;
  padding: 0.8em;
  outline: none;
  border: 2px solid rgb(200, 200, 200);
  background-color: transparent;
  border-radius: 20px;
  width: 90%;
`;

const InputLabel = styled.label`
  font-size: 100%;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 0.8em;
  margin-left: 0.5em;
  pointer-events: none;
  transition: all 0.3s ease;
  color: rgb(100, 100, 100);
  background-color: transparent;

  ${InputField}:focus ~ &,
  ${InputField}:not(:placeholder-shown) ~ & {
    transform: translateY(-140%) scale(0.9);
    margin-left: 1.3em;
    padding: 0.4em;
    background-color: #e8e8e8;
  }
`;

const AnimatedInput = ({ label, type = "text", required = true, value, onChange }) => {
  return (
    <InputGroup>
      <InputField
        type={type} // Aquí se usa el tipo que se pasa como prop
        required={required}
        autoComplete="off"
        value={value}
        onChange={onChange}
        placeholder=" " // Espacio en blanco para activar :not(:placeholder-shown)
      />
      <InputLabel>{label}</InputLabel>
    </InputGroup>
  );
};

export default AnimatedInput;
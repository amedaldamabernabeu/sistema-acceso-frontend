'use client';

import { useId } from 'react';

type Props = {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Buscador de texto uniforme sobre tablas del panel (filtro en cliente).
 */
export default function FiltroTabla({
  valor,
  onChange,
  placeholder = 'Buscar en la tabla…',
  className = '',
}: Props) {
  const inputId = useId();
  return (
    <div className={`tabla-filtro-bar ${className}`.trim()}>
      <label className="tabla-filtro-bar__label" htmlFor={inputId}>
        Buscar
      </label>
      <input
        id={inputId}
        type="search"
        className="input tabla-filtro-bar__input"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {valor.trim() !== '' && (
        <button
          type="button"
          className="btn tabla-filtro-bar__limpiar"
          onClick={() => onChange('')}
        >
          Limpiar
        </button>
      )}
    </div>
  );
}

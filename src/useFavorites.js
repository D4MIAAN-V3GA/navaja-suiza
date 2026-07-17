import { useState, useCallback } from "react";

// Favoritos persistidos en localStorage (ids de herramienta).
// ponytail: localStorage plano; mover a backend solo si algún día hay cuentas.
const KEY = "navaja:favs";

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load);

  const toggleFav = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const isFav = useCallback((id) => favorites.includes(id), [favorites]);

  return { favorites, isFav, toggleFav };
}

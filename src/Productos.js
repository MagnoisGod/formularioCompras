import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';  // Asegúrate de importar correctamente Firestore
import { collection, getDocs, addDoc } from 'firebase/firestore';

function Productos() {
  const [productos, setProductos] = useState([]);  // Para almacenar los productos
  const [cantidad, setCantidad] = useState({});  // Para almacenar las cantidades seleccionadas

  useEffect(() => {
    const obtenerProductos = async () => {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productosArray = [];
      querySnapshot.forEach((doc) => {
        productosArray.push({ id: doc.id, ...doc.data() });
      });
      setProductos(productosArray);  // Guardar productos en el estado
    };
    
    obtenerProductos();
  }, []);

  // Función para manejar la cantidad seleccionada
  const handleCantidadChange = (id, value) => {
    setCantidad({
      ...cantidad,
      [id]: value,
    });
  };

  const handleAgregarCompra = async () => {
    for (const id in cantidad) {
      if (cantidad[id] > 0) {
        const producto = productos.find((prod) => prod.id === id);  // Buscar el producto

        try {
          await addDoc(collection(db, 'compras'), {
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad[id],
            total: producto.precio * cantidad[id],
            fecha: new Date(),
          });
        } catch (error) {
          console.error("Error al agregar la compra:", error);
        }
      }
    }
  };

  return (
    <div>
      <h2>Productos</h2>
      {productos.map((producto) => (
        <div key={producto.id}>
          <h3>{producto.nombre}</h3>
          <p>Precio: ${producto.precio}</p>
          <input
            type="number"
            min="1"
            value={cantidad[producto.id] || 0}
            onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleAgregarCompra}>Agregar a la compra</button>
    </div>
  );
}

export default Productos;

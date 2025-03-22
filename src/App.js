import { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { addDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import './App.css';
import AnimatedInput from "./components/AnimatedInput"; // Importa el componente

function App() {
  const [userName, setUserName] = useState('');
  const [userNIP, setUserNIP] = useState('');
  const [productName, setProductName] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [price, setPrice] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [quantity, setQuantity] = useState(""); // Cambiado a cadena vacía
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');
  const [isNIPValid, setIsNIPValid] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false); // Controla la visibilidad del modal
  const [payCode, setPayCode] = useState(""); // Almacena el código ingresado en el modal

  const specialCode = "452"; // Código especial para borrar las compras

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, "products"));
      const querySnapshot = await getDocs(q);
      const fetchedProducts = querySnapshot.docs.map(doc => doc.data());
      setProducts(fetchedProducts);
    };
    fetchProducts();
  }, []);

  const handleSubmit = async () => {
    if (/^[0-9]{3}$/.test(userNIP)) {
      setError('');
      setIsLoading(true);
      const q = query(collection(db, "users"), where("userName", "==", userName.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        if (userDoc.data().userNIP === parseInt(userNIP, 10)) {
          setIsNIPValid(true);
          fetchPurchases(userName.toLowerCase());
        } else {
          setError('NIP incorrecto.');
        }
      } else {
        setError('Usuario no encontrado.');
      }
      setIsLoading(false);
    } else {
      setError('El NIP debe ser de 3 dígitos.');
    }
  };

  const registerPurchase = async () => {
    let selectedProduct = productName;
    let selectedPrice = price;

    if (productName === "otro") {
      selectedProduct = customProduct;
      selectedPrice = parseFloat(customPrice);
    } else {
      const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (product) selectedPrice = product.price;
    }

    // Validar que la cantidad sea un número válido y mayor que 0
    const parsedQuantity = parseInt(quantity, 10);
    if (selectedProduct && !isNaN(parsedQuantity) && parsedQuantity > 0 && selectedPrice > 0) {
      const currentDate = new Date().toLocaleString();

      await addDoc(collection(db, 'purchases'), {
        user: userName.toLowerCase(),
        product: selectedProduct,
        price: selectedPrice * parsedQuantity,
        quantity: parsedQuantity,
        date: currentDate
      });

      alert('Compra registrada.');
      fetchPurchases(userName.toLowerCase());
    } else {
      alert('Ingresa un producto válido y un precio correcto.');
    }
  };

  const fetchPurchases = async (userName) => {
    const q = query(collection(db, 'purchases'), where('user', '==', userName));
    const querySnapshot = await getDocs(q);
    setPurchases(querySnapshot.docs.map(doc => doc.data()));
  };

  const generateTicket = () => {
    const ticketElement = document.createElement("div");
    ticketElement.style.width = "90%"; // Ancho relativo para móviles
    ticketElement.style.padding = "15px";
    ticketElement.style.fontSize = "14px";
    ticketElement.style.fontFamily = "Arial, sans-serif";
    ticketElement.style.backgroundColor = "#fff";
    ticketElement.style.border = "1px solid #ccc";
    ticketElement.style.borderRadius = "8px";
    ticketElement.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    ticketElement.style.margin = "0 auto";
    ticketElement.innerHTML = `
      <h2 style="text-align: center; margin: 0 0 10px 0; font-size: 18px;">Ticket de Compra</h2>
      <p style="margin: 5px 0;"><strong>Comprador:</strong> ${userName}</p>
    `;

    let total = 0;
    purchases.forEach((purchase) => {
      ticketElement.innerHTML += `
        <p style="margin: 5px 0;">
          <strong>Fecha:</strong> ${purchase.date}<br>
          <strong>Producto:</strong> ${purchase.product}<br>
          <strong>Precio:</strong> $${purchase.price} x${purchase.quantity}
        </p>
      `;
      total += purchase.price;
    });

    ticketElement.innerHTML += `
      <h3 style="text-align: center; margin: 10px 0 0 0; font-size: 16px;">
        Total: $${total}
      </h3>
    `;

    document.body.appendChild(ticketElement);

    html2canvas(ticketElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Descargar la imagen
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "ticket.png";
      link.click();

      // Enviar un mensaje a WhatsApp con instrucciones
      const phoneNumber = "525564996665"; // Reemplaza con el número deseado (formato internacional)
      const message = "Mira mi ticket de compra. Por favor, adjunta la imagen que se descargó automáticamente."; // Mensaje con instrucciones
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      // Abrir WhatsApp con el enlace
      window.open(whatsappLink, '_blank');

      document.body.removeChild(ticketElement);
    });
  };

  const handleLogout = () => {
    setIsNIPValid(false);
    setUserName('');
    setUserNIP('');
    setPurchases([]);
  };

  const handlePay = () => {
    setShowPayModal(true); // Muestra el modal
  };

  const handlePayConfirm = async () => {
    if (payCode === specialCode) {
      // Eliminar las compras de Firestore
      const q = query(collection(db, 'purchases'), where('user', '==', userName.toLowerCase()));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref); // Eliminar cada documento de la colección
      });

      // Borrar las compras del estado local
      setPurchases([]);
      alert("Pago realizado. Las compras han sido borradas.");
    } else {
      alert("Código incorrecto. No se han borrado las compras.");
    }
    setShowPayModal(false); // Oculta el modal
    setPayCode(""); // Limpia el campo de código
  };

  const totalAcumulado = purchases.reduce((sum, purchase) => sum + purchase.price, 0);

  return (
    <div className="app-container">
      {/* Modal para ingresar el NIP */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ingresa el código especial para pagar</h3>
            <input
              type="password" // Campo de tipo password
              value={payCode}
              onChange={(e) => setPayCode(e.target.value)}
              placeholder="Código especial"
            />
            <div className="modal-buttons">
              <button onClick={handlePayConfirm}>Confirmar</button>
              <button onClick={() => setShowPayModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <h1>{!isNIPValid ? "Ingreso de Credenciales" : "Tus Compras"}</h1>
      {!isNIPValid ? (
        <div className="login-form">
          {/* Inputs de Nombre y NIP */}
          <AnimatedInput
            label="Nombre"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <AnimatedInput
            label="NIP (3 dígitos)"
            type="password" // Cambiado a "password"
            maxLength="3"
            value={userNIP}
            onChange={(e) => setUserNIP(e.target.value)}
          />
          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Validando...' : 'Validar NIP'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <div className="purchase-section">
          <div className="product-form">
            <select
              onChange={(e) => setProductName(e.target.value)}
              value={productName}
            >
              <option value="">Selecciona un producto</option>
              {products.map((product, index) => (
                <option key={index} value={product.name}>
                  {product.name} - ${product.price}
                </option>
              ))}
              <option value="otro">Otro (Ingresar manualmente)</option>
            </select>
            {productName === "otro" && (
              <div className="custom-product">
                <AnimatedInput
                  label="Nombre del producto"
                  value={customProduct}
                  onChange={(e) => setCustomProduct(e.target.value)}
                />
                <AnimatedInput
                  label="Precio"
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>
            )}
            <AnimatedInput
              label="Cantidad"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              placeholder=" " // Espacio en blanco para activar la animación
            />
            <button onClick={registerPurchase}>Agregar Compra</button>
            <button onClick={generateTicket}>Generar Ticket</button>
            <button onClick={handlePay}>Pagar</button> {/* Botón de pagar */}
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>

          <div className="purchases-list">
            <h2>Compras Realizadas</h2>
            <ul>
              {purchases.map((purchase, index) => (
                <li key={index}>
                  {purchase.date} - {purchase.product} - ${purchase.price} x{purchase.quantity}
                </li>
              ))}
            </ul>
            <h3>Total Acumulado: ${totalAcumulado}</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Importamos la base de datos
import { collection, getDocs } from 'firebase/firestore'; // Funciones de Firestore
import './App.css';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('react_aura_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. CARGAR LOS PRODUCTOS DESDE FIREBASE AL INICIAR
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sahumerios"));
        const productosDB = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productosDB);
      } catch (error) {
        console.error("Error al cargar los productos de la base de datos:", error);
      }
    };

    fetchProducts();
  }, []);

  // Persistir carrito
  useEffect(() => {
    localStorage.setItem('react_aura_cart', JSON.stringify(cart));
  }, [cart]);

  // Funciones del carrito (igual que antes)
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // Función para enviar el pedido por WhatsApp
const sendWhatsAppOrder = () => {
  if (cart.length === 0) return;

  // Cambia este número por tu número real de WhatsApp (con código de país, ej: 5491122334455)
  const phoneNumber = "5493518731527"; 

  // Armamos la lista de productos comprados
  let message = "¡Hola *Aura & Armonía*! 🪷 Quería realizar el siguiente pedido:\n\n";
  
  cart.forEach((item) => {
    message += `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}\n`;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  message += `\n*Total:* $${total.toFixed(2)}\n\n¡Muchas gracias!`;

  // Abrir enlace de WhatsApp
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
};

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Filtrado
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="container nav-container">
          <h1 className="brand-logo">🪷 Aura & Armonía (Con Base de Datos)</h1>
          <button className="cart-trigger" onClick={() => setIsCartOpen(true)}>
            🛒 Mi Carrito <span className="badge">{totalItemsCount}</span>
          </button>
        </div>
      </header>

      <main className="container" style={{ marginTop: '30px' }}>
        <div className="controls">
          <input
            type="text"
            placeholder="Buscar sahumerio en la nube..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="categories">
            {['todos', 'sahumerios', 'conos', 'portasahumerios', 'kits'].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de productos obtenidos de Firestore */}
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p>Cargando productos desde la base de datos o sin resultados...</p>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="card">
                <img src={product.img} alt={product.title} />
                <div className="card-body">
                  <h3>{product.title}</h3>
                  <p>{product.desc}</p>
                  <div className="card-footer">
                    <span className="price">${Number(product.price || 0).toFixed(2)}</span>
                    <button className="add-btn" onClick={() => addToCart(product)}>
                      + Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Carrito Lateral */}
      {isCartOpen && <div className="overlay" onClick={() => setIsCartOpen(false)} />}
      <aside className={`drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Tu Carrito</h3>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <p className="empty-msg">Tu carrito está vacío</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.img} alt={item.title} />
                <div className="item-info">
                  <h4>{item.title}</h4>
                  <p>${item.price} c/u</p>
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="total-row">
              <span>Total:</span>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>
            <button className="checkout-btn" onClick={() => { alert("¡Compra realizada!"); setCart([]); setIsCartOpen(false); }}>
              Finalizar Compra
            </button>
            <button 
  className="whatsapp-btn" 
  onClick={sendWhatsAppOrder}
  disabled={cart.length === 0}
  style={{
    backgroundColor: '#25D366',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
    width: '100%',
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }}
>
  📲 Enviar pedido por WhatsApp
</button>
          </div>
          


        )}
      </aside>
    </div>
  );
}
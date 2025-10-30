import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AdminPanel = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    platform: 'playstation',
    category: 'acción'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'orders') {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (email, full_name),
          order_items (
            *,
            products (name, price)
          )
        `)
        .order('created_at', { ascending: false });
      if (!error) setOrders(data || []);
    } else if (activeTab === 'users') {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setUsers(data || []);
    } else if (activeTab === 'products') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (!error) setProducts(data || []);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          platform: formData.platform,
          category: formData.category
        }]);

      if (error) throw error;

      alert('Producto creado exitosamente');
      setShowForm(false);
      setFormData({ name: '', description: '', price: '', platform: 'playstation', category: 'acción' });
      fetchData();
    } catch (error) {
      alert('Error al crear producto: ' + error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingItem(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      platform: product.platform,
      category: product.category
    });
    setShowForm(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          platform: formData.platform,
          category: formData.category
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      alert('Producto actualizado exitosamente');
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', platform: 'playstation', category: 'acción' });
      fetchData();
    } catch (error) {
      alert('Error al actualizar producto: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    // Usar window.confirm en lugar de confirm directo
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('Producto eliminado exitosamente');
      fetchData();
    } catch (error) {
      alert('Error al eliminar producto: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Usar window.confirm en lugar de confirm directo
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      // Primero eliminar carrito del usuario
      await supabase.from('carts').delete().eq('user_id', userId);
      
      // Luego eliminar el usuario
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert('Usuario eliminado exitosamente');
      fetchData();
    } catch (error) {
      alert('Error al eliminar usuario: ' + error.message);
    }
  };

  const toggleUserAdmin = async (user) => {
    // Usar window.confirm para confirmar cambios de admin
    const message = user.is_admin 
      ? '¿Estás seguro de que quieres quitar los privilegios de administrador a este usuario?'
      : '¿Estás seguro de que quieres hacer administrador a este usuario?';
    
    if (!window.confirm(message)) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !user.is_admin })
        .eq('id', user.id);

      if (error) throw error;

      alert(`Usuario ${!user.is_admin ? 'ahora es administrador' : 'ya no es administrador'}`);
      fetchData();
    } catch (error) {
      alert('Error al actualizar usuario: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content admin-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Panel de Administración</h2>
        
        <div className="admin-tabs">
          <button 
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Productos
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Usuarios
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Pedidos
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="products-admin">
            <div className="admin-header">
              <h3>Gestión de Productos</h3>
              <button 
                className="add-btn"
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: '', description: '', price: '', platform: 'playstation', category: 'acción' });
                  setShowForm(true);
                }}
              >
                + Nuevo Producto
              </button>
            </div>

            {showForm && (
              <div className="form-modal">
                <div className="form-content">
                  <h4>{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</h4>
                  <form onSubmit={editingItem ? handleUpdateProduct : handleCreateProduct}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nombre del producto"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Descripción"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Precio"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                    <select name="platform" value={formData.platform} onChange={handleInputChange}>
                      <option value="playstation">PlayStation</option>
                      <option value="xbox">Xbox</option>
                      <option value="nintendo">Nintendo</option>
                    </select>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      <option value="acción">Acción</option>
                      <option value="aventura">Aventura</option>
                      <option value="rpg">RPG</option>
                      <option value="shooter">Shooter</option>
                      <option value="carreras">Carreras</option>
                      <option value="deportes">Deportes</option>
                    </select>
                    <div className="form-buttons">
                      <button type="submit" className="save-btn">
                        {editingItem ? 'Actualizar' : 'Crear'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowForm(false)} 
                        className="cancel-btn"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="products-list">
              {products.map(product => (
                <div key={product.id} className="admin-product-item">
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p>{product.description}</p>
                    <div className="product-meta">
                      <span>Plataforma: {product.platform}</span>
                      <span>Categoría: {product.category}</span>
                      <span>Precio: ${product.price}</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button onClick={() => handleEditProduct(product)} className="edit-btn">
                      ✏️ Editar
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-admin">
            <h3>Gestión de Usuarios</h3>
            <div className="users-list">
              {users.map(user => (
                <div key={user.id} className="admin-user-item">
                  <div className="user-info">
                    <p><strong>Nombre:</strong> {user.full_name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Administrador:</strong> {user.is_admin ? 'Sí' : 'No'}</p>
                    <p><strong>Registrado:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="user-actions">
                    <button 
                      onClick={() => toggleUserAdmin(user)}
                      className={user.is_admin ? 'remove-admin-btn' : 'make-admin-btn'}
                    >
                      {user.is_admin ? '❌ Quitar Admin' : '👑 Hacer Admin'}
                    </button>
                    {!user.is_admin && (
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="delete-btn"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-admin">
            <h3>Historial de Pedidos</h3>
            {orders.length === 0 ? (
              <p>No hay pedidos registrados</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="admin-order-item">
                  <div className="order-header">
                    <span>Pedido #{order.id}</span>
                    <span>${order.total_amount}</span>
                  </div>
                  <div className="order-details">
                    <p>Cliente: {order.users?.full_name} ({order.users?.email})</p>
                    <p>Fecha: {new Date(order.created_at).toLocaleDateString()}</p>
                    <p>Estado: {order.status}</p>
                    <div className="order-items">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="order-item-product">
                          {item.products?.name} - {item.quantity} x ${item.price}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
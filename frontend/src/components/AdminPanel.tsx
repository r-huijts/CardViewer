import React, { useState } from 'react';
import { Card } from '../types';
import CardGrid from './CardGrid';
import CardForm from './CardForm';
import './AdminPanel.css';

interface AdminPanelProps {
  cards: Card[];
  onLogout: () => void;
  onCardUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ cards, onLogout, onCardUpdate }) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);

  const handleAddNew = () => {
    setEditingCard(undefined);
    setShowCardForm(true);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const handleDelete = (cardId: number) => {
    // The Card component handles the actual deletion
    // We just need to trigger a refresh
    onCardUpdate();
  };

  const handleFormSubmit = (success: boolean) => {
    if (success) {
      onCardUpdate();
    }
    setShowCardForm(false);
    setEditingCard(undefined);
  };

  const handleFormCancel = () => {
    setShowCardForm(false);
    setEditingCard(undefined);
  };

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <div className="admin-actions">
          <button className="btn-primary" onClick={handleAddNew}>
            Add New Card
          </button>
          <button className="btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <main className="admin-content">
        <CardGrid
          cards={cards}
          isAdmin={true}
          onCardEdit={handleEdit}
          onCardDelete={handleDelete}
        />
      </main>
      
      {showCardForm && (
        <CardForm
          card={editingCard}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default AdminPanel; 
import React from 'react';
import { Card as CardType } from '../types';
import Card from './Card';
import './CardGrid.css';

interface CardGridProps {
  cards: CardType[];
  isAdmin?: boolean;
  onCardEdit?: (card: CardType) => void;
  onCardDelete?: (cardId: number) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ 
  cards, 
  isAdmin = false, 
  onCardEdit, 
  onCardDelete 
}) => {
  if (cards.length === 0) {
    return (
      <div className="card-grid-empty">
        No cards available. {isAdmin ? 'Add some cards to get started!' : ''}
      </div>
    );
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          isAdmin={isAdmin}
          onEdit={onCardEdit}
          onDelete={onCardDelete}
        />
      ))}
    </div>
  );
};

export default CardGrid; 
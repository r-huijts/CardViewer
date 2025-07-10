import React, { useState } from 'react';
import { Card as CardType } from '../types';
import ApiService from '../api';
import './Card.css';

interface CardProps {
  card: CardType;
  isAdmin?: boolean;
  onEdit?: (card: CardType) => void;
  onDelete?: (cardId: number) => void;
}

const Card: React.FC<CardProps> = ({ card, isAdmin = false, onEdit, onDelete }) => {
  const [isClickFlipped, setIsClickFlipped] = useState(false);
  const [isHoverFlipped, setIsHoverFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Card is flipped if either click-flipped OR hover-flipped
  const isFlipped = isClickFlipped || isHoverFlipped;

  const handleCardClick = () => {
    if (!isDeleting) {
      setIsClickFlipped(!isClickFlipped);
      // Reset hover state when clicking to avoid conflicts
      setIsHoverFlipped(false);
    }
  };

  const handleMouseEnter = () => {
    // Only allow hover flip if not permanently flipped by click
    if (!isClickFlipped && !isDeleting) {
      setIsHoverFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    // Always reset hover state when leaving
    setIsHoverFlipped(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(card);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete || isDeleting) return;

    if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
      setIsDeleting(true);
      try {
        await ApiService.deleteCard(card.id);
        onDelete(card.id);
      } catch (error) {
        console.error('Failed to delete card:', error);
        alert('Failed to delete card. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const imageUrl = card.image_path ? ApiService.getImageUrl(card.image_path) : null;

  return (
    <div className="card-container">
      <div className="card-header">
        <h2 className="card-main-title">{card.title}</h2>
        {card.subtitle && <p className="card-main-subtitle">{card.subtitle}</p>}
      </div>
      
      <div className={`card ${isFlipped ? 'flipped' : ''}`} onClick={handleCardClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isAdmin && (
          <div className="card-actions">
            <button 
              className="btn-edit" 
              onClick={handleEdit}
              disabled={isDeleting}
              title="Edit card"
            >
              Edit
            </button>
            <button 
              className="btn-delete" 
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete card"
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
          </div>
        )}
        
        <div className="card-inner">
          <div className="card-front">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={card.title} 
                className="card-image"
                onError={(e) => {
                  // Hide broken images
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="card-placeholder">
                <div className="card-placeholder-title">{card.title}</div>
                {card.subtitle && <div className="card-placeholder-subtitle">{card.subtitle}</div>}
              </div>
            )}
          </div>
          
          <div className="card-back">
            <div className="card-back-content">
              <h3 className="card-back-title">{card.title}</h3>
              {card.description ? (
                <p className="card-description">{card.description}</p>
              ) : (
                <p className="card-description">No description available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card; 
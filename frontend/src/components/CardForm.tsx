import React, { useState, useEffect } from 'react';
import { Card, CreateCardRequest } from '../types';
import ApiService from '../api';
import './CardForm.css';

interface CardFormProps {
  card?: Card;
  onSubmit: (success: boolean) => void;
  onCancel: () => void;
}

const CardForm: React.FC<CardFormProps> = ({ card, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!card;

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        subtitle: card.subtitle || '',
        description: card.description || '',
      });
    }
  }, [card]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardData: CreateCardRequest = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        description: formData.description.trim() || undefined,
        image: imageFile || undefined,
      };

      if (isEditMode && card) {
        await ApiService.updateCard({ ...cardData, id: card.id });
      } else {
        await ApiService.createCard(cardData);
      }

      onSubmit(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save card');
      onSubmit(false);
    } finally {
      setLoading(false);
    }
  };

  const currentImageUrl = card?.image_path ? ApiService.getImageUrl(card.image_path) : null;

  return (
    <div className="card-form-overlay">
      <div className="card-form-container">
        <h2>{isEditMode ? 'Edit Card' : 'Add New Card'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subtitle">Subtitle</label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            {currentImageUrl && (
              <div className="current-image">
                <p>Current image:</p>
                <img 
                  src={currentImageUrl} 
                  alt="Current" 
                  className="preview-image"
                />
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardForm; 
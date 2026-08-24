import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import PropertyFilters from '../components/PropertyFilters';
import './ListingsPage.css';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import PropertyImageCarousel from '../components/PropertyImageCarousel';
import { useSearchParams } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [itemsPerPage] = useState(20);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    zipcode: searchParams.get('zipcode') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    beds: searchParams.get('beds') || '',
    baths: searchParams.get('baths') || ''
  });
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1
  );

  useEffect(() => {
    loadProperties();
  }, [filters, currentPage]);

  async function loadProperties() {
    try {
      setLoading(true);
      setError(null);
      
      const offset = (currentPage - 1) * itemsPerPage;
      const params = { ...filters, limit: itemsPerPage, offset };
      const data = await fetchProperties(params);
      
      setProperties(data.results);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading properties...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);

    setSearchParams({
    ...newFilters,
    page: '1'
  });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top

    setSearchParams({
    ...filters,
    page: String(newPage)
  });
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="listings-page">
      <h1>Property Listings</h1>
      
      <PropertyFilters onSearch={handleSearch} />
      
      {loading && <div className="loading">Loading properties...</div>}
      
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <p className="results-summary">
          Showing {((currentPage - 1) * itemsPerPage) + 1}-
          {Math.min(currentPage * itemsPerPage, total)} of {total.toLocaleString()} properties
        </p>
      )}
      
      {!loading && !error && (
        <>
          <p>Showing {properties.length} of {total} properties</p>
          
          {properties.length === 0 ? (
            <div className="no-results">
              No properties found matching your criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="property-grid">
              {properties.map(property => (
                <PropertyCard key={property.L_ListingID} property={property} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && properties.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

    </div>
  );

}

function PropertyCard({ property }) {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  const favorite = isFavorite(property.L_ListingID);

  const handleClick = () => {
    navigate(`/property/${property.L_ListingID}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent navigation
    if (favorite) {
      removeFavorite(property.L_ListingID);
    } else {
      addFavorite(property.L_ListingID);
    }
  };


  return (
    <div className="property-card" onClick={handleClick}>
      <div className="property-image">
        <PropertyImageCarousel photos={property.L_Photos} address={property.L_Address} />
        <button
          className={`favorite-btn ${favorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {favorite ? '♥' : '♡'}
        </button>
      </div>

      
      <div className="property-info">
        <div className="price">${property.L_SystemPrice?.toLocaleString()}</div>
        <div className="address">{property.L_Address}</div>
        <div className="city">{property.L_City}, {property.L_State}</div>
        
        <div className="property-details">
          <span>{property.L_Keyword2} beds</span>
          <span>•</span>
          <span>{property.LM_Dec_3} baths</span>
          {property.LM_Int2_3 && (
            <>
              <span>•</span>
              <span>{property.LM_Int2_3.toLocaleString()} sqft</span>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default ListingsPage;

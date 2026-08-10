import { useState } from 'react';
import './PropertyImageCarousel.css';

function PropertyImageCarousel({ photos, address }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // L_Photos is stored as a JSON array string — parse it
  let photoList = [];
  try {
    photoList = photos ? JSON.parse(photos) : [];
  } catch {
    photoList = photos ? [photos] : [];
  }

  if (photoList.length === 0) {
    return <div className="carousel-no-image">No image available</div>;
  }

  const prev = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === 0 ? photoList.length - 1 : i - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === photoList.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="carousel">
      <img
        src={photoList[currentIndex]}
        alt={`${address} photo ${currentIndex + 1}`}
        className="carousel-img"
      />
      {photoList.length > 1 && (
        <>
          <button className="carousel-btn carousel-prev" onClick={prev}>&#8249;</button>
          <button className="carousel-btn carousel-next" onClick={next}>&#8250;</button>
          <div className="carousel-counter">
            {currentIndex + 1} / {photoList.length}
          </div>
        </>
      )}
    </div>
  );
}

export default PropertyImageCarousel;

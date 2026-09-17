// interfaces
interface IProps {
  size?: string | 'medium';
  image?: string;
  alt?: string;
}

const CapturedPhoto: React.FC<IProps> = ({ size = 'medium', image, alt = 'Foto capturada' }) => {
  if (!image) {
    return (
      <div className='captured-photo'>
        <div className={`placeholder ${size}`}>
          <span className="material-symbols-outlined">photo_camera</span>
          <p>No hay foto capturada</p>
        </div>
      </div>
    );
  }

  return (
    <div className='captured-photo'>
      <div className={`photo-container ${size}`}>
        <img src={image} alt={alt} className="captured-image" />
      </div>
    </div>
  );
};

export default CapturedPhoto;
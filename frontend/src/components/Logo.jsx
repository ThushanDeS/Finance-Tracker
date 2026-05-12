const Logo = ({ centered = false, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: centered ? 'center' : 'flex-start',
        gap: '0.6rem',
      }}
    >
      <div className="brand-logo" aria-hidden="true">FT</div>
      <div className="brand">
        FINANCE<span style={{ opacity: 0.75, marginLeft: 6 }}>TRACKER</span>
      </div>
    </div>
  );
};

export default Logo;
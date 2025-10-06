const Logo = ({ width = 160, height = 50, className = "" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bingeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e74c3c">
            <animate attributeName="stop-color" values="#e74c3c;#c0392b;#e74c3c" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#c0392b">
            <animate attributeName="stop-color" values="#c0392b;#e74c3c;#c0392b" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        <linearGradient id="monkeysGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f39c12">
            <animate attributeName="stop-color" values="#f39c12;#e67e22;#f39c12" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#e67e22">
            <animate attributeName="stop-color" values="#e67e22;#f39c12;#e67e22" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      
      {/* Play button icon on left */}
      <circle cx="20" cy="25" r="10" fill="url(#bingeGrad)">
        <animate attributeName="r" values="10;11;10" dur="2s" repeatCount="indefinite" />
      </circle>
      <path d="M17 20 L17 30 L26 25 Z" fill="#fff">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 1,0; 0,0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* BINGE text */}
      <text
        x="38"
        y="22"
        fontFamily="'Montserrat', 'Arial Black', sans-serif"
        fontSize="14"
        fontWeight="900"
        fill="url(#bingeGrad)"
        letterSpacing="1"
      >
        BINGE
      </text>
      
      {/* MONKEYS text */}
      <text
        x="38"
        y="38"
        fontFamily="'Montserrat', 'Arial Black', sans-serif"
        fontSize="14"
        fontWeight="900"
        fill="url(#monkeysGrad)"
        letterSpacing="1"
      >
        MONKEYS
      </text>
      
      {/* Decorative dots on right - animated */}
      <circle cx="145" cy="20" r="2.5" fill="#e74c3c" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="152" cy="20" r="2.5" fill="#f39c12" opacity="0.8">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="145" cy="30" r="2.5" fill="#f39c12" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="152" cy="30" r="2.5" fill="#e74c3c" opacity="0.8">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

export default Logo;

// interfaces
interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset';
  text: string;
  color: string;
  leftIcon?: string;
  rightIcon?: string;
  onClick?: () => void | Promise<void>;
  buttonSize?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<IProps> = ({
  type,
  text,
  color,
  leftIcon,
  rightIcon,
  onClick,
  className: extra,
  buttonSize,
  style,
  disabled,
  id,
  ...rest
}) => {
  const sizeClass = buttonSize ? `button-${buttonSize}` : '';
  const className = `button ${color}${sizeClass ? ` ${sizeClass}` : ''}${extra ? ` ${extra}` : ''}`;

  return (
    <button
      id={id}
      type={type === 'button' ? 'button' : type === 'reset' ? 'reset' : 'submit'}
      className={className}
      onClick={onClick}
      style={style}
      disabled={disabled}
      {...rest}
    >
      {leftIcon !== undefined && (
        <span className='material-symbols-outlined left-icon'>{leftIcon}</span>
      )}
      {text}
      {rightIcon !== undefined && (
        <span className='material-symbols-outlined right-icon'>{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;

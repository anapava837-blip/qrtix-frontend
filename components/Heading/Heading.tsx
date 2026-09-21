// interfaces
interface IProps extends React.HTMLAttributes<HTMLHeadingElement> {
  text: string;
  type: number;
  color: string;
}

const Heading: React.FC<IProps> = ({ text, type, color, style, id, className: extraClassName, ...rest }) => {
  const classNames = extraClassName ? `${color} ${extraClassName}` : color;

  if (type === 1) {
    return (
      <h1 id={id} style={style} className={classNames} {...rest}>
        {text}
      </h1>
    );
  }

  if (type === 2) {
    return (
      <h2 id={id} style={style} className={classNames} {...rest}>
        {text}
      </h2>
    );
  }

  if (type === 3) {
    return (
      <h3 id={id} style={style} className={classNames} {...rest}>
        {text}
      </h3>
    );
  }

  if (type === 4) {
    return (
      <h4 id={id} style={style} className={classNames} {...rest}>
        {text}
      </h4>
    );
  }

  if (type === 5) {
    return (
      <h5 id={id} style={style} className={classNames} {...rest}>
        {text}
      </h5>
    );
  }

  if (type === 6) {
    return (
      <h6 id={id} style={style} className={classNames} {...rest}>
        {text}
      </h6>
    );
  }

  throw Error('¡No se permite etiqueta H en este tipo! Utilice valores de 1 a 6.');
};

export default Heading;

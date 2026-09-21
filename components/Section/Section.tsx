// interfaces
interface IProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children: React.ReactNode;
}

const Section: React.FC<IProps> = ({ className, children, style, id, ...rest }) => (
  <section
    id={id}
    style={style}
    className={className !== undefined ? `${className}` : 'no-style'}
    {...rest}
  >
    {children}
  </section>
);

export default Section;

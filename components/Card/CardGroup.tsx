import React from 'react';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

interface CardGroupProps {
  title: string;
  url?: string;
  color?: string;
  background?: string;
  gridClassName?: string;
  children: React.ReactNode;
}

const CardGroup: React.FC<CardGroupProps> = ({
  title,
  url,
  color = 'blue',
  background = 'white',
  gridClassName = 'events-grid',
  children,
}) => {
  return (
    <Section className={`${background}-background`}>
      <div className='container'>
        <div className='flex-between'>
          <Heading type={2} color={color} text={title} />
          {url && <ButtonLink url={url} text='Ver todos' color={color} />}
        </div>
        <div className={gridClassName}>{children}</div>
      </div>
    </Section>
  );
};

export default CardGroup;

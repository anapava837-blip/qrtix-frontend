// components
import Slider from '@components/Slider/Slider';
import ButtonCircle from '@components/Button/ButtonCircle';

const CircleButtons: React.FC = () => (
  <Slider>
    <ButtonCircle icon='theater_comedy' text='Teatros' url='list' />
    <ButtonCircle icon='stadium' text='Conciertos' url='list' />
    <ButtonCircle icon='child_care' text='Niños' url='list' />
    <ButtonCircle icon='sports_football' text='Deportes' url='list' />
    <ButtonCircle icon='attractions' text='Atracciones' url='list' />
    <ButtonCircle icon='piano' text='Musicales' url='list' />
    <ButtonCircle icon='comedy_mask' text='Comedias' url='list' />
    <ButtonCircle icon='festival' text='Festivales' url='list' />
  </Slider>
);

export default CircleButtons;

import React from 'react';
import { Lizard, Loading, Paper, Rock, Scissors, Spock } from './images';

interface Props {
  play: 'loading' | 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock';
  className?: string;
}

export const PlayImage: React.FC<Props> = ({ play, className }: Props) => {
  switch (play) {
    case 'rock':
      return <img className={className} src={Rock} alt="your play is rock" />;
    case 'paper':
      return <img className={className} src={Paper} alt="your play is paper" />;
    case 'scissors':
      return (
        <img className={className} src={Scissors} alt="your play is scissors" />
      );
    case 'lizard':
      return (
        <img className={className} src={Lizard} alt="your play is lizard" />
      );
    case 'spock':
      return <img className={className} src={Spock} alt="your play is spock" />;
    default:
      return (
        <img className={className} src={Loading} alt="waiting on opponent" />
      );
  }
};

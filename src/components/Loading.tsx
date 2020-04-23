import React from 'react';
import { keyframes } from 'styled-components';
import { styled } from './FoundationStyles';

interface IProps {
  shown: boolean;
}

const BG = styled.div`
  background: #666;
  height: 100%;
  left: 0;
  opacity: 0.5;
  position: absolute;
  top: 0;
  width: 100%;
`;

const RoundAnimate = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;
const SpinnerBox = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;
const Spinner = styled.div`
  animation: ${RoundAnimate} 1.1s infinite linear;
  border-bottom: 1.1em solid ${(p): string => p.theme.PRIMARY_1};
  border-left: 1.1em solid ${(p): string => p.theme.PRIMARY_0};
  border-radius: 50%;
  border-right: 1.1em solid ${(p): string => p.theme.PRIMARY_1};
  border-top: 1.1em solid ${(p): string => p.theme.PRIMARY_1};
  font-size: 10px;
  height: 10em;
  margin: 60px auto;
  position: relative;
  transform: translateZ(0);
  width: 10em;
  &:after {
    border-radius: 50%;
    width: 10em;
    height: 10em;
  }
`;

const Loading: React.FC<IProps> = props => {
  if (!props.shown) {
    return null;
  }
  return (
    <div>
      <BG />
      <SpinnerBox>
        <Spinner />
      </SpinnerBox>
    </div>
  );
};

export default Loading;

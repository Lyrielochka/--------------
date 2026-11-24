import React from 'react';
import BattleAtlas from './MinskBattleAtlas.jsx';
import registry from './vitebskBattleEvents.json';

export default function VitebskBattleAtlas(props){
  return <BattleAtlas {...props} registry={registry} region="vitebsk"/>;
}

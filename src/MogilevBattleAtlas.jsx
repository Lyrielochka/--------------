import React from 'react';
import BattleAtlas from './MinskBattleAtlas.jsx';
import registry from './mogilevBattleEvents.json';

export default function MogilevBattleAtlas(props){
  return <BattleAtlas {...props} registry={registry} region="mogilev"/>;
}

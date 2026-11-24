import React from 'react';
import BattleAtlas from './MinskBattleAtlas.jsx';
import registry from './grodnoBattleEvents.json';

export default function GrodnoBattleAtlas(props){
  return <BattleAtlas {...props} registry={registry} region="grodno"/>;
}

import React from 'react';
import BattleAtlas from './MinskBattleAtlas.jsx';
import registry from './brestBattleEvents.json';

export default function BrestBattleAtlas(props){
  return <BattleAtlas {...props} registry={registry} region="brest"/>;
}

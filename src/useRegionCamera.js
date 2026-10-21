import {useEffect, useRef, useState} from 'react';
import {minskRegionBounds} from './minskRegionBounds.js';
import {xy} from './bagrationMapData.js';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export const REGION_INITIAL_ZOOM=3.2;
export const REGION_MAX_ZOOM=9;
const center={x:(minskRegionBounds.left+minskRegionBounds.right)/2,y:(minskRegionBounds.top+minskRegionBounds.bottom)/2};

export default function useRegionCamera(open,canvasRef,worldRef){
  const [camera,setCamera]=useState({zoom:REGION_INITIAL_ZOOM,x:0,y:0});
  const [size,setSize]=useState({width:0,height:0});
  const [dragging,setDragging]=useState(false);
  const pointers=useRef(new Map()),gesture=useRef(null),current=useRef(camera);
  const frame=useRef(0),pending=useRef(null),commitZoom=useRef(false);
  const sizeRef=useRef(size);sizeRef.current=size;
  const transformFor=value=>{
    const {width,height}=sizeRef.current;
    const dx=(.5-center.x/1402)*width*value.zoom+value.x;
    const dy=(.5-center.y/1122)*height*value.zoom+value.y;
    return `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${value.zoom})`;
  };
  // Pointer panning only moves the composited layer; React commits at gesture end.
  const schedule=(value,zoomChanged=false)=>{
    current.current=value;pending.current=value;commitZoom.current ||= zoomChanged;
    if(frame.current)return;
    frame.current=requestAnimationFrame(()=>{
      frame.current=0;const next=pending.current;pending.current=null;
      if(commitZoom.current){commitZoom.current=false;setCamera(next)}
      else if(worldRef.current)worldRef.current.style.transform=transformFor(next);
    });
  };
  useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
  const limit=(value)=>{
    const width=worldRef.current?.offsetWidth||size.width,height=worldRef.current?.offsetHeight||size.height;
    const viewport=canvasRef.current;
    // Leave a margin at the edges so every boundary remains reachable at any zoom.
    const maxX=(minskRegionBounds.right-minskRegionBounds.left)/1402*width*value.zoom/2+(viewport?.clientWidth||0)*.2;
    const maxY=(minskRegionBounds.bottom-minskRegionBounds.top)/1122*height*value.zoom/2+(viewport?.clientHeight||0)*.2;
    return {...value,x:clamp(value.x,-maxX,maxX),y:clamp(value.y,-maxY,maxY)};
  };
  const reset=()=>{current.current={zoom:REGION_INITIAL_ZOOM,x:0,y:0};setCamera(current.current)};
  const zoomBy=factor=>schedule(limit({...current.current,zoom:clamp(current.current.zoom*factor,1.6,REGION_MAX_ZOOM)}),true);
  const focusAt=(coordinates,zoom)=>{
    const point=xy(...coordinates),world=worldRef.current,viewport=canvasRef.current;
    if(!world||!viewport)return;
    const scale=clamp(zoom??current.current.zoom,1.6,REGION_MAX_ZOOM);
    const mobile=viewport.clientWidth<700;
    current.current=limit({zoom:scale,x:(center.x-point.x)/1402*world.offsetWidth*scale-(mobile?0:viewport.clientWidth*.14),y:(center.y-point.y)/1122*world.offsetHeight*scale-(mobile?viewport.clientHeight*.2:0)});setCamera(current.current);
  };
  useEffect(()=>{
    const world=worldRef.current;if(!world)return;
    const observer=new ResizeObserver(()=>{setSize({width:world.offsetWidth,height:world.offsetHeight});setCamera(c=>{current.current=limit(c);return current.current})});
    observer.observe(world);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{reset();setDragging(false);pointers.current.clear();gesture.current=null},[open]);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!open||!canvas)return;
    const wheel=e=>{if(e.target.closest('button,a,input,[data-map-ui]'))return;e.preventDefault();zoomBy(Math.exp(-clamp(e.deltaY,-100,100)*.002))};
    canvas.addEventListener('wheel',wheel,{passive:false});return()=>canvas.removeEventListener('wheel',wheel);
  },[open]);
  const beginGesture=()=>{
    const points=[...pointers.current.values()];
    gesture.current={camera:current.current,mid:{x:points.reduce((s,p)=>s+p.x,0)/points.length,y:points.reduce((s,p)=>s+p.y,0)/points.length},distance:points.length>1?Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y):0};
  };
  const onPointerDown=e=>{
    if(!open||e.button!==0||e.target.closest('button,a,input,[data-map-ui]'))return;
    canvasRef.current.focus({preventScroll:true});
    e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});beginGesture();setDragging(true);
  };
  const onPointerMove=e=>{
    if(!open||!pointers.current.has(e.pointerId)||!gesture.current)return;
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const points=[...pointers.current.values()],start=gesture.current;
    const mid={x:points.reduce((s,p)=>s+p.x,0)/points.length,y:points.reduce((s,p)=>s+p.y,0)/points.length};
    const ratio=points.length>1&&start.distance?Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)/start.distance:1;
    schedule(limit({...start.camera,zoom:clamp(start.camera.zoom*ratio,1.6,REGION_MAX_ZOOM),x:start.camera.x+mid.x-start.mid.x,y:start.camera.y+mid.y-start.mid.y}),points.length>1);
  };
  const release=e=>{pointers.current.delete(e.pointerId);if(pointers.current.size)beginGesture();else{gesture.current=null;cancelAnimationFrame(frame.current);frame.current=0;pending.current=null;commitZoom.current=false;setCamera(current.current);setDragging(false)}};
  const onKeyDown=e=>{
    if(!open||e.target!==canvasRef.current)return;
    const step=70;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();current.current=limit({...current.current,x:current.current.x+(e.key==='ArrowLeft'?step:e.key==='ArrowRight'?-step:0),y:current.current.y+(e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0)});setCamera(current.current)}
    else if(e.key==='+'||e.key==='='){e.preventDefault();zoomBy(1.25)}else if(e.key==='-'){e.preventDefault();zoomBy(.8)}else if(e.key==='Home'){e.preventDefault();reset()}
  };
  const dx=(.5-center.x/1402)*size.width*camera.zoom+camera.x;
  const dy=(.5-center.y/1122)*size.height*camera.zoom+camera.y;
  return {zoom:camera.zoom,dragging,zoomBy,reset,focusAt,transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${camera.zoom})`,handlers:{onPointerDown,onPointerMove,onPointerUp:release,onPointerCancel:release,onLostPointerCapture:release,onKeyDown}};
}

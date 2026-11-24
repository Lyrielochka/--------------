// NDJSON records may be split anywhere, including inside a UTF-8 character.
export async function* readJsonLines(body){
  const decoder=new TextDecoder();let buffer='';
  for await(const chunk of body){
    buffer+=decoder.decode(chunk,{stream:true});
    let end;while((end=buffer.indexOf('\n'))!==-1){const line=buffer.slice(0,end).trim();buffer=buffer.slice(end+1);if(line)yield JSON.parse(line);}
  }
  buffer+=decoder.decode();if(buffer.trim())yield JSON.parse(buffer);
}

export function visibleReply(text){
  return text.replace(/<think>[\s\S]*?(?:<\/think>|$)/g,'').replace(/<[^>]*$/,'').trimStart();
}

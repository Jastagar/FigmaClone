import CursorSVG from '@/public/assets/CursorSVG'
import { CursorChatProps, CursorMode } from '@/types/type'
import React from 'react'

export default function CursorChat({
  cursor,
  cursorState,
  setCursorState,
  updateMyPresence
}: CursorChatProps) {

  function handleChange(event: React.ChangeEvent<HTMLInputElement>){
    updateMyPresence({message: event.target.value})
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: event.target.value,    
    })
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>){
    if(event.key==='Enter'){
      setCursorState({
        mode: CursorMode.Chat,
        previousMessage: cursorState.message,
        message: '',
      })
    }else if( event.key==='Escape'){
      setCursorState({
        mode: CursorMode.Hidden
      })
    }
  }



  return (
    <div style={{transform:`translateX(${cursor.x}px) translateY(${cursor.y}px)`}} className='absolute top-0 left-0'>
      {cursorState.mode === CursorMode.Chat && (<>
        
        <CursorSVG color='#000'/>
        <div className='absolute top-2 left-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white rounded-[20px]'
          onKeyUp={(e) => e.stopPropagation()}
        >
          <div>
            {cursorState.previousMessage && <div>{cursorState.previousMessage}</div>}
          </div>
          <input 
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className='z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none'
            autoFocus
            placeholder={cursorState.previousMessage? '':'Type A Message...'}
            value={cursorState.message}
            maxLength={50}
          />
        </div>

      </>)}
    </div>
  )
}

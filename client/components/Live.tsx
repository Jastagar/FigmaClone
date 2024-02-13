import React, { useCallback, useEffect, useState } from 'react'
import LiveCursors from './Cursor/LiveCursors'
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from '@/liveblocks.config'
import CursorChat from './Cursor/CursorChat'
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type'
import ReactionSelector from './Reactions/ReactionButton'
import FlyingReaction from './Reactions/FlyingReaction'
import useInterval from '@/hooks/useInterval'

export default function Live() {
    const others = useOthers()
    const [{cursor}, updateMyPresence] = useMyPresence() as any

    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    })
    const [reaction, setReaction] = useState<Reaction[]>([])

    const broadcast = useBroadcastEvent()
    
    useInterval(()=>{
        setReaction((prevRxn) =>{
            return prevRxn.filter((r) => (
                r.timestamp > Date.now()-3000
            ))
        })
    }, 1000)

    useInterval(()=>{
        if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor){
            setReaction((prevRxn)=>{
                return prevRxn.concat({
                    point: {x: cursor.x, y:cursor.y},
                    value: cursorState.reaction,
                    timestamp: Date.now(),
                })
            })
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            })
        }
    },100);

    useEventListener((eventData)=>{
        const event = eventData.event as ReactionEvent
        
        setReaction((prevRxn)=>{
            return prevRxn.concat({
                point: {x: event.x, y:event.y},
                value: event.value,
                timestamp: Date.now(),
            })
        })
    })

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();
        if( cursor == null || cursorState.mode !== CursorMode.Reaction){
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y
    
            updateMyPresence({ cursor:{ x, y } })
        }

    },[])

    const handlePointerUp = useCallback((event: React.PointerEvent) => {
        setCursorState((prev) =>{
            return cursorState.mode === CursorMode.Reaction
            ? {...prev, isPressed: true}
            : prev
        })
    },[cursorState.mode, setCursorState])

    const handlePointerDown = useCallback((event: React.PointerEvent) => {

        const x = event.clientX - event.currentTarget.getBoundingClientRect().x
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y

        updateMyPresence({ cursor:{ x, y } })

        setCursorState((prev) =>{
            return cursorState.mode === CursorMode.Reaction
            ? {...prev, isPressed: true}
            : prev
        })
    },[cursorState.mode, setCursorState])
     
    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        setCursorState({
            mode: CursorMode.Hidden
        })
        updateMyPresence({ cursor:null, message:null })
    },[])

    useEffect(()=>{
        const onKeyUp = (e:KeyboardEvent) => {
            if(e.key==='/'){
                setCursorState({
                    mode:CursorMode.Chat,
                    previousMessage: null,
                    message: ''
                })
            }else if( e.key ==='Escape'){
                updateMyPresence({message:''})
                setCursorState({
                    mode: CursorMode.Hidden
                })
            }else if( e.key ==='e'){
                updateMyPresence({message:''})
                setCursorState({
                    mode: CursorMode.ReactionSelector
                })
            }
        }
        const onKeyDown = (e:KeyboardEvent) =>{
            if(e.key==='/'){
                e.preventDefault()
            }
        }

        window.addEventListener('keyup',onKeyUp)
        window.addEventListener('keydown',onKeyDown)
        
        return () => {
            window.removeEventListener('keyup',onKeyUp)
            window.removeEventListener('keydown',onKeyDown)
        }
    },[updateMyPresence])

    const setReactions = useCallback((reaction: string)=>{
        setCursorState({
            mode: CursorMode.Reaction,
            reaction,
            isPressed: false,
        })
    },[])

    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className='h-[100dvh] w-full flex justify-center text-center items-center'
        >
            <h1 className="text-2xl text-white">
                HEELOOOOO WORLDDDD
            </h1>
            {reaction.map((r)=>(
                <FlyingReaction
                    key={r.timestamp.toString()}
                    value={r.value}
                    timestamp={r.timestamp}
                    x={r.point.x}
                    y={r.point.y}
                /> 
            ))}
            {cursor && <CursorChat
                cursor={cursor} 
                cursorState={cursorState}
                setCursorState={setCursorState}
                updateMyPresence={updateMyPresence}
            />}
            {cursorState.mode === CursorMode.ReactionSelector &&
                <ReactionSelector 
                    setReaction={setReactions}
                />
            }
            <LiveCursors others={others} />
        </div>
    )
}

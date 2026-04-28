'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  onResult: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        if (cancelled || !videoRef.current) return
        const reader = new BrowserMultiFormatReader()
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result && !cancelled) {
              cancelled = true
              controls.stop()
              onResult(result.getText())
            }
          }
        )
        controlsRef.current = controls
        if (!cancelled) setStatus('scanning')
      } catch {
        if (!cancelled) {
          setErrorMsg('Camera unavailable or permission denied.')
          setStatus('error')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [onResult])

  function handleClose() {
    controlsRef.current?.stop()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl overflow-hidden w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="font-medium text-sm">Scan barcode</p>
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
        </div>

        <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {/* Targeting frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-36 rounded-lg" style={{
              border: '2px solid rgba(255,255,255,0.7)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
            }} />
          </div>
        </div>

        <div className="px-4 py-3 text-center min-h-[48px] flex items-center justify-center">
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground">Starting camera…</p>
          )}
          {status === 'scanning' && (
            <p className="text-sm text-muted-foreground">Point camera at barcode</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  )
}
